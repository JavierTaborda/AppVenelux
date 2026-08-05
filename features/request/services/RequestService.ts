import api from '@/lib/axios';
import axios from 'axios';
import type {
  PaginatedMaterialsResult,
  Request,
  RequestStatus,
  VeneluxMaterial,
} from '../types/request';

type Listener = (requests: Request[]) => void;

let requestCache: Request[] = [];
const listeners: Listener[] = [];

const notify = () => {
  const snapshot = [...requestCache];
  listeners.forEach((cb) => cb(snapshot));
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
};

const normalizeMaterial = (
  it: Partial<VeneluxMaterial> & { description?: string }
): VeneluxMaterial => ({
  codigo: it.codigo ?? '',
  material: it.material ?? it.description ?? '',
  coduni: it.coduni ?? null,
  nroparte: it.nroparte ?? it.noparte ?? null,
  codbarra: it.codbarra ?? null,
  unidad: it.unidad ?? null,
  linea: it.linea ?? null,
  sublinea: it.sublinea ?? null,
  categoria: it.categoria ?? null,
  precio: toNumberOrNull(it.precio),
  codart: toNumberOrNull(it.codart),
  marca: it.marca ?? null,
  noparte: it.noparte ?? it.nroparte ?? null,
  imagen1: it.imagen1 ?? null,
  imagen2: it.imagen2 ?? null,
  imagen3: it.imagen3 ?? null,
});

type MaterialsResponseItem = Partial<VeneluxMaterial> & { description?: string };

type MaterialsRawPayload = {
  data?: unknown;
  total?: unknown;
  page?: unknown;
  lastPage?: unknown;
};

const toPositiveIntOrFallback = (value: unknown, fallback: number): number => {
  const parsed = toNumberOrNull(value);
  if (parsed === null) return fallback;
  const rounded = Math.trunc(parsed);
  return rounded > 0 ? rounded : fallback;
};

const parseMaterialsResponse = (raw: unknown): PaginatedMaterialsResult => {
  if (Array.isArray(raw)) {
    const items = raw.map((it) => normalizeMaterial(it as MaterialsResponseItem));
    return {
      data: items,
      total: items.length,
      page: 1,
      lastPage: 1,
      hasMore: false,
    };
  }

  if (raw && typeof raw === 'object') {
    const payload = raw as MaterialsRawPayload;
    const list = Array.isArray(payload.data) ? payload.data : [];
    const data = list.map((it) => normalizeMaterial(it as MaterialsResponseItem));
    const total = toPositiveIntOrFallback(payload.total, data.length);
    const page = toPositiveIntOrFallback(payload.page, 1);
    const lastPage = toPositiveIntOrFallback(payload.lastPage, 1);

    return {
      data,
      total,
      page,
      lastPage,
      hasMore: page < lastPage,
    };
  }

  return {
    data: [],
    total: 0,
    page: 1,
    lastPage: 1,
    hasMore: false,
  };
};


export const RequestService = {
  async fetchRequests(): Promise<Request[]> {
    try {
      const response = await api.get('requests');
      const items: Request[] = response.data;
      requestCache = items;
      notify();
      return items;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Requests endpoint is optional in some environments.
        requestCache = [];
        notify();
        return [];
      }
      throw error;
    }
  },

  async getMaterialsPage(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PaginatedMaterialsResult> {
    try {
      const response = await api.get('venelux/materials', {
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 50,
          search: params?.search,
        },
      });
      return parseMaterialsResponse(response.data as unknown);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn('[RequestService.getMaterialsPage] Endpoint not found:', error.config?.url);
        return { data: [], total: 0, page: 1, lastPage: 1, hasMore: false };
      }
      throw error;
    }
  },

  async getMaterialsAll(): Promise<VeneluxMaterial[]> {
    try {
      const response = await api.get('/venelux/materials/all');
      const parsed = parseMaterialsResponse(response.data as unknown);
      return parsed.data;
    } catch (error) {
      // if (axios.isAxiosError(error) && error.response?.status === 404) {
      //   console.warn('[RequestService.getMaterialsAll] Endpoint not found, trying fallback:', error.config?.url);
      //   const fallback = await this.getMaterialsPage({ page: 1, pageSize: 1000 });
      //   return fallback.data;
      // }
      throw error;
    }
  },

  async getMaterials(): Promise<VeneluxMaterial[]> {
    try {
      return await this.getMaterialsAll();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn('[RequestService.getMaterials] Endpoint not found:', error.config?.url);
        return [];
      }
      throw error;
    }
  },

  // async createRequest(payload: {
  //   title: string;
  //   description?: string;
  //   items: Array<Partial<VeneluxMaterial> & { description?: string; quantity: number }>;
  // }): Promise<Request> {
  //   const requestBody = {
  //     title: payload.title,
  //     description: payload.description || '',
  //     items: (payload.items || []).map((it) => ({
  //       ...normalizeMaterial(it),
  //       quantity: it.quantity || 1,
  //     })),
  //   };
  //   console.log('[RequestService.createRequest] Sending request:', requestBody);
  //    const response = await api.post('requests', requestBody);
  //   const created = response.data as Request;
  //   requestCache = [created, ...requestCache.filter((r) => r.id !== created.id)];
  //   notify();
  //   return created;
  // },

  async updateStatus(id: string, status: RequestStatus, actor?: string): Promise<Request | null> {
    try {
      const response = await api.patch(`requests/${id}/status`, { status, actor });
      const updated = response.data as Request;
      requestCache = requestCache.map((r) => (r.id === updated.id ? updated : r));
      notify();
      return updated;
    } catch {
      const idx = requestCache.findIndex((r) => r.id === id);
      if (idx === -1) return null;

      const item = { ...requestCache[idx] };
      item.status = status;
      if (status === 'aprobado') item.approvedBy = actor ?? item.approvedBy ?? null;
      if (status === 'recibido') {
        item.receivedBy = actor ?? item.receivedBy ?? null;
        item.receivedAt = new Date().toISOString();
      }

      requestCache[idx] = item;
      notify();
      return item;
    }
  },

  async getById(id: string): Promise<Request | null> {
    try {
      const response = await api.get(`requests/${id}`);
      return (response.data as Request) ?? null;
    } catch {
      const found = requestCache.find((r) => r.id === id) || null;
      return found ? { ...found } : null;
    }
  },

  subscribe(cb: Listener) {
    listeners.push(cb);
    // send initial snapshot
    cb([...requestCache]);
    return () => {
      const i = listeners.indexOf(cb);
      if (i !== -1) listeners.splice(i, 1);
    };
  },

  // Helpers for testing / development
  seedSampleData() {
    requestCache = [];
    notify();
  },

  // async runServiceTests() {
  //   console.log('--- RequestService tests start ---');
  //   this.seedSampleData();

  //   const all = await this.fetchRequests();
  //   console.log('Initial requests:', all.map((r) => ({ id: r.id, title: r.title, status: r.status })));

  //   const created = await this.createRequest({
  //     title: 'Prueba: filtro y creación',
  //     description: 'Solicitud creada desde runServiceTests',
  //     items: [
  //       {
  //         codart: 1,
  //         marca: 'TestC∂o',
  //         noparte: 'TC-1',
  //         description: 'Descripción de prueba',
  //         imagen1: '',
  //         imagen2: '',
  //         imagen3: '',
  //         quantity: 3,
  //       },
  //     ],
  //   });
  //   console.log('Created:', { id: created.id, status: created.status });

  //   const updated = await this.updateStatus(created.id, 'aprobado', 'Usuario de prueba');
  //   console.log('Updated to aprobado:', updated ? { id: updated.id, status: updated.status, approvedBy: updated.approvedBy } : null);

  //   const fetched = await this.getById(created.id);
  //   console.log('Fetched by id:', fetched ? { id: fetched.id, status: fetched.status } : null);

  //   console.log('--- RequestService tests end ---');
  // },
};


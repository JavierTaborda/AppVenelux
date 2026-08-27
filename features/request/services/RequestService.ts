import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import type {
  CreateSolicitudPayload,
  PaginatedMaterialsResult,
  Request,
  RequestMaterialItem,
  RequestStatus,
  SolicitudHeaderPayload,
  SolicitudItemPayload,
  SolicitudMovementPayload,
  VeneluxMaterial,
  VeneluxObra,
  VeneluxUnit,
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
  it: Partial<VeneluxMaterial> & { codigo?: string; description?: string }
): VeneluxMaterial => ({
  codigomaterial: it.codigomaterial ?? it.codigo ?? '',
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
  observacion: it.observacion ?? null,
  materialnuevo: it.materialnuevo ?? false,
  autorizado: it.autorizado ?? false,
  fechaautorizado: it.fechaautorizado ?? null,
  autorizadopor: it.autorizadopor ?? null,
  cantidadautorizada: (it.cantidadautorizada ?? 0),
  cantidaddespacho: (it.cantidaddespacho ?? 0),
  cantidaddisponible: (it.cantidaddisponible ?? 0),
  almacendespacho: it.almacendespacho ?? null,
  cantidadcompra: it.cantidadcompra ?? 0,
  comprar: it.comprar ?? false,
  precioventa: toNumberOrNull(it.precioventa ?? 0),
  
});

type MaterialsResponseItem = Partial<VeneluxMaterial> & {
  codigo?: string;
  description?: string;
};

type MaterialsRawPayload = {
  data?: unknown;
  total?: unknown;
  page?: unknown;
  lastPage?: unknown;
};

type ObraApiItem = {
  codigoobra?: unknown;
  descripcionobra?: unknown;
  descripcion?: unknown;
  obra?: unknown;
  codigo?: unknown;
};

type UnitApiItem = {
  coduni?: unknown;
  desuni?: unknown;
  unidad?: unknown;
  descripcion?: unknown;
};

type SolicitudApiItem = {
  id?: unknown;
  solicitudnumero?: unknown;
  empresa?: unknown;
  codigoobra?: unknown;
  descripcionobra?: unknown;
  numerocontrol?: unknown;
  solicitanteuser?: unknown;
  solicitantecodigo?: unknown;
  title?: unknown;
  description?: unknown;
  observacion?: unknown;
  actividad?: unknown;
  direccionentrega?: unknown;
  registradopor?: unknown;
  owneruser?: unknown;
  status?: unknown;
  estatus?: unknown;
  estatusLabel?: unknown;
  horasEnEstatus?: unknown;
  diasEnEstatus?: unknown;
  anulado?: unknown;
  autorizado?: unknown;
  despachar?: unknown;
  pedido?: unknown;
  compra?: unknown;
  comprar?: unknown;
  recibido?: unknown;
  fechasolicitud?: unknown;
  fechaautorizado?: unknown;
  fechadespachar?: unknown;
  fec_emis_ped?: unknown;
  fechacomprar?: unknown;
  fec_emis_comp?: unknown;
  fechaanulado?: unknown;
  fechautilizacion?: unknown;
  createdAt?: unknown;
  details?: unknown;
  items?: unknown;
  materiales?: unknown;
};

const normalizeObraCode = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : String(value ?? '').trim();

const normalizeObraDescription = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : String(value ?? '').trim();

const parseObrasResponse = (raw: unknown): VeneluxObra[] => {
  if (!Array.isArray(raw)) return [];

  const obras = raw
    .map((item) => {
      if (typeof item === 'string') {
        const descripcion = normalizeObraDescription(item);
        if (!descripcion) return null;
        return {
          codigoobra: '',
          descripcionobra: descripcion,
        } satisfies VeneluxObra;
      }

      if (!item || typeof item !== 'object') return null;
      const obra = item as ObraApiItem;
      const codigoobra = normalizeObraCode(obra.codigoobra ?? obra.codigo);
      const descripcionobra = normalizeObraDescription(
        obra.descripcionobra ?? obra.descripcion ?? obra.obra,
      );
      if (!descripcionobra) return null;

      return {
        codigoobra,
        descripcionobra,
      } satisfies VeneluxObra;
    })
    .filter((obra): obra is VeneluxObra => obra !== null);

  const seen = new Set<string>();
  return obras.filter((obra) => {
    const uniqueKey = `${obra.codigoobra}|${obra.descripcionobra}`;
    if (seen.has(uniqueKey)) return false;
    seen.add(uniqueKey);
    return true;
  });
};

const parseUnitsResponse = (raw: unknown): VeneluxUnit[] => {
  if (!Array.isArray(raw)) return [];

  const units = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const unit = item as UnitApiItem;
      const coduni =
        typeof unit.coduni === 'string' ? unit.coduni.trim() : String(unit.coduni ?? '').trim();
      const desuniRaw = unit.desuni ?? unit.unidad ?? unit.descripcion;
      const desuni =
        typeof desuniRaw === 'string' ? desuniRaw.trim() : String(desuniRaw ?? '').trim();

      if (!coduni && !desuni) return null;

      return {
        coduni,
        desuni,
      } satisfies VeneluxUnit;
    })
    .filter((it): it is VeneluxUnit => it !== null);

  const seen = new Set<string>();
  return units.filter((unit) => {
    const key = `${unit.coduni}|${unit.desuni}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const toPositiveIntOrFallback = (value: unknown, fallback: number): number => {
  const parsed = toNumberOrNull(value);
  if (parsed === null) return fallback;
  const rounded = Math.trunc(parsed);
  return rounded > 0 ? rounded : fallback;
};

const toStringSafe = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : String(value ?? '').trim();

const toNullableString = (value: unknown): string | null => {
  const text = toStringSafe(value);
  return text ? text : null;
};

const isRequestStatus = (value: number): value is RequestStatus =>
  Number.isInteger(value) && value >= 0 && value <= 6;

const normalizeRequestStatus = (raw: SolicitudApiItem): RequestStatus => {
  const estatus = toNumberOrNull(raw.estatus ?? raw.status);
  if (estatus !== null && isRequestStatus(estatus)) return estatus;

  const anulado = toNumberOrNull(raw.anulado) === 1;
  const compra = toNumberOrNull(raw.compra) === 1;
  const comprar = toNumberOrNull(raw.comprar) === 1;
  const pedido = toNumberOrNull(raw.pedido) === 1;
  const despachar = toNumberOrNull(raw.despachar) === 1;
  const aprobado = toNumberOrNull(raw.autorizado) === 1;

  if (anulado) return 6;
  if (compra) return 5;
  if (comprar) return 4;
  if (pedido) return 3;
  if (despachar) return 2;
  if (aprobado) return 1;
  return 0;
};

const parseRequestItems = (raw: unknown): RequestMaterialItem[] => {
  if (!Array.isArray(raw)) return [];

  return raw.map((entry, index) => {
    const item = (entry ?? {}) as Partial<VeneluxMaterial> & {
      description?: string;
      descripcionmaterial?: string;
      quantity?: unknown;
      cantidad?: unknown;
      cantidadsolicitada?: unknown;
    };

    const quantityRaw =
      toNumberOrNull(item.quantity) ??
      toNumberOrNull(item.cantidad) ??
      toNumberOrNull(item.cantidadsolicitada) ??
      1;

    const quantity = Math.max(1, Math.trunc(quantityRaw));
    const normalized = normalizeMaterial(item);
    const description = toNullableString(item.description ?? item.descripcionmaterial);

    return {
      ...normalized,
      quantity,
      description: description ?? normalized.material,
      codigomaterial: normalized.codigomaterial || `ITEM-${index + 1}`,
    } satisfies RequestMaterialItem;
  });
};

const parseSingleRequest = (entry: unknown): Request | null => {
  if (!entry || typeof entry !== 'object') return null;

  const raw = entry as SolicitudApiItem;
  const solicitudnumero = toStringSafe(raw.solicitudnumero || raw.id);
  const id = solicitudnumero || `REQ-${Date.now()}`;
  const codigoobra = toNullableString(raw.codigoobra) ?? undefined;
  const descripcionobra =
    toNullableString(raw.descripcionobra) ??
    toNullableString(raw.title) ??
    undefined;

  const detailsSource = raw.details ?? raw.items ?? raw.materiales;
  const items = parseRequestItems(detailsSource);

  const title = descripcionobra
    ? `${codigoobra ? `${codigoobra} - ` : ''}${descripcionobra}`
    : `Solicitud ${id}`;
  const description =
    toNullableString(raw.observacion) ??
    toNullableString(raw.description) ??
    toNullableString(raw.actividad) ??
    undefined;

  const createdAt =
    toNullableString(raw.fechasolicitud) ??
    toNullableString(raw.createdAt) ??
    new Date().toISOString();
  const status = normalizeRequestStatus(raw);
  const estatusLabel =
    toNullableString(raw.estatusLabel) ??
    ['Por autorizar', 'Autorizada solicitud', 'Autorizado despacho', 'En despacho', 'Autorizado comprar', 'En compra', 'Anulado'][status];
  const statusDates: Record<RequestStatus, string | null> = {
    0: toNullableString(raw.fechasolicitud),
    1: toNullableString(raw.fechaautorizado),
    2: toNullableString(raw.fechadespachar),
    3: toNullableString(raw.fec_emis_ped),
    4: toNullableString(raw.fechacomprar),
    5: toNullableString(raw.fec_emis_comp),
    6: toNullableString(raw.fechaanulado),
  };

  return {
    id,
    solicitudnumero,
    empresa: toNullableString(raw.empresa) ?? undefined,
    codigoobra,
    descripcionobra,
    numerocontrol: toNullableString(raw.numerocontrol) ?? undefined,
    solicitanteuser: toNullableString(raw.solicitanteuser) ?? undefined,
    solicitantecodigo: toNullableString(raw.solicitantecodigo) ?? undefined,
    fechautilizacion: toNullableString(raw.fechautilizacion) ?? undefined,
    actividad: toNullableString(raw.actividad) ?? undefined,
    direccionentrega: toNullableString(raw.direccionentrega) ?? undefined,
    registradopor: toNullableString(raw.registradopor) ?? undefined,
    owneruser: toNullableString(raw.owneruser) ?? undefined,
    title,
    description,
    items,
    status,
    estatus: status,
    estatusLabel,
    horasEnEstatus: toNumberOrNull(raw.horasEnEstatus) ?? 0,
    diasEnEstatus: toNumberOrNull(raw.diasEnEstatus) ?? 0,
    statusDates,
    createdAt,
  };
};

const parseRequestsResponse = (raw: unknown): Request[] => {
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => parseSingleRequest(entry))
      .filter((entry): entry is Request => entry !== null);
  }

  if (raw && typeof raw === 'object') {
    const maybeArray = (raw as { data?: unknown }).data;
    if (Array.isArray(maybeArray)) {
      return maybeArray
        .map((entry) => parseSingleRequest(entry))
        .filter((entry): entry is Request => entry !== null);
    }

    const single = parseSingleRequest(raw);
    return single ? [single] : [];
  }

  return [];
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
  async createSolicitud(payload: CreateSolicitudPayload): Promise<unknown> {
    try {
      const response = await this.createSolicitudTransaction(payload);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        try {
          const fallback = await api.post('venelux/solicitudes', payload);
          return fallback.data;
        } catch (fallbackError) {
          if (
            isAxiosError(fallbackError) &&
            fallbackError.response?.status === 404
          ) {
            const legacy = await api.post('requests', payload);
            return legacy.data;
          }
          throw fallbackError;
        }
      }
      throw error;
    }
  },

  async getUnits(): Promise<VeneluxUnit[]> {
    try {
      const response = await api.get('venelux/units');
      return parseUnitsResponse(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async createHeader(payload: SolicitudHeaderPayload): Promise<unknown> {
    const response = await api.post('venelux/solicitudes/header', payload);
    return response.data;
  },

  async createDetail(payload: SolicitudItemPayload): Promise<unknown> {
    const response = await api.post('venelux/solicitudes/detail', payload);
    return response.data;
  },

  async createMovement(payload: SolicitudMovementPayload): Promise<unknown> {
    const response = await api.post('venelux/solicitudes/movement', payload);
    return response.data;
  },

  async createSolicitudTransaction(payload: CreateSolicitudPayload) {
    const transactionPayload: {
      header: CreateSolicitudPayload['solicitud'];
      details: CreateSolicitudPayload['items'];
      movements?: CreateSolicitudPayload['movements'];
    } = {
      header: payload.solicitud,
      details: payload.items,
    };

    if (payload.movements?.length) {
      transactionPayload.movements = payload.movements;
    }

    return api.post('venelux/solicitudes/transaction', transactionPayload);
  },

  async fetchRequests(): Promise<Request[]> {
    try {
      const response = await api.get('venelux/solicitudes');
      const items = parseRequestsResponse(response.data);
      requestCache = items;
      notify();
      return items;
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }

    try {
      const response = await api.get('requests');
      const items = parseRequestsResponse(response.data);
      requestCache = items;
      notify();
      return items;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
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
      if (isAxiosError(error) && error.response?.status === 404) {
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
      // if (isAxiosError(error) && error.response?.status === 404) {
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
      if (isAxiosError(error) && error.response?.status === 404) {
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
      item.estatus = status;
      if (status === 1) item.approvedBy = actor ?? item.approvedBy ?? null;
      if (status === 3) {
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
      const response = await api.get(`venelux/solicitudes/${id}`);
      const parsed = parseRequestsResponse(response.data);
      if (parsed.length > 0) return parsed[0];
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }

    try {
      const response = await api.get(`requests/${id}`);
      const parsed = parseRequestsResponse(response.data);
      return parsed[0] ?? null;
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

  async getObras(): Promise<VeneluxObra[]> {
    try {
      const response = await api.get('venelux/obras');
      return parseObrasResponse(response.data);

    
    } catch (error) {
      console.error('[RequestService.getObras] Error fetching obras:', error);
      return [];
    }
  },
};


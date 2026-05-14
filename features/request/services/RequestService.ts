import type { Request, RequestItem, RequestStatus } from '../types/request';

type Listener = (requests: Request[]) => void;

const listeners: Listener[] = [];

const sampleRequests: Request[] = [
  {
    id: 'req_001',
    title: 'Repuesto: bomba hidráulica',
    description: 'Bomba para máquina prensa, uso urgente',
    items: [
      {
        codart: 'BOM-1001',
        marca: 'HydroMax',
        noparte: 'HM-200',
     
        description: 'Bomba para sistema de prensa modelo X',
        imagen1: 'https://http2.mlstatic.com/D_NQ_NP_770452-MLV80589415179_112024-O.webp',
        imagen2: 'https://bezares.com/wp-content/uploads/2017/07/5033106-e1551815968423.jpg',
        imagen3: '',
        quantity: 1,
      },
    ],
    status: 'pendiente',
    createdAt: '2026-05-14T09:15:00.000Z',
  },
  {
    id: 'req_002',
    title: 'Consumibles: tornillos y tuercas',
    description: 'Reposición stock caja de mantenimiento',
    items: [
      {
        codart: 'TRX-500',
        marca: 'FixIt',
        noparte: 'F-TRX-500',
      
        description: 'Tornillo cabeza hexagonal',
        imagen1: 'https://http2.mlstatic.com/D_NQ_NP_629112-MLV82473281615_022025-O.webp',
        imagen2: '',
        imagen3: '',
        quantity: 200,
      },
      {
        codart: 'NUT-200',
        marca: 'FixIt',
        noparte: 'F-NUT-200',

        description: 'Tuerca autoblocante',
        imagen1: 'https://cdn.millasur.com/sites/default/files/products/recambios/CC461T-054/TUERCA-AUTOBLOCANTE-M8%20%5B3963%5D.jpg',
        imagen2: '',
        imagen3: '',
        quantity: 200,
      },
    ],
    status: 'aprobado',
    createdAt: '2026-05-12T08:30:00.000Z',
    approvedBy: 'Jefe de Taller',
  },
  {
    id: 'req_003',
    title: 'Equipo de seguridad: gafas y guantes',
    description: 'Pedido para nuevo personal de planta',
    items: [
      {
        codart: 'GLV-01',
        marca: 'SafeWear',
        noparte: 'SW-GLV-01',
       
        description: 'Paquete 50 unidades',
        imagen1: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHO4t1Czy6T6SJxx-l77hcOc6e5RP1KNxoQ&s',
        imagen2: '',
        imagen3: '',
        quantity: 2,
      },
      {
        codart: 'GLS-10',
        marca: 'EyeSafe',
        noparte: 'ES-GLS-10',
       
        description: 'Gafas antiimpacto',
        imagen1: 'https://rubikassembly.com/wp-content/uploads/2022/10/L2-1.jpg',
        imagen2: '',
        imagen3: '',
        quantity: 10,
      },
    ],
    status: 'comprado',
    createdAt: '2026-05-11T14:05:00.000Z',
    approvedBy: 'Coordinador de Compras',
  },
  {
    id: 'req_004',
    title: 'Motor eléctrico 3kW',
    description: 'Reemplazo máquina cortadora línea 2',
    items: [
      {
        codart: 'MTR-3KW',
        marca: 'ElectroPro',
        noparte: 'EP-3K-202',

        description: 'Motor trifásico 380V',
        imagen1: 'https://image.jimcdn.com/app/cms/image/transf/none/path/s155e64ebf7c1354f/image/i159db7ddfd7cb497/version/1547666821/image.jpg',
        imagen2: '',
        imagen3: '',
        quantity: 1,
      },
    ],
    status: 'recibido',
    createdAt: '2026-05-09T10:00:00.000Z',
    approvedBy: 'Ingeniero Jefe',
    receivedBy: 'Almacén Central',
    receivedAt: '2026-05-13T16:20:00.000Z',
  },
];

let STORE: Request[] = [...sampleRequests];

const notify = () => {
  const snapshot = [...STORE];
  listeners.forEach((cb) => cb(snapshot));
};

const generateId = (prefix = 'req') => `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 900 + 100)}`;

export const RequestService = {
  async fetchRequests(): Promise<Request[]> {
    return [...STORE].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createRequest(payload: {
    title: string;
    description?: string;
    items: Array<Partial<RequestItem> & {  quantity: number }>;
  }): Promise<Request> {
    const newRequest: Request = {
      id: generateId(),
      title: payload.title,
      description: payload.description || '',
      items: (payload.items || []).map((it) => ({
        codart: it.codart || '',
        marca: it.marca || '',
        noparte: it.noparte || '',
        description: it.description || '',
        imagen1: it.imagen1 || '',
        imagen2: it.imagen2 || '',
        imagen3: it.imagen3 || '',
        quantity: it.quantity || 1,
      })),
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    STORE.unshift(newRequest);
    notify();
    return newRequest;
  },

  async updateStatus(id: string, status: RequestStatus, actor?: string): Promise<Request | null> {
    const idx = STORE.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const item = { ...STORE[idx] };
    item.status = status;
    if (status === 'aprobado') item.approvedBy = actor ?? item.approvedBy ?? null;
    if (status === 'recibido') {
      item.receivedBy = actor ?? item.receivedBy ?? null;
      item.receivedAt = new Date().toISOString();
    }

    STORE[idx] = item;
    notify();
    return item;
  },

  async getById(id: string): Promise<Request | null> {
    const found = STORE.find((r) => r.id === id) || null;
    return found ? { ...found } : null;
  },

  subscribe(cb: Listener) {
    listeners.push(cb);
    // send initial snapshot
    cb([...STORE]);
    return () => {
      const i = listeners.indexOf(cb);
      if (i !== -1) listeners.splice(i, 1);
    };
  },

  // Helpers for testing / development
  seedSampleData() {
    STORE = [...sampleRequests];
    notify();
  },

  async runServiceTests() {
    console.log('--- RequestService tests start ---');
    this.seedSampleData();

    const all = await this.fetchRequests();
    console.log('Initial requests:', all.map((r) => ({ id: r.id, title: r.title, status: r.status })));

    const created = await this.createRequest({
      title: 'Prueba: filtro y creación',
      description: 'Solicitud creada desde runServiceTests',
      items: [
        {
          codart: 'TST-1',
          marca: 'TestC∂o',
          noparte: 'TC-1',
          description: 'Descripción de prueba',
          imagen1: '',
          imagen2: '',
          imagen3: '',
          quantity: 3,
        },
      ],
    });
    console.log('Created:', { id: created.id, status: created.status });

    const updated = await this.updateStatus(created.id, 'aprobado', 'Usuario de prueba');
    console.log('Updated to aprobado:', updated ? { id: updated.id, status: updated.status, approvedBy: updated.approvedBy } : null);

    const fetched = await this.getById(created.id);
    console.log('Fetched by id:', fetched ? { id: fetched.id, status: fetched.status } : null);

    console.log('--- RequestService tests end ---');
  },
};


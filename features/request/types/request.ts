export type RequestStatus =
  | 'pendiente'
  | 'aprobado'
  | 'comprado'
  | 'recibido'
  | 'rechazado';

export interface VeneluxMaterial {
  codigo: string;
  material: string;
  coduni: string | null;
  nroparte: string | null;
  codbarra: string | null;
  unidad: string | null;
  linea: string | null;
  sublinea: string | null;
  categoria: string | null;
  precio: number | null;
  codart: number | null;
  marca: string | null;
  noparte: string | null;
  imagen1: string | null;
  imagen2: string | null;
  imagen3: string | null;

}

export interface PaginatedMaterialsResult {
  data: VeneluxMaterial[];
  total: number;
  page: number;
  lastPage: number;
  hasMore: boolean;
}


export interface Request {
  id: string;
  title: string;
  description?: string;
  items: VeneluxMaterial[];
  status: RequestStatus;
  createdAt: string;
  approvedBy?: string | null;
  receivedBy?: string | null;
  receivedAt?: string | null;
}

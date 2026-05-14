export type RequestStatus =
  | 'pendiente'
  | 'aprobado'
  | 'comprado'
  | 'recibido'
  | 'rechazado';

export interface RequestItem {
  codart: string;
  marca: string;
  noparte: string;
    description: string;
  imagen1: string;
  imagen2: string;
  imagen3: string;
  quantity: number;
}

export interface Request {
  id: string;
  title: string;
  description?: string;
  items: RequestItem[];
  status: RequestStatus;
  createdAt: string;
  approvedBy?: string | null;
  receivedBy?: string | null;
  receivedAt?: string | null;
}

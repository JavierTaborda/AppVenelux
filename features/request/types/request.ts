export type RequestStatus =
  | 'pendiente'
  | 'aprobado'
  | 'comprado'
  | 'recibido'
  | 'rechazado';

export interface VeneluxMaterial {
  codigomaterial: string;
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

export interface RequestMaterialItem extends VeneluxMaterial {
  quantity: number;
  description?: string;
}

export interface Request {
  id: string;
  title: string;
  description?: string;
  items: RequestMaterialItem[];
  status: RequestStatus;
  createdAt: string;
  solicitudnumero?: string;
  codigoobra?: string;
  descripcionobra?: string;
  approvedBy?: string | null;
  receivedBy?: string | null;
  receivedAt?: string | null;
}

export interface VeneluxObra {
  codigoobra: string;
  descripcionobra: string;
}

export interface VeneluxUnit {
  coduni: string;
  desuni: string;
}

export interface SolicitudHeaderPayload {
  solicitudnumero: number;
  empresa: string;
  codigoobra: string;
  descripcionobra: string;
  numerocontrol: number;
  solicitanteuser: string;
  solicitantecodigo: string;
  fechasolicitud: string;
  fechautilizacion: string;
  observacion: string | null;
  actividad: string | null;
  direccionentrega: string | null;
  registradopor: string;
  autorizado: 0 | 1;
  fechaautorizado: string | null;
  autorizadopor: string | null;
  anulado: 0 | 1;
  motivoanulado: string | null;
  fechaanulado: string | null;
  anuladopor: string | null;
  despachar: 0 | 1;
  fechadespachar: string | null;
  despacharpor: string | null;
  comentadespachar: string | null;
  pedido: 0 | 1;
  ped_num: string | null;
  fec_emis_ped: string | null;
  co_us_ped: string | null;
  comprar: 0 | 1;
  fechacomprar: string | null;
  comprarpor: string | null;
  comentacomprar: string | null;
  compra: 0 | 1;
  comp_num: string | null;
  fec_emis_comp: string | null;
  co_us_comp: string | null;
  owneruser: number | null;
}

export interface SolicitudItemPayload {
  solicitudnumero: number;
  itemnumero: number;
  codigomaterial: string;
  descripcionmaterial: string;
  coduni: string;
  unidadmedida: string;
  linea: string | null;
  sublinea: string | null;
  categoria: string | null;
  cantidadsolicitada: number;
  observacion: string | null;
  materialnuevo: 0 | 1;
  autorizado: 0 | 1;
  fechaautorizado: string | null;
  autorizadopor: string | null;
  cantidadautorizada: number;
  cantidaddespacho: number;
  cantidaddisponible: number;
  almacendespacho: string | null;
  cantidadcompra: number;
  comprar: 0 | 1;
  precioventa: number;
}

export interface SolicitudMovementPayload {
  solicitudnumero: number;
  itemnumero: number;
  codart: string;
  coduni: string;
  codalma: string;
  desalma: string;
  stock: number;
  prioridad: number;
  almacen: string;
  cantidad: number;
  traslado: string;
  tras_num: string;
  costo: number;
  fechacosto: string;
}

export interface CreateSolicitudPayload {
  solicitud: SolicitudHeaderPayload;
  items: SolicitudItemPayload[];
  movements?: SolicitudMovementPayload[];
}

export type VeneluxSolicitudStatusCode = 0 | 1 | 3;

export interface VeneluxSolicitudStatusItem {
  estatus: VeneluxSolicitudStatusCode;
  total: number;
}

export interface VeneluxSolicitudStatusResponse {
  data: VeneluxSolicitudStatusItem[];
  total: number;
}

export interface VeneluxSolicitudStatusChartItem {
  estatus: VeneluxSolicitudStatusCode;
  label: string;
  value: number;
  color: string;
}
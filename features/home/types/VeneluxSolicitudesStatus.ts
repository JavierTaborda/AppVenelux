export type VeneluxSolicitudStatusCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface VeneluxSolicitudStatusItem {
  estatus: VeneluxSolicitudStatusCode;
  label: string;
  total: number;
  promedioHorasEnEstatus: number;
  promedioDiasEnEstatus: number;
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
  averageHours: number;
  averageDays: number;
}
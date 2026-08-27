import { appTheme } from "@/utils/appTheme";
import type {
    VeneluxSolicitudStatusChartItem,
    VeneluxSolicitudStatusCode,
    VeneluxSolicitudStatusItem,
} from "../types/VeneluxSolicitudesStatus";

const STATUS_LABELS: Record<VeneluxSolicitudStatusCode, string> = {
  0: "Por autorizar",
  1: "Autorizada solicitud",
  2: "Autorizado despacho",
  3: "En despacho",
  4: "Autorizado comprar",
  5: "En compra",
  6: "Anulado",
};

const STATUS_COLORS: Record<VeneluxSolicitudStatusCode, string> = {
  0: appTheme.primary.DEFAULT,
  1: appTheme.secondary.DEFAULT,
  2: appTheme.tertiary.DEFAULT,
  3: appTheme.success,
  4: appTheme.warning,
  5: appTheme.accent.DEFAULT,
  6: appTheme.error,
};

const STATUS_ORDER: VeneluxSolicitudStatusCode[] = [0, 1, 2, 3, 4, 5, 6];

const isKnownStatus = (value: number): value is VeneluxSolicitudStatusCode =>
  STATUS_ORDER.includes(value as VeneluxSolicitudStatusCode);

export function mapSolicitudesStatusToChart(
  data: VeneluxSolicitudStatusItem[]
): VeneluxSolicitudStatusChartItem[] {
  const totalsByStatus = new Map<
    VeneluxSolicitudStatusCode,
    VeneluxSolicitudStatusItem
  >();

  data.forEach((item) => {
    if (isKnownStatus(item.estatus)) {
      totalsByStatus.set(item.estatus, item);
    }
  });

  return STATUS_ORDER.map((estatus) => {
    const item = totalsByStatus.get(estatus);

    return {
      estatus,
      label: item?.label || STATUS_LABELS[estatus],
      value: Number(item?.total) || 0,
      color: STATUS_COLORS[estatus],
      averageHours: Number(item?.promedioHorasEnEstatus) || 0,
      averageDays: Number(item?.promedioDiasEnEstatus) || 0,
    };
  });
}
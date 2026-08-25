import { appTheme } from "@/utils/appTheme";
import type {
    VeneluxSolicitudStatusChartItem,
    VeneluxSolicitudStatusCode,
    VeneluxSolicitudStatusItem,
} from "../types/VeneluxSolicitudesStatus";

const STATUS_LABELS: Record<VeneluxSolicitudStatusCode, string> = {
  0: "Pendiente",
  1: "Revisado",
  3: "Anulado",
};

const STATUS_COLORS: Record<VeneluxSolicitudStatusCode, string> = {
  0: appTheme.primary.DEFAULT,
  1: appTheme.secondary.DEFAULT,
  3: appTheme.tertiary.DEFAULT,
};

const STATUS_ORDER: VeneluxSolicitudStatusCode[] = [0, 1, 3];

export function mapSolicitudesStatusToChart(
  data: VeneluxSolicitudStatusItem[]
): VeneluxSolicitudStatusChartItem[] {
  const totalsByStatus = new Map<VeneluxSolicitudStatusCode, number>();

  data.forEach((item) => {
    totalsByStatus.set(item.estatus, Number(item.total) || 0);
  });

  return STATUS_ORDER.map((estatus) => ({
    estatus,
    label: STATUS_LABELS[estatus],
    value: totalsByStatus.get(estatus) ?? 0,
    color: STATUS_COLORS[estatus],
  }));
}
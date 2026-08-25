import api from "@/lib/axios";
import type { VeneluxSolicitudStatusResponse } from "../types/VeneluxSolicitudesStatus";

export async function getVeneluxSolicitudesStatus(): Promise<VeneluxSolicitudStatusResponse> {
  const response = await api.get<VeneluxSolicitudStatusResponse>(
    "venelux/solicitudes/status"
  );

  return response.data;
}
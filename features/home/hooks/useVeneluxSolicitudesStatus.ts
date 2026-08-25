import { useCallback, useEffect, useState } from "react";
import { getVeneluxSolicitudesStatus } from "../services/VeneluxSolicitudesStatusService";
import type { VeneluxSolicitudStatusChartItem } from "../types/VeneluxSolicitudesStatus";
import { mapSolicitudesStatusToChart } from "../utils/statusChart";

type SolicitudesStatusDashboardData = {
  total: number;
  chartData: VeneluxSolicitudStatusChartItem[];
};

export function useVeneluxSolicitudesStatus() {
  const [data, setData] = useState<SolicitudesStatusDashboardData>({
    total: 0,
    chartData: mapSolicitudesStatusToChart([]),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildDashboardData = useCallback((result: Awaited<ReturnType<typeof getVeneluxSolicitudesStatus>>) => ({
    total: Number(result.total) || 0,
    chartData: mapSolicitudesStatusToChart(result.data ?? []),
  }), []);

  const getData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await getVeneluxSolicitudesStatus();
      setData(buildDashboardData(result));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el resumen de solicitudes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildDashboardData]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const result = await getVeneluxSolicitudesStatus();

        if (!isMounted) return;

        setData(buildDashboardData(result));
      } catch (err) {
        console.error(err);

        if (!isMounted) return;

        setError("No se pudo cargar el resumen de solicitudes.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [buildDashboardData]);

  const refreshData = useCallback(() => {
    getData(true);
  }, [getData]);

  return {
    ...data,
    loading,
    refreshing,
    error,
    getData,
    refreshData,
  };
}
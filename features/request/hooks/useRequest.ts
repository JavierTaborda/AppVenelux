import { useCallback, useEffect, useState } from 'react';
import { RequestService } from '../services/RequestService';
import type {
  CreateSolicitudPayload,
  Request,
  RequestStatus,
  VeneluxMaterial,
  VeneluxObra,
  VeneluxUnit,
} from '../types/request';

type UseRequestOptions = {
  autoFetchMaterials?: boolean;
  autoFetchRequests?: boolean;
};

export function useRequest({
  autoFetchMaterials = true,
  autoFetchRequests = true,
}: UseRequestOptions = {}) {
  const [materials, setMaterials] = useState<VeneluxMaterial[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsLastPage, setMaterialsLastPage] = useState(1);
  const [loadingMoreMaterials, setLoadingMoreMaterials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const allMaterials = await RequestService.getMaterialsAll();
      setMaterials(allMaterials);
      setTotalMaterials(allMaterials.length);
      setMaterialsPage(1);
      setMaterialsLastPage(1);
      //  console.log('Fetched materials page:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar materiales';
      setError(message);
      console.warn('[useRequest.fetchMaterials]', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetchMaterials) return;
    void fetchMaterials();
  }, [autoFetchMaterials, fetchMaterials]);

  // const loadMoreMaterials = useCallback(async () => {
  //   if (loading || loadingMoreMaterials || materialsPage >= materialsLastPage) return;

  //   setLoadingMoreMaterials(true);
  //   try {
  //     setError(null);
  //     const nextPage = materialsPage + 1;
  //     const result = await RequestService.getMaterialsPage({ page: nextPage, pageSize: 50 });
  //     setMaterials((prev) => [...prev, ...result.data]);
  //     setTotalMaterials(result.total);
  //     setMaterialsPage(result.page);
  //     setMaterialsLastPage(result.lastPage);
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : 'No se pudo cargar mas materiales';
  //     setError(message);
  //     console.warn('[useRequest.loadMoreMaterials]', message);
  //   } finally {
  //     setLoadingMoreMaterials(false);
  //   }
  // }, [loading, loadingMoreMaterials, materialsPage, materialsLastPage]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await RequestService.fetchRequests();
      setRequests(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar solicitudes';
      setError(message);
      console.warn('[useRequest.fetchRequests]', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = RequestService.subscribe((data) => setRequests(data));
    if (autoFetchRequests) {
      // ensure initial load (in case service fetches from remote later)
      void fetchRequests();
    }
    return unsub;
  }, [autoFetchRequests, fetchRequests]);

  // const createRequest = useCallback(
  //   async (payload: CreateRequestPayload) => {
  //     const created = await RequestService.createRequest(payload);
  //     return created;
  //   },
  //   []
  // );
  const createSolicitud = useCallback(async (payload: CreateSolicitudPayload) => {
    setLoading(true);
    try {
      setError(null);
      const created = await RequestService.createSolicitud(payload);

      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la solicitud';
      setError(message);
      console.warn('[useRequest.createSolicitud]', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getObras = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const obras = await RequestService.getObras();
      return obras;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar obras';
      setError(message);
      console.warn('[useRequest.getObras]', message);
      return [] as VeneluxObra[];
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnits = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const units = await RequestService.getUnits();
      return units;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar unidades';
      setError(message);
      console.warn('[useRequest.getUnits]', message);
      return [] as VeneluxUnit[];
    } finally {
      setLoading(false);
    }
  }, []);
  const updateStatus = useCallback(async (id: string, status: RequestStatus, actor?: string) => {
    const updated = await RequestService.updateStatus(id, status, actor);
    return updated;
  }, []);

  const hasMoreMaterials = materialsPage < materialsLastPage;

  return {
    requests,
    loading,
    materials,
    totalMaterials,
    hasMoreMaterials,
    loadingMoreMaterials,
    error,
    fetchMaterials,
    //1loadMoreMaterials,
    fetchRequests,
    updateStatus,
    createSolicitud,
    searchText,
    setSearchText,
    getObras,
    getUnits,
  } as const;
}

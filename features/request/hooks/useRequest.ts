import { useCallback, useEffect, useState } from 'react';
import { RequestService } from '../services/RequestService';
import type { Request, RequestStatus, VeneluxMaterial } from '../types/request';

type CreateRequestPayload = {
  title: string;
  description?: string;
  items: Array<Partial<VeneluxMaterial> & { quantity: number }>;
};

export function useRequest() {
  const [materials, setMaterials] = useState<VeneluxMaterial[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsLastPage, setMaterialsLastPage] = useState(1);
  const [loadingMoreMaterials, setLoadingMoreMaterials] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useRequest hook mounted, fetching materials and requests');
    void fetchMaterials();
  }, []);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const result = await RequestService.getMaterialsPage({ page: 1, pageSize: 50 });
      setMaterials(result.data);
      setTotalMaterials(result.total);
      setMaterialsPage(result.page);
      setMaterialsLastPage(result.lastPage);
    //  console.log('Fetched materials page:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar materiales';
      setError(message);
      console.warn('[useRequest.fetchMaterials]', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreMaterials = useCallback(async () => {
    if (loading || loadingMoreMaterials || materialsPage >= materialsLastPage) return;

    setLoadingMoreMaterials(true);
    try {
      setError(null);
      const nextPage = materialsPage + 1;
      const result = await RequestService.getMaterialsPage({ page: nextPage, pageSize: 50 });
      setMaterials((prev) => [...prev, ...result.data]);
      setTotalMaterials(result.total);
      setMaterialsPage(result.page);
      setMaterialsLastPage(result.lastPage);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar mas materiales';
      setError(message);
      console.warn('[useRequest.loadMoreMaterials]', message);
    } finally {
      setLoadingMoreMaterials(false);
    }
  }, [loading, loadingMoreMaterials, materialsPage, materialsLastPage]);

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
    // ensure initial load (in case service fetches from remote later)
    void fetchRequests();
    return unsub;
  }, [fetchRequests]);

  // const createRequest = useCallback(
  //   async (payload: CreateRequestPayload) => {
  //     const created = await RequestService.createRequest(payload);
  //     return created;
  //   },
  //   []
  // );

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
    loadMoreMaterials,
    fetchRequests,
    updateStatus,
  } as const;
}

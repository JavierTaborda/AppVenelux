import { useCallback, useEffect, useState } from 'react';
import { RequestService } from '../services/RequestService';
import type { Request } from '../types/request';

export function useRequest() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await RequestService.fetchRequests();
      setRequests(data);
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

  const createRequest = useCallback(
    async (payload: { title: string; description?: string; items: { quantity: number }[] }) => {
      const created = await RequestService.createRequest(payload);
      return created;
    },
    []
  );

  const updateStatus = useCallback(async (id: string, status: any, actor?: string) => {
    const updated = await RequestService.updateStatus(id, status, actor);
    return updated;
  }, []);

  return { requests, loading, fetchRequests, createRequest, updateStatus } as const;
}

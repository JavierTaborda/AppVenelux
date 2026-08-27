import type { RequestStatus } from '../types/request';

export const STATUS_LABELS: Record<RequestStatus, string> = {
	0: 'Por autorizar',
	1: 'Autorizada solicitud',
	2: 'Autorizado despacho',
	3: 'En despacho',
	4: 'Autorizado comprar',
	5: 'En compra',
	6: 'Anulado',
};

export const STATUSES: RequestStatus[] = [0, 1, 2, 3, 4, 5, 6];

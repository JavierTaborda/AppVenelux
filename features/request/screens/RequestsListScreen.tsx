import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import CustomImagen from "@/components/ui/CustomImagen";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import StatusBadge from "../components/StatusBadge";
import { useRequest } from "../hooks/useRequest";
import type {
  Request,
  RequestMaterialItem,
  RequestStatus,
} from "../types/request";
import { STATUSES, STATUS_LABELS } from "../utils/statuses";

const REQUEST_SKELETON_ITEMS = Array.from(
  { length: 6 },
  (_, index) => `request-skeleton-${index}`,
);

type RequestListItem =
  | { type: "skeleton"; id: string }
  | { type: "request"; request: Request };

type RequestModalItem =
  | { type: "summary"; request: Request }
  | { type: "empty"; id: string }
  | { type: "material"; material: RequestMaterialItem; index: number };

const STATUS_DATE_ITEMS: { status: RequestStatus; label: string }[] = [
  { status: 0, label: "Solicitud" },
  { status: 1, label: "Autorizada solicitud" },
  { status: 2, label: "Autorizado despacho" },
  { status: 3, label: "En despacho" },
  { status: 4, label: "Autorizado comprar" },
  { status: 5, label: "En compra" },
  { status: 6, label: "Anulado" },
];

function MetricPill({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-background dark:bg-dark-background px-3 py-2">
      <Text className="text-[11px] font-semibold text-mutedForeground dark:text-dark-mutedForeground">
        {label}
      </Text>
      <Text
        className={`mt-0.5 text-sm font-extrabold ${danger ? "text-red-500 dark:text-red-400" : "text-foreground dark:text-dark-foreground"}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function RequestSkeletonCard() {
  return (
    <View className="mb-3 rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="h-3 w-28 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <View className="h-5 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-3 animate-pulse" />
          <View className="h-4 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-2 animate-pulse" />
        </View>
        <View className="h-7 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <View>
          <View className="h-3 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <View className="h-5 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-2 animate-pulse" />
        </View>
        <View>
          <View className="h-3 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <View className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-2 animate-pulse" />
        </View>
        <View className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      </View>
    </View>
  );
}

function RequestEmptyState() {
  return (
    <View className="mt-3 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 items-center bg-componentbg dark:bg-dark-componentbg">
      <Ionicons name="bag-handle-outline" size={34} color="#9CA3AF" />
      <Text className="mt-2 text-base font-semibold text-foreground dark:text-dark-foreground">
        No hay solicitudes
      </Text>
      <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground text-center mt-1">
        Ajusta los filtros o realiza una solicitud nueva.
      </Text>
    </View>
  );
}

function MaterialEmptyState() {
  return (
    <View className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 items-center bg-componentbg dark:bg-dark-componentbg">
      <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
      <Text className="mt-2 text-sm text-mutedForeground dark:text-dark-mutedForeground text-center">
        Esta solicitud no trae detalle de materiales.
      </Text>
    </View>
  );
}

export default function RequestsListScreen() {
  const { requests, loading, fetchRequests } = useRequest();
  const [filter, setFilter] = useState<RequestStatus | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showStatusTracking, setShowStatusTracking] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const showInitialSkeleton = loading && requests.length === 0;

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    return requests.filter((item) => {
      if (filter !== null && item.status !== filter) return false;
      if (!term) return true;

      const haystack = [
        item.title,
        item.description,
        item.solicitudnumero,
        item.codigoobra,
        item.descripcionobra,
        item.estatusLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [filter, requests, searchText]);

  const totalItems = useMemo(
    () => filtered.reduce((acc, request) => acc + request.materiales.length, 0),
    [filtered],
  );

  const listData = useMemo<RequestListItem[]>(() => {
    if (showInitialSkeleton) {
      return REQUEST_SKELETON_ITEMS.map((id) => ({ type: "skeleton", id }));
    }

    return filtered.map((request) => ({ type: "request", request }));
  }, [filtered, showInitialSkeleton]);

  const modalData = useMemo<RequestModalItem[]>(() => {
    if (!selectedRequest) return [];

    const materialItems = selectedRequest.items.map((material, index) => ({
      type: "material" as const,
      material,
      index,
    }));

    return [
      { type: "summary", request: selectedRequest },
      ...(materialItems.length > 0
        ? materialItems
        : [{ type: "empty" as const, id: "empty-materials" }]),
    ];
  }, [selectedRequest]);

  const statusCount = useMemo(
    () =>
      STATUSES.reduce(
        (acc, status) => {
          acc[status] = requests.filter((r) => r.status === status).length;
          return acc;
        },
        {} as Record<(typeof STATUSES)[number], number>,
      ),
    [requests],
  );

  const formatDate = (isoDate: string) => {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return "Sin fecha";
    return parsed.toLocaleDateString();
  };

  const formatOptionalDate = (isoDate?: string | null) => {
    if (!isoDate) return "No realizado";
    return formatDate(isoDate);
  };

  const formatStatusFlag = (value?: number | null) =>
    value === 1 ? "Sí" : value === 0 ? "No" : "No indicado";

  const renderMaterialKey = (item: Request["items"][number], index: number) => {
    const code = item.codigomaterial?.trim() || "SIN";
    const codart = item.codart != null ? String(item.codart) : "sin-codart";
    return `${code}-${codart}-${index}`;
  };

  const formatMoney = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return null;
    return value.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderRequestItem = ({ item }: { item: RequestListItem }) => {
    if (item.type === "skeleton") return <RequestSkeletonCard />;

    const request = item.request;

    return (
      <Pressable
        onPress={() => setSelectedRequest(request)}
        className="mb-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-3.5"
      >
        <View className="flex-row items-start justify-between gap-2.5">
          <View className="flex-1">
            <Text className="text-xs font-bold tracking-[1px] text-primary dark:text-dark-primary uppercase">
              {request.solicitudnumero
                ? `Solicitud ${request.solicitudnumero}`
                : `Solicitud ${request.id}`}
            </Text>
            <Text
              className="text-base font-extrabold text-foreground dark:text-dark-foreground mt-1 leading-5"
              numberOfLines={2}
            >
              {request.title}
            </Text>
            {!!request.description && (
              <Text
                className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-1"
                numberOfLines={2}
              >
                {request.description}
              </Text>
            )}
            {request.anulado === 1 && (
              <View className="mt-2 self-start rounded-full bg-red-500/10 dark:bg-red-500/20 px-2.5 py-1">
                <Text className="text-[11px] font-bold text-red-600 dark:text-red-400">
                  Anulada
                  {request.motivoanulado ? ` • ${request.motivoanulado}` : ""}
                </Text>
              </View>
            )}
          </View>
          <StatusBadge status={request.status} label={request.estatusLabel} />
        </View>

        <View className="mt-3 flex-row items-center gap-2">
          <MetricPill label="Materiales" value={request.materiales.length} />
          <MetricPill label="Fecha" value={formatDate(request.createdAt)} />
          <MetricPill
            label="En etapa"
            value={`${request.diasEnEstatus.toFixed(1)} d`}
            danger={request.diasEnEstatus >= 2}
          />
          <View className="h-10 w-10 rounded-2xl bg-primary/15 dark:bg-dark-primary/20 items-center justify-center">
            <Ionicons name="chevron-forward" size={18} color="#0EA5E9" />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderMaterialCard = (material: RequestMaterialItem) => {
    const price = formatMoney(material.precio);

    return (
      <View className="mb-3 overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-componentbg dark:bg-dark-componentbg p-3 shadow-sm shadow-black/5">
        <View className="flex-row gap-3.5">
          <View className="relative h-24 w-24 rounded-xl overflow-hidden bg-neutral-50 dark:bg-dark-background border border-zinc-200/50 dark:border-zinc-800/60">
            <CustomImagen img={material.imagen1 ?? ""} content="cover" />

            <View className="absolute top-1.5 left-1.5 rounded-full bg-primary dark:bg-dark-primary px-2 py-0.5 shadow-sm">
              <Text className="text-[10px] font-black text-white dark:text-zinc-950">
                x{material.quantity}
              </Text>
            </View>
          </View>
          {/* Detalles del Material */}
          <View className="flex-1 justify-between py-0.5">
            <View>
              {/* Header: Código & Categoría */}
              <View className="flex-row items-center justify-between gap-2 mb-1">
                <Text className="text-[11px] font-semibold tracking-wider text-primary dark:text-dark-primary uppercase">
                  {material.codigomaterial || "SIN CÓDIGO"}
                </Text>

                {material.coduni || material.unidad ? (
                  <Text className="text-[10px] font-bold text-mutedForeground dark:text-dark-mutedForeground uppercase bg-background dark:bg-dark-background px-2 py-0.5 rounded-md border border-zinc-200/40 dark:border-zinc-800">
                    {material.coduni || material.unidad}
                  </Text>
                ) : null}
              </View>

              {/* Título Principal */}
              <Text
                className="text-[14px] font-bold leading-5 text-foreground dark:text-dark-foreground"
                numberOfLines={2}
              >
                {material.description ||
                  material.material ||
                  "Material sin descripción"}
              </Text>

              {/* Taxonomía limpia estilo OKX */}
              <Text
                className="mt-1 text-[11px] font-medium text-mutedForeground dark:text-dark-mutedForeground/80"
                numberOfLines={1}
              >
                {[material.linea, material.sublinea, material.categoria]
                  .filter(Boolean)
                  .join(" / ") || "Sin categoría"}
              </Text>
            </View>

            {/* Footer: Precio (Alineación limpia estilo FinTech) */}
            {price && (
              <View className="mt-2 flex-row items-baseline justify-end gap-1">
                <Text className="text-[10px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                  Total:
                </Text>
                <Text className="text-base font-black tracking-tight text-foreground dark:text-dark-foreground">
                  {price}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };
  const renderSummaryValue = (label: string, value?: string | null) => (
    <View className="w-[48.5%] rounded-2xl bg-background dark:bg-dark-background px-3 py-2.5">
      <Text className="text-[11px] font-semibold text-mutedForeground dark:text-dark-mutedForeground">
        {label}
      </Text>
      <Text
        className="text-sm font-extrabold text-foreground dark:text-dark-foreground mt-0.5"
        numberOfLines={2}
      >
        {value || "No indicado"}
      </Text>
    </View>
  );

  const renderRequestHeaderSummary = (request: Request) => (
    <View className="mb-2 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg px-3 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="mt-1 text-lg font-extrabold text-foreground dark:text-dark-foreground leading-6">
            {request.title}
          </Text>
          <Text className="mt-1 text-sm text-mutedForeground dark:text-dark-mutedForeground">
            {request.materiales.length} materiales
          </Text>
        </View>
        <StatusBadge status={request.status} label={request.estatusLabel} />
      </View>
      {request.anulado === 1 && (
        <View className="mt-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-2.5">
          <Text className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">
            Solicitud anulada
          </Text>
          <Text className="mt-1 text-sm font-semibold text-red-700 dark:text-red-200">
            {request.motivoanulado || "No se indicó motivo"}
          </Text>
          <Text className="mt-1 text-xs text-red-600 dark:text-red-300">
            {formatOptionalDate(request.fechaanulado)}
          </Text>
        </View>
      )}
      <View className="mt-3 flex-row flex-wrap justify-between gap-y-2.5">
        {/* {renderSummaryValue("Empresa", request.empresa)} */}
        {renderSummaryValue("Solicitante", request.solicitanteuser)}

        {renderSummaryValue(
          "Utilización",
          formatOptionalDate(request.fechautilizacion),
        )}
        {/* {renderSummaryValue("Registrado por", request.registradopor)} */}
      </View>
      {!!request.actividad && (
        <View className="mt-2.5 rounded-2xl bg-background dark:bg-dark-background px-3 py-2.5">
          <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
            Actividad
          </Text>
          <Text className="text-sm font-bold text-foreground dark:text-dark-foreground mt-1">
            {request.actividad}
          </Text>
        </View>
      )}
      {!!request.direccionentrega && (
        <View className="mt-2.5 rounded-2xl bg-background dark:bg-dark-background px-3 py-2.5">
          <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
            Dirección de entrega
          </Text>
          <Text className="text-sm font-bold text-foreground dark:text-dark-foreground mt-1">
            {request.direccionentrega}
          </Text>
        </View>
      )}

      <View className="mt-4 flex-row items-center justify-between gap-2">
        <Text className="text-base font-extrabold text-foreground dark:text-dark-foreground">
          Más información
        </Text>
        <Pressable
          onPress={() => setShowMoreInfo((prev) => !prev)}
          className="flex-row items-center gap-1.5 rounded-full bg-primary/10 dark:bg-dark-primary/20 px-3 py-1.5"
          accessibilityRole="button"
          accessibilityLabel={
            showMoreInfo ? "Ocultar más información" : "Mostrar más información"
          }
        >
          <Ionicons
            name={showMoreInfo ? "chevron-up-outline" : "chevron-down-outline"}
            size={14}
            color="#0EA5E9"
          />
          <Text className="text-xs font-extrabold text-primary dark:text-dark-primary">
            {showMoreInfo ? "Ocultar" : "Mostrar"}
          </Text>
        </Pressable>
      </View>

      {showMoreInfo && (
        <View className="mt-2.5 gap-2.5">
          <View className="rounded-2xl bg-background dark:bg-dark-background px-3 py-2.5">
            <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
              Observación
            </Text>
            <Text className="text-sm font-bold text-foreground dark:text-dark-foreground mt-1">
              {request.observacion}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-2.5">
            {renderSummaryValue(
              "Fecha solicitud",
              formatOptionalDate(request.fechasolicitud),
            )}
            {renderSummaryValue(
              "Fecha autorización",
              formatOptionalDate(request.fechaautorizado),
            )}
            {renderSummaryValue(
              "Fecha anulado",
              formatOptionalDate(request.fechaanulado),
            )}
            {renderSummaryValue(
              "Fecha despacho",
              formatOptionalDate(request.fechadespachar),
            )}
            {renderSummaryValue(
              "Fecha pedido",
              formatOptionalDate(request.fec_emis_ped),
            )}
            {renderSummaryValue(
              "Fecha compra",
              formatOptionalDate(request.fechacomprar),
            )}
            {renderSummaryValue(
              "Fecha emisión pedido",
              formatOptionalDate(request.fec_emis_ped),
            )}
            {renderSummaryValue(
              "Fecha emisión compra",
              formatOptionalDate(request.fec_emis_comp),
            )}
          </View>

          <View className="rounded-2xl bg-background dark:bg-dark-background px-3 py-2.5">
            <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground">
              Comentarios de flujo
            </Text>
            <View className="mt-2 gap-2">
              <View>
                <Text className="text-[11px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                  Despachar
                </Text>
                <Text className="text-sm font-bold text-foreground dark:text-dark-foreground mt-0.5">
                  {request.comentadespachar || "-"}
                </Text>
              </View>
              <View>
                <Text className="text-[11px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                  Comprar
                </Text>
                <Text className="text-sm font-bold text-foreground dark:text-dark-foreground mt-0.5">
                  {request.comentacomprar || "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="mt-4 mb-2.5 flex-row items-center justify-between">
        <Text className="text-base font-extrabold text-foreground dark:text-dark-foreground">
          Seguimiento de estatus
        </Text>
        <Pressable
          onPress={() => setShowStatusTracking((prev) => !prev)}
          className="flex-row items-center gap-1.5 rounded-full bg-primary/10 dark:bg-dark-primary/20 px-3 py-1.5"
          accessibilityRole="button"
          accessibilityLabel={
            showStatusTracking
              ? "Ocultar seguimiento de estatus"
              : "Mostrar seguimiento de estatus"
          }
        >
          <Ionicons
            name={showStatusTracking ? "eye-off-outline" : "eye-outline"}
            size={14}
            color="#0EA5E9"
          />
          <Text className="text-xs font-extrabold text-primary dark:text-dark-primary">
            {showStatusTracking ? "Ocultar" : "Mostrar"}
          </Text>
        </Pressable>
      </View>
      {showStatusTracking && (
        <View className="gap-1.5">
          {STATUS_DATE_ITEMS.map((item) => {
            const date = request.statusDates[item.status];
            const isCurrent = request.status === item.status;
            const isDone = Boolean(date);

            return (
              <View
                key={item.status}
                className={`flex-row items-center justify-between rounded-2xl border px-3 py-2.5 ${isCurrent ? "border-primary bg-primary/10 dark:border-dark-primary dark:bg-dark-primary/15" : "border-zinc-200 dark:border-zinc-800 bg-background dark:bg-dark-background"}`}
              >
                <View className="flex-1 pr-3 flex-row items-center gap-2.5">
                  <View
                    className={`h-2.5 w-2.5 rounded-full ${isCurrent ? "bg-primary dark:bg-dark-primary" : isDone ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground dark:text-dark-foreground">
                      {item.label}
                    </Text>
                    <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground mt-0.5">
                      {isCurrent
                        ? "Estatus actual"
                        : isDone
                          ? "Completado"
                          : "Pendiente"}
                    </Text>
                  </View>
                </View>
                <Text
                  className={`text-xs font-bold ${isDone ? "text-foreground dark:text-dark-foreground" : "text-mutedForeground dark:text-dark-mutedForeground"}`}
                >
                  {formatOptionalDate(date)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderModalItem = ({ item }: { item: RequestModalItem }) => {
    if (item.type === "summary") {
      return renderRequestHeaderSummary(item.request);
    }

    if (item.type === "empty") {
      return <MaterialEmptyState />;
    }

    return renderMaterialCard(item.material);
  };

  const renderModalItemKey = (item: RequestModalItem) => {
    if (item.type === "summary") return `summary-${item.request.id}`;
    if (item.type === "empty") return item.id;
    return renderMaterialKey(item.material, item.index);
  };

  return (
    <ScreenSearchLayout
      searchText={searchText}
      setSearchText={setSearchText}
      placeholder="Buscar por obra, numero o descripcion"
      onFilterPress={() => {}}
      extrafilter={true}
      showfilterButton={false}
      headerVisible={true}
      filterCount={filter !== null ? 1 : undefined}
      extraFiltersComponent={
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setFilter(null)}
            className={`rounded-full border px-4 py-2 ${
              filter === null
                ? "bg-primary border-primary"
                : "bg-componentbg dark:bg-dark-componentbg border-zinc-300 dark:border-zinc-700"
            }`}
          >
            <Text
              className={
                filter === null
                  ? "text-white font-semibold"
                  : "text-foreground dark:text-dark-foreground font-semibold"
              }
            >
              Todas ({requests.length})
            </Text>
          </Pressable>

          {STATUSES.map((status) => (
            <Pressable
              key={status}
              onPress={() =>
                setFilter((prev) => (prev === status ? null : status))
              }
              className={`rounded-full border px-4 py-2 ${
                filter === status
                  ? "bg-primary border-primary"
                  : "bg-componentbg dark:bg-dark-componentbg border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <Text
                className={
                  filter === status
                    ? "text-white font-semibold"
                    : "text-foreground dark:text-dark-foreground font-semibold"
                }
              >
                {STATUS_LABELS[status]} ({statusCount[status] || 0})
              </Text>
            </Pressable>
          ))}
        </View>
      }
    >
      <View className="flex-1">
        <View className="px-4 pt-3 pb-2.5">
          <View className="rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg px-4 py-3.5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-foreground dark:text-dark-foreground">
                  Resumen de Solicitudes
                </Text>
                <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-1">
                  {filtered.length} solicitudes • {totalItems} materiales
                </Text>
              </View>

              <View className="h-11 w-11 rounded-2xl bg-primary/10 dark:bg-dark-primary/20 items-center justify-center">
                <Ionicons name="receipt-outline" size={22} color="#0EA5E9" />
              </View>
            </View>
          </View>
        </View>

        <CustomFlatList
          data={listData}
          keyExtractor={(item) =>
            item.type === "skeleton" ? item.id : item.request.id
          }
          renderItem={renderRequestItem}
          refreshing={loading}
          canRefresh={true}
          handleRefresh={fetchRequests}
          ListEmptyComponent={<RequestEmptyState />}
          showtitle={false}
          estimatedItemSize={170}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 2 }}
          paddingHorizontal={16}
        />
      </View>

      <BottomModal
        visible={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        heightPercentage={0.82}
      >
        {selectedRequest && (
          <View className="flex-1">
            <View className="flex-row items-start justify-between gap-3 pb-1">
              <View className="flex-1">
                <Text className="text-xs font-bold tracking-[1px] text-primary dark:text-dark-primary uppercase">
                  {selectedRequest.solicitudnumero
                    ? `Solicitud ${selectedRequest.solicitudnumero}`
                    : `Solicitud ${selectedRequest.id}`}
                </Text>
                <Text className="mt-1 text-sm text-mutedForeground dark:text-dark-mutedForeground">
                  {selectedRequest.empresa ||
                    selectedRequest.codigoobra ||
                    selectedRequest.descripcionobra ||
                    "Solicitud seleccionada"}
                </Text>
              </View>
            </View>

            <View className=" flex-row items-center justify-between">
              <Text className="text-xl font-extrabold text-foreground dark:text-dark-foreground">
                Resumen de la solicitud
              </Text>
              <View className="rounded-full bg-primary/10 dark:bg-dark-primary/20 px-2 py-1.5">
                <Text className="text-md font-semibold text-primary dark:text-dark-primary">
                  {selectedRequest.materiales.length} items
                </Text>
              </View>
            </View>

            <CustomFlatList
              data={modalData}
              keyExtractor={renderModalItemKey}
              renderItem={renderModalItem}
              refreshing={false}
              canRefresh={false}
              handleRefresh={() => {}}
              showtitle={false}
              showScrollTopButton={false}
              estimatedItemSize={132}
              contentContainerStyle={{ paddingTop: 14, paddingBottom: 18 }}
              paddingHorizontal={0}
            />
          </View>
        )}
      </BottomModal>
    </ScreenSearchLayout>
  );
}

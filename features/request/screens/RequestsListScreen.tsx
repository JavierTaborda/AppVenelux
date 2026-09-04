import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import CustomFlatList from "@/components/ui/CustomFlatList";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import StatusBadge from "../components/StatusBadge";
import { useRequest } from "../hooks/useRequest";
import type { Request, RequestStatus } from "../types/request";
import { STATUSES, STATUS_LABELS } from "../utils/statuses";

const REQUEST_SKELETON_ITEMS = Array.from(
  { length: 6 },
  (_, index) => `request-skeleton-${index}`,
);

type RequestListItem =
  | { type: "skeleton"; id: string }
  | { type: "request"; request: Request };

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

export default function RequestsListScreen() {
  const params = useLocalSearchParams<{
    scrollY?: string;
    filter?: string;
    q?: string;
  }>();
  const router = useRouter();
  const { requests, loading, fetchRequests } = useRequest();

  const [filter, setFilter] = useState<RequestStatus | null>(() => {
    const parsed = Number(params.filter);
    return Number.isInteger(parsed) &&
      STATUSES.includes(parsed as RequestStatus)
      ? (parsed as RequestStatus)
      : null;
  });
  const [searchText, setSearchText] = useState(() => params.q ?? "");
  const [currentScrollY, setCurrentScrollY] = useState(() => {
    const parsed = Number(params.scrollY);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const restoredScrollOffset = useMemo(() => {
    const parsed = Number(params.scrollY);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [params.scrollY]);
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

  const renderRequestItem = ({ item }: { item: RequestListItem }) => {
    if (item.type === "skeleton") return <RequestSkeletonCard />;

    const request = item.request;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(main)/(tabs)/(request)/[id]",
            params: {
              id: String(request.id),
              scrollY: String(currentScrollY),
              filter: filter == null ? "" : String(filter),
              q: searchText,
            },
          })
        }
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

          <View className="h-10 w-10 rounded-2xl bg-primary/15 dark:bg-dark-primary/20 items-center justify-center">
            <Ionicons name="chevron-forward" size={18} color="#0EA5E9" />
          </View>
        </View>
      </Pressable>
    );
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
          onScrollOffsetChange={setCurrentScrollY}
          restoreScrollOffset={restoredScrollOffset}
        />
      </View>
    </ScreenSearchLayout>
  );
}

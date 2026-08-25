import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import BottomModal from "@/components/ui/BottomModal";
import CustomImagen from "@/components/ui/CustomImagen";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import StatusBadge from "../components/StatusBadge";
import { useRequest } from "../hooks/useRequest";
import type { Request } from "../types/request";
import { STATUSES } from "../utils/statuses";

const REQUEST_SKELETON_ITEMS = Array.from(
  { length: 6 },
  (_, index) => `request-skeleton-${index}`,
);

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

export default function RequestsListScreen() {
  const { requests, loading, fetchRequests } = useRequest();
  const [filter, setFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const showInitialSkeleton = loading && requests.length === 0;

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    return requests.filter((item) => {
      if (filter && item.status !== filter) return false;
      if (!term) return true;

      const haystack = [
        item.title,
        item.description,
        item.solicitudnumero,
        item.codigoobra,
        item.descripcionobra,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [filter, requests, searchText]);

  const totalItems = useMemo(
    () => filtered.reduce((acc, request) => acc + request.items.length, 0),
    [filtered],
  );

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

  const renderMaterialKey = (item: Request["items"][number], index: number) => {
    const code = item.codigomaterial?.trim() || "SIN";
    const codart = item.codart != null ? String(item.codart) : "sin-codart";
    return `${code}-${codart}-${index}`;
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
      filterCount={filter ? 1 : undefined}
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
                {status} ({statusCount[status] || 0})
              </Text>
            </Pressable>
          ))}
        </View>
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRequests} />
        }
      >
        <View className="px-4 pt-4 pb-3">
          <View className="rounded-3xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold tracking-[1.4px] text-primary dark:text-dark-primary uppercase">
                  Solicitudes
                </Text>
                <Text className="text-2xl font-extrabold text-foreground dark:text-dark-foreground mt-1">
                  Centro de compras
                </Text>
                <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-1">
                  {filtered.length} solicitudes • {totalItems} materiales
                </Text>
              </View>

              <View className="h-12 w-12 rounded-2xl bg-primary/10 dark:bg-dark-primary/20 items-center justify-center">
                <Ionicons name="receipt-outline" size={22} color="#0EA5E9" />
              </View>
            </View>
          </View>
        </View>

        <View className="px-4">
          {showInitialSkeleton ? (
            REQUEST_SKELETON_ITEMS.map((item) => <RequestSkeletonCard key={item} />)
          ) : filtered.length === 0 ? (
            <View className="mt-3 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 items-center bg-componentbg dark:bg-dark-componentbg">
              <Ionicons name="bag-handle-outline" size={34} color="#9CA3AF" />
              <Text className="mt-2 text-base font-semibold text-foreground dark:text-dark-foreground">
                No hay solicitudes
              </Text>
              <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground text-center mt-1">
                Ajusta los filtros o realiza una solicitud nueva.
              </Text>
            </View>
          ) : (
            filtered.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setSelectedRequest(item)}
                className="mb-3 rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-xs font-bold tracking-[1px] text-primary dark:text-dark-primary uppercase">
                      {item.solicitudnumero
                        ? `Solicitud ${item.solicitudnumero}`
                        : `Solicitud ${item.id}`}
                    </Text>
                    <Text
                      className="text-lg font-extrabold text-foreground dark:text-dark-foreground mt-1"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    {!!item.description && (
                      <Text
                        className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-1"
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
                      Materiales
                    </Text>
                    <Text className="text-base font-bold text-foreground dark:text-dark-foreground">
                      {item.items.length}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
                      Fecha
                    </Text>
                    <Text className="text-base font-bold text-foreground dark:text-dark-foreground">
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>

                  <View className="w-9 h-9 rounded-full bg-primary/15 dark:bg-dark-primary/20 items-center justify-center">
                    <Ionicons name="list-outline" size={18} color="#0EA5E9" />
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <BottomModal
        visible={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        heightPercentage={0.82}
      >
        {selectedRequest && (
          <View className="flex-1">
            <View className="flex-row items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <View className="flex-1">
                <Text className="text-xs font-bold tracking-[1px] text-primary dark:text-dark-primary uppercase">
                  {selectedRequest.solicitudnumero
                    ? `Solicitud ${selectedRequest.solicitudnumero}`
                    : `Solicitud ${selectedRequest.id}`}
                </Text>
                <Text
                  className="text-xl font-extrabold text-foreground dark:text-dark-foreground mt-1"
                  numberOfLines={2}
                >
                  {selectedRequest.title}
                </Text>
                <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-1">
                  {selectedRequest.items.length} materiales •{" "}
                  {formatDate(selectedRequest.createdAt)}
                </Text>
              </View>
              <StatusBadge status={selectedRequest.status} />
            </View>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 14, paddingBottom: 18 }}
            >
              {selectedRequest.items.length === 0 ? (
                <View className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 items-center bg-componentbg dark:bg-dark-componentbg">
                  <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
                  <Text className="mt-2 text-sm text-mutedForeground dark:text-dark-mutedForeground text-center">
                    Esta solicitud no trae detalle de materiales.
                  </Text>
                </View>
              ) : (
                selectedRequest.items.map((material, index) => (
                  <View
                    key={renderMaterialKey(material, index)}
                    className="mb-3 rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-dark-componentbg border border-neutral-200/50 dark:border-zinc-800">
                        <CustomImagen img={material.imagen1 ?? ""} />
                      </View>

                      <View className="flex-1 justify-center">
                        <View className="flex-row items-start justify-between gap-2">
                          <View className="flex-1 pr-2">
                            <Text
                              className="text-base font-semibold text-foreground dark:text-dark-foreground mt-0.5"
                              numberOfLines={2}
                            >
                              {material.codigomaterial || "Sin codigomaterial"}{" "}
                              -{material.description || material.material}
                            </Text>
                          </View>

                          <View className="rounded-full bg-primary/10 dark:bg-dark-primary/20 px-3 py-1">
                            <Text className="text-xs font-bold text-primary dark:text-dark-primary">
                              x{material.quantity}{" "}
                              {material.coduni || material.unidad || "UND"}
                            </Text>
                          </View>
                        </View>

                        <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground mt-2">
                          {material.linea || "Sin linea"} •{" "}
                          {material.sublinea || "Sin sublinea"} •{" "}
                          {material.categoria || "Sin categoria"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </BottomModal>
    </ScreenSearchLayout>
  );
}

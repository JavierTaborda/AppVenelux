import SelectedItemsFab from "@/features/request/components/SelectedItemsFab";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import StatusBadge from "../components/StatusBadge";
import { RequestService } from "../services/RequestService";
import type { Request } from "../types/request";

interface Props {
  requestId?: string;
  request?: Request;
}

function RequestDetailSkeleton() {
  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
    >
      <View className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="h-3 w-32 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <View className="h-7 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-3 animate-pulse" />
            <View className="h-4 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-3 animate-pulse" />
          </View>
          <View className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <View>
            <View className="h-3 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <View className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-2 animate-pulse" />
          </View>
          <View>
            <View className="h-3 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <View className="h-5 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-2 animate-pulse" />
          </View>
        </View>
      </View>

      <View className="h-6 w-44 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-5 mb-3 animate-pulse" />

      {Array.from({ length: 4 }, (_, index) => (
        <View
          key={`request-detail-skeleton-${index}`}
          className="mb-3 rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4"
        >
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1 pr-2">
              <View className="h-4 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              <View className="h-5 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-3 animate-pulse" />
            </View>
            <View className="h-7 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          </View>
          <View className="h-3 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-4 animate-pulse" />
        </View>
      ))}
    </ScrollView>
  );
}

export default function RequestDetailScreen({ request, requestId }: Props) {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Request | null>(request ?? null);

  const resolvedId = useMemo(
    () => requestId ?? params.id ?? request?.id ?? null,
    [params.id, request?.id, requestId],
  );

  useEffect(() => {
    let isMounted = true;
    const loadRequest = async () => {
      if (!resolvedId) return;
      if (request && request.id === resolvedId) {
        setData(request);
        return;
      }

      setLoading(true);
      try {
        const found = await RequestService.getById(resolvedId);
        if (isMounted) setData(found);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadRequest();

    return () => {
      isMounted = false;
    };
  }, [request, resolvedId]);

  const s = data;

  const markApproved = async () => {
    try {
      if (!s) return;
      await RequestService.updateStatus(s.id, "aprobado", "Ingeniero jefe");
      Alert.alert("Solicitud", "Marcada como aprobada");
    } catch {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  const formatDate = (isoDate: string) => {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return "Sin fecha";
    return parsed.toLocaleDateString();
  };

  if (loading) {
    return <RequestDetailSkeleton />;
  }

  if (!s)
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background dark:bg-dark-background">
        <Ionicons name="document-text-outline" size={36} color="#9CA3AF" />
        <Text className="mt-3 text-lg font-bold text-foreground dark:text-dark-foreground">
          No se encontró la solicitud
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-full border border-primary px-4 py-2"
        >
          <Text className="font-semibold text-primary dark:text-dark-primary">
            Volver
          </Text>
        </Pressable>
      </View>
    );

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
    >
      <View className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xs font-bold tracking-[1px] text-primary dark:text-dark-primary uppercase">
              {s.solicitudnumero
                ? `Solicitud ${s.solicitudnumero}`
                : `Solicitud ${s.id}`}
            </Text>
            <Text className="text-2xl font-extrabold text-foreground dark:text-dark-foreground mt-1">
              {s.title}
            </Text>
          </View>
          <StatusBadge status={s.status} />
        </View>

        {!!s.description && (
          <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-2">
            {s.description}
          </Text>
        )}

        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
              Fecha
            </Text>
            <Text className="text-base font-bold text-foreground dark:text-dark-foreground">
              {formatDate(s.createdAt)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
              Materiales
            </Text>
            <Text className="text-base font-bold text-foreground dark:text-dark-foreground">
              {s.items.length}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-extrabold text-foreground dark:text-dark-foreground">
          Lista de materiales
        </Text>
      </View>

      {s.items.length === 0 ? (
        <View className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 items-center bg-componentbg dark:bg-dark-componentbg">
          <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
          <Text className="mt-2 text-sm text-mutedForeground dark:text-dark-mutedForeground">
            Esta solicitud no trae detalle de materiales.
          </Text>
        </View>
      ) : (
        s.items.map((it, index) => {
          const unique = `${it.codigomaterial || "SIN"}-${it.codart ?? index}-${index}`;
          return (
            <View
              key={unique}
              className="mb-3 rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg p-4"
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-bold text-foreground dark:text-dark-foreground">
                    {it.codigomaterial || "Sin codigomaterial"}
                  </Text>
                  <Text
                    className="text-base font-semibold text-foreground dark:text-dark-foreground mt-0.5"
                    numberOfLines={2}
                  >
                    {it.description ||
                      it.material ||
                      "Material sin descripcion"}
                  </Text>
                </View>

                <View className="rounded-full bg-primary/10 dark:bg-dark-primary/20 px-3 py-1">
                  <Text className="text-xs font-bold text-primary dark:text-dark-primary">
                    x{it.quantity} {it.coduni || it.unidad || "UND"}
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground mt-2">
                {it.linea || "Sin linea"} • {it.sublinea || "Sin sublinea"} •{" "}
                {it.categoria || "Sin categoria"}
              </Text>
            </View>
          );
        })
      )}

      <View className="mt-4">
        {s.status === "pendiente" && (
          <Pressable
            className="bg-primary px-4 py-3 rounded-2xl"
            onPress={markApproved}
            accessibilityRole="button"
          >
            <Text className="text-white text-center font-semibold">
              Aprobar solicitud
            </Text>
          </Pressable>
        )}
      </View>
      <SelectedItemsFab />
    </ScrollView>
  );
}

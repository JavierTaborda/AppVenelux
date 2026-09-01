import CustomFlatList from "@/components/ui/CustomFlatList";
import CustomImagen from "@/components/ui/CustomImagen";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import StatusBadge from "../components/StatusBadge";
import { RequestService } from "../services/RequestService";
import type { Request } from "../types/request";

interface Props {
  requestId?: string;
  request?: Request;
}

type RequestModalItem =
  | { type: "summary"; request: Request }
  | { type: "empty"; id: string }
  | { type: "material"; material: Request["items"][number]; index: number };

const STATUS_DATE_ITEMS: { status: Request["status"]; label: string }[] = [
  { status: 0, label: "Solicitud" },
  { status: 1, label: "Autorizada solicitud" },
  { status: 2, label: "Autorizado despacho" },
  { status: 3, label: "En despacho" },
  { status: 4, label: "Autorizado comprar" },
  { status: 5, label: "En compra" },
  { status: 6, label: "Anulado" },
];

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

export default function RequestDetailScreen({ request, requestId }: Props) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    scrollY?: string;
    filter?: string;
    q?: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Request | null>(request ?? null);
  const [showStatusTracking, setShowStatusTracking] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

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

  const formatDate = (isoDate: string) => {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return "Sin fecha";
    return parsed.toLocaleDateString();
  };

  const formatOptionalDate = (isoDate?: string | null) => {
    if (!isoDate) return "No realizado";
    return formatDate(isoDate);
  };

  const renderSummaryValue = (label: string, value?: string | null) => (
    <View className="w-[48.5%] rounded-[20px] border border-zinc-200/70 dark:border-zinc-800 bg-background dark:bg-dark-background px-3 py-2.5">
      <Text className="text-[10px] font-semibold tracking-[0.8px] text-mutedForeground dark:text-dark-mutedForeground uppercase">
        {label}
      </Text>
      <Text
        className="mt-1 text-sm font-extrabold leading-5 text-foreground dark:text-dark-foreground"
        numberOfLines={2}
      >
        {value || "No indicado"}
      </Text>
    </View>
  );

  const renderDetailField = (label: string, value?: string | null) => (
    <View className="mt-1 rounded-2xl bg-componentbg dark:bg-dark-componentbg px-3 ">
      <Text className="text-[14px] font-semibold text-foreground dark:text-dark-foreground">
        {label}
      </Text>
      <Text className="mt-1 text-sm font-normal text-gray-800 dark:text-dark-mutedForeground">
        {value || "No indicado"}
      </Text>
    </View>
  );

  const renderDetailDivider = () => (
    <View className="my-2 border-b border-zinc-100 dark:border-zinc-800" />
  );

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

  const renderMaterialCard = (material: Request["items"][number]) => {
    const price = formatMoney(material.precio);
    const requestedQuantity = Math.max(
      1,
      material.quantity || material.cantidadsolicitada || 1,
    );
    const approvedQuantity = Math.max(0, material.cantidadautorizada || 0);
    const purchasedQuantity = Math.max(0, material.cantidadcompra || 0);
    const dispatchedQuantity = Math.max(0, material.cantidaddespacho || 0);
    const availableQuantity = Math.max(0, material.cantidaddisponible || 0);
    const materialTitle =
      material.description || material.material || "Material sin descripción";
    const percent = (value: number) =>
      Math.min(100, Math.round((value / requestedQuantity) * 100));
    const approvedPercent = percent(approvedQuantity);
    const purchasedPercent = percent(purchasedQuantity);
    const lineInfo = [material.linea, material.sublinea, material.categoria]
      .filter(Boolean)
      .join(" / ");

    return (
      <View className="mb-3 overflow-hidden rounded-[28px] border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg shadow-sm shadow-black/5">
        <View className="h-1.5 bg-primary dark:bg-dark-primary" />
        <View className="p-4">
          <View className="flex-row gap-3">
            <View className="relative h-24 w-24 overflow-hidden rounded-[22px] border border-zinc-200/60 dark:border-zinc-800/60 bg-neutral-50 dark:bg-dark-background shrink-0">
              <CustomImagen img={material.imagen1 ?? ""} content="cover" />
              <View className="absolute left-1.5 top-1.5 rounded-full bg-primary dark:bg-dark-primary px-2.5 py-1">
                <Text className="text-[10px] font-black tracking-[0.8px] text-white dark:text-zinc-950 uppercase">
                  x{requestedQuantity}
                </Text>
              </View>
            </View>

            <View className="flex-1 min-h-24 justify-between py-0.5">
              <View>
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1 pr-1">
                    <Text className="text-[10px] font-semibold tracking-[1.2px] text-primary dark:text-dark-primary uppercase">
                      {material.codigomaterial || "SIN CÓDIGO"}
                    </Text>
                    <Text
                      className="mt-1 text-[15px] font-extrabold leading-5 text-foreground dark:text-dark-foreground"
                      numberOfLines={2}
                    >
                      {materialTitle}
                    </Text>
                  </View>

                  <View className="items-end gap-1 shrink-0">
                    {price ? (
                      <View className="items-end">
                        <Text className="text-[10px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                          Total
                        </Text>
                        <Text className="text-sm font-black tracking-tight text-foreground dark:text-dark-foreground">
                          {price}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <Text
                  className="mt-1 text-[11px] font-medium text-mutedForeground dark:text-dark-mutedForeground/80"
                  numberOfLines={1}
                >
                  {lineInfo || "Sin categoría"}
                </Text>
              </View>

              <View className="mt-2 flex-row flex-wrap gap-2">
                <View className="rounded-full bg-primary/10 dark:bg-dark-primary/20 px-2.5 py-1">
                  <Text className="text-[10px] font-bold text-primary dark:text-dark-primary uppercase">
                    {material.autorizado ? "Aprobado" : "Pendiente"}
                  </Text>
                </View>
                <View className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1">
                  <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 uppercase">
                    {material.comprar ? "En compra" : "Sin compra"}
                  </Text>
                </View>
                {(material.coduni || material.unidad) && (
                  <View className="rounded-full border border-zinc-200 dark:border-zinc-800 bg-background dark:bg-dark-background px-2.5 py-1">
                    <Text className="text-[10px] font-bold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                      {material.coduni || material.unidad}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-[22px] border border-zinc-200/70 dark:border-zinc-800 bg-background dark:bg-dark-background px-3 py-3">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="text-xs font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                Progreso
              </Text>
              <Text className="text-[11px] font-bold text-foreground dark:text-dark-foreground">
                {approvedQuantity}/{requestedQuantity} aprobado
              </Text>
            </View>

            <View className="mt-2.5 gap-2.5">
              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[11px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                    Aprobado
                  </Text>
                  <Text className="text-[11px] font-bold text-foreground dark:text-dark-foreground">
                    {approvedQuantity}/{requestedQuantity}
                  </Text>
                </View>
                <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <View
                    className="h-full rounded-full bg-primary dark:bg-dark-primary"
                    style={{ width: `${approvedPercent}%` }}
                  />
                </View>
              </View>

              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[11px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                    Comprado
                  </Text>
                  <Text className="text-[11px] font-bold text-foreground dark:text-dark-foreground">
                    {purchasedQuantity}/{requestedQuantity}
                  </Text>
                </View>
                <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <View
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${purchasedPercent}%` }}
                  />
                </View>
              </View>
            </View>

            <View className="mt-3 flex-row gap-2">
              <View className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg px-2.5 py-2">
                <Text className="text-[10px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                  Despachado
                </Text>
                <Text className="mt-0.5 text-sm font-black text-foreground dark:text-dark-foreground">
                  {dispatchedQuantity}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg px-2.5 py-2">
                <Text className="text-[10px] font-semibold text-mutedForeground dark:text-dark-mutedForeground uppercase">
                  Disponible
                </Text>
                <Text className="mt-0.5 text-sm font-black text-foreground dark:text-dark-foreground">
                  {availableQuantity}
                </Text>
              </View>
            </View>

            {(material.autorizadopor ||
              material.fechaautorizado ||
              material.observacion) && (
              <View className="mt-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg px-3 py-2.5">
                {material.autorizadopor ? (
                  <Text className="text-xs text-mutedForeground dark:text-dark-mutedForeground">
                    Autorizado por:{" "}
                    <Text className="font-bold text-foreground dark:text-dark-foreground">
                      {material.autorizadopor}
                    </Text>
                  </Text>
                ) : null}
                {material.fechaautorizado ? (
                  <Text className="mt-0.5 text-xs text-mutedForeground dark:text-dark-mutedForeground">
                    Fecha de autorización:{" "}
                    <Text className="font-bold text-foreground dark:text-dark-foreground">
                      {formatDate(String(material.fechaautorizado))}
                    </Text>
                  </Text>
                ) : null}
                {material.observacion ? (
                  <Text className="mt-0.5 text-xs text-mutedForeground dark:text-dark-mutedForeground">
                    Observación:{" "}
                    <Text className="font-bold text-foreground dark:text-dark-foreground">
                      {material.observacion}
                    </Text>
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderRequestHeaderSummary = (requestData: Request) => {
    const visibleStatusItems = STATUS_DATE_ITEMS.filter((item) => {
      if (item.status === 6) {
        return (
          requestData.anulado === 1 || Boolean(requestData.statusDates?.[6])
        );
      }
      return true;
    });

    return (
      <View className="mb-2 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-componentbg dark:bg-dark-    componentbg px-3 py-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="mt-1 text-lg font-extrabold text-foreground dark:text-dark-foreground leading-6">
              {requestData.title}
            </Text>
            <Text className="mt-1 text-sm text-mutedForeground dark:text-dark-mutedForeground">
              {requestData.materiales.length > 1
                ? requestData.materiales.length + " materiales"
                : requestData.materiales.length + " material"}
            </Text>
          </View>
          <StatusBadge
            status={requestData.status}
            label={requestData.estatusLabel}
          />
        </View>
        {requestData.anulado === 1 && (
          <View className="mt-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-2.5">
            <Text className="text-xs font-bold text-red-700 dark:text-red-300 uppercase">
              Solicitud anulada
            </Text>
            <Text className="mt-1 text-sm font-semibold text-red-700 dark:text-red-200">
              {requestData.motivoanulado || "No se indicó motivo"}
            </Text>
            <Text className="mt-1 text-xs text-red-600 dark:text-red-300">
              {formatOptionalDate(requestData.fechaanulado)}
            </Text>
          </View>
        )}
        {renderDetailDivider()}
        {renderDetailField("Solicitante", requestData.solicitanteuser)}
        {renderDetailDivider()}
        {renderDetailField(
          "Utilización",
          formatOptionalDate(requestData.fechautilizacion),
        )}
        {renderDetailDivider()}
        {!!requestData.actividad &&
          renderDetailField("Partida", requestData.actividad)}
        {!!requestData.actividad && renderDetailDivider()}
        {!!requestData.direccionentrega &&
          renderDetailField(
            "Dirección de entrega",
            requestData.direccionentrega,
          )}
        {!!requestData.direccionentrega && renderDetailDivider()}
        {renderDetailField("Observación", requestData.observacion)}
        {renderDetailDivider()}
        {renderDetailField(
          "Comentario de despacho",
          requestData.comentadespachar || "-",
        )}
        {renderDetailDivider()}
        {renderDetailField(
          "Comentario de compra",
          requestData.comentacomprar || "-",
        )}

        <View className="mt-5 rounded-3xl p-4 ">
          <View className="flex-row items-center justify-between pb-3 border-b border-sky-100/80 dark:border-sky-900/30">
            <View className="flex-row items-center gap-2.5">
              <View>
                <Text className="text-[14px] font-semibold  text-foreground dark:text-dark-foreground ">
                  Seguimiento de estatus
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowStatusTracking((prev) => !prev)}
              className="flex-row items-center gap-1 rounded-full bg-sky-100/90 dark:bg-sky-900/35 px-3 py-1.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel={
                showStatusTracking
                  ? "Ocultar seguimiento de estatus"
                  : "Mostrar seguimiento de estatus"
              }
            >
              <Text className="text-xs font-extrabold text-sky-700 dark:text-sky-200">
                {showStatusTracking ? "Ocultar" : "Ver todo"}
              </Text>
              <Ionicons
                name={showStatusTracking ? "chevron-up" : "chevron-down"}
                size={14}
                color="#0EA5E9"
              />
            </Pressable>
          </View>

          {showStatusTracking && (
            <View className="pt-4 px-1">
              {visibleStatusItems.map((item, index) => {
                const date = requestData.statusDates?.[item.status];
                const isCurrent = requestData.status === item.status;
                const isDone = Boolean(date);
                const isLast = index === visibleStatusItems.length - 1;
                const isAnulado =
                  item.status === 6 || (isCurrent && requestData.anulado === 1);

                return (
                  <View key={item.status} className="flex-row">
                    <View className="items-center mr-3.5">
                      {isAnulado ? (
                        <View className="h-6 w-6 rounded-full bg-rose-500 items-center justify-center shadow-sm shadow-rose-500/20">
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                        </View>
                      ) : isCurrent ? (
                        <View className="h-6 w-6 rounded-full border-2 border-sky-500 dark:border-sky-400 bg-sky-500/20 dark:bg-sky-400/20 items-center justify-center">
                          <View className="h-2.5 w-2.5 rounded-full bg-sky-600 dark:bg-sky-300" />
                        </View>
                      ) : isDone ? (
                        <View className="h-6 w-6 rounded-full bg-emerald-500 items-center justify-center shadow-sm shadow-emerald-500/20">
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#FFFFFF"
                          />
                        </View>
                      ) : (
                        <View className="h-6 w-6 rounded-full border border-sky-200 dark:border-sky-900/50 bg-white/80 dark:bg-slate-950/60 items-center justify-center">
                          <View className="h-1.5 w-1.5 rounded-full bg-sky-300 dark:bg-sky-700" />
                        </View>
                      )}

                      {!isLast && (
                        <View
                          className={`w-[2px] flex-1 my-1 ${
                            isDone && !isCurrent
                              ? "bg-emerald-500/60 dark:bg-emerald-500/40"
                              : isCurrent
                                ? "bg-sky-400/60 dark:bg-sky-400/35"
                                : "bg-sky-100 dark:bg-sky-900/35"
                          }`}
                        />
                      )}
                    </View>

                    <View className={`flex-1 ${!isLast ? "pb-3.5" : "pb-1"}`}>
                      <View
                        className={`rounded-2xl p-3 border ${
                          isCurrent
                            ? "border-sky-400/40 bg-sky-100/90 dark:border-sky-400/35 dark:bg-sky-950/25"
                            : isDone
                              ? "border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/15"
                              : "border-sky-100 dark:border-sky-900/35 bg-sky-50/40 dark:bg-slate-950/25 opacity-85"
                        }`}
                      >
                        <View className="flex-row items-center justify-between gap-2">
                          <Text
                            className={`text-sm font-extrabold ${
                              isCurrent
                                ? "text-sky-700 dark:text-sky-200"
                                : isDone
                                  ? "text-emerald-800 dark:text-emerald-200"
                                  : "text-sky-700/70 dark:text-sky-200/60"
                            }`}
                          >
                            {item.label}
                          </Text>

                          {isCurrent && (
                            <View className="rounded-full bg-sky-500/15 dark:bg-sky-400/20 px-2 py-0.5">
                              <Text className="text-[10px] font-black text-sky-700 dark:text-sky-200 uppercase tracking-wider">
                                Actual
                              </Text>
                            </View>
                          )}
                          {isDone && !isCurrent && (
                            <View className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5">
                              <Text className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Completado
                              </Text>
                            </View>
                          )}
                        </View>

                        <View className="mt-1 flex-row items-center justify-between">
                          <Text className="text-xs font-medium text-sky-800/70 dark:text-sky-100/65">
                            {isCurrent
                              ? "En esta etapa actualmente"
                              : isDone
                                ? "Fecha de realización"
                                : "Pendiente por procesar"}
                          </Text>
                          <Text
                            className={`text-xs font-bold ${
                              isDone
                                ? "text-sky-900 dark:text-sky-100"
                                : "text-sky-700/55 dark:text-sky-200/50"
                            }`}
                          >
                            {formatOptionalDate(date)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

  const modalData = useMemo<RequestModalItem[]>(() => {
    if (!s) return [];

    const materialItems = s.items.map((material, index) => ({
      type: "material" as const,
      material,
      index,
    }));

    return [
      { type: "summary", request: s },
      ...(materialItems.length > 0
        ? materialItems
        : [{ type: "empty" as const, id: "empty-materials" }]),
    ];
  }, [s]);

  const renderModalItem = ({ item }: { item: RequestModalItem }) => {
    if (item.type === "summary")
      return renderRequestHeaderSummary(item.request);
    if (item.type === "empty") return <MaterialEmptyState />;
    return renderMaterialCard(item.material);
  };

  const renderModalItemKey = (item: RequestModalItem) => {
    if (item.type === "summary") return `summary-${item.request.id}`;
    if (item.type === "empty") return item.id;
    return renderMaterialKey(item.material, item.index);
  };

  if (loading) {
    return <RequestDetailSkeleton />;
  }

  if (!s) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background dark:bg-dark-background">
        <Ionicons name="document-text-outline" size={36} color="#9CA3AF" />
        <Text className="mt-3 text-lg font-bold text-foreground dark:text-dark-foreground">
          No se encontró la solicitud
        </Text>
        <Pressable
          onPress={() =>
            router.replace({
              pathname: "/(main)/(tabs)/(request)",
              params: {
                scrollY: params.scrollY ?? "0",
                filter: params.filter ?? "",
                q: params.q ?? "",
              },
            })
          }
          className="mt-4 rounded-full border border-primary px-4 py-2"
        >
          <Text className="font-semibold text-primary dark:text-dark-primary">
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background mb-32">
      <View className="px-4 pt-4 pb-2">
        <Pressable
          onPress={() =>
            router.replace({
              pathname: "/(main)/(tabs)/(request)",
              params: {
                scrollY: params.scrollY ?? "0",
                filter: params.filter ?? "",
                q: params.q ?? "",
              },
            })
          }
          className="self-start flex-row items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-componentbg dark:bg-dark-componentbg px-3 py-2"
          accessibilityRole="button"
          accessibilityLabel="Volver a la pantalla anterior"
        >
          <Ionicons name="chevron-back" size={16} color="#0EA5E9" />
          <Text className="text-sm font-semibold text-foreground dark:text-dark-foreground">
            Volver
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 px-4">
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
          contentContainerStyle={{ paddingTop: 2, paddingBottom: 18 }}
          paddingHorizontal={0}
        />
      </View>
    </View>
  );
}

import CustomDateTimePicker from "@/components/inputs/CustomDateTimePicker";
import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import CustomImagen from "@/components/ui/CustomImagen";
import ProductDetail from "@/features/request/components/ProductDetail";
import { useRequest } from "@/features/request/hooks/useRequest";
import { useSelectedItemsStore } from "@/features/request/stores/useSelectedItemsStore";
import type { VeneluxMaterial } from "@/features/request/types/request";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

type Priority = "normal" | "alta";
type ObraOption = {
  id: string;
  label: string;
};

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string }> = [
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
];

function keyOf(item: VeneluxMaterial) {
  return String(item.codigo || item.codart || item.material);
}

function ShowDateIos({
  onPress,
  children,
}: {
  onPress: () => void;
  children: ReactNode;
}) {
  if (Platform.OS !== "ios") return <>{children}</>;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutDown.duration(150)}
      className="bg-componentbg dark:bg-dark-componentbg p-2 m-1 rounded-3xl"
    >
      {children}
      <View className="flex-row justify-end mt-3">
        <Pressable onPress={onPress} className="px-4 py-2">
          <Text className="text-primary dark:text-dark-primary">Cerrar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function RequestConfirmScreen() {
  const router = useRouter();
  const { materials, getObras } = useRequest({ autoFetchRequests: false });
  const selected = useSelectedItemsStore((s) => s.selected);
  const customItems = useSelectedItemsStore((s) => s.customItems);
  const clearSelected = useSelectedItemsStore((s) => s.clear);

  const [notes, setNotes] = useState("");
  const [area, setArea] = useState("");
  const [partida, setPartida] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [requiredDate, setRequiredDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<VeneluxMaterial | null>(null);
  const [obras, setObras] = useState<string[]>([]);
  const [loadingObras, setLoadingObras] = useState(false);

  const fetchObras = useCallback(async () => {
    setLoadingObras(true);
    try {
      const data = await getObras();
      setObras(data);
    } finally {
      setLoadingObras(false);
    }
  }, [getObras]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadOnFocus = async () => {
        setLoadingObras(true);
        try {
          const data = await getObras();
          if (isActive) {
            setObras(data);
          }
        } finally {
          if (isActive) {
            setLoadingObras(false);
          }
        }
      };

      void loadOnFocus();

      return () => {
        isActive = false;
      };
    }, [getObras]),
  );

  const obraOptions = useMemo<ObraOption[]>(
    () =>
      obras
        .filter((label) => typeof label === "string" && label.trim().length > 0)
        .map((label, index) => ({
          id: `${label}-${index}`,
          label,
        })),
    [obras],
  );

  const selectedItems = useMemo(() => {
    const manual = Object.values(customItems).filter(
      (it) => (selected[keyOf(it)] || 0) > 0,
    );
    const fromDb = materials.filter((it) => (selected[keyOf(it)] || 0) > 0);

    const all = [...fromDb];
    manual.forEach((m) => {
      const exists = all.some((it) => keyOf(it) === keyOf(m));
      if (!exists) all.push(m);
    });

    return all;
  }, [customItems, materials, selected]);

  const summaryRows = useMemo(
    () =>
      selectedItems.map((item) => ({
        item,
        quantity: selected[keyOf(item)] || 0,
      })),
    [selected, selectedItems],
  );

  const totalQty = Object.values(selected).reduce((acc, qty) => acc + qty, 0);
  const distinctCount = summaryRows.length;
  const hasItems = summaryRows.length > 0;

  const handleConfirm = () => {
    if (totalQty === 0) {
      Alert.alert("Sin items", "No hay materiales en la solicitud.");
      return;
    }

    if (!area.trim()) {
      Alert.alert("Falta obra", "Selecciona la obra para continuar.");
      return;
    }

    Alert.alert(
      "Solicitud confirmada",
      `Obra: ${area}\nPrioridad: ${priority}\nFecha requerida: ${requiredDate ? requiredDate.toLocaleDateString() : "No definida"}\nItems: ${distinctCount}\nUnidades: ${totalQty}`,
      [
        {
          text: "Aceptar",
          onPress: () => {
            clearSelected();
            router.replace("/(main)/(tabs)/(request)/create");
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background mb-32">
      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-3">
          <Pressable
            onPress={() => router.navigate("/(main)/(tabs)/(request)/create")}
            className="self-start flex-row items-center gap-1.5 rounded-full border border-muted px-3 py-2 bg-componentbg dark:bg-dark-componentbg"
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={Platform.select({
                ios: "#6B7280",
                android: "#6B7280",
                default: "#6B7280",
              })}
            />
            <Text className="text-sm font-semibold text-foreground dark:text-dark-foreground">
              Regresar
            </Text>
          </Pressable>

          <Text className="text-2xl font-extrabold text-foreground dark:text-dark-foreground mt-3">
            Confirmar solicitud
          </Text>
        </View>

        <View className="rounded-3xl border border-muted p-4 mb-3 bg-componentbg dark:bg-dark-componentbg gap-4">
          <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
            Datos de la solicitud
          </Text>

          <View>
            <Text className="text-[15px] mb-1.5 font-semibold text-foreground dark:text-dark-foreground">
              Obra
            </Text>
            <Pressable
              onPress={() => {
                setShowAreaModal(true);
                if (obras.length === 0) {
                  void fetchObras();
                }
              }}
              className="flex-row items-center justify-between border border-muted rounded-xl px-4 py-3.5 bg-background dark:bg-dark-background"
            >
              <View className="flex-1 pr-3">
                <Text
                  className={`text-base ${area ? "text-foreground dark:text-dark-foreground" : "text-mutedForeground dark:text-dark-mutedForeground"}`}
                >
                  {area || "Selecciona una obra"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </Pressable>
          </View>

          <View>
            <Text className="text-[15px] mb-1.5 font-semibold text-foreground dark:text-dark-foreground">
              Partida
            </Text>
            <TextInput
              value={partida}
              onChangeText={setPartida}
              placeholder="Ej: Sistema electrico"
              placeholderTextColor="#9CA3AF"
              className="border border-muted rounded-xl px-4 py-3.5 bg-background dark:bg-dark-background text-base text-foreground dark:text-dark-foreground"
            />
          </View>

          <View>
            <Text className="text-[15px] mb-1.5 font-semibold text-foreground dark:text-dark-foreground">
              Dirección de entrega
            </Text>
            <TextInput
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Ej: Almacen temporal, puerta 3"
              placeholderTextColor="#9CA3AF"
              className="border border-muted rounded-xl px-4 py-3.5 min-h-28 bg-background dark:bg-dark-background text-base text-foreground dark:text-dark-foreground"
            />
          </View>

          <View>
            <Text className="text-[15px] mb-1.5 font-semibold text-foreground dark:text-dark-foreground">
              Observaciones
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Notas para aprobacion o despacho"
              placeholderTextColor="#9CA3AF"
              className="border border-muted rounded-xl px-4 py-3.5 min-h-28 bg-background dark:bg-dark-background text-base text-foreground dark:text-dark-foreground"
            />
          </View>

          <View>
            <Text className="text-[15px] mb-2 font-semibold text-foreground dark:text-dark-foreground">
              Prioridad
            </Text>
            <View className="flex-row gap-2">
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => setPriority(value)}
                  className={`px-5 py-2.5 rounded-full border ${
                    priority === value
                      ? "bg-primary border-primary"
                      : "border-muted"
                  }`}
                >
                  <Text
                    className={
                      priority === value
                        ? "text-white font-semibold text-sm"
                        : "text-foreground dark:text-dark-foreground text-sm"
                    }
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-[15px] mb-1.5 font-semibold text-foreground dark:text-dark-foreground">
              Fecha requerida
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between border border-muted rounded-xl px-4 py-3.5 bg-background dark:bg-dark-background"
            >
              <Text className="text-base text-foreground dark:text-dark-foreground">
                {requiredDate
                  ? requiredDate.toLocaleDateString()
                  : "Seleccionar fecha"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </Pressable>
            {showDatePicker && (
              <ShowDateIos onPress={() => setShowDatePicker(false)}>
                <CustomDateTimePicker
                  value={requiredDate || new Date()}
                  onChange={(_, date) => {
                    if (date) setRequiredDate(date);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              </ShowDateIos>
            )}
          </View>
        </View>

        <Text className="text-lg font-bold text-foreground dark:text-dark-foreground mb-2">
          Materiales seleccionados
        </Text>

        {!hasItems ? (
          <View className="items-center justify-center py-16">
            <Ionicons name="bag-outline" size={42} color="#9CA3AF" />
            <Text className="text-mutedForeground dark:text-dark-mutedForeground mt-2">
              No hay elementos armados.
            </Text>
            <Pressable
              onPress={() => router.back()}
              className="mt-4 rounded-full border border-primary px-4 py-2"
            >
              <Text className="text-primary dark:text-dark-primary font-semibold">
                Regresar a seleccionar
              </Text>
            </Pressable>
          </View>
        ) : (
          <CustomFlatList
            data={summaryRows}
            keyExtractor={({ item }) => keyOf(item)}
            refreshing={false}
            canRefresh={false}
            handleRefresh={() => {}}
            contentContainerStyle={{ paddingBottom: 12 }}
            renderItem={({ item: row }) => (
              <Pressable
                onPress={() => {
                  setModalItem(row.item);
                  setModalVisible(true);
                }}
                className="rounded-2xl border border-neutral-100 dark:border-neutral-800 px-3 py-3 mb-2 bg-componentbg dark:bg-dark-componentbg"
              >
                <View className="flex-row gap-3">
                  <View className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/50">
                    <CustomImagen img={row.item.imagen1 ?? ""} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text
                        className="flex-1 text-sm font-semibold text-foreground dark:text-dark-foreground"
                        numberOfLines={2}
                      >
                        {row.item.codigo} - {row.item.material}
                      </Text>

                      <View className="rounded-full bg-primary/10 dark:bg-dark-primary/20 px-2.5 py-1">
                        <Text className="text-xs font-bold text-primary dark:text-dark-primary">
                          x{row.quantity} {row.item.coduni}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className="text-[12px] text-slate-700 dark:text-dark-mutedForeground mt-0.5"
                      numberOfLines={1}
                    >
                      Marca: {row.item.marca} · N. Parte: {row.item.noparte}
                    </Text>

                    <Text
                      className="text-[12px] text-slate-600 dark:text-dark-mutedForeground mt-0.5"
                      numberOfLines={2}
                    >
                      {row.item.linea ?? "Sin linea"} ·{" "}
                      {row.item.sublinea ?? "Sin sublinea"} ·{" "}
                      {row.item.categoria ?? "Sin categoria"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}

        {modalItem && (
          <BottomModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            heightPercentage={0.8}
          >
            <ProductDetail
              item={modalItem}
              onClose={() => setModalVisible(false)}
            />
          </BottomModal>
        )}

        <BottomModal
          visible={showAreaModal}
          onClose={() => setShowAreaModal(false)}
          heightPercentage={0.65}
        >
          <View className="flex-1">
            <View className="flex-row items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <Text className="text-2xl font-extrabold text-foreground dark:text-dark-foreground">
                Seleccionar obra
              </Text>
              <Pressable
                onPress={() => setShowAreaModal(false)}
                className="w-10 h-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
            >
              {loadingObras
                ? Array.from({ length: 6 }).map((_, index) => (
                    <View
                      key={`obra-skeleton-${index}`}
                      className="mb-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-4 py-4 bg-componentbg dark:bg-dark-componentbg"
                    >
                      <View className="h-5 w-3/4 rounded-md bg-neutral-200 dark:bg-neutral-700" />
                    </View>
                  ))
                : obraOptions.map((option) => {
                    const isSelected = area === option.label;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          setArea(option.label);
                          setShowAreaModal(false);
                        }}
                        className={`mb-2.5 rounded-2xl border px-4 py-4 ${
                          isSelected
                            ? "border-primary bg-primary/10 dark:bg-dark-primary/20"
                            : "border-neutral-200 dark:border-neutral-800 bg-componentbg dark:bg-dark-componentbg"
                        }`}
                      >
                        <View className="flex-row items-center justify-between gap-3">
                          <View className="flex-1">
                            <Text
                              className={`text-base font-semibold ${isSelected ? "text-primary dark:text-dark-primary" : "text-foreground dark:text-dark-foreground"}`}
                            >
                              {option.label}
                            </Text>
                          </View>
                          <Ionicons
                            name={
                              isSelected
                                ? "checkmark-circle"
                                : "ellipse-outline"
                            }
                            size={22}
                            color={isSelected ? "#0EA5E9" : "#9CA3AF"}
                          />
                        </View>
                      </Pressable>
                    );
                  })}
              {!loadingObras && obraOptions.length === 0 ? (
                <View className="items-center justify-center py-8">
                  <Text className="text-mutedForeground dark:text-dark-mutedForeground text-sm">
                    No hay obras disponibles.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </BottomModal>

        <View className="mt-4 mb-2">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => router.navigate("/(main)/(tabs)/(request)/create")}
              className="flex-1 h-14 rounded-xl items-center justify-center border border-muted"
            >
              <Text className="font-semibold text-foreground dark:text-dark-foreground">
                Volver
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={!hasItems}
              className={
                hasItems
                  ? "flex-1 h-14 rounded-xl items-center justify-center bg-primary"
                  : "flex-1 h-14 rounded-xl items-center justify-center bg-muted"
              }
            >
              <Text
                className={
                  hasItems
                    ? "text-white text-base font-bold"
                    : "text-mutedForeground dark:text-dark-mutedForeground text-base font-bold"
                }
              >
                Confirmar pedido
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

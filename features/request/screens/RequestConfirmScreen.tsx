import CustomDateTimePicker from "@/components/inputs/CustomDateTimePicker";
import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import CustomImagen from "@/components/ui/CustomImagen";
import ProductDetail from "@/features/request/components/ProductDetail";
import { useRequest } from "@/features/request/hooks/useRequest";
import { useSelectedItemsStore } from "@/features/request/stores/useSelectedItemsStore";
import type { VeneluxMaterial } from "@/features/request/types/request";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
  children: React.ReactNode;
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
  const { materials } = useRequest({ autoFetchRequests: false });
  const selected = useSelectedItemsStore((s) => s.selected);
  const clearSelected = useSelectedItemsStore((s) => s.clear);

  const [notes, setNotes] = useState("");
  const [area, setArea] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [requiredDate, setRequiredDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<VeneluxMaterial | null>(null);

  const selectedItems = useMemo(
    () => materials.filter((it) => (selected[keyOf(it)] || 0) > 0),
    [materials, selected],
  );

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

    Alert.alert(
      "Solicitud confirmada",
      `Prioridad: ${priority}\nFecha requerida: ${requiredDate ? requiredDate.toLocaleDateString() : "No definida"}\nItems: ${distinctCount}\nUnidades: ${totalQty}`,
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

        {/* <View className="flex-row gap-2 mb-3">
          <View className="flex-1 rounded-2xl border border-muted p-3 bg-componentbg dark:bg-dark-componentbg">
            <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground">
              Artículos
            </Text>
            <Text className="text-2xl font-black text-foreground dark:text-dark-foreground mt-1">
              {distinctCount}
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border border-muted p-3 bg-componentbg dark:bg-dark-componentbg">
            <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground">
              Unidades
            </Text>
            <Text className="text-2xl font-extrabold text-foreground dark:text-dark-foreground mt-1">
              {totalQty}
            </Text>
          </View>
        </View> */}

        <View className="rounded-2xl border border-muted p-4 mb-3 bg-componentbg dark:bg-dark-componentbg gap-3">
          <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
            Datos de la solicitud
          </Text>

          <View>
            <Text className="text-md mb-1 text-mutedForeground dark:text-dark-mutedForeground">
              Obra
            </Text>
            <TextInput
              value={area}
              onChangeText={setArea}
              placeholder="Ej: Mantenimiento"
              placeholderTextColor="#9CA3AF"
              className="border border-muted rounded-xl px-3 py-3 bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground"
            />
          </View>

          <View>
            <Text className="text-md mb-1 text-mutedForeground dark:text-dark-mutedForeground">
              Partida
            </Text>
            <TextInput
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={1}
              textAlignVertical="top"
              placeholder="Detalle adicional para aprobación"
              placeholderTextColor="#9CA3AF"
              className="border border-muted rounded-xl px-3 py-3 bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground"
            />
          </View>
          <View>
            <Text className="text-md mb-1 text-mutedForeground dark:text-dark-mutedForeground">
              Dirección de entrega
            </Text>
            <TextInput
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Detalle adicional para aprobación"
              placeholderTextColor="#9CA3AF"
              className="border border-muted rounded-xl px-3 py-3 min-h-24 bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground"
            />
          </View>
          <View>
            <Text className="text-md mb-1 text-mutedForeground dark:text-dark-mutedForeground">
              Observaciones
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Detalle adicional para aprobación"
              placeholderTextColor="#9CA3AF"
              className="border border-muted rounded-xl px-3 py-3 min-h-24 bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground"
            />
          </View>

          <View>
            <Text className="text-md mb-2 text-mutedForeground dark:text-dark-mutedForeground">
              Prioridad
            </Text>
            <View className="flex-row gap-2">
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => setPriority(value)}
                  className={`px-4 py-2 rounded-full border ${
                    priority === value
                      ? "bg-primary border-primary"
                      : "border-muted"
                  }`}
                >
                  <Text
                    className={
                      priority === value
                        ? "text-white font-semibold"
                        : "text-foreground dark:text-dark-foreground"
                    }
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-md   mb-1 text-mutedForeground dark:text-dark-mutedForeground">
              Fecha requerida
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="border border-muted rounded-xl px-3 py-3 bg-background dark:bg-dark-background"
            >
              <Text className="text-foreground dark:text-dark-foreground">
                {requiredDate
                  ? requiredDate.toLocaleDateString()
                  : "Seleccionar fecha"}
              </Text>
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

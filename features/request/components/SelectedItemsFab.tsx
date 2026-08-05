import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import CustomImagen from "@/components/ui/CustomImagen";
import { useRequest } from "@/features/request/hooks/useRequest";
import { useSelectedItemsStore } from "@/features/request/stores/useSelectedItemsStore";
import type { VeneluxMaterial } from "@/features/request/types/request";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    Text,
    ToastAndroid,
    View,
} from "react-native";

export default function SelectedItemsFab() {
  const { materials } = useRequest({ autoFetchRequests: false });
  const selected = useSelectedItemsStore((s) => s.selected);
  const incByItem = useSelectedItemsStore((s) => s.incByItem);
  const decByItem = useSelectedItemsStore((s) => s.decByItem);
  const clear = useSelectedItemsStore((s) => s.clear);

  const [visible, setVisible] = useState(false);

  const items = useMemo(() => materials || [], [materials]);

  const keyOf = (it: VeneluxMaterial) =>
    String(it.codigo || it.codart || it.material);

  const getQuantityByItem = useSelectedItemsStore((s) => s.getQuantityByItem);

  // Items filtrados que realmente están en la bolsa
  const selectedEntries = useMemo(
    () => items.filter((it) => (selected[keyOf(it)] || 0) > 0),
    [items, selected],
  );

  const totalQty = Object.values(selected).reduce((a, b) => a + b, 0);
  const distinctCount = Object.keys(selected).length;

  const handleClear = () => {
    if (totalQty === 0) return;
    Alert.alert(
      "Vaciar bolsa",
      "¿Estás seguro de que quieres quitar todos los artículos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Vaciar",
          style: "destructive",
          onPress: () => {
            clear();
            setVisible(false);
            if (Platform.OS === "android") {
              ToastAndroid.showWithGravity(
                "Bolsa vaciada",
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <>
      {/* FAB - Botón Flotante de la Bolsa */}
      <Pressable
        className="absolute right-4 bottom-48 bg-primary rounded-full w-16 h-16 items-center justify-center shadow-2xl z-50"
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Ver bolsa, ${totalQty} unidades`}
        android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: true }}
      >
        <Ionicons name="bag" size={22} color="white" />
        {totalQty > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center">
            <Text className="text-white text-xs">{totalQty}</Text>
          </View>
        )}
      </Pressable>

      {/* Modal inferior de la Bolsa */}
      <BottomModal
        visible={visible}
        onClose={() => setVisible(false)}
        heightPercentage={0.85}
      >
        <View className="flex-1 px-2">
          {/* Header del Modal */}
          <View className="flex-row justify-between items-center pb-4 mb-2 border-b border-zinc-100 dark:border-zinc-800">
            <View>
              <Text className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Mi bolsa
              </Text>
              <Text className="text-xs text-neutral-400 mt-0.5">
                {distinctCount} {distinctCount === 1 ? "artículo" : "artículos"}{" "}
                · {totalQty} {totalQty === 1 ? "unidad" : "unidades"}
              </Text>
            </View>

            {totalQty > 0 && (
              <Pressable
                onPress={handleClear}
                className="w-10 h-10 items-center justify-center rounded-full active:bg-zinc-100"
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </Pressable>
            )}
          </View>

          {/* Contenido / Lista */}
          {selectedEntries.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="bag" size={48} color="#9CA3AF" />
              <Text className="text-neutral-400 font-medium mt-3 text-base">
                Tu bolsa está vacía
              </Text>
            </View>
          ) : (
            <CustomFlatList
              data={selectedEntries}
              keyExtractor={(it) => keyOf(it)}
              refreshing={false}
              canRefresh={false}
              handleRefresh={() => {}}
              contentContainerStyle={{ paddingBottom: 100 }} // Espacio para que el botón no tape el último item
              renderItem={({ item }) => {
                const itemQty = getQuantityByItem(item);
                return (
                  <View className="flex-row items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800">
                    {/* Detalles del Producto */}
                    <View className="flex-row items-center flex-1 pr-3">
                      <View className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/50">
                        <CustomImagen img={item.imagen1 ?? ""} />
                      </View>
                      <View className="ml-3 flex-1 justify-center">
                        <Text
                          className="text-sm font-semibold text-neutral-800 dark:text-neutral-100"
                          numberOfLines={1}
                        >
                          {item.material}
                        </Text>
                        <Text className="text-xs text-neutral-400 font-medium mt-0.5">
                          Cod: {item.codigo}
                        </Text>
                        <Text
                          className="text-xs text-neutral-500 mt-1"
                          numberOfLines={1}
                        >
                          {item.marca} {item.noparte ? `· ${item.noparte}` : ""}
                        </Text>
                      </View>
                    </View>

                    {/* Stepper de cantidad estilo "Shop" (Contenedor tipo píldora) */}
                    <View className="flex-row items-center bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 border border-neutral-200/40">
                      <Pressable
                        className="w-8 h-8 items-center justify-center rounded-full active:bg-neutral-200 dark:active:bg-neutral-700"
                        onPress={() => decByItem(item)}
                      >
                        {itemQty === 1 ? (
                          <Ionicons
                            name="trash-outline"
                            size={15}
                            color="#6B7280"
                          />
                        ) : (
                          <Ionicons
                            name="remove"
                            size={16}
                            color="#1F2937"
                            className="dark:text-white"
                          />
                        )}
                      </Pressable>

                      <Text className="w-8 text-center font-bold text-sm text-neutral-800 dark:text-neutral-100">
                        {itemQty}
                      </Text>

                      <Pressable
                        className="w-8 h-8 items-center justify-center rounded-full bg-white dark:bg-neutral-700 shadow-sm active:bg-neutral-100"
                        onPress={() => incByItem(item)}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color="#1F2937"
                          className="dark:text-white"
                        />
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* Botón de Acción Fijo Inferior */}
        <View className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 px-5 pb-6 pt-3 border-t border-neutral-100 dark:border-neutral-900">
          <Pressable
            disabled={totalQty === 0}
            className={`w-full h-14 rounded-xl flex-row items-center justify-center space-x-2 ${
              totalQty === 0
                ? "bg-neutral-200 dark:bg-neutral-800"
                : "bg-black dark:bg-white active:opacity-90"
            }`}
          >
            <Text
              className={`text-base font-bold ${totalQty === 0 ? "text-neutral-400" : "text-white dark:text-black"}`}
            >
              Agregar a la solicitud
            </Text>
            {totalQty > 0 && (
              <View className="bg-neutral-800 dark:bg-neutral-200 rounded-md px-1.5 py-0.5 ml-1">
                <Text className="text-white dark:text-black text-xs font-bold">
                  {totalQty}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </BottomModal>
    </>
  );
}

import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import CustomImagen from "@/components/ui/CustomImagen";
import NewManualItemModal from "@/features/request/components/NewManualItemModal";
import ProductDetail from "@/features/request/components/ProductDetail";
import { useRequest } from "@/features/request/hooks/useRequest";
import { useSelectedItemsStore } from "@/features/request/stores/useSelectedItemsStore";
import type { VeneluxMaterial } from "@/features/request/types/request";
import { appTheme } from "@/utils/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SelectedItemsFab() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const { materials } = useRequest({ autoFetchRequests: false });
  const selected = useSelectedItemsStore((s) => s.selected);
  const setSelected = useSelectedItemsStore((s) => s.setSelected);
  const customItems = useSelectedItemsStore((s) => s.customItems);
  const upsertCustomItem = useSelectedItemsStore((s) => s.upsertCustomItem);
  const incByItem = useSelectedItemsStore((s) => s.incByItem);
  const decByItem = useSelectedItemsStore((s) => s.decByItem);
  const clear = useSelectedItemsStore((s) => s.clear);

  const [visible, setVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<VeneluxMaterial | null>(null);
  const [newItemVisible, setNewItemVisible] = useState(false);

  const items = useMemo(() => materials || [], [materials]);

  const keyOf = (it: VeneluxMaterial) =>
    String(it.codigomaterial || it.codart || it.noparte);

  const getQuantityByItem = useSelectedItemsStore((s) => s.getQuantityByItem);

  const mergedItems = useMemo(() => {
    const base = items;
    const extras = Object.values(customItems).filter(
      (extra) => !base.some((it) => keyOf(it) === keyOf(extra)),
    );
    return [...base, ...extras];
  }, [customItems, items]);

  // Items filtrados que realmente están en la bolsa
  const selectedEntries = useMemo(
    () => mergedItems.filter((it) => (selected[keyOf(it)] || 0) > 0),
    [mergedItems, selected],
  );

  const totalQty = Object.values(selected).reduce((a, b) => a + b, 0);
  const distinctCount = Object.keys(selected).length;

  useEffect(() => {
    if (totalQty === 0 && visible) {
      setVisible(false);
      setDetailItem(null);
    }
  }, [totalQty, visible]);

  const handleCloseFloatingPanel = () => {
    setVisible(false);
    setDetailItem(null);
  };

  const handleCloseDetail = () => {
    setDetailItem(null);
  };

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

  const handleOpenSummary = () => {
    if (totalQty === 0) return;
    handleCloseFloatingPanel();
    router.push("/(main)/(tabs)/(request)/confirm");
  };

  const handleCloseNewItem = () => {
    setNewItemVisible(false);
  };

  const handleCreateManualItem = ({
    item,
    quantity,
  }: {
    item: VeneluxMaterial;
    quantity: number;
  }) => {
    upsertCustomItem(item);
    const k = keyOf(item);
    setSelected({ ...selected, [k]: quantity });
    setVisible(true);
    handleCloseNewItem();
  };

  const topOffset = Math.max(insets.top + 12, 16);
  const bottomOffset = Math.max(insets.bottom + 65, 12);
  const maxPanelHeight = Math.min(windowHeight - topOffset - bottomOffset, 900);

  return (
    <>
      {/* FAB - Botón Flotante de la Bolsa */}
      {totalQty > 0 && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(180)}
          className="absolute right-4 bottom-48 z-50"
        >
          <Pressable
            className="bg-primary rounded-full w-16 h-16 items-center justify-center shadow-2xl"
            onPress={() => setVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Ver bolsa, ${distinctCount} artículos`}
            android_ripple={{
              color: "rgba(255,255,255,0.08)",
              borderless: true,
            }}
          >
            <Ionicons name="bag" size={22} color="white" />
            <View className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs">{distinctCount}</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {visible && (
        <View
          style={StyleSheet.absoluteFill}
          className="z-50"
          pointerEvents="box-none"
        >
          <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFill}>
            <Pressable style={{ flex: 1 }} onPress={handleCloseFloatingPanel} />
          </BlurView>

          <Animated.View
            entering={FadeInDown.duration(220)}
            exiting={FadeOutDown.duration(180)}
            className="absolute left-0 right-0 bottom-20 rounded-3xl overflow-hidden border border-neutral-200/70 dark:border-neutral-800/80 bg-componentbg dark:bg-dark-componentbg"
            style={{
              top: topOffset,
              bottom: bottomOffset,
              maxHeight: maxPanelHeight,
            }}
          >
            <View className="flex-1">
              <View className="flex-row justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800 px-3 pt-3">
                <View className="flex-col  ">
                  <Text className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                    Resumen
                  </Text>
                  <Text className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                    {distinctCount} artículos
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  <Pressable
                    onPress={() => setNewItemVisible(true)}
                    className="h-10 px-3 flex-row items-center justify-center rounded-full bg-primary/15 dark:bg-dark-primary/20"
                  >
                    <Ionicons
                      name="add"
                      size={22}
                      color={appTheme.primary.DEFAULT}
                    />
                    <Text className="ml-1 text-xs font-semibold text-primary dark:text-dark-primary">
                      Nuevo material
                    </Text>
                  </Pressable>

                  {totalQty > 0 && (
                    <Pressable
                      onPress={handleClear}
                      className="w-10 h-10 items-center justify-center rounded-full active:bg-zinc-100 bg-red-300/20 dark:bg-red-600/20"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#EF4444"
                      />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={handleCloseFloatingPanel}
                    className="w-10 h-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </Pressable>
                </View>
              </View>

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
                  contentContainerStyle={{ paddingBottom: 100 }}
                  renderItem={({ item }) => {
                    const itemQty = getQuantityByItem(item);
                    return (
                      <View className="flex-row items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 bg-componentbg dark:bg-dark-componentbg rounded-3xl px-3 mb-2">
                        <Pressable
                          onPress={() => setDetailItem(item)}
                          className="flex-row items-center flex-1 pr-3"
                        >
                          <View className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/50">
                            <CustomImagen img={item.imagen1 ?? ""} />
                          </View>
                          <View className="ml-3 flex-1 justify-center">
                            <Text
                              className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                              numberOfLines={2}
                            >
                              {item.codigomaterial} - {item.material}
                            </Text>
                            <Text className="text-sm text-neutral-800 font-medium mt-0.5">
                              {item.linea} · {item.sublinea}
                            </Text>
                            <Text
                              className="text-[13px] text-neutral-600 mt-1"
                              numberOfLines={1}
                            >
                              {item.marca}{" "}
                              {item.noparte ? `· ${item.noparte}` : ""}
                            </Text>
                          </View>
                        </Pressable>
                        <View className="flex-col items-center rounded-full">
                          <View className="p-2 items-center justify-center">
                            <Text className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                              {item.unidad}
                            </Text>
                          </View>

                          <View className="flex-row items-center bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 border border-neutral-200/40">
                            <Pressable
                              className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-200 dark:active:bg-neutral-700"
                              onPress={() => decByItem(item)}
                            >
                              {itemQty === 1 ? (
                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color="#6B7280"
                                />
                              ) : (
                                <Ionicons
                                  name="remove"
                                  size={18}
                                  color="#1F2937"
                                  className="dark:text-white"
                                />
                              )}
                            </Pressable>

                            <Text className="w-8 text-center font-bold text-sm text-neutral-800 dark:text-neutral-100">
                              {itemQty}
                            </Text>

                            <Pressable
                              className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-neutral-700 shadow-sm active:bg-neutral-100"
                              onPress={() => incByItem(item)}
                            >
                              <Ionicons
                                name="add"
                                size={18}
                                color="#1F2937"
                                className="dark:text-white"
                              />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>

            <View className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 px-5 pb-6 pt-3 border-t border-neutral-100 dark:border-neutral-900">
              <Pressable
                disabled={totalQty === 0}
                onPress={handleOpenSummary}
                className={`w-full h-14 rounded-full flex-row items-center justify-center space-x-2 ${
                  totalQty === 0
                    ? "bg-neutral-200 dark:bg-neutral-800"
                    : "bg-primary dark:bg-white active:opacity-90"
                }`}
              >
                <Text
                  className={`text-lg font-bold ${totalQty === 0 ? "text-neutral-400" : "text-white dark:text-black"}`}
                >
                  Confirmar solicitud de materiales
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      <BottomModal
        visible={Boolean(detailItem)}
        onClose={handleCloseDetail}
        heightPercentage={0.8}
      >
        {detailItem ? (
          <ProductDetail item={detailItem} onClose={handleCloseDetail} />
        ) : null}
      </BottomModal>

      <NewManualItemModal
        visible={newItemVisible}
        onClose={handleCloseNewItem}
        onSubmit={handleCreateManualItem}
      />
    </>
  );
}

import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import SelectedItemsFab from "@/features/request/components/SelectedItemsFab";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import SelectableItemCard from "../components/SelectableItemCard";
import { useRequest } from "../hooks/useRequest";
import { useSelectedItemsStore } from "../stores/useSelectedItemsStore";
import type { RequestItem } from "../types/request";
import ProductDetailScreen from "./ProductDetailScreen";

export default function CreateRequestScreen() {
  const { requests, createRequest } = useRequest();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<RequestItem | null>(null);
  const selected = useSelectedItemsStore((s) => s.selected);
  const incByItem = useSelectedItemsStore((s) => s.incByItem);
  const decByItem = useSelectedItemsStore((s) => s.decByItem);
  const getQuantityByItem = useSelectedItemsStore((s) => s.getQuantityByItem);
  const clearSelected = useSelectedItemsStore((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(() => {
    const map = new Map<string, RequestItem>();
    (requests || []).forEach((r) => {
      r.items.forEach((it) => {
        const key = it.codart;
        if (!map.has(key)) map.set(key, it);
      });
    });
    return Array.from(map.values());
  }, [requests]);

  const keyOf = (it: RequestItem) => it.codart;

  const inc = (it: RequestItem) => {
    incByItem(it);
  };
  const dec = (it: RequestItem) => {
    decByItem(it);
  };

  const totalQty = Object.values(selected).reduce((a, b) => a + b, 0);
  const distinctCount = Object.keys(selected).length;

  const handleCreate = async () => {
    if (totalQty === 0) return Alert.alert("Selecciona al menos un item");
    const payloadItems = items
      .filter((it) => getQuantityByItem(it) > 0)
      .map((it) => ({
        description: it.description,
        quantity: getQuantityByItem(it),
        codart: it.codart,
        marca: it.marca,
        noparte: it.noparte,
        imagen1: it.imagen1,
      }));

    try {
      setSubmitting(true);
      await createRequest({
        title: `Solicitud - ${new Date().toLocaleString()}`,
        description: "Creada desde selector",
        items: payloadItems,
      });
      Alert.alert("Éxito", "Solicitud creada correctamente");
      clearSelected();
    } catch (err) {
      Alert.alert("Error", "No se pudo crear la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenSearchLayout
      searchText={"searchText"}
      setSearchText={() => {}}
      placeholder="Código o descripción..."
      headerVisible={true}
      extrafilter={true}
      //   extraFiltersComponent={
      //     loading ? (
      //       <>
      //         <View className="flex-row gap-3 items-center w-full ">
      //           <View className=" bg-gray-300 dark:bg-gray-700  items-center px-14 py-5 rounded-full  animate-pulse "></View>
      //           <View className=" bg-gray-300 dark:bg-gray-700  items-center px-14 py-5 rounded-full  animate-pulse "></View>
      //           <View className=" bg-gray-300 dark:bg-gray-700  items-center px-14 py-5 rounded-full  animate-pulse "></View>
      //         </View>
      //       </>
      //     ) : (
      //       extraFilters
      //     )
      //   }
      onFilterPress={() => true}
    >
      <CustomFlatList
        data={items}
        keyExtractor={(item) => keyOf(item)}
        renderItem={({ item }) => (
          <SelectableItemCard
            item={item}
            selected={getQuantityByItem(item)}
            onInc={() => inc(item)}
            onDec={() => dec(item)}
            onPress={() => {
              setModalItem(item);
              setModalVisible(true);
            }}
          />
        )}
        refreshing={false}
        canRefresh={false}
        handleRefresh={() => {}}
        title="105 items disponibles"
        subtitle=""
        numColumns={2}
      />

      <View className="absolute left-3 right-3 bottom-4 bg-white rounded-xl p-3 flex-row items-center justify-between shadow-lg">
        <View>
          <Text className="font-bold text-foreground">
            {distinctCount} artículos
          </Text>
          <Text className="text-xs text-mutedForeground">
            {totalQty} unidades seleccionadas
          </Text>
        </View>

        <Pressable
          onPress={handleCreate}
          className="bg-primary px-4 py-2 rounded-md"
        >
          <Text className="text-white font-bold">
            {submitting ? "Enviando..." : "Crear solicitud"}
          </Text>
        </Pressable>
      </View>

      {modalItem && (
        <BottomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          heightPercentage={0.9}
        >
          <ProductDetailScreen
            item={modalItem}
            onClose={() => setModalVisible(false)}
          />
        </BottomModal>
      )}
      <SelectedItemsFab />
    </ScreenSearchLayout>
  );
}

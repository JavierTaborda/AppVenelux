import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import SelectedItemsFab from "@/features/request/components/SelectedItemsFab";
import { useMemo, useState } from "react";
import { Alert } from "react-native";
import SelectableItemCard from "../components/SelectableItemCard";
import { useRequest } from "../hooks/useRequest";
import { useSelectedItemsStore } from "../stores/useSelectedItemsStore";
import type { VeneluxMaterial } from "../types/request";
import ProductDetailScreen from "./ProductDetailScreen";

export default function CreateRequestScreen() {
  const { materials } = useRequest({ autoFetchRequests: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<VeneluxMaterial | null>(null);
  const selected = useSelectedItemsStore((s) => s.selected);
  const incByItem = useSelectedItemsStore((s) => s.incByItem);
  const decByItem = useSelectedItemsStore((s) => s.decByItem);
  const getQuantityByItem = useSelectedItemsStore((s) => s.getQuantityByItem);
  const clearSelected = useSelectedItemsStore((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(() => materials, [materials]);

  const keyOf = (it: VeneluxMaterial) => it.codigo;

  const inc = (it: VeneluxMaterial) => {
    incByItem(it);
  };
  const dec = (it: VeneluxMaterial) => {
    decByItem(it);
  };

  const totalQty = Object.values(selected).reduce((a, b) => a + b, 0);
  const distinctCount = Object.keys(selected).length;

  const handleCreate = async () => {
    if (totalQty === 0) return Alert.alert("Selecciona al menos un item");
    setSubmitting(true);
    clearSelected();
    Alert.alert(
      "Listo",
      "Selección guardada localmente. La creación de request está deshabilitada por ahora.",
    );
    setSubmitting(false);
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
      //   }i
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
        title={`${items.length} `}
        subtitle={`Materiales disponibles`}
        numColumns={1}
        //estimatedItemSize={170}
        //onEndReached={loadMoreMaterials}
        // contentContainerStyle={{ paddingBottom: 210 }}
      />

      {modalItem && (
        <BottomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          heightPercentage={0.8}
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

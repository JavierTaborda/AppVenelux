import ScreenSearchLayout from "@/components/screens/ScreenSearchLayout";
import BottomModal from "@/components/ui/BottomModal";
import CustomFlatList from "@/components/ui/CustomFlatList";
import RequestMaterialsFilterModal, {
  type RequestMaterialFilters,
} from "@/features/request/components/RequestMaterialsFilterModal";
import SelectedItemsFab from "@/features/request/components/SelectedItemsFab";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import SelectableItemCard from "../components/SelectableItemCard";
import { useRequest } from "../hooks/useRequest";
import { useSelectedItemsStore } from "../stores/useSelectedItemsStore";
import type { VeneluxMaterial } from "../types/request";
import { exportMaterialsCsv } from "../utils/materialsCsv";
import ProductDetailScreen from "./ProductDetailScreen";

const MATERIAL_SKELETON_ITEMS = Array.from(
  { length: 8 },
  (_, i) => `material-skeleton-${i}`,
);

function MaterialSkeletonCard() {
  return (
    <View className="mx-3 mb-2 overflow-hidden rounded-3xl border border-zinc-200/70 bg-componentbg dark:bg-dark-componentbg p-5">
      <View className="flex-row gap-3">
        <View className="h-24 w-24 rounded-2xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <View className="flex-1 gap-2">
          <View className="h-4 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <View className="h-3 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <View className="h-3 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <View className="h-3 w-1/3 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </View>
      </View>
    </View>
  );
}

export default function CreateRequestScreen() {
  const { materials, searchText, setSearchText, loading } = useRequest({
    autoFetchRequests: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItem, setModalItem] = useState<VeneluxMaterial | null>(null);
  const selected = useSelectedItemsStore((s) => s.selected);
  const incByItem = useSelectedItemsStore((s) => s.incByItem);
  const decByItem = useSelectedItemsStore((s) => s.decByItem);
  const getQuantityByItem = useSelectedItemsStore((s) => s.getQuantityByItem);
  const clearSelected = useSelectedItemsStore((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [materialFilters, setMaterialFilters] =
    useState<RequestMaterialFilters>({});

  const items = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return materials.filter((item) => {
      if (materialFilters.linea && item.linea !== materialFilters.linea) {
        return false;
      }
      if (
        materialFilters.sublinea &&
        item.sublinea !== materialFilters.sublinea
      ) {
        return false;
      }
      if (
        materialFilters.categoria &&
        item.categoria !== materialFilters.categoria
      ) {
        return false;
      }

      if (!term) return true;
      const searchable = [
        item.codigo,
        item.material,
        item.noparte,
        item.nroparte,
        item.codbarra,
      ];
      return searchable.some((value) => value?.toLowerCase().includes(term));
    });
  }, [
    materialFilters.categoria,
    materialFilters.linea,
    materialFilters.sublinea,
    materials,
    searchText,
  ]);

  const filterCount = useMemo(
    () =>
      [
        materialFilters.linea,
        materialFilters.sublinea,
        materialFilters.categoria,
      ].filter(Boolean).length,
    [
      materialFilters.categoria,
      materialFilters.linea,
      materialFilters.sublinea,
    ],
  );

  const keyOf = (it: VeneluxMaterial, index: number) => {
    const code = it.codigo?.trim() || "sin-codigo";
    const part = (it.noparte ?? it.nroparte ?? "sin-parte").trim();
    const codart = it.codart != null ? String(it.codart) : "sin-codart";
    return `${code}-${codart}-${part}-${index}`;
  };

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

  const handleExportCsv = async () => {
    if (materials.length === 0) {
      Alert.alert("Sin datos", "No hay materiales para exportar.");
      return;
    }

    setExporting(true);
    try {
      const result = await exportMaterialsCsv(materials);
      Alert.alert(
        "Exportacion completada",
        `Se exportaron ${materials.length} materiales.\nArchivo: ${result}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo exportar la data";
      Alert.alert("Error al exportar", message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenSearchLayout
      searchText={searchText}
      setSearchText={setSearchText}
      placeholder="Código o descripción..."
      headerVisible={true}
      extrafilter={false}
      filterCount={filterCount}
      showfilterButton={true}
      extraFiltersComponent={
        <>
          <View className="flex-row items-center gap-2">
            {filterCount > 0 && (
              <Pressable
                onPress={() => setMaterialFilters({})}
                className="rounded-full border border-primary px-3 py-2.5"
              >
                <Text className="text-xs text-primary font-semibold">
                  Limpiar filtros
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleExportCsv}
              disabled={exporting || loading || materials.length === 0}
              className="bg-primary dark:bg-dark-primary rounded-full px-4 py-2"
            >
              <Text className="text-white font-semibold text-sm">
                {exporting ? "Exportando..." : "Exportar Excel (CSV)"}
              </Text>
            </Pressable>
          </View>
        </>
      }
      onFilterPress={() => setFiltersVisible(true)}
    >
      {loading && items.length === 0 ? (
        <CustomFlatList
          data={MATERIAL_SKELETON_ITEMS}
          keyExtractor={(item) => item}
          renderItem={() => <MaterialSkeletonCard />}
          refreshing={false}
          canRefresh={false}
          handleRefresh={() => {}}
          title={"Cargando"}
          subtitle={"Materiales disponibles"}
          numColumns={1}
          estimatedItemSize={170}
          contentContainerStyle={{ paddingBottom: 210 }}
        />
      ) : (
        <CustomFlatList
          data={items}
          keyExtractor={(item, index) => keyOf(item, index)}
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
          subtitle={"Materiales disponibles"}
          numColumns={1}
          estimatedItemSize={170}
          //onEndReached={loadMoreMaterials}
          contentContainerStyle={{ paddingBottom: 210 }}
        />
      )}

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

      <RequestMaterialsFilterModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        materials={materials}
        filters={materialFilters}
        onApply={setMaterialFilters}
      />
    </ScreenSearchLayout>
  );
}

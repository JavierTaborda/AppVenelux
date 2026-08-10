import FilterModal from "@/components/ui/FilterModal";
import ScrollSelect from "@/components/ui/ScrollSelect";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { VeneluxMaterial } from "../types/request";

export type RequestMaterialFilters = {
  linea?: string;
  sublinea?: string;
  categoria?: string;
};

interface RequestMaterialsFilterModalProps {
  visible: boolean;
  onClose: () => void;
  materials: VeneluxMaterial[];
  filters: RequestMaterialFilters;
  onApply: (newFilters: RequestMaterialFilters) => void;
}

const normalize = (value: string | null | undefined) => value?.trim() ?? "";

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );

export default function RequestMaterialsFilterModal({
  visible,
  onClose,
  materials,
  filters,
  onApply,
}: RequestMaterialsFilterModalProps) {
  const [linea, setLinea] = useState<string | undefined>(filters.linea);
  const [sublinea, setSublinea] = useState<string | undefined>(
    filters.sublinea,
  );
  const [categoria, setCategoria] = useState<string | undefined>(
    filters.categoria,
  );

  useEffect(() => {
    if (!visible) return;
    setLinea(filters.linea);
    setSublinea(filters.sublinea);
    setCategoria(filters.categoria);
  }, [filters.categoria, filters.linea, filters.sublinea, visible]);

  const lineas = useMemo(
    () => uniqueSorted(materials.map((item) => normalize(item.linea))),
    [materials],
  );

  const sublineas = useMemo(() => {
    const source = linea
      ? materials.filter((item) => normalize(item.linea) === linea)
      : materials;
    return uniqueSorted(source.map((item) => normalize(item.sublinea)));
  }, [linea, materials]);

  const categorias = useMemo(() => {
    const source = materials.filter((item) => {
      if (linea && normalize(item.linea) !== linea) return false;
      if (sublinea && normalize(item.sublinea) !== sublinea) return false;
      return true;
    });
    return uniqueSorted(source.map((item) => normalize(item.categoria)));
  }, [linea, materials, sublinea]);

  useEffect(() => {
    if (sublinea && !sublineas.includes(sublinea)) {
      setSublinea(undefined);
    }
  }, [sublinea, sublineas]);

  useEffect(() => {
    if (categoria && !categorias.includes(categoria)) {
      setCategoria(undefined);
    }
  }, [categoria, categorias]);

  const activeCount = [linea, sublinea, categoria].filter(Boolean).length;

  return (
    <FilterModal
      visible={visible}
      onClose={onClose}
      onApply={() => {
        onApply({ linea, sublinea, categoria });
        onClose();
      }}
      onClean={() => {
        setLinea(undefined);
        setSublinea(undefined);
        setCategoria(undefined);
      }}
      title="Filtrar materiales"
    >
      <ScrollView
        showsVerticalScrollIndicator
        className="bg-background dark:bg-dark-background px-4"
      >
        <View className="gap-2 pb-2">
          <Text className="text-sm text-mutedForeground dark:text-dark-mutedForeground">
            {activeCount > 0
              ? `${activeCount} filtro${activeCount > 1 ? "s" : ""} activo${activeCount > 1 ? "s" : ""}`
              : "Selecciona filtros para acotar materiales"}
          </Text>

          <ScrollSelect
            label="Linea"
            selectedValue={linea}
            options={lineas}
            onSelect={setLinea}
          />
          {!!linea && (
            <Pressable
              onPress={() => setLinea(undefined)}
              className="self-start px-2 py-1"
            >
              <Text className="text-primary text-sm">Limpiar linea</Text>
            </Pressable>
          )}

          <ScrollSelect
            label="Sublinea"
            selectedValue={sublinea}
            options={sublineas}
            onSelect={setSublinea}
          />
          {!!sublinea && (
            <Pressable
              onPress={() => setSublinea(undefined)}
              className="self-start px-2 py-1"
            >
              <Text className="text-primary text-sm">Limpiar sublinea</Text>
            </Pressable>
          )}

          <ScrollSelect
            label="Categoria"
            selectedValue={categoria}
            options={categorias}
            onSelect={setCategoria}
          />
          {!!categoria && (
            <Pressable
              onPress={() => setCategoria(undefined)}
              className="self-start px-2 py-1"
            >
              <Text className="text-primary text-sm">Limpiar categoria</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </FilterModal>
  );
}

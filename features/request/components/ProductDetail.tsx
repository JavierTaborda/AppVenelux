import CustomImagen from "@/components/ui/CustomImagen";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRequest } from "../hooks/useRequest";
import { useSelectedItemsStore } from "../stores/useSelectedItemsStore";
import type { VeneluxMaterial } from "../types/request";

interface Props {
  productId?: string;
  item?: VeneluxMaterial;
  onClose?: () => void;
}

export default function ProductDetail({ productId, item, onClose }: Props) {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [qty, setQty] = useState(1);

  const id =
    (productId as string | undefined) ||
    (params?.id as string | undefined) ||
    "req_004";

  const { requests } = useRequest();

  const selectedMap = useSelectedItemsStore((s) => s.selected);
  const setSelected = useSelectedItemsStore((s) => s.setSelected);
  const getQuantityByItem = useSelectedItemsStore((s) => s.getQuantityByItem);
  const removeByItem = useSelectedItemsStore((s) => s.removeByItem);

  const found =
    item ||
    (id
      ? requests
          .flatMap((r) => r.items)
          .find((it) => it.codigo === decodeURIComponent(id))
      : undefined);

  const productLabel =
    found?.material ??
    (found as { description?: string; descripcion?: string } | undefined)
      ?.description ??
    (found as { description?: string; descripcion?: string } | undefined)
      ?.descripcion ??
    "";

  useEffect(() => {
    if (found) {
      const stored = getQuantityByItem(found); // returns 0 if not selected
      const initial = Math.max(0, stored ?? 0);
      setQty(initial);
    }
  }, [found, getQuantityByItem]);

  if (!found) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-white">
        <Text className="text-lg font-semibold text-black">
          No se encontró el producto
        </Text>

        <Pressable
          onPress={() => (onClose ? onClose() : router.back())}
          className="mt-5 bg-black px-5 py-3 rounded-2xl"
        >
          <Text className="text-white font-semibold">Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 }}
      >
        {/* IMAGE */}
        <View className="w-full h-[200px] bg-componentbg dark:bg-bgimages items-center justify-center rounded-b-[40px] overflow-hidden">
          <CustomImagen img={found.imagen1 ?? ""} content="contain" />
        </View>

        {/* CONTENT */}
        <View className="px-1 mt-1">
          {/* TITLE + ACTIONS */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-extrabold text-foreground dark:text-dark-foreground mt-1 leading-6">
                {found.codigo} - {productLabel}
              </Text>
            </View>
          </View>

          {/* INFO CARD */}
          <View className="bg-componentbg dark:bg-dark-componentbg rounded-3xl px-4 py-2 mt-1">
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
              Detalles
            </Text>
            <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1 py-2.5 border-b border-zinc-100">
              <Text className="text-zinc-500">Unidad</Text>
              <Text className="min-w-[140px] flex-1 text-right font-semibold text-foreground dark:text-dark-foreground">
                {found.unidad}
              </Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1 py-2.5 border-b border-zinc-100">
              <Text className="text-zinc-500">Línea</Text>
              <Text className="min-w-[140px] flex-1 text-right font-semibold text-foreground dark:text-dark-foreground">
                {found.linea}
              </Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1 py-2.5 border-b border-zinc-100">
              <Text className="text-zinc-500">Sublínea</Text>
              <Text className="min-w-[140px] flex-1 text-right font-semibold text-foreground dark:text-dark-foreground">
                {found.sublinea}
              </Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1 py-2.5 border-b border-zinc-100">
              <Text className="text-zinc-500">Marca</Text>
              <Text className="min-w-[140px] flex-1 text-right font-semibold text-foreground dark:text-dark-foreground">
                {found.marca}
              </Text>
            </View>
            <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1 py-2.5 border-b border-zinc-100">
              <Text className="text-zinc-500">No. de Parte</Text>
              <Text className="min-w-[140px] flex-1 text-right font-semibold text-foreground dark:text-dark-foreground">
                {found.noparte}
              </Text>
            </View>

            {/* <View className="flex-row justify-between py-2.5 border-b border-zinc-100">
              <Text className="text-zinc-500">Categoría</Text>
              <Text className="font-semibold text-foreground dark:text-dark-foreground">
                {found.categoria}
              </Text>
            </View> */}

            <View className="flex-row flex-wrap justify-between gap-x-3 gap-y-1 py-2.5">
              <Text className="text-zinc-500">Disponibles</Text>
              <Text className="min-w-[140px] flex-1 text-right font-semibold text-foreground dark:text-dark-foreground">
                -
              </Text>
            </View>
          </View>

          {/* QTY */}
          <View className="mt-2">
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground mb-1">
              Cantidad
            </Text>

            <View className="flex-row flex-wrap items-center gap-3">
              <View className="flex-row items-center self-start bg-componentbg dark:bg-dark-componentbg rounded-2xl px-2 py-2">
                <Pressable
                  onPress={() => setQty((q) => Math.max(0, q - 1))}
                  className="w-10 h-10 rounded-xl bg-zinc-100 items-center justify-center"
                  accessibilityLabel="Disminuir cantidad"
                  accessibilityRole="button"
                >
                  <Text className="text-xl font-bold">−</Text>
                </Pressable>

                <TextInput
                  value={String(qty)}
                  onChangeText={(text) => {
                    const onlyDigits = text.replace(/[^0-9]/g, "");
                    const nextQty = onlyDigits === "" ? 0 : Number(onlyDigits);
                    setQty(Math.max(0, nextQty));
                  }}
                  keyboardType="number-pad"
                  textAlign="center"
                  className="mx-3 min-w-[64px] pb-1 text-2xl font-bold text-foreground dark:text-dark-foreground"
                  accessibilityLabel="Cantidad"
                />

                <Pressable
                  onPress={() => setQty((q) => q + 1)}
                  className="w-10 h-10 rounded-xl bg-secondary dark:bg-dark-secondary items-center justify-center"
                >
                  <Text className="text-xl font-bold text-white">+</Text>
                </Pressable>

                <View className="ml-3">
                  <Text className="text-sm text-zinc-500 dark:text-dark-foreground">
                    {found.coduni}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-componentbg dark:bg-dark-componentbg rounded-2xl px-2 py-2">
                <Pressable
                  onPress={() => {
                    if (qty === 0) return; // nothing to remove
                    Alert.alert(
                      "Eliminar selección",
                      "¿Eliminar este producto de la selección?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => {
                            if (!found) return;
                            removeByItem(found);
                            setQty(0);
                          },
                        },
                      ],
                    );
                  }}
                  disabled={qty === 0}
                  className={
                    qty === 0
                      ? "p-2 rounded-lg bg-gray-100 items-center justify-center"
                      : "p-2 rounded-lg bg-red-50 items-center justify-center"
                  }
                  accessibilityLabel="Eliminar este producto de la selección"
                  accessibilityRole="button"
                >
                  <FontAwesome5
                    name="trash"
                    size={18}
                    color={qty === 0 ? "#9CA3AF" : "red"}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM CTA */}
      <View className="absolute bottom-10 left-0 right-0 px-5 pb-8 pt-4">
        <Pressable
          className={
            qty === 0
              ? "bg-gray-300 dark:bg-gray-500 rounded-3xl items-center justify-center px-4 py-3"
              : "bg-secondary dark:bg-dark-secondary rounded-3xl items-center justify-center px-4 py-3"
          }
          style={{ minHeight: 64 }}
          onPress={() => {
            if (!found) return;
            if (qty === 0) return; // disabled
            const k = String(found.codigo || found.codart || productLabel);
            const next = { ...selectedMap } as Record<string, number>;
            const capped = Math.max(qty, 0);
            if (capped <= 0) delete next[k];
            else next[k] = capped;
            setSelected(next);
            if (onClose) onClose();
            else router.back();
          }}
          disabled={qty === 0}
        >
          <Text
            className={
              qty === 0
                ? "text-gray-600 text-lg font-bold text-center"
                : "text-white text-lg font-bold text-center"
            }
          >
            Agregar a la solicitud
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

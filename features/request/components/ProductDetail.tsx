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

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value?: string | number | null;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row flex-wrap justify-between gap-x-2 gap-y-1 py-2.5 ${
        isLast ? "" : "border-b border-zinc-100 dark:border-zinc-800"
      }`}
    >
      <Text className="text-md text-zinc-500 dark:text-zinc-400">{label}</Text>
      <Text className="min-w-[140px] flex-1 text-right text-sm font-semibold text-foreground dark:text-dark-foreground">
        {value || "-"}
      </Text>
    </View>
  );
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
          .find((it) => it.codigomaterial === decodeURIComponent(id))
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
    <View className="flex-1 bg-background dark:bg-dark-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 180 }}
      >
        {/* IMAGE */}
        <View className="w-full h-[190px] bg-componentbg dark:bg-bgimages items-center justify-center rounded-b-[40px] overflow-hidden">
          <CustomImagen img={found.imagen1 ?? ""} content="contain" />
        </View>

        {/* CONTENT */}
        <View className="px-2 mt-1">
          {/* TITLE + ACTIONS */}
          <View className="mb-2">
            <Text className="text-xl font-extrabold text-foreground dark:text-dark-foreground leading-6">
              {found.codigomaterial} - {productLabel}
            </Text>
          </View>

          {/* INFO CARD */}
          <View className="bg-componentbg dark:bg-dark-componentbg rounded-3xl px-4 py-3 border border-zinc-100 dark:border-zinc-800">
            <Text className="text-base font-extrabold text-foreground dark:text-dark-foreground mb-1">
              Detalles
            </Text>
            <DetailRow label="Unidad" value={found.unidad} />
            <DetailRow label="Línea" value={found.linea} />
            <DetailRow label="Sublínea" value={found.sublinea} />
            <DetailRow label="Marca" value={found.marca} />
            <DetailRow label="No. de Parte" value={found.noparte} />
            <DetailRow label="Disponibles" value="-" isLast />
          </View>

          {/* QTY */}
          <View className="mt-3 rounded-3xl bg-componentbg dark:bg-dark-componentbg border border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-base font-extrabold text-foreground dark:text-dark-foreground">
                  Cantidad
                </Text>
              </View>

              <Text className="text-md font-bold text-zinc-600 dark:text-zinc-300">
                {found.coduni}
              </Text>
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row flex-1 items-center justify-between bg-background dark:bg-dark-background rounded-2xl px-2 py-2 border border-zinc-100 dark:border-zinc-800">
                <Pressable
                  onPress={() => setQty((q) => Math.max(0, q - 1))}
                  className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center"
                  accessibilityLabel="Disminuir cantidad"
                  accessibilityRole="button"
                >
                  <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
                    −
                  </Text>
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
                  className="mx-3 min-w-[72px] pb-1 text-3xl font-extrabold text-foreground dark:text-dark-foreground"
                  accessibilityLabel="Cantidad"
                />

                <Pressable
                  onPress={() => setQty((q) => q + 1)}
                  className="w-11 h-11 rounded-xl bg-secondary dark:bg-dark-secondary items-center justify-center"
                >
                  <Text className="text-xl font-bold text-white">+</Text>
                </Pressable>
              </View>

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
                    ? "w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 items-center justify-center"
                    : "w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 items-center justify-center"
                }
                accessibilityLabel="Eliminar este producto de la selección"
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="trash"
                  size={18}
                  color={qty === 0 ? "#9CA3AF" : "#DC2626"}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 dark:bg-dark-background/95 px-5 pb-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <Pressable
          className={
            qty === 0
              ? "bg-gray-300 dark:bg-gray-500 rounded-2xl items-center justify-center px-4 py-3"
              : "bg-secondary dark:bg-dark-secondary rounded-2xl items-center justify-center px-4 py-3"
          }
          style={{ minHeight: 64 }}
          onPress={() => {
            if (!found) return;
            if (qty === 0) return; // disabled
            const k = String(
              found.codigomaterial || found.codart || productLabel,
            );
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

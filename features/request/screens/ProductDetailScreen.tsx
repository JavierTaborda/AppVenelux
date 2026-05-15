import CustomImagen from "@/components/ui/CustomImagen";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useRequest } from "../hooks/useRequest";
import type { RequestItem } from "../types/request";

interface Props {
  productId?: string;
  item?: RequestItem;
  onClose?: () => void;
}

export default function ProductDetailScreen({
  productId,
  item,
  onClose,
}: Props) {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [qty, setQty] = useState(1);

  const id =
    (productId as string | undefined) ||
    (params?.id as string | undefined) ||
    "req_004";

  const { requests } = useRequest();

  const found =
    item ||
    (id
      ? requests
          .flatMap((r) => r.items)
          .find(
            (it) => (it.codart || it.description) === decodeURIComponent(id),
          )
      : undefined);

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
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* IMAGE */}
        <View className="w-full h-[240px] bg-componentbg dark:bg-dark-componentbg items-center justify-center rounded-b-[40px] overflow-hidden">
          <CustomImagen img={found.imagen1} content="contain" />
        </View>

        {/* CONTENT */}
        <View className="px-5 mt-4">
          {/* BRAND */}
          <Text className="text-sm text-zinc-500 uppercase tracking-widest">
            {found.marca}
          </Text>

          {/* TITLE */}
          <Text className="text-2xl font-extrabold text-foreground dark:text-dark-foreground mt-1 leading-9">
            {found.description}
          </Text>

          {/* PART NUMBER */}
          <Text className="text-base text-zinc-500 mt-3">
            Parte #{found.noparte}
          </Text>

          {/* PRICE */}
          {/* 
          <View className="mt-6 flex-row items-end">
            <Text className="text-4xl font-black text-foreground dark:text-dark-foreground">
              $ 1,299
            </Text>

            <Text className="ml-2 text-zinc-400 mb-1">$</Text>
          </View> */}

          {/* INFO CARD */}
          <View className="bg-white rounded-3xl p-5 mt-6">
            <Text className="text-lg font-bold text-black mb-4">Detalles</Text>

            <View className="flex-row justify-between py-3 border-b border-zinc-100">
              <Text className="text-zinc-400">Código</Text>
              <Text className="font-semibold text-black">{found.codart}</Text>
            </View>

            <View className="flex-row justify-between py-3 border-b border-zinc-100">
              <Text className="text-zinc-500">Marca</Text>
              <Text className="font-semibold text-black">{found.marca}</Text>
            </View>

            <View className="flex-row justify-between py-3">
              <Text className="text-zinc-500">Disponibles</Text>
              <Text className="font-semibold text-black">
                {found.quantity ?? "-"}
              </Text>
            </View>
          </View>

          {/* QTY */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-black mb-3">Cantidad</Text>

            <View className="flex-row items-center self-start bg-white rounded-2xl px-2 py-2">
              <Pressable
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-zinc-100 items-center justify-center"
              >
                <Text className="text-xl font-bold">−</Text>
              </Pressable>

              <Text className="mx-6 text-lg font-bold">{qty}</Text>

              <Pressable
                onPress={() => setQty((q) => q + 1)}
                className="w-10 h-10 rounded-xl bg-black items-center justify-center"
              >
                <Text className="text-xl font-bold text-white">+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-white border-t border-zinc-200">
        <Pressable
          className="bg-black rounded-3xl h-16 items-center justify-center"
          onPress={() => {
            console.log("Agregar al carrito");
          }}
        >
          <Text className="text-white text-lg font-bold">
            Agregar al carrito
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

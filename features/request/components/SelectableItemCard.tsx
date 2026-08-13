import CustomImagen from "@/components/ui/CustomImagen";
import { Pressable, Text, View } from "react-native";
import type { VeneluxMaterial } from "../types/request";

type Props = {
  item: VeneluxMaterial;
  selected?: number;
  onInc: () => void;
  onDec: () => void;
  onPress?: () => void;
};

export default function SelectableItemCard({
  item,
  selected = 0,
  onInc,
  onDec,
  onPress,
}: Props) {
  const brandLabel = item.marca ?? "Sin marca";
  const partLabel = item.noparte ?? item.nroparte ?? "Sin parte";

  return (
    <View className="mx-3 mb-2 overflow-hidden rounded-3xl border border-zinc-200/70 bg-componentbg dark:bg-dark-componentbg ">
      <Pressable
        onPress={onPress}
        className="min-h-36 flex-row active:opacity-95"
      >
        <View className="relative w-32 h-full  bg-bgimages dark:bg-dark-componentbg">
          <View className="">
            <CustomImagen img={item.imagen1 ?? ""} />
          </View>

          <View className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full border border-zinc-200 bg-white/95 px-2.5 py-1">
            <Text className="text-[11.5px] font-medium tracking-widest text-zinc-700">
              {item.codigo}
            </Text>
          </View>

          <View className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-zinc-200 bg-white/95 px-2.5 py-1">
            <Text className="text-[10px] font-semibold tracking-wide text-zinc-600">
              {item.unidad}
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-between px-3 py-4">
          <View>
            <View className="flex-row items-start justify-between gap-b">
              <View className="flex-1">
                <Text
                  numberOfLines={2}
                  className="mt-0.5 text-base font-bold leading-tight text-zinc-900 dark:text-dark-foreground"
                >
                  {item.material}
                </Text>
                {/* <Text
                  numberOfLines={1}
                  className="mt-1 text-[11px] font-semibold uppercase tracking-[1px] text-zinc-600 dark:text-dark-foreground"
                >
                  {item.codigo}
                </Text> */}
              </View>
            </View>

            <Text
              numberOfLines={1}
              className=" text-sm font-semibold text-zinc-700 dark:text-dark-foreground"
            >
              N. Parte {partLabel}
            </Text>

            <Text
              numberOfLines={1}
              className=" text-sm font-semibold text-zinc-700 dark:text-dark-foreground"
            >
              {brandLabel}
            </Text>

            <View className="mt-1 flex-row flex-wrap">
              {item.linea ? (
                <View className="rounded-full bg-zinc-100 px-2 py-1">
                  <Text
                    numberOfLines={1}
                    className="text-[11px] font-medium text-zinc-600"
                  >
                    {item.linea}
                  </Text>
                </View>
              ) : null}
            </View>
            <View className="mt-1 flex-row flex-wrap">
              {item.sublinea ? (
                <View className="rounded-full bg-zinc-100 px-2 py-1">
                  <Text
                    numberOfLines={1}
                    className="text-[11px] font-medium text-zinc-600"
                  >
                    {item.sublinea}
                  </Text>
                </View>
              ) : null}
            </View>
            <View className="px-3 py-1.5 rounded-full bg-zinc-100 absolute bottom-0 right-0">
              <Text className="text-[11px] font-bold text-zinc-600">
                Disponible
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

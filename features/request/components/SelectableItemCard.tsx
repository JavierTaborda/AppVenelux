import CustomImagen from "@/components/ui/CustomImagen";
import { Pressable, Text, View } from "react-native";
import type { RequestItem } from "../types/request";

type Props = {
  item: RequestItem;
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
  return (
    <View className="flex-1 m-2 bg-componentbg dark:bg-componentbg-dark rounded-xl overflow-hidden shadow-md">
      <Pressable onPress={onPress} className="flex-1">
        <View className="w-full h-36 bg-transparent. pt-4">
          <CustomImagen img={item.imagen1} />
        </View>
        <View className="absolute top-2 right-2 px-2 py-1 rounded-full bg-primary/10 dark:bg-primary-dark/20 border border-primary/30 dark:border-primary-dark/40">
          <Text
            numberOfLines={1}
            className="text-[10px] font-semibold text-primary dark:text-primary-dark"
          >
            {100} unidades
          </Text>
        </View>

        <View className="p-2 flex-row justify-between relative">
          <View>
            <Text
              numberOfLines={2}
              className="text-sm font-bold text-foreground"
            >
              {item.description}
            </Text>
            <Text
              numberOfLines={1}
              className="text-xs text-mutedForeground mt-1"
            >
              {item.marca} • {item.noparte}
            </Text>
          </View>

          {/* <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Pressable onPress={onDec} className="p-2 bg-gray-100 rounded-md">
                   <Ionicons name="remove" size={16} color="#333" />
              </Pressable>
              <Text className="mx-3 text-sm font-semibold">{selected}</Text>
              <Pressable onPress={onInc} className="p-2 bg-gray-100 rounded-md">
                <Ionicons name="add" size={16} color="#333" />
              </Pressable>
            </View>

            <Pressable
              onPress={onPress}
              className="px-3 py-2 bg-primary dark:bg-primary-dark rounded-md"
            >
              <Text className="text-white font-semibold text-sm">Agregar</Text>
            </Pressable>
          </View> */}
        </View>
      </Pressable>
    </View>
  );
}

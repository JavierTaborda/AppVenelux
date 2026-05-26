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
    <View className="flex-1 m-2 bg-componentbg dark:bg-dark-componentbg rounded-xl overflow-hidden shadow-md">
      <Pressable onPress={onPress} className="flex-1">
        <View className="w-full h-36 bg-transparent pt-4">
          <CustomImagen img={item.imagen1} />
        </View>
        <View className="absolute top-1 right-2 px-2 py-1 rounded-full bg-primary/15 dark:bg-dark-background/75 border border-primary/30 dark:border-primary-dark/40">
          <Text
            numberOfLines={1}
            className="text-[10px] font-semibold text-primary dark:text-dark-primary"
          >
            {selected > 0
              ? `${selected} seleccionadas`
              : `${item.quantity} disponibles`}
          </Text>
        </View>

        <View className="p-2 flex-row justify-between relative">
          <View>
            <Text
              numberOfLines={2}
              className="text-sm font-bold text-foreground dark:text-dark-foreground"
            >
              {item.codart} - {item.description}
            </Text>
            <Text
              numberOfLines={1}
              className="text-sm text-zinc-800 dark:text-zinc-300 mt-0.5"
            >
              {item.marca} - {item.noparte}
            </Text>
            <Text
              numberOfLines={1}
              className="text-sm text-mutedForeground dark:text-dark-mutedForeground mt-0.5"
            >
              Fabricante
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

import { Pressable, Text, View } from "react-native";

type ModuleButtonProps = {
  icon?: string;
  label: string;
  onPress?: () => void;
  bgColor?: string;
  isComingSoon?: boolean;
};

export const ModuleButton = ({
  icon,
  label,
  onPress,
  bgColor,
  isComingSoon = false,
}: ModuleButtonProps) => (
  <View className="relative flex-1 h-24 mx-1">
    {isComingSoon && (
      <View className="absolute top-0 left-0 right-0 bg-yellow-500 py-0 rounded-t-xl z-10">
        <Text className="text-white text-center text-xs font-bold">🚧 Próximamente</Text>
      </View>
    )}

    <Pressable
      onPress={onPress}
      disabled={isComingSoon}
      className={`flex-1 h-full rounded-xl items-center justify-center ${bgColor} shadow-sm`}
    >
       {icon && <Text className="text-white text-3xl mb-1 shadow-sm">{icon}</Text>}
      <Text className="text-white text-lg font-bold text-center">{label}</Text>
    </Pressable>
  </View>
);
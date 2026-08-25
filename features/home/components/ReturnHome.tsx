import { Text, View } from "react-native";

export default function ReturnHome({ name }: { name: string | null }) {
  const displayName = name?.trim() || "Usuario";

  return (
    <View className="px-4 py-1">
      {/* Header */}
      <View className="mt-2 mb-1">
        <Text className=" text-2xl font-extrabold text-foreground dark:text-dark-foreground">
          Bienvenido, {displayName}
        </Text>
      </View>
    </View>
  );
}

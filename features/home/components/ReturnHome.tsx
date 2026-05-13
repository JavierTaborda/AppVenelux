import { Text, View } from "react-native";

export default function ReturnHome({ name }: { name: string | null }) {
  const displayName = name?.trim() || "Usuario";

  return (
    <View className="px-4 py-3">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-sm text-foreground/70 dark:text-dark-foreground/70">
          Inicio
        </Text>
        <Text className="mt-1 text-2xl font-extrabold text-foreground dark:text-dark-foreground">
          Bienvenido, {displayName}
        </Text>
        <Text className="mt-1 text-sm text-foreground/70 dark:text-dark-foreground/70"></Text>
      </View>
    </View>
  );
}

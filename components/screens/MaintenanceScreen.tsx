import { BlockedScreen } from "@/components/ui/BlockedScreen";
import { useAppStatusStore } from "@/stores/useAppStatus";
import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function MaintenanceScreen({
  message,
}: {
  message?: string | null;
}) {
  const { checkAppStatus } = useAppStatusStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await checkAppStatus(); // sin userId si quieres global
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center  px-6">
      <BlockedScreen
        title="Estamos en mantenimiento"
        message={message ?? "Volveremos pronto"}
        icon={
          <FontAwesome6 name="screwdriver-wrench" size={48} color="white" />
        }
      />
      <Pressable
        onPress={handleRefresh}
        className="mt-2 px-6 py-3 bg-primary dark:bg-dark-primary rounded-xl"
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-center">
            Reintentar
          </Text>
        )}
      </Pressable>
    </View>
  );
}

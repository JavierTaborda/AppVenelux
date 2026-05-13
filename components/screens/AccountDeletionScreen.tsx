import { useAuthStore } from "@/stores/useAuthStore";
import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export default function AccountDeletionScreen({
  message,
}: {
  message?: string | null;
}) {
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View className="flex-1 items-center justify-center px-6 bg-componentbg dark:bg-dark-background">
      <View className=" my-safe-or-2">
        <FontAwesome5 name="trash" size={24} color="red" />
      </View>
      <Text className="text-xl font-bold mb-4">
        Solicitud de eliminación recibida
      </Text>

      <Text className="text-center mb-6 text-muted-foreground">
        {message ??
          "Tu cuenta se encuentra en proceso de eliminación conforme a nuestras políticas."}
      </Text>
      <Pressable
        className="bg-error dark:bg-dark-error text-white px-4 py-2 rounded-lg"
        onPress={signOut}
      >
        <Text className="text-white font-medium">Salir</Text>
      </Pressable>
    </View>
  );
}

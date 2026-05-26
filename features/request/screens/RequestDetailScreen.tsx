import SelectedItemsFab from "@/features/request/components/SelectedItemsFab";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../components/StatusBadge";
import { RequestService } from "../services/RequestService";
import type { Request } from "../types/request";

interface Props {
  requestId?: string;
  request?: Request;
}

export default function RequestDetailScreen({ request, requestId }: Props) {
  const s = request || (requestId ? null : undefined);

  const markApproved = async () => {
    try {
      if (!s) return;
      await RequestService.updateStatus(s.id, "aprobado", "Ingeniero jefe");
      Alert.alert("Solicitud", "Marcada como aprobada");
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar el estado");
    }
  };

  if (!s)
    return (
      <View className="p-3">
        <Text>No se encontró la solicitud</Text>
      </View>
    );

  return (
    <ScrollView className="p-3">
      <View className="mb-3">
        <Text className="text-xl font-extrabold">{s.title}</Text>
        <Text className="text-gray-500 mt-1.5">{s.description}</Text>
      </View>

      <View className="mb-3">
        <StatusBadge status={s.status} />
      </View>

      <View className="mb-3">
        <Text className="font-bold mb-1.5">Items</Text>
        {s.items.map((it) => (
          <View key={it.codart} className="flex-row justify-between py-1.5">
            <Text>{it.description}</Text>
            <Text className="text-gray-600">{it.quantity}</Text>
          </View>
        ))}
      </View>

      <View className="mt-4">
        {s.status === "pendiente" && (
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded"
            onPress={markApproved}
            accessibilityRole="button"
          >
            <Text className="text-white text-center font-semibold">
              Aprobar solicitud
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <SelectedItemsFab />
    </ScrollView>
  );
}

import { Alert, Button, ScrollView, Text, View } from "react-native";
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
      <View style={{ padding: 12 }}>
        <Text>No se encontró la solicitud</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>{s.title}</Text>
        <Text style={{ color: "#666", marginTop: 6 }}>{s.description}</Text>
      </View>

      <View style={{ marginBottom: 12 }}>
        <StatusBadge status={s.status} />
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Items</Text>
        {s.items.map((it) => (
          <View
            key={it.codart}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 6,
            }}
          >
            <Text>{it.description}</Text>
            <Text style={{ color: "#555" }}>{it.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 18 }}>
        {s.status === "pendiente" && (
          <Button title="Aprobar solicitud" onPress={markApproved} />
        )}
      </View>
    </ScrollView>
  );
}

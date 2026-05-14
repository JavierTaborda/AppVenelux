import { Text, View } from "react-native";
import type { RequestStatus } from "../types/request";

interface Props {
  status: RequestStatus;
}

export default function StatusBadge({ status }: Props) {
  const map: Record<RequestStatus, { color: string; label: string }> = {
    pendiente: { color: "#F59E0B", label: "Pendiente" },
    aprobado: { color: "#10B981", label: "Aprobado" },
    comprado: { color: "#3B82F6", label: "Comprado" },
    recibido: { color: "#6B7280", label: "Recibido" },
    rechazado: { color: "#EF4444", label: "Rechazado" },
  };

  const { color, label } = map[status] || { color: "#6B7280", label: status };

  return (
    <View
      style={{
        backgroundColor: color,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
      }}
    >
      <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

import { Text, View } from "react-native";
import type { RequestStatus } from "../types/request";
import { STATUS_LABELS } from "../utils/statuses";

interface Props {
  status: RequestStatus;
  label?: string;
}

export default function StatusBadge({ status, label }: Props) {
  const map: Record<RequestStatus, { color: string; label: string }> = {
    0: { color: "#F59E0B", label: STATUS_LABELS[0] },
    1: { color: "#2563EB", label: STATUS_LABELS[1] },
    2: { color: "#0EA5E9", label: STATUS_LABELS[2] },
    3: { color: "#10B981", label: STATUS_LABELS[3] },
    4: { color: "#EAB308", label: STATUS_LABELS[4] },
    5: { color: "#F97316", label: STATUS_LABELS[5] },
    6: { color: "#EF4444", label: STATUS_LABELS[6] },
  };

  const current = map[status] || { color: "#6B7280", label: String(status) };

  return (
    <View
      style={{
        backgroundColor: current.color,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
      }}
    >
      <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
        {label || current.label}
      </Text>
    </View>
  );
}

import { Pressable, Text, View } from "react-native";
import type { Request } from "../types/request";
import StatusBadge from "./StatusBadge";

interface Props {
  request: Request;
  onPress?: () => void;
}

export default function RequestItem({ request, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>{request.title}</Text>
        {request.description ? (
          <Text style={{ color: "#555", marginTop: 4 }} numberOfLines={1}>
            {request.description}
          </Text>
        ) : null}
        <Text style={{ color: "#777", marginTop: 6, fontSize: 12 }}>
          {request.items.length} items •{" "}
          {new Date(request.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={{ marginLeft: 12 }}>
        <StatusBadge status={request.status} />
      </View>
    </Pressable>
  );
}

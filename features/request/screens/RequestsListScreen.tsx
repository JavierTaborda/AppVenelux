import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import RequestItem from "../components/RequestItem";
import StatusBadge from "../components/StatusBadge";
import { useRequest } from "../hooks/useRequest";
import { STATUSES } from "../utils/statuses";

export default function RequestsListScreen() {
  const { requests, loading, fetchRequests } = useRequest();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter ? requests.filter((s) => s.status === filter) : requests),
    [filter, requests],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, flexDirection: "row", gap: 8 }}>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Estado:</Text>
        <FlatList
          horizontal
          data={STATUSES}
          keyExtractor={(s) => s}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter((f) => (f === item ? null : item))}
              style={{ marginRight: 8 }}
            >
              <StatusBadge status={item as any} />
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <Text style={{ padding: 12 }}>Cargando...</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <RequestItem request={item} />}
          ListEmptyComponent={
            <Text style={{ padding: 12 }}>No hay solicitudes</Text>
          }
          onRefresh={fetchRequests}
          refreshing={loading}
        />
      )}
    </View>
  );
}

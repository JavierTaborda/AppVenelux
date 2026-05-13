import CustomFlatList from "@/components/ui/CustomFlatList";
import SearchBar from "@/components/ui/SearchBar";
import { ClientData } from "@/types/clients";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

type ClientModalProps = {
  clients?: ClientData[];
  visible?: boolean;
  setSelectedClient: (client: ClientData) => void;
  onClose: (close: boolean) => void;
};

const ClientModal: React.FC<ClientModalProps> = React.memo(
  ({ clients = [], visible = true, setSelectedClient, onClose }) => {
    const [searchText, setSearchText] = useState("");

    const filteredClients = useMemo(() => {
      const query = searchText.trim().toLowerCase();
      if (!query || query.length < 3) return clients;
      return clients.filter((c) => {
        const code = c.co_cli?.toLowerCase() || "";
        const name = c.cli_des?.toLowerCase() || "";
        return code.includes(query) || name.includes(query);
      });
    }, [searchText, clients]);

    const handleSelectClient = useCallback(
      (item: ClientData) => {
        setSelectedClient(item);
        onClose(false);
      },
      [setSelectedClient, onClose],
    );

    if (!visible) return null;

    return (
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2 text-foreground dark:text-dark-foreground">
          Seleccionar cliente
        </Text>
        <View className="py-1 mb-2">
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            placeHolderText="Buscar cliente..."
            isFull
          />
        </View>

        {filteredClients.length === 0 ? (
          <Text className="text-center text-mutedForeground dark:text-dark-mutedForeground mt-4">
            No se encontraron clientes.
          </Text>
        ) : (
          <View className="h-[85%]">
            <CustomFlatList
              data={filteredClients}
              keyExtractor={(item) => item.co_cli.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectClient(item)}
                  className="h-14 py-2 px-4 mb-3 justify-center rounded-xl bg-componentbg dark:bg-dark-componentbg"
                >
                  <Text className="text-md text-foreground dark:text-dark-foreground">
                    {item.co_cli?.trim()} - {item.cli_des?.trim()}
                  </Text>
                </Pressable>
              )}
              refreshing={false}
              canRefresh={false}
              handleRefresh={() => {}}
              title={`${filteredClients.length}`}
              subtitle="Clientes disponibles"
              //pageSize={20}
            />
          </View>
        )}
      </View>
    );
  },
);

ClientModal.displayName = "ClientModal";
export default ClientModal;

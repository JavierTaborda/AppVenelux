import { useAuthStore } from "@/stores/useAuthStore";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useSegments } from "expo-router";
import { Image, Text, View } from "react-native";

export default function CustomDrawerContent(props: any) {
  const { session, role, name } = useAuthStore();
  const segments = useSegments();
  const currentPath = "/" + segments.join("/");

  return (
    <DrawerContentScrollView bounces={false} {...props}>
      {/* Header*/}
      <View className="items-center py-3 border-b border-b-slate-300 dark:border-b-slate-800">
        <View className="w-20 h-20 rounded-full overflow-hidden">
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        <Text className="text-base font-extrabold text-foreground dark:text-dark-foreground mt-1">
          {name}
        </Text>
        <Text className="text-base font-light text-foreground dark:text-dark-foreground mt-1">
          {session?.user.email}
        </Text>
        {/* <Text className="text-xs font-semibold text-foreground dark:text-dark-foreground">
          {role ? `${role}` : "Sin Perfil Asignado"}
        </Text> */}
      </View>

      <View className="mt-2 gap-2 pe-4">
        <Text className="text-sm font-semibold  justify-center text-center text-foreground dark:text-dark-foreground mt-1 mb-1">
          plataforma SGE
        </Text>

        {/* <DrawerItem
          label="Aprobación Pedidos"
          href="/(main)/(tabs)/(orders)/orderApproval"
          currentPath={currentPath}
        /> */}
      </View>
    </DrawerContentScrollView>
  );
}

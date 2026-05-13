import CustomDrawerContent from "@/components/drawer/CustomDrawerContent";
import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";

import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  const { theme } = useThemeStore();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: "front",
        swipeEnabled: false,

        drawerStyle: {
          backgroundColor:
            theme === "dark" ? appTheme.dark.background : appTheme.background,
        },
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
    </Drawer>
  );
}

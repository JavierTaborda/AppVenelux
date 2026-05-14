import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getTabIcon(
  routeName: string,
  focused: boolean,
): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case "(home)/index":
      return focused ? "home" : "home-outline";
    case "(profile)/index":
      return focused ? "person" : "person-outline";
    case "(logout)/index":
      return focused ? "exit" : "exit-outline";
    default:
      return "ellipse";
  }
}

export default function TabLayout() {
  const { isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      // backBehavior="history"
      screenOptions={({ route }) => ({
        animationEnabled: true,

        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={getTabIcon(route.name, focused)}
            size={size}
            color={color}
          />
        ),
        //Button styles of tab
        tabBarButton: (props: BottomTabBarButtonProps) => {
          const {
            onPress,
            onLongPress,
            accessibilityState,
            accessibilityLabel,
            testID,
            children,
          } = props;
          const focused = accessibilityState?.selected ?? false;

          //Color  ripple
          const rippleColor = focused
            ? appTheme.primary.DEFAULT
            : isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.08)";
          return (
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              android_ripple={{
                color: rippleColor,
                borderless: false,
                radius: 60,
              }}
            >
              <View
                style={{
                  borderRadius: 40,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {children}
              </View>
            </Pressable>
          );
        },
        // Tab bar visual styling
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: isDark
            ? appTheme.dark.background
            : appTheme.background,
          borderTopWidth: 1,
          borderTopColor: isDark ? appTheme.dark.separator : appTheme.separator,

          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },

        tabBarActiveTintColor: isDark
          ? appTheme.dark.primary.DEFAULT
          : appTheme.primary.DEFAULT,
        tabBarInactiveTintColor: appTheme.mutedForeground,
        //  Tab item style
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        // Header configuration
        headerShown: true,
        headerLeft: () => (
          <DrawerToggleButton
            tintColor={isDark ? appTheme.dark.foreground : appTheme.background}
          />
        ),
        headerStyle: {
          backgroundColor: isDark
            ? appTheme.dark.primary.DEFAULT
            : appTheme.primary.DEFAULT,
          borderBottomWidth: 0,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
        },
        headerTintColor: isDark
          ? appTheme.dark.foreground
          : appTheme.background,
      })}
    >
      <Tabs.Screen name="(home)/index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="(profile)/index" options={{ title: "Perfil" }} />
      <Tabs.Screen
        name="(logout)/index"
        options={{ title: "Salir", headerShown: false }}
      />

      {/*  not shown in tab bar */}

      <Tabs.Screen
        name="(request)/index"
        options={{
          href: null,
          headerShown: true,
          title: "Solicitudes  ",
        }}
      />
      <Tabs.Screen
        name="(request)/create"
        options={{
          href: null,
          headerShown: true,
          title: "Crear Solicitud",
        }}
      />
      <Tabs.Screen
        name="(request)/[id]"
        options={{
          href: null,
          headerShown: true,
          title: "Estado Solicitud ",
        }}
      />
    </Tabs>
  );
}

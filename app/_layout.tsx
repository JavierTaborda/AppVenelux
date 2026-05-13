import { AuthProvider } from "@/providers/AuthProvider";
import Overlay from "@/providers/Overlay";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Slot />
          <Overlay />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

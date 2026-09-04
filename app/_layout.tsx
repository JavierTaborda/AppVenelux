import { AuthProvider } from "@/providers/AuthProvider";
import Overlay from "@/providers/Overlay";
import { Blob as ExpoBlob } from "expo-blob";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

if (Platform.OS !== "web" && globalThis.Blob !== ExpoBlob) {
  globalThis.Blob = ExpoBlob as typeof globalThis.Blob;
}

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

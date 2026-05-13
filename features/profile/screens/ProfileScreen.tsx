import ThemeToggle from "@/components/ThemeToggle";
import { useAppStatusStore } from "@/stores/useAppStatus";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { getBiometricEnabled } from "@/utils/biometricFlag";
import { FontAwesome6 } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import pkg from "../../../package.json";
import BiometricToggle from "../components/BiometricView";

const TERMS_URL = `${process.env.EXPO_PUBLIC_WEB_URL}/privacy`;

export default function ProfileScreen() {
  const { session, name, userId, signOut, signOutSoft, initializeAuth } =
    useAuthStore();
  const expoVersion =
    Constants.expoConfig?.version ?? (Constants.expoVersion as any)?.version;
  const appVersion = expoVersion ?? pkg.version ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useThemeStore();
  const { deleteAccount } = useAppStatusStore();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const biometricEnabled = await getBiometricEnabled();
      biometricEnabled ? await signOutSoft() : await signOut();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Error desconocido",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openTerms = async () => {
    const supported = await Linking.canOpenURL(TERMS_URL);
    if (!supported) {
      Alert.alert("Error", "No se pudo abrir el enlace.");
      return;
    }
    await Linking.openURL(TERMS_URL);
  };

  const handleRequestDeletion = async () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es irreversible. ¿Deseas solicitar la eliminación de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Solicitar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);

              await deleteAccount(userId);

              Alert.alert(
                "Solicitud enviada",
                "Tu cuenta entró en proceso de eliminación.",
                [
                  {
                    text: "Aceptar",
                    style: "default",
                    onPress: async () => {
                      await initializeAuth();
                    },
                  },
                ],
              );
            } catch (err) {
              Alert.alert(
                "Error",
                err instanceof Error ? err.message : "Error desconocido",
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 p-6 bg-background dark:bg-dark-background"
      alwaysBounceVertical
    >
      <View className="items-center gap-4 pb-40">
        {name && (
          <View className="items-center px-4 py-3 rounded-xl w-[80%] bg-componentbg dark:bg-dark-componentbg">
            <Text className="text-lg dark:text-white">{name}</Text>
          </View>
        )}

        {session?.user?.email && (
          <View className="items-center px-4 py-3 rounded-xl w-[80%] bg-componentbg dark:bg-dark-componentbg">
            <Text className="text-lg dark:text-white">
              Correo: {session.user.email}
            </Text>
          </View>
        )}

        <BiometricToggle />
        <ThemeToggle />

        <Pressable
          onPress={openTerms}
          className="w-[80%] flex-row items-center justify-center gap-6 px-4 py-3 rounded-xl bg-componentbg dark:bg-dark-componentbg"
        >
          <FontAwesome6
            name="file-contract"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
          <Text className="text-foreground dark:text-dark-foreground font-medium">
            Políticas y Términos
          </Text>
        </Pressable>

        <Pressable
          onPress={handleRequestDeletion}
          className="w-[80%] flex-row items-center justify-center gap-2 px-4 py-3 mt-1 rounded-xl bg-error dark:bg-dark-error"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome6 name="user-slash" size={24} color={"white"} />
              <Text className="text-white font-medium">
                Solicitar eliminación de cuenta
              </Text>
            </>
          )}
        </Pressable>
        <View className="items-center px-4 py-3 rounded-xl w-[80%] bg-componentbg dark:bg-dark-componentbg">
          <Text className="text-sm text-foreground dark:text-dark-foreground">
            Versión: {appVersion}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

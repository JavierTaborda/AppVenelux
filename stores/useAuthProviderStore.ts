import { authenticateWithBiometrics } from "@/utils/biometricAuth";
import { getBiometricEnabled } from "@/utils/biometricFlag";
import { getSessionStatus } from "@/utils/sessionStatus";
import { Alert, Platform } from "react-native";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface AuthProviderState {
  showSplash: boolean;
  hasAuthenticated: boolean;
  initializeApp: () => Promise<void>;
  setShowSplash: (show: boolean) => void;
}

export const useAuthProviderStore = create<AuthProviderState>((set) => ({
  showSplash: true,
  hasAuthenticated: false,

  initializeApp: async () => {
    try {


      await useAuthStore.getState().initializeAuth();
      const { session, manualLogin, signOutSoft, setManualLogin } = useAuthStore.getState();
      const enabledBiometric = await getBiometricEnabled();
      
      // If there is no active session, exit quickly
      if (!session) {
        set({ showSplash: false });
        await signOutSoft();
        return;
      }

      // Only try biometric auth if not manual login

      if (session && !manualLogin && enabledBiometric && Platform.OS != 'web') {
        const loginStatus = await getSessionStatus();


        if (loginStatus === "active") {
          let biometricSuccess = false;


          try {
            const result = await authenticateWithBiometrics();
            biometricSuccess = result === true;
          } catch (err) {
            Alert.alert("Error", err instanceof Error ? err.message : String(err));
            //console.log("Biometric authentication failed:", err);
          }

          if (!biometricSuccess) {
            //console.log("Autenticación biométrica fallida, cerrando sesión...");
            set({ showSplash: false });
            await signOutSoft();
            return;
          }

          set({ hasAuthenticated: true });
        }
      }
      else if (session && !manualLogin && !enabledBiometric) {
        set({ showSplash: false });
        await signOutSoft();
        return;
      }
      else if (session && !manualLogin && Platform.OS === 'web') {
        set({ hasAuthenticated: true });
      }

      // Reset login manual 
      setManualLogin(false);
      set({ showSplash: false });
    } catch (err) {
      console.log("Error en initializeApp:", err);
      // alway hide the splash
      set({ showSplash: false });
    }
  },

  setShowSplash: (show: boolean) => set({ showSplash: show }),
}));

import { supabase } from "@/lib/supabase";
import { getName, getUserRoleJWT } from "@/services/AuthService";
import {
  getBiometricEnabled,
  setBiometricEnabled,
} from "@/utils/biometricFlag";
import { getSessionStatus, setSessionStatus } from "@/utils/sessionStatus";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { Platform } from "react-native";
import { create } from "zustand";

interface AuthStore {
  session: Session | null; // Supabase session
  loading: boolean; // Auth loading status
  manualLogin: boolean; // Flag to track manual login (for biometric logic)
  role: string | null; // User role
  name: string | null; // User name
  token: string | null; // User token for supabase
  userId: string | undefined; //used id

  setSession: (session: Session | null) => void; // Set user session
  setRole: (role: string | null) => void; // Set user role
  setName: (name: string | null) => void; // Set user name
  setToken: (token: string | null) => void; // Set user token
  setManualLogin: (value: boolean) => void; // Set manualLogin flag

  signIn: (email: string, password: string) => Promise<{ error: Error | null }>; // Sign in with email/password
  sendCodeOTP: (
    value: string,
    method: "email" | "phone",
    redirectUri?: string
  ) => Promise<{ error: Error | null }>; // Send OTP
  signInOTP: (
    method: string,
    token: string,
    type: "email" | "sms"
  ) => Promise<{ error: Error | null }>; // Verify OTP login
  restoreSessionWithBiometrics: () => Promise<{ error: Error | null }>; // Restore session using biometrics
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>; // Register new user
  signOut: () => Promise<void>; // Full sign out
  signOutSoft: () => Promise<void>; // Soft sign out (used when biometrics fail)

  initializeAuth: () => Promise<void>; // Initialize session from storage
  getUserId: () => Promise<string| undefined>; // 
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  loading: true,
  manualLogin: false,
  role: null,
  name: null,
  token: null,
  userId: undefined,

  setSession: (session) => set({ session }),
  setRole: (role) => set({ role }),
  setName: (name) => set({ name }),
  setToken: (token) => set({ token }),
  setManualLogin: (value) => set({ manualLogin: value }),

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (data.session) {
        const role = await getUserRoleJWT(data.session?.access_token);
        const name = await getName(data.session?.access_token);
        //const role = await getUserRole(data.session.user.id);
       
        await setSessionStatus("active");
        //await setBiometricEnabled(true);
        set({
          session: data.session,
          manualLogin: true,
          role: role,
          name: name,
          token: data.session?.access_token,
          userId: data.user.id
        });
        
      }
      return { error };
    } catch (err) {
      return { error: err as Error };
    } finally {
      set({ loading: false });
    }
  },

  sendCodeOTP: async (value, method, redirectUri) => {
    try {
      const response =
        method === "email"
          ? await supabase.auth.signInWithOtp({
            email: value,
            options: { emailRedirectTo: redirectUri },
          })
          : await supabase.auth.signInWithOtp({ phone: value });

      return { error: response.error };
    } catch (err) {
      return { error: err as Error };
    }
  },

  signInOTP: async (method, token, type) => {
    set({ loading: true });
    try {
      const payload =
        type === "sms"
          ? { phone: method, token, type }
          : { email: method, token, type };

      const { data, error } = await supabase.auth.verifyOtp(payload);

      if (data?.session?.access_token && data?.session?.refresh_token) {
        const role = await getUserRoleJWT(data.session?.access_token);
        const name = await getName(data.session?.access_token);
        //const role = await getUserRole(data.session.user.id);

        await setSessionStatus("active");
        //await setBiometricEnabled(true);
        set({
          session: data.session,
          manualLogin: true,
          role: role,
          name: name,
          token: data.session?.access_token,
          userId: data.user?.id
        });
      }

      return { error };
    } catch (err) {
      return { error: err as Error };
    } finally {
      set({ loading: false });
    }
  },

  restoreSessionWithBiometrics: async () => {
    try {
      const isBiometricEnabled = await getBiometricEnabled();

      if (!isBiometricEnabled) {
        const platformMsg =
          Platform.OS === "ios"
            ? "Face ID o Touch ID no están disponibles."
            : "La autenticación biométrica no está disponible en este dispositivo.";

        return { error: new Error(platformMsg) };
      }

      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        const role = await getUserRoleJWT(data.session?.access_token);
        const name = await getName(data.session?.access_token);
        //const role = await getUserRole(data.session.user.id);
        set({
          session: data.session,
          role: role,
          name: name,
          token: data.session?.access_token,
          loading: false,
          manualLogin: true,
          userId: data.session.user.id
        });
        await setSessionStatus("active");
        await setBiometricEnabled(true);

        return { error: null };
      } else {
        set({ session: null, loading: false });
        return { error: new Error("No se pudo reestablecer la sesión.") };
      }
    } catch (error) {
      set({ loading: false });
      return { error: error as Error };
    }
  },

  signUp: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch (err) {
      return { error: err as Error };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await setSessionStatus("loggedOut");
    await setBiometricEnabled(false);
    set({ session: null, loading: false, role: null, token: null });
    router.replace("/(auth)/sign-in");
  },

  signOutSoft: async () => {
    set({ session: null, loading: false, role: null, token: null });
    await setSessionStatus("loggedOut");
    await setBiometricEnabled(true);
    router.replace("/(auth)/sign-in");
  },


  initializeAuth: async () => {
    set({ loading: true });

    const status = await getSessionStatus();
    if (status !== "active") {
      set({ session: null });
      return set({ loading: false });
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session || error) {
        set({ session: null });
      } else {
        const role = await getUserRoleJWT(data.session?.access_token);
        const name = await getName(data.session?.access_token);
        //console.log(role)
        //const role = await getUserRole(data.session.user.id);

        set({
          session: data.session,
          role: role,
          name: name,
          token: data.session?.access_token,
          userId: data.session.user.id
        });
        //console.log(data.session.access_token)
      }
    } catch (err) {
      set({ session: null });
    } finally {
      set({ loading: false });
    }
  },
  getUserId: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ userId: user?.id });
    return user?.id;
  },
}));

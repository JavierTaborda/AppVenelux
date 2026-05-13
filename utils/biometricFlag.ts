import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_KEY = "biometricEnabled";


export async function setBiometricEnabled(value: boolean) {
  await AsyncStorage.setItem(BIOMETRIC_KEY, value ? "true" : "false");
}


export async function getBiometricEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
    if (value === null) {
      return true; 
    }
    return value === "true";
  } catch (error) {
    console.error("Error leyendo flag biométrico:", error);
    return false;
  }
}
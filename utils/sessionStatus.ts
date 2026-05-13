import AsyncStorage from "@react-native-async-storage/async-storage";
const SESSION_KEY = "sessionStatus";
//for softsignout,
export async function setSessionStatus(status: "active" | "loggedOut") {
    await AsyncStorage.setItem(SESSION_KEY, status);
}

export async function getSessionStatus(): Promise<"active" | "loggedOut" | null> {
    const value = await AsyncStorage.getItem(SESSION_KEY);
    if (value === "active" || value === "loggedOut") return value;
    return null;
}

import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export async function pickFromGallery(): Promise<string[] | null> {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Se necesita permiso para acceder a tus fotos.");
        return null;
    }


    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
       // allowsEditing: true,
        allowsMultipleSelection: true,
        quality: 0.8,
    });

    if (!result.canceled) {
        return result.assets.map((asset) => asset.uri);
    }

    return null;
}

export async function pickFromCamera(): Promise<string | null> {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Se necesita permiso para usar la cámara.");
        return null;
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.5,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }

    return null;
};
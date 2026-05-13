import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

type Props = {
  onScanned: (data: string) => void;

};

export default function BarcodeScanner({ onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [codeData, setCodeData] = useState<string | null>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white text-lg mb-4">
          Se necesita permiso para acceder a la cámara y lograr escanerar.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary dark:bg-dark-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        style={{ flex: 1, borderRadius: 15 }}
        facing="back"
        
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "code128", "upc_a"],
        }}
        onBarcodeScanned={({ data }) => {
          if (!scanned) {
            setScanned(true);
            setCodeData(data);
            onScanned(data);
          }
        }}
      />

      {/* frame */}
      <View className="absolute top-1/4 left-1 right-1 mx-auto w-3/3 h-1/3 m-1">
        <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-xl" />
        <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-xl" />
        <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-xl" />
        <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-xl" />
      </View>

      {/* result */}
      {codeData && (
        <View className="absolute bottom-16 w-full items-center px-6">
          <Animated.View
            entering={FadeInUp.duration(150)}
            className="bg-black/70 rounded-xl px-4 py-2"
          >
            <Text className="text-white text-center">{codeData}</Text>
          </Animated.View>

          <TouchableOpacity
            onPress={() => {
              setScanned(false);
              setCodeData(null);
            }}
            className="mt-4 bg-primary dark:bg-dark-primary px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setScanned(false);
              setCodeData(null);
            }}
            className="mt-4 bg-gray-600 dark:bg-gray-400 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">Escanear de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

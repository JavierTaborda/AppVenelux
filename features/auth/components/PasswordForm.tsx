import EmailInput from "@/components/inputs/EmailImput";
import PasswordInput from "@/components/inputs/PasswordInput";
import { getBiometricEnabled } from "@/utils/biometricFlag";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Platform, Text, TouchableOpacity } from "react-native";

export default function PasswordForm({
  email,
  password,
  setEmail,
  setPassword,
  onBiometricLogin,
}: {
  email: string;
  password: string;
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  onBiometricLogin: () => void;
}) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      const enabled = await getBiometricEnabled();
      setBiometricEnabled(enabled);
    };
    checkBiometric();
  }, []);

  return (
    <>
      <EmailInput value={email} onChangeText={setEmail} />
      <PasswordInput value={password} onChangeText={setPassword} />

      {Platform.OS !== "web" && biometricEnabled && (
        <TouchableOpacity
          onPress={onBiometricLogin}
          className="mt-4 w-full flex-row items-center justify-center gap-2 bg-secondary py-3 rounded-xl"
        >
          {Platform.OS === "ios" ? (
            <>
              <Image
                source={require("@/assets/images/face-id.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
              <Text className="text-white font-medium">Usar Face ID</Text>
            </>
          ) : (
            <>
              <Ionicons name="finger-print-outline" size={24} color="white" />
              <Text className="text-white font-medium">Usar biometría</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </>
  );
}

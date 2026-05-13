import { appTheme } from "@/utils/appTheme";
import {
    getBiometricEnabled,
    setBiometricEnabled,
} from "@/utils/biometricFlag";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, Switch, Text, View } from "react-native";

export default function BiometricToggle() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [authBiometric, setAuthBiometric] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchBiometric = async () => {
      const isEnabled = await getBiometricEnabled();
      //console.log("Biometric enabled:", isEnabled);
      setAuthBiometric(isEnabled);
    };

    fetchBiometric();
  }, []);

  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    const syncBiometricFlag = async () => {
      setIsSaving(true);
      const current = await getBiometricEnabled();
      if (current !== authBiometric) {
        await setBiometricEnabled(authBiometric);
      }
      setIsSaving(false);
    };

    syncBiometricFlag();

    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.98,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [authBiometric]);
  return (
    <Animated.View
      style={[{ transform: [{ scale: pulseAnim }] }]}
      className="flex-row items-center justify-between px-4 py-3 rounded-xl w-[80%] min-h-[48px] my-1 bg-componentbg dark:bg-dark-componentbg"
    >
      <View className="flex-row items-center gap-3">
        {Platform.OS === "ios" ? (
          <>
            {authBiometric ? (
              <Image
                source={require("@/assets/images/face-id.png")}
                style={{ width: 20, height: 20 }}
                className="bg-primary dark:bg-transparent rounded"
                resizeMode="contain"
              />
            ) : (
              <MaterialIcons name="block" size={20} color={appTheme.warning} />
            )}
            <Text className="text-base font-medium text-foreground dark:text-dark-foreground">
              Ingresar con Face ID
            </Text>
          </>
        ) : (
          <>
            <MaterialIcons
              name={authBiometric ? "fingerprint" : "block"}
              size={20}
              color={authBiometric ? appTheme.success : appTheme.warning}
            />
            <Text className="text-base font-medium text-foreground dark:text-dark-foreground">
              Ingresar con biometría
            </Text>
          </>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        {isSaving && (
          <MaterialIcons
            name="hourglass-top"
            size={16}
            color={appTheme.secondary.DEFAULT}
          />
        )}
        <Switch
          value={authBiometric}
          onValueChange={setAuthBiometric}
          thumbColor={
            authBiometric
              ? Platform.select({ android: appTheme.primary.DEFAULT })
              : Platform.select({ android: appTheme.muted })
          }
          trackColor={{
            true: Platform.select({ android: appTheme.primary.DEFAULT }),
          }}
        />
      </View>
    </Animated.View>
  );
}

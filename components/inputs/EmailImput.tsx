import { appTheme } from "@/utils/appTheme";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function EmailInput({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  const [touched, setTouched] = useState(false);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  return (
    <View>
      <View
        className={`flex-row items-center border rounded-xl px-4 dark:text-white bg-transparent dark:bg-dark-componentbg
                ${touched && !isValid ? "border-red-500 dark:border-red-300" : "border-gray-300 dark:border-gray-600"}
            `}
      >
        <FontAwesome
          name="envelope"
          size={20}
          color={
            touched && !isValid ? appTheme.error : appTheme.placeholdercolor
          }
        />
        <TextInput
          className="flex-1 p-4 text-black dark:text-white"
          placeholder="correo@ejemplo.com"
          value={value}
          placeholderTextColor={appTheme.placeholdercolor}
          autoCapitalize="none"
          keyboardType="email-address"
          onBlur={() => setTouched(true)}
          onChangeText={onChangeText}
        />
      </View>
      {!isValid && touched && (
        <Text className="text-red-500 text-xs mt-1">Correo no válido</Text>
      )}
    </View>
  );
}

import { appTheme } from "@/utils/appTheme";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

interface PhoneInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

export default function PhoneInput({
  value,
  onChange,
  error,
}: PhoneInputProps) {
  const [touched, setTouched] = useState(false);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, "");
    if (/^58\d{0,10}$/.test(cleaned)) {
      onChange("+58" + cleaned.slice(2));
    }
  };

  const isValid = /^58\d{10}$/.test(value.replace("+", ""));

  return (
    <View>
      <View
        className={`flex-row items-center border rounded-xl px-4 dark:text-white bg-transparent dark:bg-dark-componentbg
          ${touched && !isValid ? "border-red-500 dark:border-red-300" : "border-gray-300 dark:border-gray-600"}
        `}
      >
        <FontAwesome
          name="phone"
          size={20}
          color={
            touched && !isValid ? appTheme.error : appTheme.placeholdercolor
          }
        />
        <Text className="text-black dark:text-white ml-2 py-4">+58</Text>
        <TextInput
          className="flex-1 p-4 text-black dark:text-white"
          keyboardType="phone-pad"
          placeholder="4121234567"
          placeholderTextColor={appTheme.placeholdercolor}
          value={value.replace("+58", "")}
          onChangeText={(text) => {
            handleChange("+58" + text);
            setTouched(true);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={10}
        />
      </View>
      {!isValid && touched && (
        <Text className="text-red-500 text-xs mt-1">Teléfono no válido</Text>
      )}
    </View>
  );
}

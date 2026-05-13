import { appTheme } from "@/utils/appTheme";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PasswordInput({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  const [touched, setTouched] = useState(false);
  const [visible, setVisible] = useState(false);

  const isValid = value.length >= 6;

  return (
    <View>
      <View
        className={`flex-row items-center border rounded-xl px-4 bg-transparent dark:bg-dark-componentbg
          ${!touched || isValid ? "border-gray-300 dark:border-gray-600" : "border-red-500 dark:border-red-300"}
        `}
      >
        <FontAwesome
          name="lock"
          size={20}
          color={
            !touched || isValid ? appTheme.placeholdercolor : appTheme.error
          }
        />
        <TextInput
          className="flex-1 p-4 text-black dark:text-white"
          placeholder="Ingresa tu contraseña..."
          placeholderTextColor={appTheme.placeholdercolor}
          secureTextEntry={!visible}
          value={value}
          onChangeText={onChangeText}
          onBlur={() => setTouched(true)}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setVisible((prev) => !prev)}>
          <Text className="text-sm text-primary ml-2 font-medium">
            {visible ? "Ocultar" : "Ver"}
          </Text>
        </TouchableOpacity>
      </View>

      {!isValid && touched && (
        <Text className="text-red-500 text-xs mt-1">Mínimo 6 caracteres</Text>
      )}
    </View>
  );
}

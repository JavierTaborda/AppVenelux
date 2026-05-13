import { appTheme } from "@/utils/appTheme";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function RateInput({
  value,
  onChangeValue,
  placeholder = "0.00",
}: {
  value: number;
  onChangeValue: (num: number) => void;
  placeholder?: string;
}) {
  const [touched, setTouched] = useState(false);

  const isValid = !isNaN(value) && value >= 0;

  return (
    <View>
      <View
        className={`flex-row items-center border rounded-xl px-4 dark:text-white bg-transparent dark:bg-dark-componentbg
          ${touched && !isValid ? "border-red-500 dark:border-red-300" : "border-gray-300 dark:border-gray-600"}
        `}
      >
        <FontAwesome
          name="money"
          size={20}
          color={
            touched && !isValid ? appTheme.error : appTheme.placeholdercolor
          }
        />
        <TextInput
          className="flex-1 p-4 text-black dark:text-white"
          placeholder={placeholder}
          value={value?.toString()}
          placeholderTextColor={appTheme.placeholdercolor}
          keyboardType="decimal-pad"
          onBlur={() => setTouched(true)}
          onChangeText={(text) => {
            const parsed = parseFloat(text);
            if (!isNaN(parsed)) {
              onChangeValue(parsed);
            } else {
              onChangeValue(0.0); // predr
            }
          }}
        />
      </View>
      {!isValid && touched && (
        <Text className="text-red-500 text-xs mt-1">Valor inválido</Text>
      )}
    </View>
  );
}

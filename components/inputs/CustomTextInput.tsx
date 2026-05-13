import { appTheme } from "@/utils/appTheme";
import { TextInput, View } from "react-native";

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
};

export default function CustomTextInput({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "none",
  multiline = false,
  numberOfLines = 1,
  editable = true,
}: Props) {
  return (
    <View>
      <View className="border rounded-xl px-4 bg-transparent dark:bg-dark-componentbg border-gray-300 dark:border-gray-600">
        <TextInput
          className="py-4 text-foreground dark:text-dark-foreground"
          placeholder={placeholder}
          value={value}
          placeholderTextColor={appTheme.placeholdercolor}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          editable={editable}
        />
      </View>
    </View>
  );
}

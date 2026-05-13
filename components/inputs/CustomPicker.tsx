import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomPickerProps = {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  icon?: keyof typeof FontAwesome.glyphMap;
  placeholder?: string;
  error?: string;
};

export default function CustomPicker({
  selectedValue,
  onValueChange,
  items = [],
  icon = "list",
  placeholder = "Seleccione una opción",
  error,
}: CustomPickerProps) {
  const { theme } = useThemeStore();
  const [touched, setTouched] = useState(false);
  const [iosModalVisible, setIosModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const isValid = !!selectedValue;
  const selectedLabel =
    items.find((i) => i.value === selectedValue)?.label || placeholder;

  const handleValueChange = (value: string) => {
    setTouched(true);
    onValueChange(value);
    // if (Platform.OS === "ios") setIosModalVisible(false);
  };

  const iconName = FontAwesome.glyphMap[icon] ? icon : "list";

  return (
    <View className="w-full">
      <View
        className={`flex-row items-center rounded-xl px-4 border bg-transparent dark:bg-dark-componentbg ${
          touched && !isValid
            ? "border-red-500 dark:border-red-400"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <FontAwesome
          name={iconName}
          size={20}
          color={
            touched && !isValid
              ? appTheme.error
              : theme === "dark"
                ? (appTheme.dark.secondary?.DEFAULT ?? "#ccc")
                : (appTheme.secondary?.DEFAULT ?? "#333")
          }
        />

        {Platform.OS === "android" ? (
          <View className="flex-1 ">
            <Picker
              selectedValue={selectedValue}
              onValueChange={handleValueChange}
              style={{
                color: isValid
                  ? theme === "dark"
                    ? (appTheme.dark.foreground ?? "#fff")
                    : (appTheme.foreground ?? "#000")
                  : (appTheme.placeholdercolor ?? "#999"),
                backgroundColor: "transparent",
              }}
            >
              <Picker.Item label={placeholder} value="" />
              {items.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <Pressable
            className="flex-1 py-3"
            onPress={() => setIosModalVisible(true)}
          >
            <Text
              className={`text-base ${
                isValid
                  ? "text-foreground dark:text-dark-foreground"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {selectedLabel}
            </Text>
          </Pressable>
        )}
      </View>

      {touched && !isValid && (
        <Text className="text-red-500 text-xs mt-1">
          {error || "Seleccione una opción"}
        </Text>
      )}

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={iosModalVisible}
          animationType="slide"
          onRequestClose={() => setIosModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            {/* <Pressable
              className="flex-1"
              onPress={() => setIosModalVisible(false)}
            /> */}
            <View
              style={{ paddingBottom: insets.bottom }}
              className="bg-white dark:bg-dark-componentbg rounded-t-3xl overflow-hidden"
            >
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-lg font-semibold text-foreground dark:text-dark-foreground">
                  Selecciona una opción
                </Text>
                <TouchableOpacity
                  onPress={() => setIosModalVisible(false)}
                  className="px-3 py-1"
                >
                  <Text className="text-primary dark:text-dark-primary font-semibold">
                    Hecho
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="h-[300px] justify-center">
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={handleValueChange}
                  style={{
                    color:
                      theme === "dark"
                        ? (appTheme.dark.foreground ?? "#fff")
                        : (appTheme.foreground ?? "#000"),
                  }}
                >
                  <Picker.Item label={placeholder} value="" />
                  {items.map((item) => (
                    <Picker.Item
                      key={item.value}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

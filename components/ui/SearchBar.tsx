import { useThemeStore } from "@/stores/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  searchText: string;
  setSearchText: (text: string) => void;
  placeHolderText?: string;
  isFull?: boolean;
};

export default function SearchBar({
  searchText,
  setSearchText,
  placeHolderText = "Buscar...",
  isFull = false,
}: Props) {
  const { isDark } = useThemeStore();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(searchText);

  // shared values
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0);
  const inputWidthAnim = useSharedValue(1);

  const inputHeight = Platform.select({ android: 40, ios: 38 });

  // Sync external changes
  useEffect(() => {
    setInputValue(searchText);
  }, [searchText]);

  // Show/hide clear button
  useEffect(() => {
    fadeAnim.value = withTiming(inputValue.length > 0 ? 1 : 0, {
      duration: 200,
    });
    scaleAnim.value = withSpring(inputValue.length > 0 ? 1 : 0);
  }, [inputValue]);

  // Animate width
  useEffect(() => {
    if (!isFull) return;
    inputWidthAnim.value = withTiming(isFocused ? 0.95 : 1, { duration: 200 });
  }, [isFocused, isFull]);

  const handleCancel = () => {
    Keyboard.dismiss();
    setIsFocused(false);
  };

  //  Animated styles
  const clearButtonStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const inputContainerStyle = useAnimatedStyle(() => ({
    flex: inputWidthAnim.value,
  }));

  return (
    <View className="flex-row items-center py-1">
      <Animated.View
        className="flex-row items-center px-4 bg-componentbg dark:bg-dark-componentbg rounded-full"
        style={inputContainerStyle}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? "white" : "gray"}
        />
        <TextInput
          style={{ height: inputHeight }}
          className="ml-2 flex-1 text-black dark:text-white"
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            setSearchText(text);
          }}
          placeholder={placeHolderText}
          placeholderTextColor={isDark ? "#ccc" : "#666"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !inputValue && setIsFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
        />
        <Animated.View style={clearButtonStyle}>
          <TouchableOpacity
            onPress={() => {
              setInputValue("");
              setSearchText("");
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Borrar texto"
            accessibilityHint="Limpia el texto de búsqueda"
            accessible
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={isDark ? "white" : "grey"}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {isFocused && isFull && (
        <TouchableOpacity
          onPress={handleCancel}
          className="ml-2"
          activeOpacity={0.6}
          accessibilityLabel="Cancelar búsqueda"
          accessibilityHint="Cierra el campo de búsqueda y oculta el botón cancelar"
        >
          <Text className="text-primary dark:text-dark-primary font-medium text-lg">
            Cancelar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

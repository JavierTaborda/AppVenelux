import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

type CustomTouchableOpacityProps = {
  onPress: () => void;
  label?: string;
};

export default function CustomTouchableOpacity({ onPress, label = "Cerrar" }: CustomTouchableOpacityProps) {
  const [pressed, setPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(pressed ? 0.95 : 1, { duration: 100 }) }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={0.8}
        className="bg-primary dark:bg-dark-primary rounded-full py-4 px-6 mx-5 flex-row justify-center items-center shadow-sm"
      >
        <Text className="text-white dark:text-white font-bold text-lg ml-2">{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
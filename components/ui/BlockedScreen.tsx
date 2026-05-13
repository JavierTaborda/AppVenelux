// components/screens/BlockedScreen.tsx
import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

export function BlockedScreen({
  title,
  message,
  icon,
}: {
  title: string;
  message?: string | null;
  icon?: React.ReactNode;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.05, { duration: 1200 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(200)}
      className="items-center justify-center bg-componentbg dark:bg-dark-background px-2"
    >
      <Animated.View
        entering={SlideInUp.duration(500)}
        style={pulseStyle}
        className="items-center bg-warning dark:bg-warning p-4 rounded-2xl"
      >
        {icon}
        <Text className="text-xl font-semibold mt-4 text-center text-white">
          {title}
        </Text>

        <Text className="text-center text-white dark:text-dark-foreground mt-2">
          {message ?? ""}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { ActivityIndicator, View } from "react-native";

export default function Loader() {
  const { theme } = useThemeStore();
  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-dark-background">
      <ActivityIndicator
        size="large"
        color={
          theme === "dark"
            ? appTheme.dark.primary.DEFAULT
            : appTheme.primary.DEFAULT
        }
      />
    </View>
  );
}

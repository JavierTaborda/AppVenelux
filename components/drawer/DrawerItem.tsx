import { useThemeStore } from "@/stores/useThemeStore";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Href, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Text, TouchableOpacity } from "react-native";

type DrawerItemProps = {
  href: Href;
  icon?: ComponentProps<typeof Ionicons>["name"];
  emoji?: string;
  label: string;
  currentPath: string;
};

export function DrawerItem({
  href,
  icon,
  label,
  currentPath,
  emoji,
}: DrawerItemProps) {
  const { theme } = useThemeStore();
  const router = useRouter();
  const isDark = theme === "dark";
  const isActive = currentPath === href;

  const bgClass = isActive
    ? "bg-primary dark:bg-dark-primary"
    : "bg-componentbg dark:bg-dark-componentbg";
  const textClass = isActive
    ? "text-white dark:text-dark-foreground font-extrabold"
    : "text-foreground dark:text-dark-foreground font-bold";

  const handlePress = () => {
    router.push(href);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center py-4 px-3 rounded-2xl ${bgClass}`}
    >
      {icon && (
        <Ionicons name={icon} size={24} color={isDark ? "white" : "black"} />
      )}
      {emoji && (
        <>
          <Text className="text-xl"> {emoji}</Text>
        </>
      )}
      <Text className={`ms-2  text-md ${textClass}`}>{label}</Text>
    </TouchableOpacity>
  );
}

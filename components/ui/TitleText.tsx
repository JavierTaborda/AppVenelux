import { Text, View } from "react-native";

interface TitleTextProps {
  title?: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
}

export default function TitleText({ title, subtitle, rightComponent }: TitleTextProps) {
  return (
    <View className="px-4 w-full justify-between items-center">
      <View className="flex-row gap-1 items-center">
        {title && (
          <Text className="text-foreground dark:text-dark-foreground font-bold text-md">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text className="text-foreground dark:text-dark-foreground font-semibold text-md">
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent}
    </View>
  );
}

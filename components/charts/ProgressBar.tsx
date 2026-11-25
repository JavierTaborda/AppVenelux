import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import * as Progress from "react-native-progress";
import { View } from "react-native";
interface Props {
  progress: number;
  color?: string;
}
export default function ProgressBar({ progress, color }: Props) {
  const { isDark } = useThemeStore();
  if (!color)
    color = isDark ? appTheme.dark.primary.DEFAULT : appTheme.primary.DEFAULT;
  return (
    <View style={{ marginTop: 1 }}>
    <Progress.Bar
      progress={progress}
      width={null}
      animated={true}
      color={color}
      borderRadius={4}
      borderWidth={0}
      unfilledColor={isDark ? appTheme.dark.muted : appTheme.muted}
      height={8}
    />
    </View>
  );
}

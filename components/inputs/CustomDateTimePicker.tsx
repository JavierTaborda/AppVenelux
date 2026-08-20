import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import DateTimePicker, {
    DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

type PickerMode = "date" | "time";
type PickerDisplay =
  | "default"
  | "spinner"
  | "calendar"
  | "clock"
  | "inline"
  | "compact";

interface CustomDateTimePickerProps {
  value: Date;
  mode?: PickerMode;
  display?: PickerDisplay;
  onValueChange: (event: DateTimePickerChangeEvent, date: Date) => void;
  onDismiss?: () => void;
  onNeutralButtonPress?: () => void;
  onClose?: () => void;
}

export default function CustomDateTimePicker({
  value,
  mode = "date",
  display = Platform.OS === "ios" ? "inline" : "default",
  onValueChange,
  onDismiss,
  onNeutralButtonPress,
  onClose,
}: CustomDateTimePickerProps) {
  const { isDark } = useThemeStore();

  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={display}
      onValueChange={(event, date) => {
        onValueChange(event, date);
        if (Platform.OS === "android") {
          if (onClose) onClose();
        }
      }}
      onDismiss={() => {
        if (onDismiss) onDismiss();
        if (Platform.OS === "android" && onClose) {
          onClose();
        }
      }}
      onNeutralButtonPress={() => {
        if (onNeutralButtonPress) onNeutralButtonPress();
        if (Platform.OS === "android" && onClose) {
          onClose();
        }
      }}
      textColor={
        isDark ? appTheme.dark.primary.DEFAULT : appTheme.primary.DEFAULT
      }
      accentColor={
        isDark ? appTheme.dark.primary.DEFAULT : appTheme.primary.DEFAULT
      }
    />
  );
}

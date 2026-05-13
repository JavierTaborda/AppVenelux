import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import DateTimePicker, {
    DateTimePickerEvent,
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
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  onClose?: () => void;
}

export default function CustomDateTimePicker({
  value,
  mode = "date",
  display = Platform.OS === "ios" ? "inline" : "default",
  onChange,
  onClose,
}: CustomDateTimePickerProps) {
  const { isDark } = useThemeStore();

  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={display}
      onChange={(event, date) => {
        if (Platform.OS === "android") {
          if (event.type === "set") {
            onChange(event, date);
          }
          if (onClose) onClose();
          return;
        }
        onChange(event, date);
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

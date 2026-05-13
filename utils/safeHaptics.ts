import * as Battery from "expo-battery";
import * as Haptics from "expo-haptics";

// Cache for Low Power Mode state
let lowPowerMode = false;

// Initialize state on module load
Battery.isLowPowerModeEnabledAsync().then((v) => (lowPowerMode = v));

// Listen for Low Power Mode changes
Battery.addLowPowerModeListener(({ lowPowerMode: v }) => {
    lowPowerMode = v;
});

/**
 * CUSTOM HAPTIC MAP 
 * Add any new haptic types you want to support here.
 */
const CUSTOM_NOTIFICATION_MAP = {
    success: () =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

    warning: () =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

    error: () =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

    heavy: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

    medium: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

    light: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

    rigid: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),

    soft: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),

    selection: () => Haptics.selectionAsync(),
};

/**
 * AUTO-GENERATED TYPE: Extracts all valid haptic keys 
 */
export type HapticCustomType = keyof typeof CUSTOM_NOTIFICATION_MAP;

/**
 * MAIN FUNCTION: Safely triggers haptic feedback 
 */
export async function safeHaptic(type: HapticCustomType) {
    // Skip when Low Power Mode is enabled
    if (lowPowerMode) return;

    const fn = CUSTOM_NOTIFICATION_MAP[type];
    if (fn) return fn();
}

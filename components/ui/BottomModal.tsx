import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { scheduleOnRN } from "react-native-worklets";

import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { BlurTargetView, BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomModalProps = {
  visible: boolean;
  onClose: () => void;
  heightPercentage?: number;
  children: React.ReactNode;
};

const AnimatedView = Animated.createAnimatedComponent(View);
const ANIMATION_CONFIG = {
  damping: 20,
  stiffness: 230,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};
export default function BottomModal({
  visible,
  onClose,
  children,
  heightPercentage = 0.8,
}: BottomModalProps) {
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get("window").height;
  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  // Content height is a percentage of the usable screen; bottom inset is added
  // so the sheet extends behind the navigation bar on Android/iOS.
  const sheetContentHeight =
    (windowHeight - statusBarHeight) * heightPercentage;
  const modalHeight = sheetContentHeight + insets.bottom;

  const { isDark } = useThemeStore();
  const translateY = useSharedValue(modalHeight);
  const keyboardOffset = useSharedValue(0);
  const targetRef = useRef<View | null>(null);
  const MIN_MODAL_HEIGHT = 120 + insets.bottom;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // If keyboard is open, dismiss it on outside taps; otherwise close modal
  const handleBackdropPress = () => {
    if (keyboardHeight > 0) {
      Keyboard.dismiss();
    } else {
      onClose();
    }
  };

  // Open/close the sheet — use dynamic height that accounts for keyboard
  useEffect(() => {
    const computedVisibleArea = Math.max(
      windowHeight - statusBarHeight - keyboardHeight,
      0,
    );
    const computedHeight = Math.max(
      computedVisibleArea * heightPercentage + insets.bottom,
      MIN_MODAL_HEIGHT,
    );

    translateY.value = withSpring(
      visible ? 0 : computedHeight,
      ANIMATION_CONFIG,
    );
  }, [visible, keyboardHeight, heightPercentage, insets.bottom]);

  // Listen for keyboard to lift the sheet above it (smooth on both platforms)
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      const height = e.endCoordinates?.height || 0;
      setKeyboardHeight(height);
      keyboardOffset.value = withTiming(height, { duration: 250 });
    };
    const onHide = () => {
      setKeyboardHeight(0);
      keyboardOffset.value = withTiming(0, { duration: 250 });
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  const dragGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120 || event.velocityY > 800) {
        scheduleOnRN(onClose);
      } else {
        translateY.value = withSpring(0, ANIMATION_CONFIG);
      }
    });

  const sheetStyle = useAnimatedStyle(() => {
    const visibleArea = Math.max(
      windowHeight - statusBarHeight - keyboardOffset.value,
      0,
    );
    const animatedHeight = Math.max(
      visibleArea * heightPercentage + insets.bottom,
      MIN_MODAL_HEIGHT,
    );
    return {
      transform: [{ translateY: translateY.value }],
      position: "absolute",
      bottom: keyboardOffset.value,
      left: 0,
      right: 0,
      height: animatedHeight,
    };
  });

  const bgColor = isDark ? appTheme.dark.background : appTheme.background;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {Platform.OS === "ios" ? (
          <View style={{ flex: 1 }}>
            {/* Backdrop */}
            <BlurTargetView ref={targetRef} />
            <BlurView
              intensity={40}
              tint="dark"
              blurTarget={targetRef}
              blurMethod="dimezisBlurView"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <Pressable style={{ flex: 1 }} onPress={onClose} />
            </BlurView>

            {/* Bottom sheet */}
            <AnimatedView
              style={[
                sheetStyle,
                {
                  backgroundColor: bgColor,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  // iOS shadow
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: isDark ? 0.35 : 0.12,
                  shadowRadius: 16,
                  // Android elevation
                  elevation: 24,
                },
              ]}
            >
              {/* Drag-handle hit area */}
              <GestureDetector gesture={dragGesture}>
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 12,
                    paddingBottom: 10,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.18)",
                    }}
                  />
                </View>
              </GestureDetector>

              {/* Content – fills remaining space and stays above nav bar */}
              <Pressable
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  // Ensure content never sits behind the Android nav bar or
                  // the iOS home indicator.
                  paddingBottom: Math.max(insets.bottom, 16),
                  overflow: "hidden",
                }}
                onPress={() => {
                  if (keyboardHeight > 0) Keyboard.dismiss();
                }}
              >
                {children}
              </Pressable>
            </AnimatedView>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* Backdrop (Android) - use full-screen BlurView and let expo pick method */}
            <BlurView
              intensity={40}
              tint="dark"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {/* fallback dim so user sees backdrop even if blur is not available */}
              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.18)" }}
                onPress={handleBackdropPress}
              />
            </BlurView>

            {/* Bottom sheet */}
            <AnimatedView
              style={[
                sheetStyle,
                {
                  backgroundColor: bgColor,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  // iOS shadow
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: isDark ? 0.35 : 0.12,
                  shadowRadius: 16,
                  // Android elevation
                  elevation: 24,
                },
              ]}
            >
              {/* Drag-handle hit area */}
              <GestureDetector gesture={dragGesture}>
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 12,
                    paddingBottom: 10,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.18)",
                    }}
                  />
                </View>
              </GestureDetector>

              {/* Content – fills remaining space and stays above nav bar */}
              <Pressable
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  // Ensure content never sits behind the Android nav bar or
                  // the iOS home indicator.
                  paddingBottom: Math.max(insets.bottom, 16),
                  overflow: "hidden",
                }}
                onPress={() => {
                  if (keyboardHeight > 0) Keyboard.dismiss();
                }}
              >
                {children}
              </Pressable>
            </AnimatedView>
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

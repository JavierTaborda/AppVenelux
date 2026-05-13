import React, { forwardRef, useEffect, useRef } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
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

const AnimatedView = forwardRef<View, ViewProps>((props, ref) => (
  <Animated.View ref={ref} {...props} />
));
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
  const targetRef = useRef<View | null>(null);
  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : modalHeight, ANIMATION_CONFIG);
  }, [visible, modalHeight]);

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

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  }));

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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={{ flex: 1 }}>
            {/* Backdrop */}
            <BlurTargetView ref={targetRef} />
            <BlurView
              intensity={40}
              tint="dark"
              blurTarget={targetRef}
              blurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFillObject}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={onClose}
              />
            </BlurView>

            {/* Bottom sheet */}
            <AnimatedView
              style={[
                sheetStyle,
                {
                  height: modalHeight,
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
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  // Ensure content never sits behind the Android nav bar or
                  // the iOS home indicator.
                  paddingBottom: Math.max(insets.bottom, 16),
                  overflow: "hidden",
                }}
              >
                {children}
              </View>
            </AnimatedView>
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

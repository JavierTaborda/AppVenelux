import { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export function useScrollHeader() {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<"up" | "down">("up");

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;

      // Show scroll-to-top button
      if (currentY > 200 && !showScrollTop) {
        setShowScrollTop(true);
      } else if (currentY <= 200 && showScrollTop) {
        setShowScrollTop(false);
      }

      // Show/hide header
      if (currentY <= 0 && !headerVisible) {
        setHeaderVisible(true);
        scrollDirection.current = "up";
      }

      const delta = currentY - lastScrollY.current;
      if (Math.abs(delta) > 15) {
        if (delta > 0 && scrollDirection.current !== "down") {
          scrollDirection.current = "down";
          setHeaderVisible(false);
        } else if (delta < 0 && scrollDirection.current !== "up") {
          scrollDirection.current = "up";
          setHeaderVisible(true);
        }
      }

      lastScrollY.current = currentY;
    },
    [headerVisible, showScrollTop]
  );

  return {
    handleScroll,
    headerVisible,
    showScrollTop,
    setHeaderVisible,
    setShowScrollTop,
  };
}

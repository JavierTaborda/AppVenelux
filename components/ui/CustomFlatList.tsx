import {
  FlashList,
  FlashListProps,
  FlashListRef,
  ViewToken,
} from "@shopify/flash-list";
import React, { useEffect, useMemo, useRef } from "react";

import {
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

import { useScrollHeader } from "@/hooks/useScrollHeader";
import { appTheme } from "@/utils/appTheme";
import { Ionicons } from "@expo/vector-icons";
import TitleText from "./TitleText";

type Props<T> = {
  data: T[];
  renderItem: FlashListProps<T>["renderItem"];
  keyExtractor: FlashListProps<T>["keyExtractor"];

  refreshing: boolean;
  canRefresh: boolean;
  handleRefresh: () => void;

  cooldown?: number;
  estimatedItemSize?: number;
  drawDistance?: number;
  ListEmptyComponent?: React.ReactElement | React.ComponentType<any>;
  onHeaderVisibleChange?: (visible: boolean) => void;
  showtitle?: boolean;
  title?: string;
  subtitle?: string;

  numColumns?: number;

  showScrollTopButton?: boolean;

  onViewableItemsChanged?: (info: { viewableItems: ViewToken<T>[] }) => void;

  contentContainerStyle?: any;

  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  removeClippedSubviews?: boolean;
};

function CustomFlashList<T>({
  data,
  renderItem,
  keyExtractor,

  refreshing,
  canRefresh,
  handleRefresh,

  cooldown,

  estimatedItemSize = 250,
  drawDistance = 250,

  ListEmptyComponent,

  onHeaderVisibleChange,

  showtitle = true,
  title,
  subtitle,

  numColumns = 1,

  showScrollTopButton = true,

  onViewableItemsChanged,

  contentContainerStyle,

  onEndReached,
  onEndReachedThreshold = 0.5,
  removeClippedSubviews = true,
}: Props<T>) {
  const listRef = useRef<FlashListRef<T>>(null);

  const { handleScroll, showScrollTop, headerVisible } = useScrollHeader();

  // header visibility sync
  useEffect(() => {
    onHeaderVisibleChange?.(headerVisible);
  }, [headerVisible, onHeaderVisibleChange]);

  //  toast cooldown
  const showToast = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravity(
        msg,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      alert(msg);
    }
  };

  const onCooldownPress = () => {
    if (cooldown) {
      showToast(`Espera ${cooldown}s antes de refrescar`);
    }
  };

  //  refresh control memoizado
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={canRefresh ? refreshing : false}
        onRefresh={canRefresh ? handleRefresh : undefined}
        enabled={canRefresh}
        {...(Platform.OS === "android" && {
          progressViewOffset: 100,
          colors: [
            appTheme.primary.DEFAULT,
            appTheme.primary.light,
            appTheme.secondary.DEFAULT,
          ],
        })}
        tintColor={appTheme.primary.DEFAULT}
      />
    ),
    [refreshing, canRefresh, handleRefresh],
  );

  // header memo
  const ListHeader = useMemo(() => {
    if (!showtitle) return null;

    return (
      <View style={{ paddingBottom: 6 }}>
        <TitleText title={title} subtitle={subtitle} />
      </View>
    );
  }, [showtitle, title, subtitle]);

  // empty memo
  const EmptyComponent = useMemo(() => {
    if (ListEmptyComponent) return ListEmptyComponent;

    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No se encontraron datos</Text>
      </View>
    );
  }, [ListEmptyComponent]);

  return (
    <>
      {/* cooldown badge */}
      {!canRefresh && cooldown ? (
        <Pressable onPress={onCooldownPress} style={styles.cooldown}>
          <Text style={styles.cooldownText}>
            Espera {cooldown}s para refrescar
          </Text>
        </Pressable>
      ) : null}

      {/*scroll top */}
      {showScrollTopButton && showScrollTop && (
        <Pressable
          onPress={() =>
            listRef.current?.scrollToOffset({
              offset: 0,
              animated: true,
            })
          }
          style={styles.scrollTop}
          className="bg-primary dark:bg-dark-primary p-4 rounded-full shadow-lg"
        >
          <Ionicons name="arrow-up" size={22} color="white" />
        </Pressable>
      )}

      {/* LIST */}
      <FlashList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        drawDistance={drawDistance}
        numColumns={numColumns}
        removeClippedSubviews={removeClippedSubviews}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onViewableItemsChanged={onViewableItemsChanged}
        refreshControl={refreshControl}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={[
          { paddingHorizontal: 12, paddingBottom: 200 },
          contentContainerStyle,
        ]}
      />
    </>
  );
}
const styles = StyleSheet.create({
  cooldown: {
    position: "absolute",
    top: 0,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 10,
  },

  cooldownText: {
    color: "#fff",
    fontSize: 12,
  },

  scrollTop: {
    position: "absolute",
    bottom: 115,
    right: 20,
    zIndex: 50,
    padding: 14,
    borderRadius: 30,
  },

  empty: {
    alignItems: "center",
    padding: 40,
  },

  emptyText: {
    color: "#888",
  },
});
export default React.memo(CustomFlashList) as typeof CustomFlashList;

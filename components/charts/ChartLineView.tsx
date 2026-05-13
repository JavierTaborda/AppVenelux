import { appTheme } from "@/utils/appTheme";
import { useEffect, useRef } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface Props {
  labels: string[];
  values: number[];
  dotLabels?: string[]; // labels on every point
  isDark: boolean;
  title?: string;
}

export const ChartLineView = ({
  labels,
  values,
  dotLabels = [],
  isDark,
  title,
}: Props) => {
  const screenWidth = Dimensions.get("window").width;

  const data = {
    labels,
    datasets: [
      {
        data: values,
        color: () => appTheme.primary.DEFAULT,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: isDark ? appTheme.dark.componentbg : appTheme.componentbg,
    backgroundGradientFrom: isDark
      ? appTheme.dark.componentbg
      : appTheme.componentbg,
    backgroundGradientTo: isDark
      ? appTheme.dark.componentbg
      : appTheme.componentbg,
    decimalPlaces: 0,
    color: () =>
      isDark ? appTheme.dark.mutedForeground : appTheme.mutedForeground,
    labelColor: () =>
      isDark ? appTheme.dark.foreground : appTheme.foreground || "#000",
    barPercentage: 1,
    propsForDots: {
      r: "4.5",
      strokeWidth: "3",
    },
  };
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (values.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: 0, animated: false });
        animateScrollToEnd();
      }, 400);
    }
  }, [values]);

  const animateScrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };
  if (values.length === 0) {
    return (
      <View className="flex items-center justify-center py-6">
        <Text className="text-base text-muted dark:text-dark-muted">
          No hay datos disponibles.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-componentbg dark:bg-dark-componentbg rounded-xl py-2">
      {title && (
        <Text className="text-xl text-foreground dark:text-dark-foreground font-semibold mb-2 mt-2 px-2">
          {title}
        </Text>
      )}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderRadius: 12, marginTop: 5 }}
      >
        <LineChart
          data={data}
          width={Math.max(labels.length * 45, screenWidth)}
          height={250}
          verticalLabelRotation={0}
          withInnerLines={false}
          withOuterLines={true}
          withHorizontalLabels={false}
          formatYLabel={(y) => y}
          renderDotContent={({ x, y, index }) => {
            if (x == null || y == null || !dotLabels[index]) return null;

            const isEven = index % 2 === 0;
            const offsetY = isEven ? -20 : 0; // up  par, down impar

            return (
              <Text
                key={`dot-${index}`}
                style={{
                  position: "absolute",
                  top: y + offsetY,
                  left: x - 15,
                  zIndex: 10,
                }}
                className="text-xs font-semibold text-foreground dark:text-dark-foreground"
              >
                {dotLabels[index]}
              </Text>
            );
          }}
          chartConfig={chartConfig}
          style={{ borderRadius: 8, paddingVertical: 2, marginTop: 5 }}
          bezier
          withShadow={false}
        />
      </ScrollView>
    </View>
  );
};

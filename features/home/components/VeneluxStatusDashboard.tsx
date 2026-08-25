import { appTheme } from "@/utils/appTheme";
import { Text, View, useWindowDimensions } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import type { VeneluxSolicitudStatusChartItem } from "../types/VeneluxSolicitudesStatus";

type Props = {
  total: number;
  chartData: VeneluxSolicitudStatusChartItem[];
  isDark: boolean;
};

const formatNumber = (value: number) =>
  value.toLocaleString("es-VE", { maximumFractionDigits: 0 });

export default function VeneluxStatusDashboard({
  total,
  chartData,
  isDark,
}: Props) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 32, 320);
  const foreground = isDark ? appTheme.dark.foreground : appTheme.foreground;
  const mutedForeground = isDark
    ? appTheme.dark.mutedForeground
    : appTheme.mutedForeground;
  const componentBg = isDark ? appTheme.dark.componentbg : appTheme.componentbg;
  const surface = isDark ? "#111114" : "#F7F8FA";
  const hasData = chartData.some((item) => item.value > 0);

  const pieData = chartData.map((item) => ({
    name: item.label,
    population: item.value,
    color: item.color,
    legendFontColor: foreground,
    legendFontSize: 12,
  }));

  const barData = {
    labels: chartData.map((item) => item.label.slice(0, 3)),
    datasets: [{ data: chartData.map((item) => item.value) }],
  };

  const chartConfig = {
    backgroundColor: componentBg,
    backgroundGradientFrom: componentBg,
    backgroundGradientTo: componentBg,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(22, 199, 132, ${opacity})`,
    labelColor: () => mutedForeground,
    propsForBackgroundLines: {
      stroke: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
      strokeDasharray: "4 8",
    },
    propsForLabels: {
      fontSize: 11,
    },
  };

  return (
    <View className="gap-4">
      <View
        className="rounded-2xl p-4 overflow-hidden"
        style={{ backgroundColor: componentBg }}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-mutedForeground dark:text-dark-mutedForeground text-sm font-semibold">
              Solicitudes Venelux
            </Text>
            <Text className="text-foreground dark:text-dark-foreground text-4xl font-extrabold mt-1">
              {formatNumber(total)}
            </Text>
          </View>
          <View
            className="px-3 py-2 rounded-full"
            style={{ backgroundColor: isDark ? "#17362B" : "#E8F8F1" }}
          >
            <Text className="text-sm font-bold" style={{ color: "#16C784" }}>
              En vivo
            </Text>
          </View>
        </View>

        {hasData ? (
          <View className="items-center justify-center">
            <PieChart
              data={pieData}
              width={chartWidth}
              height={210}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="16"
              absolute
              hasLegend={false}
            />
            <View
              className="absolute items-center justify-center rounded-full"
              style={{ width: 116, height: 116, backgroundColor: componentBg }}
            >
              <Text className="text-mutedForeground dark:text-dark-mutedForeground text-xs font-semibold">
                Total
              </Text>
              <Text className="text-foreground dark:text-dark-foreground text-2xl font-extrabold">
                {formatNumber(total)}
              </Text>
            </View>
          </View>
        ) : (
          <View
            className="h-52 rounded-xl items-center justify-center"
            style={{ backgroundColor: surface }}
          >
            <Text className="text-mutedForeground dark:text-dark-mutedForeground font-semibold">
              No hay solicitudes registradas.
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {chartData.map((item) => {
          const percent =
            total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <View
              key={item.estatus}
              className="w-[48.5%] rounded-xl p-3"
              style={{ backgroundColor: componentBg }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 pr-2">
                  <View
                    className="w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text
                    className="text-foreground dark:text-dark-foreground font-bold flex-1"
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
                <Text className="text-mutedForeground dark:text-dark-mutedForeground text-xs font-bold">
                  {percent}%
                </Text>
              </View>
              <Text className="text-foreground dark:text-dark-foreground text-2xl font-extrabold mt-3">
                {formatNumber(item.value)}
              </Text>
              <View
                className="h-1.5 rounded-full mt-3 overflow-hidden"
                style={{ backgroundColor: isDark ? "#26262B" : "#ECEFF3" }}
              >
                <View
                  className="h-full rounded-full"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View
        className="rounded-2xl pt-4 pb-2 overflow-hidden"
        style={{ backgroundColor: componentBg }}
      >
        <View className="px-4 mb-2">
          <Text className="text-foreground dark:text-dark-foreground text-lg font-extrabold">
            Distribución por estatus
          </Text>
          <Text className="text-mutedForeground dark:text-dark-mutedForeground text-sm mt-1">
            Vista rápida de solicitudes activas y cerradas
          </Text>
        </View>
        <BarChart
          data={barData}
          width={chartWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          withInnerLines
          withHorizontalLabels
          style={{ marginLeft: -16, borderRadius: 16 }}
        />
      </View>
    </View>
  );
}

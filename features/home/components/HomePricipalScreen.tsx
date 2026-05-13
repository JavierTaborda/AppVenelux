import { ChartLineView } from "@/components/charts/ChartLineView";
import { totalVenezuela } from "@/utils/moneyFormat";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { InfoCard } from "./InfoCard";
import { ModuleButton } from "./ModuleButton";

export default function HomePrincipalScreen({
  name,
  totalPedidos,
  totalNeto,
  chartText,
  labels,
  values,
  dotLabels,
  isDark,
}: {
  name: string | null;
  totalPedidos: number;
  totalNeto: number;
  chartText: string | null;
  labels: string[];
  values: number[];
  dotLabels: string[];
  isDark: boolean;
}) {
  return (
    <View>
      {/* Welcome */}
      <View className="flex-1 items-start mt-2 mb-2">
        <Text className="text-foreground dark:text-dark-foreground  text-xl font-bold">
          Bienvenido
        </Text>
        <Text className="text-lg text-foreground dark:text-dark-foreground  font-semibold">
          {name}
        </Text>
      </View>

      {/* Cards */}
      <View className="flex-row flex-wrap justify-between gap-4 mb-4 pt-1">
        <InfoCard
          //icon={emojis.package}
          title="Total Pedidos"
          value={totalPedidos}
          //bgColor="bg-primary dark:bg-dark-primary"
        />
        <InfoCard
          //icon={emojis.money}
          title="Total Neto"
          value={`${totalVenezuela(totalNeto)} $`}
          //bgColor="bg-secondary dark:bg-dark-secondary"
        />
      </View>

      <Text className="text-xl text-foreground dark:text-dark-foreground font-bold mb-2 mt-2">
        {chartText}
      </Text>
      <ChartLineView
        labels={labels}
        values={values}
        dotLabels={dotLabels}
        isDark={isDark}
      />

      <View className="flex-row flex-wrap justify-between pt-4">
        <View className="w-[49%] mb-4">
          <ModuleButton
            //icon={emojis.approved}
            //icon={   emojis.package}
            label="Aprobación Pedidos"
            onPress={() => router.push("/(main)/(tabs)/(orders)/orderApproval")}
            bgColor="bg-primary dark:bg-dark-primary"
          />
        </View>
        <View className="w-[49%] mb-4">
          <ModuleButton
            //icon={emojis.list}
            //icon={emojis.approved}
            label="Consultar Pedidos"
            onPress={() => router.push("/(main)/(tabs)/(orders)/orderSearch")}
            bgColor="bg-secondary dark:bg-dark-secondary"
          />
        </View>
        <View className="w-[49%] mb-4">
          <ModuleButton
            //icon={emojis.list}
            //icon={emojis.approved}
            label="Resumen Metas de Ventas"
            onPress={() => router.push("/(main)/(tabs)/(goals)/goalsResumen")}
            bgColor="bg-green-500 dark:bg-green-400"
          />
        </View>
        <View className="w-[49%] mb-4">
          <ModuleButton
            //icon={emojis.list}
            //icon={emojis.approved}
            label="Crear Pedido"
            onPress={() =>
              router.push("/(main)/(tabs)/(createOrder)/create-order")
            }
            bgColor="bg-green-400 dark:bg-green-300"
          />
        </View>
        <View className="w-[49%] mb-4">
          <ModuleButton
            //icon={emojis.list}
            //icon={emojis.approved}
            label="Reportar Devolución "
            onPress={() => router.push("/(main)/(tabs)/(returnReport)")}
            bgColor="bg-green-600 dark:bg-green-600"
          />
        </View>
      </View>
    </View>
  );
}

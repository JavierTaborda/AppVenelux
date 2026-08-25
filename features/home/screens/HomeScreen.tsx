import ErrorView from "@/components/ui/ErrorView";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { RefreshControl, ScrollView } from "react-native";
import HomeSkeleton from "../components/HomeSkeleton";
import ReturnHome from "../components/ReturnHome";
import VeneluxStatusDashboard from "../components/VeneluxStatusDashboard";
import { useVeneluxSolicitudesStatus } from "../hooks/useVeneluxSolicitudesStatus";

export default function HomeScreen() {
  const { name } = useAuthStore();
  const { isDark } = useThemeStore();
  const { loading, error, total, chartData, refreshing, getData, refreshData } =
    useVeneluxSolicitudesStatus();

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return <ErrorView error={error} getData={getData} />;
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 180 }}
      keyboardShouldPersistTaps="handled"
      className="bg-background dark:bg-dark-background px-4 pt-2"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
      }
    >
      <ReturnHome name={name} />
      <VeneluxStatusDashboard
        total={total}
        chartData={chartData}
        isDark={isDark}
      />
    </ScrollView>
  );
}

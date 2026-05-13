import { useThemeStore } from '@/stores/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface FilterButtonProps {
  onPress: () => void;
  filterCount?: number;
  title?:boolean
}

export default function FilterButton({ onPress, filterCount, title=false }: FilterButtonProps) {
  const { theme } = useThemeStore();
  const hasFilters = typeof filterCount === "number" && filterCount > 0;
  return (
    <TouchableOpacity
      className={`mx-0 px-5 py-2.5 rounded-full flex-row items-center
        ${
          hasFilters
            ? "bg-primary dark:bg-dark-primary"
            : "bg-componentbg dark:bg-dark-componentbg"
        }`}
      onPress={onPress}
    >
      {title && (
        <Text
          className={`text-sm me-1 ${
            hasFilters
              ? "text-white"
              : "text-mutedForeground dark:text-dark-mutedForeground"
          }`}
        >
          Filtros
        </Text>
      )}

      <Ionicons
        name="filter"
        size={20}
        color={hasFilters ? "white" : "grey"}
      />  
      {hasFilters && (
        <View className="absolute -top-0 -right-0 bg-red-500 dark:bg-red-600 rounded-full px-1.5 py-0.5">
          <Text className="text-white text-xs font-bold overflow-hidden">
            {filterCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};


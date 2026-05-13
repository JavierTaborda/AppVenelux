import { Platform, Text, View } from "react-native";

type InfoCardProps = {
  icon?: string;
  title: string;
  value: string | number;
  bgColor?: string;
};
export const InfoCard = ({ icon, title, value, bgColor }: InfoCardProps) => (
  <View
    className={`
    flex-1 min-w-28 rounded-xl p-4 justify-between
      ${bgColor ? bgColor : "bg-componentbg dark:bg-dark-componentbg"}
       shadow-sm`}
    style={Platform.OS === "android" ? { elevation: 4 } : {}}
  >
    <View className="flex-row items-center">
      {icon && (
        <Text className="text-white text-2xl mr-1 shadow-sm">{icon}</Text>
      )}
      
      <Text
        className={`${!bgColor ? 'text-foreground dark:text-dark-foreground ':'text-primary dark:text-dark-secondary '} text-lg font-bold flex-1`}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </View>
    <Text className={`${!bgColor ?'text-primary dark:text-dark-secondary' :'text-foreground dark:text-dark-foreground '} text-xl font-bold`}>
      {value}
    </Text>
  </View>
);

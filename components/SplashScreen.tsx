import { View } from "react-native";
import Loader from "./ui/Loader";

export default function SplashScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-background dark:bg-dark-background">

      <Loader />
    </View>
  );
}

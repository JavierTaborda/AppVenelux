import { Component } from "react";
import { View } from "react-native";

export default class HomeSkeleton extends Component {
  render() {
    return (
      <View className="flex-1 p-4 pt-2 bg-background dark:bg-dark-background">
        <View className="h-5 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-full mt-2 mb-2 animate-pulse" />
        <View className="h-6 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-full mb-5 animate-pulse" />

        <View className="rounded-2xl p-4 bg-gray-200 dark:bg-zinc-800 mb-4 animate-pulse">
          <View className="flex-row items-start justify-between mb-5">
            <View>
              <View className="h-4 w-36 bg-gray-300 dark:bg-gray-700 rounded-full mb-3" />
              <View className="h-10 w-28 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </View>
            <View className="h-9 w-20 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </View>

          <View className="items-center justify-center h-52">
            <View className="h-40 w-40 rounded-full bg-gray-300 dark:bg-gray-700" />
            <View className="absolute h-24 w-24 rounded-full bg-gray-200 dark:bg-zinc-800" />
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-3 mb-4">
          <View className="w-[48.5%] h-28 rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <View className="w-[48.5%] h-28 rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <View className="w-[48.5%] h-28 rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </View>

        <View className="rounded-2xl p-4 bg-gray-200 dark:bg-zinc-800 animate-pulse">
          <View className="h-5 w-44 bg-gray-300 dark:bg-gray-700 rounded-full mb-3" />
          <View className="h-4 w-56 bg-gray-300 dark:bg-gray-700 rounded-full mb-5" />
          <View className="h-44 rounded-xl bg-gray-300 dark:bg-gray-700" />
        </View>
      </View>
    );
  }
}

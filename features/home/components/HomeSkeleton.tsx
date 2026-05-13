import { Component } from 'react';
import { View } from 'react-native';

export default class HomeSkeleton extends Component {
  render() {
    return (
      <View className="flex-1 p-4 pt-2 bg-background dark:bg-dark-background">

        <View className="h-6 w-2/3 bg-gray-300 dark:bg-gray-700 rounded mt-2 mb-4 animate-pulse" />

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 h-24 rounded-lg p-4 mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <View className="flex-1 h-24 rounded-lg p-4 ml-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </View>

        <View className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mt-2 mb-2 animate-pulse" />

        <View>
          <View className="h-[250px] w-[320px] bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        </View>

        <View className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mt-6 mb-2.5 animate-pulse" />
        
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 h-24 rounded-lg p-4 mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <View className="flex-1 h-24 rounded-lg p-4 ml-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
     
        </View>
        <View className="flex-row justify-between mb-1">
          <View className="flex-1 h-24 rounded-lg p-4 mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <View className="flex-1 h-24 rounded-lg p-4 ml-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </View>
      </View>
    );
  }
}

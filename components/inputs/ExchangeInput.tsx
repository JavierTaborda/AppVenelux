import { ExchangeRate } from "@/types/exchangerate";
import { formatDatedd_dot_MMM_yyyy } from "@/utils/datesFormat";
import { currencyDollar, totalVenezuela } from "@/utils/moneyFormat";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, View } from "react-native";
import CustomTextInput from "./CustomTextInput";

type ExchangeInputProps = {
  exchangeRate: ExchangeRate;
};

const ExchangeInput: React.FC<ExchangeInputProps> = ({ exchangeRate }) => {
  const [usdValue, setUsdValue] = useState("");
  const [bsValue, setBsValue] = useState("");

  const handleUsdChange = (value: string) => {
    setUsdValue(value);
    const numericUsd = parseFloat(value);
    if (!isNaN(numericUsd)) {
      setBsValue(totalVenezuela(numericUsd * exchangeRate.tasa_v));
    } else {
      setBsValue("");
    }
  };

  const handleBsChange = (value: string) => {
    setBsValue(value);
    const numericBs = parseFloat(value);
    if (!isNaN(numericBs)) {
      setUsdValue((numericBs / exchangeRate.tasa_v).toFixed(2));
    } else {
      setUsdValue("");
    }
  };

  const date = formatDatedd_dot_MMM_yyyy(exchangeRate.fecha.toString());

  return (
    <View className="">
      <Text className="text-center font-bold text-xl text-foreground dark:text-dark-foreground m-1">
        Tasa de Cambio
      </Text>
      <Text className="text-center font-extrabold text-xl text-primary dark:text-dark-primary ">
        {exchangeRate.tasa_v} Bs / {currencyDollar}
      </Text>
      <Text className="text-center font-semibold text-md text-gray-500 dark:text-gray-400 mb-6">
        {date}
      </Text>

      <View className="flex-row items-center justify-between">
        {/* USD Input */}
        <View className="flex-1 mr-3">
          <Text className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-1">
            USD
          </Text>
          <CustomTextInput
            placeholder={`1 ${currencyDollar}`}
            value={usdValue}
            onChangeText={handleUsdChange}
            keyboardType="numeric"
          />
        </View>

        {/* Exchange Icon */}
        <View className="p-2 rounded-full bg-background dark:bg-dark-componentbg mt-5">
          <FontAwesome name="exchange" size={24} color="grey" />
        </View>

        {/* Bs Input */}
        <View className="flex-1 ml-3">
          <Text className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-1">
            Bs
          </Text>
          <CustomTextInput
            placeholder={`${exchangeRate.tasa_v} Bs`}
            value={bsValue}
            onChangeText={handleBsChange}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
};

export default ExchangeInput;

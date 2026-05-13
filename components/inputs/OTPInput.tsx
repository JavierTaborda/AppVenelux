import React, { useRef, useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';

type OTPInputProps = {
  onCodeFilled?: (code: string) => void;
};

const OTPInput: React.FC<OTPInputProps> = ({ onCodeFilled }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d$/.test(text) && text !== '') return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6 && !newCode.includes('')) {
      Keyboard.dismiss();
      onCodeFilled?.(fullCode);
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View className="mt-6 items-center">
      <View className="flex-row justify-between w-[92%] space-x-3">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputsRef.current[index] = ref;
            }}
            className="h-16 w-14 text-center text-[18px] rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-transparent dark:bg-dark-componentbg"
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>
    </View>
  );
};

export default OTPInput;
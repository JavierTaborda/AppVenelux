import OTPInput from '@/components/inputs/OTPInput';
import PhoneInput from '@/components/inputs/PhoneInput';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

export default function PhoneForm({
    phone, setPhone,
    otpCode, setOtpCode,
    isCodeSent, isSending,
    onSendCode, isPhoneValid, canResend, countdown
}: {
    phone: string;
    setPhone: (text: string) => void;
    otpCode: string;
    setOtpCode: (code: string) => void;
    isCodeSent: boolean;
    isSending: boolean;
    onSendCode: () => void;
    countdown: number;
    canResend: boolean;
    isPhoneValid: boolean;
}) {
    return (
        <>
            <PhoneInput value={phone} onChange={setPhone} />
            {!isCodeSent && isPhoneValid && (
                <TouchableOpacity
                    onPress={onSendCode}
                    disabled={isSending}
                    className={`mt-2 py-3 rounded-md items-center ${isSending ? 'bg-gray-300' : 'bg-primary'}`}
                >
                    {isSending ? <ActivityIndicator color="white" /> : (
                        <Text className="text-white font-semibold">Enviar código</Text>
                    )}
                </TouchableOpacity>
            )}
            {isCodeSent && (
                <>
                    <OTPInput onCodeFilled={setOtpCode} />
                    {canResend ? (
                        <TouchableOpacity onPress={onSendCode} className="mt-4 p-3 bg-primary rounded-md">
                            <Text className="text-white text-center font-semibold">Reenviar código</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text className="mt-2 text-center text-mutedForeground text-sm">
                            Puedes reenviar en {countdown}s
                        </Text>
                    )}
                </>

            )}
        </>
    );
}

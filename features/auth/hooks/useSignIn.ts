import { useAuthStore } from '@/stores/useAuthStore';
import { authenticateWithBiometrics } from '@/utils/biometricAuth';
import * as AuthSession from 'expo-auth-session';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export function useSignIn() {
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+58');
  const [otpCode, setOtpCode] = useState('');

  // Method Auth
  const [method, setMethod] = useState<'password' | 'phone' | 'emailOtp'>('password');

  // Otp state
  const [isSending, setIsSending] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown OTP
  const [otpCountdown, setOtpCountdown] = useState(0);

  const { signIn, signInOTP, sendCodeOTP, restoreSessionWithBiometrics } = useAuthStore();

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const isPhoneValid = useMemo(() => /^\+58\d{10}$/.test(phone), [phone]);

  const canResendOtp = otpCountdown === 0;

  const isFormValid = useMemo(() => {
    if (method === 'password') return email && password;
    if (method === 'phone') return isPhoneValid && otpCode.length === 6;
    if (method === 'emailOtp') return isEmailValid && otpCode.length === 6;
    return false;
  }, [email, password, phone, otpCode, method]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpCountdown]);

  const redirect = () => router.replace('../(main)/(home)/');

  const handleSignIn = async () => {
    if (!isFormValid) return Alert.alert('Error', 'Completa todos los campos.');

    setIsLoading(true);
    let res;

    if (method === 'password') {
      res = await signIn(email, password);
    } else {
      const target = method === 'phone' ? phone : email;
      const channel = method === 'phone' ? 'sms' : 'email';
      res = await signInOTP(target, otpCode, channel);
    }

    setIsLoading(false);
    if (res?.error){ 
      Alert.alert('Ups... Ocurrió un error.', res.error.message);
      //console.log(res.error.message)
    }
    else redirect();
  };

  const sendOtp = async () => {
    const target = method === 'phone' ? phone : email;
    const channel = method === 'phone' ? 'phone' : 'email';

    if (channel === 'phone' && !isPhoneValid) return Alert.alert('Error', 'Número inválido');
    if (channel === 'email' && !isEmailValid) return Alert.alert('Error', 'Correo inválido');

    setIsSending(true);
    const redirectUri = AuthSession.makeRedirectUri({ native: 'authsupabaseapp://redirect' });
    const res = await sendCodeOTP(target, channel, redirectUri);

    setIsSending(false);
    if (res?.error) return Alert.alert('Error', res.error.message);

    setIsCodeSent(true);
    setOtpCountdown(60);
    Alert.alert('Código enviado', channel === 'phone' ? 'Revisa tu SMS' : 'Revisa tu correo');
  };

  const handleBiometricLogin = async () => {
    const ok = await authenticateWithBiometrics();
    if (!ok) return;

    const { error } = await restoreSessionWithBiometrics();
    if (error) return Alert.alert('Error', error.message);

    redirect();
  };

  return {
    email, setEmail,
    password, setPassword,
    phone, setPhone,
    otpCode, setOtpCode,

    method, setMethod,

    isLoading,
    isSending,
    isCodeSent,
    otpCountdown,
    canResendOtp,
    isFormValid,
    isEmailValid,
    isPhoneValid,

    handleSignIn,
    sendOtp,
    handleBiometricLogin,
  };
}

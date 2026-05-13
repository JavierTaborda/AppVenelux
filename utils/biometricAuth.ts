import * as LocalAuthentication from 'expo-local-authentication';

/**
 * This function checks if the device supports biometric authentication
 * and if the user has enrolled any biometrics. If both conditions are met,
 * it prompts the user to authenticate using biometrics.
 *
 */

const trys = 2;
export async function authenticateWithBiometrics(): Promise<boolean | null> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return null; 
  }

  let attempts = 0;
  let auth = false;

  while (attempts < 2 && !auth) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Usa tu biometría para ingresar',
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar PIN'
    });

    if (result.success) {
      auth = true;
    } else {
      attempts++;
    }
  }

  return auth;
}
import { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
const { height } = Dimensions.get('window');

export default function PasswordRecoveryModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');

  const styles = StyleSheet.create({
    modalContainer: {
      height: height * 0.8,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      gap: 20,

    },
  });

  return (
    <>

      <TouchableOpacity onPress={() => setVisible(true)}>
        <Text className="text-primary dark:text-primary-light font-semibold">
          Olvidé mi contraseña
        </Text>
      </TouchableOpacity>

      {/* Modal  swipe */}
      {/* <Modal
        isVisible={visible}
        swipeDirection="down"
        onSwipeComplete={() => setVisible(false)}
        onBackdropPress={() => setVisible(false)}
        style={{
          justifyContent: 'flex-end', margin: 0,
          width: '100%'
        }}
        backdropOpacity={0.6}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View className="bg-background dark:bg-dark-background" style={styles.modalContainer}>
              <View className="p-4 gap-4">

                <Text className="text-2xl font-bold text-center mb-2  text-foreground dark:text-dark-foreground">
                  Recuperar contraseña
                </Text>


                <Text className="text-base  text-foreground dark:text-dark-foreground text-start mb-2">
                  Ingresa tu correo electrónico para recibir instrucciones de recuperación de contraseña.
                </Text>


                <EmailInput value={email} onChangeText={setEmail}/>

                <TouchableOpacity
                  className="bg-primary dark:bg-dark-primary rounded-xl p-4 items-center"
                  onPress={() => {
                    if (!email.trim()) {
                      alert('Por favor ingresa tu correo electrónico.');
                      return;
                    }
                    alert(`Se enviará un correo de recuperación a: ${email}`);
                    setVisible(false);
                  }}
                >
                  <Text className="text-white font-bold text-lg">Enviar</Text>
                </TouchableOpacity>


                <View className="flex-row justify-center items-center mt-4">
                  <TouchableOpacity onPress={() => setVisible(false)}>
                    <Text className="text-primary dark:text-primary-light font-semibold">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal> */}
    </>
  );
}
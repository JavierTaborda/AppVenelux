import BottomModal from "@/components/ui/BottomModal";
import CustomImagen from "@/components/ui/CustomImagen";
import type { VeneluxMaterial } from "@/features/request/types/request";
import { appTheme } from "@/utils/appTheme";
import { pickFromCamera, pickFromGallery } from "@/utils/pickImage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

type ManualItemSubmit = {
  item: VeneluxMaterial;
  quantity: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: ManualItemSubmit) => void;
};

export default function NewManualItemModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [formCodigo, setFormCodigo] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formUnidad, setFormUnidad] = useState("");
  const [formMarca, setFormMarca] = useState("");
  const [formLinea, setFormLinea] = useState("");
  const [formSublinea, setFormSublinea] = useState("");
  const [formNoParte, setFormNoParte] = useState("");
  const [formQty, setFormQty] = useState("1");
  const [formImageUri, setFormImageUri] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => formMaterial.trim().length > 0,
    [formMaterial],
  );

  const resetForm = () => {
    setFormCodigo("");
    setFormMaterial("");
    setFormUnidad("");
    setFormMarca("");
    setFormLinea("");
    setFormSublinea("");
    setFormNoParte("");
    setFormQty("1");
    setFormImageUri(null);
    setFocusedField(null);
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePickImage = () => {
    Alert.alert("Imagen referencial", "Selecciona una fuente", [
      {
        text: "Camara",
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) setFormImageUri(uri);
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const uris = await pickFromGallery();
          if (uris?.length) setFormImageUri(uris[0]);
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSubmit = () => {
    const cleanMaterial = formMaterial.trim();
    if (!cleanMaterial) {
      Alert.alert("Falta descripcion", "Agrega el nombre del material.");
      return;
    }

    const quantity = Math.max(1, Number(formQty.replace(/[^0-9]/g, "")) || 1);
    const code = formCodigo.trim() || `MAN-${Date.now().toString().slice(-6)}`;

    const customItem: VeneluxMaterial = {
      codigo: code,
      material: cleanMaterial,
      coduni: formUnidad.trim() || null,
      nroparte: formNoParte.trim() || null,
      codbarra: null,
      unidad: formUnidad.trim() || null,
      linea: formLinea.trim() || null,
      sublinea: formSublinea.trim() || null,
      categoria: "Manual",
      precio: null,
      codart: null,
      marca: formMarca.trim() || null,
      noparte: formNoParte.trim() || null,
      imagen1: formImageUri,
      imagen2: null,
      imagen3: null,
    };

    onSubmit({ item: customItem, quantity });
    handleClose();
  };

  const inputClass = (field: string, required = false) => {
    const isFocused = focusedField === field;
    const hasError = required && !formMaterial.trim() && field === "material";
    if (isFocused) {
      return "border-primary dark:border-dark-primary bg-white dark:bg-neutral-900";
    }
    if (hasError) {
      return "border-red-400 dark:border-red-500 bg-white dark:bg-neutral-900";
    }
    return "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900";
  };

  return (
    <BottomModal
      visible={visible}
      onClose={handleClose}
      heightPercentage={0.82}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1">
          <View className="flex-row items-start justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <View className="flex-1 pr-3">
              <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50">
                Agregar item
              </Text>
              <Text className="text-base text-neutral-600 dark:text-neutral-300 mt-1">
                Material fuera de base de datos
              </Text>
              {/* <View className="self-start mt-2.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-500/20">
                <Text className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Campos con * son obligatorios
                </Text>
              </View> */}
            </View>
            <Pressable
              onPress={handleClose}
              className="w-12 h-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 180, paddingTop: 18 }}
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={handlePickImage}
              className="rounded-2xl border border-dashed border-primary/50 dark:border-dark-primary/60 p-3 mb-4 bg-primary/5 dark:bg-dark-primary/10"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 items-center justify-center">
                  {formImageUri ? (
                    <CustomImagen img={formImageUri} />
                  ) : (
                    <Ionicons name="image-outline" size={34} color="#6B7280" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    Imagen referencial
                  </Text>
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Toca para abrir camara o galeria
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={appTheme.primary.DEFAULT}
                />
              </View>
            </Pressable>

            <View className="gap-4">
              <View>
                <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Codigo (opcional)
                </Text>
                <TextInput
                  value={formCodigo}
                  onChangeText={setFormCodigo}
                  onFocus={() => setFocusedField("codigo")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej:MM000000"
                  placeholderTextColor="#9CA3AF"
                  className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("codigo")}`}
                />
              </View>

              <View>
                <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Descripcion del material
                </Text>
                <TextInput
                  value={formMaterial}
                  onChangeText={setFormMaterial}
                  onFocus={() => setFocusedField("material")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej: Tornillo autorroscante 1/4"
                  placeholderTextColor="#9CA3AF"
                  className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("material", true)}`}
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Unidad
                  </Text>
                  <TextInput
                    value={formUnidad}
                    onChangeText={setFormUnidad}
                    onFocus={() => setFocusedField("unidad")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="UND"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("unidad")}`}
                  />
                </View>

                <View className="w-36">
                  <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Cantidad
                  </Text>
                  <TextInput
                    value={formQty}
                    onChangeText={setFormQty}
                    onFocus={() => setFocusedField("qty")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("qty")}`}
                  />
                </View>
              </View>

              <View className="flex-col gap-3">
                <View className="flex-1">
                  <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Marca
                  </Text>
                  <TextInput
                    value={formMarca}
                    onChangeText={setFormMarca}
                    onFocus={() => setFocusedField("marca")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Opcional"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("marca")}`}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Nro. parte
                  </Text>
                  <TextInput
                    value={formNoParte}
                    onChangeText={setFormNoParte}
                    onFocus={() => setFocusedField("nroparte")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Opcional"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("nroparte")}`}
                  />
                </View>
              </View>

              <View className="flex-col gap-3">
                <View className="flex-1">
                  <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Línea
                  </Text>
                  <TextInput
                    value={formLinea}
                    onChangeText={setFormLinea}
                    onFocus={() => setFocusedField("linea")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Opcional"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("linea")}`}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Sublínea
                  </Text>
                  <TextInput
                    value={formSublinea}
                    onChangeText={setFormSublinea}
                    onFocus={() => setFocusedField("sublinea")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Opcional"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("sublinea")}`}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="absolute bottom-2 left-0 right-0 px-3 pb-7 pt-4 border-t border-neutral-200 dark:border-neutral-900">
            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              className={`w-full h-16 rounded-full items-center justify-center ${
                canSubmit
                  ? "bg-primary dark:bg-white"
                  : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            >
              <Text
                className={`text-xl font-bold ${
                  canSubmit ? "text-white dark:text-black" : "text-neutral-500"
                }`}
              >
                Agregar a solicitud
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomModal>
  );
}

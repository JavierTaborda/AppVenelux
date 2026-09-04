import BottomModal from "@/components/ui/BottomModal";
import CustomImagen from "@/components/ui/CustomImagen";
import type { VeneluxMaterial } from "@/features/request/types/request";
import { appTheme } from "@/utils/appTheme";
import { uploadMultipleMaterialImages } from "@/utils/materialImages";
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
const MAX_MANUAL_IMAGES = 3;

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
  const toUpperText = (value: string) => value.toUpperCase();
  const toUpperTrimmed = (value: string) => value.trim().toUpperCase();

  const [formCodigo, setFormCodigo] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formUnidad, setFormUnidad] = useState("");
  const [formMarca, setFormMarca] = useState("");
  const [formLinea, setFormLinea] = useState("");
  const [formSublinea, setFormSublinea] = useState("");
  const [formNoParte, setFormNoParte] = useState("");
  const [formQty, setFormQty] = useState("1");
  const [formImageUris, setFormImageUris] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
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
    setFormImageUris([null, null, null]);
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

  const setImageAt = (index: number, uri: string | null) => {
    setFormImageUris((prev) => {
      const next = [...prev];
      next[index] = uri;
      return next;
    });
  };

  const handlePickImage = (index: number) => {
    Alert.alert(`Imagen ${index + 1}`, "Selecciona una fuente", [
      {
        text: "Camara",
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) setImageAt(index, uri);
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const uris = await pickFromGallery();
          if (uris?.length) setImageAt(index, uris[0]);
        },
      },
      ...(formImageUris[index]
        ? [
            {
              text: "Eliminar",
              style: "destructive" as const,
              onPress: () => setImageAt(index, null),
            },
          ]
        : []),
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    const cleanMaterial = toUpperTrimmed(formMaterial);
    if (!cleanMaterial) {
      Alert.alert("Falta descripcion", "Agrega el nombre del material.");
      return;
    }

    const quantity = Math.max(1, Number(formQty.replace(/[^0-9]/g, "")) || 1);
    const code =
      toUpperTrimmed(formCodigo) || `MAN-${Date.now().toString().slice(-6)}`;

    let uploadedImages: (string | null)[] = [null, null, null];

    try {
      const selectedImages = formImageUris.filter((uri): uri is string =>
        Boolean(uri),
      );
      const { uploadedUrls } = await uploadMultipleMaterialImages(
        selectedImages,
        code,
      );
      uploadedImages = [
        uploadedUrls[0] ?? null,
        uploadedUrls[1] ?? null,
        uploadedUrls[2] ?? null,
      ];
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron guardar las imágenes.";
      Alert.alert(
        "No se pudieron guardar las imágenes",
        message.includes("iniciar sesión")
          ? message
          : "Revisa tu conexión e intenta nuevamente.",
      );
      return;
    }

    const customItem: VeneluxMaterial = {
      codigomaterial: code,
      material: cleanMaterial,
      coduni: toUpperTrimmed(formUnidad) || null,
      nroparte: toUpperTrimmed(formNoParte) || null,
      codbarra: null,
      unidad: toUpperTrimmed(formUnidad) || null,
      linea: toUpperTrimmed(formLinea) || null,
      sublinea: toUpperTrimmed(formSublinea) || null,
      categoria: "Manual",
      precio: null,
      codart: null,
      marca: toUpperTrimmed(formMarca) || null,
      noparte: toUpperTrimmed(formNoParte) || null,
      imagen1: uploadedImages[0],
      imagen2: uploadedImages[1],
      imagen3: uploadedImages[2],
      observacion: null,
      materialnuevo: false,
      autorizado: false,
      fechaautorizado: null,
      autorizadopor: null,
      cantidadautorizada: 0,
      cantidaddespacho: 0,
      cantidaddisponible: 0,
      cantidadsolicitada: quantity,
      almacendespacho: null,
      cantidadcompra: 0,
      comprar: false,
      precioventa: 0,
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
            <View className="mb-4 gap-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    Imágenes referenciales
                  </Text>
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Agrega hasta tres imágenes para guardarlas en Supabase
                  </Text>
                </View>

                <Ionicons
                  name="images-outline"
                  size={22}
                  color={appTheme.primary.DEFAULT}
                />
              </View>

              <View className="flex-row gap-2">
                {formImageUris.map((uri, index) => (
                  <Pressable
                    key={`manual-image-slot-${index}`}
                    onPress={() => handlePickImage(index)}
                    className="flex-1 rounded-2xl border border-dashed border-primary/50 dark:border-dark-primary/60 p-2 bg-primary/5 dark:bg-dark-primary/10"
                  >
                    <View className="h-24 items-center justify-center overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
                      {uri ? (
                        <CustomImagen img={uri} />
                      ) : (
                        <View className="items-center justify-center gap-1">
                          <Ionicons
                            name="image-outline"
                            size={30}
                            color="#6B7280"
                          />
                          <Text className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                            Imagen {index + 1}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="mt-2 text-center text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
                      {uri ? "Cambiar" : "Agregar"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-4">
              {/* <View>
                <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Codigomaterial (opcional)
                </Text>
                <TextInput
                  value={formCodigo}
                  onChangeText={setFormCodigo}
                  onFocus={() => setFocusedField("codigomaterial")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ej:MM000000"
                  placeholderTextColor="#9CA3AF"
                  className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("codigomaterial")}`}
                />
              </View> */}

              <View>
                <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Descripcion del material
                </Text>
                <TextInput
                  value={formMaterial}
                  onChangeText={(text) => setFormMaterial(toUpperText(text))}
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
                    onChangeText={(text) => setFormUnidad(toUpperText(text))}
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
                    onChangeText={(text) => setFormMarca(toUpperText(text))}
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
                    onChangeText={(text) => setFormNoParte(toUpperText(text))}
                    onFocus={() => setFocusedField("nroparte")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Opcional"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("nroparte")}`}
                  />
                </View>
              </View>

              {/* <View className="flex-col gap-3">
                <View className="flex-1">
                  <Text className="text-md font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Línea
                  </Text>
                  <TextInput
                    value={formLinea}
                    onChangeText={(text) => setFormLinea(toUpperText(text))}
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
                    onChangeText={(text) => setFormSublinea(toUpperText(text))}
                    onFocus={() => setFocusedField("sublinea")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Opcional"
                    placeholderTextColor="#9CA3AF"
                    className={`border rounded-xl px-4 py-4 text-base text-neutral-900 dark:text-neutral-100 ${inputClass("sublinea")}`}
                  />
                </View>
              </View> */}
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

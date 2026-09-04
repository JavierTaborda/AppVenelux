import { supabase } from "@/lib/supabase";
import * as ImageManipulator from "expo-image-manipulator";

export const MATERIAL_IMAGES_BUCKET = "venelux_materiales";

async function ensureUploadUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    return user.id;
  }

  throw new Error("Debes iniciar sesión para subir imágenes.");
}

function getFileNameBase(materialCode?: string, index?: number) {
  const safeCode = materialCode?.trim() || "anon";
  const suffix = typeof index === "number" ? `-${index + 1}` : "";

  return `${safeCode}-${Date.now()}${suffix}`;
}

export async function pickAndUploadMaterialImage(
  fileUri: string,
  materialCode?: string,
  index?: number,
) {
  try {
    const userId = await ensureUploadUserId();

    const manipResult = await ImageManipulator.manipulateAsync(
      fileUri,
      [{ resize: { width: 1920 } }],
      {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.WEBP,
        base64: true,
      },
    );

    const response = await fetch(manipResult.uri);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fileName = `${getFileNameBase(materialCode, index)}.webp`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from(MATERIAL_IMAGES_BUCKET)
      .upload(filePath, uint8Array, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/webp",
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(MATERIAL_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return {
      publicUrl: data.publicUrl,
      filePath,
      base64: manipResult.base64,
    };
  } catch (error) {
    console.error("Error subiendo imagen de material:", error);
    throw error;
  }
}

export async function uploadMultipleMaterialImages(
  images: string[],
  materialCode?: string,
) {
  const uploadedUrls: string[] = [];
  const uploadedPaths: string[] = [];

  for (const [index, image] of images.entries()) {
    const result = await pickAndUploadMaterialImage(image, materialCode, index);

    uploadedUrls.push(result.publicUrl);
    uploadedPaths.push(result.filePath);
  }

  return { uploadedUrls, uploadedPaths };
}

export async function deleteMaterialImage(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from(MATERIAL_IMAGES_BUCKET)
      .remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error eliminando imagen de material:", error);
    return false;
  }
}
import { supabase } from "./supabase.js";
import { v4 as uuidv4 } from "npm:uuid";

export async function uploadImageToSupabase(
  image,
  folder = "products",
  bucket = "product-images"
) {
  try {
    const fileName = `${folder}/${uuidv4()}.jpg`;
    const binary = atob(image.split(",")[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) return { error };

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { publicUrl };
  } catch (error) {
    return { error };
  }
}

export async function deleteImageFromSupabase(
  imageUrl,
  bucket = "product-images"
) {
  try {
    const url = new URL(imageUrl);
    const idx = url.pathname.indexOf(bucket);
    if (idx === -1) return { error: "Invalid bucket in URL" };
    const fileName = url.pathname.slice(idx + bucket.length + 1);

    const { error } = await supabase.storage.from(bucket).remove([fileName]);
    return { error };
  } catch (error) {
    return { error };
  }
}

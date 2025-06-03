import { supabase } from "./supabase.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a base64 image to Supabase Storage.
 * @param {string} image - Base64 image data.
 * @param {string} folder - Folder name in bucket (default: 'products').
 * @param {string} bucket - Bucket name (default: 'product-images').
 */
export async function uploadImageToSupabase(
  image,
  folder = "products",
  bucket = "product-images"
) {
  try {
    const fileName = `${folder}/${uuidv4()}.jpg`;
    const buffer = Buffer.from(image.split(",")[1], "base64");
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
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

/**
 * Delete an image from Supabase Storage by its public URL.
 * @param {string} imageUrl - Full public URL.
 * @param {string} bucket - Bucket name (default: 'product-images').
 */
export async function deleteImageFromSupabase(
  imageUrl,
  bucket = "product-images"
) {
  try {
    // Extract file path relative to bucket
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

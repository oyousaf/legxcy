import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export const uploadImageToSupabase = async (image, folder = "products") => {
  try {
    const fileName = `${folder}/${uuidv4()}.jpg`;
    const base64 = image.split(",")[1];
    const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) return { error };

    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return { publicUrl: publicData?.publicUrl };
  } catch (error) {
    return { error };
  }
};

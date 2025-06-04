import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export const uploadImageToSupabase = async (image, folder = "products") => {
  try {
    let fileName = `${folder}/${uuidv4()}.jpg`;
    let fileData,
      contentType = "image/jpeg";

    if (typeof image !== "string" && image instanceof File) {
      fileData = image;
      if (image.type) contentType = image.type;
      if (image.name && image.name.includes(".")) {
        fileName = `${folder}/${uuidv4()}${image.name.slice(
          image.name.lastIndexOf(".")
        )}`;
      }
    } else if (typeof image === "string" && image.startsWith("data:")) {
      const matches = image.match(/^data:(.+);base64,(.*)$/);
      if (!matches) throw new Error("Invalid base64 image data");
      contentType = matches[1];
      const base64 = matches[2];
      fileData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    } else {
      throw new Error("Unsupported image format");
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, fileData, { contentType, upsert: true });

    if (error) return { error };

    // Get the public URL
    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return { publicUrl: publicData?.publicUrl, path: fileName };
  } catch (error) {
    return { error };
  }
};

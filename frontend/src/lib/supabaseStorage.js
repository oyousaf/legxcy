import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export const uploadImageToSupabase = async (image) => {
  try {
    // Generate a unique file name with the correct extension
    let fileName = `${uuidv4()}.jpg`;
    let fileData;
    let contentType = "image/jpeg";

    if (typeof image !== "string" && image instanceof File) {
      fileData = image;
      if (image.type) contentType = image.type;
      if (image.name && image.name.includes(".")) {
        fileName = `${uuidv4()}${image.name.slice(
          image.name.lastIndexOf(".")
        )}`;
      }
    } else if (typeof image === "string" && image.startsWith("data:")) {
      const matches = image.match(/^data:(.+);base64,(.*)$/);
      if (!matches) throw new Error("Invalid base64 image data");
      contentType = matches[1];
      const base64 = matches[2];
      fileData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      if (contentType && contentType.includes("/")) {
        const ext = contentType.split("/")[1];
        fileName = `${uuidv4()}.${ext}`;
      }
    } else {
      throw new Error("Unsupported image format");
    }

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, fileData, { contentType, upsert: true });

    if (error) return { error };

    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return { publicUrl: publicData?.publicUrl, path: fileName };
  } catch (error) {
    return { error };
  }
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGES = 3;
export const MAX_UPLOAD_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB ?? 10
);

/** Devuelve un mensaje de error para el archivo, o null si es válido. */
export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" no es una imagen admitida. Usa JPG, PNG o WebP.`;
  }
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" pesa más de ${MAX_UPLOAD_SIZE_MB} MB.`;
  }
  return null;
}

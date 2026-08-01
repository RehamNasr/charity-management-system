import { z } from 'zod';

/**
 * Client-side (unsigned) Cloudinary uploads. This app is a browser-only SPA with no backend to
 * safely hold an API secret, so it must never sign requests itself — Cloudinary's supported
 * pattern for that case is an "unsigned" upload preset configured in the Cloudinary dashboard
 * (Settings → Upload → Upload presets → Signing Mode: Unsigned), which restricts what an
 * unsigned upload is allowed to do. Only the public cloud name + preset name are needed here;
 * neither the API key nor the API secret should ever appear in this codebase.
 */
const envSchema = z.object({
  VITE_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'VITE_CLOUDINARY_CLOUD_NAME is required'),
  VITE_CLOUDINARY_UPLOAD_PRESET: z.string().min(1, 'VITE_CLOUDINARY_UPLOAD_PRESET is required'),
});

function parseEnv() {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  - ${issue.message}`).join('\n');
    throw new Error(
      `Missing or invalid Cloudinary environment configuration.\n${issues}\n` +
        'Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env ' +
        '(see .env.example).',
    );
  }
  return result.data;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

interface CloudinaryErrorResponse {
  error?: { message?: string };
}

/**
 * Uploads a file directly from the browser to Cloudinary via its unsigned upload endpoint.
 * `folder` is a hint only — an upload preset can be configured to ignore or override it.
 */
export async function uploadToCloudinary(file: File, folder?: string): Promise<CloudinaryUploadResult> {
  const env = parseEnv();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as CloudinaryErrorResponse | null;
    throw new Error(errorBody?.error?.message ?? 'فشل رفع الملف إلى Cloudinary');
  }

  const data = (await response.json()) as CloudinaryUploadResponse;
  return { url: data.secure_url, publicId: data.public_id };
}

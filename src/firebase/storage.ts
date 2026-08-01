import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type StorageReference,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';

export function storageRef(path: string): StorageReference {
  return ref(storage, path);
}

export interface UploadFileOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Uploads a file and resolves with its download URL. Progress is reported via `onProgress`
 * (0–100) so upload UI can show a determinate progress bar rather than an indeterminate spinner.
 */
export async function uploadFile(
  path: string,
  file: File,
  options?: UploadFileOptions,
): Promise<string> {
  const fileRef = storageRef(path);
  const task = uploadBytesResumable(fileRef, file);

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        if (options?.onProgress) {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress(percent);
        }
      },
      reject,
      () => resolve(),
    );
  });

  return getDownloadURL(fileRef);
}

export async function deleteFile(path: string): Promise<void> {
  await deleteObject(storageRef(path));
}

export async function getFileURL(path: string): Promise<string> {
  return getDownloadURL(storageRef(path));
}

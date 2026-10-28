import { Injectable, inject } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  UploadMetadata,
} from 'firebase/storage';
import { FirebaseAppService } from './firebase-app.service';
import { AuthService } from './auth.service';

export interface StorageUploadResult {
  path: string;
  downloadUrl: string;
  name: string;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly firebaseAppService = inject(FirebaseAppService);
  private readonly authService = inject(AuthService);

  private get storage() {
    return this.firebaseAppService.storage;
  }

  /**
   * Sube un archivo a Cloud Storage organizado por módulo y registro asociado.
   * Estructura: /{moduleName}/{recordId}/{fileName}
   */
  async uploadFile(
    moduleName: string,
    recordId: string,
    file: File
  ): Promise<StorageUploadResult> {
    const currentUserId = this.authService.currentUser()?.uid ?? 'anonymous';
    const filePath = `${moduleName}/${recordId}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    const metadata: UploadMetadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: currentUserId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      path: filePath,
      downloadUrl,
      name: file.name,
      size: file.size,
    };
  }

  async getDownloadUrl(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    return deleteObject(storageRef);
  }
}

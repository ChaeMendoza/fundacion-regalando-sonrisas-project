import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from 'firebase/firestore';
import { FirebaseAppService } from './firebase-app.service';
import { AuthService } from './auth.service';

export interface BaseEntity {
  id?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly firebaseAppService = inject(FirebaseAppService);
  private readonly authService = inject(AuthService);

  private get db() {
    return this.firebaseAppService.firestore;
  }

  getCollectionRef<T = DocumentData>(collectionName: string): CollectionReference<T> {
    return collection(this.db, collectionName) as CollectionReference<T>;
  }

  getDocRef<T = DocumentData>(collectionName: string, id: string): DocumentReference<T> {
    return doc(this.db, collectionName, id) as DocumentReference<T>;
  }

  async getDocument<T extends BaseEntity>(collectionName: string, id: string): Promise<T | null> {
    const docRef = this.getDocRef<T>(collectionName, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return { id: snapshot.id, ...snapshot.data() } as T;
  }

  async getCollection<T extends BaseEntity>(collectionName: string): Promise<T[]> {
    const colRef = this.getCollectionRef<T>(collectionName);
    const q = query(colRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        }) as T
    );
  }

  async createDocument<T extends BaseEntity>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive'>
  ): Promise<string> {
    const currentUserId = this.authService.currentUser()?.uid ?? 'system';
    const now = new Date().toISOString();

    const payload = {
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    };

    const colRef = this.getCollectionRef(collectionName);
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  }

  async updateDocument<T extends BaseEntity>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    const currentUserId = this.authService.currentUser()?.uid ?? 'system';
    const docRef = this.getDocRef(collectionName, id);

    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUserId,
    };

    await updateDoc(docRef, payload as DocumentData);
  }

  /**
   * Desactivación lógica (Soft delete) para mantener trazabilidad e historial.
   * Regla de negocio: No se eliminan físicamente registros con valor histórico.
   */
  async deactivateDocument(collectionName: string, id: string): Promise<void> {
    return this.updateDocument(collectionName, id, { isActive: false });
  }
}

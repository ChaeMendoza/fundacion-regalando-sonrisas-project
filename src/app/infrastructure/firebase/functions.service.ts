import { Injectable, inject } from '@angular/core';
import { HttpsCallableResult, httpsCallable } from 'firebase/functions';
import { FirebaseAppService } from './firebase-app.service';

@Injectable({
  providedIn: 'root',
})
export class FunctionsService {
  private readonly firebaseAppService = inject(FirebaseAppService);

  private get functions() {
    return this.firebaseAppService.functions;
  }

  /**
   * Invoca una función segura en Cloud Functions.
   */
  async call<TRequest = unknown, TResponse = unknown>(
    functionName: string,
    data?: TRequest
  ): Promise<TResponse> {
    const callable = httpsCallable<TRequest, TResponse>(this.functions, functionName);
    const result: HttpsCallableResult<TResponse> = await callable(data);
    return result.data;
  }
}

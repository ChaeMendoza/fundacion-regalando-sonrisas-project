import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  private readonly items = signal<ToastNotification[]>([]);
  readonly notifications = this.items.asReadonly();

  show(type: ToastType, title: string, message: string, durationMs = 4500): void {
    const id = this.nextId++;
    this.items.update((list) => [...list, { id, type, title, message }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message, 6500);
  }

  warning(title: string, message: string): void {
    this.show('warning', title, message, 5500);
  }

  info(title: string, message: string): void {
    this.show('info', title, message);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((item) => item.id !== id));
  }
}

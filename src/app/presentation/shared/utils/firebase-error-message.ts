const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied':
    'No tienes permisos suficientes para realizar esta operación en la base de datos.',
  unauthenticated: 'Tu sesión ha expirado. Vuelve a iniciar sesión para continuar.',
  'not-found': 'El registro solicitado no existe o ya no está disponible.',
  unavailable: 'El servicio de Firebase no está disponible temporalmente. Intenta de nuevo.',
  'deadline-exceeded': 'La operación tardó demasiado tiempo. Verifica tu conexión e inténtalo de nuevo.',
  'storage/unauthorized': 'No tienes permisos para subir o descargar este archivo.',
  'storage/canceled': 'La subida del archivo fue cancelada.',
  'storage/object-not-found': 'El archivo solicitado no existe en el almacenamiento.',
  'storage/quota-exceeded': 'Se alcanzó el límite de almacenamiento disponible.',
};

export function getFirebaseErrorMessage(error: unknown, fallback: string): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';

  if (code && FIREBASE_ERROR_MESSAGES[code]) {
    return FIREBASE_ERROR_MESSAGES[code];
  }

  if (error instanceof Error && error.message && !error.message.includes('FirebaseError')) {
    return error.message;
  }

  return fallback;
}

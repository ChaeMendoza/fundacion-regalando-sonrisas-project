const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
  'auth/user-not-found': 'No existe una cuenta con ese correo electrónico.',
  'auth/wrong-password': 'El correo o la contraseña no son correctos.',
  'auth/email-already-in-use': 'Ya existe una cuenta registrada con ese correo.',
  'auth/invalid-email': 'Ingresa un correo electrónico válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed':
    'No fue posible conectar. Revisa tu conexión e inténtalo de nuevo.',
  'auth/operation-not-allowed': 'El registro con correo y contraseña no está habilitado.',
};

export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';
  const message = AUTH_ERROR_MESSAGES[code];

  if (!message) {
    console.error('Error no reconocido durante la autenticación:', error);
    return 'No fue posible completar la solicitud. Inténtalo de nuevo más tarde.';
  }

  return message;
}

/**
 * Contrato para sincronizar los Custom Claims de Firebase Authentication con
 * el rol y estado aprobados en el perfil de Firestore.
 *
 * Las Security Rules consumen los claims para autorizar consultas a colecciones,
 * por lo que toda modificación de acceso debe propagarse al token del usuario.
 */
export abstract class UserAccessClaimsRepository {
  abstract sync(targetUid: string): Promise<void>;
}

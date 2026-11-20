import {
  LEGAL_DOCUMENT_LAST_UPDATED,
  LEGAL_DOCUMENT_VERSIONS,
} from '../../../domain/entities/legal-document.entity';
import { LegalDocument, legal } from './legal-document.model';

const { link, paragraph, list, note } = legal;

export const TERMS_OF_USE: LegalDocument = {
  title: 'Términos y Condiciones de Uso',
  subtitle:
    'Normas para el uso del portal institucional y del Sistema de Gestión Integral de la Fundación Regalando Sonrisas.',
  version: LEGAL_DOCUMENT_VERSIONS.terms,
  lastUpdated: LEGAL_DOCUMENT_LAST_UPDATED,
  intro: [
    'Estos términos regulan el uso del sitio web público y del Sistema de Gestión Integral de la Fundación Regalando Sonrisas. Al crear una cuenta manifiesta que ha leído y acepta estas condiciones. Si no está de acuerdo con ellas, no debe solicitar una cuenta.',
    'La versión vigente y su fecha de actualización se muestran al inicio de este documento. Cada cuenta queda asociada a la versión que aceptó en el momento de su registro.',
  ],
  sections: [
    {
      id: 'identificacion',
      title: 'Identificación y objeto de la plataforma',
      blocks: [
        paragraph(
          'El portal institucional y el Sistema de Gestión Integral son operados por la Fundación Regalando Sonrisas, organización sin fines de lucro con domicilio en Quito, Ecuador. Datos de identificación jurídica pendientes: [PENDIENTE: razón social o nombre registral, RUC, domicilio completo y correo institucional].',
        ),
        paragraph(
          'La plataforma tiene por objeto centralizar la información institucional y apoyar la gestión de beneficiarios, donaciones, voluntariado, actividades, solicitudes de apoyo y documentos de la Fundación. El portal público permite conocer la misión institucional y acceder a estos documentos sin necesidad de iniciar sesión.',
        ),
      ],
    },
    {
      id: 'servicio',
      title: 'Descripción general del servicio',
      blocks: [
        paragraph('El sistema ofrece dos ámbitos diferenciados:'),
        list([
          ['Portal público: información institucional, enlaces de acceso y documentos legales.'],
          [
            'Sistema interno: disponible únicamente para cuentas aprobadas. Incluye un panel administrativo, módulos de gestión y un perfil de usuario.',
          ],
        ]),
        paragraph(
          'El registro crea una solicitud de acceso con estado “pendiente” y perfil de usuario. Un administrador aprobado revisa la solicitud y puede aprobarla, rechazarla o deshabilitarla. Los tipos de usuario previstos son administrador y usuario; los valores “voluntario” y “personal autorizado” se conservan como categorías técnicas para futuras ampliaciones y no amplían por sí solos ningún permiso.',
        ),
        note(
          'Alcance del sistema',
          'La plataforma registra información y genera indicadores. No procesa pagos en línea, no emite facturas, no gestiona nómina ni envía comunicaciones por WhatsApp o SMS. Las donaciones se registran como información institucional, no como una operación de pago realizada en este sitio.',
        ),
      ],
    },
    {
      id: 'requisitos-cuenta',
      title: 'Requisitos para crear una cuenta',
      blocks: [
        paragraph('Para solicitar una cuenta es necesario:'),
        list([
          ['Proporcionar un nombre completo y un correo electrónico válidos.'],
          ['Definir una contraseña de al menos seis caracteres.'],
          ['Aceptar estos Términos y Condiciones de Uso.'],
          [
            'Confirmar que ha leído la Política de Privacidad y Tratamiento de Datos Personales y que ha sido informado sobre el tratamiento de sus datos.',
          ],
        ], true),
        paragraph(
          'Las dos últimas acciones son obligatorias e independientes. Ninguna casilla se encuentra marcada por defecto y el registro no se completa si falta alguna. La recepción de la información de privacidad no equivale a un consentimiento universal para cualquier tratamiento de datos.',
        ),
        paragraph(
          'La cuenta queda pendiente de aprobación. El acceso a los módulos internos depende del perfil aprobado y del rol asignado por la Fundación.',
        ),
      ],
    },
    {
      id: 'responsabilidades',
      title: 'Responsabilidades y obligaciones de los usuarios',
      blocks: [
        paragraph('Al utilizar la plataforma se compromete a:'),
        list([
          ['Usar el sistema con fines lícitos y relacionados con las funciones institucionales.'],
          ['Proporcionar información veraz, completa y actualizada.'],
          ['Proteger sus credenciales y notificar cualquier uso no autorizado del que tenga conocimiento.'],
          ['Respetar las instrucciones y controles de acceso establecidos por la Fundación.'],
          ['Abstenerse de intentar eludir las reglas de acceso o los controles de seguridad.'],
        ]),
        paragraph(
          'Los administradores aprobados, además, son responsables de revisar las solicitudes de acceso, mantener la información de los módulos bajo su cargo y registrar la información institucional de acuerdo con las facultades del sistema.',
        ),
      ],
    },
    {
      id: 'veracidad',
      title: 'Veracidad y actualización de la información proporcionada',
      blocks: [
        paragraph(
          'La información que ingrese debe corresponder a la realidad. La Fundación puede contrastarla con los antecedentes institucionales disponibles y solicitar aclaraciones cuando lo considere necesario.',
        ),
        paragraph(
          'Los usuarios pueden actualizar su nombre y número de teléfono desde su perfil. Los cambios de correo electrónico, rol o estado no se realizan desde el perfil: siguen el circuito de administración de cuentas previsto en el sistema.',
        ),
      ],
    },
    {
      id: 'credenciales',
      title: 'Responsabilidad sobre las credenciales de acceso',
      blocks: [
        paragraph(
          'El correo electrónico y la contraseña son de uso personal e intransferible. El sistema permite solicitar el restablecimiento de la contraseña mediante el correo asociado a la cuenta. No comparta su contraseña ni la conserve en lugares accesibles a terceros.',
        ),
        paragraph(
          'Si sospecha que otra persona conoce sus credenciales, debe cambiar la contraseña y comunicarlo al canal institucional indicado en la sección 16. El sistema no solicita la contraseña por correo electrónico; desconfíe de mensajes que lo hagan.',
        ),
      ],
    },
    {
      id: 'uso-adecuado',
      title: 'Uso adecuado de la plataforma',
      blocks: [
        paragraph(
          'El uso del sistema debe limitarse a las funciones habilitadas para el perfil de cada cuenta. La consulta y el registro de información de beneficiarios, donantes, voluntarios o solicitudes deben realizarse únicamente cuando exista una razón institucional y con la menor cantidad de datos necesarios.',
        ),
        paragraph(
          'Los archivos cargados en el módulo de gestión documental deben corresponder a la ficha o trámite al que se asocian. El sistema admite archivos de hasta 10 MB y aplica validaciones de tipo de archivo en la carga.',
        ),
      ],
    },
    {
      id: 'prohibiciones',
      title: 'Prohibiciones y actividades no permitidas',
      blocks: [
        paragraph('No está permitido:'),
        list([
          ['Acceder o intentar acceder a cuentas, módulos o información de otras personas.'],
          ['Modificar, copiar o difundir información institucional sin autorización.'],
          ['Introducir datos falsos, incompletos o que correspondan a otra persona.'],
          ['Intentar alterar reglas de acceso, evidencias de aceptación o bitácoras del sistema.'],
          ['Usar la plataforma para hostigar, discriminar, amenazar o realizar actividades ilícitas.'],
          ['Cargar archivos con contenido ajeno a la gestión institucional o que infrinja derechos de terceros.'],
          ['Realizar pruebas de carga, exploitar fallos o interferir en el funcionamiento del servicio.'],
          ['Utilizar la plataforma para enviar publicidad o comunicaciones no autorizadas.'],
        ]),
      ],
    },
    {
      id: 'acceso-cuentas',
      title: 'Condiciones de acceso, suspensión y cancelación de cuentas',
      blocks: [
        paragraph(
          'El acceso depende de que la cuenta esté aprobada y de que el rol asignado permita el módulo solicitado. Las cuentas pendientes, rechazadas o deshabilitadas no pueden ingresar a los módulos internos.',
        ),
        paragraph(
          'La Fundación puede rechazar, deshabilitar o cambiar el rol de una cuenta cuando existan razones institucionales, de seguridad o de cumplimiento normativo. Estas decisiones quedan registradas en la bitácora de auditoría del sistema y se reflejan en los controles de acceso.',
        ),
        paragraph(
          'No existe una función automática de cancelación de cuentas desde el perfil. Para solicitar la baja de una cuenta o el tratamiento de los datos asociados, utilice el canal de contacto de la sección 16. [PENDIENTE: definir el procedimiento interno de baja y de atención de solicitudes].',
        ),
      ],
    },
    {
      id: 'propiedad-intelectual',
      title: 'Propiedad intelectual y uso de los contenidos',
      blocks: [
        paragraph(
          'El logotipo, los textos institucionales, la estructura del portal y los contenidos del sistema pertenecen a la Fundación Regalando Sonrisas o a sus respectivos titulares. Su uso está permitido únicamente para los fines previstos en esta plataforma.',
        ),
        paragraph(
          'La información que cada usuario ingresa continúa siendo responsabilidad de la Fundación en su calidad de responsable del tratamiento y de la persona que la proporciona en cuanto a su veracidad. No se autoriza la reproducción, distribución o publicación de contenidos institucionales sin permiso previo. [PENDIENTE: confirmar titularidad de marcas, fotografías y demás materiales].',
        ),
      ],
    },
    {
      id: 'disponibilidad',
      title: 'Disponibilidad y mantenimiento',
      blocks: [
        paragraph(
          'La plataforma se publica mediante Firebase Hosting y sus datos se gestionan en servicios Firebase. Pueden existir interrupciones temporales por mantenimiento, actualizaciones, fallas de proveedores o causas ajenas al control de la Fundación.',
        ),
        paragraph(
          'No se ha implementado una notificación automática de interrupciones programadas. [PENDIENTE: definir el canal institucional de avisos]. No se ofrece garantía de disponibilidad ininterrumpida ni de conservación de información más allá de los criterios descritos en la política de privacidad.',
        ),
      ],
    },
    {
      id: 'limitacion',
      title: 'Limitación de responsabilidad',
      blocks: [
        paragraph(
          'Dentro de los límites permitidos por la legislación ecuatoriana, la Fundación no responderá por daños derivados del uso indebido de la plataforma, del incumplimiento de estos términos, de la pérdida de credenciales por parte del usuario o de interrupciones temporales del servicio.',
        ),
        paragraph(
          'Esta limitación no reduce los derechos irrenunciables de las personas ni exime a la Fundación de las responsabilidades que la ley no permite excluir, en particular en materia de protección de datos personales, seguridad de la información y derechos de niñas, niños y adolescentes.',
        ),
      ],
    },
    {
      id: 'datos-personales',
      title: 'Protección de datos personales y referencia a la política de privacidad',
      blocks: [
        paragraph(
          'El tratamiento de los datos personales recopilados a través de esta plataforma se rige por la Política de Privacidad y Tratamiento de Datos Personales, que forma parte de la información entregada al momento del registro.',
        ),
        paragraph(
          link('Política de Privacidad y Tratamiento de Datos Personales', '/politica-de-privacidad'),
        ),
        paragraph(
          'El registro deja constancia de la versión de los documentos aceptados, de la versión de la política cuya información fue recibida y de la fecha y hora de la aceptación. Esa constancia se conserva como evidencia del cumplimiento de los deberes de información y no autoriza tratamientos distintos a los descritos en la política.',
        ),
      ],
    },
    {
      id: 'modificaciones',
      title: 'Modificaciones de los términos',
      blocks: [
        paragraph(
          'La Fundación puede actualizar estos términos para reflejar cambios legales, técnicos o institucionales. Cada versión tendrá un número y una fecha de actualización visibles en esta página.',
        ),
        paragraph(
          'Las modificaciones sustanciales podrán requerir una nueva manifestación de aceptación. En ese caso se identificará a los usuarios que utilizan la versión anterior y se les solicitará la nueva aceptación antes de continuar con las funciones afectadas. No se registrará una aceptación retroactiva ficticia. [PENDIENTE: definir el canal de notificación de nuevas versiones].',
        ),
      ],
    },
    {
      id: 'legislacion',
      title: 'Legislación aplicable y jurisdicción ecuatoriana',
      blocks: [
        paragraph(
          'Estos términos se interpretan y aplican conforme a la legislación de la República del Ecuador, en especial la Constitución, la Ley Orgánica de Protección de Datos Personales, su Reglamento General y la normativa aplicable a las organizaciones de la sociedad civil.',
        ),
        paragraph(
          'Cualquier controversia derivada del uso de la plataforma se someterá a los tribunales competentes del Ecuador, con domicilio en la ciudad de Quito, sin perjuicio de los derechos de reclamación administrativa ante la autoridad de protección de datos personales.',
        ),
      ],
    },
    {
      id: 'contacto',
      title: 'Canales de contacto institucional',
      blocks: [
        paragraph(
          'Para consultas sobre el uso de la plataforma, solicitudes de acceso, cambios de cuenta o reportes de seguridad, utilice los siguientes datos:',
        ),
        list([
          ['Correo institucional: [PENDIENTE: correo oficial de contacto].'],
          ['Correo de protección de datos: [PENDIENTE: correo oficial de privacidad].'],
          ['Domicilio: [PENDIENTE: dirección completa en Quito, Ecuador].'],
          ['Teléfono: [PENDIENTE: teléfono institucional].'],
        ]),
        note(
          'Datos pendientes de configuración',
          'Los marcadores [PENDIENTE: ...] deben completarse con información institucional verificada antes de la publicación formal de este documento.',
        ),
      ],
    },
  ],
};

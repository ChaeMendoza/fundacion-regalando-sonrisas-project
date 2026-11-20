import {
  LEGAL_DOCUMENT_LAST_UPDATED,
  LEGAL_DOCUMENT_VERSIONS,
} from '../../../domain/entities/legal-document.entity';
import { LegalDocument, legal } from './legal-document.model';

const { link, paragraph, list, note, table } = legal;

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Política de Privacidad y Tratamiento de Datos Personales',
  subtitle:
    'Información clara sobre qué datos recopila la plataforma, para qué los usa, con qué base legal y cuáles son sus derechos.',
  version: LEGAL_DOCUMENT_VERSIONS.privacy,
  lastUpdated: LEGAL_DOCUMENT_LAST_UPDATED,
  intro: [
    'Esta política informa, de manera previa y comprensible, cómo trata la Fundación Regalando Sonrisas los datos personales que se recogen a través del portal público y del Sistema de Gestión Integral. Se aplica a quienes solicitan una cuenta, al personal institucional autorizado y a las personas cuyos datos son registrados en los módulos de gestión.',
    'La políticas se fundamentan en la Constitución de la República, la Ley Orgánica de Protección de Datos Personales (LOPDP), su Reglamento General y la normativa emitida por la autoridad competente. El hecho de haber recibido esta información al registrarse no significa que todos los tratamientos se basen en consentimiento: la base aplicable se indica para cada finalidad.',
  ],
  sections: [
    {
      id: 'responsable',
      title: 'Identificación del responsable del tratamiento',
      blocks: [
        paragraph(
          'El responsable del tratamiento es la Fundación Regalando Sonrisas, organización sin fines de lucro domiciliada en Quito, Ecuador. Los datos de identificación jurídica y de contacto aún no se encuentran disponibles en el repositorio, por lo que deben completarse antes de la publicación formal: [PENDIENTE: razón social o nombre registral, RUC o número de identificación institucional, domicilio completo, correo oficial de privacidad y teléfono].',
        ),
        paragraph(
          'La Fundación decide las finalidades y los medios del tratamiento realizado en esta plataforma. Los servicios tecnológicos que intervienen actúan como proveedores de la plataforma. [PENDIENTE: confirmar los acuerdos de tratamiento aplicables y si existe delegado de protección de datos, con sus datos de contacto].',
        ),
      ],
    },
    {
      id: 'objeto',
      title: 'Objeto y alcance de la política',
      blocks: [
        paragraph(
          'Esta política cubre el portal público, el formulario de registro, la gestión de sesión, los módulos internos y los archivos cargados en el sistema. No cubre sitios externos a los que el portal pueda dirigir al usuario, cuyas prácticas de privacidad se rigen por sus propias políticas.',
        ),
        paragraph(
          'La política se entrega en el momento del registro y puede consultarse en cualquier momento desde el pie del portal público y desde el formulario de acceso.',
        ),
      ],
    },
    {
      id: 'categorias',
      title: 'Categorías de datos personales recopilados',
      blocks: [
        paragraph('Según la función que se utilice, el sistema puede tratar:'),
        list([
          [
            'Datos de cuenta: identificador de usuario asignado por Firebase Authentication, correo electrónico, nombre completo, contraseña gestionada por el servicio de autenticación y, si se usan, fotografía y número de teléfono. Las contraseñas no se guardan en las colecciones de Firestore.',
          ],
          [
            'Datos de control de acceso: rol asignado, estado de la cuenta, fechas de creación, actualización y aprobación, y motivo de rechazo cuando corresponda.',
          ],
          [
            'Evidencias de aceptación: versión de los términos, versión de la política informada, fecha y hora generadas por el servidor y el estado de cada manifestación.',
          ],
          [
            'Datos de beneficiarios: nombre completo, documento de identidad, teléfono, correo opcional, sector, dirección, tamaño del hogar, número de dependientes, rango de ingresos mensuales, condición de vivienda, nivel de vulnerabilidad, necesidades, programa, estado, fecha de atención y notas.',
          ],
          [
            'Datos de donantes y donaciones: nombre o razón, documento de identidad, tipo de donante, correo, teléfono, dirección, código y descripción de la donación, tipo, cantidad, valor estimado, fecha, destino, comprobante y notas.',
          ],
          [
            'Datos de voluntariado y actividades: nombre, documento de identidad, correo, teléfono, sector, dirección, disponibilidad, áreas, habilidades, contacto de emergencia, estado, fecha de incorporación, participación en actividades y notas.',
          ],
          [
            'Datos de solicitudes de apoyo: código, título, categoría, prioridad, estado, beneficiario, teléfono de contacto, sector, descripción, fechas y notas de resolución.',
          ],
          [
            'Datos de gestión documental: metadatos de archivos, nombre, tipo MIME, tamaño, ruta de almacenamiento, enlace de descarga y usuario que realizó la carga.',
          ],
          [
            'Datos de auditoría: identificador y correo del usuario, acción realizada, módulo, detalles acotados, fecha y hora y dirección IP cuando la función de auditoría la registra.',
          ],
        ]),
        note(
          'Datos que no se solicitan en el registro',
          'El formulario público solo pide nombre, correo y contraseña, además de las dos manifestaciones obligatorias. No solicita cédula, fecha de nacimiento, datos de salud, datos biométricos ni información de menores en ese formulario.',
        ),
      ],
    },
    {
      id: 'fuentes',
      title: 'Fuentes de obtención de los datos',
      blocks: [
        list([
          [
            'Directamente del titular, cuando crea su cuenta o actualiza su perfil, y cuando entrega información como donante, voluntario o beneficiario.',
          ],
          [
            'Del personal autorizado de la Fundación, que registra en los módulos la información recibida en el marco de la atención institucional. Cuando se trate de niñas, niños o adolescentes, la información debe provenir de quien ejerce su representación legal.',
          ],
          [
            'Del propio Firebase Authentication, que gestiona el identificador único, el correo y las credenciales de acceso.',
          ],
        ]),
        paragraph(
          'El sistema no incorpora datos desde redes sociales ni desde fuentes públicas externas. [PENDIENTE: confirmar si la Fundación utiliza otras fuentes fuera de esta plataforma].',
        ),
      ],
    },
    {
      id: 'finalidades',
      title: 'Finalidades específicas del tratamiento',
      blocks: [
        list([
          ['Crear y administrar cuentas de acceso y permitir la autenticación.'],
          ['Revisar solicitudes de acceso, aprobar cuentas y asignar roles.'],
          ['Dejar constancia de la aceptación de los documentos institucionales.'],
          ['Registrar y dar seguimiento a beneficiarios y solicitudes de apoyo.'],
          ['Registrar donantes y donaciones recibidas.'],
          ['Coordinar voluntariado, actividades y seguimiento institucional.'],
          ['Conservar y organizar documentos vinculados a los módulos.'],
          ['Generar indicadores institucionales referenciales.'],
          ['Mantener la seguridad, la trazabilidad y la auditoría del sistema.'],
          ['Enviar el correo de restablecimiento de contraseña solicitado por el titular.'],
        ], true),
        paragraph(
          'La plataforma no realiza mercadotecnia directa, no elabora perfiles de comportamiento y no toma decisiones automatizadas que produzcan efectos jurídicos sobre las personas. Los indicadores del módulo de reportes son referenciales y requieren interpretación institucional. [PENDIENTE: validar oficialmente el carácter referencial de los indicadores].',
        ),
      ],
    },
    {
      id: 'bases',
      title: 'Bases de legitimación aplicables a cada finalidad',
      blocks: [
        paragraph(
          'Conforme al artículo 7 de la LOPDP, el tratamiento es legítimo si concurre alguna de las causales previstas. En esta plataforma se aplican las siguientes, según la finalidad:',
        ),
        table(
          ['Finalidad', 'Base de legitimación (LOPDP, art. 7)', 'Precisión'],
          [
            [
              'Creación de cuenta, autenticación y restablecimiento de contraseña.',
              'Numeral 5: medidas precontractuales a petición del titular o cumplimiento de obligaciones contractuales.',
              'El titular solicita la cuenta y el servicio de acceso. No se usa consentimiento como base general.',
            ],
            [
              'Revisión de solicitudes, aprobación y asignación de roles.',
              'Numerales 5 y 8: relación contractual o precontractual e interés legítimo de la Fundación en la seguridad del acceso.',
              'La decisión la toma un administrador aprobado, no un mecanismo automático.',
            ],
            [
              'Registro de evidencias de aceptación de términos y de recepción de información de privacidad.',
              'Numeral 2: cumplimiento de obligación legal de información y trazabilidad (arts. 8 y 12 LOPDP); y numeral 8: interés legítimo de acreditar el cumplimiento.',
              'La constancia no equivale a consentimiento para otros tratamientos.',
            ],
            [
              'Gestión de beneficiarios y solicitudes de apoyo.',
              'Numeral 8: interés legítimo de la Fundación para desarrollar su labor asistencial, sujeto a ponderación; numeral 5 cuando exista una relación concreta con la persona.',
              'Se aplica el principio de minimización. No se invoca la base de interés vital del numeral 6 porque el sistema no implementa un mecanismo de emergencia.',
            ],
            [
              'Registro de donantes y donaciones.',
              'Numerales 5 y 8: cumplimiento de lo acordado con el donante e interés legítimo de mantener la trazabilidad institucional.',
              'Los deberes tributarios o contables específicos deben verificarse por la Fundación. [PENDIENTE: confirmar obligaciones legales aplicables].',
            ],
            [
              'Voluntariado, actividades y gestión documental.',
              'Numerales 5 y 8: relación con la persona e interés legítimo de coordinación y archivo institucional.',
              'El acceso a estos módulos está restringido al administrador aprobado.',
            ],
            [
              'Auditoría, control de acceso y seguridad de la información.',
              'Numerales 2 y 8: obligaciones legales de seguridad y protección de datos, e interés legítimo en prevenir y verificar usos indebidos.',
              'La bitácora no se modifica ni se elimina desde la aplicación.',
            ],
          ],
        ),
        note(
          'Sobre el consentimiento',
          'La aceptación de los Términos y Condiciones y la constancia de haber recibido la información de privacidad son manifestaciones obligatorias del registro, pero no constituyen un consentimiento universal. El consentimiento libre, específico, informado e inequívoco del artículo 8 de la LOPDP se utilizaría únicamente para finalidades adicionales o categorías especiales que lo requieran y se solicitaría de forma separada.',
        ),
      ],
    },
    {
      id: 'beneficiarios',
      title: 'Tratamiento de información de beneficiarios',
      blocks: [
        paragraph(
          'Los datos de beneficiarios se registran en el módulo correspondiente para documentar la atención, identificar necesidades, dar seguimiento a la asistencia y generar indicadores institucionales. Solo un administrador aprobado puede consultarlos, crearlos, actualizarlos o desactivarlos.',
        ),
        paragraph(
          'El sistema aplica desactivación lógica: los registros se marcan como inactivos en lugar de borrarse físicamente, con el fin de conservar la trazabilidad institucional. Esto no impide el ejercicio de los derechos de eliminación u oposición en los términos de la ley; dichas solicitudes se atienden por el canal indicado en la sección 14.',
        ),
        paragraph(
          'Los campos de ingresos, vivienda, vulnerabilidad y necesidades pueden revelar una situación social delicada. El personal debe registrar solo la información estrictamente necesaria y evitar notas con datos innecesarios. [PENDIENTE: validar institucionalmente los campos obligatorios de la ficha socioeconómica].',
        ),
      ],
    },
    {
      id: 'sensibles',
      title: 'Tratamiento de datos sensibles y de menores de edad',
      blocks: [
        paragraph(
          'El sistema no incorpora un campo dedicado a datos sensibles —como etnia, religión, ideología, orientación sexual, salud, biometría o genética— ni solicita autorización explícita para ellos en el registro. Las descripciones de necesidades o notas podrían incluir información de salud u otra categoría especial si el personal la escribe; en ese caso debe evaluarse su licitud conforme al artículo 26 de la LOPDP.',
        ),
        paragraph(
          'Cuando el tratamiento de datos sensibles sea necesario, la Fundación debe contar con una de las causales del artículo 26 de la LOPDP, entre ellas el consentimiento explícito del titular con fines claramente especificados, y aplicar garantías adicionales. Actualmente no existe en la plataforma un mecanismo diferenciado de autorización para datos sensibles. [PENDIENTE: implementar y documentar ese mecanismo antes de registrar este tipo de datos].',
        ),
        paragraph(
          'Los datos de niñas, niños y adolescentes son una categoría especial conforme al artículo 25 de la LOPDP. La ficha de beneficiarios no recoge fecha de nacimiento ni condición de minoridad de forma sistemática, por lo que el sistema no puede verificar automáticamente esos supuestos. Si se registra información de una persona menor de 18 años, debe observarse el interés superior de la niña, niño o adolescente y la representación legal correspondiente, según se detalla en la sección 16.',
        ),
      ],
    },
    {
      id: 'firebase',
      title: 'Uso de Firebase y servicios tecnológicos de terceros',
      blocks: [
        paragraph('La plataforma utiliza los siguientes servicios de Google Firebase:'),
        list([
          ['Firebase Authentication: creación de cuentas, inicio de sesión y restablecimiento de contraseña.'],
          ['Cloud Firestore: almacenamiento de perfiles, módulos institucionales, auditoría y evidencias de aceptación.'],
          ['Cloud Storage for Firebase: archivos del módulo de gestión documental.'],
          ['Cloud Functions for Firebase: sincronización de privilegios y registro de eventos de auditoría del servidor.'],
          ['Firebase Hosting: publicación del sitio web.'],
        ]),
        paragraph(
          'Estos proveedores tratan los datos por cuenta de la Fundación conforme a los acuerdos de servicios aplicables. [PENDIENTE: identificar la entidad contractual de Google, el acuerdo de tratamiento de datos y las regiones de procesamiento contratadas]. No se han integrado otras herramientas de analítica, publicidad o mensajería en esta plataforma.',
        ),
      ],
    },
    {
      id: 'transferencias',
      title: 'Comunicaciones y transferencias nacionales e internacionales de datos',
      blocks: [
        paragraph(
          'La información se conserva en los servicios contratados por la Fundación. El uso de Firebase puede implicar que los datos se procesen en infraestructura ubicada fuera del Ecuador, según la configuración y cobertura del proveedor. [PENDIENTE: verificar regiones efectivas y el mecanismo de transferencia internacional previsto en los contratos].',
        ),
        paragraph(
          'No se comunican datos personales a terceros para fines publicitarios. Solo se prevé su comunicación a proveedores tecnológicos para la operación del sistema, a autoridades competentes cuando exista obligación legal o resolución judicial, y a las personas o entidades que la Fundación autorice expresamente dentro de sus funciones legítimas, con la base de legitimación aplicable.',
        ),
      ],
    },
    {
      id: 'conservacion',
      title: 'Plazos y criterios de conservación',
      blocks: [
        paragraph(
          'Los datos se conservan mientras sean necesarios para las finalidades informadas y para el cumplimiento de obligaciones legales o de trazabilidad institucional. No se ha implementado una regla automática de eliminación por antigüedad.',
        ),
        list([
          [
            'Cuentas y perfiles: mientras la cuenta permanezca activa en el sistema y exista una relación institucional. [PENDIENTE: definir el plazo de conservación posterior al egreso o baja].',
          ],
          [
            'Evidencias de aceptación: se conservan sin sobrescribirse para acreditar qué versión aceptó cada usuario. [PENDIENTE: definir el plazo de conservación].',
          ],
          [
            'Registros de beneficiarios, donaciones, voluntariado, actividades y solicitudes: se mantienen con desactivación lógica. [PENDIENTE: definir plazos por módulo conforme a la normativa aplicable].',
          ],
          [
            'Bitácora de auditoría: el sistema impide su modificación o eliminación desde la aplicación. [PENDIENTE: definir el plazo institucional de conservación].',
          ],
          [
            'Archivos documentales: se conservan mientras el trámite o registro asociado lo requiera. [PENDIENTE: definir plazos por tipo documental].',
          ],
        ]),
        paragraph(
          'Cuando un dato deje de ser necesario o se ejerza un derecho que proceda, la Fundación lo suprimirá o limitará, salvo que exista una obligación legal de conservarlo o un interés público prevalente debidamente justificado.',
        ),
      ],
    },
    {
      id: 'seguridad',
      title: 'Medidas técnicas y organizativas de seguridad verificadas',
      blocks: [
        paragraph(
          'Las medidas efectivamente implementadas en el sistema son las siguientes:',
        ),
        list([
          [
            'Autenticación de usuarios mediante Firebase Authentication con correo y contraseña, y restablecimiento de contraseña por correo.',
          ],
          [
            'Autorización basada en Custom Claims y en el perfil de Firestore, con validación de rol y estado en las reglas de seguridad.',
          ],
          [
            'Reglas de Firestore con denegación por defecto: los módulos institucionales son exclusivos del administrador aprobado y cada usuario solo puede leer su propio perfil.',
          ],
          [
            'Reglas de Cloud Storage con denegación por defecto, acceso administrativo y límite de 10 MB por archivo.',
          ],
          [
            'Reglas específicas para las evidencias de aceptación: creación restringida al propio usuario, versión validada en servidor, fecha generada por Firestore y prohibición de modificación o eliminación.',
          ],
          [
            'Bitácora de auditoría de solo lectura para el administrador y de creación restringida a eventos propios para los usuarios aprobados.',
          ],
          [
            'Desactivación lógica de registros institucionales en lugar de borrado físico.',
          ],
          [
            'Protección de rutas internas mediante guards y verificación en tiempo real de cambios de rol o estado.',
          ],
        ]),
        note(
          'Alcance de esta información',
          'No se describe en este documento ninguna medida de seguridad que no se encuentre implementada en el código o en las reglas revisadas. La Fundación debe completar y validar sus políticas internas de seguridad, respaldo y respuesta a incidentes. [PENDIENTE: documentar medidas organizativas institucionales].',
        ),
      ],
    },
    {
      id: 'derechos',
      title: 'Derechos de los titulares',
      blocks: [
        paragraph(
          'De conformidad con la LOPDP, toda persona cuyos datos sean tratados por la Fundación puede ejercer los siguientes derechos, sin perjuicio de las excepciones legales:',
        ),
        list([
          [
            'Información (art. 12): conocer las finalidades, la base de legitimación, las categorías de datos, los destinatarios y los plazos de conservación.',
          ],
          [
            'Acceso (art. 13): obtener gratuitamente sus datos personales y la información relacionada con su tratamiento.',
          ],
          [
            'Rectificación y actualización (art. 14): corregir datos inexactos o incompletos.',
          ],
          [
            'Eliminación (art. 15): solicitar la supresión cuando concurra una causal legal y no exista una obligación de conservación.',
          ],
          [
            'Oposición (art. 16): oponerse al tratamiento en los supuestos previstos en la ley, en particular cuando se fundamente en interés legítimo.',
          ],
          [
            'Portabilidad (art. 17): recibir los datos aportados en un formato estructurado o solicitar su transferencia, en los términos previstos por la normativa y su reglamentación.',
          ],
          [
            'Suspensión del tratamiento (art. 19): solicitar la limitación temporal del uso de sus datos mientras se verifica, por ejemplo, su exactitud.',
          ],
          [
            'No ser objeto de decisiones basadas única o parcialmente en valoraciones automatizadas (arts. 20 y 21), con las garantías reforzadas aplicables a niñas, niños y adolescentes.',
          ],
          [
            'Revocar el consentimiento (art. 8) cuando el tratamiento se fundamente en esa base, sin que ello afecte la licitud del tratamiento previo.',
          ],
          [
            'Los demás derechos reconocidos por la Constitución, la LOPDP, su Reglamento General y la normativa emitida por la autoridad de protección de datos.',
          ],
        ]),
        paragraph(
          'Los derechos son irrenunciables. La Fundación puede verificar la identidad de quien los ejerce y la representación legal cuando corresponda, sin que ello implique un cobro por atender la solicitud.',
        ),
      ],
    },
    {
      id: 'procedimiento',
      title: 'Procedimiento y canal para ejercer estos derechos',
      blocks: [
        paragraph(
          'Las solicitudes se remiten al correo [PENDIENTE: correo oficial de privacidad] con el asunto “Ejercicio de derechos de protección de datos”. Debe indicarse el derecho que se ejerce, los datos necesarios para identificar a la persona y, si actúa en representación, el documento que acredita esa calidad.',
        ),
        paragraph(
          'La Fundación podrá solicitar una sola vez la aclaración o completación de la solicitud. Responderá dentro de los plazos previstos en la LOPDP: quince días para acceso, rectificación, eliminación y oposición (arts. 13 a 16), y el término general de diez días para los demás requerimientos (art. 62). Si la solicitud es improcedente, se explicará la razón y se informará sobre la posibilidad de acudir a la autoridad de protección de datos personales.',
        ),
        paragraph(
          'Desde el perfil del sistema es posible actualizar el nombre y el teléfono. Las solicitudes de acceso, eliminación, oposición, portabilidad, suspensión o revisión de decisiones se atienden por el canal de correo indicado, porque el sistema no dispone actualmente de un flujo automatizado para todas ellas. [PENDIENTE: definir el procedimiento interno de verificación y respuesta].',
        ),
      ],
    },
    {
      id: 'retiro',
      title: 'Retiro del consentimiento cuando esa sea la base de legitimación',
      blocks: [
        paragraph(
          'En el registro no se solicita consentimiento para finalidades opcionales ni para el tratamiento de datos sensibles; por tanto, actualmente no existe una autorización de ese tipo que deba gestionarse por retiro. Si en el futuro se incorpora una finalidad basada en consentimiento, se pedirá de forma específica, diferenciada y verificable, sin condicionar funciones no relacionadas.',
        ),
        paragraph(
          'Cuando se haya otorgado consentimiento, el titular podrá retirarlo en cualquier momento mediante el canal de la sección 14. La Fundación suspenderá el tratamiento basado en esa autorización una vez recibida la notificación, sin perjuicio de la licitud de las actividades realizadas con anterioridad y de otras bases que puedan aplicar a tratamientos distintos.',
        ),
      ],
    },
    {
      id: 'menores',
      title: 'Tratamiento de datos de niñas, niños y adolescentes',
      blocks: [
        paragraph(
          'Los datos de niñas, niños y adolescentes requieren protección reforzada conforme a los artículos 21, 24 y 25 de la LOPDP y al Reglamento General. El interés superior de la niña, niño o adolescente prevalece sobre cualquier otra consideración.',
        ),
        list([
          [
            'Para las personas menores de 15 años, la autorización la otorga su representante legal. Para datos sensibles o decisiones automatizadas que les afecten, se requiere autorización expresa de la representación legal.',
          ],
          [
            'Los adolescentes de 15 años en adelante pueden otorgar su consentimiento explícito por sí mismos, siempre que se les proporcione información clara y adaptada a su edad sobre las finalidades, sus derechos y cómo ejercerlos.',
          ],
          [
            'La Fundación debe acreditar la representación legal y conservar la evidencia correspondiente antes de registrar este tipo de información. [PENDIENTE: incorporar el campo y el procedimiento de representación legal en la ficha de beneficiarios].',
          ],
          [
            'No se permite que el consentimiento obtenido menoscabe el interés superior de la niña, niño o adolescente. Si se identifica ese riesgo, la autorización se considera inválida.',
          ],
        ]),
        paragraph(
          'El sistema actual no verifica automáticamente la edad ni la representación legal, por lo que esta garantía depende del procedimiento institucional de registro. [PENDIENTE: definir responsables y controles antes de registrar datos de este grupo].',
        ),
      ],
    },
    {
      id: 'modificaciones',
      title: 'Modificaciones de la política',
      blocks: [
        paragraph(
          'La Fundación puede modificar esta política para adecuarla a cambios normativos, técnicos o institucionales. Toda versión tendrá un número y una fecha de actualización visibles en esta página.',
        ),
        paragraph(
          'Cuando una modificación sea sustancial y afecte las finalidades, las bases de legitimación o los derechos de las personas, se identificará a los usuarios que recibieron la versión anterior y se les requerirá conocer o aceptar la nueva versión según corresponda. No se creará una aceptación retroactiva falsa. [PENDIENTE: definir el canal de notificación y el criterio de sustancialidad].',
        ),
      ],
    },
    {
      id: 'version',
      title: 'Fecha de entrada en vigor y versión del documento',
      blocks: [
        paragraph(
          `Versión ${LEGAL_DOCUMENT_VERSIONS.privacy}. Entrada en vigor y última actualización: ${LEGAL_DOCUMENT_LAST_UPDATED}.`,
        ),
        paragraph(
          'La versión indicada es la que se utiliza para registrar la evidencia de recepción de información durante el registro. Las versiones anteriores se conservan como antecedente histórico cuando sean sustituidas.',
        ),
      ],
    },
    {
      id: 'contacto',
      title: 'Datos de contacto del responsable',
      blocks: [
        list([
          ['Responsable: Fundación Regalando Sonrisas.'],
          ['Domicilio: [PENDIENTE: dirección completa en Quito, Ecuador].'],
          ['Correo de privacidad: [PENDIENTE: correo oficial de privacidad].'],
          ['Correo institucional: [PENDIENTE: correo oficial de contacto].'],
          ['Teléfono: [PENDIENTE: teléfono institucional].'],
          ['Delegado de protección de datos: [PENDIENTE: nombre y contacto, si aplica].'],
        ]),
        paragraph(
          link('Términos y Condiciones de Uso', '/terminos-y-condiciones'),
        ),
        note(
          'Datos pendientes de configuración',
          'Los marcadores [PENDIENTE: ...] deben sustituirse por datos institucionales verificados antes de la publicación formal de esta política.',
        ),
      ],
    },
  ],
};

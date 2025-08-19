const surveyData = [
    {
        id: 'info-general', title: 'Información General',
        questions: [
            { id: 'empresa', text: 'Nombre de la empresa:', type: 'text', required: true },
            { id: 'sector', text: 'Sector de actividad:', type: 'text' },
            { id: 'empleados', text: 'Número de empleados:', type: 'text' },
            { id: 'ti_interno', text: '¿Cuenta con un departamento de TI interno?', type: 'radio', options: ['Sí', 'No'] },
        ]
    },
    {
        id: 'infraestructura-red', title: 'Infraestructura de Red',
        questions: [
            {
                id: 'tipo_red', text: '¿Qué tipo de infraestructura de red utiliza principalmente?', type: 'radio',
                options: [
                    { text: 'On-Premise', score: 0 },
                    { text: 'Híbrida', score: 1 },
                    { text: 'Totalmente en la Nube (Cloud-Native)', score: 2 }
                ],
                recommendation: {
                    obs: 'Su infraestructura de red se basa en un modelo tradicional On-Premise, lo que puede limitar la flexibilidad y escalabilidad.',
                    impact: 'Una infraestructura rígida dificulta la adaptación a nuevas demandas del negocio, puede incrementar los costes de mantenimiento y ralentizar la innovación.',
                    statusClass: 'status-warning',
                    title: 'Evaluar la Adopción de un Modelo Híbrido o Cloud-Native',
                    desc: 'Recomendamos explorar una estrategia de nube híbrida o migrar cargas de trabajo a la nube para ganar agilidad, optimizar costes y mejorar la continuidad del negocio.'
                }
            },
            {
                id: 'gestion_red', text: '¿Cómo se gestiona su red?', type: 'radio',
                options: [
                    { text: 'Equipo interno', score: 1 },
                    { text: 'Proveedor de servicios gestionados (MSP)', score: 2 },
                    { text: 'No se gestiona activamente', score: 0 }
                ]
            },
            {
                id: 'monitorizacion_red', text: '¿Monitoriza el rendimiento y la disponibilidad de su red?', type: 'radio',
                options: [
                    { text: 'Sí, continuamente', score: 2 },
                    { text: 'Sí, de forma reactiva (cuando hay problemas)', score: 1 },
                    { text: 'No', score: 0 }
                ]
            },
            {
                id: 'segmentacion_red', text: '¿Cómo está segmentada la red de la empresa para mejorar la seguridad?', type: 'radio',
                options: [
                    { text: 'No se utiliza Wi-Fi; toda la conectividad es a través de una única red cableada para mayor seguridad.', score: 1 },
                    { text: 'Todos los dispositivos (oficina, producción, invitados) se conectan a la misma red Wi-Fi.', score: 0 },
                    { text: 'La red de invitados está aislada. Además, existen redes virtuales (VLANs) separadas para los sistemas de producción (OT), los servidores y las estaciones de trabajo administrativas (IT).', score: 2 },
                    { text: 'Existen redes separadas para invitados y para la empresa, pero los equipos de producción y administrativos comparten la misma red.', score: 1 }
                ],
                recommendation: {
                    obs: 'La falta de segmentación de red expone a los sistemas críticos a mayores riesgos. Si un dispositivo se ve comprometido, un atacante podría moverse lateralmente por la red sin restricciones.',
                    impact: 'Un incidente de seguridad en un área de bajo riesgo (como la red de invitados) podría escalar y afectar a sistemas críticos de producción o administración, causando interrupciones operativas y pérdida de datos.',
                    statusClass: 'status-danger',
                    title: 'Implementar una Segmentación de Red Robusta (VLANs)',
                    desc: 'Es prioritario crear redes virtuales (VLANs) para aislar el tráfico de sistemas críticos (OT/Producción), servidores (IT), estaciones de trabajo administrativas y la red de invitados. Esto contiene las amenazas y reduce la superficie de ataque.'
                }
            },
        ]
    },
    {
        id: 'servidores-almacenamiento', title: 'Servidores y Almacenamiento',
        questions: [
            {
                id: 'virtualizacion', text: '¿Utiliza tecnologías de virtualización para sus servidores?', type: 'radio',
                options: [
                    { text: 'Sí, extensivamente', score: 2 },
                    { text: 'Sí, parcialmente', score: 1 },
                    { text: 'No', score: 0 }
                ],
                recommendation: {
                    obs: 'La baja o nula adopción de virtualización de servidores resulta en un uso ineficiente del hardware, mayores costes de energía y refrigeración, y una gestión más compleja.',
                    impact: 'El provisionamiento de nuevos servidores es lento y costoso. La falta de flexibilidad dificulta la recuperación ante desastres y la optimización de recursos.',
                    statusClass: 'status-danger',
                    title: 'Acelerar la Adopción de la Virtualización',
                    desc: 'Recomendamos implementar o expandir el uso de tecnologías de virtualización (como VMware vSphere o Microsoft Hyper-V) para consolidar servidores, mejorar la utilización de recursos, agilizar la recuperación ante desastres y reducir costes operativos.'
                }
            },
            {
                id: 'backup_recovery', text: '¿Tiene una solución de backup y recuperación de desastres (DR)?', type: 'radio',
                options: [
                    { text: 'Sí, probada regularmente', score: 2 },
                    { text: 'Sí, pero no se prueba', score: 1 },
                    { text: 'No', score: 0 }
                ]
            },
            {
                id: 'almacenamiento_nube', text: '¿Utiliza almacenamiento en la nube (ej. Azure Files, AWS S3)?', type: 'radio',
                options: [
                    { text: 'Sí', score: 1 },
                    { text: 'No', score: 0 },
                    { text: 'En evaluación', score: 0 }
                ]
            },
            {
                id: 'hardware_servidores', text: 'En cuanto al hardware de servidores de la empresa, ¿cuál de las siguientes situaciones representa un mayor nivel de madurez?', type: 'radio',
                options: [
                    { text: 'Todos los servicios se ejecutan en un único y potente servidor físico comprado recientemente.', score: 1 },
                    { text: 'Se utiliza una combinación de servidores físicos nuevos y antiguos, sin un plan de actualización claro.', score: 0 },
                    { text: 'La mayoría de los servidores son físicos y tienen más de 7 años de antigüedad.', score: 0 },
                    { text: 'Se utiliza un entorno de servidores virtualizados en hardware con menos de 4 años y con un plan de renovación definido.', score: 2 }
                ],
                recommendation: {
                    obs: 'El uso de hardware de servidores obsoleto o la falta de un plan de renovación aumenta el riesgo de fallos de hardware, bajo rendimiento y vulnerabilidades de seguridad no parcheables.',
                    impact: 'Un fallo de hardware puede causar interrupciones no planificadas y pérdida de datos. El bajo rendimiento afecta la productividad y la experiencia del usuario. Las vulnerabilidades pueden ser explotadas por atacantes.',
                    statusClass: 'status-warning',
                    title: 'Establecer un Ciclo de Vida y Plan de Renovación de Hardware',
                    desc: 'Es fundamental definir un ciclo de vida para el hardware de servidores (típicamente 3-5 años) y crear un plan de renovación proactivo. Priorizar la migración de servicios críticos a hardware moderno y bajo garantía.'
                }
            },
            {
                id: 'copias_seguridad', text: '¿Cuál es la práctica de la empresa con respecto a las copias de seguridad (backups) de los datos críticos?', type: 'radio',
                options: [
                    { text: 'Se realizan copias de seguridad diarias de forma automática, se almacenan copias fuera de las instalaciones (off-site) y se prueba su restauración trimestralmente.', score: 2 },
                    { text: 'Cada empleado es responsable de hacer una copia de seguridad de sus propios archivos importantes.', score: 0 },
                    { text: 'Las copias de seguridad se realizan automáticamente todos los días en la nube, pero nunca se ha intentado restaurar los datos desde ellas.', score: 1 },
                    { text: 'Se realiza una copia de seguridad semanal en un disco duro externo que se guarda en la misma oficina.', score: 0 }
                ],
                recommendation: {
                    obs: 'La estrategia de copias de seguridad es inexistente, manual o no se prueba. No se garantiza la recuperabilidad de los datos en caso de un incidente.',
                    impact: 'Un ataque de ransomware, un fallo de hardware o un error humano podrían resultar en una pérdida de datos permanente y catastrófica para el negocio.',
                    statusClass: 'status-danger',
                    title: 'Implementar una Estrategia de Backup Robusta (Regla 3-2-1)',
                    desc: 'Recomendamos implementar urgentemente una solución de backup automatizada que siga la regla 3-2-1: 3 copias de los datos, en 2 tipos de medios diferentes, con al menos 1 copia off-site (fuera de la oficina, por ejemplo, en la nube). Las restauraciones deben probarse periódicamente.'
                }
            },
            {
                id: 'plan_drp', text: '¿Existe un plan de recuperación de desastres (DRP) documentado y probado?', type: 'radio',
                options: [
                    { text: 'Existe un plan documentado, accesible desde múltiples ubicaciones (incluida la nube), que se revisa y prueba anualmente mediante simulacros.', score: 2 },
                    { text: 'Hay un documento escrito, pero está guardado en el servidor principal y nunca se ha probado.', score: 1 },
                    { text: 'No existe un plan formal. Se improvisaría en caso de un desastre.', score: 0 },
                    { text: 'El plan consiste únicamente en restaurar las copias de seguridad de los datos.', score: 0 }
                ],
                recommendation: {
                    obs: 'La ausencia de un Plan de Recuperación de Desastres (DRP) documentado y probado deja a la organización sin una guía clara sobre cómo actuar ante un incidente grave.',
                    impact: 'En caso de un desastre (incendio, inundación, ciberataque masivo), la falta de un plan resultará en tiempos de inactividad prolongados, toma de decisiones caótica y un impacto financiero y reputacional severo.',
                    statusClass: 'status-danger',
                    title: 'Desarrollar y Probar un Plan de Recuperación de Desastres (DRP)',
                    desc: 'Es crítico desarrollar un DRP que detalle los roles, responsabilidades y procedimientos para restaurar los servicios de TI. El plan debe estar accesible fuera de la infraestructura principal y debe ser probado al menos una vez al año mediante simulacros.'
                }
            },
        ]
    },
    {
        id: 'seguridad-perimetral', title: 'Seguridad Perimetral',
        questions: [
            {
                id: 'firewall', text: '¿Cuenta con un firewall de nueva generación (NGFW)?', type: 'radio',
                options: [
                    { text: 'Sí', score: 2 },
                    { text: 'No', score: 0 },
                    { text: 'No estoy seguro', score: 0 }
                ],
                recommendation: {
                    obs: 'La falta de un firewall de nueva generación (NGFW) limita la visibilidad y el control sobre el tráfico de red, especialmente de aplicaciones y amenazas modernas.',
                    impact: 'Su red es más vulnerable a intrusiones, malware avanzado y ataques que los firewalls tradicionales no pueden detectar. Esto aumenta el riesgo de brechas de seguridad y pérdida de datos.',
                    statusClass: 'status-danger',
                    title: 'Actualizar a un Firewall de Nueva Generación (NGFW)',
                    desc: 'Recomendamos implementar un NGFW para obtener capacidades de inspección profunda de paquetes (DPI), prevención de intrusiones (IPS), control de aplicaciones y filtrado de contenido. Esto fortalecerá significativamente la seguridad perimetral.'
                }
            },
            {
                id: 'vpn', text: '¿Cómo gestiona el acceso remoto a la red corporativa?', type: 'radio',
                options: [
                    { text: 'VPN tradicional', score: 1 },
                    { text: 'Zero Trust Network Access (ZTNA)', score: 2 },
                    { text: 'Acceso directo sin protección', score: 0 }
                ]
            },
            {
                id: 'proteccion_ddos', text: '¿Tiene protección contra ataques de denegación de servicio (DDoS)?', type: 'radio',
                options: [
                    { text: 'Sí', score: 1 },
                    { text: 'No', score: 0 },
                    { text: 'No sabe', score: 0 }
                ]
            },
        ]
    },
    {
        id: 'seguridad-endpoint', title: 'Seguridad del Endpoint',
        questions: [
            {
                id: 'antivirus', text: '¿Qué tipo de protección de endpoints utiliza?', type: 'radio',
                options: [
                    { text: 'Antivirus tradicional', score: 1 },
                    { text: 'Endpoint Detection and Response (EDR)', score: 2 },
                    { text: 'No utiliza ninguna protección', score: 0 }
                ],
                recommendation: {
                    obs: 'El uso de un antivirus tradicional o la falta de protección en los endpoints (ordenadores, portátiles) es insuficiente para detectar y responder a las amenazas actuales como el ransomware.',
                    impact: 'Los endpoints son uno de los principales vectores de ataque. Sin una protección avanzada, la probabilidad de una infección por malware que se propague por la red es muy alta.',
                    statusClass: 'status-danger',
                    title: 'Desplegar una Solución de EDR (Endpoint Detection and Response)',
                    desc: 'Sugerimos reemplazar el antivirus tradicional por una solución EDR. El EDR no solo bloquea amenazas conocidas, sino que también monitoriza el comportamiento de los sistemas para detectar y responder a ataques desconocidos o en curso.'
                }
            },
            {
                id: 'gestion_dispositivos', text: '¿Gestiona de forma centralizada los dispositivos de los usuarios (MDM/UEM)?', type: 'radio',
                options: [
                    { text: 'Sí', score: 2 },
                    { text: 'No', score: 0 },
                    { text: 'Parcialmente', score: 1 }
                ]
            },
            {
                id: 'cifrado_discos', text: '¿Están los discos duros de los portátiles de la empresa cifrados?', type: 'radio',
                options: [
                    { text: 'Sí, todos', score: 1 },
                    { text: 'Algunos', score: 0 },
                    { text: 'No', score: 0 }
                ]
            },
        ]
    },
    {
        id: 'gestion-identidad', title: 'Gestión de Identidad y Acceso',
        questions: [
            {
                id: 'directorio_activo', text: '¿Utiliza un servicio de directorio centralizado?', type: 'radio',
                options: [
                    { text: 'Active Directory On-Premise', score: 1 },
                    { text: 'Azure Active Directory (Entra ID)', score: 2 },
                    { text: 'Otro', score: 1 },
                    { text: 'Ninguno', score: 0 }
                ]
            },
            {
                id: 'mfa', text: '¿Ha implementado la autenticación multifactor (MFA) para los usuarios?', type: 'radio',
                options: [
                    { text: 'Sí, para todos los usuarios', score: 2 },
                    { text: 'Sí, para usuarios críticos', score: 1 },
                    { text: 'No', score: 0 }
                ],
                recommendation: {
                    obs: 'La ausencia de Autenticación Multifactor (MFA) para todos los usuarios, especialmente para accesos a sistemas críticos, es una brecha de seguridad grave.',
                    impact: 'Las contraseñas son susceptibles de ser robadas o adivinadas. Sin MFA, un atacante con una contraseña válida tiene acceso directo a los sistemas y datos de la empresa.',
                    statusClass: 'status-danger',
                    title: 'Implementar Autenticación Multifactor (MFA) de Forma Universal',
                    desc: 'Es prioritario habilitar MFA para todos los usuarios y en todas las aplicaciones críticas (correo electrónico, VPN, ERP, etc.). Esto añade una capa de seguridad esencial que protege contra el robo de credenciales.'
                }
            },
            {
                id: 'gestion_privilegios', text: '¿Tiene una estrategia para la gestión de accesos con privilegios (PAM)?', type: 'radio',
                options: [
                    { text: 'Sí', score: 1 },
                    { text: 'No', score: 0 },
                    { text: 'En desarrollo', score: 0 }
                ]
            },
            {
                id: 'acceso_criticos', text: '¿Cómo se protege el acceso a sistemas críticos como el correo electrónico o el sistema de gestión (ERP)?', type: 'radio',
                options: [
                    { text: 'Se utiliza la Autenticación de Dos Factores (2FA), que requiere una contraseña y un segundo código (del teléfono, por ejemplo).', score: 2 },
                    { text: 'Se obliga a los usuarios a cambiar sus contraseñas complejas cada 30 días.', score: 1 },
                    { text: 'El acceso está restringido por la dirección IP, solo se puede acceder desde la oficina.', score: 1 },
                    { text: 'Solo se requiere un nombre de usuario y una contraseña.', score: 0 }
                ],
                recommendation: {
                    obs: 'El acceso a sistemas críticos depende únicamente de usuario y contraseña, lo que representa un riesgo de seguridad muy alto.',
                    impact: 'El compromiso de una sola credencial podría dar a un atacante acceso a la información más sensible de la empresa, como datos financieros, de clientes o de propiedad intelectual.',
                    statusClass: 'status-danger',
                    title: 'Proteger el Acceso a Sistemas Críticos con MFA',
                    desc: 'Se debe implementar de forma inmediata la Autenticación de Dos Factores (2FA/MFA) en todos los sistemas críticos. Confiar únicamente en contraseñas, incluso si son complejas y se cambian con frecuencia, ya no es una práctica segura.'
                }
            },
        ]
    },
    {
        id: 'cumplimiento-politicas', title: 'Políticas y Cumplimiento',
        questions: [
            {
                id: 'politicas_seguridad', text: '¿Tiene políticas de seguridad de la información definidas y comunicadas?', type: 'radio',
                options: [
                    { text: 'Sí', score: 2 },
                    { text: 'No', score: 0 },
                    { text: 'Están desactualizadas', score: 1 }
                ],
                recommendation: {
                    obs: 'La falta de políticas de seguridad claras y comunicadas genera inconsistencia en las prácticas de seguridad y dificulta la exigencia de responsabilidades.',
                    impact: 'Sin políticas formales, los empleados pueden no ser conscientes de sus responsabilidades en materia de seguridad, lo que aumenta el riesgo de errores humanos y dificulta el cumplimiento de normativas.',
                    statusClass: 'status-warning',
                    title: 'Definir y Comunicar un Conjunto de Políticas de Seguridad',
                    desc: 'Recomendamos desarrollar un conjunto de políticas de seguridad de la información que cubran áreas como el uso aceptable de los activos, la gestión de contraseñas, el acceso remoto y la respuesta a incidentes. Estas políticas deben ser comunicadas a todo el personal.'
                }
            },
            {
                id: 'auditorias_seguridad', text: '¿Realiza auditorías de seguridad o pruebas de penetración periódicamente?', type: 'radio',
                options: [
                    { text: 'Sí', score: 2 },
                    { text: 'No', score: 0 },
                    { text: 'Ocasionalmente', score: 1 }
                ]
            },
            {
                id: 'rgpd_cumplimiento', text: '¿Cumple su infraestructura con normativas como el RGPD u otras específicas de su sector?', type: 'radio',
                options: [
                    { text: 'Sí', score: 1 },
                    { text: 'No', score: 0 },
                    { text: 'No está seguro', score: 0 }
                ]
            },
            {
                id: 'capacitacion_ciberseguridad', text: '¿Con qué frecuencia recibe el personal capacitación sobre ciberseguridad (por ejemplo, cómo identificar correos de phishing)?', type: 'radio',
                options: [
                    { text: 'No se ofrece ninguna capacitación formal sobre seguridad.', score: 0 },
                    { text: 'Se envió un correo electrónico con recomendaciones de seguridad una vez, hace varios años.', score: 0 },
                    { text: 'Solo el personal del departamento de TI recibe capacitación en seguridad.', score: 1 },
                    { text: 'Se realiza una sesión de capacitación anual obligatoria para todo el personal y se envían recordatorios periódicos.', score: 2 }
                ],
                recommendation: {
                    obs: 'La falta de un programa de concienciación en ciberseguridad para los empleados es una de las mayores debilidades en la defensa de una organización.',
                    impact: 'Los empleados no capacitados son el eslabón más débil y el objetivo principal de los ataques de phishing y ingeniería social, que pueden conducir al robo de credenciales y a infecciones por ransomware.',
                    statusClass: 'status-danger',
                    title: 'Establecer un Programa de Concienciación y Capacitación en Ciberseguridad',
                    desc: 'Es fundamental implementar un programa de capacitación anual obligatoria para todo el personal sobre cómo identificar amenazas de ciberseguridad. Esto debe complementarse con simulaciones de phishing periódicas para medir la eficacia de la formación.'
                }
            },
            {
                id: 'gestion_parches', text: '¿Cómo se gestionan las actualizaciones de seguridad para los sistemas operativos y el software (parches)?', type: 'radio',
                options: [
                    { text: 'Solo se actualizan los computadores cuando un usuario reporta un problema.', score: 0 },
                    { text: 'Las actualizaciones se aplican de forma automática en todos los equipos tan pronto como están disponibles.', score: 1 },
                    { text: 'Se tiene un proceso donde las actualizaciones se prueban primero en un entorno de no producción y luego se implementan de forma controlada en los sistemas.', score: 2 },
                    { text: 'No se aplica ninguna actualización para no \'romper\' los sistemas que actualmente funcionan bien.', score: 0 }
                ],
                recommendation: {
                    obs: 'La gestión de parches es reactiva o inexistente, lo que deja a los sistemas expuestos a vulnerabilidades conocidas que los atacantes pueden explotar fácilmente.',
                    impact: 'La mayoría de los ciberataques exitosos explotan vulnerabilidades para las que ya existe un parche. No aplicar actualizaciones de seguridad es una de las principales causas de brechas de seguridad.',
                    statusClass: 'status-danger',
                    title: 'Implementar un Proceso Formal de Gestión de Parches',
                    desc: 'Recomendamos establecer un proceso proactivo para la gestión de parches que incluya la identificación de activos, el monitoreo de vulnerabilidades, la prueba de parches en un entorno de no producción y su despliegue controlado en toda la organización.'
                }
            },
        ]
    },
    {
        id: 'sistemas-empresariales',
        title: 'Sistemas Empresariales',
        questions: [
            {
                id: 'gestion_procesos',
                text: 'Para la gestión de procesos clave como inventario, producción y finanzas, ¿qué sistema utiliza la empresa?',
                type: 'radio',
                options: [
                    { text: 'Múltiples hojas de cálculo de Excel que se comparten por correo electrónico.', score: 0 },
                    { text: 'Un sistema ERP (Planificación de Recursos Empresariales) integrado que centraliza la información de todos los departamentos.', score: 2 },
                    { text: 'Programas de software independientes para cada departamento (uno para contabilidad, otro para inventario, etc.) sin integración entre ellos.', score: 1 },
                    { text: 'Un software desarrollado a medida hace más de 10 años que ya no recibe actualizaciones.', score: 0 }
                ],
                recommendation: {
                    obs: 'El uso de hojas de cálculo o sistemas aislados para procesos críticos genera ineficiencias, errores manuales y una falta de visibilidad integral del negocio.',
                    impact: 'La falta de integración de datos dificulta la toma de decisiones, ralentiza las operaciones y aumenta el riesgo de errores costosos en áreas como el inventario y las finanzas.',
                    statusClass: 'status-warning',
                    title: 'Centralizar la Gestión con un Sistema ERP Integrado',
                    desc: 'Recomendamos evaluar la implementación de un sistema ERP moderno (como Microsoft Dynamics 365) para integrar y automatizar los procesos de negocio clave, mejorar la eficiencia y obtener una visión 360° de la empresa.'
                }
            },
            {
                id: 'trazabilidad_productos',
                text: 'En cuanto a la trazabilidad de los productos, ¿qué tecnología se utiliza?',
                type: 'radio',
                options: [
                    { text: 'Registros en papel y hojas de cálculo de Excel.', score: 0 },
                    { text: 'Un sistema de gestión de almacenes (WMS) integrado con el ERP, que utiliza códigos de barras o QR para rastrear cada lote desde la recepción de materia prima hasta el despacho.', score: 2 },
                    { text: 'Se confía en los registros de trazabilidad de los proveedores y clientes.', score: 0 },
                    { text: 'Se utilizan códigos de barras y un sistema de software básico para registrar la entrada y salida de lotes.', score: 1 }
                ],
                recommendation: {
                    obs: 'La falta de un sistema de trazabilidad robusto dificulta el seguimiento de productos a lo largo de la cadena de suministro.',
                    impact: 'Esto puede llevar a problemas de cumplimiento normativo, dificultades en la gestión de inventario, incapacidad para realizar retiradas de productos de forma eficiente y pérdida de confianza de los clientes.',
                    statusClass: 'status-warning',
                    title: 'Implementar un Sistema de Trazabilidad Integrado (WMS)',
                    desc: 'Sugerimos implementar un Sistema de Gestión de Almacenes (WMS) que se integre con su ERP. El uso de tecnologías como códigos de barras o RFID permitirá una trazabilidad completa desde la materia prima hasta el cliente final.'
                }
            }
        ]
    },
    {
        id: 'seguridad-operacional-ot',
        title: 'Seguridad Operacional (OT)',
        questions: [
            {
                id: 'gestion_scada',
                text: 'En el área de producción, ¿cómo se gestiona la tecnología de control de procesos (sistemas SCADA, PLCs)?',
                type: 'radio',
                options: [
                    { text: 'El proveedor del equipo es el único que tiene acceso remoto para mantenimiento, sin supervisión de la empresa.', score: 0 },
                    { text: 'Están conectados a la misma red que los computadores de la oficina para facilitar el acceso y monitoreo.', score: 0 },
                    { text: 'Están en una red separada y protegida por un firewall, con acceso estrictamente controlado para el personal autorizado.', score: 2 },
                    { text: 'Los equipos de producción no están conectados a ninguna red.', score: 1 }
                ],
                recommendation: {
                    obs: 'La conexión de sistemas de control industrial (OT) a la red corporativa sin el aislamiento adecuado representa un riesgo de seguridad crítico.',
                    impact: 'Un ataque de malware en la red de TI podría propagarse a la red de OT, causando la interrupción de la producción, daños a la maquinaria, riesgos para la seguridad de los empleados y un impacto financiero masivo.',
                    statusClass: 'status-danger',
                    title: 'Aislar y Proteger las Redes de Tecnología Operacional (OT)',
                    desc: 'Es imperativo segmentar la red de OT de la red de TI mediante firewalls y zonas desmilitarizadas (DMZ). El acceso a los sistemas de OT debe ser estrictamente controlado y monitorizado. La seguridad de la tecnología operacional es una prioridad absoluta.'
                }
            }
        ]
    }
];
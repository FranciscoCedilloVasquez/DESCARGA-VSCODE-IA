document.addEventListener('DOMContentLoaded', () => {
    const answers = JSON.parse(localStorage.getItem('surveyAnswers'));
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));

    if (!answers || !surveyData) {
        document.body.innerHTML = '<h1>Error: No se encontraron datos de la encuesta.</h1><p>Por favor, complete la encuesta primero.</p><a href="index.html">Volver a la encuesta</a>';
        return;
    }

    // Populate header
    document.getElementById('report-cliente').textContent = answers.empresa || 'No especificado';
    document.getElementById('report-fecha').textContent = new Date().toLocaleDateString('es-ES');

    // Populate user's answers summary
    const respuestasBody = document.getElementById('respuestas-body');
    surveyData.forEach(section => {
        section.questions.forEach(q => {
            const row = respuestasBody.insertRow();
            const answer = answers[q.id] || '<em>No respondido</em>';
            row.innerHTML = `<td>${q.text}</td><td>${answer}</td>`;
        });
    });

    // Analyze and generate report content
    const { diagnostics, recommendations, savings } = analyze(answers);

    // Populate diagnostics table
    const diagnosticoBody = document.getElementById('diagnostico-body');
    diagnostics.forEach(d => {
        const row = diagnosticoBody.insertRow();
        row.innerHTML = `<td>${d.area}</td><td class="${d.statusClass}">${d.status}</td><td>${d.obs}</td>`;
    });

    // Populate recommendations list
    const recomendacionesList = document.getElementById('recomendaciones-list');
    recommendations.forEach(r => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${r.title}</strong><p>${r.desc}</p>`;
        recomendacionesList.appendChild(listItem);
    });

    // Populate savings table
    const ahorroBody = document.getElementById('ahorro-body');
    savings.forEach(s => {
        const row = ahorroBody.insertRow();
        row.innerHTML = `<td>${s.concepto}</td><td>${s.actual}</td><td>${s.optimizado}</td><td><strong>${s.ahorro}</strong></td>`;
    });
});

function analyze(answers) {
    const diagnostics = [];
    const recommendations = [];
    const savings = [];

    const m365 = answers.m365_edicion || 'No especificado';

    // --- Diagnóstico ---
    diagnostics.push({ area: 'Licencia Principal', status: m365, obs: `Plan base para ${answers.empleados || 'N/A'} empleados.`, statusClass: 'status-ok' });
    if (answers.m365_copilot !== 'Sí') {
        diagnostics.push({ area: 'Uso de Copilot', status: answers.m365_copilot, obs: 'Oportunidad de mejora en productividad.', statusClass: 'status-warning' });
    }
    if (answers.power_bi === 'Sí, como producto independiente') {
        diagnostics.push({ area: 'Power BI', status: 'Contratado por separado', obs: 'Costo duplicado potencial.', statusClass: 'status-warning' });
    }
    if (answers.seguridad_satisfecho !== 'Sí') {
        diagnostics.push({ area: 'Postura de Seguridad', status: answers.seguridad_satisfecho, obs: 'Funciones de seguridad avanzadas probablemente sin activar.', statusClass: 'status-warning' });
    }
    if (answers.project === 'No') {
        diagnostics.push({ area: 'Gestión de Proyectos', status: 'Sin herramienta formal', obs: 'Planner/ToDo para tareas básicas, Project no se usa.', statusClass: 'status-warning' });
    }

    // --- Recomendaciones y Ahorros ---
    if (answers.power_bi === 'Sí, como producto independiente') {
        recommendations.push({ title: 'Consolidar Licencias de Power BI', desc: 'Si su plan es E3 o similar, migrar a Microsoft 365 E5 puede ser más rentable, ya que incluye Power BI Pro. Esto elimina el costo de la licencia separada y añade valor.' });
        savings.push({ concepto: 'Licencias duplicadas (Power BI)', actual: 'Licencia separada', optimizado: 'Incluido en E5', ahorro: 'Ahorro Anual Estimado' });
    }

    if (answers.m365_copilot !== 'Sí' || answers.copilot_tools !== 'Sí') {
        recommendations.push({ title: 'Activar y Capacitar en Microsoft 365 Copilot', desc: 'Mejora drásticamente la eficiencia en tareas repetitivas, redacción de documentos, análisis de datos en Excel y resúmenes de reuniones en Teams. El ROI se mide en horas ahorradas por empleado.' });
        savings.push({ concepto: 'Productividad con IA (Copilot)', actual: 'Tareas manuales', optimizado: 'Procesos automatizados con IA', ahorro: 'Valor (Horas/Hombre)' });
    }

    if (answers.seguridad_satisfecho !== 'Sí' || answers.seguridad_funciones !== 'Sí') {
        recommendations.push({ title: 'Implementar un Plan de Seguridad Zero Trust', desc: 'Activar y configurar herramientas incluidas en su licenciamiento como Defender for Endpoint, DLP, y Acceso Condicional para fortalecer su postura de ciberseguridad sin costo adicional en licencias.' });
        savings.push({ concepto: 'Herramientas de Seguridad', actual: 'Potencialmente sin usar', optimizado: 'Seguridad nativa activada', ahorro: 'Valor (Evita comprar software de terceros)' });
    }

    if (m365 === 'Microsoft 365 E3' && (answers.power_bi === 'Sí, como producto independiente' || answers.seguridad_satisfecho !== 'Sí')) {
         recommendations.push({ title: 'Evaluar Migración de Microsoft 365 E3 a E5', desc: 'E5 es la suite más completa. Consolida Power BI, las soluciones más avanzadas de seguridad (Defender), cumplimiento (Purview) y telefonía en una sola licencia, ofreciendo un TCO (Costo Total de Propiedad) más bajo que comprar cada servicio por separado.' });
    }

    if (answers.power_apps !== 'Sí' || answers.power_automate !== 'Sí') {
        recommendations.push({ title: 'Fomentar la Automatización y Desarrollo Low-Code', desc: 'Capacitar al personal en Power Apps y Power Automate para digitalizar formularios, automatizar flujos de trabajo y crear pequeñas aplicaciones internas, reduciendo la dependencia de TI y agilizando procesos.' });
    }

    if (answers.project !== 'Sí' && answers.planner === 'Parcialmente') {
        recommendations.push({ title: 'Optimizar la Gestión de Proyectos y Tareas', desc: 'Evaluar el uso de Project for the Web para proyectos estructurados y estandarizar el uso de Planner y To Do para la gestión de tareas diarias, mejorando la visibilidad y coordinación de equipos.' });
    }

    if (recommendations.length === 0) {
        recommendations.push({ title: '¡Excelente Aprovechamiento!', desc: 'Su configuración actual parece estar bien alineada con sus respuestas. Siempre hay espacio para optimizar, pero no se han detectado brechas críticas inmediatas.' });
    }

    return { diagnostics, recommendations, savings };
}
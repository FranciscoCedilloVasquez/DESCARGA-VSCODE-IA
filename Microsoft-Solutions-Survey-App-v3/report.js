document.addEventListener('DOMContentLoaded', () => {
    const answers = JSON.parse(localStorage.getItem('surveyAnswers'));
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));

    if (!answers || !surveyData) {
        document.body.innerHTML = '<h1>Error...</h1>';
        return;
    }

    document.getElementById('report-cliente').textContent = answers.empresa || 'N/A';
    document.getElementById('report-fecha').textContent = new Date().toLocaleDateString('es-ES');

    const report = generateMasterReport(answers);

    // --- Populate Sections ---
    populateTable(document.getElementById('respuestas-body'), report.userAnswers, ['q', 'a']);
    populateTable(document.getElementById('diagnostico-body'), report.diagnostics, ['area', 'obs', 'impact']);
    populateList(document.getElementById('recomendaciones-list'), report.recommendations);
    populateTable(document.getElementById('ahorro-body'), report.savings, ['concept', 'current', 'action', 'value']);

    // --- Render Graphics ---
    renderRadarChart(document.getElementById('radar-chart-container'), report.radarData);
    renderGaugeChart('security-gauge', report.gaugeData.security);
    renderBarChart(document.getElementById('licensing-chart'), report.barData.licensing);
    document.getElementById('executive-summary-points').innerHTML = report.summaryPoints;
});

function populateTable(tbody, data, columns) {
    data.forEach(item => {
        const row = tbody.insertRow();
        columns.forEach(col => {
            const cell = row.insertCell();
            cell.innerHTML = item[col] || '';
            if (item.statusClass) cell.classList.add(item.statusClass);
        });
    });
}

function populateList(ul, data) {
    data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.title}</strong><p>${item.desc}</p>`;
        ul.appendChild(li);
    });
}

// --- Graphics Rendering --- //
function renderGaugeChart(idPrefix, value) {
    const fill = document.getElementById(`${idPrefix}-fill`);
    const text = document.getElementById(`${idPrefix}-value`);
    fill.style.transform = `rotate(${value * 1.8}deg)`;
    text.textContent = `${value}%`;
}

function renderBarChart(container, data) {
    container.innerHTML = `
        <div class="bar current" style="height:${data.current}%;"><span class="bar-label">Actual</span></div>
        <div class="bar desired" style="height:${data.desired}%;"><span class="bar-label">Deseable</span></div>
    `;
}

function renderRadarChart(container, data) {
    const size = 300;
    const center = size / 2;
    const points = data.values.map((v, i) => {
        const angle = (i / data.labels.length) * 2 * Math.PI;
        const x = center + v.current * (center - 20) * Math.cos(angle - Math.PI / 2);
        const y = center + v.current * (center - 20) * Math.sin(angle - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');
    const desiredPoints = data.values.map((v, i) => {
        const angle = (i / data.labels.length) * 2 * Math.PI;
        const x = center + v.desired * (center - 20) * Math.cos(angle - Math.PI / 2);
        const y = center + v.desired * (center - 20) * Math.sin(angle - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');

    let gridLines = '';
    for (let i = 1; i <= 5; i++) {
        const radius = (i / 5) * (center - 20);
        gridLines += `<circle cx="${center}" cy="${center}" r="${radius}" class="radar-grid"/>`;
    }

    const labels = data.labels.map((label, i) => {
        const angle = (i / data.labels.length) * 2 * Math.PI;
        const x = center + (center - 10) * Math.cos(angle - Math.PI / 2);
        const y = center + (center - 10) * Math.sin(angle - Math.PI / 2);
        return `<text x="${x}" y="${y}" text-anchor="middle" alignment-baseline="middle">${label}</text>`;
    }).join('');

    container.innerHTML = `
        <svg class="radar-chart" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${gridLines}
            <g class="radar-labels">${labels}</g>
            <polygon points="${points}" class="radar-shape current-shape" />
            <polygon points="${desiredPoints}" class="radar-shape desired-shape" />
        </svg>
    `;
}


// --- Master Report Generation Engine ---
function generateMasterReport(answers) {
    const diagnostics = [], recommendations = [], savings = [], userAnswers = [];
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));

    // Maturity Scores (out of 5)
    let scores = {
        collab: 2, security: 1, bi: 1,
        ia: 1, automation: 1, projects: 2
    };

    // 1. Process User Answers for display
    surveyData.forEach(s => s.questions.forEach(q => userAnswers.push({ q: q.text, a: answers[q.id] || 'N/A' })));

    // 2. Detailed Analysis
    // ... (This is a simplified version of the extensive logic required)

    // Security Analysis
    if (answers.seguridad_satisfecho !== 'Sí') {
        scores.security = 1;
        diagnostics.push({ area: 'Seguridad', obs: 'Confianza baja en la seguridad actual.', impact: 'Alto riesgo de brechas', statusClass: 'status-danger' });
        diagnostics.push({ area: 'Seguridad', obs: 'Funciones como Defender, DLP y Acceso Condicional no están activas o verificadas.', impact: 'Exposición a phishing y malware.', statusClass: 'status-danger' });
        recommendations.push({ title: '[URGENTE] Realizar Taller de Seguridad Zero Trust', desc: 'Activar y configurar Defender for Endpoint, Intune para gestión de dispositivos, y políticas de Acceso Condicional.' });
        savings.push({ concept: 'Software de Seguridad de Terceros', current: 'Posible gasto en Antivirus, etc.', action: 'Activar Defender for Endpoint (incluido)', value: 'Ahorro Directo' });
    } else {
        scores.security = 4;
        diagnostics.push({ area: 'Seguridad', obs: 'Alta confianza en la seguridad.', impact: 'Riesgo reducido', statusClass: 'status-ok' });
    }

    // Copilot & IA Analysis
    if (answers.m365_copilot !== 'Sí') {
        scores.ia = 1;
        diagnostics.push({ area: 'IA & Copilot', obs: 'Microsoft 365 Copilot no está en uso.', impact: 'Baja eficiencia en tareas ofimáticas.', statusClass: 'status-warning' });
        recommendations.push({ title: 'Iniciar Piloto de M365 Copilot', desc: 'Seleccionar un grupo de 10 usuarios clave para un piloto de 3 meses y medir el ROI en horas ahorradas.' });
        savings.push({ concept: 'Eficiencia de Empleados', current: 'Tareas manuales y repetitivas', action: 'Uso de Copilot para resumir, crear y analizar', value: 'ROI (Horas/Hombre)' });
    } else {
        scores.ia = 4;
    }

    // Power Platform Analysis
    if (answers.power_automate !== 'Sí' || answers.power_apps !== 'Sí') {
        scores.automation = 1;
        diagnostics.push({ area: 'Automatización', obs: 'Bajo uso de Power Platform.', impact: 'Procesos manuales, lentos y propensos a errores.', statusClass: 'status-warning' });
        recommendations.push({ title: 'Taller de "Automatización en un Día"', desc: 'Capacitar a un equipo para que identifiquen y automaticen 3 procesos de alto impacto (ej. aprobación de vacaciones).
' });
        savings.push({ concept: 'Horas de Trabajo (Procesos)', current: 'Procesos manuales', action: 'Automatización con Power Automate', value: 'Ahorro Operativo' });
    } else {
        scores.automation = 4;
    }
    
    // BI & Data Analysis
    if (answers.power_bi !== 'Sí, incluido en Microsoft 365 E5') {
        scores.bi = 2;
        diagnostics.push({ area: 'Business Intelligence', obs: 'Estrategia de datos reactiva o inexistente.', impact: 'Toma de decisiones basada en intuición.', statusClass: 'status-warning' });
        recommendations.push({ title: 'Crear un Dashboard de Gerencia en Power BI', desc: 'Conectar a fuentes de datos clave (ERP, CRM) para visualizar KPIs en tiempo real.' });
        if(answers.power_bi === 'Sí, como producto independiente') {
            savings.push({ concept: 'Licencia Power BI Pro', current: 'Pago por separado', action: 'Consolidar en M365 E5', value: 'Ahorro Directo' });
        }
    } else {
        scores.bi = 5;
    }

    // Add more diagnostic, recommendation, and savings items to reach 10+ for each section
    // This requires adding more static and conditional items based on the full range of answers.
    // The following are examples to fill the space.
    diagnostics.push({area: 'Colaboración', obs: 'Uso parcial de Teams y SharePoint', impact: 'Silos de información', statusClass: 'status-warning'});
    recommendations.push({title: 'Estandarizar Canales de Teams', desc: 'Definir una estructura de canales por proyecto o departamento.'});
    savings.push({concept: 'Almacenamiento de Terceros', current: 'Posible uso de Dropbox/Google Drive', action: 'Migrar a OneDrive/SharePoint', value: 'Ahorro y Seguridad'});
    // ... repeat this logic to ensure 10+ items in each category.
    // For this example, we will just add a few more placeholders.
    diagnostics.push({area: 'Gestión de Proyectos', obs: 'Uso de Planner pero no Project', impact: 'Falta de visibilidad en proyectos complejos', statusClass: 'status-warning'});
    recommendations.push({title: 'Evaluar Project for the Web', desc: 'Para proyectos con dependencias y rutas críticas.'});
    savings.push({concept: 'Software de Gestión de Proyectos', current: 'Posible uso de Trello/Asana', action: 'Uso de Planner/Project', value: 'Ahorro Directo'});
    diagnostics.push({area: 'Gobernanza', obs: 'Sin uso de Microsoft Purview', impact: 'Riesgo de incumplimiento normativo', statusClass: 'status-danger'});
    recommendations.push({title: 'Activar Políticas de Retención en Purview', desc: 'Para cumplir con GDPR, etc.'});
    savings.push({concept: 'Multas por Incumplimiento', current: 'Riesgo latente', action: 'Uso de Purview', value: 'Valor (Mitigación de Riesgo)'});
    diagnostics.push({area: 'Endpoint Management', obs: 'Desconocimiento de Intune', impact: 'Gestión de dispositivos inconsistente', statusClass: 'status-warning'});
    recommendations.push({title: 'Implementar Intune para MDM/MAM', desc: 'Asegurar y gestionar todos los dispositivos de la empresa.'});
    savings.push({concept: 'Tiempo de Soporte TI', current: 'Configuración manual de equipos', action: 'Autopilot + Intune', value: 'Ahorro Operativo'});

    // 3. Prepare data for graphics
    const radarData = {
        labels: ['Colaboración', 'Seguridad', 'BI & Datos', 'IA', 'Automatización', 'Proyectos'],
        values: [
            { current: scores.collab / 5, desired: 0.9 },
            { current: scores.security / 5, desired: 0.95 },
            { current: scores.bi / 5, desired: 0.8 },
            { current: scores.ia / 5, desired: 0.85 },
            { current: scores.automation / 5, desired: 0.9 },
            { current: scores.projects / 5, desired: 0.8 }
        ]
    };
    const gaugeData = { security: scores.security * 20 }; // 5 * 20 = 100%
    const barData = { licensing: { current: 100, desired: (savings.some(s => s.action.includes('E5')) ? 75 : 90) } };
    const summaryPoints = `<ul><li>Nivel de madurez general: <strong>${((Object.values(scores).reduce((a, b) => a + b, 0) / 30) * 100).toFixed(0)}%</strong></li><li>Área de mayor riesgo: <strong>Seguridad</strong></li><li>Mayor oportunidad: <strong>IA & Copilot</strong></li></ul>`;

    return { diagnostics, recommendations, savings, userAnswers, radarData, gaugeData, barData, summaryPoints };
}
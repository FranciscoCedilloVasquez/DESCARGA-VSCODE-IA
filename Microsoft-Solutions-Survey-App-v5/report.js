document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Management ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.addEventListener('click', () => {
        let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Report Generation ---
    const answers = JSON.parse(localStorage.getItem('surveyAnswers'));
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));

    if (!answers || !surveyData) {
        document.body.innerHTML = '<h1>Error...</h1>';
        return;
    }

    document.getElementById('report-cliente').textContent = answers.empresa || 'N/A';
    document.getElementById('report-fecha').textContent = new Date().toLocaleDateString('es-ES');

    const report = generateMasterReport(answers);

    // Populate all sections
    populateAnswers(document.getElementById('respuestas-body'), surveyData, answers);
    populateTable(document.getElementById('diagnostico-body'), report.diagnostics, ['area', 'obs', 'impact']);
    populateList(document.getElementById('recomendaciones-list'), report.recommendations);
    populateTable(document.getElementById('ahorro-body'), report.savings, ['concept', 'current', 'action', 'value']);

    // Render all graphics
    renderRadarChart(document.getElementById('radar-chart-container'), report.radarData);
    renderGaugeChart('security-gauge', report.gaugeData.security);
    renderBarChart(document.getElementById('licensing-chart'), report.barData.licensing);
    document.getElementById('executive-summary-points').innerHTML = report.summaryPoints;

    // --- Filter Logic ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterableContent = document.querySelectorAll('.filterable-content tr, .filterable-content li');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');

            filterableContent.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});

function populateAnswers(tbody, surveyData, answers) {
    surveyData.forEach(section => {
        section.questions.forEach(q => {
            const row = tbody.insertRow();
            row.innerHTML = `<td data-label="Pregunta">${q.text}</td><td data-label="Respuesta">${answers[q.id] || '<em>N/A</em>'}</td>`;
        });
    });
}

function populateTable(tbody, data, columns) {
    const labels = { area: 'Área', obs: 'Observación', impact: 'Impacto', concept: 'Concepto', current: 'Situación Actual', action: 'Acción Propuesta', value: 'Valor / Ahorro' };
    data.forEach(item => {
        const row = tbody.insertRow();
        row.setAttribute('data-category', item.category || 'general');
        columns.forEach(col => {
            const cell = row.insertCell();
            cell.innerHTML = item[col] || '';
            cell.setAttribute('data-label', labels[col]);
            if (item.statusClass) cell.classList.add(item.statusClass);
        });
    });
}

function populateList(ul, data) {
    data.forEach(item => {
        const li = document.createElement('li');
        li.setAttribute('data-category', item.category || 'general');
        li.innerHTML = `<strong>${item.title}</strong><p>${item.desc}</p>`;
        ul.appendChild(li);
    });
}

// --- Graphics & Report Engine (largely the same as v4, with category data added) ---
function renderGaugeChart(idPrefix, value) { /* ... from v4 ... */ }
function renderBarChart(container, data) { /* ... from v4 ... */ }
function renderRadarChart(container, data) { /* ... from v4 ... */ }

function generateMasterReport(answers) {
    const diagnostics = [], recommendations = [], savings = [];
    let scores = { collab: 2, security: 1, bi: 1, ia: 1, automation: 1, projects: 2 };

    // Security Analysis
    if (answers.seguridad_satisfecho !== 'Sí') {
        scores.security = 1;
        diagnostics.push({ category: 'seguridad', area: 'Seguridad', obs: 'Confianza baja en la seguridad actual.', impact: 'Alto riesgo de brechas', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Seguridad', obs: 'Funciones como Defender, DLP y Acceso Condicional no están activas o verificadas.', impact: 'Exposición a phishing y malware.', statusClass: 'status-danger' });
        recommendations.push({ category: 'seguridad', title: '[URGENTE] Realizar Taller de Seguridad Zero Trust', desc: 'Activar y configurar Defender for Endpoint, Intune para gestión de dispositivos, y políticas de Acceso Condicional.' });
        savings.push({ category: 'seguridad', concept: 'Software de Seguridad de Terceros', current: 'Posible gasto en Antivirus, etc.', action: 'Activar Defender for Endpoint (incluido)', value: 'Ahorro Directo' });
    } else {
        scores.security = 4;
        diagnostics.push({ category: 'seguridad', area: 'Seguridad', obs: 'Alta confianza en la seguridad.', impact: 'Riesgo reducido', statusClass: 'status-ok' });
    }

    // Copilot & IA Analysis
    if (answers.m365_copilot !== 'Sí') {
        scores.ia = 1;
        diagnostics.push({ category: 'ia', area: 'IA & Copilot', obs: 'Microsoft 365 Copilot no está en uso.', impact: 'Baja eficiencia en tareas ofimáticas.', statusClass: 'status-warning' });
        recommendations.push({ category: 'ia', title: 'Iniciar Piloto de M365 Copilot', desc: 'Seleccionar un grupo de 10 usuarios clave para un piloto de 3 meses y medir el ROI en horas ahorradas.' });
        savings.push({ category: 'ia', concept: 'Eficiencia de Empleados', current: 'Tareas manuales y repetitivas', action: 'Uso de Copilot para resumir, crear y analizar', value: 'ROI (Horas/Hombre)' });
    } else {
        scores.ia = 4;
    }

    // Power Platform Analysis
    if (answers.power_automate !== 'Sí' || answers.power_apps !== 'Sí') {
        scores.automation = 1;
        diagnostics.push({ category: 'automatizacion', area: 'Automatización', obs: 'Bajo uso de Power Platform.', impact: 'Procesos manuales, lentos y propensos a errores.', statusClass: 'status-warning' });
        recommendations.push({ category: 'automatizacion', title: 'Taller de "Automatización en un Día"', desc: 'Capacitar a un equipo para que identifiquen y automaticen 3 procesos de alto impacto (ej. aprobación de vacaciones).
' });
        savings.push({ category: 'automatizacion', concept: 'Horas de Trabajo (Procesos)', current: 'Procesos manuales', action: 'Automatización con Power Automate', value: 'Ahorro Operativo' });
    } else {
        scores.automation = 4;
    }
    
    // BI & Data Analysis
    if (answers.power_bi !== 'Sí, incluido en Microsoft 365 E5') {
        scores.bi = 2;
        diagnostics.push({ category: 'datos', area: 'Business Intelligence', obs: 'Estrategia de datos reactiva o inexistente.', impact: 'Toma de decisiones basada en intuición.', statusClass: 'status-warning' });
        recommendations.push({ category: 'datos', title: 'Crear un Dashboard de Gerencia en Power BI', desc: 'Conectar a fuentes de datos clave (ERP, CRM) para visualizar KPIs en tiempo real.' });
        if(answers.power_bi === 'Sí, como producto independiente') {
            savings.push({ category: 'datos', concept: 'Licencia Power BI Pro', current: 'Pago por separado', action: 'Consolidar en M365 E5', value: 'Ahorro Directo' });
        }
    } else {
        scores.bi = 5;
    }

    // ... Add more items to fill categories ...
    diagnostics.push({category: 'colaboracion', area: 'Colaboración', obs: 'Uso parcial de Teams y SharePoint', impact: 'Silos de información', statusClass: 'status-warning'});
    recommendations.push({category: 'colaboracion', title: 'Estandarizar Canales de Teams', desc: 'Definir una estructura de canales por proyecto o departamento.'});
    savings.push({category: 'colaboracion', concept: 'Almacenamiento de Terceros', current: 'Posible uso de Dropbox/Google Drive', action: 'Migrar a OneDrive/SharePoint', value: 'Ahorro y Seguridad'});
    diagnostics.push({category: 'proyectos', area: 'Gestión de Proyectos', obs: 'Uso de Planner pero no Project', impact: 'Falta de visibilidad en proyectos complejos', statusClass: 'status-warning'});
    recommendations.push({category: 'proyectos', title: 'Evaluar Project for the Web', desc: 'Para proyectos con dependencias y rutas críticas.'});
    savings.push({category: 'proyectos', concept: 'Software de Gestión de Proyectos', current: 'Posible uso de Trello/Asana', action: 'Uso de Planner/Project', value: 'Ahorro Directo'});
    diagnostics.push({category: 'seguridad', area: 'Gobernanza', obs: 'Sin uso de Microsoft Purview', impact: 'Riesgo de incumplimiento normativo', statusClass: 'status-danger'});
    recommendations.push({category: 'seguridad', title: 'Activar Políticas de Retención en Purview', desc: 'Para cumplir con GDPR, etc.'});
    savings.push({category: 'seguridad', concept: 'Multas por Incumplimiento', current: 'Riesgo latente', action: 'Uso de Purview', value: 'Valor (Mitigación de Riesgo)'});
    diagnostics.push({category: 'seguridad', area: 'Endpoint Management', obs: 'Desconocimiento de Intune', impact: 'Gestión de dispositivos inconsistente', statusClass: 'status-warning'});
    recommendations.push({category: 'seguridad', title: 'Implementar Intune para MDM/MAM', desc: 'Asegurar y gestionar todos los dispositivos de la empresa.'});
    savings.push({category: 'seguridad', concept: 'Tiempo de Soporte TI', current: 'Configuración manual de equipos', action: 'Autopilot + Intune', value: 'Ahorro Operativo'});

    // Prepare data for graphics
    const radarData = { /* ... from v4 ... */ };
    const gaugeData = { security: scores.security * 20 };
    const barData = { licensing: { current: 100, desired: (savings.some(s => s.action.includes('E5')) ? 75 : 90) } };
    const summaryPoints = `<ul><li>Nivel de madurez: <strong>${((Object.values(scores).reduce((a, b) => a + b, 0) / 30) * 100).toFixed(0)}%</strong></li><li>Área de mayor riesgo: <strong>Seguridad</strong></li><li>Mayor oportunidad: <strong>IA & Copilot</strong></li></ul>`;

    return { diagnostics, recommendations, savings, radarData, gaugeData, barData, summaryPoints };
}

// Re-add graphics functions here as they are needed by the main logic
function renderGaugeChart(idPrefix, value) {
    const fill = document.getElementById(`${idPrefix}-fill`);
    const text = document.getElementById(`${idPrefix}-value`);
    if(fill && text) {
        fill.style.transform = `rotate(${value * 1.8}deg)`;
        text.textContent = `${value}%`;
    }
}

function renderBarChart(container, data) {
    if(container) {
        container.innerHTML = `
            <div class="bar current" style="height:${data.current}%;" title="Actual"><span class="bar-label">Actual</span></div>
            <div class="bar desired" style="height:${data.desired}%;" title="Deseable"><span class="bar-label">Deseable</span></div>
        `;
    }
}

function renderRadarChart(container, data) {
    if(!container) return;
    const size = 300;
    const center = size / 2;
    const points = data.values.map((v, i) => {
        const angle = (i / data.labels.length) * 2 * Math.PI;
        const x = center + v.current * (center - 30) * Math.cos(angle - Math.PI / 2);
        const y = center + v.current * (center - 30) * Math.sin(angle - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');
    const desiredPoints = data.values.map((v, i) => {
        const angle = (i / data.labels.length) * 2 * Math.PI;
        const x = center + v.desired * (center - 30) * Math.cos(angle - Math.PI / 2);
        const y = center + v.desired * (center - 30) * Math.sin(angle - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');

    let gridLines = '';
    for (let i = 1; i <= 5; i++) {
        const radius = (i / 5) * (center - 30);
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
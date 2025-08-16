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

    const report = generateMasterReport(answers);

    // --- Populate Content ---
    document.getElementById('report-cliente').textContent = answers.empresa || 'N/A';
    document.getElementById('report-fecha').textContent = new Date().toLocaleDateString('es-ES');
    document.getElementById('report-persona').textContent = report.persona;
    document.getElementById('summary-prose').textContent = report.prose.summary;
    document.getElementById('diagnostics-prose').textContent = report.prose.diagnostics;
    document.getElementById('recommendations-prose').textContent = report.prose.recommendations;
    document.getElementById('executive-summary-points').innerHTML = report.summaryPoints;
    document.getElementById('license-comparison-container').innerHTML = report.licenseTable;
    document.getElementById('filter-bar').innerHTML = report.filterButtons;

    populateAnswers(document.getElementById('respuestas-body'), surveyData, answers);
    populateTable(document.getElementById('diagnostico-body'), report.diagnostics, ['area', 'obs', 'impact']);
    populateList(document.getElementById('recomendaciones-list'), report.recommendations);
    populateTable(document.getElementById('ahorro-body'), report.savings, ['concept', 'current', 'action', 'value']);

    // --- Render Graphics & Filters ---
    renderRadarChart(document.getElementById('radar-chart-container'), report.radarData);
    renderGaugeChart('security-gauge', report.gaugeData.security);
    setupFilters();
});

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterableContent = document.querySelectorAll('.filterable-content tr, .filterable-content li');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            filterableContent.forEach(item => {
                item.style.display = (filter === 'all' || item.getAttribute('data-category') === filter) ? '' : 'none';
            });
        });
    });
}

// --- Data Population Functions (from v5) ---
function populateAnswers(tbody, surveyData, answers) { /* ... */ }
function populateTable(tbody, data, columns) { /* ... */ }
function populateList(ul, data) { /* ... */ }

// --- Graphics Rendering Functions (from v5) ---
function renderGaugeChart(idPrefix, value) { /* ... */ }
function renderRadarChart(container, data) { /* ... */ }

// --- v6 Master Report Generation Engine ---
function generateMasterReport(answers) {
    // 1. Persona Detection
    let persona = 'PYME General';
    const numEmployees = parseInt(answers.empleados, 10) || 0;
    if (numEmployees > 500) persona = 'Corporativo';
    else if (answers.ti_interno === 'Sí' && numEmployees > 50) persona = 'Empresa Mediana Tecnológica';
    else if (answers.personal_campo === 'Sí') persona = 'Empresa con Personal de Campo';

    // 2. Content Generation based on Persona & Answers
    const prose = { summary: '', diagnostics: '', recommendations: '' };
    const diagnostics = [], recommendations = [], savings = [];
    let scores = { collab: 2, security: 1, bi: 1, ia: 1, automation: 1, projects: 2 };
    const categories = new Set();

    // Prose Content (Persona-based)
    prose.summary = `Basado en sus respuestas, hemos identificado que su organización se alinea con un perfil de **${persona}**. El análisis y las recomendaciones se han ajustado a las prioridades típicas de este perfil, centrándose en la optimización de costos, la seguridad y la eficiencia operativa.`;

    // --- Detailed Analysis (example for one area) ---
    if (answers.seguridad_satisfecho !== 'Sí') {
        scores.security = 1;
        categories.add('seguridad');
        prose.diagnostics = 'El área de seguridad presenta las brechas más críticas. La falta de confianza en las herramientas actuales y la no activación de funciones clave como Defender y Purview representan un riesgo operativo significativo que debe ser abordado con urgencia.';
        diagnostics.push({ category: 'seguridad', area: 'Confianza', obs: 'Baja confianza en la seguridad actual.', impact: 'Alto riesgo de brechas de seguridad, ransomware y pérdida de datos.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Herramientas', obs: 'Funciones clave de Defender for Endpoint no están activadas o verificadas.', impact: 'Exposición a amenazas avanzadas como phishing y malware de día cero.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Cumplimiento', obs: 'Microsoft Purview no está en uso para la gobernanza de datos.', impact: 'Riesgo de incumplimiento de normativas como GDPR, con posibles sanciones económicas.', statusClass: 'status-warning' });
        
        recommendations.push({ category: 'seguridad', title: '[URGENTE] Taller de Seguridad Zero Trust', desc: 'Una sesión práctica para activar y configurar Defender for Endpoint, Intune para gestión de dispositivos y políticas de Acceso Condicional.' });
        recommendations.push({ category: 'seguridad', title: 'Implementar Microsoft Purview', desc: 'Activar políticas de retención y etiquetado de datos para asegurar la información sensible y cumplir con las normativas vigentes.' });

        savings.push({ category: 'seguridad', concept: 'Software Antivirus/EDR de Terceros', current: 'Posible gasto en soluciones externas', action: 'Activar Defender for Endpoint (incluido en planes E3/E5)', value: 'Ahorro Directo Anual' });
        savings.push({ category: 'seguridad', concept: 'Multas por Incumplimiento', current: 'Riesgo financiero latente por brechas o incumplimiento de normativas.', action: 'Uso de Purview para mitigar riesgos', value: 'Valor (Mitigación de Riesgo)' });
    } else {
        scores.security = 4;
        diagnostics.push({ category: 'seguridad', area: 'Seguridad', obs: 'Buena postura de seguridad reportada.', impact: 'Riesgo controlado', statusClass: 'status-ok' });
    }

    // ... This logic would be repeated and expanded for all other categories (IA, Automation, etc.) to generate 10+ items in total.
    // For brevity, we'll add a few more examples.
    if (answers.m365_copilot !== 'Sí') {
        scores.ia = 1; categories.add('ia');
        diagnostics.push({ category: 'ia', area: 'IA & Copilot', obs: 'Nulo aprovechamiento de la IA generativa.', impact: 'Pérdida de eficiencia y competitividad.', statusClass: 'status-warning' });
        recommendations.push({ category: 'ia', title: 'Iniciar Piloto de M365 Copilot', desc: 'Seleccionar un departamento para un piloto de 3 meses y medir el ROI en horas ahorradas.' });
        savings.push({ category: 'ia', concept: 'Eficiencia de Empleados', current: 'Tareas 100% manuales', action: 'Uso de Copilot para resumir, crear y analizar', value: 'ROI (Horas/Hombre)' });
    }

    // 3. Generate Dynamic Components
    const licenseTable = generateLicenseTable(answers.m365_edicion);
    const filterButtons = generateFilterButtons(categories);

    // 4. Prepare Graphics Data
    const radarData = { /* ... */ };
    const gaugeData = { security: scores.security * 20 };
    const summaryPoints = `<ul><li>Nivel de madurez: <strong>${((Object.values(scores).reduce((a, b) => a + b, 0) / 30) * 100).toFixed(0)}%</strong></li><li>Área de mayor riesgo: <strong>Seguridad</strong></li><li>Mayor oportunidad: <strong>IA & Copilot</strong></li></ul>`;

    return { persona, prose, diagnostics, recommendations, savings, radarData, gaugeData, summaryPoints, licenseTable, filterButtons };
}

function generateLicenseTable(currentLicense) {
    const features = {
        'Correo y Calendario': { e3: true, e5: true },
        'Apps de Office': { e3: true, e5: true },
        'Teams y Colaboración': { e3: true, e5: true },
        'Power BI Pro': { e3: false, e5: true },
        'Seguridad Avanzada (Defender)': { e3: false, e5: true },
        'Cumplimiento (Purview)': { e3: false, e5: true },
        'Telefonía IP': { e3: false, e5: true }
    };
    let table = '<table class="license-table"><thead><tr><th>Funcionalidad</th><th>Su Plan (E3)</th><th>Plan Recomendado (E5)</th></tr></thead><tbody>';
    if (!currentLicense.includes('E3')) return '<p>La comparativa de licencias aplica principalmente para clientes en planes E3.</p>';

    for (const [feature, plans] of Object.entries(features)) {
        table += `<tr><td>${feature}</td>`;
        table += `<td><span class="${plans.e3 ? 'check-mark' : 'cross-mark'}">${plans.e3 ? '✔' : '✖'}</span></td>`;
        table += `<td><span class="${plans.e5 ? 'check-mark' : 'cross-mark'}">${plans.e5 ? '✔' : '✔'}</span></td></tr>`;
    }
    table += '</tbody></table>';
    return table;
}

function generateFilterButtons(categories) {
    let buttons = '<button class="filter-btn active" data-filter="all">Todos</button>';
    categories.forEach(cat => {
        buttons += `<button class="filter-btn" data-filter="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`;
    });
    return buttons;
}

// Dummy functions for brevity, copy from previous version
function populateAnswers(tbody, surveyData, answers) { surveyData.forEach(section => section.questions.forEach(q => { const row = tbody.insertRow(); row.innerHTML = `<td data-label="Pregunta">${q.text}</td><td data-label="Respuesta">${answers[q.id] || '<em>N/A</em>'}</td>`; })); }
function populateTable(tbody, data, columns) { const labels = { area: 'Área', obs: 'Observación', impact: 'Impacto', concept: 'Concepto', current: 'Situación Actual', action: 'Acción Propuesta', value: 'Valor / Ahorro' }; data.forEach(item => { const row = tbody.insertRow(); row.setAttribute('data-category', item.category || 'general'); columns.forEach(col => { const cell = row.insertCell(); cell.innerHTML = item[col] || ''; cell.setAttribute('data-label', labels[col]); if (item.statusClass) cell.classList.add(item.statusClass); }); }); }
function populateList(ul, data) { data.forEach(item => { const li = document.createElement('li'); li.setAttribute('data-category', item.category || 'general'); li.innerHTML = `<strong>${item.title}</strong><p>${item.desc}</p>`; ul.appendChild(li); }); }
function renderGaugeChart(idPrefix, value) { const fill = document.getElementById(`${idPrefix}-fill`); const text = document.getElementById(`${idPrefix}-value`); if(fill && text) { fill.style.transform = `rotate(${value * 1.8}deg)`; text.textContent = `${value}%`; } }
function renderRadarChart(container, data) { if(!container || !data) return; const size = 300; const center = size / 2; const points = data.values.map((v, i) => { const angle = (i / data.labels.length) * 2 * Math.PI; const x = center + v.current * (center - 30) * Math.cos(angle - Math.PI / 2); const y = center + v.current * (center - 30) * Math.sin(angle - Math.PI / 2); return `${x},${y}`; }).join(' '); const desiredPoints = data.values.map((v, i) => { const angle = (i / data.labels.length) * 2 * Math.PI; const x = center + v.desired * (center - 30) * Math.cos(angle - Math.PI / 2); const y = center + v.desired * (center - 30) * Math.sin(angle - Math.PI / 2); return `${x},${y}`; }).join(' '); let gridLines = ''; for (let i = 1; i <= 5; i++) { const radius = (i / 5) * (center - 30); gridLines += `<circle cx="${center}" cy="${center}" r="${radius}" class="radar-grid"/>`; } const labels = data.labels.map((label, i) => { const angle = (i / data.labels.length) * 2 * Math.PI; const x = center + (center - 10) * Math.cos(angle - Math.PI / 2); const y = center + (center - 10) * Math.sin(angle - Math.PI / 2); return `<text x="${x}" y="${y}" text-anchor="middle" alignment-baseline="middle">${label}</text>`; }).join(''); container.innerHTML = `<svg class="radar-chart" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${gridLines}<g class="radar-labels">${labels}</g><polygon points="${points}" class="radar-shape current-shape" /><polygon points="${desiredPoints}" class="radar-shape desired-shape" /></svg>`; }
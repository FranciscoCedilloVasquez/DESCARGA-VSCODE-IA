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

    // --- New in v8: Clear Form Button ---
    const clearBtn = document.getElementById('clear-form-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const confirmed = confirm("¿Está seguro de que desea borrar todas sus respuestas y empezar de nuevo? Esta acción no se puede deshacer.");
            if (confirmed) {
                localStorage.removeItem('surveyAnswers');
                window.location.href = 'index.html';
            }
        });
    }
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

// --- Data Population Functions (from v6) ---
function populateAnswers(tbody, surveyData, answers) { surveyData.forEach(section => section.questions.forEach(q => { const row = tbody.insertRow(); row.innerHTML = `<td data-label="Pregunta">${q.text}</td><td data-label="Respuesta">${answers[q.id] || '<em>N/A</em>'}</td>`; })); }
function populateTable(tbody, data, columns) { const labels = { area: 'Área de Enfoque', obs: 'Observación Específica', impact: 'Impacto de Negocio', concept: 'Concepto', current: 'Situación Actual', action: 'Acción Propuesta', value: 'Valor / Ahorro' }; data.forEach(item => { const row = tbody.insertRow(); row.setAttribute('data-category', item.category || 'general'); columns.forEach(col => { const cell = row.insertCell(); cell.innerHTML = item[col] || ''; cell.setAttribute('data-label', labels[col]); if (item.statusClass) cell.classList.add(item.statusClass); }); }); }
function populateList(ul, data) { data.forEach(item => { const li = document.createElement('li'); li.setAttribute('data-category', item.category || 'general'); li.innerHTML = `<strong>${item.title}</strong><p>${item.desc}</p>`; ul.appendChild(li); }); }

// --- Graphics Rendering Functions (from v6) ---
function renderGaugeChart(idPrefix, value) { const fill = document.getElementById(`${idPrefix}-fill`); const text = document.getElementById(`${idPrefix}-value`); if(fill && text) { fill.style.transform = `rotate(${value * 1.8}deg)`; text.textContent = `${value}%`; } }
function renderRadarChart(container, data) { if(!container || !data) return; const size = 300; const center = size / 2; const points = data.values.map((v, i) => { const angle = (i / data.labels.length) * 2 * Math.PI; const x = center + v.current * (center - 30) * Math.cos(angle - Math.PI / 2); const y = center + v.current * (center - 30) * Math.sin(angle - Math.PI / 2); return `${x},${y}`; }).join(' '); const desiredPoints = data.values.map((v, i) => { const angle = (i / data.labels.length) * 2 * Math.PI; const x = center + v.desired * (center - 30) * Math.cos(angle - Math.PI / 2); const y = center + v.desired * (center - 30) * Math.sin(angle - Math.PI / 2); return `${x},${y}`; }).join(' '); let gridLines = ''; for (let i = 1; i <= 5; i++) { const radius = (i / 5) * (center - 30); gridLines += `<circle cx="${center}" cy="${center}" r="${radius}" class="radar-grid"/>`; } const labels = data.labels.map((label, i) => { const angle = (i / data.labels.length) * 2 * Math.PI; const x = center + (center - 10) * Math.cos(angle - Math.PI / 2); const y = center + (center - 10) * Math.sin(angle - Math.PI / 2); return `<text x="${x}" y="${y}" text-anchor="middle" alignment-baseline="middle">${label}</text>`; }).join(''); container.innerHTML = `<svg class="radar-chart" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${gridLines}<g class="radar-labels">${labels}</g><polygon points="${points}" class="radar-shape current-shape" /><polygon points="${desiredPoints}" class="radar-shape desired-shape" /></svg>`; }

// --- v8 Master Report Generation Engine ---
function generateMasterReport(answers) {
    // 1. Persona Detection
    let persona = 'PYME General';
    const numEmployees = parseInt(answers.empleados, 10) || 0;
    if (numEmployees > 500) persona = 'Corporativo';
    else if (answers.ti_interno === 'Sí' && numEmployees > 50) persona = 'Empresa Mediana Tecnológica';
    else if (answers.personal_campo === 'Sí') persona = 'Empresa con Personal de Campo';

    // 2. Hyper-Detailed Analysis
    const prose = { summary: '', diagnostics: '', recommendations: '' };
    const diagnostics = [], recommendations = [], savings = [];
    let scores = { collab: 2, security: 1, bi: 1, ia: 1, automation: 1, projects: 2 };
    const categories = new Set();

    prose.summary = `Basado en sus respuestas, hemos identificado que su organización se alinea con un perfil de **${persona}**. El análisis y las recomendaciones se han ajustado a las prioridades típicas de este perfil, centrándose en la optimización de costos, la seguridad y la eficiencia operativa.`;

    // --- Security Deep Dive ---
    if (answers.seguridad_satisfecho !== 'Sí') {
        scores.security = 1; categories.add('seguridad');
        prose.diagnostics = 'El área de seguridad presenta las brechas más críticas. La falta de confianza en las herramientas actuales y la no activación de funciones clave como Defender y Purview representan un riesgo operativo significativo que debe ser abordado con urgencia.';
        diagnostics.push({ category: 'seguridad', area: 'Confianza General', obs: 'La percepción interna de la seguridad es baja.', impact: 'Indica posibles incidentes previos o falta de visibilidad.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Protección de Endpoints', obs: 'No se confirma el uso de Defender for Endpoint.', impact: 'Los equipos (PCs, móviles) son vulnerables a malware y ransomware.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Fuga de Datos', obs: 'No se confirma el uso de políticas de Data Loss Prevention (DLP).', impact: 'Información sensible puede ser extraída sin control por email, USB, etc.', statusClass: 'status-warning' });
        diagnostics.push({ category: 'seguridad', area: 'Gestión de Identidad', obs: 'No se confirma el uso de Acceso Condicional.', impact: 'Las credenciales robadas pueden ser usadas fácilmente sin un segundo factor de autenticación.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Gobernanza de Datos', obs: 'Microsoft Purview no está activado o es desconocido.', impact: 'Riesgo de incumplimiento de normativas (LOPD, GDPR) y dificultad para auditorías.', statusClass: 'status-warning' });

        recommendations.push({ category: 'seguridad', title: '[URGENTE] Taller de Seguridad Zero Trust', desc: 'Una sesión práctica para activar y configurar Defender for Endpoint, Intune para gestión de dispositivos y políticas de Acceso Condicional.' });
        recommendations.push({ category: 'seguridad', title: 'Implementar Microsoft Purview', desc: 'Activar políticas de retención y etiquetado de datos para asegurar la información sensible y cumplir con las normativas vigentes.' });

        savings.push({ category: 'seguridad', concept: 'Software Antivirus/EDR de Terceros', current: 'Posible gasto en soluciones externas', action: 'Activar Defender for Endpoint (incluido en planes E3/E5)', value: 'Ahorro Directo Anual' });
        savings.push({ category: 'seguridad', concept: 'Coste de una Brecha', current: 'Riesgo financiero y reputacional elevado.', action: 'Mitigación con la suite de seguridad integrada', value: 'Valor (Mitigación)' });
    } else {
        scores.security = 4;
        diagnostics.push({ category: 'seguridad', area: 'Seguridad', obs: 'Buena postura de seguridad reportada.', impact: 'Riesgo controlado', statusClass: 'status-ok' });
    }

    // ... This hyper-detailed logic would be repeated for all other categories ...
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
    const radarData = { labels: ['Colaboración', 'Seguridad', 'Datos/BI', 'IA', 'Automatización', 'Proyectos'], values: [ { category: 'colaboracion', current: scores.collab / 5, desired: 0.9 }, { category: 'seguridad', current: scores.security / 5, desired: 0.95 }, { category: 'datos', current: scores.bi / 5, desired: 0.8 }, { category: 'ia', current: scores.ia / 5, desired: 0.85 }, { category: 'automatizacion', current: scores.automation / 5, desired: 0.9 }, { category: 'proyectos', current: scores.projects / 5, desired: 0.8 } ] };
    const gaugeData = { security: scores.security * 20 };
    const summaryPoints = `<ul><li>Nivel de madurez: <strong>${((Object.values(scores).reduce((a, b) => a + b, 0) / 30) * 100).toFixed(0)}%</strong></li><li>Área de mayor riesgo: <strong>Seguridad</strong></li><li>Mayor oportunidad: <strong>IA & Copilot</strong></li></ul>`;

    return { persona, prose, diagnostics, recommendations, savings, radarData, gaugeData, summaryPoints, licenseTable, filterButtons };
}

function generateLicenseTable(currentLicense) { /* from v6 */ }
function generateFilterButtons(categories) { let buttons = '<button class="filter-btn active" data-filter="all">Todos</button>'; categories.forEach(cat => { buttons += `<button class="filter-btn" data-filter="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`; }); return buttons; }

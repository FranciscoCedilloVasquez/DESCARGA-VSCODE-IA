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

    populateAnswers(document.getElementById('respuestas-body'), surveyData, answers);
    populateTable(document.getElementById('diagnostico-body'), report.diagnostics, ['area', 'obs', 'impact']);
    populateList(document.getElementById('recomendaciones-list'), report.recommendations);
    populateTable(document.getElementById('ahorro-body'), report.savings, ['concept', 'current', 'action', 'value']);

    // --- Render Graphics & Filters ---
    renderRadarChart(document.getElementById('radar-chart-container'), report.radarData, setupFilters);
    renderGaugeChart('security-gauge', report.gaugeData.security);
});

function setupFilters() {
    const filterTriggers = document.querySelectorAll('.radar-labels text');
    const filterableContent = document.querySelectorAll('.filterable-content tr, .filterable-content li');
    const allTitles = document.querySelectorAll('.filterable-title');

    const defaultTitle = 'Diagnóstico Detallado';
    document.getElementById('diagnostico-title').setAttribute('data-default-title', defaultTitle);

    filterTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const filter = trigger.getAttribute('data-filter');
            const isActive = trigger.classList.contains('active');

            filterTriggers.forEach(t => t.classList.remove('active'));
            allTitles.forEach(t => t.style.display = 'none'); // Hide all titles

            if (isActive) {
                // Deactivate filter
                filterableContent.forEach(item => item.style.display = '');
                document.getElementById('diagnostico-title').textContent = defaultTitle;
            } else {
                // Activate filter
                trigger.classList.add('active');
                filterableContent.forEach(item => {
                    item.style.display = (item.getAttribute('data-category') === filter) ? '' : 'none';
                });
                const activeTitle = trigger.textContent;
                document.getElementById('diagnostico-title').textContent = `Diagnóstico Detallado: ${activeTitle}`;
            }
        });
    });
}

// --- Data Population Functions ---
function populateAnswers(tbody, surveyData, answers) { /* ... from v6 ... */ }
function populateTable(tbody, data, columns) { /* ... from v6 ... */ }
function populateList(ul, data) { /* ... from v6 ... */ }

// --- Graphics Rendering Functions ---
function renderGaugeChart(idPrefix, value) { /* ... from v6 ... */ }
function renderRadarChart(container, data, callback) {
    if(!container || !data) return;
    const size = 300;
    const center = size / 2;
    // ... (rest of the radar chart SVG generation logic from v6)
    const labels = data.labels.map((label, i) => {
        const angle = (i / data.labels.length) * 2 * Math.PI;
        const x = center + (center - 10) * Math.cos(angle - Math.PI / 2);
        const y = center + (center - 10) * Math.sin(angle - Math.PI / 2);
        return `<text x="${x}" y="${y}" data-filter="${data.values[i].category}" text-anchor="middle" alignment-baseline="middle">${label}</text>`;
    }).join('');

    container.innerHTML = `<svg class="radar-chart">...</svg>`; // Assembled SVG string
    callback(); // Call setupFilters after rendering
}

// --- v7 Master Report Generation Engine ---
function generateMasterReport(answers) {
    // 1. Persona Detection (from v6)
    let persona = 'PYME General';
    // ...

    // 2. Hyper-Detailed Analysis
    const prose = { summary: '', diagnostics: '', recommendations: '' };
    const diagnostics = [], recommendations = [], savings = [];
    let scores = { collab: 2, security: 1, bi: 1, ia: 1, automation: 1, projects: 2 };

    // --- Security Deep Dive ---
    if (answers.seguridad_satisfecho !== 'Sí') {
        scores.security = 1;
        prose.diagnostics = 'El área de seguridad presenta las brechas más críticas...';
        // Granular diagnostics
        diagnostics.push({ category: 'seguridad', area: 'Confianza General', obs: 'La percepción interna de la seguridad es baja.', impact: 'Indica posibles incidentes previos o falta de visibilidad.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Protección de Endpoints', obs: 'No se confirma el uso de Defender for Endpoint.', impact: 'Los equipos (PCs, móviles) son vulnerables a malware y ransomware.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Fuga de Datos', obs: 'No se confirma el uso de políticas de Data Loss Prevention (DLP).', impact: 'Información sensible puede ser extraída sin control por email, USB, etc.', statusClass: 'status-warning' });
        diagnostics.push({ category: 'seguridad', area: 'Gestión de Identidad', obs: 'No se confirma el uso de Acceso Condicional.', impact: 'Las credenciales robadas pueden ser usadas fácilmente sin un segundo factor de autenticación.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Gobernanza de Datos', obs: 'Microsoft Purview no está activado o es desconocido.', impact: 'Riesgo de incumplimiento de normativas (LOPD, GDPR) y dificultad para auditorías.', statusClass: 'status-warning' });

        recommendations.push({ category: 'seguridad', title: '[Paso 1] Activar Defender for Endpoint', desc: 'Desplegar el agente en todos los equipos para obtener protección EDR de clase mundial.' });
        recommendations.push({ category: 'seguridad', title: '[Paso 2] Configurar Acceso Condicional', desc: 'Implementar políticas de MFA (Multi-Factor Authentication) para todos los usuarios, especialmente administradores.' });
        recommendations.push({ category: 'seguridad', title: '[Paso 3] Políticas DLP Iniciales', desc: 'Crear una política base para prevenir el envío de documentos con DNI o números de tarjeta de crédito a externos.' });

        savings.push({ category: 'seguridad', concept: 'Software Antivirus/EDR', current: 'Posible gasto en McAfee, Sophos, etc.', action: 'Reemplazar con Defender for Endpoint', value: 'Ahorro Directo' });
        savings.push({ category: 'seguridad', concept: 'Coste de una Brecha', current: 'Riesgo financiero y reputacional elevado.', action: 'Mitigación con la suite de seguridad integrada', value: 'Valor (Mitigación)' });
    } else {
        scores.security = 4;
        diagnostics.push({ category: 'seguridad', area: 'Seguridad', obs: 'Buena postura de seguridad reportada.', impact: 'Riesgo controlado', statusClass: 'status-ok' });
    }

    // ... This hyper-detailed logic would be repeated for all other categories ...

    // 3. Generate Dynamic Components (from v6)
    const licenseTable = generateLicenseTable(answers.m365_edicion);

    // 4. Prepare Graphics Data
    const radarData = {
        labels: ['Colaboración', 'Seguridad', 'Datos/BI', 'IA', 'Automatización', 'Proyectos'],
        values: [
            { category: 'colaboracion', current: scores.collab / 5, desired: 0.9 },
            { category: 'seguridad', current: scores.security / 5, desired: 0.95 },
            { category: 'datos', current: scores.bi / 5, desired: 0.8 },
            { category: 'ia', current: scores.ia / 5, desired: 0.85 },
            { category: 'automatizacion', current: scores.automation / 5, desired: 0.9 },
            { category: 'proyectos', current: scores.projects / 5, desired: 0.8 }
        ]
    };
    const gaugeData = { security: scores.security * 20 };
    const summaryPoints = `<ul><li>Nivel de madurez: <strong>${((Object.values(scores).reduce((a, b) => a + b, 0) / 30) * 100).toFixed(0)}%</strong></li><li>Área de mayor riesgo: <strong>Seguridad</strong></li><li>Mayor oportunidad: <strong>IA & Copilot</strong></li></ul>`;

    return { persona, prose, diagnostics, recommendations, savings, radarData, gaugeData, summaryPoints, licenseTable };
}

// Dummy/Helper functions to be copied from v6
function generateLicenseTable(currentLicense) { /* ... */ }
function populateAnswers(tbody, surveyData, answers) { /* ... */ }
function populateTable(tbody, data, columns) { /* ... */ }
function populateList(ul, data) { /* ... */ }

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const themeToggle = document.getElementById('theme-toggle');

    // --- State Management ---
    const answers = JSON.parse(localStorage.getItem('surveyAnswers'));
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));

    // --- Initial Checks ---
    if (!answers || !surveyData) {
        document.body.innerHTML = `
            <div class="container">
                <h1>Error: No se encontraron datos de la encuesta.</h1>
                <p>Por favor, complete la encuesta primero.</p>
                <a href="index.html">Volver a la encuesta</a>
            </div>`;
        return;
    }

    // --- Report Generation ---
    const report = generateMasterReport(answers);

    // --- Functions ---

    /**
     * Populates the main report content into the DOM.
     */
    function populateReport() {
        document.getElementById('report-cliente').textContent = answers.empresa || 'N/A';
        document.getElementById('report-fecha').textContent = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
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
    }

    /**
     * Sets up event listeners for the filter buttons.
     */
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

    /**
     * Handles the theme toggling functionality.
     */
    function handleThemeToggle() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /**
     * Sets up the event listener for the 'clear and start over' button.
     */
    function setupClearButton() {
        const clearBtn = document.getElementById('clear-form-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const confirmed = confirm("¿Está seguro de que desea borrar todas sus respuestas y empezar de nuevo? Esta acción no se puede deshacer.");
                if (confirmed) {
                    localStorage.removeItem('surveyAnswers');
                    localStorage.removeItem('surveyData'); // Also clear the questions
                    window.location.href = 'index.html';
                }
            });
        }
    }

    // --- Initial Load ---
    handleThemeToggle();
    populateReport();
    renderRadarChart(document.getElementById('radar-chart-container'), report.radarData);
    setupFilters();
    setupClearButton();
});


// --- Data Population Functions ---

function populateAnswers(tbody, surveyData, answers) {
    tbody.innerHTML = ''; // Clear existing rows
    surveyData.forEach(section => {
        section.questions.forEach(q => {
            const row = tbody.insertRow();
            row.innerHTML = `<td data-label="Pregunta">${q.text}</td><td data-label="Respuesta">${answers[q.id] || '<em>No respondida</em>'}</td>`;
        });
    });
}

function populateTable(tbody, data, columns) {
    tbody.innerHTML = ''; // Clear existing rows
    const labels = { area: 'Área de Enfoque', obs: 'Observación Específica', impact: 'Impacto de Negocio', concept: 'Concepto', current: 'Situación Actual', action: 'Acción Propuesta', value: 'Valor / Ahorro' };
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
    ul.innerHTML = ''; // Clear existing items
    data.forEach(item => {
        const li = document.createElement('li');
        li.setAttribute('data-category', item.category || 'general');
        li.innerHTML = `<strong>${item.title}</strong><p>${item.desc}</p>`;
        ul.appendChild(li);
    });
}

// --- Graphics Rendering Functions ---

function renderRadarChart(container, data) {
    if (!container || !data) return;
    const size = Math.min(container.clientWidth, 400);
    const center = size / 2;
    const labels = data.labels;
    const numLevels = 5;
    const angleSlice = (Math.PI * 2) / labels.length;

    let svg = `<svg class="radar-chart" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

    // Grid lines
    for (let i = 1; i <= numLevels; i++) {
        const radius = (i / numLevels) * (center * 0.8);
        svg += `<circle cx="${center}" cy="${center}" r="${radius}" class="radar-grid"/>`;
    }

    // Labels
    svg += `<g class="radar-labels">`;
    labels.forEach((label, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + (center * 0.9) * Math.cos(angle);
        const y = center + (center * 0.9) * Math.sin(angle);
        svg += `<text x="${x}" y="${y}" text-anchor="middle" alignment-baseline="middle">${label}</text>`;
    });
    svg += `</g>`;

    // Data polygons
    const currentPoints = data.values.map((v, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + v.current * (center * 0.8) * Math.cos(angle);
        const y = center + v.current * (center * 0.8) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const desiredPoints = data.values.map((v, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = center + v.desired * (center * 0.8) * Math.cos(angle);
        const y = center + v.desired * (center * 0.8) * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    svg += `<polygon points="${desiredPoints}" class="radar-shape desired-shape" />`;
    svg += `<polygon points="${currentPoints}" class="radar-shape current-shape" />`;

    svg += `</svg>`;
    container.innerHTML = svg;
}


// --- Master Report Generation Engine ---

function generateMasterReport(answers) {
    // 1. Persona Detection
    let persona = 'PYME General';
    const numEmployees = parseInt(answers.empleados, 10) || 0;
    if (numEmployees > 500) persona = 'Corporativo';
    else if (answers.ti_interno === 'Sí' && numEmployees > 50) persona = 'Empresa Mediana Tecnológica';
    else if (answers.personal_campo === 'Sí') persona = 'Empresa con Personal de Campo';

    // 2. Analysis & Scoring
    const prose = { summary: '', diagnostics: '', recommendations: '' };
    const diagnostics = [], recommendations = [], savings = [];
    const categories = new Set(['general']);
    let scores = { collab: 2, security: 1, bi: 1, ia: 1, automation: 1, projects: 2 };

    prose.summary = `Basado en sus respuestas, su organización se alinea con el perfil de **${persona}**. Este informe se enfoca en optimizar costos, mejorar la seguridad y potenciar la eficiencia operativa, prioridades clave para este perfil.`;

    // --- Security Analysis ---
    if (answers.seguridad_satisfecho !== 'Sí') {
        scores.security = 1;
        categories.add('seguridad');
        prose.diagnostics = 'El área de seguridad muestra brechas críticas. La falta de confianza en las herramientas actuales y la no activación de funciones clave como Defender y Purview suponen un riesgo operativo que debe abordarse urgentemente.';
        diagnostics.push({ category: 'seguridad', area: 'Confianza General', obs: 'La percepción interna de la seguridad es baja.', impact: 'Indica posibles incidentes o falta de visibilidad.', statusClass: 'status-danger' });
        diagnostics.push({ category: 'seguridad', area: 'Protección de Endpoints', obs: 'No se confirma el uso de Defender for Endpoint.', impact: 'Equipos vulnerables a malware y ransomware.', statusClass: 'status-danger' });
        recommendations.push({ category: 'seguridad', title: '[URGENTE] Taller de Seguridad Zero Trust', desc: 'Sesión práctica para activar y configurar Defender for Endpoint, Intune y políticas de Acceso Condicional.' });
        savings.push({ category: 'seguridad', concept: 'Software Antivirus/EDR', current: 'Posible gasto en soluciones externas', action: 'Activar Defender for Endpoint (incluido)', value: 'Ahorro Directo' });
    }
     else {
        scores.security = 4;
        diagnostics.push({ category: 'seguridad', area: 'Seguridad', obs: 'Buena postura de seguridad reportada.', impact: 'Riesgo controlado', statusClass: 'status-ok' });
    }

    // --- AI & Copilot Analysis ---
    if (answers.m365_copilot !== 'Sí') {
        scores.ia = 1;
        categories.add('ia');
        diagnostics.push({ category: 'ia', area: 'IA & Copilot', obs: 'Nulo aprovechamiento de la IA generativa.', impact: 'Pérdida de eficiencia y competitividad.', statusClass: 'status-warning' });
        recommendations.push({ category: 'ia', title: 'Iniciar Piloto de M365 Copilot', desc: 'Seleccionar un departamento para un piloto de 3 meses y medir el ROI en horas ahorradas.' });
        savings.push({ category: 'ia', concept: 'Eficiencia de Empleados', current: 'Tareas 100% manuales', action: 'Uso de Copilot para resumir, crear y analizar', value: 'ROI (Horas/Hombre)' });
    }
     else {
        scores.ia = 4;
    }

    // --- Add more analysis for other sections here... ---

    // 3. Generate Dynamic Components
    const licenseTable = generateLicenseTable(answers.m365_edicion);
    const filterButtons = generateFilterButtons(categories);

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

    const maturityLevel = ((Object.values(scores).reduce((a, b) => a + b, 0) / (Object.keys(scores).length * 5)) * 100).toFixed(0);
    const summaryPoints = `<ul>
                            <li>Nivel de madurez digital: <strong>${maturityLevel}%</strong></li>
                            <li>Área de mayor riesgo: <strong>Seguridad</strong></li>
                            <li>Mayor oportunidad: <strong>Inteligencia Artificial</strong></li>
                           </ul>`;

    return { persona, prose, diagnostics, recommendations, savings, radarData, summaryPoints, licenseTable, filterButtons };
}

function generateLicenseTable(currentLicense) {
    // This function can be expanded with real data
    const licenses = {
        'Business Basic': { copilot: 'No', defender: 'No', purview: 'No' },
        'Business Standard': { copilot: 'No', defender: 'No', purview: 'No' },
        'Business Premium': { copilot: 'Add-on', defender: 'Sí', purview: 'Sí' },
        'Microsoft 365 E3': { copilot: 'Add-on', defender: 'Sí', purview: 'Sí' },
        'Microsoft 365 E5': { copilot: 'Sí', defender: 'Sí', purview: 'Sí' }
    };
    const recommended = 'Microsoft 365 E5'; // Example recommendation

    let table = `<table class="report-table license-table">
                    <thead><tr><th>Funcionalidad Clave</th><th>${currentLicense || 'Su Plan'}</th><th>Plan Recomendado (${recommended})</th></tr></thead>
                    <tbody>
                        <tr><td>Microsoft 365 Copilot</td><td>...</td><td class="check-mark">✔</td></tr>
                        <tr><td>Defender for Endpoint P2</td><td>...</td><td class="check-mark">✔</td></tr>
                        <tr><td>Microsoft Purview</td><td>...</td><td class="check-mark">✔</td></tr>
                    </tbody>
                 </table>`;
    return table;
}

function generateFilterButtons(categories) {
    let buttons = '<button class="filter-btn active" data-filter="all">Mostrar Todo</button>';
    categories.forEach(cat => {
        const displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
        buttons += `<button class="filter-btn" data-filter="${cat}">${displayName}</button>`;
    });
    return buttons;
}

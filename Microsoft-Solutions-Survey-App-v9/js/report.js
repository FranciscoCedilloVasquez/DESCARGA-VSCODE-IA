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

    // --- Functions ---

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

    function generateNextSteps(answers, report) {
        let html = `<h2>📎 Próximos Pasos Sugeridos</h2>`;
        html += `<p>Basado en el diagnóstico, le recomendamos las siguientes acciones para maximizar su inversión y mitigar los riesgos identificados.</p>`;
        html += `<ul class="recommendations filterable-content">`;

        if (report.diagnostics.some(d => d.category === 'seguridad')) {
            html += `<li data-category=\"seguridad\"><strong>Agendar Taller de Seguridad:</strong> Contacte a nuestro equipo para realizar el Taller de Seguridad Zero Trust y desplegar las soluciones de seguridad incluidas en su licenciamiento.</li>`;
        }
        if (report.diagnostics.some(d => d.category === 'ia')) {
            html += `<li data-category=\"ia\"><strong>Iniciar Piloto de IA:</strong> Defina un equipo y caso de uso para el piloto de Microsoft 365 Copilot. Podemos ayudarle a estructurar la medición de resultados.</li>`;
        }
        if (answers['propuesta'] === 'Sí') {
            html += `<li data-category=\"general\"><strong>Revisar Propuesta Personalizada:</strong> En breve recibirá una propuesta detallada con el plan de optimización de licenciamiento y los servicios sugeridos.</li>`;
        }

        html += `<li data-category=\"general\"><strong>Sesión de Seguimiento:</strong> Proponemos una reunión en las próximas dos semanas para discutir este informe en detalle y definir un plan de trabajo conjunto.</li>`;
        html += `</ul>`;

        html += `<div class=\"final-cta-buttons\">
                 <button onclick=\"window.print()\">Imprimir o Guardar como PDF</button>
                 <button onclick=\"window.location.href='index.html'\">Modificar Respuestas</button>
                 <button id=\"clear-form-btn\" class=\"btn-danger\">Limpiar y Empezar de Nuevo</button>`;
        html += `</div>`;

        return html;
    }

    function determinePersona(answers) {
        const numEmployees = parseInt(answers.empleados, 10) || 0;
        if (numEmployees > 500) return 'Corporativo';
        if (answers.ti_interno === 'Sí' && numEmployees > 50) return 'Empresa Mediana Tecnológica';
        if (answers.personal_campo === 'Sí') return 'Empresa con Personal de Campo';
        return 'PYME General';
    }

    function calculateScores(answers) {
        let scores = { collab: 0, security: 0, bi: 0, ia: 0, automation: 0, projects: 0 };
        // Scoring
        if(answers.teams === 'Sí') scores.collab += 2;
        if(answers.teams === 'Parcialmente') scores.collab += 1;
        if(answers.sharepoint === 'Sí') scores.collab += 2;
        if(answers.exchange === 'Sí') scores.collab += 1;

        if(answers.seguridad_satisfecho === 'Sí') scores.security = 4;
        else scores.security = 1;
        if(answers.seguridad_funciones === 'Sí') scores.security +=1;

        if(answers.power_bi && answers.power_bi.startsWith('Sí')) scores.bi += 2;
        if(answers.azure_synapse === 'Sí') scores.bi += 2;
        if(answers.bi_strategy === 'Sí') scores.bi += 1;

        if(answers.m365_copilot === 'Sí') scores.ia = 4;
        else scores.ia = 1;
        if(answers.copilot_tools === 'Sí') scores.ia += 1;

        if(answers.power_apps === 'Sí') scores.automation += 2;
        if(answers.power_apps === 'Planea hacerlo') scores.automation += 1;
        if(answers.power_automate === 'Sí') scores.automation += 2;
        if(answers.power_automate === 'Parcialmente') scores.automation += 1;
        if(answers.low_code_staff === 'Sí') scores.automation += 1;

        if(answers.project === 'Sí') scores.projects += 2;
        if(answers.project === 'Planea hacerlo') scores.projects += 1;
        if(answers.planner === 'Sí') scores.projects += 2;
        if(answers.planner === 'Parcialmente') scores.projects += 1;
        scores.projects = (scores.projects / 4) * 5; // Normalize to 5
        return scores;
    }

    function generateDiagnosticsAndRecommendations(scores, answers) {
        const diagnostics = [];
        const recommendations = [];
        const categories = new Set(['general']);
        let prose = { diagnostics: '', recommendations: '' };

        if (scores.security < 3) {
            categories.add('seguridad');
            prose.diagnostics += 'El área de seguridad muestra brechas críticas. ';
            diagnostics.push({ category: 'seguridad', area: 'Confianza General', obs: 'La percepción interna de la seguridad es baja.', impact: 'Indica posibles incidentes o falta de visibilidad.', statusClass: 'status-danger' });
            recommendations.push({ category: 'seguridad', title: '[URGENTE] Taller de Seguridad Zero Trust', desc: 'Sesión práctica para activar y configurar Defender for Endpoint, Intune y políticas de Acceso Condicional.' });
        }

        if (scores.ia < 3) {
            categories.add('ia');
            prose.diagnostics += 'Nulo aprovechamiento de la IA generativa. ';
            diagnostics.push({ category: 'ia', area: 'IA & Copilot', obs: 'Bajo uso de la IA generativa.', impact: 'Pérdida de eficiencia y competitividad.', statusClass: 'status-warning' });
            recommendations.push({ category: 'ia', title: 'Iniciar Piloto de M365 Copilot', desc: 'Seleccionar un departamento para un piloto de 3 meses y medir el ROI en horas ahorradas.' });
        }

        if(diagnostics.length === 0) {
            diagnostics.push({ category: 'general', area: 'Diagnóstico General', obs: 'No se han detectado problemas significativos en las áreas evaluadas.', impact: 'Su configuración actual parece ser adecuada.', statusClass: 'status-ok' });
        }

        // Populate prose.recommendations based on generated recommendations
        if (recommendations.length > 0) {
            prose.recommendations = 'Basado en el diagnóstico, le recomendamos las siguientes acciones para maximizar su inversión y mitigar los riesgos identificados:';
        } else {
            prose.recommendations = 'No se han identificado recomendaciones específicas en esta evaluación. Su configuración actual parece ser adecuada.';
        }

        return { diagnostics, recommendations, categories, prose };
    }

    function generateRadarData(scores) {
        return {
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
    }

    function calculateMaturityLevel(scores) {
        const maturityLevel = ((Object.values(scores).reduce((a, b) => a + b, 0) / (Object.keys(scores).length * 5)) * 100).toFixed(0);
        const summaryPoints = `<ul>
                                <li>Nivel de madurez digital: <strong>${maturityLevel}%</strong></li>
                                <li>Área de mayor riesgo: <strong>${Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b)}</strong></li>
                                <li>Mayor oportunidad: <strong>${Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)}</strong></li>
                               </ul>`;
        return summaryPoints;
    }

    function generateSavings(answers) {
        const savings = [];
        const numEmployees = parseInt(answers.empleados, 10) || 50; // Default to 50 employees if not specified

        // 1. Microsoft 365 Copilot Adoption
        if (answers.m365_copilot !== 'Sí') {
            const hoursSavedPerUserPerMonth = 2.5; // Conservative estimate
            const avgHourlyRate = 25; // Estimated average hourly rate in USD
            const monthlySavings = Math.round(numEmployees * hoursSavedPerUserPerMonth * avgHourlyRate);
            savings.push({
                category: 'ia',
                concept: 'Ahorro de tiempo con M365 Copilot',
                current: 'No se utiliza o se planea utilizar.',
                action: 'Implementar un piloto de M365 Copilot para medir el ROI y expandir su uso.',
                value: `$${monthlySavings.toLocaleString('es-ES')} / mes (estimado)`
            });
        }

        // 2. Power Automate Process Automation
        if (answers.power_automate !== 'Sí') {
            const processesToAutomate = 5; // Estimated number of simple processes
            const hoursSavedPerProcessPerMonth = 10;
            const avgHourlyRate = 20;
            const monthlySavings = Math.round(processesToAutomate * hoursSavedPerProcessPerMonth * avgHourlyRate);
            savings.push({
                category: 'automatizacion',
                concept: 'Automatización de Tareas con Power Automate',
                current: 'Procesos manuales o sin automatización.',
                action: 'Identificar 2-3 procesos clave (ej. aprobación de gastos, solicitudes de vacaciones) y automatizarlos.',
                value: `$${monthlySavings.toLocaleString('es-ES')} / mes (estimado)`
            });
        }

        // 3. Field Personnel Efficiency with Power Apps
        if (answers.personal_campo === 'Sí' && answers.power_apps !== 'Sí') {
            const fieldUsers = Math.round(numEmployees * 0.3); // Assuming 30% are field workers
            const hoursSavedPerUserPerWeek = 1;
            const avgHourlyRate = 22;
            const monthlySavings = Math.round(fieldUsers * hoursSavedPerUserPerWeek * 4 * avgHourlyRate);
            savings.push({
                category: 'desarrollo',
                concept: 'Eficiencia del Personal de Campo con Power Apps',
                current: 'Procesos en papel o ineficientes para el personal de campo.',
                action: 'Desarrollar una Power App para digitalizar un proceso clave (ej. reportes de visita, inspecciones).',
                value: `$${monthlySavings.toLocaleString('es-ES')} / mes (estimado)`
            });
        }
        
        // 4. License Optimization
        if (answers.m365_edicion === 'Microsoft 365 E5') {
             savings.push({
                category: 'general',
                concept: 'Optimización de Licenciamiento',
                current: 'Licenciamiento Microsoft 365 E5.',
                action: 'Asegurar el despliegue y adopción de todas las funciones de E5 para maximizar el ROI.',
                value: 'ROI Maximizado'
            });
        } else if (answers.m365_edicion !== 'No estoy seguro') {
            savings.push({
                category: 'general',
                concept: 'Optimización de Licenciamiento',
                current: `Licenciamiento ${answers.m365_edicion}.`,
                action: 'Evaluar la migración a Microsoft 365 E5 para consolidar costos y acceder a funciones avanzadas de seguridad e IA.',
                value: 'Potencial de Consolidación'
            });
        }

        if (savings.length === 0) {
            savings.push({
                category: 'general',
                concept: 'Oportunidades de Ahorro',
                current: 'No se han identificado oportunidades de ahorro directo en esta evaluación.',
                action: 'Realizar un análisis más profundo de los procesos internos para identificar áreas de mejora.',
                value: 'N/A'
            });
        }

        return savings;
    }

    function generateMasterReport(answers) {
        const persona = determinePersona(answers);
        const scores = calculateScores(answers);
        const { diagnostics, recommendations, categories, prose: diagProse } = generateDiagnosticsAndRecommendations(scores, answers);
        const prose = {
            summary: `Basado en sus respuestas, su organización se alinea con el perfil de **${persona}**. Este informe se enfoca en optimizar costos, mejorar la seguridad y potenciar la eficiencia operativa, prioridades clave para este perfil.`,
            diagnostics: diagProse.diagnostics,
            recommendations: ''
        };
        const savings = generateSavings(answers);
        const licenseTable = generateLicenseTable(answers.m365_edicion);
        const filterButtons = generateFilterButtons(categories);
        const radarData = generateRadarData(scores);
        const summaryPoints = calculateMaturityLevel(scores);

        return { persona, prose, diagnostics, recommendations, savings, radarData, summaryPoints, licenseTable, filterButtons };
    }

    function generateLicenseTable(currentLicense) {
        const licenses = {
            'Business Basic': { 'Microsoft 365 Copilot': 'No', 'Defender for Endpoint P2': 'No', 'Microsoft Purview': 'No' },
            'Business Standard': { 'Microsoft 365 Copilot': 'No', 'Defender for Endpoint P2': 'No', 'Microsoft Purview': 'No' },
            'Business Premium': { 'Microsoft 365 Copilot': 'Add-on', 'Defender for Endpoint P2': 'Sí', 'Microsoft Purview': 'Sí' },
            'Microsoft 365 E3': { 'Microsoft 365 Copilot': 'Add-on', 'Defender for Endpoint P2': 'Sí', 'Microsoft Purview': 'Sí' },
            'Microsoft 365 E5': { 'Microsoft 365 Copilot': 'Sí', 'Defender for Endpoint P2': 'Sí', 'Microsoft Purview': 'Sí' },
            'Office 365': { 'Microsoft 365 Copilot': 'No', 'Defender for Endpoint P2': 'No', 'Microsoft Purview': 'No' },
            'No estoy seguro': { 'Microsoft 365 Copilot': 'No', 'Defender for Endpoint P2': 'No', 'Microsoft Purview': 'No' }
        };
        const recommended = 'Microsoft 365 E5';
        const recommendedFeatures = licenses[recommended];
        const currentFeatures = licenses[currentLicense] || {};
        const currentLicenseName = currentLicense || 'Su Plan';
        const recommendedLicenseName = `Plan Recomendado (${recommended})`;

        let table = `<table class="report-table license-table">
                        <thead><tr><th>Funcionalidad Clave</th><th>${currentLicenseName}</th><th>${recommendedLicenseName}</th></tr></thead>
                        <tbody>`;

        for (const feature in recommendedFeatures) {
            const currentValue = currentFeatures[feature] || 'No disponible';
            const recommendedValue = recommendedFeatures[feature];
            const isRecommended = recommendedValue === 'Sí';

            table += `<tr>
                        <td data-label="Funcionalidad Clave">${feature}</td>
                        <td data-label="${currentLicenseName}">${currentValue}</td>
                        <td data-label="${recommendedLicenseName}" class="${isRecommended ? 'check-mark' : ''}">${isRecommended ? '✔' : recommendedValue}</td>
                      </tr>`;
        }

        table += `      </tbody>
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
        
        const nextStepsHtml = generateNextSteps(answers, report);
        document.querySelector('.final-cta').innerHTML = nextStepsHtml;

        const clearBtn = document.getElementById('clear-form-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const confirmed = confirm("¿Está seguro de que desea borrar todas sus respuestas y empezar de nuevo? Esta acción no se puede deshacer.");
                if (confirmed) {
                    localStorage.removeItem('surveyAnswers');
                    localStorage.removeItem('surveyData');
                    window.location.href = 'index.html';
                }
            });
        }
    }

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

    function handleThemeToggle() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- Initial Load ---
    const report = generateMasterReport(answers);
    handleThemeToggle();
    populateReport();
    renderRadarChart(document.getElementById('radar-chart-container'), report.radarData);
    setupFilters();

});
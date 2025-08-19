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
        const labels = { area: 'Área de Enfoque', obs: 'Observación Específica', impact: 'Impacto de Negocio' };
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
        if (data.length === 0) {
            ul.innerHTML = '<li><em>No se han identificado acciones o recomendaciones específicas en esta evaluación.</em></li>';
            return;
        }
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

    function generateNextSteps(report) {
        let html = `<h2>📎 Próximos Pasos Sugeridos</h2>`;
        html += `<p>Basado en el diagnóstico, le recomendamos las siguientes acciones para mejorar la madurez de su infraestructura y seguridad.</p>`;
        html += `<ul class="recommendations filterable-content">`;

        if (report.recommendations.length > 0) {
            report.recommendations.forEach(rec => {
                html += `<li data-category="${rec.category}"><strong>${rec.title}:</strong> ${rec.desc}</li>`;
            });
        }

        html += `<li data-category="general"><strong>Sesión de Seguimiento:</strong> Proponemos una reunión para discutir este informe en detalle y definir un plan de trabajo conjunto.</li>`;
        html += `</ul>`;

        html += `<div class="final-cta-buttons">
                 <button onclick="window.print()">Imprimir o Guardar como PDF</button>
                 <button onclick="window.location.href='index.html'">Modificar Respuestas</button>
                 <button id="clear-form-btn" class="btn-danger">Limpiar y Empezar de Nuevo</button>`;
        html += `</div>`;

        return html;
    }

    function determinePersona(answers) {
        const numEmployees = parseInt(answers.empleados, 10) || 0;
        if (numEmployees > 250) return 'Corporativo';
        if (answers.ti_interno === 'Sí' && numEmployees > 50) return 'Empresa Mediana con TI';
        return 'PYME';
    }

    function generatePersonaDescription(persona) {
        const descriptions = {
            'PYME': 'Pequeñas y Medianas Empresas (PYMEs) que buscan optimizar sus recursos y mejorar su seguridad con soluciones escalables y rentables.',
            'Empresa Mediana con TI': 'Empresas en crecimiento con equipos de TI internos que necesitan herramientas avanzadas para gestionar una infraestructura en expansión y protegerse contra ciberamenazas sofisticadas.',
            'Corporativo': 'Grandes corporaciones que requieren soluciones de seguridad y gestión de TI de nivel empresarial para cumplir con normativas estrictas, gestionar un gran número de usuarios y proteger activos críticos.'
        };
        return descriptions[persona] || 'Perfil no determinado.';
    }

    function calculateScores(answers, surveyData) {
        let scores = {};
        let maxScores = {};

        surveyData.forEach(section => {
            if (section.id === 'info-general') return;

            const sectionId = section.id.replace(/-/g, '_');
            scores[sectionId] = 0;
            maxScores[sectionId] = 0;

            section.questions.forEach(q => {
                const userAnswer = answers[q.id];
                let questionMaxScore = 0;

                if (q.type === 'radio' && q.options) {
                    q.options.forEach(opt => {
                        if (typeof opt.score === 'number') {
                            questionMaxScore = Math.max(questionMaxScore, opt.score);
                            if (userAnswer === opt.text) {
                                scores[sectionId] += opt.score;
                            }
                        }
                    });
                }
                maxScores[sectionId] += questionMaxScore;
            });
        });

        return { scores, maxScores };
    }

    function generateDiagnosticsAndRecommendations(scores, maxScores, answers, surveyData) {
        const diagnostics = [];
        const recommendations = [];
        const categories = new Set(['general']);
        let prose = { diagnostics: '', recommendations: '' };

        surveyData.forEach(section => {
            if (section.id === 'info-general') return;

            const sectionId = section.id.replace(/-/g, '_');
            const sectionScore = scores[sectionId];
            const sectionMaxScore = maxScores[sectionId];

            section.questions.forEach(q => {
                const userAnswer = answers[q.id];
                if (q.recommendation && sectionScore < sectionMaxScore * 0.7) { // Example threshold
                    categories.add(sectionId);
                    diagnostics.push({
                        category: sectionId,
                        area: section.title,
                        obs: q.recommendation.obs,
                        impact: q.recommendation.impact,
                        statusClass: q.recommendation.statusClass
                    });
                    recommendations.push({
                        category: sectionId,
                        title: q.recommendation.title,
                        desc: q.recommendation.desc
                    });
                }
            });
        });

        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const totalMaxScore = Object.values(maxScores).reduce((a, b) => a + b, 0);
        const maturityPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

        if (diagnostics.length === 0) {
            prose.diagnostics = 'Felicitaciones. Su infraestructura y seguridad TI demuestran un alto nivel de madurez. Las siguientes observaciones son áreas de mejora continua o de optimización.';
        } else {
            prose.diagnostics = 'El análisis de sus respuestas indica las siguientes observaciones clave y áreas donde se requiere atención para mejorar la madurez de su infraestructura y seguridad TI.';
        }

        if (recommendations.length === 0) {
            prose.recommendations = 'Su organización ya implementa muchas de las mejores prácticas. Le recomendamos continuar con la revisión periódica de sus sistemas y procesos para mantener este alto nivel de madurez.';
        } else {
            prose.recommendations = 'Basado en el diagnóstico, le recomendamos las siguientes acciones estratégicas para mejorar significativamente su nivel de madurez y fortalecer su postura de seguridad:';
        }

        return { diagnostics, recommendations, categories, prose };
    }

    function generateRadarData(scores, maxScores) {
        const labels = Object.keys(scores).map(key => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        const values = Object.keys(scores).map(key => {
            const maxScore = maxScores[key] || 1;
            return {
                category: key,
                current: (scores[key] / maxScore),
                desired: 1
            };
        });

        return { labels, values };
    }

    function calculateMaturityLevel(scores, maxScores) {
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const totalMaxScore = Object.values(maxScores).reduce((a, b) => a + b, 0);
        const maturityLevel = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(0) : 0;

        const sortedScores = Object.entries(scores).sort(([,a],[,b]) => a-b);
        const weakestArea = sortedScores[0]?.[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';
        const strongestArea = sortedScores[sortedScores.length - 1]?.[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A';

        const summaryPoints = `<ul>
                                <li>Nivel de madurez general: <strong>${maturityLevel}%</strong></li>
                                <li>Área más débil: <strong>${weakestArea}</strong></li>
                                <li>Área más fuerte: <strong>${strongestArea}</strong></li>
                               </ul>`;
        return summaryPoints;
    }

    function generateMasterReport(answers, surveyData) {
        const persona = determinePersona(answers);
        const personaDescription = generatePersonaDescription(persona);
        const { scores, maxScores } = calculateScores(answers, surveyData);
        const { diagnostics, recommendations, categories, prose: diagProse } = generateDiagnosticsAndRecommendations(scores, maxScores, answers, surveyData);
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const totalMaxScore = Object.values(maxScores).reduce((a, b) => a + b, 0);
        const maturityPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

        let summary = `Basado en sus respuestas, su organización se alinea con el perfil de **${persona}**: ${personaDescription}`;
        summary += `<br><br>Su nivel de madurez general es del **${maturityPercentage.toFixed(0)}%**. `;

        if (maturityPercentage < 50) {
            summary += 'Esto indica que existen áreas críticas que requieren atención inmediata para mitigar riesgos y mejorar la eficiencia.';
        } else if (maturityPercentage < 80) {
            summary += 'Esto indica un buen nivel de madurez, pero con oportunidades significativas de mejora para optimizar su infraestructura y fortalecer su postura de seguridad.';
        } else {
            summary += 'Esto indica un nivel de madurez avanzado. Las recomendaciones se centran en la optimización y la adopción de tecnologías de vanguardia.';
        }

        const prose = {
            summary: summary,
            diagnostics: diagProse.diagnostics,
            recommendations: diagProse.recommendations
        };
        const filterButtons = generateFilterButtons(categories);
        const radarData = generateRadarData(scores, maxScores);
        const summaryPoints = calculateMaturityLevel(scores, maxScores);

        return { persona, prose, diagnostics, recommendations, radarData, summaryPoints, filterButtons, maxScores };
    }

    function generateFilterButtons(categories) {
        let buttons = '<button class="filter-btn active" data-filter="all">Mostrar Todo</button>';
        categories.forEach(cat => {
            const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
            buttons += `<button class="filter-btn" data-filter="${cat}">${displayName}</button>`;
        });
        return buttons;
    }

    function generateEvaluationMethodologyHtml(maxScores) {
        let html = `
            <h3>Cómo se Calcula su Nivel de Madurez</h3>
            <p>La evaluación se basa en un sistema de puntuación por áreas clave de su infraestructura y seguridad TI. Cada pregunta contribuye a la puntuación de un área específica, y las respuestas de mayor madurez suman más puntos.</p>

            <h4>Puntuación por Área:</h4>
            <ul>`;
        Object.keys(maxScores).forEach(key => {
            html += `<li><strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> Máximo ${maxScores[key]} puntos.</li>`;
        });
        html += `</ul>

            <h4>Niveles de Madurez:</h4>
            <ul>
                <li><strong>Inicial (0-49%):</strong> Procesos de TI reactivos, falta de controles de seguridad básicos y alta exposición a riesgos.</li>
                <li><strong>En Desarrollo (50-79%):</strong> Procesos de TI definidos pero no integrados, controles de seguridad implementados pero no optimizados.</li>
                <li><strong>Optimizado (80-100%):</strong> Procesos de TI proactivos y optimizados, controles de seguridad avanzados y una fuerte postura de seguridad.</li>
            </ul>

            <h4>Umbrales de Diagnóstico y Recomendaciones:</h4>
            <p>Se generan diagnósticos y recomendaciones específicas cuando la puntuación de un área cae por debajo de ciertos umbrales, indicando oportunidades de mejora:</p>
            <ul>
                <li><strong>Advertencia (<span class="status-warning">Amarillo</span>):</strong> Indica áreas con configuración básica o reactiva, con riesgo potencial.</li>
                <li><strong>Peligro (<span class="status-danger">Rojo</span>):</strong> Señala brechas críticas o falta de implementación de prácticas esenciales, con alto riesgo.</li>
            </ul>
            <p>Si un área no muestra diagnósticos específicos, significa que su nivel de madurez en esa área es alto y cumple con las mejores prácticas.</p>
        `;
        return html;
    }
    
    function populateReport(report) {

        document.getElementById('report-cliente').textContent = answers.empresa || 'N/A';
        document.getElementById('report-fecha').textContent = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('report-persona').textContent = report.persona;
        document.getElementById('summary-prose').innerHTML = report.prose.summary;
        document.getElementById('diagnostics-prose').textContent = report.prose.diagnostics;
        document.getElementById('recommendations-prose').textContent = report.prose.recommendations;
        document.getElementById('executive-summary-points').innerHTML = report.summaryPoints;
        document.getElementById('filter-bar').innerHTML = report.filterButtons;

        // For now, we hide the license and savings sections
        const licenseContainer = document.getElementById('license-comparison-container');
        if(licenseContainer) licenseContainer.parentElement.style.display = 'block'; // Show this section
        const savingsContainer = document.getElementById('ahorro-body');
        if(savingsContainer) savingsContainer.parentElement.parentElement.parentElement.style.display = 'block'; // Show this section

        // Populate license and savings tables
        populateLicenseTable(answers);
        populateSavingsTable(report.recommendations);


        populateAnswers(document.getElementById('respuestas-body'), surveyData, answers);
        populateTable(document.getElementById('diagnostico-body'), report.diagnostics, ['area', 'obs', 'impact']);
        populateList(document.getElementById('recomendaciones-list'), report.recommendations);
        
        const nextStepsHtml = generateNextSteps(report);
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

        renderRadarChart(document.getElementById('radar-chart-container'), report.radarData);
        setupFilters();
        document.getElementById('evaluation-methodology-section').innerHTML = generateEvaluationMethodologyHtml(report.maxScores);
    }

    function populateLicenseTable(answers) {
        const tbody = document.getElementById('license-comparison-container');
        // This is a placeholder. In a real scenario, this data would be more dynamic.
        const licenseData = [
            { feature: 'Microsoft 365 E3', current: '✓', recommended: '✓' },
            { feature: 'Microsoft 365 E5', current: '✗', recommended: '✓' },
            { feature: 'Copilot para Microsoft 365', current: '✗', recommended: '✓' },
        ];

        let html = '<table class="report-table license-table"><thead><tr><th>Funcionalidad</th><th>Actual</th><th>Recomendado</th></tr></thead><tbody>';
        licenseData.forEach(item => {
            html += `<tr><td data-label="Funcionalidad">${item.feature}</td><td data-label="Actual" class="${item.current === '✓' ? 'check-mark' : 'cross-mark'}">${item.current}</td><td data-label="Recomendado" class="${item.recommended === '✓' ? 'check-mark' : 'cross-mark'}">${item.recommended}</td></tr>`;
        });
        html += '</tbody></table>';
        tbody.innerHTML = html;
    }

    function populateSavingsTable(recommendations) {
        const tbody = document.getElementById('ahorro-body');
        let html = '';
        recommendations.forEach(rec => {
            // This is a placeholder. In a real scenario, this data would be more dynamic.
            const savings = {
                'Modernizar la Gestión de Red': 'Reducción de interrupciones y mejora de la productividad.',
                'Implementar Segmentación de Red': 'Reducción del riesgo de brechas de seguridad y multas.',
                'Implementar Plan de Backup y DR': 'Reducción del tiempo de inactividad y pérdida de datos.',
                'Renovar Hardware de Servidores': 'Mejora del rendimiento y reducción de costes de mantenimiento.',
                'Optimizar Estrategia de Backups': 'Reducción del riesgo de pérdida de datos irrecuperable.',
                'Desarrollar y Probar DRP': 'Reducción del impacto financiero de un desastre.',
                'Actualizar a un Firewall de Nueva Generación (NGFW)': 'Reducción del riesgo de intrusiones y malware.',
                'Desplegar EDR y Gestión Centralizada': 'Reducción del riesgo de ataques de endpoints.',
                'Implementar MFA y PAM': 'Reducción del riesgo de compromiso de credenciales.',
                'Implementar 2FA en Sistemas Críticos': 'Reducción del riesgo de acceso no autorizado.',
                'Definir y Comunicar Políticas de Seguridad': 'Mejora del cumplimiento normativo y la postura de seguridad.',
                'Establecer Programa de Concienciación en Ciberseguridad': 'Reducción del riesgo de errores humanos.',
                'Implementar Proceso de Gestión de Parches': 'Reducción del riesgo de brechas de seguridad.',
                'Implementar un ERP Integrado': 'Mejora de la eficiencia operativa y la toma de decisiones.',
                'Implementar Sistema de Trazabilidad Avanzado': 'Mejora del cumplimiento normativo y la cadena de suministro.',
                'Aislar y Proteger Redes OT': 'Reducción del riesgo de interrupción de la producción.'
            };
            html += `<tr><td data-label="Concepto">${rec.title}</td><td data-label="Situación Actual">${rec.obs || 'N/A'}</td><td data-label="Acción Propuesta">${rec.desc}</td><td data-label="Valor / Ahorro">${savings[rec.title] || 'N/A'}</td></tr>`;
        });
        tbody.innerHTML = html;
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
    handleThemeToggle();
    const { scores, maxScores } = calculateScores(answers, surveyData);
    const report = generateMasterReport(answers, surveyData);
    report.maxScores = maxScores; // Add maxScores to the report object
    populateReport(report);

});
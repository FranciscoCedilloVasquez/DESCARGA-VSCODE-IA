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
                const userAnswer = answers[q.id] || '<em>No respondida</em>';
                let score = 0;
                let maxScore = 0;

                if (q.type === 'radio' && q.options) {
                    q.options.forEach(opt => {
                        if (typeof opt.score === 'number') {
                            maxScore = Math.max(maxScore, opt.score);
                            if (userAnswer === opt.text) {
                                score = opt.score;
                            }
                        }
                    });
                }

                row.innerHTML = `<td data-label="Pregunta">${q.text}</td><td data-label="Respuesta">${userAnswer}</td><td data-label="Valoración"><strong>${score} / ${maxScore}</strong></td>`;
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
        if (answers.ti_interno === 'Interno' && numEmployees > 50) return 'Empresa Mediana con TI';
        if (answers.ti_interno === 'Externo' && numEmployees > 50) return 'Empresa Mediana con TI';
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
        const actionPlan = generateActionPlan(recommendations);

        return { persona, prose, diagnostics, recommendations, radarData, summaryPoints, filterButtons, maxScores, actionPlan };
    }

    function generateFilterButtons(categories) {
        let buttons = '<button class="filter-btn active" data-filter="all">Mostrar Todo</button>';
        categories.forEach(cat => {
            const displayName = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
            buttons += `<button class="filter-btn" data-filter="${cat}">${displayName}</button>`;
        });
        return buttons;
    }

    function generateEvaluationMethodologyHtml(maxScores, scores) {
        let html = `
            <h3>Cómo se Calcula su Nivel de Madurez</h3>
            <p>La evaluación se basa en un sistema de puntuación por áreas clave de su infraestructura y seguridad TI. Cada pregunta contribuye a la puntuación de un área específica, y las respuestas de mayor madurez suman más puntos.</p>

            <h4>Puntuación por Área:</h4>
            <ul>`;
        Object.keys(maxScores).forEach(key => {
            const sectionScore = scores[key];
            const sectionMaxScore = maxScores[key];
            let status = '';
            if (sectionScore >= sectionMaxScore * 0.8) {
                status = '<span class="status-ok">Aprobado</span>';
            }
            html += `<li><strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${sectionScore} / ${sectionMaxScore} puntos. ${status}</li>`;
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
            <p>Si un área no muestra diagnósticos específicos, significa que su nivel de madurez en esa área es alto y cumple con las mejores prácticas. <span class="status-ok">Aprobado</span></p>
        `;
        return html;
    }

    function generateActionPlan(recommendations) {
        let html = '<ul class="recommendations filterable-content">';
        if (recommendations.length === 0) {
            html += '<li><em>No se han identificado acciones o recomendaciones específicas en esta evaluación.</em></li>';
        } else {
            recommendations.forEach(rec => {
                html += `<li data-category="${rec.category}"><strong>${rec.title}:</strong> ${rec.desc}</li>`;
            });
        }
        html += '</ul>';
        return html;
    }
    
    function populateReport(report) {

        document.getElementById('report-cliente').textContent = answers.empresa || 'N/A';
        document.getElementById('report-fecha').textContent = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('report-persona').textContent = report.persona;
        document.getElementById('summary-prose').innerHTML = report.prose.summary;
        document.getElementById('diagnostics-prose').textContent = report.prose.diagnostics;
        document.getElementById('recommendations-prose').innerHTML = report.actionPlan;
        document.getElementById('executive-summary-points').innerHTML = report.summaryPoints;
        document.getElementById('filter-bar').innerHTML = report.filterButtons;

        const licenseContainer = document.getElementById('license-comparison-container');
        if(licenseContainer) licenseContainer.parentElement.style.display = 'block';
        const savingsContainer = document.getElementById('ahorro-body');
        if(savingsContainer) savingsContainer.parentElement.parentElement.parentElement.style.display = 'block';

        populateLicenseTable(answers);
        populateSavingsTable(report.recommendations);


        populateAnswers(document.getElementById('respuestas-body'), surveyData, answers);
        populateTable(document.getElementById('diagnostico-body'), report.diagnostics, ['area', 'obs', 'impact']);
        
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
        document.getElementById('evaluation-methodology-section').innerHTML = generateEvaluationMethodologyHtml(report.maxScores, report.scores);
    }

    function populateLicenseTable(answers) {
        const tbody = document.getElementById('license-comparison-container');
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
        if (recommendations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4"><em>No se han identificado oportunidades de ahorro específicas en esta evaluación.</em></td></tr>';
            return;
        }

        recommendations.forEach(rec => {
            const savings = {
                'Evaluar la Adopción de un Modelo Híbrido o Cloud-Native': '<strong>Reducción de costes de capital (CapEx)</strong> al disminuir la inversión en hardware. <strong>Optimización de costes operativos (OpEx)</strong> mediante el pago por uso. <strong>Mejora de la agilidad</strong> para responder a las demandas del mercado.',
                'Implementar una Segmentación de Red Robusta (VLANs)': '<strong>Reducción del riesgo de brechas de seguridad</strong>, evitando multas y costes de remediación. <strong>Protección de la propiedad intelectual</strong> y los datos críticos del negocio.',
                'Acelerar la Adopción de la Virtualización': '<strong>Reducción de costes de hardware</strong> (consolidación de servidores). <strong>Ahorro en energía y refrigeración</strong>. <strong>Disminución del tiempo de inactividad</strong> no planificado.',
                'Establecer un Ciclo de Vida y Plan de Renovación de Hardware': '<strong>Reducción de costes de mantenimiento</strong> de hardware obsoleto. <strong>Mejora del rendimiento y la productividad</strong> de los empleados. <strong>Mitigación de riesgos</strong> de seguridad.',
                'Implementar una Estrategia de Backup Robusta (Regla 3-2-1)': '<strong>Garantiza la continuidad del negocio</strong> ante un desastre. <strong>Evita la pérdida de datos críticos</strong> y los costes asociados a su recuperación (si es posible).',
                'Desarrollar y Probar un Plan de Recuperación de Desastres (DRP)': '<strong>Minimiza el impacto financiero</strong> de un desastre. <strong>Reduce el tiempo de inactividad</strong> y acelera la recuperación. <strong>Cumplimiento de requisitos</strong> normativos y de clientes.',
                'Actualizar a un Firewall de Nueva Generación (NGFW)': '<strong>Prevención de ciberataques</strong> que pueden resultar en pérdidas financieras directas, robo de datos y daño a la reputación. <strong>Mejora de la visibilidad</strong> del tráfico de red para una mejor toma de decisiones.',
                'Desplegar una Solución de EDR (Endpoint Detection and Response)': '<strong>Detección y respuesta proactiva</strong> a amenazas avanzadas. <strong>Reducción del tiempo de permanencia de los atacantes</strong> en la red. <strong>Protección contra ransomware</strong> y otros ataques destructivos.',
                'Implementar Autenticación Multifactor (MFA) de Forma Universal': '<strong>Reducción drástica del riesgo</strong> de compromiso de credenciales, el vector de ataque más común. <strong>Protección del acceso</strong> a datos sensibles y sistemas críticos.',
                'Proteger el Acceso a Sistemas Críticos con MFA': '<strong>Salvaguarda de los activos más importantes</strong> de la empresa (datos financieros, propiedad intelectual). <strong>Cumplimiento de normativas</strong> que exigen controles de acceso estrictos.',
                'Definir y Comunicar un Conjunto de Políticas de Seguridad': '<strong>Creación de una cultura de seguridad</strong> en la organización. <strong>Reducción del riesgo de errores humanos</strong>. <strong>Demostración de la debida diligencia</strong> en seguridad a clientes y reguladores.',
                'Establecer un Programa de Concienciación y Capacitación en Ciberseguridad': '<strong>Fortalecimiento del eslabón más débil</strong> de la cadena de seguridad. <strong>Reducción de la probabilidad de éxito</strong> de los ataques de phishing y ingeniería social.',
                'Implementar un Proceso Formal de Gestión de Parches': '<strong>Cierre de las puertas de entrada</strong> más comunes para los atacantes. <strong>Reducción de la superficie de ataque</strong> de la organización. <strong>Evita multas</strong> por incumplimiento de normativas.',
                'Centralizar la Gestión con un Sistema ERP Integrado': '<strong>Optimización de procesos de negocio</strong> y reducción de costes operativos. <strong>Mejora de la toma de decisiones</strong> basada en datos precisos y en tiempo real. <strong>Aumento de la competitividad</strong>.',
                'Implementar un Sistema de Trazabilidad Integrado (WMS)': '<strong>Cumplimiento de normativas</strong> y estándares de la industria. <strong>Optimización de la gestión de inventario</strong> y reducción de pérdidas. <strong>Mejora de la satisfacción del cliente</strong>.',
                'Aislar y Proteger las Redes de Tecnología Operacional (OT)': '<strong>Protección de la infraestructura crítica</strong> de producción. <strong>Evita paradas de producción</strong> y pérdidas económicas masivas. <strong>Garantiza la seguridad</strong> de los empleados.'
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
    report.maxScores = maxScores;
    report.scores = scores;
    populateReport(report);

});
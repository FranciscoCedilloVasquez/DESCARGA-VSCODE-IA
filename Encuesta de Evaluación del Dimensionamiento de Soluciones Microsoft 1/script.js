document.getElementById('evalForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.employees = parseInt(data.employees, 10);

    const analysis = analyzeData(data);
    displayReport(data, analysis);
});

function analyzeData(data) {
    const diagnosis = [];
    const recommendations = [];
    let savings = {
        powerbi: 0,
        security: 0,
        other: 0,
        total: 0
    };

    // --- Logic Rules ---

    // 1. Power BI Standalone with E3
    if (data.m365Version === 'e3' && data.usePowerBI === 'standalone') {
        diagnosis.push({ area: 'Licencia principal', status: 'Microsoft 365 E3', observation: 'Power BI se contrata por separado, generando un sobrecosto.' });
        recommendations.push('Migrar a Microsoft 365 E5 para incluir Power BI Pro, seguridad avanzada y cumplimiento, consolidando licencias.');
        savings.powerbi = 10 * 12 * data.employees; // Estimated $10/user/month
    } else {
        diagnosis.push({ area: 'Licencia principal', status: `Microsoft 365 ${data.m365Version.toUpperCase()}`, observation: 'Licenciamiento base.' });
    }

    // 2. Copilot Usage
    if (data.useCopilot === 'no' || data.useCopilot === 'unknown') {
        diagnosis.push({ area: 'Uso de Copilot', status: 'No', observation: 'Alta oportunidad de mejora en productividad y automatización de tareas.' });
        recommendations.push('Activar Microsoft 365 Copilot para mejorar la eficiencia en tareas repetitivas y reducir tiempo en redacción, análisis y planificación.');
    } else {
        diagnosis.push({ area: 'Uso de Copilot', status: 'Sí/Planeado', observation: 'Se aprovecha o planea aprovechar la IA generativa.' });
    }

    // 3. Security Features
    if (data.useSecurityFeatures === 'no' || data.useSecurityFeatures === 'unknown') {
        diagnosis.push({ area: 'Seguridad avanzada', status: 'No utilizada', observation: 'Funciones como Defender, Purview y DLP podrían no estar activas.' });
        recommendations.push('Revisar y activar herramientas de seguridad incluidas en su plan (Defender for Endpoint, DLP, Acceso Condicional) para fortalecer la ciberseguridad sin costo adicional.');
        savings.security = 5 * 12 * data.employees; // Estimated value of external tools
    }

    // 4. Low-Code Automation
    if (data.usePowerApps === 'no' || data.usePowerAutomate === 'no') {
        diagnosis.push({ area: 'Desarrollo low-code', status: 'No aprovechado', observation: 'Power Apps y Power Automate están disponibles pero no se utilizan plenamente.' });
        recommendations.push('Implementar Power Automate y Power Apps para automatizar procesos internos y desarrollar soluciones sin necesidad de programadores expertos.');
    }

    // 5. Project Management
    if (data.useProject === 'no' && (data.usePlanner === 'no' || data.usePlanner === 'partially')) {
        diagnosis.push({ area: 'Gestión de proyectos', status: 'Básica', observation: 'No se usa Project for the Web, y Planner/To Do es parcial.' });
        recommendations.push('Evaluar Microsoft Project for the Web para una gestión de proyectos más robusta y centralizada.');
    }

    savings.total = savings.powerbi + savings.security + savings.other;

    return { diagnosis, recommendations, savings };
}

function displayReport(data, analysis) {
    const reportContainer = document.getElementById('reportContainer');
    reportContainer.innerHTML = ''; // Clear previous report

    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    // --- Report Header ---
    let reportHTML = `
        <h2>📄 Informe de Evaluación de Soluciones Microsoft</h2>
        <p><strong>Cliente:</strong> ${data.companyName}<br>
        <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        
        <div class="report-section">
            <h3>🧠 Resumen Ejecutivo</h3>
            <p>Tras analizar sus respuestas, hemos identificado oportunidades clave para optimizar su inversión en soluciones Microsoft, mejorar la seguridad y aumentar la productividad. A continuación, se detallan los hallazgos y recomendaciones.</p>
        </div>
    `;

    // --- Diagnosis Table ---
    reportHTML += `
        <div class="report-section">
            <h3>🔍 Diagnóstico Actual</h3>
            <table class="diagnosis-table">
                <tr><th>Área evaluada</th><th>Estado actual</th><th>Observaciones</th></tr>
                ${analysis.diagnosis.map(d => `<tr><td>${d.area}</td><td>${d.status}</td><td>${d.observation}</td></tr>`).join('')}
            </table>
        </div>
    `;

    // --- Recommendations ---
    reportHTML += `
        <div class="report-section">
            <h3>💡 Recomendaciones</h3>
            <ul class="recommendation-list">
                ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>
    `;

    // --- Savings Estimation ---
    if (analysis.savings.total > 0) {
        reportHTML += `
            <div class="report-section">
                <h3>📊 Estimación de Ahorro y Valor Anual</h3>
                <p>Esta es una estimación del valor o ahorro que podría obtener al consolidar licencias y utilizar herramientas ya incluidas en planes superiores.</p>
                <div class="savings-summary">
                    <p>Ahorro por consolidación de Power BI: <strong>${currencyFormatter.format(analysis.savings.powerbi)}</strong></p>
                    <p>Valor estimado de herramientas de seguridad: <strong>${currencyFormatter.format(analysis.savings.security)}</strong></p>
                    <p><strong>Total Anual Estimado:</strong> <strong>${currencyFormatter.format(analysis.savings.total)}</strong></p>
                </div>
                <canvas id="savingsChart"></canvas>
            </div>
        `;
    }

    // --- Next Steps ---
    reportHTML += `
        <div class="report-section">
            <h3>📎 Próximos Pasos</h3>
            <ul>
                <li>Agendar una sesión de asesoría personalizada para discutir estos hallazgos.</li>
                <li>Recibir una propuesta técnica y comercial ajustada a sus necesidades.</li>
                <li>Diseñar un plan de activación para las herramientas recomendadas.</li>
            </ul>
        </div>
    `;

    reportContainer.innerHTML = reportHTML;
    reportContainer.classList.remove('hidden');

    // --- Render Chart ---
    if (analysis.savings.total > 0) {
        const ctx = document.getElementById('savingsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Gasto Actual Estimado', 'Gasto Optimizado'],
                datasets: [{
                    label: 'Estimación Anual',
                    data: [analysis.savings.total, 0], // Simplified for visualization
                    backgroundColor: [
                        'rgba(216, 59, 1, 0.2)',
                        'rgba(16, 124, 16, 0.2)'
                    ],
                    borderColor: [
                        'rgba(216, 59, 1, 1)',
                        'rgba(16, 124, 16, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return currencyFormatter.format(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Comparativa de Gasto Anual (Estimado)'
                    }
                }
            }
        });
    }
    
    // Scroll to report
    reportContainer.scrollIntoView({ behavior: 'smooth' });
}
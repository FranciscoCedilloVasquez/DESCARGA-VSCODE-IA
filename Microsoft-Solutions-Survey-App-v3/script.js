document.addEventListener('DOMContentLoaded', () => {
    const surveyContainer = document.getElementById('survey-container');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress');

    const surveyData = [
        {
            id: 'info-general', title: 'Información General',
            questions: [
                { id: 'empresa', text: 'Nombre de la empresa:', type: 'text', required: true },
                { id: 'sector', text: 'Sector de actividad:', type: 'text' },
                { id: 'empleados', text: 'Número de empleados:', type: 'text' },
                { id: 'personal_campo', text: '¿Tiene personal de campo o primera línea?', type: 'radio', options: ['Sí', 'No'] },
                { id: 'ti_interno', text: '¿Cuenta con un departamento de TI interno?', type: 'radio', options: ['Sí', 'No'] },
            ]
        },
        {
            id: 'productividad', title: 'Productividad y Colaboración',
            questions: [
                { id: 'm365_edicion', text: '¿Qué edición de Microsoft 365 utiliza actualmente?', type: 'radio', options: ['Business Basic', 'Business Standard', 'Business Premium', 'Microsoft 365 E3', 'Microsoft 365 E5', 'Office 365', 'No estoy seguro'], required: true },
                { id: 'm365_copilot', text: '¿Utiliza Microsoft 365 Copilot?', type: 'radio', options: ['Sí', 'No', 'Planea adquirirlo', 'No conoce la herramienta'] },
                { id: 'teams', text: '¿Utiliza Microsoft Teams como herramienta principal de comunicación?', type: 'radio', options: ['Sí', 'No', 'Parcialmente'] },
                { id: 'sharepoint', text: '¿Utiliza SharePoint para gestión documental o intranet?', type: 'radio', options: ['Sí', 'No', 'No conoce la herramienta'] },
                { id: 'exchange', text: '¿Utiliza Exchange Online para correo empresarial?', type: 'radio', options: ['Sí', 'No', 'No sabe'] },
            ]
        },
        {
            id: 'analitica', title: 'Analítica y Datos',
            questions: [
                { id: 'power_bi', text: '¿Utiliza Power BI?', type: 'radio', options: ['Sí, incluido en Microsoft 365 E5', 'Sí, como producto independiente', 'No'] },
                { id: 'azure_synapse', text: '¿Utiliza Azure Synapse, SQL Server o Data Lake para análisis avanzado?', type: 'radio', options: ['Sí', 'No', 'No conoce estas herramientas'] },
                { id: 'bi_strategy', text: '¿Tiene una estrategia de BI definida en su empresa?', type: 'radio', options: ['Sí', 'No', 'En proceso'] },
            ]
        },
        {
            id: 'ia', title: 'Inteligencia Artificial',
            questions: [
                { id: 'copilot_tools', text: '¿Utiliza Microsoft Copilot en alguna herramienta (Word, Excel, Teams, Power Platform)?', type: 'radio', options: ['Sí', 'No', 'Planea hacerlo'] },
                { id: 'azure_ai', text: '¿Utiliza Azure AI, Cognitive Services o modelos personalizados?', type: 'radio', options: ['Sí', 'No', 'No conoce estas soluciones'] },
                { id: 'ia_cases', text: '¿Tiene casos de uso definidos para IA en su empresa?', type: 'radio', options: ['Sí', 'No', 'En exploración'] },
            ]
        },
        {
            id: 'desarrollo', title: 'Desarrollo y Automatización',
            questions: [
                { id: 'power_apps', text: '¿Utiliza Power Apps para crear aplicaciones internas?', type: 'radio', options: ['Sí', 'No', 'Planea hacerlo'] },
                { id: 'power_automate', text: '¿Utiliza Power Automate para automatizar procesos?', type: 'radio', options: ['Sí', 'No', 'Parcialmente'] },
                { id: 'low_code_staff', text: '¿Tiene personal capacitado en desarrollo low-code?', type: 'radio', options: ['Sí', 'No', 'En formación'] },
            ]
        },
        {
            id: 'proyectos', title: 'Gestión de Proyectos',
            questions: [
                { id: 'project', text: '¿Utiliza Microsoft Project o Project for the Web?', type: 'radio', options: ['Sí', 'No', 'Planea hacerlo'] },
                { id: 'planner', text: '¿Utiliza Planner o To Do para gestión de tareas?', type: 'radio', options: ['Sí', 'No', 'Parcialmente'] },
            ]
        },
        {
            id: 'seguridad', title: 'Seguridad y Cumplimiento',
            questions: [
                { id: 'seguridad_funciones', text: '¿Utiliza funciones como DLP, acceso condicional, Defender for Endpoint, etc.?', type: 'radio', options: ['Sí', 'No', 'No sabe si están activas'] },
                { id: 'purview', text: '¿Tiene activado Microsoft Purview para cumplimiento normativo?', type: 'radio', options: ['Sí', 'No', 'No conoce la herramienta'] },
                { id: 'seguridad_satisfecho', text: '¿Considera que su suscripción actual cubre sus necesidades de seguridad?', type: 'radio', options: ['Sí', 'No', 'No lo ha evaluado'], required: true },
            ]
        },
        {
            id: 'evaluacion-general', title: 'Evaluación General',
            questions: [
                { id: 'aprovechamiento', text: '¿Cree que su empresa está aprovechando al máximo las herramientas de Microsoft contratadas?', type: 'radio', options: ['Sí', 'No', 'No está seguro'] },
                { id: 'propuesta', text: '¿Le gustaría recibir una propuesta personalizada para optimizar su inversión tecnológica?', type: 'radio', options: ['Sí', 'No'] },
            ]
        }
    ];

    let currentSection = 0;
    const userAnswers = {};

    // Pass survey structure to be used in report page
    localStorage.setItem('surveyData', JSON.stringify(surveyData));

    function renderSection(sectionIndex) {
        const sectionData = surveyData[sectionIndex];
        let html = `<div class="survey-section active" id="section-${sectionData.id}"><h2>${sectionData.title}</h2>`;

        sectionData.questions.forEach(q => {
            html += `<div class="question" id="question-${q.id}">`;
            html += `<label for="${q.id}">${q.text} ${q.required ? '<span class="required">*</span>' : ''}</label>`;
            if (q.type === 'text') {
                html += `<input type="text" id="${q.id}" name="${q.id}" value="${userAnswers[q.id] || ''}" ${q.required ? 'required' : ''}>`;
            } else if (q.type === 'radio') {
                html += `<div class="radio-group">`;
                q.options.forEach(opt => {
                    const checked = userAnswers[q.id] === opt ? 'checked' : '';
                    html += `<label><input type="radio" name="${q.id}" value="${opt}" ${q.required ? 'required' : ''} ${checked}> ${opt}</label>`;
                });
                html += `</div>`;
            }
            html += `</div>`;
        });

        html += `</div>`;
        surveyContainer.innerHTML = html;

        document.querySelectorAll(`#section-${sectionData.id} input`).forEach(input => {
            input.addEventListener('change', (e) => {
                userAnswers[e.target.name] = e.target.value;
            });
        });
    }

    function updateNavigation() {
        prevBtn.classList.toggle('hidden', currentSection === 0);
        nextBtn.classList.toggle('hidden', currentSection === surveyData.length - 1);
        submitBtn.classList.toggle('hidden', currentSection !== surveyData.length - 1);
        progressBar.style.width = `${((currentSection + 1) / surveyData.length) * 100}%`;
    }

    function validateSection() {
        const sectionData = surveyData[currentSection];
        for (const q of sectionData.questions) {
            if (q.required && !userAnswers[q.id]) {
                alert(`Por favor, responda la pregunta: "${q.text}"`);
                return false;
            }
        }
        return true;
    }

    nextBtn.addEventListener('click', () => {
        if (!validateSection()) return;
        if (currentSection < surveyData.length - 1) {
            currentSection++;
            renderSection(currentSection);
            updateNavigation();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentSection > 0) {
            currentSection--;
            renderSection(currentSection);
            updateNavigation();
        }
    });

    submitBtn.addEventListener('click', () => {
        if (!validateSection()) return;
        localStorage.setItem('surveyAnswers', JSON.stringify(userAnswers));
        window.location.href = 'report.html';
    });

    // Initial render
    renderSection(currentSection);
    updateNavigation();
});
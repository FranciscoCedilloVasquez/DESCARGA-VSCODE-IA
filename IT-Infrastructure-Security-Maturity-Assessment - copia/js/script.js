document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const themeToggle = document.getElementById('theme-toggle');
    const surveyContainer = document.getElementById('survey-container');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress');

    // --- State Management ---
    let currentSection = 0;
    const userAnswers = JSON.parse(localStorage.getItem('surveyAnswers')) || {};
    // surveyData is loaded from data.js, which should be included before this script
    if (typeof surveyData === 'undefined') {
        console.error('Error: surveyData is not loaded. Make sure data.js is included.');
        return;
    }

    // --- Functions ---

    /**
     * Renders the current survey section and its questions.
     * @param {number} sectionIndex - The index of the survey section to render.
     */
    function renderSection(sectionIndex) {
        const sectionData = surveyData[sectionIndex];
        let html = `<div class="survey-section active" id="section-${sectionData.id}"><h2>${sectionData.title}</h2>`;

        sectionData.questions.forEach(q => {
            html += `<div class="question" id="question-${q.id}">
                        <${q.type === 'radio' ? 'span' : 'label'}${q.type === 'radio' ? '' : ` for="${q.id}"`}>${q.text} ${q.required ? '<span class="required" title="Campo obligatorio">*</span>' : ''}</${q.type === 'radio' ? 'span' : 'label'}>`;

            if (q.type === 'text') {
                html += `<input type="text" id="${q.id}" name="${q.id}" value="${userAnswers[q.id] || ''}" ${q.required ? 'required' : ''}>`;
            } else if (q.type === 'radio') {
                html += `<div class="radio-group">`;
                q.options.forEach(opt => {
                    const checked = userAnswers[q.id] === opt.text ? 'checked' : '';
                    html += `<label for="${q.id}-${opt.text.replace(/\s+/g, '_').toLowerCase()}"><input type="radio" id="${q.id}-${opt.text.replace(/\s+/g, '_').toLowerCase()}" name="${q.id}" value="${opt.text}" ${q.required ? 'required' : ''} ${checked}> ${opt.text}</label>`;
                });
                html += `</div>`;
            }
            html += `</div>`;
        });

        html += `</div>`;
        surveyContainer.innerHTML = html;

        // Add event listeners to the newly created input elements
        document.querySelectorAll(`#section-${sectionData.id} input`).forEach(input => {
            input.addEventListener('change', (e) => {
                userAnswers[e.target.name] = e.target.value;
            });
        });
    }

    /**
     * Updates the visibility of navigation buttons and the progress bar.
     */
    function updateNavigation() {
        prevBtn.classList.toggle('hidden', currentSection === 0);
        nextBtn.classList.toggle('hidden', currentSection === surveyData.length - 1);
        submitBtn.classList.toggle('hidden', currentSection !== surveyData.length - 1);
        progressBar.style.width = `${((currentSection + 1) / surveyData.length) * 100}%`;
    }

    /**
     * Validates that all required questions in the current section are answered.
     * @returns {boolean} - True if the section is valid, false otherwise.
     */
    function validateSection() {
        const currentQuestions = surveyData[currentSection].questions;
        for (const q of currentQuestions) {
            if (q.required && !userAnswers[q.id]) {
                alert(`Por favor, responda la pregunta obligatoria: "${q.text}"`);
                // Highlight the unanswered question
                const questionElement = document.getElementById(`question-${q.id}`);
                questionElement.style.border = '2px solid var(--danger-color)';
                questionElement.style.padding = '1rem';
                questionElement.style.borderRadius = '5px';
                return false;
            }
        }
        return true;
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

    // --- Event Listeners ---

    nextBtn.addEventListener('click', () => {
        if (!validateSection()) return;
        if (currentSection < surveyData.length - 1) {
            currentSection++;
            renderSection(currentSection);
            updateNavigation();
            window.scrollTo(0, 0); // Scroll to top on section change
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentSection > 0) {
            currentSection--;
            renderSection(currentSection);
            updateNavigation();
            window.scrollTo(0, 0); // Scroll to top on section change
        }
    });

    submitBtn.addEventListener('click', () => {
        if (!validateSection()) return;
        localStorage.setItem('surveyAnswers', JSON.stringify(userAnswers));
        localStorage.setItem('surveyData', JSON.stringify(surveyData)); // Also save the questions data
        window.location.href = 'report.html';
    });

    // --- Initial Load ---
    handleThemeToggle();
    renderSection(currentSection);
    updateNavigation();
});
// Función para centrar la siguiente pregunta en pantalla
function scrollQuestionIntoView(questionElement) {
    if (!questionElement) return;
    const rect = questionElement.getBoundingClientRect();
    const absoluteElementTop = rect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2) + (rect.height / 2);
    window.scrollTo({ top: middle, behavior: 'smooth' });
}

// Observa los cambios en las preguntas y centra la activa
function enableAutoCenterQuestions() {
    // Suponiendo que las preguntas tienen una clase 'pregunta' y la activa 'pregunta-activa'
    const observer = new MutationObserver(() => {
        const active = document.querySelector('.pregunta-activa');
        if (active) scrollQuestionIntoView(active);
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    // Centrar la pregunta activa al cargar
    window.addEventListener('DOMContentLoaded', () => {
        const active = document.querySelector('.pregunta-activa');
        if (active) scrollQuestionIntoView(active);
    });
}

// Llama a esta función al cargar la página para activar el centrado automático
enableAutoCenterQuestions();

// Variable global para el estado del glosario
window.glossaryActive = false;
// Al cambiar de página, guarda el estado actual del glosario y marca si debe reactivarse
window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('glossaryActive', window.glossaryActive ? 'true' : 'false');
    if (window.glossaryActive) {
        sessionStorage.setItem('forceGlossaryReactivate', 'true');
    } else {
        sessionStorage.removeItem('forceGlossaryReactivate');
    }
});
// Al cargar la página, si estaba activo antes, reactívalo automáticamente
window.addEventListener('DOMContentLoaded', function() {
    // Sincroniza la variable global con sessionStorage
    window.glossaryActive = (sessionStorage.getItem('glossaryActive') === 'true');
    // Asegura que el botón esté creado en cualquier página (incluyendo reportes)
    if (!document.getElementById('toggle-glossary-button')) toggleGlossaryButton();
    // Refuerzo: si el botón no aparece tras 500ms, forzar su creación (por si el script se carga tarde)
    setTimeout(function() {
        if (!document.getElementById('toggle-glossary-button')) toggleGlossaryButton();
    }, 500);
    if (sessionStorage.getItem('forceGlossaryReactivate') === 'true') {
        setTimeout(function() {
            var btn = document.getElementById('toggle-glossary-button');
            if (btn) btn.click();
            sessionStorage.removeItem('forceGlossaryReactivate');
        }, 300);
    }
});

// Desactivar glosario al hacer clic en un botón "Siguiente" (sin centrar la siguiente pregunta)
document.addEventListener('click', function(event) {
    // Detectar botón por id, clase o texto
    const target = event.target;
    const isSiguienteBtn = (
        (target.tagName === 'BUTTON' && (
            target.id.toLowerCase().includes('siguiente') ||
            target.textContent.trim().toLowerCase() === 'siguiente'
        )) ||
        (target.classList && Array.from(target.classList).some(cls => cls.toLowerCase().includes('siguiente')))
    );
    if (isSiguienteBtn) {
        // Desactivar glosario si está activo
        if (window.glossaryActive) {
            deactivateGlossary();
        }
    }
});

// Centrar automáticamente la pregunta activa al responder (input, radio, checkbox, etc)
// Usar MutationObserver para detectar el cambio de pregunta activa tras responder
const preguntaAutoScrollObserver = new MutationObserver(() => {
    const activa = document.querySelector('.pregunta-activa');
    if (activa) scrollQuestionIntoView(activa);
});
preguntaAutoScrollObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    // Función auxiliar para desactivar el glosario desde fuera
    function deactivateGlossary() {
        window.glossaryActive = false;
        sessionStorage.setItem('glossaryActive', 'false');
        let toggleButton = document.getElementById('toggle-glossary-button');
    if (toggleButton) toggleButton.innerHTML = `<span style="font-size: 1.6em; line-height: 1; display: block; text-align: center;">📎</span>`;
        let glossaryWidget = document.getElementById('glossary-widget');
        if (glossaryWidget) {
            glossaryWidget.style.display = 'none';
        }
        removeHighlights();
    }

    // Escuchar teclas para desactivar automáticamente el glosario
    document.addEventListener('keydown', function(event) {
        // Puedes cambiar 'ArrowRight' o 'Enter' según el botón "Siguiente" de tu app
        if (window.glossaryActive && (event.key === 'ArrowRight' || event.key === 'Enter')) {
            deactivateGlossary();
        }
    });
// Function 1: Placeholder for extracting and defining terms
// In a real scenario, this would involve more complex logic (e.g., NLP)
// For now, it will return a predefined list and simulate saving to CSV.
async function extractAndDefineTerms(pageContent) {
    console.log("Simulando extracción y definición de términos...");
    // In a real application, you would parse pageContent, identify terms,
    // and generate child-friendly definitions.
    const terms = [
        { term: "CPU", definition: "El cerebro de la computadora, como el director de una orquesta." },
        { term: "RAM", definition: "La memoria a corto plazo de la computadora, como tu mesa de trabajo." },
        { term: "Disco Duro", definition: "Donde la computadora guarda todo, como tu mochila para guardar tus cosas." },
        { term: "Internet", definition: "Una red gigante que conecta computadoras, como una telaraña mundial." },
        { term: "Nube", definition: "Guardar cosas en internet, como guardar tus juguetes en un armario mágico en el cielo." }
    ];

    // Simulate saving to CSV (client-side JS cannot directly write files)
    // In a real web app, this might involve sending data to a server or
    // prompting the user to download the CSV.
    console.log("Términos generados (simulados):", terms);
    // For this demonstration, we assume terms.csv is pre-generated or handled server-side.
    return terms;
}

// Function 2: Load terms from CSV (all terms, robust parsing)
async function loadTermsFromCSV(csvFilePath) {
    console.log(`[loadTermsFromCSV] Cargando términos desde: ${csvFilePath}`);
    try {
        const response = await fetch(csvFilePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        // Soporta saltos de línea y comas en definiciones
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '' && !/^\s*Term\s*,/i.test(line));
        const termsArray = [];
        for (let i = 0; i < lines.length; i++) {
            // Solo divide en la primera coma (término, definición)
            const firstComma = lines[i].indexOf(',');
            if (firstComma > 0) {
                const term = lines[i].slice(0, firstComma).trim().replace(/^"|"$/g, '');
                const definition = lines[i].slice(firstComma + 1).trim().replace(/^"|"$/g, '');
                if (term && definition) termsArray.push({ term, definition });
            }
        }
        console.log("[loadTermsFromCSV] Términos cargados desde CSV:", termsArray);
        return termsArray;
    } catch (error) {
        console.error("[loadTermsFromCSV] Error al cargar el CSV:", error);
        return [];
    }
}

// Function 3: Generate and display the glossary widget
function generateGlossaryWidget(termsArray) {
    console.log("[generateGlossaryWidget] Generando widget de glosario...");
    let glossaryWidget = document.getElementById('glossary-widget');
    if (!glossaryWidget) {
        glossaryWidget = document.createElement('div');
        glossaryWidget.id = 'glossary-widget';
        // Ribbon style at the top
        glossaryWidget.style.position = 'fixed';
        glossaryWidget.style.top = '0';
    glossaryWidget.style.left = '50%';
    glossaryWidget.style.right = '';
    glossaryWidget.style.width = 'auto';
    glossaryWidget.style.transform = 'translateX(-50%)';
    glossaryWidget.style.maxWidth = 'calc(100vw - 140px)'; // margen para botones y responsivo
        glossaryWidget.style.height = '48px';
        glossaryWidget.style.backgroundColor = 'rgba(255, 255, 153, 0.98)'; // light yellow, readable
        glossaryWidget.style.borderBottom = '2px solid #e6e600';
        glossaryWidget.style.borderRadius = '0 0 12px 12px';
        glossaryWidget.style.padding = '0 24px';
        glossaryWidget.style.display = 'flex';
        glossaryWidget.style.alignItems = 'center';
        glossaryWidget.style.justifyContent = 'center';
        glossaryWidget.style.textAlign = 'center';
        glossaryWidget.style.fontWeight = 'bold';
        glossaryWidget.style.fontSize = '1.1em';
        glossaryWidget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
        glossaryWidget.style.zIndex = '1000';
        glossaryWidget.style.userSelect = 'none';
        document.body.appendChild(glossaryWidget);
    }

    // Create and append the tooltip element (reused)
    let glossaryTooltip = document.getElementById('glossary-tooltip');
    if (!glossaryTooltip) {
        glossaryTooltip = document.createElement('div');
        glossaryTooltip.id = 'glossary-tooltip';
        glossaryTooltip.style.position = 'absolute';
        glossaryTooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        glossaryTooltip.style.color = 'white';
        glossaryTooltip.style.padding = '5px 10px';
        glossaryTooltip.style.borderRadius = '4px';
        glossaryTooltip.style.zIndex = '10000'; // Higher than widget
        document.body.appendChild(glossaryTooltip);
    }

    // Indicate that the glossary is active (ribbon style, no <p>)
    glossaryWidget.innerHTML = 'Glosario Activo <span style="font-weight:normal;font-size:0.97em;margin-left:12px;">(pasa el ratón sobre los términos resaltados)</span>';

    // Call highlighting function
    highlightTermsInElement(document.body, termsArray, glossaryTooltip); // Will highlight terms in the entire body for now

    console.log("[generateGlossaryWidget] Widget de glosario generado.");
}

// New function for highlighting terms and attaching tooltip events
function highlightTermsInElement(element, termsArray, tooltipElement) {
    console.log("[highlightTermsInElement] Iniciando resaltado de términos.");
    console.log("[highlightTermsInElement] Términos a buscar:", termsArray.map(item => item.term)); 


    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const termsMap = new Map(termsArray.map(item => [item.term.toLowerCase(), item.definition]));
    const nodesToProcess = [];
    while ((node = walk.nextNode())) {
        nodesToProcess.push(node);
    }

    nodesToProcess.forEach(node => {
        const parent = node.parentNode;
        if (!parent || parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE' || (parent.classList && parent.classList.contains('glossary-highlight'))) {
            return;
        }

        let originalText = node.nodeValue;
        // No resaltar si el texto contiene saltos de línea, tabulaciones, o si está dentro de un bloque pre/code
        if (originalText.match(/[\n\r\t]/) || parent.nodeName === 'PRE' || parent.nodeName === 'CODE') {
            return;
        }

        // No resaltar si el nodo es muy corto (menos de 3 caracteres)
        if (originalText.trim().length < 3) {
            return;
        }

        let changed = false;
        let resultHTML = originalText;

        termsArray.forEach(item => {
            // Resaltar solo si el término está completo y no fragmentado
            const escapedTerm = escapeRegExp(item.term);
            let regexPattern;
            if (/^[\wáéíóúüñÁÉÍÓÚÜÑ]+$/.test(item.term)) {
                regexPattern = `\\b${escapedTerm}\\b`;
            } else {
                regexPattern = item.term.split(' ').map(part => `\\b${escapeRegExp(part)}\\b`).join('\\s+');
            }
            let regex;
            try {
                regex = new RegExp(`(${regexPattern})`, 'gi');
            } catch (e) {
                console.error(`[DEBUG REGEX] ERROR creating RegExp for term "${item.term}" (Pattern: "${regexPattern}"):`, e);
                return;
            }
            // Solo resaltar si el término está completo en el nodo
            if (regex.test(resultHTML)) {
                changed = true;
                resultHTML = resultHTML.replace(regex, match => `<span class="glossary-highlight" data-term="${item.term}" style="display:inline;">${match}</span>`);
            }
        });

        if (changed) {
            const temp = document.createElement('span');
            temp.innerHTML = resultHTML;
            while (temp.firstChild) {
                parent.insertBefore(temp.firstChild, node);
            }
            parent.removeChild(node);
        }
    });

    // Asignar eventos a todos los spans resaltados después del reemplazo
    // Permitir que el color de resaltado sea configurable y accesible globalmente
    let highlightColor = '#fff9c4'; // Amarillo atenuado
    document.querySelectorAll('.glossary-highlight').forEach(span => {
        span.style.backgroundColor = highlightColor;
        span.style.cursor = 'help';
        span.style.display = 'inline';
        span.onmouseover = (event) => {
            const term = event.target.dataset.term;
            const definition = termsMap.get(term.toLowerCase());
            if (definition) {
                tooltipElement.textContent = definition;
                tooltipElement.style.display = 'block';
                tooltipElement.style.left = `${event.pageX + 10}px`;
                tooltipElement.style.top = `${event.pageY + 10}px`;
            }
        };
        span.onmouseout = () => {
            tooltipElement.style.display = 'none';
        };
        span.onmousemove = (event) => {
            tooltipElement.style.left = `${event.pageX + 10}px`;
            tooltipElement.style.top = `${event.pageY + 10}px`;
        };
    });

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\\]/g, '\$&');
    }

    console.log("[highlightTermsInElement] Adjuntando eventos a los spans resaltados.");
    document.querySelectorAll('.glossary-highlight').forEach(span => {
        span.style.backgroundColor = highlightColor;
        span.style.cursor = 'help';
        console.log(`[highlightTermsInElement] Span resaltado encontrado: "${span.textContent}"`);

        span.onmouseover = (event) => {
            console.log(`[highlightTermsInElement] Mouseover en: "${event.target.textContent}"`);
            const term = event.target.dataset.term;
            const definition = termsMap.get(term.toLowerCase());
            if (definition) {
                tooltipElement.textContent = definition;
                tooltipElement.style.display = 'block';
                tooltipElement.style.left = `${event.pageX + 10}px`;
                tooltipElement.style.top = `${event.pageY + 10}px`;
                console.log(`[highlightTermsInElement] Mostrando tooltip para "${term}": "${definition.substring(0, Math.min(definition.length, 30))}"`);
            } else {
                console.warn(`[highlightTermsInElement] No se encontró definición para el término: "${term}"`);
            }
        };

        span.onmouseout = () => {
            tooltipElement.style.display = 'none';
            console.log("[highlightTermsInElement] Ocultando tooltip.");
        };

        span.onmousemove = (event) => {
            tooltipElement.style.left = `${event.pageX + 10}px`;
            tooltipElement.style.top = `${event.pageY + 10}px`;
        };
    });
    // Exponer el color de resaltado para que el botón lo use dinámicamente
    window.getGlossaryHighlightColor = () => highlightColor;
    console.log("[highlightTermsInElement] Resaltado de términos completado.");
}

// Function to remove highlights (for deactivation)
function removeHighlights() {
    document.querySelectorAll('.glossary-highlight').forEach(span => {
        const parent = span.parentNode;
        if (parent) {
            // Revert to original text node
            parent.replaceChild(document.createTextNode(span.textContent), span);
        }
    });
    // Hide tooltip if active
    const tooltip = document.getElementById('glossary-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Function 4: Toggle glossary button
function toggleGlossaryButton() {
    console.log("[toggleGlossaryButton] Creando botón de alternar glosario...");
    let toggleButton = document.getElementById('toggle-glossary-button');
    if (!toggleButton) {
        toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-glossary-button';
        // Emoji de clip para máxima compatibilidad
        toggleButton.innerHTML = `<span style="font-size: 1.6em; line-height: 1; display: block; text-align: center;">📎</span>`;
        toggleButton.title = 'Activar/Desactivar Glosario';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '120px'; // Estrictamente debajo del botón de modo oscuro
    toggleButton.style.right = '20px'; // Alineado con el margen derecho del botón de modo oscuro
        toggleButton.style.width = '40px';
        toggleButton.style.height = '40px';
        toggleButton.style.background = 'none';
        toggleButton.style.color = '#111';
        toggleButton.style.border = '1.5px solid #ccc';
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.zIndex = '1003';
        toggleButton.style.transition = 'background 0.2s, color 0.2s, border 0.2s';
        document.body.appendChild(toggleButton);
    }

    // Color de resaltado del glosario (debe coincidir con el de highlightTermsInElement)
    let glossaryHighlightColor = 'yellow';
    // Permite que el color se actualice dinámicamente si cambia en highlightTermsInElement
    if (window.getGlossaryHighlightColor) {
        glossaryHighlightColor = window.getGlossaryHighlightColor();
    }

    function updateButtonStyle() {
        if (window.getGlossaryHighlightColor) {
            glossaryHighlightColor = window.getGlossaryHighlightColor();
        }
        if (window.glossaryActive) {
            toggleButton.style.background = glossaryHighlightColor;
            toggleButton.style.color = '#111';
            toggleButton.style.border = '1.5px solid #888';
        } else {
            toggleButton.style.background = 'none';
            toggleButton.style.color = '#111';
            toggleButton.style.border = '1.5px solid #ccc';
        }
    }
    updateButtonStyle();

    toggleButton.onclick = async () => {
        try {
            window.glossaryActive = !window.glossaryActive;
            sessionStorage.setItem('glossaryActive', window.glossaryActive ? 'true' : 'false');
            let glossaryWidget = document.getElementById('glossary-widget');

            if (window.glossaryActive) {
                updateButtonStyle();
                console.log("[toggleGlossaryButton] Glosario activado.");
                const terms = await loadTermsFromCSV('terms.csv');
                console.log("[toggleGlossaryButton] Términos obtenidos de CSV. Cantidad:", terms.length);
                if (terms.length > 0) {
                    generateGlossaryWidget(terms);
                    glossaryWidget = document.getElementById('glossary-widget');
                    if (glossaryWidget) {
                        glossaryWidget.style.display = 'block';
                    }
                } else {
                    console.warn("[toggleGlossaryButton] No se cargaron términos para el glosario.");
                    alert("No se encontraron términos para el glosario.");
                    window.glossaryActive = false;
                    sessionStorage.setItem('glossaryActive', 'false');
                    updateButtonStyle();
                }
            } else {
                updateButtonStyle();
                console.log("[toggleGlossaryButton] Glosario desactivado.");
                if (glossaryWidget) {
                    glossaryWidget.style.display = 'none';
                }
                removeHighlights();
            }
        } catch (e) {
            console.error("[toggleGlossaryButton] Error inesperado en el manejador de clic:", e);
            alert("Ocurrió un error al activar/desactivar el glosario. Por favor, revisa la consola del navegador.");
        }
    };
    console.log("[toggleGlossaryButton] Botón de alternar glosario creado.");
}

// Ya no es necesario llamar aquí, se llama desde el otro DOMContentLoaded

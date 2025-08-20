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

// Function 2: Load terms from CSV
async function loadTermsFromCSV(csvFilePath) {
    console.log(`[loadTermsFromCSV] Cargando términos desde: ${csvFilePath}`);
    try {
        const response = await fetch(csvFilePath);
        console.log(`[loadTermsFromCSV] Fetch response status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        console.log(`[loadTermsFromCSV] CSV text loaded. Length: ${csvText.length}`);
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        console.log(`[loadTermsFromCSV] Number of lines after filtering: ${lines.length}`);
        const termsArray = [];
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
                const term = parts[0].trim();
                const definition = parts.slice(1).join(',').trim(); // Handle commas in definition
                termsArray.push({ term, definition });
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
        glossaryWidget.style.position = 'fixed';
        glossaryWidget.style.bottom = '20px'; // Reverted
        glossaryWidget.style.right = '20px'; // Reverted
        glossaryWidget.style.width = '300px'; // Reverted
        glossaryWidget.style.maxHeight = '400px'; // Reverted
        glossaryWidget.style.overflowY = 'auto'; // Reverted
        glossaryWidget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Reverted
        glossaryWidget.style.border = '1px solid #ccc'; // Reverted
        glossaryWidget.style.borderRadius = '8px'; // Reverted
        glossaryWidget.style.padding = '15px'; // Reverted
        glossaryWidget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Reverted
        glossaryWidget.style.zIndex = '1000'; // Reverted
        glossaryWidget.style.display = 'none'; // Hidden by default
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
        glossaryTooltip.style.display = 'none'; // Hidden by default
        document.body.appendChild(glossaryTooltip);
    }

    // No longer populating the widget with full glossary list
    glossaryWidget.innerHTML = ''; // Clear previous content if any

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
        if (parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE' || parent.classList.contains('glossary-highlight')) {
            return;
        }

        let originalText = node.nodeValue;
        console.log(`[highlightTermsInElement] Procesando nodo de texto: "${originalText.substring(0, Math.min(originalText.length, 100))}" (Length: ${originalText.length})`); 

        let changed = false;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        termsArray.forEach(item => {
            const escapedTerm = escapeRegExp(item.term);

            // --- DEBUGGING REGEX CREATION ---
            console.log(`[DEBUG REGEX] Original term: "${item.term}"`);
            console.log(`[DEBUG REGEX] Escaped term: "${escapedTerm}"`);
            let regex;
            try {
                regex = new RegExp(`${escapedTerm}`, 'gi');
                console.log(`[DEBUG REGEX] Created Regex: ${regex}`);
            } catch (e) {
                console.error(`[DEBUG REGEX] ERROR creating RegExp for term "${item.term}":`, e);
                return; 
            }
            // --- END DEBUGGING REGEX CREATION ---

            regex.lastIndex = 0; 

            let match;
            while ((match = regex.exec(originalText)) !== null) { 
                console.log(`[highlightTermsInElement] ¡COINCIDENCIA ENCONTRADA! Término: "${item.term}", Texto: "${match[0]}"`); 
                changed = true;
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(originalText.substring(lastIndex, match.index)));
                }
                const span = document.createElement('span');
                span.classList.add('glossary-highlight');
                span.dataset.term = item.term;
                span.textContent = match[0]; 
                fragment.appendChild(span);
                lastIndex = regex.lastIndex; 
            }
        });

        if (lastIndex < originalText.length) {
            fragment.appendChild(document.createTextNode(originalText.substring(lastIndex)));
        }

        if (changed) {
            console.log(`[highlightTermsInElement] Texto modificado. Original: "${originalText.substring(0, Math.min(originalText.length, 50))}", Nuevo: (fragment)`);
            parent.replaceChild(fragment, node);
        }
    });

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\\]/g, '\$&');
    }

    console.log("[highlightTermsInElement] Adjuntando eventos a los spans resaltados.");
    document.querySelectorAll('.glossary-highlight').forEach(span => {
        span.style.backgroundColor = 'yellow';
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
        toggleButton.textContent = 'Activar Glosario';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '20px';
        toggleButton.style.left = '20px';
        toggleButton.style.padding = '10px 15px';
        toggleButton.style.backgroundColor = '#007bff';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '5px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.zIndex = '1001';
        document.body.appendChild(toggleButton);
    }

    let glossaryActive = false;

    toggleButton.onclick = async () => {
        try {
            glossaryActive = !glossaryActive;
            let glossaryWidget = document.getElementById('glossary-widget'); // Get it initially (might be null)

            if (glossaryActive) {
                toggleButton.textContent = 'Desactivar Glosario';
                console.log("[toggleGlossaryButton] Glosario activado.");
                const terms = await loadTermsFromCSV('terms.csv');
                console.log("[toggleGlossaryButton] Términos obtenidos de CSV. Cantidad:", terms.length);
                if (terms.length > 0) {
                    generateGlossaryWidget(terms);
                    // Re-get the widget after generateGlossaryWidget might have created it
                    glossaryWidget = document.getElementById('glossary-widget');
                    if (glossaryWidget) {
                        glossaryWidget.style.display = 'block'; // Still show the main widget (though it's empty now)
                    }
                } else {
                    console.warn("[toggleGlossaryButton] No se cargaron términos para el glosario.");
                    alert("No se encontraron términos para el glosario.");
                    glossaryActive = false; // Reset if no terms
                    toggleButton.textContent = 'Activar Glosario';
                }
            }
            else {
                toggleButton.textContent = 'Activar Glosario';
                console.log("[toggleGlossaryButton] Glosario desactivado.");
                if (glossaryWidget) {
                    glossaryWidget.style.display = 'none';
                }
                removeHighlights(); // Call the new function to remove highlights
            }
        } catch (e) {
            console.error("[toggleGlossaryButton] Error inesperado en el manejador de clic:", e);
            alert("Ocurrió un error al activar/desactivar el glosario. Por favor, revisa la consola del navegador.");
        }
    };
    console.log("[toggleGlossaryButton] Botón de alternar glosario creado.");
}

// Call this function when the DOM is fully loaded to set up the button
document.addEventListener('DOMContentLoaded', toggleGlossaryButton);

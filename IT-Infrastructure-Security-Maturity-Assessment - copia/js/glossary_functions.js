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
        glossaryWidget.style.top = '0'; // Changed from bottom
        glossaryWidget.style.left = '0'; // Changed from right
        glossaryWidget.style.width = '300px';
        glossaryWidget.style.maxHeight = '400px';
        glossaryWidget.style.overflowY = 'auto';
        glossaryWidget.style.backgroundColor = 'red'; // Changed for visibility
        glossaryWidget.style.border = '5px solid blue'; // Added border
        glossaryWidget.style.borderRadius = '8px';
        glossaryWidget.style.padding = '15px';
        glossaryWidget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        glossaryWidget.style.zIndex = '9999'; // Increased z-index
        glossaryWidget.style.display = 'none'; // Hidden by default
        document.body.appendChild(glossaryWidget);
    }

    glossaryWidget.innerHTML = '<h3>Glosario para Niños</h3>';
    termsArray.forEach(item => {
        const termDiv = document.createElement('div');
        termDiv.classList.add('glossary-item');
        termDiv.innerHTML = `<strong>${item.term}:</strong> ${item.definition}`;
        glossaryWidget.appendChild(termDiv);
    });

    console.log("[generateGlossaryWidget] Widget de glosario generado.");
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
                    generateGlossaryWidget(terms); // This creates the widget if it doesn't exist
                    // IMPORTANT: Re-get the element after generateGlossaryWidget might have created it
                    glossaryWidget = document.getElementById('glossary-widget');
                    if (glossaryWidget) {
                        glossaryWidget.style.display = 'block';
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
                if (glossaryWidget) { // This will now correctly reference the widget if it exists
                    glossaryWidget.style.display = 'none';
                }
                document.querySelectorAll('.glossary-highlight').forEach(span => {
                    const parent = span.parentNode;
                    if (parent) {
                        parent.replaceChild(document.createTextNode(span.textContent), span);
                    }
                });
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

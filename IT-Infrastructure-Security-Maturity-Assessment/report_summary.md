
## Informe Final

A continuación se muestra un ejemplo del informe final que se puede generar con la aplicación mejorada. Para generar este informe, se han utilizado las siguientes respuestas de ejemplo:

```json
{
    "empresa": "Empresa de Ejemplo",
    "sector": "Tecnología",
    "empleados": "150",
    "ti_interno": "Sí",
    "tipo_red": "Híbrida",
    "gestion_red": "Equipo interno",
    "monitorizacion_red": "Sí, de forma reactiva (cuando hay problemas)",
    "segmentacion_red": "Existen redes separadas para invitados y para la empresa, pero los equipos de producción y administrativos comparten la misma red.",
    "virtualizacion": "Sí, parcialmente",
    "backup_recovery": "Sí, pero no se prueba",
    "almacenamiento_nube": "Sí",
    "hardware_servidores": "Se utiliza una combinación de servidores físicos nuevos y antiguos, sin un plan de actualización claro.",
    "copias_seguridad": "Las copias de seguridad se realizan automáticamente todos los días en la nube, pero nunca se ha intentado restaurar los datos desde ellas.",
    "plan_drp": "Hay un documento escrito, pero está guardado en el servidor principal y nunca se ha probado.",
    "firewall": "No",
    "vpn": "VPN tradicional",
    "proteccion_ddos": "No",
    "antivirus": "Antivirus tradicional",
    "gestion_dispositivos": "Parcialmente",
    "cifrado_discos": "Algunos",
    "directorio_activo": "Active Directory On-Premise",
    "mfa": "Sí, para usuarios críticos",
    "gestion_privilegios": "No",
    "acceso_criticos": "Solo se requiere un nombre de usuario y una contraseña.",
    "politicas_seguridad": "Están desactualizadas",
    "auditorias_seguridad": "Ocasionalmente",
    "rgpd_cumplimiento": "No está seguro",
    "capacitacion_ciberseguridad": "Solo el personal del departamento de TI recibe capacitación en seguridad.",
    "gestion_parches": "Las actualizaciones se aplican de forma automática en todos los equipos tan pronto como están disponibles.",
    "gestion_procesos": "Programas de software independientes para cada departamento (uno para contabilidad, otro para inventario, etc.) sin integración entre ellos.",
    "trazabilidad_productos": "Se utilizan códigos de barras y un sistema de software básico para registrar la entrada y salida de lotes.",
    "gestion_scada": "Están conectados a la misma red que los computadores de la oficina para facilitar el acceso y monitoreo."
}
```

### `report.html` (generado)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe de Evaluación de Madurez de Infraestructura y Seguridad TI</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="theme-toggle-container">
        <button id="theme-toggle" title="Toggle theme">
            <svg class="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.06l1.59-1.59a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06l-1.59-1.59a.75.75 0 010-1.06zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM5.106 17.834a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.106 5.106a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06L6.106 6.166a.75.75 0 010-1.06z" /></svg>
            <svg class="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.463-.949.75.75 0 01.819.162l.981.981a.75.75 0 01-.256 1.286A12.001 12.001 0 0112 21a12.001 12.001 0 01-9.056-4.344.75.75 0 01-.256-1.286l.981-.981a.75.75 0 01.949-.463z" clip-rule="evenodd" /></svg>
        </button>
    </div>
    <div class="container report-page">
        <header class="report-header">
            <h1>Informe de Evaluación de Madurez de Infraestructura y Seguridad TI</h1>
            <p><strong>Cliente:</strong> <span id="report-cliente">Empresa de Ejemplo</span></p>
            <p><strong>Fecha:</strong> <span id="report-fecha">19 de agosto de 2025</span></p>
            <p><strong>Perfil de Cliente Detectado:</strong> <span id="report-persona">Empresa Mediana con TI</span></p>
        </header>

        <main>
            <div class="report-section">
                <h2>🧠 Resumen Ejecutivo y Nivel de Madurez</h2>
                <p id="summary-prose">Basado en sus respuestas, su organización se alinea con el perfil de <strong>Empresa Mediana con TI</strong>: Empresas en crecimiento con equipos de TI internos que necesitan herramientas avanzadas para gestionar una infraestructura en expansión y protegerse contra ciberamenazas sofisticadas.<br><br>Su nivel de madurez general es del <strong>41%</strong>. Esto indica que existen áreas críticas que requieren atención inmediata para mitigar riesgos y mejorar la eficiencia.</p>
                <div class="graphics-grid">
                    <div class="radar-chart-container" id="radar-chart-container"><svg class="radar-chart" width="400" height="400" viewBox="0 0 400 400"><circle cx="200" cy="200" r="64" class="radar-grid"></circle><circle cx="200" cy="200" r="128" class="radar-grid"></circle><circle cx="200" cy="200" r="192" class="radar-grid"></circle><circle cx="200" cy="200" r="256" class="radar-grid"></circle><circle cx="200" cy="200" r="320" class="radar-grid"></circle><g class="radar-labels"><text x="200" y="20" text-anchor="middle" alignment-baseline="middle">Infraestructura Red</text><text x="355.8" y="100" text-anchor="middle" alignment-baseline="middle">Servidores Almacenamiento</text><text x="355.8" y="300" text-anchor="middle" alignment-baseline="middle">Seguridad Perimetral</text><text x="200" y="380" text-anchor="middle" alignment-baseline="middle">Seguridad Endpoint</text><text x="44.2" y="300" text-anchor="middle" alignment-baseline="middle">Gestion Identidad</text><text x="44.2" y="100" text-anchor="middle" alignment-baseline="middle">Cumplimiento Politicas</text><text x="200" y="20" text-anchor="middle" alignment-baseline="middle">Sistemas Empresariales</text><text x="355.8" y="100" text-anchor="middle" alignment-baseline="middle">Seguridad Operacional Ot</text></g><polygon points="200,80 288.3,155.8 288.3,244.2 200,320 111.7,244.2 111.7,155.8 200,80 288.3,155.8" class="radar-shape desired-shape"></polygon><polygon points="200,144 255.8,188.3 233.1,244.2 200,224 133.1,244.2 144.2,188.3 200,144 255.8,188.3" class="radar-shape current-shape"></polygon></svg></div>
                    <div id="executive-summary-points"><ul><li>Nivel de madurez general: <strong>41%</strong></li><li>Área más débil: <strong>Seguridad Perimetral</strong></li><li>Área más fuerte: <strong>Infraestructura Red</strong></li></ul></div>
                </div>
            </div>

            <div class="report-section">
                <h2>💡 Cuadro Resumen de Licenciamiento</h2>
                <p>A continuación se muestra una comparación directa entre su licenciamiento actual y el recomendado, destacando las funcionalidades clave que ganaría con la optimización.</p>
                <div id="license-comparison-container"><table class="report-table license-table"><thead><tr><th>Funcionalidad</th><th>Actual</th><th>Recomendado</th></tr></thead><tbody><tr><td data-label="Funcionalidad">Microsoft 365 E3</td><td data-label="Actual" class="check-mark">✓</td><td data-label="Recomendado" class="check-mark">✓</td></tr><tr><td data-label="Funcionalidad">Microsoft 365 E5</td><td data-label="Actual" class="cross-mark">✗</td><td data-label="Recomendado" class="check-mark">✓</td></tr><tr><td data-label="Funcionalidad">Copilot para Microsoft 365</td><td data-label="Actual" class="cross-mark">✗</td><td data-label="Recomendado" class="check-mark">✓</td></tr></tbody></table></div>
            </div>

            <div class="report-section">
                <h2>🔍 Filtros del Informe</h2>
                <div class="filter-bar" id="filter-bar"><button class="filter-btn active" data-filter="all">Mostrar Todo</button><button class="filter-btn" data-filter="infraestructura_red">Infraestructura Red</button><button class="filter-btn" data-filter="servidores_almacenamiento">Servidores Almacenamiento</button><button class="filter-btn" data-filter="seguridad_perimetral">Seguridad Perimetral</button><button class="filter-btn" data-filter="seguridad_endpoint">Seguridad Endpoint</button><button class="filter-btn" data-filter="gestion_identidad">Gestion Identidad</button><button class="filter-btn" data-filter="cumplimiento_politicas">Cumplimiento Politicas</button><button class="filter-btn" data-filter="sistemas_empresariales">Sistemas Empresariales</button><button class="filter-btn" data-filter="seguridad_operacional_ot">Seguridad Operacional Ot</button></div>
            </div>

            <div class="report-section">
                <h2 class="filterable-title">Diagnóstico Detallado</h2>
                <p id="diagnostics-prose">El análisis de sus respuestas indica las siguientes observaciones clave y áreas donde se requiere atención para mejorar la madurez de su infraestructura y seguridad TI.</p>
                <table class="report-table filterable-content">
                    <thead><tr><th>Área de Enfoque</th><th>Observación Específica</th><th>Impacto de Negocio</th></tr></thead>
                    <tbody id="diagnostico-body"></tbody>
                </table>
            </div>

            <div class="report-section recommendations">
                <h2 class="filterable-title">Plan de Acción y Recomendaciones</h2>
                 <p id="recommendations-prose"></p>
                <ul id="recomendaciones-list" class="filterable-content"></ul>
            </div>

            <div class="report-section">
                <h2 class="filterable-title">Estimación de Ahorro y Valor Generado</h2>
                <table class="report-table filterable-content">
                    <thead><tr><th>Concepto</th><th>Situación Actual</th><th>Acción Propuesta</th><th>Valor / Ahorro</th></tr></thead>
                    <tbody id="ahorro-body"></tbody>
                </table>
            </div>

            <div class="report-section">
                <h2>📋 Resumen de sus Respuestas</h2>
                <table class="report-table answers-summary-table">
                    <tbody id="respuestas-body"></tbody>
                </table>
            </div>

            <div class="report-section">
                <h2>📊 Metodología de Evaluación y Criterios de Madurez</h2>
                <div id="evaluation-methodology-section"></div>
            </div>

            <div class="report-section final-cta">
                <!-- Next steps content will be generated here by report.js -->
            </div>
        </main>

        <footer>
            <p>Creado por: Digital FraYes</p>
            <p>Implementación: Francisco Cedillo</p>
        </footer>

    </div>
    <script src="js/report.js"></script>
</body>
</html>
```

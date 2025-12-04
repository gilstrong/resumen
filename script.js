const jsonInput = document.getElementById('jsonFile');
const xmlInput = document.getElementById('xmlFile');
const resultadoDiv = document.getElementById('resultado');
const reiniciarBtn = document.getElementById('reiniciarBtn');
const ajaxJSONBtn = document.getElementById('ajaxJSONBtn');
const ajaxXMLBtn = document.getElementById('ajaxXMLBtn');
const filtroInput = document.getElementById('filtroInput');
const spinner = document.getElementById('spinner');

let datosGlobales = []; // Para filtrar dinámicamente

// Función para mostrar tabla
function mostrarTabla(titulo, dataArray) {
    datosGlobales = dataArray; // Guardar datos globalmente para filtrar
    let html = `<strong>${titulo}</strong>`;
    if (!Array.isArray(dataArray)) dataArray = [dataArray];
    if (dataArray.length === 0) { resultadoDiv.innerHTML = html + '<p>No hay datos.</p>'; return; }

    html += '<table><thead><tr>';
    for (let key in dataArray[0]) html += `<th>${key}</th>`;
    html += '</tr></thead><tbody>';
    dataArray.forEach(item => {
        html += '<tr>';
        for (let key in item) html += `<td>${item[key]}</td>`;
        html += '</tr>';
    });
    html += '</tbody></table>';
    resultadoDiv.innerHTML = html;
}

// Filtrado dinámico
filtroInput.addEventListener('input', function() {
    const filtro = this.value.toLowerCase();
    const filtrados = datosGlobales.filter(d => 
        Object.values(d).some(val => val.toLowerCase().includes(filtro))
    );
    mostrarTabla('Filtrado', filtrados);
});

// Función para leer JSON desde archivo
jsonInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            mostrarTabla('JSON Subido', Array.isArray(data) ? data : [data]);
        } catch(err) { resultadoDiv.textContent = 'Error JSON: ' + err; }
    };
    reader.readAsText(file);
});

// Función para leer XML desde archivo
xmlInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(e.target.result, "text/xml");
            const personas = Array.from(xml.getElementsByTagName('persona')).map(p => ({
                nombre: p.getElementsByTagName('nombre')[0]?.textContent || '',
                edad: p.getElementsByTagName('edad')[0]?.textContent || '',
                correo: p.getElementsByTagName('correo')[0]?.textContent || ''
            }));
            mostrarTabla('XML Subido', personas);
        } catch(err) { resultadoDiv.textContent = 'Error XML: ' + err; }
    };
    reader.readAsText(file);
});

// AJAX JSON
ajaxJSONBtn.addEventListener('click', function() {
    spinner.classList.remove('hidden');
    fetch('usuario.json')
        .then(res => res.json())
        .then(data => {
            mostrarTabla('JSON vía AJAX', Array.isArray(data) ? data : [data]);
            spinner.classList.add('hidden');
        })
        .catch(err => {
            resultadoDiv.textContent = 'Error AJAX: ' + err;
            spinner.classList.add('hidden');
        });
});

// AJAX XML
ajaxXMLBtn.addEventListener('click', function() {
    spinner.classList.remove('hidden');
    fetch('usuarios.xml')
        .then(res => res.text())
        .then(str => (new DOMParser()).parseFromString(str, "text/xml"))
        .then(xml => {
            const personas = Array.from(xml.getElementsByTagName('persona')).map(p => ({
                nombre: p.getElementsByTagName('nombre')[0]?.textContent || '',
                edad: p.getElementsByTagName('edad')[0]?.textContent || '',
                correo: p.getElementsByTagName('correo')[0]?.textContent || ''
            }));
            mostrarTabla('XML vía AJAX', personas);
            spinner.classList.add('hidden');
        })
        .catch(err => {
            resultadoDiv.textContent = 'Error AJAX: ' + err;
            spinner.classList.add('hidden');
        });
});

// Botón Reiniciar
reiniciarBtn.addEventListener('click', function() {
    jsonInput.value = '';
    xmlInput.value = '';
    filtroInput.value = '';
    datosGlobales = [];
    resultadoDiv.textContent = 'Aquí aparecerán los datos cargados.';
});

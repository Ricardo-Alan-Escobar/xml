const satCatalog = {
  "15101514": "Combustibles - Gasolina Regular",
  "15101515": "Combustibles - Gasolina Premium",
  "15101505": "Combustibles - Diésel",
  "15101513": "Combustibles - Diésel (Uso fuera de carretera)",
  "26101504": "Motores - Motor Diésel",
  "43212100": "Tecnología - Computadoras",
  "44103103": "Tecnología - Toner",
  "43222609": "Tecnología - Impresoras",
  "43191501": "Tecnología - Teléfonos",
  "72101500": "Servicios - Energía eléctrica",
  "72101600": "Servicios - Agua",
  "30101500": "Construcción - Materiales",
  "72141000": "Construcción - Maquinaria pesada",
  "46171610": "Tecnología - Cámaras de Seguridad (CCTV)",
  "45121516": "Tecnología - Cámaras Fotográficas",
  "46171621": "Tecnología - DVR/NVR (Grabadores CCTV)",
  "52161505": "Tecnología - Televisores",
  "43211902": "Tecnología - Monitores",
  "43222612": "Redes - Switches",
  "43222609": "Redes - Routers",
  "43222610": "Redes - Access Points WiFi",
  "26121636": "Redes - Cable UTP",
  "26121608": "Electricidad - Cableado Eléctrico",
  "43223307": "Redes - Patch Cords",
  "26121622": "Redes - Conectores RJ45",
  "43211501": "Tecnología - Servidores",
  "43201803": "Tecnología - Discos Duros",
  "43201802": "Tecnología - SSD",
  "43202005": "Tecnología - Memorias RAM",
  "43211708": "Tecnología - Teclados",
  "43211707": "Tecnología - Mouse",
  "43211612": "Tecnología - Bocinas",
  "43211602": "Tecnología - Proyectores",
  "46171619": "Seguridad - Biométricos",
  "46171501": "Seguridad - Alarmas",
  "46171600": "Seguridad - Equipo Videovigilancia",
  "43231512": "Software - Antivirus",
  "43232406": "Software - Ofimática",
  "43232902": "Software - Sistemas Operativos",
};

const xmlFileContents = [];
const results = [];

const selectBox = document.getElementById("selectBox");
const dropdown = document.getElementById("selectDropdown");
const searchInput = document.getElementById("selectSearch");
const optionsContainer = document.getElementById("selectOptions");

let selectedCategory = "";

function buildCategoryList() {
  const categories = ["Todas", ...new Set(Object.values(satCatalog))].sort();
  renderOptions(categories);
}

function renderOptions(list) {
  optionsContainer.innerHTML = "";
  
  list.forEach(cat => {
    const div = document.createElement("div");
    div.className = "option-item";
    div.textContent = cat;

    div.onclick = () => {
      selectedCategory = cat === "Todas" ? "" : cat;
      selectBox.textContent = cat;
      dropdown.style.display = "none";
      renderTable();
    };

    optionsContainer.appendChild(div); 
  });
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const categories = ["Todas", ...new Set(Object.values(satCatalog))].sort();

  const filtered = categories.filter(c =>
    c.toLowerCase().includes(term)
  );

  renderOptions(filtered);
});

selectBox.addEventListener("click", () => {
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

buildCategoryList();


document.getElementById("xmlFiles").addEventListener("change", async (event) => {
  xmlFileContents.length = 0;
  const files = [...event.target.files];


  const dropText = document.getElementById("dropAreaText");
  if (files.length > 0) {
    dropText.textContent = `📂 ${files.length} archivos seleccionados`;
  } else {
    dropText.textContent = "📂 Haz clic aquí o arrastra tus XML";
  }

  const progressDiv = document.createElement("div");
  progressDiv.id = "loadProgress";
  progressDiv.style.cssText = "padding-top: 50px; border-radius: 4px; color: red; font-weight: bold;";
  progressDiv.innerHTML = `<div>Cargando archivos: <span id="progressText">0/${files.length}</span></div>`;
  document.getElementById("processBtn").parentNode.insertBefore(progressDiv, document.getElementById("processBtn"));

  const batchSize = 10;
  let loaded = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (file) => {
        const text = await file.text();
        xmlFileContents.push(text);
        loaded++;
        document.getElementById("progressText").textContent = `${loaded}/${files.length}`;
      })
    );
  }

  
  setTimeout(() => {
    document.getElementById("loadProgress")?.remove();
  }, 1000);
});



document.getElementById("processBtn").addEventListener("click", () => {
  results.length = 0;

 
 const processDiv = document.createElement("div");
processDiv.id = "processProgress";
processDiv.style.cssText = `
  margin: 15px 0;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 6px;
  font-family: Arial;
`;

processDiv.innerHTML = `
  <div style="margin-bottom: 6px; font-weight: bold;">
    Procesando XML...
  </div>

  <div id="progressBarContainer" style="
    width: 100%;
    height: 20px;
    background: #cfe3f7;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #90caf9;
  ">
    <div id="progressBar" style="
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #64b5f6, #1e88e5);
      transition: width 0.3s ease;
    "></div>
  </div>

  <div style="margin-top: 6px; text-align: center;">
    <span id="processText">0/${xmlFileContents.length}</span>
  </div>
`;

document.getElementById("processBtn").parentNode.insertBefore(
  processDiv,
  document.getElementById("processBtn").nextSibling
);

  document.getElementById("processBtn").parentNode.insertBefore(processDiv, document.getElementById("processBtn").nextSibling);

 
  const processInChunks = () => {
    const chunkSize = 20;
    let processed = 0;
    
    const processChunk = () => {
      const end = Math.min(processed + chunkSize, xmlFileContents.length);
      
      for (let i = processed; i < end; i++) {
        const text = xmlFileContents[i];
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");

        const comp = xml.getElementsByTagName("cfdi:Comprobante")[0];
        if (!comp) continue;

        const fecha = comp.getAttribute("Fecha") || "";
        const emisor = xml.getElementsByTagName("cfdi:Emisor")[0]?.getAttribute("Nombre") || "";
        const receptor = xml.getElementsByTagName("cfdi:Receptor")[0]?.getAttribute("Nombre") || "";

        const conceptos = xml.getElementsByTagName("cfdi:Concepto");

        for (let c of conceptos) {
          const desc = c.getAttribute("Descripcion") || "";
          const clave = c.getAttribute("ClaveProdServ") || "";
          const cant = c.getAttribute("Cantidad") || "0";
          const importe = c.getAttribute("Importe") || "0";

          const categoria = satCatalog[clave] || "SIN CLASIFICAR";

          results.push({ desc, clave, categoria, cant, importe, fecha, emisor, receptor });
        }
      }

      processed = end;
      document.getElementById("processText").textContent = `${processed}/${xmlFileContents.length}`;

const bar = document.getElementById("progressBar");
const pct = Math.round((processed / xmlFileContents.length) * 100);
bar.style.width = pct + "%";


      if (processed < xmlFileContents.length) {
        setTimeout(processChunk, 0);
      } else {
        renderTable();
        setTimeout(() => {
          document.getElementById("processProgress")?.remove();
        }, 1000);
      }
    };

    processChunk();
  };

  processInChunks();
});


function renderTable() {
  const tbody = document.getElementById("resultsBody");
  tbody.innerHTML = "";

  const filtered = results.filter(r => !selectedCategory || r.categoria === selectedCategory);
  
 
  const fragment = document.createDocumentFragment();
  
  filtered.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.desc}</td>
      <td>${r.clave}</td>
      <td>${r.categoria}</td>
      <td>${r.cant}</td>
      <td>${r.importe}</td>
      <td>${r.fecha}</td>
      <td>${r.emisor}</td>
      <td>${r.receptor}</td>
    `;
    fragment.appendChild(tr);
  });
  
  tbody.appendChild(fragment);
}


document.getElementById("exportExcelBtn").addEventListener("click", () => {
  if (results.length === 0) {
    alert("No hay datos para exportar. Por favor procesa algunos archivos XML primero.");
    return;
  }

  const dataToExport = results.filter(r => !selectedCategory || r.categoria === selectedCategory);

  if (dataToExport.length === 0) {
    alert("No hay datos en la categoría seleccionada para exportar.");
    return;
  }

  const excelData = dataToExport.map(r => ({
    "Producto": r.desc,
    "ClaveProdServ": r.clave,
    "Categoría SAT": r.categoria,
    "Cantidad": r.cant,
    "Importe": r.importe,
    "Fecha": r.fecha,
    "Emisor": r.emisor,
    "Receptor": r.receptor
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Conceptos CFDI");

  const colWidths = [
    { wch: 40 }, // Producto
    { wch: 15 }, // ClaveProdServ
    { wch: 35 }, // Categoría SAT
    { wch: 10 }, // Cantidad
    { wch: 12 }, // Importe
    { wch: 20 }, // Fecha
    { wch: 30 }, // Emisor
    { wch: 30 }  // Receptor
  ];
  ws['!cols'] = colWidths;

  const fecha = new Date().toISOString().split('T')[0];
  const nombreArchivo = selectedCategory 
    ? `CFDI_${selectedCategory.replace(/[^a-z0-9]/gi, '_')}_${fecha}.xlsx`
    : `CFDI_Todos_${fecha}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);
});
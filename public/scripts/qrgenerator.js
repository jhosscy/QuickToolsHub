import { X as qrcodegen} from '../qrcodegen.js';

// Función para generar el código QR en formato SVG
function toSvgString(qr, border, lightColor, darkColor) {
  let parts = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        parts.push(`M${x + border},${y + border}h1v1h-1z`);
      }
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qr.size + border * 2} ${qr.size + border * 2}">
<rect width="100%" height="100%" fill="${lightColor}"/>
<path d="${parts.join(" ")}" fill="${darkColor}"/>
</svg>`;
}

// Variables globales
let downloadData = ""; // Variable para almacenar los datos a descargar
let currentQR = null; // Variable para almacenar el QR actual
let hasQR = false;

// Función para generar el código QR
function generateQRCode() {
  const text = document.getElementById("qr-input").value;
  const container = document.getElementById("qr-container");
  const downloadBtn = document.getElementById("download-btn");
  container.innerHTML = ""; // Limpiar el QR anterior

  if (!text) {
    // Mostrar el placeholder si no hay texto
    container.innerHTML = `
      <div class="qr-placeholder">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3H10V10H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 3H21V10H14V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 14H10V21H3V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 14H21V21H14V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p>Aquí se generará tu código QR</p>
      </div>
    `;
    downloadBtn.classList.remove("visible");
    hasQR = false;
    return; // No generar si el input está vacío
  }

  // Obtener parámetros de usuario
  const scale = parseInt(document.getElementById("scale-input").value, 10);
  const border = parseInt(document.getElementById("border-input").value, 10);
  const isBitmap = document.getElementById("output-format-bitmap").checked;
  const lightColor = "#ffffff";
  const darkColor = "#000000";

  try {
    // Generar el QR con nivel de corrección MEDIUM
    const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM);
    currentQR = qr; // Guardar referencia al QR actual
    const size = qr.size;

    if (isBitmap) {
      // Crear un canvas para la salida bitmap
      const canvas = document.createElement("canvas");
      canvas.width = (size + border * 2) * scale;
      canvas.height = (size + border * 2) * scale;
      const ctx = canvas.getContext("2d");

      // Dibujar fondo blanco
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar módulos QR
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (qr.getModule(x, y)) {
            ctx.fillStyle = darkColor;
            ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
          }
        }
      }
      container.appendChild(canvas);
      // Convertir el canvas a URL de imagen PNG
      downloadData = canvas.toDataURL("image/png");
    } else {
      // Generar el SVG
      const svgString = toSvgString(qr, border, lightColor, darkColor);
      // Crear un elemento contenedor para el SVG
      const div = document.createElement("div");
      div.innerHTML = svgString;
      const svgElement = div.firstElementChild;
      // Ajustar el tamaño del SVG para la vista previa
      svgElement.style.width = ((size + border * 2) * scale) + "px";
      svgElement.style.height = ((size + border * 2) * scale) + "px";
      container.appendChild(svgElement);
      // Crear la URL para descargar el SVG
      downloadData = "data:image/svg+xml," + encodeURIComponent(svgString);
    }

    // Hacer visible el botón de descarga
    downloadBtn.classList.add("visible");
    hasQR = true;

    // Actualizar las estadísticas
    const statsDiv = document.getElementById("qr-stats");
    const statsHtml = `
      <div class="stat-item">
        <span>Versión:</span>
        <span>${qr.version}</span>
      </div>
      <div class="stat-item">
        <span>Tamaño (módulos):</span>
        <span>${qr.size}×${qr.size}</span>
      </div>
      <div class="stat-item">
        <span>Caracteres:</span>
        <span>${text.length}</span>
      </div>
    `;
    statsDiv.innerHTML = statsHtml;

    // Preparar el modal QR
    updateModalQR();
  } catch (e) {
    console.error(e);
    const statsDiv = document.getElementById("qr-stats");
    statsDiv.innerHTML = `<div style="color: var(--error-color)">Error: ${e.message}</div>`;
  }
}

// Función para actualizar el QR en el modal
function updateModalQR() {
  if (!currentQR || !hasQR) return;
  
  const modalContainer = document.getElementById("modal-qr-container");
  modalContainer.innerHTML = "";
  
  const scale = parseInt(document.getElementById("scale-input").value, 10);
  const border = parseInt(document.getElementById("border-input").value, 10);
  const isBitmap = document.getElementById("output-format-bitmap").checked;
  const lightColor = "#ffffff";
  const darkColor = "#000000";
  const zoomValue = document.getElementById("zoom-input").value;
  const zoomScale = parseInt(zoomValue) / 100;
  
  const size = currentQR.size;
  
  if (isBitmap) {
    const canvas = document.createElement("canvas");
    const baseSize = (size + border * 2) * scale;
    canvas.width = baseSize;
    canvas.height = baseSize;
    const ctx = canvas.getContext("2d");
    
    // Dibujar fondo blanco
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar módulos QR
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (currentQR.getModule(x, y)) {
          ctx.fillStyle = darkColor;
          ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
        }
      }
    }
    
    // Crear un contenedor para el canvas escalado
    const container = document.createElement("div");
    container.style.width = (baseSize * zoomScale) + "px";
    container.style.height = (baseSize * zoomScale) + "px";
    container.style.overflow = "auto";
    
    // Aplicar zoom
    canvas.style.width = (baseSize * zoomScale) + "px";
    canvas.style.height = (baseSize * zoomScale) + "px";
    
    container.appendChild(canvas);
    modalContainer.appendChild(container);
  } else {
    const svgString = toSvgString(currentQR, border, lightColor, darkColor);
    const div = document.createElement("div");
    div.innerHTML = svgString;
    const svgElement = div.firstElementChild;
    
    // Crear un contenedor para el SVG escalado
    const container = document.createElement("div");
    const baseSize = (size + border * 2) * scale;
    container.style.width = (baseSize * zoomScale) + "px";
    container.style.height = (baseSize * zoomScale) + "px";
    container.style.overflow = "auto";
    
    // Ajustar el tamaño del SVG con el zoom
    svgElement.style.width = (baseSize * zoomScale) + "px";
    svgElement.style.height = (baseSize * zoomScale) + "px";
    
    container.appendChild(svgElement);
    modalContainer.appendChild(container);
  }
}

// Funcionalidad para pegar del portapapeles
document.getElementById("paste-btn").addEventListener("click", async function() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("qr-input").value = text;
    generateQRCode(); // Generar QR con el texto pegado
  } catch (err) {
    console.error('Error al acceder al portapapeles: ', err);
    alert('No se pudo acceder al portapapeles. Es posible que necesites dar permisos o usar un navegador compatible.');
  }
});

// Inicializar evento para toggle del sidebar con el nuevo botón en qr-preview-container
document.getElementById("settings-toggle-alt").addEventListener("click", function() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("overlay").classList.add("active");
});

document.getElementById("close-sidebar").addEventListener("click", function() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("active");
});

document.getElementById("overlay").addEventListener("click", function() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("active");
});

// Eventos para abrir/cerrar el modal
document.getElementById("qr-container").addEventListener("click", function() {
  if (hasQR) {
    document.getElementById("zoom-modal").classList.add("active");
    updateModalQR();
  }
});

document.getElementById("modal-close").addEventListener("click", function() {
  document.getElementById("zoom-modal").classList.remove("active");
});

// Actualizar el QR cuando se modifique cualquier parámetro
document.getElementById("qr-input").addEventListener("input", generateQRCode);
document.getElementById("scale-input").addEventListener("input", generateQRCode);
document.getElementById("border-input").addEventListener("input", generateQRCode);
document.getElementById("output-format-bitmap").addEventListener("change", generateQRCode);
document.getElementById("output-format-vector").addEventListener("change", generateQRCode);

// Control de zoom en el modal
document.getElementById("zoom-input").addEventListener("input", function() {
  const zoomValue = document.getElementById("zoom-value");
  const zoomPercent = this.value;
  zoomValue.innerText = zoomPercent + "%";
  updateModalQR();
});

// Funcionalidad del botón de descarga
document.getElementById("download-btn").addEventListener("click", function() {
  if (!downloadData) return;
  const a = document.createElement("a");
  const isBitmap = document.getElementById("output-format-bitmap").checked;
  a.download = "qr-code." + (isBitmap ? "png" : "svg");
  a.href = downloadData;
  a.click();
});

// Generar el QR inicialmente
window.addEventListener('load', generateQRCode);

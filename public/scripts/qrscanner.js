import QrScanner from '../qr-scanner.min.js';

// Obtenemos referencias a los elementos del DOM
const fileInput = document.getElementById('file-input');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const urlContainer = document.getElementById('url-container');
const resultUrl = document.getElementById('result-url');
const urlText = document.getElementById('url-text');
const previewImage = document.getElementById('preview-image');
const previewPlaceholder = document.getElementById('preview-placeholder');
const loadingSpinner = document.getElementById('loading-spinner');
const statusMessage = document.getElementById('status-message');

// Función para actualizar el estado de la UI
function updateStatus(message, type = '') {
  statusMessage.textContent = message;
  
  // Resetear clases
  resultContainer.classList.remove('success', 'error');
  
  if (type) {
    resultContainer.classList.add(type);
  }
}

// Función para verificar si un texto es una URL válida
function isValidUrl(text) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

// Función para mostrar la imagen seleccionada
function displayImage(file) {
  previewPlaceholder.style.display = 'none';
  loadingSpinner.style.display = 'block';
  
  const imageUrl = URL.createObjectURL(file);
  
  previewImage.onload = () => {
    loadingSpinner.style.display = 'none';
    previewImage.classList.add('loaded');
  };
  
  previewImage.src = imageUrl;
}

// Función para resetear la interfaz
function resetUI() {
  previewImage.classList.remove('loaded');
  previewImage.src = '';
  previewPlaceholder.style.display = 'flex';
  resultContainer.classList.remove('success', 'error');
  resultText.textContent = 'Selecciona una imagen con un código QR para escanear';
  urlContainer.style.display = 'none';
  updateStatus('');
}

// Agregamos un listener para el evento 'change' en el input de archivo
fileInput.addEventListener('change', async (event) => {
  // Obtenemos el primer archivo seleccionado
  const selectedFile = event.target.files[0];
  
  // Si no se seleccionó ningún archivo, salimos de la función
  if (!selectedFile) {
    resetUI();
    return;
  }
  
  // Mostrar la imagen seleccionada
  displayImage(selectedFile);
  
  // Actualizar el estado
  updateStatus('Procesando imagen...');
  
  // Crear un bitmap de la imagen redimensionado
  try {
    const resizedImageBitmap = await createImageBitmap(selectedFile, {
      resizeWidth: 300,
      resizeHeight: 300,
      resizeQuality: 'high'
    });
    
    // Escaneamos la imagen redimensionada en busca de un código QR
    try {
      const qrResult = await QrScanner.scanImage(resizedImageBitmap);
      
      // Si se detecta un código QR, mostramos el resultado
      resultText.textContent = qrResult;
      updateStatus('¡Código QR detectado!', 'success');
      
      // Si el resultado es una URL, creamos un enlace clickeable
      if (isValidUrl(qrResult)) {
        urlText.textContent = qrResult;
        resultUrl.href = qrResult;
        urlContainer.style.display = 'block';
      } else {
        urlContainer.style.display = 'none';
      }
    } catch (error) {
      // Si hay un error al escanear el código QR, mostramos un mensaje de error
      resultText.textContent = 'No se pudo detectar un código QR en la imagen.';
      updateStatus('Error al escanear QR', 'error');
      urlContainer.style.display = 'none';
    }
  } catch (error) {
    // Si hay un error al procesar la imagen, mostramos un mensaje de error
    resultText.textContent = 'Error al procesar la imagen.';
    updateStatus('Error al procesar imagen', 'error');
  }
});

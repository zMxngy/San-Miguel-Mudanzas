/**
 * Configuración Pública - Trasteos y Mudanzas San Miguel
 * NOTA DE SEGURIDAD: Ningún secreto ni credencial privada debe incluirse en este archivo.
 */

window.APP_CONFIG = {
  // Control de Avisos Pendientes del Cliente
  // Por defecto en false para que no salgan publicados en producción
  MOSTRAR_PENDIENTES: false,

  // Datos de Contacto Directo
  BUSINESS_NAME: "Trasteos y Mudanzas San Miguel",
  CITY: "Cali, Valle del Cauca, Colombia",
  PHONE_DISPLAY: "+57 321 767 6571",
  PHONE_RAW: "573217676571", // Formato para API de WhatsApp y llamadas tel:
  
  // Correo de recepción (Marcador hasta confirmación del cliente)
  EMAIL_RECEPCION: "[PENDIENTE: Correo oficial del negocio]",
  
  // Dirección física / Oficina
  ADDRESS_DISPLAY: "Cali, Valle del Cauca, Colombia",
  
  // Google Apps Script Web App URL
  // Si está vacía (""), el sitio opera honestamente por WhatsApp sin generar errores en consola.
  APPS_SCRIPT_WEBAPP_URL: "", 
  
  // Google Places API Key (Places API New)
  // Si está vacía (""), los campos operan como texto normal con validación y un aviso discreto en consola.
  GOOGLE_MAPS_API_KEY: "",
  
  // Redes Sociales Oficiales
  SOCIAL: {
    INSTAGRAM: "https://www.instagram.com/trasteosymudanzassanmiguel24",
    TIKTOK: "https://www.tiktok.com/@mudanzassanmiguel",
    FACEBOOK: "https://www.facebook.com/trasteosymudanzassanmiguel"
  },

  // Parámetros de Seguridad y Rate Limiting
  SECURITY: {
    MAX_REQUESTS_PER_PHONE: 3,
    RATE_LIMIT_MINUTES: 15
  }
};

export const BRAND_CONFIG = {
  appName: 'Pandit ji online',
  hindiAppName: 'पण्डित जी ऑनलाइन',
  founderName: 'पण्डित शशांक शर्मा (Shashank Sharma)',
  phone: '7017279043',
  displayPhone: '+91 70172 79043',
  whatsappNumber: '917017279043',
  youtubeUrl: 'https://youtube.com/@panditjionlineofficial',
  youtubeHandle: '@panditjionlineofficial',
  location: 'रुद्रपुर, ऊधम सिंह नगर, उत्तराखण्ड (263153)',
  primaryLocality: 'रुद्रपुर (Indra Colony, Awas Vikas, Transit Camp, Kichha Road)'
};

export const getWhatsAppLink = (message: string) => {
  return `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
};

window.BRASA_CONFIG = Object.freeze({
  demoMode: true,
  brandName: 'Brasa 77',
  city: 'Pelotas — RS',
  address: 'Centro, Pelotas — RS',
  mapsUrl: 'https://maps.google.com/?q=Pelotas+RS',

  // orderingMode: 'demo' | 'whatsapp' | 'external'
  // demo: abre a simulação do pedido para portfólio
  // whatsapp: envia o carrinho para o WhatsApp configurado abaixo
  // external: envia para o sistema de pedidos que o cliente já usa
  orderingMode: 'demo',
  whatsapp: '',
  externalOrderUrl: '',

  instagram: '',
  hours: {
    week: '18H — 23H',
    weekend: '18H — 00H',
    sunday: '18H — 23H'
  },
  developer: {
    name: 'Yagho',
    instagram: 'https://www.instagram.com/yaghosite/'
  }
});

window.BRASA_MEDIA = Object.freeze({
  brasaOriginal: 'https://images.pexels.com/photos/21820165/pexels-photo-21820165.jpeg?auto=compress&cs=tinysrgb&w=1600',
  baconFire: 'https://images.pexels.com/photos/19247571/pexels-photo-19247571.jpeg?auto=compress&cs=tinysrgb&w=1600',
  brasaOnion: 'https://images.pexels.com/photos/18713429/pexels-photo-18713429.jpeg?auto=compress&cs=tinysrgb&w=1600',
  onionCrunch: 'https://images.pexels.com/photos/18713425/pexels-photo-18713425.jpeg?auto=compress&cs=tinysrgb&w=1600',
  combo: 'https://images.pexels.com/photos/18713431/pexels-photo-18713431.jpeg?auto=compress&cs=tinysrgb&w=1600',
  fries: 'https://images.pexels.com/photos/5836999/pexels-photo-5836999.jpeg?auto=compress&cs=tinysrgb&w=1400',
  onionRings: 'https://images.pexels.com/photos/8880734/pexels-photo-8880734.jpeg?auto=compress&cs=tinysrgb&w=1400',
  coca: 'https://images.pexels.com/photos/25402111/pexels-photo-25402111.jpeg?auto=compress&cs=tinysrgb&w=1400',
  water: 'https://images.pexels.com/photos/1540235/pexels-photo-1540235.jpeg?auto=compress&cs=tinysrgb&w=1400'
});

window.BRASA_MENU = Object.freeze([
  { id:'brasa-original', category:'smash', name:'Brasa Original', price:29.9, description:'Dois discos bovinos, queijo derretido e molho cremoso.', image:window.BRASA_MEDIA.brasaOriginal, tags:['DUPLO','QUEIJO','MOLHO'], featured:true },
  { id:'bacon-fire', category:'smash', name:'Bacon Fire', price:36.9, description:'Carne bovina, cheddar derretido, bacon crocante e pão brioche.', image:window.BRASA_MEDIA.baconFire, tags:['BACON','CHEDDAR','BRIOCHE'], featured:true },
  { id:'brasa-onion', category:'smash', name:'Brasa Onion', price:34.9, description:'Cheeseburger com bacon, queijo e cebola caramelizada.', image:window.BRASA_MEDIA.brasaOnion, tags:['BACON','CEBOLA','QUEIJO'], featured:true },
  { id:'onion-crunch', category:'smash', name:'Onion Crunch', price:32.9, description:'Burger bovino, queijo derretido, bacon e cebola crocante.', image:window.BRASA_MEDIA.onionCrunch, tags:['CEBOLA CROCANTE','QUEIJO','BACON'], featured:true },
  { id:'combo77', category:'combo', name:'Combo 77', price:42.9, description:'Cheeseburger da casa, fritas e refrigerante.', image:window.BRASA_MEDIA.combo, tags:['BURGER','FRITAS','REFRI'] },
  { id:'fritas', category:'side', name:'Fritas da Casa', price:16.9, description:'Fritas douradas, crocantes e finalizadas com sal.', image:window.BRASA_MEDIA.fries, tags:['FRITAS'] },
  { id:'onion-side', category:'side', name:'Onion Rings', price:21.9, description:'Anéis de cebola empanados e crocantes.', image:window.BRASA_MEDIA.onionRings, tags:['CEBOLA'] },
  { id:'coca', category:'drink', name:'Coca-Cola', price:7, description:'Coca-Cola em lata, servida gelada.', image:window.BRASA_MEDIA.coca, tags:['LATA'] },
  { id:'agua', category:'drink', name:'Água Mineral', price:5, description:'Água mineral sem gás, 500 ml.', image:window.BRASA_MEDIA.water, tags:['500 ML'] }
]);

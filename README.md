# Brasa 77 — Smash & Fire

Site comercial demonstrativo para hamburgueria, com direção visual escura e cinematográfica, fotografia gastronômica e experiência de pedido pensada para conversão.

## Destaques

- Hero em vídeo com atmosfera de fogo e brasa
- Cardápio interativo por categorias
- Produtos com fotografia gastronômica real
- Carrinho com quantidade, remoção e total
- Fluxo preparado para pedido pelo WhatsApp
- Localização com acesso ao Google Maps
- Navegação responsiva para desktop e mobile
- Animações com suporte a `prefers-reduced-motion`
- SEO básico, Open Graph e favicon próprio
- Estrutura simples para trocar dados do cliente e cardápio

## Estrutura

- `index.html` — página principal
- `styles.css` — identidade visual e responsividade
- `app.js` — interações, carrinho e comportamento da interface
- `menu-data.js` — produtos, preços e categorias
- `site-config.js` — dados do negócio e integrações
- `favicon.svg` — ícone da marca

## Personalização

Os principais dados do estabelecimento ficam centralizados em `site-config.js`. O cardápio fica em `menu-data.js`, facilitando a adaptação para outro cliente sem espalhar informações pelo código.

## Tecnologias

HTML5, CSS3 e JavaScript.

## Publicação

Projeto estático, compatível com Vercel, Netlify e GitHub Pages sem etapa de build.

## Portfólio

Projeto desenvolvido por Yagho Rosa como demonstração de uma experiência digital premium para negócios de alimentação.

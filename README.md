# Mapa Dashboard — Rede Hidrometeorológica Nacional

> Visualização interativa e performática de dados de estações e precipitação da Agência Nacional de Águas (ANA).

![Dashboard Preview](./public/opengraph-image.png)

## 📌 O Problema
O projeto anterior sofria de problemas comuns em aplicações legadas e construídas puramente para fins de "estudo inicial":
- Uso de Create React App (CRA), que hoje está deprecado.
- Dependência do Google Maps, o que quebrava o projeto ao clonar caso a API Key não estivesse configurada (ou o trial expirado).
- Código em JavaScript puro (sem tipagem estática), resultando em DX pobre e maior risco de bugs.
- Ausência total de sistema de design, testes ou documentação robusta.

Este projeto propõe uma **reformulação arquitetural e visual completa**, visando solucionar os problemas acima e entregar uma aplicação escalável, com foco na usabilidade e nos requisitos de produtos modernos voltados a dados.

---

## 🚀 Solução Técnica e Arquitetura

Migramos o projeto para uma stack moderna orientada a performance e boa DX. As principais decisões técnicas foram:

### 1. Framework: Next.js 15 (App Router)
O App Router é o padrão na indústria, garantindo Server Components para melhor performance, roteamento nativo e Colocation de API Routes (substituindo arquivos grandes em bundles client-side).

### 2. Mapa: React-Leaflet + OpenStreetMap
Substituímos o Google Maps pelo Leaflet. Motivos:
- **Gratuito e Open Source:** O projeto funciona *out-of-the-box* para quem clonar. Sem necessitar de chave de API.
- **Ecossistema:** Suporte robusto e fácil integração com temas escuros via _basemap tiles_ customizados.

### 3. Gestão de Dados: Next.js API Routes + TanStack Query
- **TanStack Query:** Oferece cache em memória, _stale time_ configurável e deduplicação de requisições. Essencial para evitar re-fetches dos mesmos dados estáticos massivos do painel.
- **Next.js API:** Atuam como BFF (Backend for Frontend), entregando os dados estáticos com Headers de Cache via Vercel Edge Network.

### 4. Estilização: Tailwind CSS + shadcn/ui
- **Tailwind v4:** Utilizado para estilização performática de baixo nível.
- **shadcn/ui:** Componentes acessíveis, consistentes e _headless_ que dão um aspecto "Premium" e profissional à UI sem inchar o projeto de bibliotecas de terceiros pesadas.
- **Next-themes:** O tema _Light / Dark_ é sincronizado automaticamente, inclusive alterando o _basemap_ do Leaflet de OpenStreetMap para Carto Dark Matter.

### 5. Estado em URL
Filtros e painéis abertos (ex: estação clicada) armazenam seus estados em **Parâmetros de URL**. Essa funcionalidade, essencial para compartilhamento de informações (_shareability_) e campanhas baseadas em URL, permite que o usuário navegue com o histórico do browser.

---

## 🛠️ Como rodar o projeto localmente

```bash
# Clone o repositório
git clone https://github.com/antonyaraujo/mapa-dashboard.git

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra o navegador em `http://localhost:3000`.

---

## 🧪 Testes

Testes implementados utilizando **Jest + React Testing Library**.

```bash
npm run test
```

## 📊 Origem dos Dados
A fonte original provém da [Agência Nacional de Águas (ANA) / SNIRH](https://www.snirh.gov.br/hidroweb/).
Para fins de portfólio, os dados foram exportados e mantidos localmente, operando como uma API Mock.

<div align="center">
  <h1>📦 UpStock</h1>
  <p><strong>Sistema inteligente de gestão de estoque com acesso web e mobile, multiusuário, dashboards em tempo real e muito mais.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="Java 21">
    <img src="https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot 4">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
    <img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16">
    <br>
    <img src="https://img.shields.io/badge/Flyway-CC0000?style=for-the-badge&logo=flyway&logoColor=white" alt="Flyway">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway">
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  </p>
</div>

---

## 📋 Sobre

O **UpStock** é um sistema de gestão de estoque projetado para substituir planilhas e processos manuais. Com autenticação JWT, atualizações em tempo real via SSE, filtros server-side e relatórios exportáveis, oferece controle completo sobre produtos, movimentações e usuários.

---

## ✨ Funcionalidades

- **Dashboard** — Visão geral com indicadores do dia, valor total do estoque e capacidade utilizada
- **Produtos** — Cadastro, edição, busca com filtros server-side, controle de quantidade e preço
- **Movimentações** — Registro de entrada e saída com histórico completo e atualização automática do estoque
- **Relatórios** — Cards de resumo, tabela de inventário e exportação CSV
- **Usuários** — CRUD completo com papéis (admin/user), edição de perfil e loja
- **Autenticação** — Login seguro com JWT (access token 24h + refresh token 7 dias), rate limit
- **Tempo real** — Notificações SSE sem necessidade de recarregar a página
- **Paginação** — Todos os endpoints listáveis retornam páginas com 100 itens

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Frontend)                        │
│  React 19 + Vite + Tailwind CSS + Axios + React Router       │
│                                                              │
│  /api/(.*)  ───── proxy reverso ────►  Railway (Backend)     │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    Railway (Backend)                          │
│  Spring Boot 4.0 + Spring Security + Spring Data JPA          │
│  Flyway + PostgreSQL 16 + Swagger/OpenAPI                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Produtos  │  │ Movim.   │  │ Usuários  │  │ Relatórios   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       └──────────────┴─────────────┴────────────────┘         │
│                           │                                   │
│                    ┌──────┴──────┐                            │
│                    │ PostgreSQL  │                            │
│                    │   (Neon)    │                            │
│                    └─────────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias

### Backend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 4.0.6 | Framework web |
| Spring Security | 7.0 | Autenticação/autorização |
| Spring Data JPA | — | Acesso a dados |
| PostgreSQL | 16 | Banco de dados |
| Flyway | — | Migrations |
| JWT (jjwt) | 0.13 | Tokens de acesso |
| Lombok | — | Redução de boilerplate |
| Swagger (SpringDoc) | 3.0.3 | Documentação OpenAPI |

### Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 19 | UI Library |
| Vite | 8 | Build tool |
| React Router | 7 | Roteamento SPA |
| Axios | — | HTTP client |
| Tailwind CSS | — | Estilização |

---

## 🚀 Começando

### Pré-requisitos

- JDK 21+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16

### Backend

```bash
# Clone
git clone https://github.com/Kkrloz/UpStock.git
cd UpStock

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Execute as migrations e inicie
mvn spring-boot:run -DskipTests
```

A API estará em `http://localhost:8080`.  
Swagger UI em `http://localhost:8080/swagger-ui.html`.

### Frontend

```bash
cd UpStock

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará em `http://localhost:5173`.

### Docker

```bash
docker compose up -d
```

---

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

| Variável | Obrigatório | Padrão | Descrição |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | ✅ | — | URL JDBC do PostgreSQL |
| `JWT_SECRET` | ✅ | — | Chave secreta JWT (mín. 32 caracteres) |
| `JWT_EXPIRATION` | ❌ | `86400000` | Duração do access token (ms) |
| `ADMIN_PASSWORD` | ✅ | — | Senha do admin inicial |
| `SHOW_SQL` | ❌ | `false` | Exibir SQL no console |

### Frontend

| Variável | Obrigatório | Padrão | Descrição |
|---|---|---|---|
| `VITE_API_URL` | ❌ | `/api` | URL base da API (proxy em dev) |

---

## 🌐 Deploy

### Backend — Railway

O backend é implantado automaticamente no [Railway](https://railway.app) a partir do branch `master`. O `railway.json` define:

```json
{
  "build": { "buildCommand": "mvn clean package -DskipTests" },
  "deploy": { "startCommand": "java -jar target/upstock-0.0.1-SNAPSHOT.jar" }
}
```

**Variáveis necessárias no Railway:**

- `SPRING_DATASOURCE_URL` — URL do banco PostgreSQL (Neon)
- `JWT_SECRET` — Chave secreta JWT
- `ADMIN_PASSWORD` — Senha do admin

### Frontend — Vercel

O frontend é implantado no [Vercel](https://vercel.com) a partir do branch `master`. O `vercel.json` faz proxy das requisições `/api/*` para o Railway.

---

## 📖 Documentação da API

Com o backend rodando, acesse:

- **Swagger UI:** `/swagger-ui.html`
- **OpenAPI JSON:** `/v3/api-docs`

### Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/refresh` | Renovar token |
| GET | `/api/products` | Listar produtos (paginado) |
| POST | `/api/products` | Criar produto |
| GET | `/api/movements` | Listar movimentações (paginado) |
| GET | `/api/users` | Listar usuários (paginado) |
| GET | `/api/reports/summary` | Resumo do relatório |
| GET | `/api/reports/inventory` | Inventário (CSV) |

---

## 👥 Papéis de usuário

| Papel | Acesso |
|---|---|
| `ADMIN` | CRUD completo de produtos, movimentações, usuários e relatórios |
| `USER` | CRUD de produtos e movimentações da própria loja |

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

<p align="center">
  Feito por <a href="https://github.com/Kkrloz">Kkrloz</a> e <a href="https://github.com/lMario09">lMario09</a>
</p>

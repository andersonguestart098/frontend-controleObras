# Dashboard de Obras — Frontend

Frontend do dashboard integrado ao backend FastAPI/Sankhya.

## Stack

- React + TypeScript + Vite
- Material UI
- TanStack Query
- Apache ECharts
- React Hook Form
- Axios

## Como executar

1. Copie o arquivo de ambiente:

```powershell
Copy-Item .env.example .env
```

2. Edite `.env` e informe a URL e a mesma API key do backend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_API_KEY=sua-chave
```

3. Instale e execute:

```powershell
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Backend esperado

O frontend consome:

```http
POST /api/v1/dashboard/kpis
X-API-Key: sua-chave
```

Body:

```json
{
  "codproj": 10030000,
  "dtneg_inicial": null,
  "dtneg_final": null,
  "nunota": null
}
```

## CORS

O backend precisa permitir `http://localhost:5173` durante o desenvolvimento.

const BASE_URL = "https://www.ana.gov.br/hidrowebservice";
const API_USER = process.env.ANA_API_USER;
const API_PASSWORD = process.env.ANA_API_PASSWORD;

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Autentica na API da ANA para obter o Bearer token
 * Se não houver credenciais, lança erro para usarmos fallback local
 */
export async function getAuthToken(): Promise<string> {
  if (!API_USER || !API_PASSWORD) {
    throw new Error("Missing ANA API credentials in .env.local");
  }

  // Se o token ainda é válido, reutiliza
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await fetch(`${BASE_URL}/EstacoesTelemetricas/OAUth/v1`, {
    method: "GET",
    headers: {
      Identificador: API_USER,
      Senha: API_PASSWORD,
    },
    // Não cachear autenticação no Next.js
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate with ANA API: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Como não temos a documentação exata do payload de retorno, 
  // assumimos que retorna algo como { access_token: "..." } ou { token: "..." }
  // Ou o token vem no próprio corpo se for um texto simples.
  const token = data.access_token || data.token || (typeof data === "string" ? data : data.message);
  
  if (!token) {
    throw new Error("Token not found in response payload: " + JSON.stringify(data));
  }

  cachedToken = token;
  // Assume 1 hora de validade como margem segura (3600 * 1000)
  tokenExpiresAt = Date.now() + 3000 * 1000; 

  return token;
}

/**
 * Faz fetch na API da ANA já lidando com Autenticação.
 * Em caso de erro 401, limpa o token e tenta de novo uma vez.
 */
export async function fetchAnaApi(path: string, options: RequestInit = {}) {
  let token = await getAuthToken();
  
  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // Tenta reautenticar uma vez
    cachedToken = null;
    token = await getAuthToken();
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  if (!res.ok) {
    throw new Error(`ANA API Error: ${res.status} on ${path}`);
  }

  return res;
}

import { fetchAuthSession } from "aws-amplify/auth";
import { config } from "./config";

export interface Zapatilla {
  id: number;
  modelo: string;
  marca: string;
  talla: number;
  stock: number;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  return fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function obtenerCatalogo(): Promise<Zapatilla[]> {
  const res = await apiFetch("/api/zapatillas");
  if (!res.ok) {
    throw new Error(`El backend respondió ${res.status} al pedir el catálogo`);
  }
  return res.json();
}
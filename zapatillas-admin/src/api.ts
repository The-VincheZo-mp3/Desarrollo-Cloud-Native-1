import { fetchAuthSession } from "aws-amplify/auth";
import { config } from "./config";

export interface Zapatilla {
  id: number;
  modelo: string;
  marca: string;
  talla: number;
  stock: number;
}

export interface NuevaZapatilla {
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

export async function agregarZapatilla(datos: NuevaZapatilla): Promise<Zapatilla> {
  const res = await apiFetch("/api/zapatillas", {
    method: "POST",
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.mensaje ?? `El backend respondió ${res.status} al agregar la zapatilla`);
  }
  return res.json();
}
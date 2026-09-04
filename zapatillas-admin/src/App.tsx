import { useEffect, useState, type FormEvent } from "react";
import { signInWithRedirect, signOut, fetchAuthSession } from "aws-amplify/auth";
import { agregarZapatilla, type Zapatilla } from "./api";
import { isConfigOk, configFaltante } from "./config";
import "./App.css";

const FORM_INICIAL = { modelo: "", marca: "", talla: "", stock: "" };

function App() {
  const [logueado, setLogueado] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agregadas, setAgregadas] = useState<Zapatilla[]>([]);

  useEffect(() => {
    if (!isConfigOk) {
      setCargandoSesion(false);
      return;
    }
    fetchAuthSession()
      .then((session) => setLogueado(!!session.tokens))
      .catch(() => setLogueado(false))
      .finally(() => setCargandoSesion(false));
  }, []);

  if (!isConfigOk) {
    return (
      <div className="aviso-config">
        <h1>Falta configuración</h1>
        <p>
          Completa estos valores en <code>.env</code> (Contexto Cognito interno):
        </p>
        <ul>
          {configFaltante().map((clave) => (
            <li key={clave}>
              <code>{clave}</code>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const nueva = await agregarZapatilla({
        modelo: form.modelo,
        marca: form.marca,
        talla: Number(form.talla),
        stock: Number(form.stock),
      });
      setAgregadas((prev) => [nueva, ...prev]);
      setForm(FORM_INICIAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Zapatillas — Panel de Personal</h1>
        {!cargandoSesion &&
          (logueado ? (
            <button onClick={() => signOut()}>Cerrar sesión</button>
          ) : (
            <button onClick={() => signInWithRedirect()}>Iniciar sesión</button>
          ))}
      </header>

      {cargandoSesion && <p>Verificando sesión…</p>}
      {!cargandoSesion && !logueado && <p className="mensaje">Inicia sesión como personal para agregar stock.</p>}

      {logueado && (
        <main>
          <form onSubmit={onSubmit} className="formulario">
            <label>
              Modelo
              <input required value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
            </label>
            <label>
              Marca
              <input required value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
            </label>
            <label>
              Talla
              <input
                required
                type="number"
                min={30}
                value={form.talla}
                onChange={(e) => setForm({ ...form, talla: e.target.value })}
              />
            </label>
            <label>
              Stock
              <input
                required
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </label>
            <button type="submit" disabled={enviando}>
              {enviando ? "Agregando…" : "Agregar al inventario"}
            </button>
          </form>

          {error && <p className="error">No se pudo agregar: {error}</p>}

          {agregadas.length > 0 && (
            <section>
              <h2>Agregado en esta sesión</h2>
              <ul className="lista-agregadas">
                {agregadas.map((z) => (
                  <li key={z.id}>
                    #{z.id} — {z.modelo} ({z.marca}) · talla {z.talla} · stock {z.stock}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
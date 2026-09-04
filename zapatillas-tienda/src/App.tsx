import { useEffect, useState } from "react";
import { signInWithRedirect, signOut, fetchAuthSession } from "aws-amplify/auth";
import { obtenerCatalogo, type Zapatilla } from "./api";
import { isConfigOk, configFaltante } from "./config";
import "./App.css";

function App() {
  const [logueado, setLogueado] = useState(false);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [catalogo, setCatalogo] = useState<Zapatilla[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!logueado) return;
    setCargandoCatalogo(true);
    setError(null);
    obtenerCatalogo()
      .then(setCatalogo)
      .catch((err) => setError(err.message))
      .finally(() => setCargandoCatalogo(false));
  }, [logueado]);

  if (!isConfigOk) {
    return (
      <div className="aviso-config">
        <h1>Falta configuración</h1>
        <p>
          Completa estos valores en <code>.env</code> (Contexto Cognito externo):
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Zapatillas — Tienda</h1>
        {!cargandoSesion &&
          (logueado ? (
            <button onClick={() => signOut()}>Cerrar sesión</button>
          ) : (
            <button onClick={() => signInWithRedirect()}>Iniciar sesión</button>
          ))}
      </header>

      {cargandoSesion && <p>Verificando sesión…</p>}
      {!cargandoSesion && !logueado && <p className="mensaje">Inicia sesión como cliente para ver el catálogo.</p>}

      {logueado && (
        <main>
          {cargandoCatalogo && <p>Cargando catálogo…</p>}
          {error && <p className="error">Error al cargar el catálogo: {error}</p>}
          {!cargandoCatalogo && !error && catalogo.length === 0 && (
            <p className="mensaje">No hay zapatillas en el inventario todavía.</p>
          )}
          <div className="grid-catalogo">
            {catalogo.map((z) => (
              <article key={z.id} className="tarjeta">
                <h2>{z.modelo}</h2>
                <p className="marca">{z.marca}</p>
                <p>Talla: {z.talla}</p>
                <p className={z.stock > 0 ? "stock-ok" : "stock-agotado"}>
                  {z.stock > 0 ? `${z.stock} en stock` : "Agotado"}
                </p>
              </article>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
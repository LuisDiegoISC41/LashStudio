import { useState, useEffect } from "react";
import API_URL from "../config/api";

export default function Clientes({ user }) {
  const [query,    setQuery]    = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/clientes`, {
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      setClientes(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchClientes();
  }, [user]);

  const list = clientes.filter((c) =>
    `${c.nombre} ${c.apellidoPaterno ?? ""} ${c.apellidoMaterno ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()) ||
    c.correo.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return (
    <div className="cli-page">
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray)" }}>
        Cargando clientes...
      </div>
    </div>
  );

  if (error) return (
    <div className="cli-page">
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
        <strong style={{ color: "var(--danger)" }}>{error}</strong>
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={fetchClientes}
            style={{
              padding: ".5rem 1.2rem",
              background: "var(--purple-dark)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cli-page">
      <div className="sec-header" style={{ marginBottom: "1.3rem" }}>
        <h2 className="sec-title">Clientes Registrados</h2>
        <span style={{
          background: "var(--purple-bg)",
          border: "1px solid var(--purple-light)",
          borderRadius: "50px",
          padding: "4px 13px",
          fontSize: ".81rem",
          color: "var(--purple-dark)",
          fontWeight: 600,
        }}>
          {list.length} cliente{list.length !== 1 ? "s" : ""}
        </span>
      </div>

      <input
        type="text"
        placeholder="🔍  Buscar por nombre o correo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%", padding: ".58rem 1rem",
          border: "1.5px solid var(--gray-light)",
          borderRadius: "var(--radius)",
          fontSize: ".86rem", outline: "none",
          marginBottom: "1.1rem",
          background: "#fff", fontFamily: "inherit",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--purple-light)")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--gray-light)")}
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Apellidos</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--gray)", padding: "2rem" }}>
                  {query ? "No se encontraron resultados" : "No hay clientes registrados"}
                </td>
              </tr>
            )}
            {list.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <div className="avatar">
                      {c.nombre?.[0]?.toUpperCase()}
                      {c.apellidoPaterno?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{c.nombre}</span>
                  </div>
                </td>
                <td>{c.apellidoPaterno ?? ""} {c.apellidoMaterno ?? ""}</td>
                <td>{c.telefono ?? "No registrado"}</td>
                <td style={{ color: "var(--purple-dark)" }}>{c.correo}</td>
                <td>
                  <span style={{
                    background: "var(--purple-bg)",
                    padding: "2px 10px", borderRadius: "50px",
                    fontSize: ".75rem", fontWeight: 600,
                    color: "var(--purple-dark)", fontFamily: "monospace",
                  }}>
                    {c.id?.substring(0, 8)}...
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clientes.length > 0 && (
        <div style={{ marginTop: "1rem", textAlign: "center", fontSize: ".8rem", color: "var(--gray)" }}>
          Mostrando {list.length} de {clientes.length} clientes
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { MONTHS_SHORT } from "../constants";
import EditPerfilModal from "../components/EditPerfilModal";
import API_URL from "../config/api";

function HistorialItem({ cita }) {
  const parts = cita.fecha.split("-");
  const statusClass = `historial-status status-${cita.status}`;
  const statusLabel =
    cita.status === "completada" ? "✅ Completada"
    : cita.status === "confirmada" ? "🔮 Confirmada"
    : "❌ Cancelada";

  return (
    <div className="historial-item">
      <div className="historial-fecha">
        <div className="dia">{parseInt(parts[2])}</div>
        <div className="mes">{MONTHS_SHORT[parseInt(parts[1]) - 1]}</div>
      </div>
      <div className="historial-info">
        <div className="historial-svc">{cita.servicio}</div>
        <div className="historial-hora">🕐 {cita.hora} hrs · {cita.fecha}</div>
      </div>
      <span className={statusClass}>{statusLabel}</span>
    </div>
  );
}

export default function Perfil({ user }) {
  const [misCitas, setMisCitas] = useState([]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre:   user?.nombre || "",
    telefono: "",
    correo:   user?.correo || "",
  });

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/citas/cliente/${user.id}`, {
      headers: { "Authorization": `Bearer ${user.token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) =>
        setMisCitas(data.map((c) => ({
          id:      c.id,
          fecha:   c.fecha,
          hora:    c.hora.slice(0, 5),
          servicio: c.servicioNombre,
          status:  "confirmada",
        })))
      )
      .catch(() => {});
  }, [user]);

  const completadas = misCitas.filter((c) => c.status === "completada").length;
  const proximas    = misCitas.filter((c) => c.status === "confirmada").length;

  return (
    <div className="perfil-page">
      <div className="sec-header" style={{ marginBottom: "1.3rem" }}>
        <h2 className="sec-title">Mi Perfil</h2>
      </div>

      {/* ── Cabecera de perfil ── */}
      <div className="perfil-header">
        <div className="perfil-avatar">{(user?.nombre || "C")[0]}</div>
        <div style={{ flex: 1 }}>
          <div className="perfil-name">{user?.nombre || "Cliente"}</div>
          <div className="perfil-email">{user?.correo}</div>
          <div className="perfil-badge">
            {user?.role?.toLowerCase() === "admin" ? "Administradora" : "Cliente"}
          </div>
        </div>
        <button
          className="btn-outline"
          style={{ borderRadius: "var(--radius-sm)" }}
          onClick={() => setEditando(true)}
        >
          ✏️ Editar datos
        </button>
      </div>

      {/* ── Estadísticas rápidas ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}>
        {[
          ["📅", misCitas.length, "Total citas"],
          ["✅", completadas,     "Completadas"],
          ["🔮", proximas,        "Próximas"],
        ].map(([icon, val, label], i) => (
          <div key={i} style={{
            background: "#fff",
            border: "1px solid rgba(201,168,224,.3)",
            borderRadius: "var(--radius)",
            padding: "1.1rem",
            textAlign: "center",
            boxShadow: "var(--shadow)",
          }}>
            <div style={{ fontSize: "1.4rem", marginBottom: ".3rem" }}>{icon}</div>
            <div style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "2rem", fontWeight: 600,
              color: "var(--purple-dark)", lineHeight: 1,
            }}>
              {val}
            </div>
            <div style={{ fontSize: ".75rem", color: "var(--gray)", marginTop: "3px" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Historial ── */}
      <h3 style={{
        fontFamily: "Cormorant Garamond, serif",
        fontSize: "1.4rem",
        color: "var(--purple-dark)",
        marginBottom: "1rem",
      }}>
        Historial de Citas
      </h3>

      <div className="historial-list">
        {misCitas.length === 0 && (
          <p style={{ color: "var(--gray)", textAlign: "center", padding: "2rem" }}>
            No tienes citas registradas.
          </p>
        )}
        {misCitas.map((c) => (
          <HistorialItem key={c.id} cita={c} />
        ))}
      </div>

      {editando && (
        <EditPerfilModal
          form={form}
          setForm={setForm}
          user={user}
          onClose={() => setEditando(false)}
        />
      )}
    </div>
  );
}

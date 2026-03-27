import { useState, useEffect } from "react";
import { MONTHS_SHORT } from "../constants";
import API_URL from "../config/api";

// ── Helpers ────────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ── Sub-componentes (se mantienen igual) ────────────────────────────────────────────
function StatCard({ icon, label, val, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div>
        <div className="stat-val">{val}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-trend trend-up">{sub}</div>}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div className="bar-chart">
      {data.map((v, i) => (
        <div key={i} className="bar-wrap">
          <div className="bar" style={{ height: `${Math.round((v / max) * 100)}%` }}>
            <div className="bar-tooltip">{v}</div>
          </div>
          <div className="bar-label">{MONTHS_SHORT[i]}</div>
        </div>
      ))}
    </div>
  );
}

function PopularServices({ servicios }) {
  if (!servicios || servicios.length === 0) return (
    <div style={{ textAlign: "center", color: "var(--gray)", padding: "1rem" }}>
      Sin datos aún
    </div>
  );
  const total = servicios.reduce((acc, s) => acc + s.count, 0) || 1;
  return (
    <>
      {servicios.map((s, i) => {
        const pct = Math.round((s.count / total) * 100);
        return (
          <div key={i} className="svc-row">
            <div style={{ fontSize: ".78rem", fontWeight: 500, minWidth: 130, color: "var(--black)" }}>
              {s.nombre}
            </div>
            <div className="svc-prog">
              <div className="svc-prog-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="svc-pct">{pct}%</div>
          </div>
        );
      })}
    </>
  );
}

function UpcomingAppointments({ citas }) {
  if (!citas || citas.length === 0) return (
    <div style={{ textAlign: "center", color: "var(--gray)", padding: "1rem" }}>
      No hay citas próximas
    </div>
  );
  return (
    <div className="activity-list">
      {citas.map((c) => (
        <div key={c.id} className="activity-item">
          <div className="activity-dot" style={{ background: "var(--purple)" }} />
          <div className="activity-text">
            <strong>{c.clienteNombre}</strong> — {c.servicioNombre}
          </div>
          <div className="activity-time">📅 {c.fecha} · {c.hora?.slice(0, 5)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal con validaciones mejoradas ───────────────────────────────────────
export default function Dashboard({ user }) {
  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const mesStr   = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

  const [citasMes,     setCitasMes]     = useState([]);
  const [clientes,     setClientes]     = useState([]);
  const [servicios,    setServicios]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    // 🔒 VALIDACIÓN DE SEGURIDAD: Solo admin puede cargar datos
    if (!user || user.role !== 'admin') {
      console.log("❌ Acceso denegado: No eres administrador");
      setLoading(false);
      setError("No tienes permisos para ver el dashboard");
      return;
    }

    if (!user?.token) {
      console.log("❌ No hay token disponible");
      setLoading(false);
      setError("Sesión no válida. Por favor inicia sesión nuevamente.");
      return;
    }

    const token = user.token;
    console.log("🔑 Token disponible, longitud:", token.length);
    console.log("📅 Consultando citas para mes:", mesStr);

    // Función para hacer fetch con manejo de errores
    const fetchWithAuth = (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: authHeaders(token)
      }).then(async (response) => {
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("No autorizado. Verifica tus permisos.");
          }
          if (response.status === 401) {
            throw new Error("Sesión expirada. Inicia sesión nuevamente.");
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      });
    };

    Promise.allSettled([
      // Citas del mes actual
      fetchWithAuth(`${API_URL}/api/citas/mes?mes=${mesStr}`).catch(err => {
        console.error("Error cargando citas:", err.message);
        return [];
      }),

      // Clientes (solo admin puede ver todos)
      fetchWithAuth(`${API_URL}/api/clientes`).catch(err => {
        console.error("Error cargando clientes:", err.message);
        return [];
      }),

      // Servicios (público)
      fetch(`${API_URL}/api/servicios`)
        .then(r => r.ok ? r.json() : [])
        .catch(err => {
          console.error("Error cargando servicios:", err);
          return [];
        })
    ]).then(([citasRes, clientesRes, serviciosRes]) => {
      setCitasMes(citasRes.status === "fulfilled" ? citasRes.value : []);
      setClientes(clientesRes.status === "fulfilled" ? clientesRes.value : []);
      setServicios(serviciosRes.status === "fulfilled" ? serviciosRes.value : []);
      
      // Verificar si hubo errores de autenticación
      if (citasRes.status === "rejected" && citasRes.reason?.message?.includes("No autorizado")) {
        setError("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      }
    }).finally(() => setLoading(false));
  }, [user]);

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="dash-page">
        <div className="sec-header" style={{ marginBottom: "1.4rem" }}>
          <h2 className="sec-title">Dashboard</h2>
        </div>
        <div style={{ 
          textAlign: "center", 
          padding: "3rem", 
          background: "#fff3e0", 
          borderRadius: "12px",
          border: "1px solid #ffd966"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h3 style={{ color: "#c44", marginBottom: "0.5rem" }}>Acceso Denegado</h3>
          <p style={{ color: "var(--gray)" }}>{error}</p>
          {error.includes("sesión") && (
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "var(--purple)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  // Si no es admin, no mostrar nada (por seguridad)
  if (!user || user.role !== 'admin') {
    return null;
  }

  // ── Cálculos ────────────────────────────────────────────────────────────────
  const citasHoy      = citasMes.filter((c) => c.fecha === todayStr).length;
  const citasProximas = citasMes
    .filter((c) => c.fecha >= todayStr)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    .slice(0, 4);

  // Contar cuántas citas tiene cada servicio este mes
  const svcCount = {};
  citasMes.forEach((c) => {
    if (c.servicioNombre) svcCount[c.servicioNombre] = (svcCount[c.servicioNombre] || 0) + 1;
  });
  // Completar con servicios que aún no tienen citas
  servicios.forEach((s) => {
    if (!svcCount[s.nombre]) svcCount[s.nombre] = 0;
  });
  const svcRanking = Object.entries(svcCount)
    .map(([nombre, count]) => ({ nombre, count }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Barras por mes
  const barData = Array(12).fill(0);
  citasMes.forEach((c) => {
    const m = parseInt(c.fecha?.split("-")[1]) - 1;
    if (m >= 0 && m < 12) barData[m]++;
  });

  const stats = [
    {
      icon: "📅", label: "Citas hoy",
      val: loading ? "—" : citasHoy,
      sub: `${citasMes.length} citas este mes`,
      color: "#f5eef9",
    },
    {
      icon: "👥", label: "Clientes registrados",
      val: loading ? "—" : clientes.length,
      sub: clientes.length > 0 ? "en base de datos" : null,
      color: "#e8f5e9",
    },
    {
      icon: "🛎️", label: "Servicios activos",
      val: loading ? "—" : servicios.length,
      sub: servicios.length > 0 ? "disponibles" : null,
      color: "#e3f2fd",
    },
    {
      icon: "⭐", label: "Próximas citas",
      val: loading ? "—" : citasProximas.length,
      sub: "confirmadas",
      color: "#fff3e0",
    },
  ];

  return (
    <div className="dash-page">
      <div className="sec-header" style={{ marginBottom: "1.4rem" }}>
        <h2 className="sec-title">Dashboard</h2>
        <span style={{ fontSize: ".78rem", color: "var(--gray)" }}>
          Datos en tiempo real
        </span>
      </div>

      {/* Estadísticas */}
      <div className="stats-row">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Gráficas */}
      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>Citas por Mes</h3>
            <span style={{ fontSize: ".72rem", color: "var(--gray)" }}>{today.getFullYear()}</span>
          </div>
          <div className="dash-card-body">
            {loading
              ? <div style={{ textAlign: "center", color: "var(--gray)", padding: "2rem" }}>Cargando...</div>
              : <BarChart data={barData} />}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head"><h3>Servicios Populares</h3></div>
          <div className="dash-card-body">
            {loading
              ? <div style={{ textAlign: "center", color: "var(--gray)", padding: "2rem" }}>Cargando...</div>
              : <PopularServices servicios={svcRanking} />}
          </div>
        </div>
      </div>

      {/* Próximas citas */}
      <div className="dash-card">
        <div className="dash-card-head">
          <h3>Próximas Citas</h3>
          <span style={{ fontSize: ".72rem", color: "var(--gray)" }}>confirmadas</span>
        </div>
        <div className="dash-card-body">
          {loading
            ? <div style={{ textAlign: "center", color: "var(--gray)", padding: "1rem" }}>Cargando...</div>
            : <UpcomingAppointments citas={citasProximas} />}
        </div>
      </div>
    </div>
  );
}
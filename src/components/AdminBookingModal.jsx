import { useState, useEffect } from "react";
import { MONTHS, WORK_H } from "../constants";
import API_URL from "../config/api";

export default function AdminBookingModal({ user, onBook, onClose }) {
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [servicioId, setServicioId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [clienteQuery, setClienteQuery] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    // Cargar servicios
    fetch(`${API_URL}/api/servicios`)
      .then((r) => r.json())
      .then(setServicios)
      .catch(() => setErr("No se pudieron cargar los servicios."));
  }, []);

  const loadClientes = async (query) => {
    if (!query.trim()) {
      setFilteredClientes([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/clientes/search?q=${encodeURIComponent(query)}`, {
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFilteredClientes(data);
      } else {
        setFilteredClientes([]);
      }
    } catch {
      setFilteredClientes([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadClientes(clienteQuery), 300);
    return () => clearTimeout(timer);
  }, [clienteQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha) { setErr("Selecciona una fecha."); return; }
    if (!hora) { setErr("Selecciona una hora."); return; }
    if (!clienteId) { setErr("Selecciona un cliente."); return; }
    if (!servicioId) { setErr("Selecciona un servicio."); return; }
    setLoad(true);
    try {
      const res = await fetch(`${API_URL}/api/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          fecha: fecha,
          hora: hora,
          idCliente: clienteId,
          idServicio: servicioId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data === "string" ? data : data.message || "No se pudo crear la cita.");
        return;
      }
      setOk(true);
      setTimeout(() => onBook(data), 850);
    } catch {
      setErr("No se pudo conectar al servidor.");
    } finally {
      setLoad(false);
    }
  };

  const selectCliente = (cliente) => {
    setClienteId(cliente.id);
    setClienteQuery(`${cliente.nombre} ${cliente.apellidoPaterno || ''} (${cliente.correo})`.trim());
    setFilteredClientes([]);
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-logo">
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400 }}>
            Nueva Cita (Admin)
          </h2>
          <p>Crear cita para un cliente</p>
        </div>

        {ok ? (
          <div className="ok" style={{ textAlign: "center", padding: "1rem" }}>
            ✅ ¡Cita creada!<br />
            <small>{fecha} · {hora} hrs</small>
          </div>
        ) : (
          <>
            {err && <div className="err">{err}</div>}

            <form onSubmit={handleSubmit}>
              <div className="fg">
                <label>Fecha</label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="fg">
                <label>Hora</label>
                <select
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                >
                  <option value="">Selecciona una hora...</option>
                  {WORK_H.map((h) => (
                    <option key={h} value={h}>
                      {h} hrs
                    </option>
                  ))}
                </select>
              </div>
              <div className="fg">
                <label>Cliente</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o correo..."
                  value={clienteQuery}
                  onChange={(e) => {
                    setClienteQuery(e.target.value);
                    setClienteId("");
                  }}
                />
                {filteredClientes.length > 0 && (
                  <div className="cliente-list">
                    {filteredClientes.map((c) => (
                      <div
                        key={c.id}
                        className="cliente-item"
                        onClick={() => selectCliente(c)}
                      >
                        {c.nombre} {c.apellidoPaterno || ''} - {c.correo} - {c.telefono || ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="fg">
                <label>Servicio</label>
                <select
                  required
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                >
                  <option value="">Selecciona un servicio...</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} — ${s.precio.toLocaleString("es-MX")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={load}>
                  {load ? "Creando..." : "Crear Cita"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
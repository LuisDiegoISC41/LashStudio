import { useState, useEffect } from "react";
import { MONTHS } from "../constants";
import API_URL from "../config/api";

export default function BookingModal({ slot, date, user, onBook, onClose }) {
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState("");
  const [err,        setErr]        = useState("");
  const [ok,         setOk]         = useState(false);
  const [load,       setLoad]       = useState(false);

  const parts = date.split("-");
  const dateDisplay = `${parseInt(parts[2])} de ${MONTHS[parseInt(parts[1]) - 1]}`;

  useEffect(() => {
    fetch(`${API_URL}/api/servicios`)
      .then((r) => r.json())
      .then(setServicios)
      .catch(() => setErr("No se pudieron cargar los servicios."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          fecha:      date,
          hora:       slot.hora,
          idCliente:  user.id,
          idServicio: servicioId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data === "string" ? data : "No se pudo reservar.");
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

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-logo">
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400 }}>
            Reservar Cita
          </h2>
          <p>Confirma tu horario</p>
        </div>

        {ok ? (
          <div className="ok" style={{ textAlign: "center", padding: "1rem" }}>
            ✅ ¡Cita reservada!<br />
            <small>{dateDisplay} · {slot.hora} hrs</small>
          </div>
        ) : (
          <>
            {err && <div className="err">{err}</div>}

            <div className="book-info">
              <p>📅 {dateDisplay}</p>
              <p>🕐 {slot.hora} hrs</p>
              {user && <p>👤 {user.nombre}</p>}
            </div>

            <form onSubmit={handleSubmit}>
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
                  {load ? "Reservando..." : "Confirmar cita"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

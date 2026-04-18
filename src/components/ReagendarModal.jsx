import { useState } from "react";
import { WORK_H } from "../constants";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function ReagendarModal({ cita, citas, onConfirm, onClose }) {
  const today   = new Date();
  const minDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const [fecha, setFecha] = useState(cita.fecha);
  const [hora,  setHora]  = useState("");
  const [err,   setErr]   = useState("");

  // Horarios ya ocupados en la nueva fecha (excluyendo la cita actual)
  const ocupadas = new Set(
    citas
      .filter((c) => c.fecha === fecha && c.id !== cita.id && c.status === "confirmada")
      .map((c) => c.hora)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hora)              { setErr("Selecciona un horario.");       return; }
    if (ocupadas.has(hora)) { setErr("Ese horario ya está ocupado."); return; }
    onConfirm(fecha, hora);
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-logo">
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400 }}>
            Reagendar Cita
          </h2>
          <p>{cita.cliente} — {cita.servicio}</p>
        </div>

        {err && <div className="err">{err}</div>}

        <div className="book-info">
          <p>📅 Fecha actual: {cita.fecha}</p>
          <p>🕐 Hora actual: {cita.hora}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label>Nueva fecha</label>
            <input
              type="date"
              min={minDate}
              value={fecha}
              onChange={(e) => { setFecha(e.target.value); setHora(""); }}
            />
          </div>

          <div className="fg">
            <label>Nuevo horario</label>
            <select
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            >
              <option value="">Selecciona un horario...</option>
              {WORK_H.filter((h) => !ocupadas.has(h)).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Confirmar cambio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

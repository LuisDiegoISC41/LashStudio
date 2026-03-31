import { useState, useEffect } from "react";
import { MONTHS, DAYS_H, WORK_H } from "../constants";
import BookingModal from "../components/BookingModal";
import CancelModal from "../components/CancelModal";
import ReagendarModal from "../components/ReagendarModal";
import API_URL from "../config/api";

// --- Helpers limpios de TypeScript ---
const pad = (n) => String(n).padStart(2, "0");

const ds = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function apiHeaders(token) {
  return { 
    "Content-Type": "application/json", 
    "Authorization": `Bearer ${token}` 
  };
}

export default function Citas({ user, addNotif }) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Carga citas del mes desde la API
  useEffect(() => {
    if (!user) return;
    cargarCitas();
  }, [year, month, user]);

  const cargarCitas = async () => {
    if (!user?.token) {
      console.log("❌ No token available");
      setError("No hay sesión iniciada");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const mes = `${year}-${pad(month + 1)}`;
      
      const response = await fetch(`${API_URL}/api/citas/mes?mes=${mes}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      if (response.status === 401) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return;
      }
      
      if (response.status === 403) {
        setError("No tienes permisos para ver las citas");
        return;
      }
      
      if (!response.ok) {
        setError(`Error ${response.status}: No se pudieron cargar las citas`);
        return;
      }
      
      const data = await response.json();
      
      setCitas(data.map((c) => ({
        id:        c.id,
        fecha:     c.fecha,
        hora:      c.hora.slice(0, 5),
        cliente:   c.cliente?.nombre ? `${c.cliente.nombre} ${c.cliente.apellidoPaterno || ''}`.trim() : "",
        clienteId: c.idCliente || c.cliente?.id,
        servicio:  c.servicio?.nombre || c.servicioNombre || "",
        status:    "confirmada",
      })));
      
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
      setError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  const [bookSlot, setBookSlot] = useState(null);
  const [cancelCita, setCancelCita] = useState(null);
  const [reagendarCita, setReagendarCita] = useState(null);

  /* ── Navegación de mes ── */
  const prevM = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelDay(1);
  };
  
  const nextM = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelDay(1);
  };

  /* ── Cálculos de calendario ── */
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const selDate     = ds(year, month, selDay);

  const citasDay = citas.filter(
    (c) => c.fecha === selDate && c.status === "confirmada"
  );
  const busyDays = new Set(
    citas
      .filter((c) => c.fecha.startsWith(`${year}-${pad(month + 1)}`) && c.status === "confirmada")
      .map((c) => parseInt(c.fecha.split("-")[2]))
  );

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast = (d) =>
    new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const slots = WORK_H.map((h) => ({
    hora:   h,
    booked: !!citasDay.find((x) => x.hora === h),
    cita:   citasDay.find((x) => x.hora === h),
  }));

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const canManage = (cita) => isAdmin || (user && cita.clienteId === user.id);

  /* ── Acciones ── */
  const handleBook = async (citaRes) => {
    try {
      const nueva = {
        id:        citaRes.id,
        fecha:     citaRes.fecha,
        hora:      citaRes.hora.slice(0, 5),
        cliente:   citaRes.clienteNombre,
        clienteId: citaRes.clienteId,
        servicio:  citaRes.servicioNombre,
        status:    "confirmada",
      };
      setCitas((p) => [...p, nueva]);
      addNotif({
        icon: "📅", color: "#9b6fb5",
        msg:  `Nueva cita: ${user?.nombre} — ${citaRes.servicioNombre} — ${citaRes.fecha} ${nueva.hora}`,
        time: "ahora",
      });
      setBookSlot(null);
      await cargarCitas();
    } catch (error) {
      addNotif({ icon: "❌", color: "#c0392b", msg: "Error al crear la cita", time: "ahora" });
    }
  };

  const handleCancel = async (cita) => {
    try {
      const response = await fetch(`${API_URL}/api/citas/${cita.id}`, {
        method: "DELETE",
        headers: apiHeaders(user.token),
      });
      
      if (response.ok) {
        setCitas((p) => p.filter((c) => c.id !== cita.id));
        addNotif({
          icon: "❌", color: "#c0392b",
          msg:  `Cita cancelada: ${cita.cliente} — ${cita.fecha} ${cita.hora}`,
          time: "ahora",
        });
      } else {
        addNotif({ icon: "❌", color: "#c0392b", msg: "No se pudo cancelar", time: "ahora" });
      }
    } catch (error) {
      addNotif({ icon: "❌", color: "#c0392b", msg: "Error de conexión", time: "ahora" });
    }
    setCancelCita(null);
  };

  const handleReagendar = async (cita, fecha, hora) => {
    try {
      const response = await fetch(`${API_URL}/api/citas/${cita.id}`, {
        method: "PUT",
        headers: apiHeaders(user.token),
        body: JSON.stringify({ fecha, hora }),
      });
      
      if (response.ok) {
        setCitas((p) => p.map((c) => 
          c.id === cita.id 
            ? { ...c, fecha, hora: hora.slice(0, 5) } 
            : c
        ));
        addNotif({
          icon: "🔄", color: "#c9a84c",
          msg:  `Cita reagendada: ${cita.cliente} → ${fecha} ${hora}`,
          time: "ahora",
        });
      } else {
        addNotif({ icon: "❌", color: "#c0392b", msg: "Error al reagendar", time: "ahora" });
      }
    } catch (error) {
      addNotif({ icon: "❌", color: "#c0392b", msg: "Error de conexión", time: "ahora" });
    }
    setReagendarCita(null);
  };

  if (error && citas.length === 0) {
    return (
      <div className="citas-page">
        <div className="error-message" style={{ textAlign: "center", padding: "2rem" }}>
          <p>Error: {error}</p>
          <button onClick={() => cargarCitas()} className="btn-primary">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="citas-page">
      <div className="sec-header" style={{ marginBottom: "1.4rem" }}>
        <h2 className="sec-title">Agenda de Citas</h2>
        {isAdmin && (
          <span style={{
            fontSize: ".76rem", background: "var(--purple-bg)",
            padding: "4px 11px", borderRadius: "50px",
            border: "1px solid var(--purple-light)", color: "var(--purple-dark)",
          }}>
            Vista Admin
          </span>
        )}
      </div>

      {loading && <div style={{ textAlign: "center", padding: "2rem" }}>Cargando citas...</div>}

      <div className="cal-wrap">
        <div className="cal-card">
          <div className="cal-head">
            <button className="cal-nav" onClick={prevM}>‹</button>
            <h2>{MONTHS[month]} {year}</h2>
            <button className="cal-nav" onClick={nextM}>›</button>
          </div>
          <div className="cal-grid">
            <div className="days-hdr">
              {DAYS_H.map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="days">
              {Array(firstDay).fill(null).map((_, i) => (
                <div key={`e${i}`} className="day empty" />
              ))}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const d = i + 1;
                const cls = [
                  "day",
                  isToday(d)  ? "today"  : "",
                  selDay === d ? "sel"   : "",
                  busyDays.has(d) && selDay !== d ? "has-ev" : "",
                  isPast(d)   ? "past"   : "",
                ].filter(Boolean).join(" ");
                return (
                  <div key={d} className={cls} onClick={() => !isPast(d) && setSelDay(d)}>
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="slots-card">
          <div className="slots-head">
            <h3>{selDay} de {MONTHS[month]}</h3>
            <p>{citasDay.length} cita{citasDay.length !== 1 ? "s" : ""} confirmada{citasDay.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="slots-list">
            {slots.map((sl) => (
              <div
                key={sl.hora}
                className={`slot${sl.booked ? " booked-slot" : " avail"}`}
                onClick={() => {
                  if (!sl.booked && user && !isPast(selDay)) setBookSlot(sl);
                }}
              >
                <span className="slot-t">{sl.hora}</span>
                <div className="slot-i">
                  {sl.booked ? (
                    isAdmin ? (
                      <>
                        <div className="slot-client">👤 {sl.cita?.cliente}</div>
                        <div className="slot-svc">{sl.cita?.servicio}</div>
                      </>
                    ) : sl.cita?.clienteId === user?.id ? (
                      <>
                        <div className="slot-client">✅ Tu cita</div>
                        <div className="slot-svc">{sl.cita?.servicio}</div>
                      </>
                    ) : (
                      <div className="slot-client" style={{ color: "var(--danger)", fontSize: ".75rem" }}>No disponible</div>
                    )
                  ) : (
                    <div style={{ color: "var(--success)", fontSize: ".75rem" }}>
                      {user ? (isPast(selDay) ? "Pasado" : "Disponible") : "Inicia sesión"}
                    </div>
                  )}
                </div>

                {sl.booked && sl.cita && canManage(sl.cita) && !isPast(selDay) && (
                  <div style={{ display: "flex", gap: "3px" }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn-reagendar" onClick={() => setReagendarCita(sl.cita)}>↩</button>
                    <button className="btn-cancel-slot" onClick={() => setCancelCita(sl.cita)}>✕</button>
                  </div>
                )}
                <span className={`slot-badge ${sl.booked ? "ocu" : "libre"}`}>{sl.booked ? "Ocupado" : "Libre"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {bookSlot && (
        <BookingModal
          slot={bookSlot}
          date={selDate}
          user={user}
          onBook={handleBook}
          onClose={() => setBookSlot(null)}
        />
      )}
      {cancelCita && (
        <CancelModal
          cita={cancelCita}
          onConfirm={() => handleCancel(cancelCita)}
          onClose={() => setCancelCita(null)}
        />
      )}
      {reagendarCita && (
        <ReagendarModal
          cita={reagendarCita}
          citas={citas}
          onConfirm={(f, h) => handleReagendar(reagendarCita, f, h)}
          onClose={() => setReagendarCita(null)}
        />
      )}
    </div>
  );
}
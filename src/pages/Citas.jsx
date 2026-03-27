import { useState, useEffect } from "react";
import { MONTHS, DAYS_H, WORK_H } from "../constants";
import BookingModal from "../components/BookingModal";
import CancelModal from "../components/CancelModal";
import ReagendarModal from "../components/ReagendarModal";
import API_URL from "../config/api";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function ds(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function apiHeaders(token: string) {
  return { 
    "Content-Type": "application/json", 
    "Authorization": `Bearer ${token}` 
  };
}

interface User {
  token: string;
  role: string;
  correo: string;
  nombre: string;
  id: string;
}

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  cliente: string;
  clienteId: string;
  servicio: string;
  status: string;
}

interface CitaResponse {
  id: string;
  fecha: string;
  hora: string;
  clienteNombre: string;
  clienteId: string;
  servicioNombre: string;
}

interface Props {
  user: User | null;
  addNotif: (notif: any) => void;
}

export default function Citas({ user, addNotif }: Props) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());
  const [citas, setCitas] = useState<Cita[]>([]);
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
      
      console.log("📡 Fetching citas for month:", mes);
      console.log("🔑 Token exists:", !!user.token);
      console.log("🔑 Token preview:", user.token.substring(0, 30) + "...");
      
      const response = await fetch(`${API_URL}/api/citas/mes?mes=${mes}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      console.log("📡 Response status:", response.status);
      
      if (response.status === 401) {
        console.error("❌ Token inválido o expirado");
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return;
      }
      
      if (response.status === 403) {
        console.error("❌ No tienes permisos para acceder a estas citas");
        setError("No tienes permisos para ver las citas");
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        setError(`Error ${response.status}: No se pudieron cargar las citas`);
        return;
      }
      
      const data: CitaResponse[] = await response.json();
      console.log("✅ Citas recibidas:", data.length);
      
      setCitas(data.map((c) => ({
        id:        c.id,
        fecha:     c.fecha,
        hora:      c.hora.slice(0, 5),
        cliente:   c.clienteNombre,
        clienteId: c.clienteId,
        servicio:  c.servicioNombre,
        status:    "confirmada",
      })));
      
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
      setError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  const [bookSlot, setBookSlot] = useState<any>(null);
  const [cancelCita, setCancelCita] = useState<Cita | null>(null);
  const [reagendarCita, setReagendarCita] = useState<Cita | null>(null);

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

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast = (d: number) =>
    new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const slots = WORK_H.map((h) => ({
    hora:   h,
    booked: !!citasDay.find((x) => x.hora === h),
    cita:   citasDay.find((x) => x.hora === h),
  }));

  const canManage = (cita: Cita) =>
    user?.role === "admin" || (user && cita.clienteId === user.id);

  /* ── Acciones ── */
  const handleBook = async (citaRes: any) => {
    try {
      const nueva: Cita = {
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
      console.error("Error al crear cita:", error);
      addNotif({
        icon: "❌", color: "#c0392b",
        msg:  "Error al crear la cita",
        time: "ahora",
      });
    }
  };

  const handleCancel = async (cita: Cita) => {
    try {
      const response = await fetch(`${API_URL}/api/citas/${cita.id}`, {
        method: "DELETE",
        headers: apiHeaders(user!.token),
      });
      
      if (response.ok) {
        setCitas((p) => p.filter((c) => c.id !== cita.id));
        addNotif({
          icon: "❌", color: "#c0392b",
          msg:  `Cita cancelada: ${cita.cliente} — ${cita.fecha} ${cita.hora}`,
          time: "ahora",
        });
      } else if (response.status === 403) {
        addNotif({
          icon: "⚠️", color: "#e67e22",
          msg:  "No tienes permiso para cancelar esta cita",
          time: "ahora",
        });
      } else {
        addNotif({
          icon: "❌", color: "#c0392b",
          msg:  "Error al cancelar la cita",
          time: "ahora",
        });
      }
    } catch (error) {
      console.error("Error cancelando cita:", error);
      addNotif({
        icon: "❌", color: "#c0392b",
        msg:  "Error de conexión al cancelar",
        time: "ahora",
      });
    }
    setCancelCita(null);
  };

  const handleReagendar = async (cita: Cita, fecha: string, hora: string) => {
    try {
      const response = await fetch(`${API_URL}/api/citas/${cita.id}`, {
        method: "PUT",
        headers: apiHeaders(user!.token),
        body: JSON.stringify({ fecha, hora }),
      });
      
      if (response.ok) {
        const citaActualizada = await response.json();
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
        const errorData = await response.json();
        addNotif({
          icon: "❌", color: "#c0392b",
          msg:  errorData || "Error al reagendar la cita",
          time: "ahora",
        });
      }
    } catch (error) {
      console.error("Error reagendando cita:", error);
      addNotif({
        icon: "❌", color: "#c0392b",
        msg:  "Error de conexión al reagendar",
        time: "ahora",
      });
    }
    setReagendarCita(null);
  };

  // Mostrar error si existe
  if (error && citas.length === 0) {
    return (
      <div className="citas-page">
        <div className="error-message" style={{ textAlign: "center", padding: "2rem" }}>
          <p>Error: {error}</p>
          <button onClick={() => cargarCitas()} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="citas-page">
      <div className="sec-header" style={{ marginBottom: "1.4rem" }}>
        <h2 className="sec-title">Agenda de Citas</h2>
        {user?.role === "admin" && (
          <span style={{
            fontSize: ".76rem", background: "var(--purple-bg)",
            padding: "4px 11px", borderRadius: "50px",
            border: "1px solid var(--purple-light)", color: "var(--purple-dark)",
          }}>
            Vista Admin
          </span>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Cargando citas...
        </div>
      )}

      <div className="cal-wrap">
        {/* ── Calendario ── */}
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

        {/* ── Slots ── */}
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
                    user?.role === "admin" ? (
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
                      <div className="slot-client" style={{ color: "var(--danger)", fontSize: ".75rem" }}>
                        No disponible
                      </div>
                    )
                  ) : (
                    <div style={{ color: "var(--success)", fontSize: ".75rem" }}>
                      {user
                        ? isPast(selDay)
                          ? "Pasado"
                          : "Disponible · clic para reservar"
                        : "Inicia sesión para reservar"}
                    </div>
                  )}
                </div>

                {sl.booked && sl.cita && canManage(sl.cita) && !isPast(selDay) && (
                  <div style={{ display: "flex", gap: "3px" }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn-reagendar" onClick={() => setReagendarCita(sl.cita!)}>
                      ↩ Reagendar
                    </button>
                    <button className="btn-cancel-slot" onClick={() => setCancelCita(sl.cita!)}>
                      ✕
                    </button>
                  </div>
                )}

                <span className={`slot-badge ${sl.booked ? "ocu" : "libre"}`}>
                  {sl.booked ? "Ocupado" : "Libre"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modales ── */}
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
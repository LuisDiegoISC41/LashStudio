import { useState } from "react";
import API_URL from "../config/api";
export default function RegisterModal({ onClose, onLogin }) {
  const [form, setForm] = useState({
    nombre: "", ap: "", am: "", tel: "", correo: "", pass: "", confirm: "",
  });
  const [err,  setErr]  = useState("");
  const [load, setLoad] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.pass !== form.confirm) { setErr("Las contraseñas no coinciden."); return; }
    if (form.pass.length < 6)       { setErr("Mínimo 6 caracteres.");          return; }
    setLoad(true);
    try {
      const res = await fetch(`${API_URL}/api/clientes/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:          form.nombre,
          apellidoPaterno: form.ap,
          apellidoMaterno: form.am,
          telefono:        form.tel,
          correo:          form.correo,
          password:        form.pass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data === "string" ? data : "Error al registrar.");
        return;
      }
      // Auto-login para obtener el JWT
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: form.correo, password: form.pass }),
      });
      const loginData = await loginRes.json();
      onLogin(loginData);
    } catch {
      setErr("No se pudo conectar al servidor.");
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 450 }}>
        <div className="modal-logo">
          <h2>Lash Studio</h2>
          <p>Crea tu cuenta de cliente</p>
        </div>

        {err && <div className="err">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label>Nombre</label>
            <input required value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Ap. Paterno</label>
              <input value={form.ap} onChange={(e) => set("ap", e.target.value)} />
            </div>
            <div className="fg">
              <label>Ap. Materno</label>
              <input value={form.am} onChange={(e) => set("am", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Teléfono</label>
              <input maxLength={10} value={form.tel} onChange={(e) => set("tel", e.target.value)} />
            </div>
            <div className="fg">
              <label>Correo</label>
              <input type="email" required value={form.correo} onChange={(e) => set("correo", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="fg">
              <label>Contraseña</label>
              <input type="password" required value={form.pass} onChange={(e) => set("pass", e.target.value)} />
            </div>
            <div className="fg">
              <label>Confirmar</label>
              <input type="password" required value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={load}>
              {load ? "Registrando..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function LoginModal({ onClose, onLogin }) {
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);

  const sub = async (e) => {
    e.preventDefault();
    setErr("");
    setLoad(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data === "string" ? data : "Correo o contraseña incorrectos.");
      } else {
        onLogin(data);
      }
    } catch {
      setErr("No se pudo conectar al servidor.");
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-logo">
          <h2>Lash Studio</h2>
          <p>Inicia sesión en tu cuenta</p>
        </div>
        {err && <div className="err">{err}</div>}
        <form onSubmit={sub}>
          <div className="fg"><label>Correo</label><input type="email" required autoFocus value={correo} onChange={e => setCorreo(e.target.value)} /></div>
          <div className="fg"><label>Contraseña</label><input type="password" required value={pass} onChange={e => setPass(e.target.value)} /></div>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={load}>{load ? "Entrando..." : "Iniciar sesión"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

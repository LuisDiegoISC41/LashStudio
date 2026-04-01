import { useState } from "react";
import API_URL from "../config/api";

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
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password: pass }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErr(typeof data === "string" ? data : "Correo o contraseña incorrectos.");
      } else {
        // ✅ Verificar la estructura de data
        console.log("📦 Respuesta del backend:", data);
        
        // Asegurar que el objeto user tenga la estructura correcta
        const userData = {
          token: data.token || data.accessToken,
          role: (data.role || data.rol || "CLIENTE").toUpperCase(),
          nombre: data.nombre || "Usuario",
          apellidoPaterno: data.apellidoPaterno || data.Apellido_Paterno || "",
          apellidoMaterno: data.apellidoMaterno || data.Apellido_Materno || "",
          telefono: data.telefono || data.Telefono || "",
          correo: data.correo || "",
          id: data.id || data.ID_Admin || data.ID_Cliente
        };

        console.log("👤 UserData FINAL a guardar:", userData);
        
        if (!userData.token) {
          console.error("⚠️ No se recibió token del backend");
          setErr("Error de autenticación: no se recibió token");
        } else {
          onLogin(userData);
        }
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
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
          <div className="fg">
            <label>Correo</label>
            <input type="email" required autoFocus value={correo} onChange={e => setCorreo(e.target.value)} />
          </div>
          <div className="fg">
            <label>Contraseña</label>
            <input type="password" required value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={load}>
              {load ? "Entrando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
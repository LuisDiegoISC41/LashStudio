import { useState } from "react";
import API_URL from "../config/api";

export default function LoginModal({ onClose, onLogin }) {
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
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
          <div className="fg" style={{ position: 'relative' }}>
            <label>Contraseña</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              style={{
                position: 'absolute',
                right: '0.8rem',
                top: '27px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--purple-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                padding: 0,
              }}
              aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPass ? (

                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 12C3.32309 8.262 7.30558 5.5 12 5.5C16.6944 5.5 20.6769 8.262 22.5 12C20.6769 15.738 16.6944 18.5 12 18.5C7.30558 18.5 3.32309 15.738 1.5 12Z" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 6.5C7.30558 6.5 3.32309 9.262 1.5 13C3.32309 16.738 7.30558 19.5 12 19.5C16.6944 19.5 20.6769 16.738 22.5 13C20.6769 9.262 16.6944 6.5 12 6.5ZM12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
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
import { useState } from "react";
import API_URL from "../config/api";

export default function EditPerfilModal({ form, setForm, user, onClose }) {
  const [local, setLocal] = useState({ ...form, password: "" });
  const [saved, setSaved] = useState(false);
  const [err,   setErr]   = useState("");
  const [load,  setLoad]  = useState(false);

  const set = (k, v) => setLocal((f) => ({ ...f, [k]: v }));

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoad(true);
    try {
      const ruta = isAdmin ? "admins" : "clientes";
      const payload = {
        nombre: local.nombre,
        apellidoPaterno: local.apellidoPaterno,
        apellidoMaterno: local.apellidoMaterno,
        correo: local.correo,
      };

      if (!isAdmin) payload.telefono = local.telefono;
      if (local.password && local.password.trim() !== "") payload.password = local.password;

      const res = await fetch(`${API_URL}/api/${ruta}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setErr((errData && errData.message) || "No se pudo guardar.");
        return;
      }

      const updated = await res.json();
      setForm((prev) => ({
        ...prev,
        nombre: updated.nombre || local.nombre,
        apellidoPaterno: updated.apellidoPaterno || local.apellidoPaterno,
        apellidoMaterno: updated.apellidoMaterno || local.apellidoMaterno,
        correo: updated.correo || local.correo,
        telefono: updated.telefono || local.telefono,
      }));

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
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
            Editar Perfil
          </h2>
          <p>Actualiza tus datos personales</p>
        </div>

        {saved && <div className="ok">✅ Perfil actualizado correctamente</div>}
        {err   && <div className="err">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label>Nombre completo</label>
            <input
              required
              value={local.nombre}
              onChange={(e) => set("nombre", e.target.value)}
            />
          </div>
          <div className="fg">
            <label>Apellido Paterno</label>
            <input
              required
              value={local.apellidoPaterno}
              onChange={(e) => set("apellidoPaterno", e.target.value)}
            />
          </div>
          <div className="fg">
            <label>Apellido Materno</label>
            <input
              required
              value={local.apellidoMaterno}
              onChange={(e) => set("apellidoMaterno", e.target.value)}
            />
          </div>
          {!isAdmin && (
            <div className="fg">
              <label>Teléfono</label>
              <input
                maxLength={10}
                value={local.telefono}
                onChange={(e) => set("telefono", e.target.value)}
              />
            </div>
          )}

          <div className="fg">
            <label>Correo electrónico</label>
            <input
              type="email" required
              value={local.correo}
              onChange={(e) => set("correo", e.target.value)}
            />
          </div>
          <div className="fg">
            <label>
              Nueva contraseña{" "}
              <small style={{ color: "var(--gray)" }}>(opcional)</small>
            </label>
            <input
              type="password"
              placeholder="Dejar vacío para no cambiar"
              value={local.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={load}>
              {load ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

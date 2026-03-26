import { useState } from "react";

export default function EditPerfilModal({ form, setForm, user, onClose }) {
  const [local, setLocal] = useState({ ...form, password: "" });
  const [saved, setSaved] = useState(false);
  const [err,   setErr]   = useState("");
  const [load,  setLoad]  = useState(false);

  const set = (k, v) => setLocal((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoad(true);
    try {
      const res = await fetch(`http://localhost:8080/api/clientes/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          nombre:   local.nombre,
          apellidoPaterno: local.apellidoPaterno,
          apellidoMaterno: local.apellidoMaterno,
          telefono: local.telefono,
          correo:   local.correo,
          password: local.password || null,
        }),
      });
      if (!res.ok) { setErr("No se pudo guardar."); return; }
      setForm((prev) => ({
        ...prev,
        nombre: local.nombre,
        apellidoPaterno: local.apellidoPaterno,
        apellidoMaterno: local.apellidoMaterno,
        telefono: local.telefono,
        correo: local.correo,
      }));
      setTimeout(onClose, 900);
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
          <div className="fg">
            <label>Teléfono</label>
            <input
              maxLength={10}
              value={local.telefono}
              onChange={(e) => set("telefono", e.target.value)}
            />
          </div>
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

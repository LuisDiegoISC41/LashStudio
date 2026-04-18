// ServiceModal.tsx - SE MANTIENE IGUAL
import { useState } from "react";
import API_URL from "../config/api";

export default function ServiceModal({ service, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre:      service.nombre      || "",
    descripcion: service.descripcion || "",
    precio:      service.precio      || "",
    imagen:      null, // Para el archivo de imagen
  });
  const [preview, setPreview] = useState(service.imagen ? `${API_URL}/uploads/${service.imagen}` : null);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErr("Solo se permiten archivos de imagen.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErr("La imagen no puede ser mayor a 5MB.");
        return;
      }
      setForm((f) => ({ ...f, imagen: file }));
      setPreview(URL.createObjectURL(file));
      setErr("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim())              { setErr("El nombre es requerido."); return; }
    if (form.precio === "" || form.precio < 0) { setErr("Precio inválido.");  return; }
    
    // Crear FormData para enviar archivo
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion);
    formData.append('precio', form.precio);
    if (form.imagen) {
      formData.append('imagen', form.imagen);
    }
    
    onSave({ ...service, formData });
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-logo">
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400 }}>
            {service.id ? "Editar Servicio" : "Nuevo Servicio"}
          </h2>
          <p>Información del servicio</p>
        </div>

        {err && <div className="err">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label>Nombre del servicio</label>
            <input
              required
              placeholder="Ej: Classic Lashes"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
            />
          </div>
          <div className="fg">
            <label>Descripción</label>
            <textarea
              placeholder="Describe el servicio..."
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
            />
          </div>
          <div className="fg">
            <label>Precio (MXN)</label>
            <input
              type="number" min="0" required
              placeholder="0"
              value={form.precio}
              onChange={(e) => set("precio", e.target.value)}
            />
          </div>
          <div className="fg">
            <label>Imagen del servicio</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <div style={{ marginTop: '0.5rem' }}>
                <img 
                  src={preview} 
                  alt="Vista previa" 
                  style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px' }} 
                />
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {service.id ? "Guardar cambios" : "Agregar servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
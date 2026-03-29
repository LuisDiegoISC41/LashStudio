import { useState, useEffect } from "react";
import { ICONS } from "../constants";
import ServiceModal from "../components/ServiceModal";
import API_URL from "../config/api";

export default function Home({ user }) {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Normalizamos la validación del ADMIN para que no falle por mayúsculas
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/servicios`);
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setError("Error al cargar servicios");
      }
    } catch (error) {
      setError("Error de conexión al servidor");
      console.error("Error cargando servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    if (!user?.token) return;

    try {
      const url = data.id 
        ? `${API_URL}/api/servicios/${data.id}`
        : `${API_URL}/api/servicios`;
      
      const method = data.id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio
        })
      });

      if (response.ok) {
        await cargarServicios();
        setModal(null);
        setError("");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al guardar el servicio");
      }
    } catch (error) {
      console.error("Error guardando servicio:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!user?.token || !confirm("¿Eliminar este servicio?")) return;
    
    try {
      const response = await fetch(`${API_URL}/api/servicios/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        await cargarServicios();
      } else {
        alert("Error al eliminar el servicio");
      }
    } catch (error) {
      console.error("Error eliminando servicio:", error);
    }
  };

  return (
    <>
      {/* Mensaje de error tipo Banner (No bloqueante) */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', textAlign: 'center', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="hero">
        <p className="eyebrow">✦ Estudio profesional de pestañas ✦</p>
        <h1 className="hero-title">
          Eleva tu mirada,<br />
          <em>transforma tu estilo</em>
        </h1>
        <p className="hero-sub">
          Extensiones y tratamientos con los más altos estándares de calidad
        </p>
      </div>

      <div className="section">
        <div className="sec-header">
          <h2 className="sec-title">Nuestros Servicios</h2>
          
          {/* ✅ CORRECCIÓN: Botón "Nuevo Servicio" visible para Miriam */}
          {isAdmin && (
            <button className="btn-add" onClick={() => setModal({})}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Nuevo Servicio
            </button>
          )}
        </div>

        {loading && services.length === 0 && (
          <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>Cargando servicios...</div>
        )}

        {services.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "var(--gray)", padding: "2rem" }}>
            No hay servicios disponibles.
          </p>
        )}

        <div className="grid">
          {services.map((s, i) => (
            <div key={s.id || i} className="card">
              <div className="card-accent" />
              <div className="card-body">
                <div className="s-icon">{ICONS[i % ICONS.length]}</div>
                <div className="s-name">{s.nombre}</div>
                <div className="s-desc">{s.descripcion}</div>
                <div className="s-price">
                  ${Number(s.precio).toLocaleString("es-MX")} <small>MXN</small>
                </div>
              </div>

              {/* ✅ CORRECCIÓN: Botones de Editar/Eliminar para Miriam */}
              {isAdmin && (
                <div className="card-actions">
                  <button className="btn-edit" onClick={() => setModal(s)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-del" onClick={() => handleDelete(s.id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {modal !== null && (
        <ServiceModal
          service={modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
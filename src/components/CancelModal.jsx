export default function CancelModal({ cita, onConfirm, onClose }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-logo">
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400 }}>
            Cancelar Cita
          </h2>
          <p>Esta acción no se puede deshacer</p>
        </div>

        <div className="confirm-danger">
          <p>¿Cancelar la cita de <strong>{cita.cliente}</strong>?</p>
          <small>{cita.servicio} · {cita.fecha} · {cita.hora} hrs</small>
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>
            No, mantener
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Sí, cancelar cita
          </button>
        </div>
      </div>
    </div>
  );
}

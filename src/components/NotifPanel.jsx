export default function NotifPanel({ notifs, setNotifs, onClose }) {
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  return (
    <div className="notif-panel">
      <div className="notif-panel-head">
        <h4>Notificaciones</h4>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", fontSize: ".7rem", cursor: "pointer" }}
            onClick={markAll}
          >
            Marcar leídas
          </button>
          <button className="notif-close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="notif-list">
        {notifs.map(n => (
          <div
            key={n.id}
            className={`notif-item${n.read ? "" : " unread"}`}
            onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
          >
            <div className="notif-icon" style={{ background: `${n.color}18` }}>{n.icon}</div>
            <div className="notif-text">
              <div className="notif-msg">{n.msg}</div>
              <div className="notif-time">{n.time}</div>
            </div>
            {!n.read && <div className="notif-unread-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}

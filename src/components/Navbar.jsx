export default function Navbar({ page, setPage, user, onLogin, onRegister, onLogout, notifs, showNotifs, setShowNotifs }) {
  const unread = notifs.filter(n => !n.read).length;
  const pages = [
    ["home", "Inicio"],
    ["citas", "Agenda"],
    ["dashboard", "Dashboard"],
    ...(user?.role === "admin" ? [["clientes", "Clientes"]] : []),
    ...(user ? [["perfil", "Mi Perfil"]] : []),
  ];

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo" onClick={() => setPage("home")}>
          <div className="logo-icon">
            <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
              <path d="M1 13 Q5 3 11 5 Q15 6 21 1" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M5 12 Q7 6 11 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 11 Q9.5 7 11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 10 Q12.5 7 14.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14.5 8 Q16.5 5 18.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="logo-text">Lash Studio</div>
            <div className="logo-sub">by Miryam González</div>
          </div>
        </div>

        <div className="nav-links">
          {pages.map(([k, l]) => (
            <button key={k} className={`nav-btn${page === k ? " active" : ""}`} onClick={() => setPage(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="nav-right">
        {user && (
          <button className="notif-btn" onClick={() => setShowNotifs(v => !v)}>
            🔔{unread > 0 && <span className="notif-dot" />}
          </button>
        )}
        {user ? (
          <>
            <div className="user-chip">
              {user.nombre.split(" ")[0]}
              <span className="badge">{user.role === "admin" ? "Admin" : "Cliente"}</span>
            </div>
            <button className="btn-logout" onClick={onLogout}>Salir</button>
          </>
        ) : (
          <>
            <button className="btn-outline" onClick={onLogin}>Iniciar sesión</button>
            <button className="btn-primary" onClick={onRegister}>Registrarse</button>
          </>
        )}
      </div>
    </nav>
  );
}

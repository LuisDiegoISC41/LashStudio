import { useState } from 'react';

export default function Navbar({ page, setPage, user, onLogin, onRegister, onLogout, notifs, showNotifs, setShowNotifs }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const unread = notifs.filter(n => !n.read).length;

  // ✅ CORRECCIÓN 1: Normalizamos el rol a minúsculas para la comparación
  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === "admin";

  const pages = [
    ["home", "Inicio"],
    ["citas", "Agenda"],
    ...(isAdmin ? [["dashboard", "Dashboard"]] : []), // ✅ Ahora sí entrará aquí
    ...(isAdmin ? [["clientes", "Clientes"]] : []),
    ...(user ? [["perfil", "Mi Perfil"]] : []),
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePageChange = (pageKey) => {
    setPage(pageKey);
    setIsMenuOpen(false); 
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo" onClick={() => handlePageChange("home")}>
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

        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menú de navegación"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {pages.map(([k, l]) => (
            <button 
              key={k} 
              className={`nav-btn${page === k ? " active" : ""}`} 
              onClick={() => handlePageChange(k)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="nav-right">
        {user && (
          <button className="notif-btn" onClick={() => setShowNotifs(v => !v)} aria-label="Notificaciones">
            🔔{unread > 0 && <span className="notif-dot" />}
          </button>
        )}
        {user ? (
          <>
            <div className="user-chip">
              <span className="user-name">{user.nombre.split(" ")[0]}</span>
              {/* ✅ CORRECCIÓN 2: Usamos la constante isAdmin para mostrar el Badge correcto */}
              <span className="badge">{isAdmin ? "Admin" : "Cliente"}</span>
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
import { useState, useEffect, useRef } from "react";
import Navbar        from "./components/Navbar";
import NotifPanel    from "./components/NotifPanel";
import LoginModal    from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import Home          from "./pages/Home";
import Dashboard     from "./pages/Dashboard";
import Citas         from "./pages/Citas";
import Clientes      from "./pages/Clientes";
import Perfil        from "./pages/Perfil";
import { INIT_NOTIFS } from "./constants";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(INIT_NOTIFS);
  const ref = useRef(null);

  const addNotif = (n) =>
    setNotifs((p) => [{ id: Date.now().toString(), ...n, read: false }, ...p]);

  const handleLogin = (u) => {
    console.log("✅ Login exitoso, usuario:", u);
    setUser(u);
    setShowLogin(false);
    setShowReg(false);
    addNotif({ 
      icon: "👋", 
      color: "#27ae60", 
      msg: `Bienvenida, ${u.nombre?.split(" ")[0] || u.correo?.split("@")[0]}!`, 
      time: "ahora" 
    });
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
    setShowNotifs(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ Recuperar sesión al cargar la app
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log("🔄 Sesión recuperada:", userData);
        setUser(userData);
      } catch (e) {
        console.error("Error al recuperar sesión:", e);
      }
    }
  }, []);

  // Close notif panel on outside click
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref}>
      <Navbar
        page={page} setPage={setPage} user={user}
        onLogin={() => setShowLogin(true)} onRegister={() => setShowReg(true)} onLogout={handleLogout}
        notifs={notifs} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
      />
      {showNotifs && <NotifPanel notifs={notifs} setNotifs={setNotifs} onClose={() => setShowNotifs(false)} />}

      <main className="main">
        {page === "home"      && <Home user={user} />}
        {page === "citas"     && <Citas user={user} addNotif={addNotif} />}
        {page === "dashboard" && user?.role === "admin" && <Dashboard user={user}/>}
        {page === "clientes"  && user?.role === "admin" && <Clientes user={user} />}
        {page === "perfil"    && user  && <Perfil user={user} />}
        {page === "perfil"    && !user && <div style={{ textAlign: "center", padding: "4rem", color: "var(--gray)" }}>Inicia sesión para ver tu perfil.</div>}
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      {showReg   && <RegisterModal onClose={() => setShowReg(false)} onLogin={handleLogin} />}
    </div>
  );
}
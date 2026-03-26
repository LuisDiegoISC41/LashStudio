export const MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
export const DAYS_H = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
export const WORK_H = ["09:00","10:00","11:00","12:00","13:00","14:00","16:00","17:00","18:00","19:00"];
export const ICONS = ["✨","👁️","💫","🌿","💎","⭐"];

export function pad(n) { return String(n).padStart(2, "0"); }
export function ds(y, m, d) { return `${y}-${pad(m+1)}-${pad(d)}`; }

export const MOCK_USERS = [
  { correo: "admin@lashstudio.com", password: "admin123", role: "admin", nombre: "Miryam González", id: "admin-1" },
  { correo: "sofia@mail.com",       password: "sofia123", role: "cliente", nombre: "Sofía Ramírez", id: "c1" },
  { correo: "test@mail.com",        password: "test123",  role: "cliente", nombre: "Cliente Demo",  id: "c99" },
];

export const INIT_SERVICES = [
  { id: "1", nombre: "Classic Lashes",    descripcion: "Extensiones clásicas, una por pestaña natural. Resultado elegante y sutil.", precio: 550 },
  { id: "2", nombre: "Volume Lashes",     descripcion: "Volumen ruso con micro abanicos. Efecto dramático y lleno.",                  precio: 750 },
  { id: "3", nombre: "Mega Volume",       descripcion: "Máximo volumen con abanicos de 6-16 ext. Ultra glamuroso.",                   precio: 950 },
  { id: "4", nombre: "Lash Lift & Tint",  descripcion: "Permanente y tinte sin extensiones. Curvado y oscurecido natural.",           precio: 400 },
  { id: "5", nombre: "Retoque 2 Semanas", descripcion: "Relleno a las 2-3 semanas para mantener tu mirada perfecta.",                precio: 350 },
  { id: "6", nombre: "Retoque 3 Semanas", descripcion: "Relleno a las 3-4 semanas. Look siempre renovado.",                          precio: 450 },
];

export const INIT_CITAS = [
  { id: "a1", fecha: "2025-03-24", hora: "10:00", cliente: "Sofía Ramírez",  clienteId: "c1",  servicio: "Classic Lashes",    status: "confirmada" },
  { id: "a2", fecha: "2025-03-24", hora: "12:00", cliente: "Fernanda López", clienteId: "c2",  servicio: "Volume Lashes",     status: "confirmada" },
  { id: "a3", fecha: "2025-03-26", hora: "11:00", cliente: "Valeria Torres", clienteId: "c3",  servicio: "Lash Lift & Tint",  status: "confirmada" },
  { id: "a4", fecha: "2025-03-28", hora: "16:00", cliente: "Ana Pérez",      clienteId: "c4",  servicio: "Retoque 2 Semanas", status: "confirmada" },
  { id: "a5", fecha: "2025-03-20", hora: "10:00", cliente: "Sofía Ramírez",  clienteId: "c1",  servicio: "Volume Lashes",     status: "completada" },
  { id: "a6", fecha: "2025-03-10", hora: "14:00", cliente: "Sofía Ramírez",  clienteId: "c1",  servicio: "Classic Lashes",    status: "completada" },
];

export const INIT_NOTIFS = [
  { id: "n1", msg: "Nueva cita: Sofía Ramírez — Classic Lashes — 24 Mar 10:00", time: "hace 2h",  read: false, icon: "📅", color: "#9b6fb5" },
  { id: "n2", msg: "Recordatorio: Cita con Fernanda López mañana a las 12:00",  time: "hace 5h",  read: false, icon: "🔔", color: "#c9a84c" },
  { id: "n3", msg: "Valeria Torres canceló su cita del 26 Mar",                  time: "ayer",     read: true,  icon: "❌", color: "#c0392b" },
  { id: "n4", msg: "Pago recibido de Ana Pérez — $350",                          time: "ayer",     read: true,  icon: "💳", color: "#27ae60" },
];

export const CLIENTES_DATA = [
  { id: "c1", nombre: "Sofía",    ap: "Ramírez",  am: "Vega",    tel: "4421234567", correo: "sofia@mail.com",     citas: 8 },
  { id: "c2", nombre: "Fernanda", ap: "López",    am: "Cruz",    tel: "4429876543", correo: "fernanda@mail.com",  citas: 5 },
  { id: "c3", nombre: "Valeria",  ap: "Torres",   am: "Díaz",    tel: "4421112233", correo: "valeria@mail.com",   citas: 3 },
  { id: "c4", nombre: "Ana",      ap: "Pérez",    am: "Morales", tel: "4425556677", correo: "ana@mail.com",       citas: 6 },
  { id: "c5", nombre: "Gabriela", ap: "Martínez", am: "Soto",    tel: "4423344556", correo: "gabriela@mail.com",  citas: 2 },
];

export const MONTHLY_INCOME = [18200,22400,19800,25600,21300,28900,24500,31200,27800,29400,33100,35600];

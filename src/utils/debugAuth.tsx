// src/utils/debugAuth.ts
export const debugAuth = async (token: string) => {
  console.log("=== DEBUG DE AUTENTICACIÓN ===");

  // 1. Probar endpoint público
  try {
    const publicRes = await fetch(
      "https://lashstudio-backend.onrender.com/api/debug/public-test",
    );
    const publicData = await publicRes.json();
    console.log("✅ Endpoint público funciona:", publicData);
  } catch (err) {
    console.error("❌ Error en endpoint público:", err);
  }

  // 2. Probar endpoint protegido
  console.log(
    "Token a probar:",
    token ? `${token.substring(0, 50)}...` : "NO HAY TOKEN",
  );

  try {
    const authRes = await fetch(
      "https://lashstudio-backend.onrender.com/api/debug/auth-check",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Status code:", authRes.status);

    if (authRes.ok) {
      const data = await authRes.json();
      console.log("✅ Autenticación exitosa:", data);
    } else {
      const error = await authRes.text();
      console.error("❌ Autenticación fallida:", authRes.status, error);
    }
  } catch (err) {
    console.error("❌ Error de red:", err);
  }

  // 3. Decodificar el token para ver su contenido
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("📦 Contenido del token:");
      console.log("   - Usuario:", payload.sub);
      console.log("   - Roles:", payload.roles);
      console.log(
        "   - Expira:",
        new Date(payload.exp * 1000).toLocaleString(),
      );
      console.log("   - Ahora:", new Date().toLocaleString());
      console.log("   - ¿Expirado?", payload.exp * 1000 < Date.now());
    } catch (err) {
      console.error("❌ Error decodificando token:", err);
    }
  }
};

// Exportar para usar en cualquier componente

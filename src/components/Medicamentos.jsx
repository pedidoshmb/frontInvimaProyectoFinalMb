import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const Medicamentos = () => {
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);

  const buscarMedicamentos = async (query) => {
    try {
      setCargando(true);
      setError(null);

      // Sintaxis correcta para la API de datos.gov.co
      const url = `https://www.datos.gov.co/resource/i7cb-raxc.json?$where=starts_with(lower(producto), lower('${encodeURIComponent(
        query
      )}'))&$limit=1000`;

      const response = await fetch(url);

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();

      // Agrupa medicamentos por nombre de producto
      const agrupados = data.reduce((acc, med) => {
        const key = med.producto?.trim() || "Sin nombre";
        if (!acc[key]) acc[key] = [];
        acc[key].push(med);
        return acc;
      }, {});

      setMedicamentos(Object.entries(agrupados));
    } catch (err) {
      setError(`Error al buscar: ${err.message}`);
      console.error("Detalles:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.length >= 3) buscarMedicamentos(busqueda);
      else setMedicamentos([]);
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  // nueva función para integrar a MongoDB
  console.log(medicamentos);
  const integrarProducto = async (med) => {
    try {
      const response = await fetch("http://127.0.0.1:3006/api/invima/guardar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrosanitario: med.registrosanitario,
          expediente: med.expediente,
          descripcioncomercial: med.descripcioncomercial,
          consecutivocum: med.consecutivocum,
          estadocum: med.estadocum,
          producto: med.producto,
        }),
      });

      const data = await response.json();
      alert(data.mensaje || "Guardado");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar en MongoDB");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>CONSULTA DE MEDICAMENTOS INVIMA</h2>

      <button
        onClick={() => navigate("/admin/medicamentos")}
        style={styles.backButton}
      >
        AdminMedicamentos
      </button>

      <input
        type="text"
        placeholder="Buscar por nombre (mín. 3 caracteres)..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={styles.searchInput}
      />

      {cargando && <p style={styles.loading}>Buscando...</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.results}>
        {medicamentos.map(([nombre, registros], index) => (
          <div key={`${nombre}-${index}`} style={styles.productGroup}>
            <h3 style={styles.productName}>{nombre}</h3>
            <div style={styles.registrosContainer}>
              {registros.map((med, index) => (
                <div
                  key={`${med.registrosanitario}-${index}`}
                  style={styles.registro}
                >
                  <p>
                    <strong>Registro:</strong> {med.registrosanitario}
                  </p>
                  <p>
                    <strong>Expediente:</strong> {med.expediente}
                  </p>
                  <p>
                    <strong>Presentación:</strong> {med.descripcioncomercial}
                  </p>
                  <p>
                    <strong>ConsecutivoCum:</strong> {med.consecutivocum}
                  </p>
                  <p>
                    <strong>Estado:</strong> {med.estadocum}
                    <br></br>
                    <br></br>
                    <button
                      style={{ marginLeft: "20px" }}
                      onClick={() => integrarProducto(med)}
                    >
                      Guardar En MONGODB
                    </button>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estilos (igual que en la solución anterior)
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  },
  title: {
    color: "#2c3e50",
    fontSize: "2rem",
    margin: 0,
    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
  },
  searchContainer: {
    display: "flex",
    marginBottom: "25px",
    gap: "10px",
  },
  searchInput: {
    flex: 1,
    padding: "12px 15px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    "&:focus": {
      outline: "none",
      borderColor: "#3498db",
      boxShadow: "0 2px 8px rgba(52,152,219,0.2)",
    },
  },
  searchButton: {
    padding: "12px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#2980b9",
      transform: "translateY(-2px)",
    },
  },
  adminButton: {
    padding: "12px 20px",
    backgroundColor: "#2c3e50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#1a252f",
      transform: "translateY(-2px)",
    },
  },
  loading: {
    textAlign: "center",
    color: "#3498db",
    fontSize: "18px",
    padding: "20px",
  },
  error: {
    color: "#e74c3c",
    backgroundColor: "#fde8e8",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  },
  results: {
    display: "grid",
    gap: "20px",
  },
  productGroup: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
    },
  },
  productName: {
    color: "#2980b9",
    marginTop: 0,
    marginBottom: "15px",
    fontSize: "1.5rem",
    borderBottom: "2px solid #eee",
    paddingBottom: "10px",
  },
  registrosContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "15px",
    marginTop: "15px",
  },
  registro: {
    backgroundColor: "#f8fafc",
    padding: "15px",
    borderRadius: "8px",
    borderLeft: "4px solid #3498db",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#f1f8fe",
    },
  },
  integrateButton: {
    padding: "10px 20px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "15px",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 5px rgba(39, 174, 96, 0.3)",
    border: "2px solid #219653",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    "&:hover": {
      backgroundColor: "#219653",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(39, 174, 96, 0.4)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
};

export default Medicamentos;

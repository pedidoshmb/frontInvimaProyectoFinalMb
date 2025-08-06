import React, { useState, useEffect } from "react";

const Medicamentos = () => {
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
      console.log(medicamentos);
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
    }, 200);

    return () => clearTimeout(timer);
  }, [busqueda]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>CONSULTA DE MEDICAMENTOS INVIMA</h2>

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
                    <button
                      style={{ marginLeft: "20px" }}
                      onClick={() => integrarProducto(med)}
                    >
                      Integrar a MONGODB
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
  /* ... */
};

export default Medicamentos;

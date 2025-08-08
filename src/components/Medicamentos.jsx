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
    } catch (err) {
      setError(`Error al buscar: ${err.message}`);
      console.error("Detalles:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.length >= 6) buscarMedicamentos(busqueda);
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

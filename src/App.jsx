//require("dotenv").config();
import React from "react";
import Medicamentos from "./components/Medicamentos";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>
        Consumo de API con React + Vite - Expediente- 20048021-45821-20163993-
      </h1>
      <Medicamentos />
    </div>
  );
}

export default App;

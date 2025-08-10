import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Medicamentos from "./components/Medicamentos";
import AdminMedicamentos from "./components/AdminMedicamentos";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <h1></h1>
        <Routes>
          <Route path="/" element={<Medicamentos />} />
          <Route path="/admin/medicamentos" element={<AdminMedicamentos />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

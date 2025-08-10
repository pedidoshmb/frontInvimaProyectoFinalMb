import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Modal,
  Button,
  Form,
  Table,
  Spinner,
  Alert,
  InputGroup,
} from "react-bootstrap";

const AdminMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const buscarMedicamentos = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await axios.get(`http://localhost:3006/api/invima`);
      let datos = response.data;

      if (busqueda.trim() !== "") {
        datos = datos.filter((med) =>
          med.producto?.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      setMedicamentos(datos);
    } catch (err) {
      setError(
        `Error al buscar: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setCargando(false);
    }
  };

  const eliminarMedicamento = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3006/api/invima/${id}`);
          buscarMedicamentos();
          Swal.fire({
            title: "Eliminado",
            text: "El medicamento ha sido eliminado con éxito",
            icon: "success",
            confirmButtonColor: "#28a745",
          });
        } catch (err) {
          Swal.fire({
            title: "Error",
            text: `No se pudo eliminar: ${
              err.response?.data?.message || err.message
            }`,
            icon: "error",
            confirmButtonColor: "#dc3545",
          });
        }
      }
    });
  };

  const guardarCambios = async () => {
    try {
      await axios.put(
        `http://localhost:3006/api/invima/${editando._id}`,
        editando
      );
      buscarMedicamentos();
      setShowModal(false);
      setEditando(null);

      Swal.fire({
        title: "Guardado!",
        text: "Medicamento editado con éxito",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: `No se pudo actualizar: ${
          err.response?.data?.message || err.message
        }`,
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  useEffect(() => {
    buscarMedicamentos();
  }, []);

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h2
          style={{
            color: "#2c3e50",
            fontSize: "2rem",
            margin: 0,
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Administrar Medicamentos
        </h2>
        <Button
          style={{
            padding: "10px 18px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/")}
        >
          ⬅ Volver
        </Button>
      </div>

      {/* Buscador */}
      <InputGroup className="mb-4 shadow-sm">
        <Form.Control
          placeholder="Buscar por nombre de producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Button variant="primary" onClick={buscarMedicamentos}>
          Buscar
        </Button>
      </InputGroup>

      {cargando && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla */}
      <Table
        striped
        bordered
        hover
        responsive
        className="shadow-sm"
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead style={{ backgroundColor: "#3498db", color: "white" }}>
          <tr>
            <th>Producto</th>
            <th>Registro</th>
            <th>Expediente</th>
            <th>Presentación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((med) => (
            <tr key={med._id}>
              <td>{med.producto}</td>
              <td>{med.registrosanitario}</td>
              <td>{med.expediente}</td>
              <td>{med.descripcioncomercial}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    style={{
                      backgroundColor: "#f39c12",
                      border: "none",
                      padding: "5px 10px",
                      fontWeight: "bold",
                    }}
                    size="sm"
                    onClick={() => {
                      setEditando(med);
                      setShowModal(true);
                    }}
                  >
                    ✏ Editar
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "#e74c3c",
                      border: "none",
                      padding: "5px 10px",
                      fontWeight: "bold",
                    }}
                    size="sm"
                    onClick={() => eliminarMedicamento(med._id)}
                  >
                    🗑 Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Medicamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editando && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Producto</Form.Label>
                <Form.Control
                  type="text"
                  value={editando.producto}
                  onChange={(e) =>
                    setEditando({ ...editando, producto: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Registro Sanitario</Form.Label>
                <Form.Control
                  type="text"
                  value={editando.registrosanitario}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      registrosanitario: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={guardarCambios}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminMedicamentos;

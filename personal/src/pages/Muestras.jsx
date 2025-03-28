import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import senaLogo from "../assets/sena-logo.png";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  Button,
  Modal,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GetAppIcon from "@mui/icons-material/GetApp";
import AssignmentIcon from "@mui/icons-material/Assignment";

// Componente personalizado para los botones de acción
const ActionButton = ({ tooltip, onClick, IconComponent }) => (
  <Tooltip title={tooltip} placement="top" arrow>
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      sx={{
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.1)",
          backgroundColor: "rgba(57, 169, 0, 0.2)",
        },
      }}
    >
      <IconComponent />
    </IconButton>
  </Tooltip>
);

// Constantes de análisis (se usan en Registro y edición)
const ANALISIS_AGUA = [
  {
    categoria: "Metales",
    analisis: [
      "Aluminio",
      "Arsénico",
      "Cadmio",
      "Cobre",
      "Cromo",
      "Hierro",
      "Manganeso",
      "Mercurio",
      "Molibdeno",
      "Níquel",
      "Plata",
      "Plomo",
      "Zinc",
    ],
  },
  {
    categoria: "Química General",
    analisis: [
      "Carbono Orgánico Total (COT)",
      "Cloro residual",
      "Cloro Total",
      "Cloruros",
      "Conductividad",
      "Dureza Cálcica",
      "Dureza Magnésica",
      "Dureza Total",
      "Ortofosfatos",
      "Fósforo Total",
      "Nitratos",
      "Nitritos",
      "Nitrógeno amoniacal",
      "Nitrógeno total",
      "Oxígeno disuelto",
      "pH",
      "Potasio",
      "Sulfatos",
    ],
  },
  {
    categoria: "Físicos",
    analisis: [
      "Color aparente",
      "Color real",
      "Sólidos sedimentables",
      "Sólidos suspendidos",
      "Sólidos Totales",
      "Turbiedad",
    ],
  },
  {
    categoria: "Otros",
    analisis: ["Bromo", "Cobalto", "Yodo"],
  },
];

const ANALISIS_SUELO = [
  {
    categoria: "Propiedades Físicas",
    analisis: ["pH", "Conductividad Eléctrica", "Humedad", "Sólidos Totales"],
  },
  {
    categoria: "Propiedades Químicas",
    analisis: [
      "Carbono orgánico",
      "Materia orgánica",
      "Fósforo total",
      "Acidez intercambiable",
      "Bases intercambiables",
    ],
  },
  {
    categoria: "Macronutrientes",
    analisis: ["Calcio", "Magnesio", "Potasio", "Sodio"],
  },
  {
    categoria: "Micronutrientes",
    analisis: ["Cobre", "Zinc", "Hierro", "Manganeso", "Cadmio", "Mercurio"],
  },
];

// Función para obtener propiedades del Chip según el estado
const getEstadoChipProps = (estado) => {
  switch (estado) {
    case "Recibida":
      return { chipColor: "primary", sx: { backgroundColor: "#39A900", color: "white" } };
    case "En análisis":
      return { chipColor: "info", sx: { backgroundColor: "#2196ag", color: "white" } };
    case "Pendiente de resultados":
      return { chipColor: "warning", sx: { backgroundColor: "#FF9800", color: "white" } };
    case "Finalizada":
      return { chipColor: "success", sx: { backgroundColor: "#4CAF50", color: "white" } };
    case "Rechazada":
      return { chipColor: "error", sx: { backgroundColor: "#F44336", color: "white" } };
    default:
      return { chipColor: "default", sx: { backgroundColor: "#666", color: "white" } };
  }
};

// Subcomponente para ver los detalles de una muestra
const DetailMuestraModal = ({ selectedMuestra, onClose, modalStyle }) => (
  <Modal open={selectedMuestra !== null} onClose={onClose}>
    <Box sx={modalStyle}>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Detalles de la Muestra
      </Typography>
      {selectedMuestra && (
        <TableContainer component={Paper} sx={{ maxWidth: "100%" }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID Muestra</TableCell>
                <TableCell>{selectedMuestra.id_muestra || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Documento</TableCell>
                <TableCell>{selectedMuestra.documento || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
                <TableCell>{selectedMuestra.nombreCliente || "No encontrado"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Tipo de Muestra</TableCell>
                <TableCell>{selectedMuestra.tipoMuestra || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Tipo de Muestreo</TableCell>
                <TableCell>{selectedMuestra.tipoMuestreo || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Fecha y Hora</TableCell>
                <TableCell>
                  {selectedMuestra.fechaHora
                    ? new Date(selectedMuestra.fechaHora).toLocaleString()
                    : "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Lugar de Muestreo</TableCell>
                <TableCell>{selectedMuestra.lugarMuestreo || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Plan de Muestreo</TableCell>
                <TableCell>{selectedMuestra.planMuestreo || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Condiciones Ambientales</TableCell>
                <TableCell>{selectedMuestra.condicionesAmbientales || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Preservación de Muestra</TableCell>
                <TableCell>{selectedMuestra.preservacionMuestra || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Identificación de Muestra</TableCell>
                <TableCell>{selectedMuestra.identificacionMuestra || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Análisis Seleccionados</TableCell>
                <TableCell>
                  {selectedMuestra.analisisSeleccionados?.join(", ") || "Ninguno"}
                </TableCell>
              </TableRow>
              {selectedMuestra.tipoMuestra === "Agua" && (
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Tipo de Agua</TableCell>
                  <TableCell>
                    {selectedMuestra.tipoDeAgua?.tipo || "N/A"}
                    {selectedMuestra.tipoDeAgua?.tipoPersonalizado &&
                      ` - ${selectedMuestra.tipoDeAgua.tipoPersonalizado}`}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                <TableCell>
                  {(() => {
                    const estadoProps = getEstadoChipProps(selectedMuestra.estado);
                    return (
                      <Chip
                        label={selectedMuestra.estado || "No especificado"}
                        color={estadoProps.chipColor}
                        sx={estadoProps.sx}
                      />
                    );
                  })()}
                </TableCell>
              </TableRow>
              {selectedMuestra.historial && selectedMuestra.historial.length > 0 && (
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Último cambio por</TableCell>
                  <TableCell>
                    {selectedMuestra.historial[selectedMuestra.historial.length - 1]
                      .nombreadministrador || "N/A"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  </Modal>
);

// Subcomponente para editar una muestra
const EditMuestraModal = ({ editingMuestra, setEditingMuestra, onSave, modalStyle }) => {
  if (!editingMuestra) return null;
  return (
    <Modal open={editingMuestra !== null} onClose={() => setEditingMuestra(null)}>
      <Box sx={modalStyle}>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Editar Muestra
        </Typography>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ "& .MuiTextField-root": { mb: 2 } }}
        >
          {/* Tipo de Muestra */}
          <Typography variant="subtitle2">Tipo de Muestra</Typography>
          <Select
            fullWidth
            value={editingMuestra.tipoMuestra || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                tipoMuestra: e.target.value,
                analisisSeleccionados: [],
              })
            }
          >
            <MenuItem value="">Seleccione</MenuItem>
            <MenuItem value="Agua">Agua</MenuItem>
            <MenuItem value="Suelo">Suelo</MenuItem>
          </Select>
          {/* Tipo de Muestreo */}
          <Typography variant="subtitle2">Tipo de Muestreo</Typography>
          <Select
            fullWidth
            value={editingMuestra.tipoMuestreo || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                tipoMuestreo: e.target.value,
              })
            }
          >
            <MenuItem value="">Seleccione</MenuItem>
            <MenuItem value="Simple">Simple</MenuItem>
            <MenuItem value="Completo">Completo</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </Select>
          {editingMuestra.tipoMuestreo === "Otro" && (
            <TextField
              fullWidth
              label="Especificar tipo de muestreo"
              value={editingMuestra.tipoMuestreoOtro || ""}
              onChange={(e) =>
                setEditingMuestra({
                  ...editingMuestra,
                  tipoMuestreoOtro: e.target.value,
                })
              }
            />
          )}
          {/* Campo Documento */}
          <TextField
            fullWidth
            label="Documento"
            value={editingMuestra.documento || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                documento: e.target.value,
              })
            }
          />
          {/* Fecha y Hora */}
          <TextField
            fullWidth
            label="Fecha y Hora"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={editingMuestra.fechaHora || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                fechaHora: e.target.value,
              })
            }
          />
          {/* Campos específicos para Muestra de tipo Agua */}
          {editingMuestra.tipoMuestra === "Agua" && (
            <>
              <Typography variant="subtitle2">Tipo de Agua</Typography>
              <Select
                fullWidth
                value={editingMuestra.tipoAgua || ""}
                onChange={(e) =>
                  setEditingMuestra({
                    ...editingMuestra,
                    tipoAgua: e.target.value,
                  })
                }
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="Potable">Potable</MenuItem>
                <MenuItem value="No Potable">No Potable</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
              {editingMuestra.tipoAgua === "Otro" && (
                <TextField
                  fullWidth
                  label="Especificar tipo de agua"
                  value={editingMuestra.otroTipoAgua || ""}
                  onChange={(e) =>
                    setEditingMuestra({
                      ...editingMuestra,
                      otroTipoAgua: e.target.value,
                    })
                  }
                />
              )}
            </>
          )}
          {/* Sección de Análisis */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Análisis a Realizar
          </Typography>
          {editingMuestra.tipoMuestra === "Agua" &&
            ANALISIS_AGUA.map((categoria, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {categoria.categoria}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {categoria.analisis.map((analisis, idx) => (
                    <FormControlLabel
                      key={idx}
                      control={
                        <Checkbox
                          value={analisis}
                          checked={
                            editingMuestra.analisisSeleccionados?.includes(analisis)
                          }
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            setEditingMuestra((prev) => ({
                              ...prev,
                              analisisSeleccionados: checked
                                ? [...(prev.analisisSeleccionados || []), value]
                                : (prev.analisisSeleccionados || []).filter(
                                    (item) => item !== value
                                  ),
                            }));
                          }}
                        />
                      }
                      label={analisis}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          {editingMuestra.tipoMuestreo === "Suelo" &&
            ANALISIS_SUELO.map((categoria, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {categoria.categoria}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {categoria.analisis.map((analisis, idx) => (
                    <FormControlLabel
                      key={idx}
                      control={
                        <Checkbox
                          value={analisis}
                          checked={
                            editingMuestra.analisisSeleccionados?.includes(analisis)
                          }
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            setEditingMuestra((prev) => ({
                              ...prev,
                              analisisSeleccionados: checked
                                ? [...(prev.analisisSeleccionados || []), value]
                                : (prev.analisisSeleccionados || []).filter(
                                    (item) => item !== value
                                  ),
                            }));
                          }}
                        />
                      }
                      label={analisis}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onSave}
            sx={{ mt: 2 }}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const Muestras = () => {
  const [muestras, setMuestras] = useState([]);
  const [filteredMuestras, setFilteredMuestras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMuestra, setSelectedMuestra] = useState(null);
  const [editingMuestra, setEditingMuestra] = useState(null);
  const navigate = useNavigate();

  // Estados para el Snackbar (mensajes de error, info, etc.)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  // Estilo común para los modales
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  // Cargar muestras y asociarlas a usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setSnackbarMessage("⚠ No tienes autorización. Inicia sesión.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }
        const muestrasResponse = await axios.get(
          "https://daniel-back-dom.onrender.com/api/muestras",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let muestrasData = [];
        if (
          muestrasResponse.data &&
          muestrasResponse.data.data &&
          muestrasResponse.data.data.muestras
        ) {
          muestrasData = muestrasResponse.data.data.muestras;
        }

        const usuariosResponse = await axios.get(
          "https://back-usuarios-f.onrender.com/api/usuarios",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const usuariosData = Array.isArray(usuariosResponse.data.usuarios)
          ? usuariosResponse.data.usuarios
          : Array.isArray(usuariosResponse.data)
          ? usuariosResponse.data
          : [];

        const muestrasCompletas = muestrasData.map((muestra) => {
          const usuario = usuariosData.find(
            (user) => user.documento === muestra.documento
          );
          return {
            ...muestra,
            nombreCliente: usuario ? usuario.nombre : "No encontrado",
            telefono: usuario ? usuario.telefono : "No encontrado",
          };
        });

        setMuestras(muestrasCompletas);
        setFilteredMuestras(muestrasCompletas);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setSnackbarMessage("⚠ Error al cargar las muestras. Verifica tu conexión.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = [...muestras];
    if (filterType !== "todos") {
      filtered = filtered.filter(
        (muestra) =>
          muestra.tipoMuestreo?.toLowerCase() === filterType.toLowerCase()
      );
    }
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (muestra) =>
          muestra.nombreCliente.toLowerCase().includes(search.toLowerCase()) ||
          String(muestra.id_muestra).includes(search)
      );
    }
    setFilteredMuestras(filtered);
    setPage(0);
  }, [search, filterType, muestras]);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleFilterChange = async (e) => {
    const selectedType = e.target.value;
    setFilterType(selectedType);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const muestrasResponse = await axios.get(
        "https://daniel-back-dom.onrender.com/api/muestras",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let muestrasData = [];
      if (
        muestrasResponse.data &&
        muestrasResponse.data.data &&
        muestrasResponse.data.data.muestras
      ) {
        muestrasData = muestrasResponse.data.data.muestras;
      }

      let muestrasFiltradas = muestrasData;
      if (selectedType === "Agua") {
        muestrasFiltradas = muestrasData.filter(
          (muestra) =>
            muestra.tipoMuestra &&
            muestra.tipoMuestra.toLowerCase() === "agua"
        );
      } else if (selectedType === "Suelo") {
        muestrasFiltradas = muestrasData.filter(
          (muestra) =>
            muestra.tipoMuestra &&
            muestra.tipoMuestra.toLowerCase() === "suelo"
        );
      }

      const usuariosResponse = await axios.get(
        "https://back-usuarios-f.onrender.com/api/usuarios",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let usuariosData = [];
      if (usuariosResponse.data && usuariosResponse.data.usuarios) {
        usuariosData = usuariosResponse.data.usuarios;
      }

      const muestrasCompletas = muestrasFiltradas.map((muestra) => {
        const usuario = usuariosData.find(
          (user) => user.documento === muestra.documento
        );
        const ultimoEstado =
          muestra.historial && muestra.historial.length > 0
            ? muestra.historial[muestra.historial.length - 1].estado
            : "No especificado";
        return {
          ...muestra,
          id_muestra: muestra.id_muestra || "N/A",
          nombreCliente: usuario
            ? usuario.nombre
            : muestra.nombreadministrador || "No encontrado",
          telefono: usuario ? usuario.telefono : "No encontrado",
          estado: muestra.estado || ultimoEstado,
          tipoMuestreo: muestra.tipoMuestreo || "N/A",
          fechaHora: muestra.fechaHora || "N/A",
          analisisSeleccionados: muestra.analisisSeleccionados || [],
          tipoDeAgua: muestra.tipoDeAgua ? muestra.tipoDeAgua.tipo : "N/A",
        };
      });

      setMuestras(muestrasCompletas);
      setFilteredMuestras(muestrasCompletas);
    } catch (error) {
      console.error("Error al cargar muestras:", error);
      setSnackbarMessage("⚠ Error al cargar las muestras. Verifica tu conexión.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
    setPage(0);
  };

  // Función para generar PDF
  const generarPDFMuestra = (muestra, preview = false) => {
    const doc = new jsPDF();
    // Agregar logo y título
    doc.addImage(senaLogo, "PNG", 10, 10, 40, 20);
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(0, 49, 77);
    doc.rect(0, 35, 210, 10, "F");
    doc.text("Detalles de la Muestra", 14, 42);

    const detallesMuestra = [
      ["ID Muestra", muestra.id_muestra || "N/A"],
      ["Documento", muestra.documento || "N/A"],
      ["Nombre del Cliente", muestra.nombreCliente || "No encontrado"],
      ["Tipo de Muestra", muestra.tipoMuestra || "N/A"],
      ["Tipo de Muestreo", muestra.tipoMuestreo || "N/A"],
      [
        "Fecha y Hora",
        muestra.fechaHora ? new Date(muestra.fechaHora).toLocaleString() : "N/A",
      ],
      ["Lugar de Muestreo", muestra.lugarMuestreo || "N/A"],
      ["Plan de Muestreo", muestra.planMuestreo || "N/A"],
      ["Condiciones Ambientales", muestra.condicionesAmbientales || "N/A"],
      ["Preservación de Muestra", muestra.preservacionMuestra || "N/A"],
      ["Identificación de Muestra", muestra.identificacionMuestra || "N/A"],
      [
        "Análisis Seleccionados",
        muestra.analisisSeleccionados?.join(", ") || "Ninguno",
      ],
    ];

    if (muestra.tipoMuestra === "Agua" && muestra.tipoDeAgua) {
      detallesMuestra.push(["Tipo de Agua", muestra.tipoDeAgua.tipo || "N/A"]);
      if (muestra.tipoDeAgua.tipoPersonalizado) {
        detallesMuestra.push(["Tipo Personalizado", muestra.tipoDeAgua.tipoPersonalizado]);
      }
      if (muestra.tipoDeAgua.descripcion) {
        detallesMuestra.push(["Descripción", muestra.tipoDeAgua.descripcion]);
      }
    }

    detallesMuestra.push(["Estado", muestra.estado || "No especificado"]);

    if (muestra.historial && muestra.historial.length > 0) {
      const ultimoCambio = muestra.historial[muestra.historial.length - 1];
      detallesMuestra.push(
        ["Último cambio por", ultimoCambio.nombreadministrador || "N/A"],
        ["Fecha de cambio", new Date(ultimoCambio.fechaCambio).toLocaleString()],
        ["Observaciones", ultimoCambio.observaciones || "N/A"]
      );
    }

    autoTable(doc, {
      startY: 50,
      head: [["Campo", "Valor"]],
      body: detallesMuestra,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 130 },
      },
    });

    let currentY = doc.lastAutoTable.finalY + 20;

    if (muestra.firmas) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Firmas", 14, currentY);
      currentY += 10;

      if (muestra.firmas.firmaLaboratorista) {
        try {
          doc.addImage(muestra.firmas.firmaLaboratorista, "PNG", 20, currentY, 70, 30);
          doc.setFontSize(10);
          doc.text(`Laboratorista (${muestra.firmas.cedulaLaboratorista})`, 20, currentY + 35);
        } catch (error) {
          console.error("Error al agregar firma del laboratorista:", error);
        }
      }

      if (muestra.firmas.firmaCliente) {
        try {
          doc.addImage(muestra.firmas.firmaCliente, "PNG", 120, currentY, 70, 30);
          doc.setFontSize(10);
          doc.text(`Cliente (${muestra.firmas.cedulaCliente})`, 120, currentY + 35);
        } catch (error) {
          console.error("Error al agregar firma del cliente:", error);
        }
      }
      currentY += 45;
    }

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Nota: Este documento es un registro oficial de la muestra.", 14, currentY);

    if (preview) {
      window.open(doc.output("bloburl"), "_blank");
    } else {
      doc.save(`Muestra_${muestra.id_muestra}.pdf`);
    }
  };

  const handleEditMuestra = (muestra) => setEditingMuestra(muestra);

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `https://daniel-back-dom.onrender.com/api/muestras/${editingMuestra.id_muestra}`,
        editingMuestra,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const updatedMuestras = muestras.map((m) =>
        m.id_muestra === editingMuestra.id_muestra ? editingMuestra : m
      );
      setMuestras(updatedMuestras);
      setFilteredMuestras(updatedMuestras);
      setEditingMuestra(null);
    } catch (error) {
      setSnackbarMessage("⚠ Error al actualizar la muestra.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleViewDetails = (muestra) => {
    setSelectedMuestra(muestra);
  };

  const handleDownloadPDF = (muestra) => {
    generarPDFMuestra(muestra);
  };

  const handleEditClick = (muestra) => {
    handleEditMuestra(muestra);
  };

  if (loading)
    return (
      <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
    );

  return (
    <Paper sx={{ padding: 2, marginTop: 2, boxShadow: 3 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: 2, fontWeight: "bold" }}
      >
        🔬 Muestras Registradas
      </Typography>

      <Select
        value={filterType}
        onChange={handleFilterChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      >
        <MenuItem value="todos">Todos</MenuItem>
        <MenuItem value="Agua">Agua</MenuItem>
        <MenuItem value="Suelo">Suelo</MenuItem>
      </Select>

      <TextField
        label="Buscar muestra (ID o cliente)"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 2 }}
        onChange={handleSearchChange}
      />

      {filteredMuestras.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#39A900" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cliente</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Documento</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Análisis</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMuestras
                  .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                  .map((muestra) => (
                    <TableRow
                      key={muestra._id}
                      onClick={() => setSelectedMuestra(muestra)}
                      sx={{
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" },
                        cursor: "pointer",
                      }}
                    >
                      <TableCell>{muestra.id_muestra}</TableCell>
                      <TableCell>{muestra.nombreCliente}</TableCell>
                      <TableCell>{muestra.documento}</TableCell>
                      <TableCell>{muestra.tipoMuestra}</TableCell>
                      <TableCell>
                        {(() => {
                          const estadoProps = getEstadoChipProps(muestra.estado);
                          return (
                            <Chip
                              label={muestra.estado || "No especificado"}
                              color={estadoProps.chipColor}
                              sx={estadoProps.sx}
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {muestra.fechaHora
                          ? new Date(muestra.fechaHora).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {muestra.analisisSeleccionados &&
                        muestra.analisisSeleccionados.length > 0
                          ? muestra.analisisSeleccionados.join(", ")
                          : "Ninguno"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <ActionButton
                            tooltip="Ver Detalles"
                            onClick={() => handleViewDetails(muestra)}
                            IconComponent={VisibilityIcon}
                          />
                          <ActionButton
                            tooltip="Descargar PDF"
                            onClick={() => handleDownloadPDF(muestra)}
                            IconComponent={GetAppIcon}
                          />
                          <ActionButton
                            tooltip="Editar Muestra"
                            onClick={() => handleEditClick(muestra)}
                            IconComponent={EditIcon}
                          />
                          <ActionButton
                            tooltip="Registrar Resultados"
                            onClick={() =>
                              navigate(`/registrar-resultados/${muestra.id_muestra}`)
                            }
                            IconComponent={AssignmentIcon}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredMuestras.length > rowsPerPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={Math.ceil(filteredMuestras.length / rowsPerPage)}
                page={page + 1}
                onChange={(event, value) => setPage(value - 1)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#39A900",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#39A900",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#2d8000",
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No se encontraron muestras con los filtros aplicados
        </Typography>
      )}

      {/* Modales */}
      <DetailMuestraModal
        selectedMuestra={selectedMuestra}
        onClose={() => setSelectedMuestra(null)}
        modalStyle={modalStyle}
      />

      <EditMuestraModal
        editingMuestra={editingMuestra}
        setEditingMuestra={setEditingMuestra}
        onSave={handleSaveEdit}
        modalStyle={modalStyle}
      />

      {/* Snackbar para mostrar mensajes */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Muestras;

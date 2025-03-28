import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const initialResultados = {
  pH: { valor: '', unidad: 'mv' },
  turbidez: { valor: '', unidad: 'NTU' },
  oxigenoDisuelto: { valor: '', unidad: 'mg/L' },
  nitratos: { valor: '', unidad: 'mg/L' },
  solidosSuspendidos: { valor: '', unidad: 'mg/L' },
  fosfatos: { valor: '', unidad: 'mg/k' },
  observaciones: ''
};

const RegistrarResultados = () => {
  const navigate = useNavigate();
  const [resultados, setResultados] = useState(initialResultados);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { idMuestra } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [detallesMuestra, setDetallesMuestra] = useState(null);
  const [historialCambios, setHistorialCambios] = useState([]);
  const [resultadosActuales, setResultadosActuales] = useState(null);
  const [openHistorial, setOpenHistorial] = useState(false);

  useEffect(() => {
    const cargarResultados = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autorización');
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Obtener los detalles de la muestra
        const responseMuestra = await axios.get(
          `https://daniel-back-dom.onrender.com/api/muestras/${idMuestra}`,
          config
        );
        
        if (responseMuestra.data?.success && responseMuestra.data?.data?.muestra) {
          const muestra = responseMuestra.data.data.muestra;

          if (muestra.estado !== 'Recibida' && muestra.estado !== 'En análisis') {
            setError('Solo se pueden registrar o actualizar resultados de muestras en estado "Recibida" o "En análisis"');
            return;
          }

          setDetallesMuestra({
            documento: muestra.documento || 'No especificado',
            tipoMuestra: muestra.tipoMuestra || 'No especificado',
            tipoMuestreo: muestra.tipoMuestreo || 'No especificado',
            fechaHora: muestra.fechaHora,
            estado: muestra.estado || 'En análisis',
            lugarMuestreo: muestra.lugarMuestreo || 'No especificado',
            tipoDeAgua: muestra.tipoDeAgua || { tipo: 'No especificado' },
            analisisSeleccionados: muestra.analisisSeleccionados || [],
            nombreLaboratorista: muestra.nombreLaboratorista || 'No especificado'
          });

          // Cargar resultados existentes
          try {
            const responseResultados = await axios.get(
              `https://daniel-back-dom.onrender.com/api/ingreso-resultados/muestra/${idMuestra}`,
              config
            );
            

            if (responseResultados.data?.success && responseResultados.data?.data) {
              const resultadosData = responseResultados.data.data;
              
              const resultadosFormateados = {
                pH: {
                  valor: resultadosData.pH?.valor?.toString() || '',
                  unidad: resultadosData.pH?.unidad?.trim() || 'mv'
                },
                turbidez: {
                  valor: resultadosData.turbidez?.valor?.toString() || '',
                  unidad: resultadosData.turbidez?.unidad?.trim() || 'NTU'
                },
                oxigenoDisuelto: {
                  valor: resultadosData.oxigenoDisuelto?.valor?.toString() || '',
                  unidad: resultadosData.oxigenoDisuelto?.unidad?.trim() || 'mg/L'
                },
                nitratos: {
                  valor: resultadosData.nitratos?.valor?.toString() || '',
                  unidad: resultadosData.nitratos?.unidad?.trim() || 'mg/L'
                },
                solidosSuspendidos: {
                  valor: resultadosData.solidosSuspendidos?.valor?.toString() || '',
                  unidad: resultadosData.solidosSuspendidos?.unidad?.trim() || 'mg/L'
                },
                fosfatos: {
                  valor: resultadosData.fosfatos?.valor?.toString() || '',
                  unidad: resultadosData.fosfatos?.unidad?.trim() || 'mg/k'
                },
                observaciones: resultadosData.observaciones || ''
              };

              setResultados(resultadosFormateados);
              setResultadosActuales(resultadosFormateados);

              if (resultadosData.historialCambios?.length > 0) {
                const historialOrdenado = [...resultadosData.historialCambios].sort((a, b) => 
                  new Date(b.fecha) - new Date(a.fecha)
                );
                setHistorialCambios(historialOrdenado);
              }
              setIsEditing(true);
            }
          } catch (error) {
            if (error.response?.status !== 404) {
              console.error('Error al cargar resultados:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError('No tienes autorización para acceder a estos datos');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Error al cargar los datos');
        }
      } finally {
        setLoading(false);
      }
    };

    if (idMuestra) {
      cargarResultados();
    }
  }, [idMuestra, navigate]);

  const handleInputChange = (parametro, valor, tipo = 'valor') => {
    if (parametro === 'observaciones') {
      setResultados(prev => ({
        ...prev,
        observaciones: valor
      }));
      return;
    }

    setResultados(prev => ({
      ...prev,
      [parametro]: {
        ...prev[parametro],
        [tipo]: valor
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const hayResultados = Object.keys(resultados).some(key => 
        key !== 'observaciones' && resultados[key].valor !== ''
      );

      if (!hayResultados) {
        throw new Error('Debe ingresar al menos un resultado');
      }

      const datosParaEnviar = {
        pH: `${resultados.pH.valor} ${resultados.pH.unidad}`,
        turbidez: `${resultados.turbidez.valor} ${resultados.turbidez.unidad}`,
        oxigenoDisuelto: `${resultados.oxigenoDisuelto.valor} ${resultados.oxigenoDisuelto.unidad}`,
        nitratos: `${resultados.nitratos.valor} ${resultados.nitratos.unidad}`,
        solidosSuspendidos: `${resultados.solidosSuspendidos.valor} ${resultados.solidosSuspendidos.unidad}`,
        fosfatos: `${resultados.fosfatos.valor} ${resultados.fosfatos.unidad}`,
        observaciones: resultados.observaciones
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let response;
      if (isEditing) {
        response = await axios.put(
          `https://daniel-back-dom.onrender.com/api/ingreso-resultados/editar/${idMuestra}`,
          datosParaEnviar,
          config
        );
      } else {
        response = await axios.post(
          `https://daniel-back-dom.onrender.com/api/ingreso-resultados/registrar/${idMuestra}`,
          datosParaEnviar,
          config
        );
      }

      if (response.data.success) {
        const resultadoActualizado = response.data.data.resultado;
        
        const nuevosResultados = {
          pH: {
            valor: resultadoActualizado.pH?.valor?.toString() || '',
            unidad: resultadoActualizado.pH?.unidad?.trim() || 'mv'
          },
          turbidez: {
            valor: resultadoActualizado.turbidez?.valor?.toString() || '',
            unidad: resultadoActualizado.turbidez?.unidad?.trim() || 'NTU'
          },
          oxigenoDisuelto: {
            valor: resultadoActualizado.oxigenoDisuelto?.valor?.toString() || '',
            unidad: resultadoActualizado.oxigenoDisuelto?.unidad?.trim() || 'mg/L'
          },
          nitratos: {
            valor: resultadoActualizado.nitratos?.valor?.toString() || '',
            unidad: resultadoActualizado.nitratos?.unidad?.trim() || 'mg/L'
          },
          solidosSuspendidos: {
            valor: resultadoActualizado.solidosSuspendidos?.valor?.toString() || '',
            unidad: resultadoActualizado.solidosSuspendidos?.unidad?.trim() || 'mg/L'
          },
          fosfatos: {
            valor: resultadoActualizado.fosfatos?.valor?.toString() || '',
            unidad: resultadoActualizado.fosfatos?.unidad?.trim() || 'mg/k'
          },
          observaciones: resultadoActualizado.observaciones || ''
        };

        setResultados(nuevosResultados);
        setResultadosActuales(nuevosResultados);

        if (resultadoActualizado.historialCambios?.length > 0) {
          const historialOrdenado = [...resultadoActualizado.historialCambios].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
          );
          setHistorialCambios(historialOrdenado);
        }

        setSuccess(isEditing ? 'Resultados actualizados exitosamente' : 'Resultados registrados exitosamente');
        
        // Esperar un momento antes de recargar los datos
        setTimeout(async () => {
          try {
            const responseActualizada = await axios.get(
              `https://daniel-back-dom.onrender.com/api/ingreso-resultados/muestra/${idMuestra}`,
              config
            );

            if (responseActualizada.data?.success && responseActualizada.data?.data) {
              const datosActualizados = responseActualizada.data.data;
              setResultadosActuales(nuevosResultados);
              if (datosActualizados.historialCambios?.length > 0) {
                const historialActualizado = [...datosActualizados.historialCambios].sort((a, b) => 
                  new Date(b.fecha) - new Date(a.fecha)
                );
                setHistorialCambios(historialActualizado);
              }
            }
          } catch (error) {
            console.error('Error al recargar datos:', error);
          }
        }, 1000);

        // Retrasar la redirección para mostrar los cambios
        setTimeout(() => {
          navigate('/lista-resultados');
        }, 3000);
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      setError(error.response?.data?.message || error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const renderDetallesMuestra = () => {
    if (!detallesMuestra) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#39A900', fontWeight: 'bold', mb: 2 }}>
          Detalles de la Muestra - {idMuestra}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" sx={{ backgroundColor: '#f5f5f5', width: '200px', fontWeight: 'bold' }}>
                  Campo
                </TableCell>
                <TableCell component="th" sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  Valor
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Documento</TableCell>
                <TableCell>{detallesMuestra.documento}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tipo de Muestreo</TableCell>
                <TableCell>{detallesMuestra.tipoMuestreo}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell>{new Date(detallesMuestra.fechaHora).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Estado</TableCell>
                <TableCell>{detallesMuestra.estado}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Laboratorista</TableCell>
                <TableCell>{detallesMuestra.nombreLaboratorista}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderResultadosActuales = () => {
    if (!resultadosActuales) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#39A900', mb: 2 }}>
          Resultados de Análisis
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '33%' }}>Parámetro</TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '33%' }}>Valor</TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '33%' }}>Unidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(resultadosActuales).map(([parametro, datos]) => {
                if (parametro === 'observaciones') return null;
                return (
                  <TableRow key={parametro}>
                    <TableCell>{parametro}</TableCell>
                    <TableCell>{datos.valor}</TableCell>
                    <TableCell>{datos.unidad}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {resultadosActuales.observaciones && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#39A900', mb: 2 }}>
              Observaciones
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fff3e0' }}>
              <Typography sx={{ color: '#e65100' }}>
                {resultadosActuales.observaciones}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    );
  };

  const renderHistorialCambios = () => {
    if (!historialCambios.length) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#39A900' }}>
          Historial de Cambios
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Laboratorista</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Cambios Realizados</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Observaciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historialCambios.map((cambio, index) => (
                <TableRow key={cambio._id || index}>
                  <TableCell>{new Date(cambio.fecha).toLocaleString()}</TableCell>
                  <TableCell>{cambio.nombre}</TableCell>
                  <TableCell>
                    <Box>
                      {Object.entries(cambio.cambiosRealizados || {}).map(([param, valores], i) => {
                        if (param === 'observaciones' || param === '_id') return null;
                        return (
                          <Chip
                            key={i}
                            label={`${param}: ${valores.valorAnterior} → ${valores.valorNuevo} ${valores.unidad}`}
                            size="small"
                            sx={{
                              m: 0.5,
                              backgroundColor: index === 0 ? '#e3f2fd' : '#e8f5e9',
                              '& .MuiChip-label': {
                                color: index === 0 ? '#1976d2' : '#2e7d32'
                              }
                            }}
                          />
                        );
                      })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        backgroundColor: '#fff3e0',
                        padding: '8px',
                        borderRadius: '4px',
                        color: '#e65100'
                      }}
                    >
                      {cambio.cambiosRealizados?.observaciones?.valorNuevo || 'Sin observaciones'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 1200, margin: "auto", marginTop: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          🧪 {isEditing ? 'Editar Resultados' : 'Registrar Resultados'}
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{success}</Alert>}

      {!loading && (
        <>
          {renderDetallesMuestra()}
          {renderResultadosActuales()}
          {isEditing && historialCambios.length > 0 && renderHistorialCambios()}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom sx={{ color: '#39A900', fontWeight: 'bold', mb: 2 }}>
            {isEditing ? 'Actualizar Resultados' : 'Registrar Nuevos Resultados'}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {Object.entries(resultados).map(([parametro, datos]) => {
                if (parametro === 'observaciones') return null;
                return (
                  <Grid item xs={12} sm={6} key={parametro}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        label={parametro}
                        type="number"
                        value={datos.valor}
                        onChange={(e) => handleInputChange(parametro, e.target.value)}
                        inputProps={{ 
                          step: "0.1",
                          min: "0",
                          max: parametro === 'pH' ? "14" : undefined
                        }}
                        required
                      />
                      <TextField
                        sx={{ width: '150px' }}
                        label="Unidad"
                        value={datos.unidad}
                        onChange={(e) => handleInputChange(parametro, e.target.value, 'unidad')}
                        required
                      />
                    </Box>
                  </Grid>
                );
              })}
              <Grid item xs={12}>
                <TextField
                  label="Observaciones"
                  multiline
                  rows={4}
                  value={resultados.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  fullWidth
                  placeholder="Ingrese observaciones sobre la muestra..."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#39A900',
                  '&:hover': {
                    backgroundColor: '#2d8000'
                  },
                  minWidth: '200px'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isEditing ? 'Actualizar Resultados' : 'Registrar Resultados'
                )}
              </Button>
            </Box>
          </form>
        </>
      )}
    </Paper>
  );
};

export default RegistrarResultados; 
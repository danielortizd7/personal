// src/pages/ListaResultados.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Grid
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

const ResultRow = ({ resultado, onVerificar }) => {
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [detalleResultado, setDetalleResultado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState(null);

  const cargarDetalleResultado = async () => {
    try {
      setLoadingDetalle(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `https://daniel-back-dom.onrender.com/api/ingreso-resultados/muestra/${resultado.idMuestra}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Detalle de muestra:', response.data);
      
      if (response.data && response.data.data && response.data.data.resultado) {
        setDetalleResultado(response.data.data.resultado);
      } else {
        setError('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      setError('Error al cargar los detalles de la muestra');
    } finally {
      setLoadingDetalle(false);
    }
  };

  useEffect(() => {
    if (openDialog && !detalleResultado) {
      cargarDetalleResultado();
    }
  }, [openDialog]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <TableRow 
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{resultado.idMuestra}</TableCell>
        <TableCell>{resultado.documento}</TableCell>
        <TableCell>{resultado.tipoMuestreo}</TableCell>
        <TableCell>
          {new Date(resultado.fechaHora).toLocaleString()}
        </TableCell>
        <TableCell>
          <Chip
            label={resultado.verificado ? "Finalizada" : "En proceso"}
            color={resultado.verificado ? "success" : "warning"}
            sx={{ 
              backgroundColor: resultado.verificado ? '#39A900' : '#FFA500',
              color: 'white'
            }}
          />
        </TableCell>
        <TableCell>{resultado.nombreLaboratorista || "No asignado"}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Ver Detalles Completos">
              <IconButton
                onClick={handleOpenDialog}
                size="small"
                color="primary"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Resultados de Análisis
              </Typography>
              {loadingDetalle ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Parámetro</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalleResultado?.pH && (
                      <TableRow>
                        <TableCell>pH</TableCell>
                        <TableCell>{detalleResultado.pH.valor} {detalleResultado.pH.unidad || ''}</TableCell>
                      </TableRow>
                    )}
                    {detalleResultado?.turbidez && (
                      <TableRow>
                        <TableCell>Turbidez</TableCell>
                        <TableCell>{detalleResultado.turbidez.valor} {detalleResultado.turbidez.unidad || 'NTU'}</TableCell>
                      </TableRow>
                    )}
                    {detalleResultado?.oxigenoDisuelto && (
                      <TableRow>
                        <TableCell>Oxígeno Disuelto</TableCell>
                        <TableCell>{detalleResultado.oxigenoDisuelto.valor} {detalleResultado.oxigenoDisuelto.unidad || 'mg/L'}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ color: '#39A900', fontWeight: 'bold' }}>
            Detalles Completos - {resultado.idMuestra}
          </Typography>
          <IconButton onClick={() => setOpenDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingDetalle ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : detalleResultado ? (
            <>
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#39A900' }}>
                  Información de la Muestra
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">ID Muestra:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{detalleResultado.idMuestra}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Documento Cliente:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{detalleResultado.documento}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Tipo de Muestreo:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{detalleResultado.tipoMuestreo}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Fecha y Hora:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {detalleResultado.fechaHora && new Date(detalleResultado.fechaHora).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Estado:</Typography>
                    <Chip
                      label={detalleResultado.verificado ? "Finalizada" : "En proceso"}
                      color={detalleResultado.verificado ? "success" : "warning"}
                      size="small"
                      sx={{ 
                        backgroundColor: detalleResultado.verificado ? '#39A900' : '#FFA500',
                        color: 'white',
                        mt: 0.5
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Laboratorista:</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{detalleResultado.nombreLaboratorista || "No asignado"}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#39A900' }}>
                  Resultados de Análisis
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Parámetro</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Valor</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Unidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleResultado.pH && (
                        <TableRow>
                          <TableCell>pH</TableCell>
                          <TableCell>{detalleResultado.pH.valor}</TableCell>
                          <TableCell>{detalleResultado.pH.unidad || '-'}</TableCell>
                        </TableRow>
                      )}
                      {detalleResultado.turbidez && (
                        <TableRow>
                          <TableCell>Turbidez</TableCell>
                          <TableCell>{detalleResultado.turbidez.valor}</TableCell>
                          <TableCell>{detalleResultado.turbidez.unidad || 'NTU'}</TableCell>
                        </TableRow>
                      )}
                      {detalleResultado.oxigenoDisuelto && (
                        <TableRow>
                          <TableCell>Oxígeno Disuelto</TableCell>
                          <TableCell>{detalleResultado.oxigenoDisuelto.valor}</TableCell>
                          <TableCell>{detalleResultado.oxigenoDisuelto.unidad || 'mg/L'}</TableCell>
                        </TableRow>
                      )}
                      {detalleResultado.nitratos && (
                        <TableRow>
                          <TableCell>Nitratos</TableCell>
                          <TableCell>{detalleResultado.nitratos.valor}</TableCell>
                          <TableCell>{detalleResultado.nitratos.unidad || 'mg/L'}</TableCell>
                        </TableRow>
                      )}
                      {detalleResultado.solidosSuspendidos && (
                        <TableRow>
                          <TableCell>Sólidos Suspendidos</TableCell>
                          <TableCell>{detalleResultado.solidosSuspendidos.valor}</TableCell>
                          <TableCell>{detalleResultado.solidosSuspendidos.unidad || 'mg/L'}</TableCell>
                        </TableRow>
                      )}
                      {detalleResultado.fosfatos && (
                        <TableRow>
                          <TableCell>Fosfatos</TableCell>
                          <TableCell>{detalleResultado.fosfatos.valor}</TableCell>
                          <TableCell>{detalleResultado.fosfatos.unidad || 'mg/L'}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {detalleResultado.historialCambios && detalleResultado.historialCambios.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#39A900' }}>
                    Historial de Cambios
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Laboratorista</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Acción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detalleResultado.historialCambios.map((cambio, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(cambio.fecha).toLocaleString()}</TableCell>
                            <TableCell>{cambio.nombre}</TableCell>
                            <TableCell>{cambio.accion || "Modificación"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No se encontraron detalles para esta muestra
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          {detalleResultado && !detalleResultado.verificado && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                onVerificar(resultado.idMuestra);
                setOpenDialog(false);
              }}
              sx={{ 
                backgroundColor: '#39A900',
                '&:hover': {
                  backgroundColor: '#2d8000'
                }
              }}
              startIcon={<VerifiedIcon />}
            >
              Verificar Resultados
            </Button>
          )}
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ListaResultados = () => {
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    cargarResultados();
  }, []);

  const cargarResultados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('Token:', token ? 'Existe' : 'No existe');
      console.log('User Data:', userData);
      
      if (!token) {
        setError('No tienes autorización. Inicia sesión.');
        navigate('/login');
        return;
      }

      // Verificar el rol del usuario
      const userRole = userData.rol?.toLowerCase();
      console.log('Rol del usuario:', userRole);
      
      if (!userRole || (userRole !== 'laboratorista' && userRole !== 'administrador')) {
        setError('No tienes autorización para ver esta página. Acceso solo para laboratoristas y administradores.');
        navigate('/login');
        return;
      }

      console.log('Iniciando petición al servidor...');
      const response = await axios.get('https://daniel-back-dom.onrender.com/api/ingreso-resultados/resultados', {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // No rechazar si el estado es menor que 500
        }
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.status === 401 || response.status === 403) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (response.data && response.data.data && response.data.data.resultados) {
        console.log('Usando response.data.data.resultados');
        setResultados(response.data.data.resultados);
      } else if (response.data && response.data.resultados) {
        console.log('Usando response.data.resultados');
        setResultados(response.data.resultados);
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Usando response.data directamente');
        setResultados(response.data);
      } else {
        console.warn('Formato de respuesta inesperado:', response.data);
        setResultados([]);
      }

    } catch (err) {
      console.error('Error completo:', err);
      console.error('Detalles del error:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 404) {
        setError('Error al conectar con el servidor. Por favor, verifica la conexión.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 500) {
        setError('Error interno del servidor. Por favor, intenta más tarde.');
        console.error('Error 500 del servidor:', err.response?.data);
      } else {
        setError('Error al cargar los resultados. Por favor, intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (idMuestra) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No tienes autorización. Inicia sesión.');
        return;
      }

      const response = await axios.post(
        `https://daniel-back-dom.onrender.com/api/ingreso-resultados/verificar/${idMuestra}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('✔ Resultados verificados exitosamente');
        // Actualizar la lista de resultados
        await cargarResultados();
        
        // Limpiar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error al verificar:', error);
      setError(error.response?.data?.message || 
        'No se pudo verificar los resultados. Asegúrate de que no seas el mismo laboratorista que los registró.');
      
      // Limpiar el mensaje de error después de 3 segundos
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (idMuestra) => {
    navigate(`/registrar-resultados/${idMuestra}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error" sx={{ backgroundColor: '#ffebee' }}>
          <Typography variant="body1">{error}</Typography>
          {error.includes('autorización') && (
            <Button 
              color="primary" 
              onClick={() => navigate('/login')}
              sx={{ mt: 1 }}
            >
              Ir al inicio de sesión
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  // Cálculo para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = resultados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(resultados.length / itemsPerPage);

  return (
    <Paper sx={{ p: 3, margin: 'auto', maxWidth: 1200, mt: 3 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
        🧪 Resultados de Análisis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          {success}
        </Alert>
      )}

      {(!resultados || resultados.length === 0) ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay resultados registrados
        </Alert>
      ) : (
        <>
        <TableContainer>
          <Table>
              <TableHead sx={{ backgroundColor: "#39A900" }}>
              <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}></TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID Muestra</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Documento</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo Muestreo</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Estado</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Laboratorista</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {currentResults.map((resultado) => (
                  <ResultRow 
                    key={resultado._id} 
                    resultado={resultado}
                    onVerificar={handleVerificar}
                  />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={(event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ListaResultados;

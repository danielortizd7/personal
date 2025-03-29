import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";

const RecuperarContrasena = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setLoading(true);

    if (!email) {
      setError("⚠ Debes ingresar un correo electrónico.");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("⚠ Ingresa un correo válido.");
      setLoading(false);
      return;
    }

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/solicitar-recuperacion`;
      const response = await axios.post(url, { email });

      if (response.status === 200) {
        setMensaje("✅ Si el correo existe, se enviará un enlace de recuperación.");
      } else {
        setError("⚠ No se pudo procesar la solicitud.");
      }
    } catch (error) {
      console.error("Error en la recuperación:", error);
      setError("❌ Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d7f7dd 0%, #ffffff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            width: "100%",
            maxWidth: 400,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 5,
            boxShadow: "0px 4px 30px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0px 8px 40px rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            color="#39A900"
          >
            🔑 Recuperar Contraseña
          </Typography>

          {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              fullWidth
              required
            />

            {loading ? (
              <CircularProgress sx={{ alignSelf: "center" }} />
            ) : (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#39A900",
                  color: "white",
                  fontWeight: "bold",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#2e7d00",
                    transform: "scale(1.02)",
                  },
                }}
              >
                Enviar correo
              </Button>
            )}
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            <a href="/login" style={{ color: "#39A900", textDecoration: "none" }}>
              Volver al inicio de sesión
            </a>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default RecuperarContrasena;

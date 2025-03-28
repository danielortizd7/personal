const express = require("express");
const router = express.Router();
const resultadoController = require("../controllers/resultadoController");
const { verificarLaboratorista, verificarRolAdministrador } = require("../../../shared/middleware/authMiddleware");
const { resultadoValidators } = require("../../../shared/validators");

// Obtener resultados de una muestra específica - accesible para ambos roles
router.get("/muestra/:idMuestra", 
  resultadoController.obtenerResultados
);

// Obtener todos los resultados - accesible para ambos roles
router.get("/resultados", 
  resultadoController.obtenerTodosResultados
);

// Las siguientes rutas requieren ser laboratorista
router.use([
  "/registrar/:idMuestra",
  "/editar/:idMuestra"
], verificarLaboratorista);

// Registrar resultados de una muestra
router.post("/registrar/:idMuestra", 
  resultadoValidators.guardarResultado,
  resultadoController.registrarResultado
);

// Editar resultados de una muestra
router.put("/editar/:idMuestra",
  resultadoValidators.editarResultado,
  resultadoController.editarResultado
);

// Verificar resultados de una muestra (solo administrador)
router.post("/verificar/:idMuestra",
  verificarRolAdministrador,
  resultadoController.verificarResultado
);

module.exports = router; 
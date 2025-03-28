// Configuración de CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Usuario-Documento',
        'Accept',
        'Origin',
        'X-Requested-With'
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
    credentials: false // Cambiamos a false ya que estamos usando '*' como origin
})); 
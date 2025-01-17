import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import routerVeterinarios from './routers/veterinario_routes.js'
//import routerPacientes from './routers/paciente_routes.js'


// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())


// Variables globales


// Rutas 
app.get('/', (req, res)=>{
    res.send("Server on")
})
app.use('/api',routerVeterinarios)
//app.use('/api',routerPacientes)

// Manejo de una ruta que no sea encontrada
app.use((req,res)=>res.status(400).send("Endpoint no encontrado"))

export default  app



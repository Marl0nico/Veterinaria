/*import { Router } from "express";
import {
    login,
    perfil,
    registro,
    confirmEmail,
    listarVeterinarios,
    detalleVeterinario,
    actualizarPerfil,
    actualizarPassword,
    recuperarPassword,
    comprobarTokenPasword,
    nuevoPassword,
} from "../controllers/veterinario_controller.js";
import verificarAutenticacion from '../middlewares/autenticacion.js'

const router = Router();

router.post('/login',login)
router.post('/registro',registro)
router.get('/confirmar/:token',confirmEmail)
router.get('/veterinarios',listarVeterinarios)
router.post('/recuperar-password',recuperarPassword)
router.get('/recuperar-password/:token',comprobarTokenPasword)
router.post('/nuevo-password/:token',nuevoPassword)

router.get('/perfil',verificarAutenticacion,perfil)
router.put('/veterinario/actualizarpassword',verificarAutenticacion,actualizarPassword)
router.get('/veterinario/:id',verificarAutenticacion,detalleVeterinario)
router.put('/veterinario/:id',verificarAutenticacion,actualizarPerfil)


export default router;*/


import {Router} from 'express'
import { comprobarToken, confirmEmail, login, nuevoPassword, recuperarPassword, register } from '../controllers/veterinario_controller.js'
const router=Router()
router.post('/registro', register)
router.get('/confirmar/:token', confirmEmail)
router.post('/login', login)
router.get('/recuperar-password', recuperarPassword)
router.get('/recuperar-password/:token', comprobarToken)
router.post('/nuevo-password/:token', nuevoPassword)
export default router

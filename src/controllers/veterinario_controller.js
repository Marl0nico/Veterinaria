/*import Veterinario from "../models/Veterinario.js"
import { sendMailToUser, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import mongoose from "mongoose";

const login = async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(veterinarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await veterinarioBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = generarJWT(veterinarioBDD._id)
    const {nombre,apellido,direccion,telefono,_id} = veterinarioBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:veterinarioBDD.email
    })
}


const perfil =(req,res)=>{
    delete req.veterinarioBDD.token
    delete req.veterinarioBDD.confirmEmail
    delete req.veterinarioBDD.createdAt
    delete req.veterinarioBDD.updatedAt
    delete req.veterinarioBDD.__v
    res.status(200).json(req.veterinarioBDD)
}

const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Veterinario.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    const nuevoVeterinario = new Veterinario(req.body)
    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)
    const token = nuevoVeterinario.crearToken()
    await sendMailToUser(email,token)
    await nuevoVeterinario.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}


const confirmEmail = async (req,res)=>{
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(!veterinarioBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    veterinarioBDD.token = null
    veterinarioBDD.confirmEmail=true
    await veterinarioBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}



const listarVeterinarios = (req,res)=>{
    res.status(200).json({res:'lista de veterinarios registrados'})
}


const detalleVeterinario = async(req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    const veterinarioBDD = await Veterinario.findById(id).select("-password")
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    res.status(200).json({msg:veterinarioBDD})
}


const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email !=  req.body.email)
    {
        const veterinarioBDDMail = await Veterinario.findOne({email:req.body.email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
    veterinarioBDD.nombre = req.body.nombre 
    veterinarioBDD.apellido = req.body.apellido 
    veterinarioBDD.direccion = req.body.direccion 
    veterinarioBDD.telefono = req.body.telefono 
    veterinarioBDD.email = req.body.email 
    await veterinarioBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
}



const actualizarPassword = async (req,res)=>{
    const veterinarioBDD = await Veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}





const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findOne({email})
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = veterinarioBDD.crearToken()
    veterinarioBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}

const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await veterinarioBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}

const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    veterinarioBDD.token = null
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(password)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}



export {
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
	nuevoPassword
}*/

import {sendMailToUser, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import Veterinario from "../models/Veterinario.js"

const register = async (req, res) => { 

    //paso 1 - tomar datos del request
    const {email, password}=req.body //desestructurar el email y password
    //paso 2 - validar datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg: "Lo sentimos, debes llenar todos los campos"}) 
    const verificarEmail=await Veterinario.findOne({email})
    if(verificarEmail) return res.status(400).json({msg: "Lo sentimos, el email ya se encuentra registrado"})
    //paso 3 - interactúa BDD

    const nuevoVeterinario=new Veterinario(req.body)
    console.log(nuevoVeterinario);
    nuevoVeterinario.password=await nuevoVeterinario.encrypPassword(password)
    const token=nuevoVeterinario.crearToken()
    await sendMailToUser(email, token)
    await nuevoVeterinario.save()
    res.status(200).json({msg: "Revisa tu correo electrónico para confirmar tu cuenta"})
}

const confirmEmail = async (req, res) => {
    //paso 1 - tomar datos del request
    const {token}=req.params
    //paso 2 - validar datos
    if(!(token)) return res.status(400).json({msg: "Lo sentimos, no se puede validar la cuenta"})
    const veterinarioBDD=Veterinario.findOne({token})
    if (!veterinarioBDD.token) return res.status(400).json({msg: "La cuenta ya ha sido confirmada"})
    //paso 3 - interactúa BDD
    veterinarioBDD.token=null
    veterinarioBDD.confirmEmail=true
    await veterinarioBDD.save()
    res.status(200).json({msg: "Token confirmado, ya puedes iniciar sesión"})
}
const login = async (req, res) => {
    //paso 1 - tomar datos del request
    const {email, password}=req.body
    //paso 2 - validar datos
    if (Object.values(req.body).includes("")) return res.status(404).json({msg: "Lo sentimos, debes llenar todos los campos"}) //validación de todos los campos deben ser completados
    const veterinarioBDD=await Veterinario.findOne({email}) //buscar dentro de la base un email para su posterior validación
    if (veterinarioBDD?.confirmEmail===false) return res.status(403).json({msg: "Lo sentimos, debes verificar tu cuenta"}) //buscar si existe un registro en base al email
    if(!veterinarioBDD) return res.status(404).json({msg: "Lo sentimos, el usuario no se encuentra registrado"})
    //verificar si el usuario está registrado en la base
    const verificarPassword=await veterinarioBDD.matchPassword(password) //se verifica si la contraseña es correcta o no
    if (!verificarPassword) return res.status(404).json({msg: "Lo sentimos, el password es incorrecto"})
    //paso 3 - interactúa BDD
const tokenJWT=generarJWT(veterinarioBDD._id, "veterinario")
    res.status(200).json({veterinarioBDD, tokenJWT}) //envío de información
}
const recuperarPassword = async (req, res) => {
    //paso 1 - tomar datos del request
    const {email}=req.body
    //paso 2 - validar datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg: "Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD=await Veterinario.findOne({email})
    if(!veterinarioBDD) return res.status(403).json({msg: "Lo sentimos, el usuario no se encuentra registrado"})
    //paso 3 - interactúa BDD
    const token=veterinarioBDD.crearToken()
    veterinarioBDD.token=token
    await sendMailToRecoveryPassword(email, token)
    await veterinarioBDD.save()
    res.status(200).json({msg: "Revisa tu correo electrónico para reestablecer tu cuenta"})
}
const comprobarToken = async (req, res) => {
    //paso 1 - tomar datos del request
    const {token}=req.params
    //paso 2 - validar datos
    if(!(token)) return res.status(400).json({msg: "Lo sentimos, no se puede validar la cuenta"})
    const veterinarioBDD=await Veterinario.findOne({token})
    if (veterinarioBDD?.token!==token) return res.status(404).json({msg: "Lo sentimos, no se puede validar la cuenta"})
    //paso 3 - interactúa BDD
    await veterinarioBDD.save()
    res.status(200).json({msg: "Token confirmado, ya puedes crear tu nuevo password"})
}
const nuevoPassword =async (req, res) => {
    //paso 1 - tomar datos del request
    const {password, confirmPassword}=req.body
    //paso 2 - validar datos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg: "Lo sentimos, debes llenar todos los campos"})
    if (password!==confirmPassword) return res.status(404).json({msg: "Lo sentimos, los passwords no coinciden"})
    const veterinarioBDD=await Veterinario.findOne({token: req.params.token})
    if (veterinarioBDD?.token!==req.params.token) return res.status(404).json({msg: "Lo sentimos, no se puede validar la cuenta"})
    //paso 3 - interactúa BDD
    veterinarioBDD.token=null
    veterinarioBDD.password=await veterinarioBDD.encrypPassword(password)
    await veterinarioBDD.save()
    res.status(200).json({msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password"})
}


export {
    register,
    confirmEmail,
    login,
    recuperarPassword,
    comprobarToken,
    nuevoPassword
}
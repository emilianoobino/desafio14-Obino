import { generateToken } from "../utils/tokenreset.js"
import { EmailManager } from "../services/email.js"
import usersModel from "../models/users.model.js"
import { createHash, isValidPassword } from "../utils/hashbcrypt.js"

const emailManager = new EmailManager()

export class UsersController{
    registerAuthenticate = async(req, res) => {
        let connection = new Date()
        if(!req.user){
            return res.status(400).send("Invalid credentials")
        }
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email,
            rol: req.user.rol,
            cart: req.user.cart,
        }
        req.session.login = true
        res.redirect("/profile")
    }

    failedRegister = (req, res) => {
        res.send("hay un problema con la pagina")
    }

    requestPasswordReset = async(req, res) => {
        const {email} = req.body
        try{
            const user = await usersModel.findOne({email})
            if(!user){
                return res.status(404).send("User no encontrado")
            }
            const token = generateToken()
            user.resetToken = {
                token: token,
                expire: new Date(Date.now() + 3600000)
            }
            await user.save()
            await emailManager.sendEmailResetPass(email, user.first_name, token)
            res.render("confirmacion-envio")
        }
        catch(error){
            res.status(500).send("Error en el server.")
        }
    }

    resetPassword = async(req, res) => {
        const {email, password, token} = req.body
        try{
            const user = await usersModel.findOne({email})
            if(!user){
                return res.render("resetpass", {error: "user no encontrado."})
            }
            const resetToken = user.resetToken
            if(!resetToken || resetToken.token !== token){
                return res.render("getemailpass", {error: "The token is invalid."})
            }
            const fecha = new Date()
            if(fecha > resetToken.expire){
                return res.render("getemailpass", {error: "The token has expired."})
            }
            if(isValidPassword(password, user)){
                return res.render("resetpass", {error: "el nuevo password no puede ser igual al anterior."})
            }

            user.password = createHash(password)
            user.resetToken = undefined
            await user.save()

            return res.redirect("/login")
        }
        catch(error){
            res.status(500).send("Error in the server.")
        }
    }

    changeRolPremium = async(req, res) => {
        const {uid} = req.params
        try {
            const user = await usersModel.findById(uid)
            if(!user) {
                return res.status(404).send("User no encontrado")
            }
            const documentationNeedIt = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"]
            const userDocuments = user.documents.map(doc => doc.name.split('.').slice(0, -1).join('.'))
            const checkDocuments = documentationNeedIt.every(doc => userDocuments.includes(doc))
            console.log(checkDocuments)
            if(!checkDocuments){
                return res.status(404).send("no tienes documentos para ser Premium user.")
            }
            const newRol = user.rol === "User" ? "Premium" : "User"
            const updateRol = await usersModel.findByIdAndUpdate(uid, {rol: newRol})
            res.json(updateRol)
        } catch (error) {
            res.status(500).send("hay un error en el server.")
        }
    }

    documentationToChangeRol = async(req, res) => {
        const {uid} = req.params
        const uploadedDocuments = req.files
        try{
            const user = await usersModel.findById(uid)
            if(!user) {
                return res.status(404).send("User not found")
            }
            if(uploadedDocuments){
                if (uploadedDocuments.document){
                    user.documents = user.documents.concat(uploadedDocuments.document.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })))
                }
                if (uploadedDocuments.products){
                    user.documents = user.documents.concat(uploadedDocuments.products.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })))
                }
                if (uploadedDocuments.profile){
                    user.documents = user.documents.concat(uploadedDocuments.profile.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })))
                }
                await user.save()
                res.status(200).send("actualizamos los documentos.")
            }
        }
        catch(error){
            res.status(500).send("hay un error en el server.")
        }
        }
}



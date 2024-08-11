import ticketsModel from "../models/tickets.model.js"
import usersModel from "../models/users.model.js"
import { CartService } from "../services/carts.service.js"
import { ProductService } from "../services/products.service.js"
import { logger } from "../utils/logger.js"
import { EmailManager } from "../services/email.js"

const emailManager = new EmailManager()

export class CartsController {
    newCart = async(req, res) => {
        try{
            const cart = await CartService.createCart([])
            res.send({message: 'hay un nuevo carrito', cart: cart})
        }
        catch(error){
            res.status(500).json('Hay un error en el servidor, no pudimos crear un nuevo carrito.')
            logger.error('no pudimos crear un nuevo carrito.')
        }
    }

    cartIdFound = async(req, res) => {
        let id = req.params.id
        try{
            const findId = await CartService.findId(id)
            res.json(findId)
            logger.info('carrito encontrado.')
        }
        catch(error){
            res.status(500).json('no pudimos encontrar el Id del carrito.')
            logger.error('ID del carrito no encontrado.')
        }
    }

    addProdtotheCart = async(req, res) => {
        const user = req.user || 'Admin'
        try{
            let cid = req.params.cid
            let pid = req.params.pid
            const findIdProd = await ProductService.findIdProd(pid)
            const product = findIdProd[0]
            if(product.owner == user.email){
                return res.status(404).json({ message: 'no puedes comprar tus propios productos.'})
            }
            await CartService.addProductToTheCart(cid, pid)
            res.status(200).json({ message: 'el producto ha sido añadido.'})
            logger.info('añadimos este producto al carrito.')
        }
        catch(error){
            res.status(500).json('Hay un error en el servidor que no nos deja añadir el producto al carrito.')
            logger.error('No pudimos agregar este producto al carrito, verifique el producto antes de volver a intentarlo.')
        }
    }

    deleteProdFromCart = async(req, res) => {
        try{
            let cid = req.params.cid
            let pid = req.params.pid
            await CartService.deleteaProductFromTheCart(cid, pid)
            res.send('el producto ha sido eliminado del carrito.')
            logger.info('eliminamos el producto del carrito.')
        }
        catch(error){
            res.status(500).json('Hay un error con el producto que deseas eliminar.')
            logger.error('no pudimos eliminar el producto.')
        }
    }

    updateProdCart = async(req, res) => {
        let cid = req.params.cid
        let prods = req.body
        try{
            await CartService.updateProductsFromCart(cid,prods)
            res.send('los productos han sido actualizados.')
            logger.info('actualizamos el producto.')
        }
        catch(error){
            res.status(500).json('No cambiamos el producto, verifique la identificación y las cosas que desea cambiar en el producto.')
            logger.error('Hay un problema con el producto que deseas actualizar.')
        }
    }

    updateQuantity = async(req, res) => {
        let cid = req.params.cid
        let pid = req.params.pid
        const quantityProd = req.body
        try{
            await CartService.updateQuantity(cid,pid, quantityProd)
            res.send('La cantidad del producto ha sido cambiada.')
            logger.info('Nosotros cambiamos la cantidad del producto.')
        }
        catch(error){
            res.status(500).json('Hay un problema al cambiar la cantidad de este producto.')
            logger.error('no pudimos cambiar la cantidad.')
        }
    }

    deleteAllFromCart = async(req, res) => {
        let cid = req.params.cid
        try{
            await CartService.deleteAllProdsInTheCart(cid)
            res.send('todos los productos han sido eliminados.')
            logger.info('eliminamos todos los productos del carrito.')
        }
        catch(error){
            res.status(500).json('hay un error con el carrito.')
            logger.error('no pudimos eliminar los productos del carrito')
        }
    }

    purchase = async(req, res) => {
        let cid = req.params.cid
        try{
            const notAvailable = []
            const findIdCart = await CartService.getCartById(cid)
            const prodsCart = findIdCart.products
            let totalPrice = 0
            for (const prod of prodsCart){
                const prodId = prod.product
                const findProd = await ProductService.findIdProd(prodId)
                const product = findProd[0]
                findProd.map(p => {
                    if(p.stock >= prod.quantity){
                        totalPrice += prod.quantity * product.price
                        p.stock -= prod.quantity
                        p.save()
                    }
                    else{
                        notAvailable.push({product: p, quantity: prod.quantity})
                    }
                })
                }

            if (totalPrice === 0) {
                return res.status(400).json({ error: 'No hay productos disponibles para comprar.' })
            }
            const cartUser = await usersModel.findOne({cart: cid})
            const getTicket = await ticketsModel.create({
                purchaser: cartUser.email,
                amount: totalPrice
            })
            await getTicket.save()
            await emailManager.sendEmailBuyCart(cartUser.email, cartUser.first_name, getTicket.code)

            const userCart = await CartService.findId(cid)
            userCart.products = notAvailable
            await userCart.save()

            res.send('has comprado este carrito.')
        }
        catch(error){
            res.status(500).json({ error: 'hay unn error en el server.' })
        }
    }
}







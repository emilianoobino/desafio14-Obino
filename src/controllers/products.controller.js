

import { ProductService } from "../services/products.service.js"
import { getProductsFaker } from "../utils/faker.js"
import customError from "../services/errors/custom-error.js"
import generateErrorProds from "../services/errors/infoProds.js"
import { Errors } from "../services/errors/enum.js"
import { logger } from "../utils/logger.js"

export class ProductsController {
    prods = async(req, res) => {
        try{
            const products = await ProductService.getAllProdsViews(req)
            res.status(200).json(products.response)
            logger.info('mostrando productos')
        }
        catch(error){
            res.status(500).send("hay un error con el server.")
            logger.error('no pudimos encontrar los productos.')
        }
    }

    findId = async(req, res) => {
        let pid = req.params.pid
        try{
            const findProd = await ProductService.findIdProd(pid)
            res.status(200).json(findProd)
            logger.info('encontramos el ID de los productos.')
        }
        catch(error){
            res.status(500).send("hay un error con el server.")
            logger.error('hay un error con el ID / Item no encontrado.')
        }
    }

    addProd = async(req, res, next) => {
        try{
            const newProduct = req.body
            if(typeof newProduct.price !== "number" || typeof newProduct.stock !== "number"){
                return res.status(500).json('La variable stock o precio no es un número.')
            }
            if(!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.thumbnail || !newProduct.code || !newProduct.stock || !newProduct.status || !newProduct.category){
                throw customError.createError({
                    name: "New Product",
                    cause: generateErrorProds({newProduct}),
                    message: "Error al intentar crear un producto",
                    code: Errors.TYPE_INVALID
                })
            }
            const product = await ProductService.addProducts(newProduct)
            res.status(200).send({message: 'This Product has been added', product: product})
        }
        catch(error){
            next(error)
        }
    }

    changeProd = async(req, res) => {
        let pid = req.params.pid
        const prod = req.body
        try{
            const prodChange = await ProductService.updateProd(pid, prod)
            res.status(200).send({message: 'This Product has been changed', product: prodChange})
            logger.info('Cambiamos algunas cosas en el producto.')
        }
        catch(error){
            res.status(500).send("hay un error en el server.")
            logger.error('no pudimos cambiar el producto.')
        }
    }

    deleteProd = async(req, res) => {
        let pid = req.params.pid
        try{
            const delProduct = await ProductService.deleteProduct(pid)
            res.status(200).send({message: 'This Product has been eliminated', product: delProduct})
            logger.error('eliminamos el producto.')
        }
        catch(error){
            res.status(500).send("hay un error con el server.")
            logger.error('no pudimos eliminar el producto.')
        }
    }

    mocks = (req, res) => {
        const products = []
        try{
            for(let i = 0; i < 100; i++){
                products.push(getProductsFaker())
            }
            res.status(200).json(products)
        }
        catch(error){
            res.status(500).json({message: 'We could not get faker products.'})
        }
    }
}
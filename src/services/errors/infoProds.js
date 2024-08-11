const generateErrorProds = ({newProduct}) => {
    return `Hay datos incompletos o no válidos, necesitamos recibir los siguientes datos:
    * title: String, pero recibimos: ${newProduct.title}
    * description: String, pero recibimos: ${newProduct.description}
    * price: Number, pero recibimos: ${newProduct.price}
    * thumbnail: String, pero recibimos: ${newProduct.thumbnail}
    * code: String, pero recibimos: ${newProduct.code}
    * stock: Number, pero recibimos: ${newProduct.stock}
    * status: Boolean, pero recibimos: ${newProduct.status}
    * category: String, pero recibimos: ${newProduct.category}`
}

export default generateErrorProds
const generateError = (user) => {
    return `Hay datos incompletos o no válidos, necesitamos recibir los siguientes datos:
    * First_name: String, pero recibimos: ${user.first_name}
    * Last_name: String, pero recibimos: ${user.last_name}
    * Email: String, pero recibimos: ${user.email}`
}

export default generateError



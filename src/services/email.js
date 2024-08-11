import nodemailer from 'nodemailer'

export class EmailManager{
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: "chaval198678@gmail.com",
                pass: "emud itxo icac omvq"
            }
        })
    }

    async sendEmailBuyCart(email, first_name, ticket){
        try{
            const mailOptions = {
                from: `"Tony's Funko" <chaval198678@gmail.com>`,
                to: email,
                subject: "confirmación de Compra",
                html: `
                    <h1> Recibo de compra </h1>
                    <p> Gracias por tu compra, ${first_name} </p>
                    <p> El número de orden es: ${ticket} </p>
                `
            }
            await this.transporter.sendMail(mailOptions)
        }
        catch (error){
            console.log('failed')
        }
    }

    async sendEmailResetPass(email, first_name, token){
        const mailOptions = {
            from: `"Tony's Funko" <chaval198678@gmail.com>`,
            to: email,
            subject: 'Restablecimiento de Contraseña',
            html: `
                <h1> restablecimiento de contraseña </h1>
                <p> Saludos ${first_name}! </p>
                <p> Has solicitado restablecer tu contraseña. Utiliza el siguiente código para cambiar tu contraseña:</p>
                <strong> ${token} </strong>
                <br>
                <a href="http://localhost:8080/reset-password"> restablecer contraseña </a>
                <p> este codigo expira en 1 hora.</p>
            `
        }
        await this.transporter.sendMail(mailOptions)
        console.log("error al enviar correo de restablecimiento")
    }

}


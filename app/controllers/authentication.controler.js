import bcryptjs from 'bcryptjs';
import jsonwebtoken  from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

export const usuarios = [{
    user: "a",
    email: "a@a.com",
    password: "$2a$05$WMwVkW3/PkokAALPCszHN.khcbpniI/KaIOCt4u9oKrhoMsHGYdJW"
}]


async function login(req,res){
    console.log(req.body);
    const user = req.body.user;
    const password = req.body.password;
    if(!user || !password){
        return res.status(400).send({status: "Error", message: "Los campos estan incompletos"});
    }
    
    const usuarioARevisar = usuarios.find(usuario => usuario.user === user)
    if(!usuarioARevisar){
        return res.status(400).send({status: "Error", message: "Error durante el login"});
    }
    const loginCorrecto = await bcryptjs.compare(password, usuarioARevisar.password)
    console.log(loginCorrecto);

    if(!loginCorrecto){
        return res.status(400).send({status: "Error", message: "Error durante el login"});
    }
    const token = jsonwebtoken.sign(
        {user: usuarioARevisar.user},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRATION});
        
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 *60 * 1000),
            path: "/",
        }
        res.cookie("jwt",token, cookieOptions);
        res.send({status: "ok", message: "Usario Logeado", redirect: "/admin"});
    
    
    
}




async function register(req,res){
    console.log(req.body);
    const user = req.body.user;
    const email = req.body.email;
    const password = req.body.password;
    if(!user || !email || !password){
        return res.status(400).send({status: "Error", message: "Los campos estan incompletos"});
    }
    const usuarioARevisar = usuarios.find(usuario => usuario.user === user)
    if(usuarioARevisar){
        return res.status(400).send({status: "Error", message: "El usuario ya existe"});
    }
    //salt es para que el hash sea diferente cada vez
    const salt = await bcryptjs.genSalt(5);
    //hashPassword es el password encriptado
    const hashPassword = await bcryptjs.hash(password, salt);
    const nuevoUsuario = {
        user, email, password: hashPassword
    }
    console.log(nuevoUsuario);
    usuarios.push(nuevoUsuario);

    return res.status(201).send({status: "ok", message: `Usuario ${nuevoUsuario.user} creado`, redirect: "/"});


}

export const methods = {
    login,
    register
}
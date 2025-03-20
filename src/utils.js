import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;


// isValidPassword, generateJWToken

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));


export const isValidPassword = (user, password) => {
    console.log(`Validando contraseña: user-password: ${user.password}, password: ${password}`);
    return bcrypt.compareSync(password, user.password);
}



export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const generateJWToken = (user) => {
    console.log("Generando JWT para el usuario:", user);
    return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' });
};



export const passportCall = (strategy) => {

    return async (req, res, next) => {
        console.log("Llamando a la estrategia: ");
        console.log(strategy);

        passport.authenticate(strategy, function (err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({ error: info.messages ? info.messages : info.toString() })
            }

            console.log("Usuario autenticado: ");
            console.log(user);
            req.user = user;

            next()

        })(req, res, next);
    }
}


export const cookieExtractor = req => {
    let token = null;
    console.log("Extrayendo el token desde las cookies...");
    console.log("req.cookies", req);
    console.log("req.cookies", req.cookies);

    if (req && req.cookies) {
        console.log("Cookies presentes: ");
        console.log(req.cookie);
        token = req.cookies['jwtCookieToken'];


        console.log("Token extraído de las cookies:");
        console.log(token);
    }

    return token;
}


// Maneja el rol del user
export const authorization = (role) => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send("No autorizado: Usuario no encontrado en el JWT");


        if (req.user.role !== role) {
            return res.status(403).send("Prohibido: El usuario no tiene permisos con este rol, por favor comuníquese con el administrador");
        }
        console.log("Acceso autorizado para el rol:", req.user.role);

        next();
    }
}
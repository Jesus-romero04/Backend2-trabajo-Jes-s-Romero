import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import dotenv from 'dotenv'

import cookieParser from 'cookie-parser';
import passport from 'passport';
import initializePassport from './config/passport.config.js';

// import Routes
import sessionsRouter from './routes/sessions.router.js'
import usersViewRouter from './routes/users.views.router.js';



const app = express();
dotenv.config() // Esto es para las variables de entorno

//JSON settings:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Config HBS
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));


//Cookies
//router.use(cookieParser());
app.use(cookieParser("CoderS3cr3tC0d3"));

// COnfiguracion de PASSPORT
initializePassport() // <- Ejecucioon
app.use(passport.initialize())


//Declare routers:
app.use("/users", usersViewRouter); // <- Es donde esta el perfil de user,  formularios [ForemLogin, FormRegister ]
app.use("/api/sessions", sessionsRouter); // <- Es donde estan las APIs de register y Login


const SERVER_PORT = process.env.SERVER_PORT
app.listen(SERVER_PORT, () => {
    console.log("Servidor escuchando por el puerto: " + SERVER_PORT);
});

const urlMongo = process.env.MONGO_URL
const connectMongoDB = async () => {
    try {
        await mongoose.connect(urlMongo);
        console.log("Conectado con exito a MongoDB usando Moongose.");
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }
};
connectMongoDB();
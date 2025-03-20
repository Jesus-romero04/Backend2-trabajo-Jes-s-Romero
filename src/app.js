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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));



app.use(cookieParser("process.env.COOKIE_SECRET"));


initializePassport() /
app.use(passport.initialize())



app.use("/users", usersViewRouter); 
app.use("/api/sessions", sessionsRouter); // 


const SERVER_PORT = process.env.SERVER_PORT
app.listen(SERVER_PORT, () => {
    console.log("Servidor escuchando por el puerto: " + SERVER_PORT);
});

const urlMongo = process.env.MONGO_URL
const connectMongoDB = async () => {
    try {
        await mongoose.connect(urlMongo);
        console.log("Conexión exitosa con MongoDB usando Mongoose.");
    } catch (error) {
        console.error("Error al conectar con MongoDB usando Mongoose: " + error);
        process.exit();
    }
};
connectMongoDB();
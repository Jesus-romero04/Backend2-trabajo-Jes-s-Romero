import express from "express";
import handlebars from "express-handlebars";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";
import viewsRouter from "./routes/viewsRouter.js";
import cartRouter, { initializeCartRouter } from "./routes/cartRouter.js";
import productRouter from "./routes/productRouter.js";
import authRouter from "./routes/auth.routes.js";
import ProductManager from "./dao/managersDB/productManager.js";
import ProductFileManager from "./dao/managersFS/productManager.js";
import CartManager from "./dao/managersDB/cartManager.js";
import CartFileManager from "./dao/managersFS/cartManager.js";
import helpers from "./utils/helpersHandlebars.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import sessionsRouter from "./routes/sessions.router.js";
import "./database.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import flash from 'connect-flash';

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const newHelpers = { ...helpers };
newHelpers.isSelected = function (value, sort) {
  return value === sort ? "selected" : "";
};

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true})); 
app.use(cookieParser());
app.use(flash());

// Initialize Passport before sessions
initializePassport();
app.use(passport.initialize());

// Session configuration
app.use(session({
  secret: "secretCoder",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://ziku:zikupass@ecommerceropa-cluster.psckb.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerceropa-cluster",
    ttl: 100
  })
}))

app.use(passport.session());

process.env.USE_MONGODB_FOR_PRODUCTS = "true";
process.env.USE_MONGODB_FOR_CARTS = "true"; 
process.env.MONGODB_URI =
  "mongodb+srv://ziku:zikupass@ecommerceropa-cluster.psckb.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerceropa-cluster";

const DB_URL = process.env.MONGODB_URI;

app.engine("handlebars", handlebars.engine({ helpers: newHelpers }));
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

async function connectToDatabase() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Conectado con MongoDB");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1);
  }
}

const useMongoDBForProducts = process.env.USE_MONGODB_FOR_PRODUCTS === "true";
const useMongoDBForCarts = process.env.USE_MONGODB_FOR_CARTS === "true";

let productManager;
let cartManager;

if (useMongoDBForProducts) {
  productManager = new ProductManager();
} else {
  productManager = new ProductFileManager();
}

if (useMongoDBForCarts) {
  cartManager = new CartManager();
} else {
  cartManager = new CartFileManager();
}

connectToDatabase()
  .then(() => {
    initializeCartRouter(useMongoDBForCarts);

    io.on("connection", async (socket) => {
      const products = await productManager.getAllProducts();
      socket.emit("products", products);

      socket.on("getProducts", async () => {
        const products = await productManager.getAllProducts();
        socket.emit("products", products);
      });

      socket.on("addProduct", async (product) => {
        await productManager.addProduct(product);
        const products = await productManager.getAllProducts();
        io.emit("products", products); 
      });

      socket.on("deleteProduct", async (productId) => {
        await productManager.deleteProduct(productId);
        const products = await productManager.getAllProducts();
        io.emit("products", products); 
      });

      socket.on("disconnect", () => {});
    });

    app.use("/", viewsRouter(useMongoDBForProducts, useMongoDBForCarts));
    app.use("/api/products", productRouter(useMongoDBForProducts));
    app.use("/api/carts", cartRouter);
    app.use(
      "/realtimeproducts",
      viewsRouter(useMongoDBForProducts, useMongoDBForCarts)
    );
    app.use("/api/sessions", sessionsRouter);
    app.use('/api/auth', authRouter);

    server.listen(PORT, () => {
      console.log(`Servidor escuchando en PORT ${PORT}`);
      console.log(
        `Puedes acceder con el link: http://localhost:${PORT}/`
      );
    });
  })
  .catch((err) => console.error("Error al conectar a la base de datos:", err));

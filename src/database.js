import mongoose from "mongoose";

mongoose.connect("mongodb+srv://ziku:zikupass@ecommerceropa-cluster.psckb.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerceropa-cluster")
    .then(() => console.log("Conexion Exitosa!"))
    .catch((error) => console.log("Error al conectar", error))
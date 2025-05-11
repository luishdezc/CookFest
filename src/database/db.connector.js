
import mongoose from "mongoose";
import Config from "../config/config.js";

export const dbConnect = async () => {
  try {
    await mongoose.connect(Config.DB_HOST);
    console.log("Conexión exitosa a MongoDB Atlas");
  } catch (error) {
    console.error("Error al conectarse a la base de datos: ", error);
  }
};

export const dbDisconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log("Desconectado de la base de datos");
  } catch (error) {
    console.error("Error al desconectarse de la base de datos: ", error);
  }
};
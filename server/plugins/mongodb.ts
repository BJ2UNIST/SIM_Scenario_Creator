import { Nitro } from "nitropack";
import mongoose from "mongoose";

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig();

  try {
    const db = mongoose.connection;
    db.on("connected", () => {
      console.log("[mongodb] connected...");
    });
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("disconnected", () => {
      console.log("[mongodb] disconnected...");
      setTimeout(() => {
        mongoose.connect(config.mongodbUri);
      }, 5000);
    });

    await mongoose.connect(config.mongodbUri);
  } catch (e) {
    console.error(e);
  }
};

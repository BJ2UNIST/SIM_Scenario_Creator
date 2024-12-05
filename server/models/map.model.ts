import { Schema, model } from "mongoose";

const MapSchema = new Schema(
  {
    mapId: {
      type: String,
      unique: true,
      trim: true,
    },
    mapName: String,
    mapOwner: String,
  },
  {
    timestamps: true, // createAt과 updateAt 필드를 자동으로 생성
  }
);

export const Map = model("Map", MapSchema);

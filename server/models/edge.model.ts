import { Schema, model } from "mongoose";

const lineStringSchema = new Schema({
  type: {
    type: String,
    enum: ["LineString"],
    required: true,
  },
  coordinates: {
    type: [[Number, Number]],
    required: true,
  },
});

const EdgeSchema = new Schema(
  {
    mapId: { type: String, trim: true },
    projectId: { type: String, trim: true },
    envId: { type: String, trim: true },
    id: { type: String, trim: true }, // edgeId
    type: String,
    properties: Object,
    geometry: lineStringSchema,
  },
  {
    timestamps: true, // createAt과 updateAt 필드를 자동으로 생성
  }
);

EdgeSchema.index(
  { mapId: 1, projectId: 1, envId: 1, id: 1, geometry: "2dsphere" },
  { unique: true }
);

export const Edge = model("Edge", EdgeSchema);

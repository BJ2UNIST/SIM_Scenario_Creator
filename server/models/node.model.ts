import { Schema, model } from "mongoose";

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const NodeSchema = new Schema(
  {
    mapId: { type: String, trim: true },
    projectId: { type: String, trim: true },
    envId: { type: String, trim: true },
    id: { type: String, trim: true },
    type: String,
    properties: Object,
    geometry: pointSchema,
  },
  {
    timestamps: true,
  }
);

NodeSchema.index(
  { mapId: 1, projectId: 1, envId: 1, id: 1, geometry: "2dsphere" },
  { unique: true }
);

export const Node = model("Node", NodeSchema);

import { Schema, model } from "mongoose";

const EnvSchema = new Schema(
  {
    projectId: {
      type: String,
      required: true,
    },
    mapId: {
      type: String,
      trim: true,
    },
    envId: {
      type: String,
      trim: true,
    },
    envName: String,
    envOwner: String,
  },
  {
    timestamps: true,
  }
);

EnvSchema.index({ mapId: 1, projectId: 1, envId: 1, nodeId: 1 });

export const Env = model("Env", EnvSchema);

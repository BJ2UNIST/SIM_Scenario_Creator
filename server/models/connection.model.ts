import { Schema, model } from "mongoose";

const ConnectionItem = new Schema({
  from: String,
  to: String,
  fromLane: Number,
  toLane: Number,
  label: String,
});

// 커넥션 정보 구분
// mapId + nodeId + projectId + envId

const ConnectionSchema = new Schema(
  {
    mapId: { type: String, trim: true },
    projectId: { type: String, trim: true },
    envId: { type: String, trim: true },
    nodeId: { type: String, trim: true },
    connections: [ConnectionItem],
  },
  {
    timestamps: true,
  }
);

ConnectionSchema.index({ mapId: 1, projectId: 1, envId: 1, nodeId: 1 });

export const Connection = model("Connection", ConnectionSchema);

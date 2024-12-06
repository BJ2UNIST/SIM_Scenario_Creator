import { Schema, model } from "mongoose";

const Phase = new Schema({
  state: String,
  duration: Number,
});

const ScheduleItem = new Schema({
  offset: Number,
  phase: [Phase],
});

// 커넥션 정보 구분
// mapId + nodeId + projectId + envId

const SignalSchema = new Schema(
  {
    mapId: { type: String, trim: true },
    projectId: { type: String, trim: true },
    envId: { type: String, trim: true },
    nodeId: { type: String, trim: true },
    schedules: [ScheduleItem],
  },
  {
    timestamps: true,
  }
);

SignalSchema.index({ mapId: 1, projectId: 1, envId: 1, nodeId: 1 });

export const Signal = model("Signal", SignalSchema);


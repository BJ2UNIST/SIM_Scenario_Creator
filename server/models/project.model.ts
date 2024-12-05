import { Schema, model } from "mongoose";

const ProjectSchema = new Schema(
  {
    projectId: {
      type: String,
      unique: true,
      trim: true,
    },
    projectName: String,
    projectOwner: String,
  },
  {
    timestamps: true, // createAt과 updateAt 필드를 자동으로 생성
  }
);

export const Project = model("Project", ProjectSchema);

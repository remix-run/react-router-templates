import { Schema, model, Document } from "mongoose";

interface ITodo extends Document {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Also create a plain version for serialized data
interface ITodoPlain {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        if (ret._id) {
          ret._id = ret._id.toString();
        }
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        if (ret._id) {
          ret._id = ret._id.toString();
        }
        return ret;
      },
    },
  }
);

export const Todo = model<ITodo>("Todo", todoSchema);
export type { ITodo, ITodoPlain };

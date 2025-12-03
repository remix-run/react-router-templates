import mongoose from "mongoose";
import { redirect } from "react-router";
import type { Route } from "./+types/delete";
import { Todo } from "~/model/todo";

export async function action({ params }: Route.ActionArgs) {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  const { id } = params;

  try {
    await Todo.findByIdAndDelete(id);
    return redirect("/todos");
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return redirect("/todos");
  }
}

// This route is action-only, no component needed
export default function DeleteTodo() {
  return null;
}

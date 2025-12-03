import mongoose from "mongoose";
import { redirect } from "react-router";
import type { Route } from "./+types/toggle";
import { Todo } from "~/model/todo";

export async function action({ params }: Route.ActionArgs) {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  const { id } = params;

  try {
    console.log(id);
    const todo = await Todo.findById(id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    await Todo.findByIdAndUpdate(id, { completed: !todo.completed });
    return redirect("/todos");
  } catch (error) {
    console.error("Failed to toggle todo:", error);
    return redirect("/todos");
  }
}

// This route is action-only, no component needed
export default function ToggleTodo() {
  return null;
}

import mongoose from "mongoose";
import type { Route } from "../+types/home";
import { Todos } from "~/todos/todos";
import { Todo } from "~/model/todo";
import type { ITodoPlain } from "~/model/todo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
  const todos = await Todo.find({}).lean();

  // Ensure _id is always a string
  const todosWithStringIds = todos.map((todo) => ({
    ...todo,
    _id: todo._id.toString(),
  }));

  return { todos: todosWithStringIds };
}

export default function todos({
  loaderData,
}: {
  loaderData: {
    message: string;
    todos: ITodoPlain[];
  };
}) {
  console.log(loaderData);
  return <Todos todos={loaderData.todos} />;
}

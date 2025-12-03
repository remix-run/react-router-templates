import mongoose from "mongoose";
import { redirect } from "react-router";
import type { Route } from "./+types/create";
import { Todo } from "~/model/todo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Todo - React Router App" },
    { name: "description", content: "Create a new todo item" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || title.trim().length === 0) {
    return {
      error: "Title is required",
      values: { title: "", description: description || "" },
    };
  }

  try {
    await Todo.create({
      title: title.trim(),
      description: description?.trim() || "",
    });

    return redirect("/todos");
  } catch (error) {
    console.error("Failed to create todo:", error);
    return {
      error: "Failed to create todo. Please try again.",
      values: { title, description: description || "" },
    };
  }
}

export default function CreateTodo({ actionData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create New Todo
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Add a new task to your todo list
          </p>
        </div>

        <form method="post" className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={actionData?.values?.title || ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:text-sm"
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={actionData?.values?.description || ""}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:text-sm"
                placeholder="Optional description..."
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
              <div className="text-sm text-red-700 dark:text-red-200">
                {actionData.error}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Create Todo
            </button>
            <a
              href="/todos"
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}

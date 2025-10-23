import { NavLink, Form } from "react-router";
import logoDark from "../welcome/logo-dark.svg";
import logoLight from "../welcome/logo-light.svg";
import type { ITodoPlain } from "~/model/todo";

export function Todos({ todos }: { todos: ITodoPlain[] }) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-64">
              <img
                src={logoLight}
                alt="React Router"
                className="block w-full dark:hidden"
              />
              <img
                src={logoDark}
                alt="React Router"
                className="hidden w-full dark:block"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MongoDB template
          </h1>
        </header>

        {/* Add Todo Button */}
        <div className="mb-8 flex justify-end">
          <NavLink
            to="new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Todo
          </NavLink>
        </div>

        {/* Todo List */}
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          {!todos?.length ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No todos yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Get started by creating your first todo item.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Todos ({todos.length})
                </h2>
              </div>
              {todos.map((todo) => {
                return (
                  <div
                    key={todo._id?.toString()}
                    className="group relative px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <Form
                          method="post"
                          action={`/todos/${todo._id?.toString()}/toggle`}
                        >
                          <button
                            type="submit"
                            className={`h-5 w-5 rounded border-2 transition-colors hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                              todo.completed
                                ? "border-green-500 bg-green-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {todo.completed && (
                              <svg
                                className="h-3 w-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>
                        </Form>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-sm font-medium ${
                            todo.completed
                              ? "text-gray-500 line-through dark:text-gray-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p
                            className={`mt-1 text-sm ${
                              todo.completed
                                ? "text-gray-400 line-through dark:text-gray-500"
                                : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {todo.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Created:{" "}
                            {new Date(todo.createdAt).toLocaleDateString()}
                          </span>
                          {todo.updatedAt !== todo.createdAt && (
                            <span>
                              • Updated:{" "}
                              {new Date(todo.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Form
                            method="post"
                            action={`/todos/${todo._id}/delete`}
                          >
                            <button
                              type="submit"
                              className="rounded p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete todo"
                              onClick={(e) => {
                                if (
                                  !confirm(
                                    "Are you sure you want to delete this todo?"
                                  )
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </Form>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {todos.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Todos
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {todos.filter((todo) => todo.completed).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {todos.filter((todo) => !todo.completed).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

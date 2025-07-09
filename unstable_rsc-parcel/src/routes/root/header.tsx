"use client";

import { Link, NavLink, useNavigation } from "react-router";

export function Header() {
  const navigation = useNavigation();

  return (
    <header className="sticky inset-x-0 top-0 z-50 bg-background border-b">
      <div className="mx-auto max-w-screen-xl px-4 relative flex h-16 items-center justify-between gap-4 sm:gap-8">
        <div className="flex items-center gap-4">
          <Link to="/">React Router 🚀</Link>
          <nav>
            <ul className="gap-4 flex">
              <li>
                <NavLink
                  to="/"
                  className="text-sm font-medium hover:opacity-75 aria-[current]:opacity-75"
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className="text-sm font-medium hover:opacity-75 aria-[current]:opacity-75"
                >
                  About
                </NavLink>
              </li>
            </ul>
          </nav>
          <div>{navigation.state !== "idle" && <p>Loading...</p>}</div>
        </div>
      </div>
    </header>
  );
}

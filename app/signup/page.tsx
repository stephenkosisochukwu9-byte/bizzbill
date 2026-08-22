"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // Authentication will be connected here later.
    console.log({
      name,
      email,
      password,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-md">

        {/* LOGO */}

        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-bold text-gray-900"
          >
            Bizz<span className="text-blue-600">Bill</span>
          </Link>

          <p className="mt-2 text-sm font-medium text-gray-600">
            Create your account
          </p>
        </div>

        {/* SIGNUP CARD */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <h1 className="text-2xl font-bold text-gray-900">
            Sign Up
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Create an account to manage your invoices and receipts.
          </p>

          <form
            onSubmit={handleSignup}
            className="mt-7 space-y-5"
          >

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Create Account
            </button>

          </form>

          {/* LOGIN */}

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Log in
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}



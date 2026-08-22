"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLogo(file);

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // Account and business profile will be connected
    // to authentication/database here later.

    console.log({
      name,
      email,
      password,
      businessName,
      businessAddress,
      socialHandle,
      logo,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">

        {/* LOGO */}

        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-bold text-gray-900"
          >
            Bizz<span className="text-blue-600">Bill</span>
          </Link>

          <p className="mt-2 text-sm font-medium text-gray-600">
            Create your BizzBill account
          </p>
        </div>

        {/* SIGNUP CARD */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Create Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Create your account and set up your business profile.
          </p>

          <form
            onSubmit={handleSignup}
            className="mt-8 space-y-8"
          >

            {/* ========================= */}
            {/* ACCOUNT INFORMATION */}
            {/* ========================= */}

            <section>

              <h2 className="text-lg font-bold text-gray-900">
                Account Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your personal account details.
              </p>

              <div className="mt-5 space-y-5">

                {/* FULL NAME */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Full name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email address"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Password must be at least 6 characters.
                  </p>
                </div>

              </div>
            </section>

            {/* DIVIDER */}

            <div className="border-t border-gray-200" />

            {/* ========================= */}
            {/* BUSINESS INFORMATION */}
            {/* ========================= */}

            <section>

              <h2 className="text-lg font-bold text-gray-900">
                Business Information
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                This information can be displayed automatically
                on your invoices and receipts.
              </p>

              <div className="mt-5 space-y-5">

                {/* BUSINESS NAME */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Business name
                  </label>

                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) =>
                      setBusinessName(e.target.value)
                    }
                    placeholder="Enter your business name"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* BUSINESS ADDRESS */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Business address
                  </label>

                  <textarea
                    value={businessAddress}
                    onChange={(e) =>
                      setBusinessAddress(e.target.value)
                    }
                    placeholder="Enter your business address"
                    required
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* SOCIAL HANDLE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Social media handle
                  </label>

                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) =>
                      setSocialHandle(e.target.value)
                    }
                    placeholder="@yourbusiness"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Example: @bizzbill
                  </p>
                </div>

                {/* BUSINESS LOGO */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Business logo
                  </label>

                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">

                    <div className="flex flex-col items-center justify-center text-center">

                      {logoPreview ? (
                        <div className="mb-4">

                          <img
                            src={logoPreview}
                            alt="Business logo preview"
                            className="h-24 w-24 rounded-xl border border-gray-200 bg-white object-contain p-2 shadow-sm"
                          />

                          <p className="mt-2 text-xs font-medium text-gray-600">
                            Logo preview
                          </p>

                        </div>
                      ) : (
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-10 w-10"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25V16.5M3 16.5A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5M3 16.5l4.5-4.5 3.75 3.75 2.25-2.25L21 19.5"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 8.25h.008v.008H8.25V8.25Z"
                            />
                          </svg>
                        </div>
                      )}

                      <label
                        htmlFor="business-logo"
                        className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        {logo ? "Change Logo" : "Upload Logo"}
                      </label>

                      <input
                        id="business-logo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />

                      <p className="mt-3 text-xs text-gray-500">
                        PNG, JPG or WEBP
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-blue-700"
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


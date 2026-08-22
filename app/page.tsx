"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  name?: string | null;
  business_name?: string | null;
  address?: string | null;
  social_handle?: string | null;
};

export default function Home() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from("business_profiles")
          .select("business_name, address, social_handle")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile fetch error:", error);
        }

        setProfile({
          name: user.user_metadata?.name || user.user_metadata?.full_name,
          business_name: profileData?.business_name,
          address: profileData?.address,
          social_handle: profileData?.social_handle,
        });
      }

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setAccountOpen(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          {/* Logo */}
          <h1 className="text-2xl font-bold text-gray-900">
            Bizz<span className="text-blue-600">Bill</span>
          </h1>

          {/* Account */}
          <div className="relative">

            {loading ? (
              <div className="h-11 w-11 rounded-full border border-gray-300 bg-gray-100 animate-pulse" />
            ) : user ? (
              <>
                {/* Logged-in account button */}
                <button
                  type="button"
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-label="Open account"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                    />
                  </svg>
                </button>

                {/* Account dropdown */}
                {accountOpen && (
                  <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                    {/* Account header */}
                    <div className="border-b bg-gray-50 px-5 py-4">
                      <p className="text-lg font-bold text-gray-950">
                        {profile?.name || "My Account"}
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-700">
                        {user.email}
                      </p>
                    </div>

                    {/* Business details */}
                    <div className="space-y-4 px-5 py-5">

                      {profile?.business_name && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Business
                          </p>

                          <p className="mt-1 text-base font-semibold text-gray-950">
                            {profile.business_name}
                          </p>
                        </div>
                      )}

                      {profile?.address && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Address
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {profile.address}
                          </p>
                        </div>
                      )}

                      {profile?.social_handle && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Social handle
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {profile.social_handle}
                          </p>
                        </div>
                      )}

                    </div>

                    {/* Account actions */}
                    <div className="border-t px-4 py-3">

                      <Link
  href="/account"
  onClick={() => setAccountOpen(false)}
  className="block rounded-lg px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50"
>
  My Account
</Link>



                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Log out
                      </button>

                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Logged-out account button */
              <Link
                href="/login"
                aria-label="Log in"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                  />
                </svg>
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">

        <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Create invoices and receipts

          <span className="block text-blue-600">
            in seconds
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Create professional invoices and receipts for your business,
          download them as PDF, and share them easily.
        </p>

        {/* Options */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">

          {/* Invoice */}
          <Link
            href="/invoice"
            className="block rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🧾
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              Create Invoice
            </h3>

            <p className="mt-2 text-gray-600">
              Create a professional invoice for your customers.
            </p>

            <div className="mt-6 font-semibold text-blue-600">
              Create Invoice →
            </div>
          </Link>

          {/* Receipt */}
          <Link
            href="/receipt"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
              🧾
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Create Receipt
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Generate a simple and professional payment receipt.
            </p>

            <div className="mt-5 font-semibold text-green-600">
              Create Receipt →
            </div>
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        Simple tools for your business.
      </footer>

    </main>
  );
}


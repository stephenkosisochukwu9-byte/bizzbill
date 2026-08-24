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
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (user) {
          /*
            Get the newest business profile.

            We use limit(1) instead of maybeSingle()
            so duplicate profiles do not break the page.
          */

          const { data: profileData, error } = await supabase
            .from("business_profiles")
            .select(
              "business_name, address, social_handle"
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(1);

          if (error) {
            console.error(
              "Profile fetch error:",
              error
            );
          }

          const latestProfile =
            profileData && profileData.length > 0
              ? profileData[0]
              : null;

          setProfile({
            name:
              user.user_metadata?.name ||
              user.user_metadata?.full_name,
            business_name:
              latestProfile?.business_name,
            address:
              latestProfile?.address,
            social_handle:
              latestProfile?.social_handle,
          });
        }
      } catch (error) {
        console.error(
          "User loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (!session?.user) {
          setProfile(null);
          setAccountOpen(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setAccountOpen(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =========================
          HEADER
      ========================= */}

      <header className="border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">

          {/* =========================
              LOGO
          ========================= */}

          <Link
            href="/"
            className="shrink-0 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-2xl"
          >
            Bizz
            <span className="text-blue-600">
              Bill
            </span>
          </Link>

          {/* =========================
              RIGHT SIDE
          ========================= */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* =========================
                DOCUMENTS BUTTON
            ========================= */}

            {user && !loading && (
              <Link
                href="/documents"
                aria-label="My Documents"
                className="flex h-11 items-center gap-2 rounded-full border border-gray-300 bg-white px-3 text-sm font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-50 sm:px-4"
              >

                {/* Document Icon */}

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 shrink-0 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15A2.25 2.25 0 0 0 6.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25V7.5l-5.25-5.25Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 2.25V7.5h5.25"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h8M8 15.5h8M8 9h2"
                  />
                </svg>

                <span>
                  Documents
                </span>

              </Link>
            )}

            {/* =========================
                ACCOUNT
            ========================= */}

            <div className="relative">

              {/* LOADING */}

              {loading ? (

                <div className="h-11 w-11 animate-pulse rounded-full border border-gray-300 bg-gray-100" />

              ) : user ? (

                <>
                  {/* LOGGED-IN ACCOUNT BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen(
                        !accountOpen
                      )
                    }
                    aria-label="Open account"
                    aria-expanded={accountOpen}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:bg-gray-50"
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

                  {/* =========================
                      ACCOUNT DROPDOWN
                  ========================= */}

                  {accountOpen && (

                    <div className="absolute right-0 top-14 z-50 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                      {/* ACCOUNT HEADER */}

                      <div className="border-b bg-gray-50 px-5 py-4">

                        <p className="break-words text-lg font-extrabold text-gray-950">
                          {profile?.name ||
                            "My Account"}
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                          {user.email}
                        </p>

                      </div>

                      {/* BUSINESS DETAILS */}

                      <div className="space-y-4 px-5 py-5">

                        {profile?.business_name && (

                          <div>

                            <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                              Business
                            </p>

                            <p className="mt-1 break-words text-base font-bold text-gray-950">
                              {profile.business_name}
                            </p>

                          </div>

                        )}

                        {profile?.address && (

                          <div>

                            <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                              Address
                            </p>

                            <p className="mt-1 whitespace-pre-line break-words text-sm font-semibold text-gray-900">
                              {profile.address}
                            </p>

                          </div>

                        )}

                        {profile?.social_handle && (

                          <div>

                            <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                              Social handle
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                              {profile.social_handle}
                            </p>

                          </div>

                        )}

                      </div>

                      {/* ACCOUNT ACTIONS */}

                      <div className="border-t border-gray-200 px-4 py-3">

                        {/* MY ACCOUNT */}

                        <Link
                          href="/account"
                          onClick={() =>
                            setAccountOpen(false)
                          }
                          className="block rounded-lg px-3 py-2.5 text-sm font-extrabold text-gray-900 transition hover:bg-gray-50"
                        >
                          My Account
                        </Link>

                        {/* DOCUMENTS */}

                        <Link
                          href="/documents"
                          onClick={() =>
                            setAccountOpen(false)
                          }
                          className="block rounded-lg px-3 py-2.5 text-sm font-extrabold text-gray-900 transition hover:bg-gray-50"
                        >
                          My Documents
                        </Link>

                        {/* LOGOUT */}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-extrabold text-red-600 transition hover:bg-red-50"
                        >
                          Log out
                        </button>

                      </div>

                    </div>

                  )}

                </>

              ) : (

                /* =========================
                   LOGGED-OUT ACCOUNT BUTTON
                ========================= */

                <Link
                  href="/login"
                  aria-label="Log in"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:bg-gray-50"
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

        </div>

      </header>

      {/* =========================
          HERO
      ========================= */}

      <section className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16">

        <h2 className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">

          Create invoices and receipts

          <span className="block text-blue-600">
            in seconds
          </span>

        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-gray-700 sm:text-lg">
          Create professional invoices and receipts
          for your business, download them as PDF,
          and share them easily.
        </p>

        {/* =========================
            OPTIONS
        ========================= */}

        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2">

          {/* =========================
              INVOICE
          ========================= */}

          <Link
            href="/invoice"
            className="block rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
          >

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🧾
            </div>

            <h3 className="text-2xl font-extrabold text-gray-950">
              Create Invoice
            </h3>

            <p className="mt-2 text-base font-semibold leading-6 text-gray-700">
              Create a professional invoice
              for your customers.
            </p>

            <div className="mt-6 font-extrabold text-blue-600">
              Create Invoice →
            </div>

          </Link>

          {/* =========================
              RECEIPT
          ========================= */}

          <Link
            href="/receipt"
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-8"
          >

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-2xl">
              🧾
            </div>

            <h3 className="text-2xl font-extrabold text-gray-950">
              Create Receipt
            </h3>

            <p className="mt-2 text-base font-semibold leading-6 text-gray-700">
              Generate a simple and professional
              payment receipt.
            </p>

            <div className="mt-6 font-extrabold text-green-600">
              Create Receipt →
            </div>

          </Link>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm font-semibold text-gray-600">
        Simple tools for your business.
      </footer>

    </main>
  );
}

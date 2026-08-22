"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Profile = {
  id: string;
  user_id: string;
  business_name: string;
  address: string;
  social_handle: string | null;
};

export default function AccountPage() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);
      setName(user.user_metadata?.name || "");

      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Account profile error:", error);
      }

      if (data) {
        setProfile(data);
        setBusinessName(data.business_name || "");
        setAddress(data.address || "");
        setSocialHandle(data.social_handle || "");
      }

      setLoading(false);
    };

    loadAccount();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    try {
      // Update user's name
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          name,
        },
      });

      if (userError) {
        alert(userError.message);
        return;
      }

      // Update business profile
      const { error: profileError } = await supabase
        .from("business_profiles")
        .update({
          business_name: businessName,
          address,
          social_handle: socialHandle,
        })
        .eq("user_id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        alert(profileError.message);
        return;
      }

      alert("Account information updated successfully.");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <p className="text-lg font-semibold text-gray-700">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900"
          >
            Bizz<span className="text-blue-600">Bill</span>
          </Link>

          <Link
            href="/"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Account
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your personal and business information.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your personal account details.
            </p>

            <div className="mt-6 space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-medium text-gray-500"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Your email address cannot be changed here.
                </p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Business Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This information can be used automatically on your invoices and
              receipts.
            </p>

            <div className="mt-6 space-y-5">
              {/* Business Name */}
              <div>
                <label
                  htmlFor="businessName"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Business Name
                </label>

                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Business Address
                </label>

                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your business address"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Social Handle */}
              <div>
                <label
                  htmlFor="socialHandle"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Social Media Handle
                </label>

                <input
                  id="socialHandle"
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@yourbusiness"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </section>
    </main>
  );
}



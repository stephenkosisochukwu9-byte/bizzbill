"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !businessName) {
      alert(
        "Please fill in your name, email, password, and business name."
      );
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // Create Supabase account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            business_name: businessName,
            business_address: businessAddress,
            social_handle: socialHandle,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        alert(error.message);
        return;
      }

      if (!data.user) {
        alert("Unable to create your account. Please try again.");
        return;
      }

      // Save business profile
      const { error: profileError } = await supabase
        .from("business_profiles")
        .insert({
          user_id: data.user.id,
          business_name: businessName,
          address: businessAddress,
          social_handle: socialHandle,
        });

      if (profileError) {
        console.error("Business profile error:", profileError);

        alert(
          "Account was created, but your business profile could not be saved."
        );

        return;
      }

      alert("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.error("Unexpected signup error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-950">
              Create your account
            </h1>

            <p className="mt-2 text-base font-medium text-gray-700">
              Create your BizzBill account and set up your business profile.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-base font-semibold text-gray-950 mb-2"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 placeholder:text-gray-600 placeholder:font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-gray-950 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 placeholder:text-gray-600 placeholder:font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-gray-950 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 pr-12 text-base font-semibold text-gray-950 placeholder:text-gray-600 placeholder:font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={21} strokeWidth={2.2} />
                  ) : (
                    <Eye size={21} strokeWidth={2.2} />
                  )}
                </button>
              </div>

              <p className="mt-1 text-sm font-medium text-gray-700">
                Password must be at least 6 characters.
              </p>
            </div>

            {/* Business Information */}
            <div className="pt-4 border-t border-gray-300">

              <h2 className="text-xl font-bold text-gray-950 mb-5">
                Business information
              </h2>

              {/* Business Name */}
              <div className="mb-5">
                <label
                  htmlFor="business-name"
                  className="block text-base font-semibold text-gray-950 mb-2"
                >
                  Business name
                </label>

                <input
                  id="business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 placeholder:text-gray-600 placeholder:font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Business Address */}
              <div className="mb-5">
                <label
                  htmlFor="business-address"
                  className="block text-base font-semibold text-gray-950 mb-2"
                >
                  Business address
                </label>

                <input
                  id="business-address"
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Enter your business address"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 placeholder:text-gray-600 placeholder:font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Social Handle */}
              <div>
                <label
                  htmlFor="social-handle"
                  className="block text-base font-semibold text-gray-950 mb-2"
                >
                  Social media handle
                </label>

                <input
                  id="social-handle"
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@yourbusiness"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 placeholder:text-gray-600 placeholder:font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-base font-medium text-gray-700">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-bold text-blue-700 hover:text-blue-800"
            >
              Log in
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}


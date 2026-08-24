"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import NotificationModal from "@/components/NotificationModal";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* =========================
     PERSONAL INFORMATION
  ========================= */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* =========================
     BUSINESS INFORMATION
  ========================= */

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  /* =========================
     LOGO
  ========================= */

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  /* =========================
     LOADING
  ========================= */

  const [loading, setLoading] = useState(false);

  /* =========================
     NOTIFICATION
  ========================= */

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notificationType, setNotificationType] = useState<
    "success" | "error"
  >("success");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  /* =========================
     SHOW NOTIFICATION
  ========================= */

  const showNotification = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationOpen(true);
  };

  /* =========================
     LOGO SELECT
  ========================= */

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    /* =========================
       CHECK FILE TYPE
    ========================= */

    if (!file.type.startsWith("image/")) {
      showNotification(
        "error",
        "Invalid file",
        "Please select a valid image file for your business logo."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    /* =========================
       CHECK FILE SIZE
    ========================= */

    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        "error",
        "Logo is too large",
        "Your business logo must be smaller than 5MB."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    /* =========================
       CLEAN OLD PREVIEW
    ========================= */

    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    /* =========================
       CREATE NEW PREVIEW
    ========================= */

    const previewUrl = URL.createObjectURL(file);

    setLogoFile(file);
    setLogoPreview(previewUrl);
  };

  /* =========================
     REMOVE LOGO
  ========================= */

  const handleRemoveLogo = () => {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(null);
    setLogoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     HANDLE SIGNUP
  ========================= */

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    /* =========================
       VALIDATION
    ========================= */

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !businessName.trim()
    ) {
      showNotification(
        "error",
        "Missing information",
        "Please fill in your name, email, password, and business name."
      );

      return;
    }

    if (password.length < 6) {
      showNotification(
        "error",
        "Password too short",
        "Your password must be at least 6 characters long."
      );

      return;
    }

    try {
      setLoading(true);

      /* =========================
         CREATE AUTH ACCOUNT
      ========================= */

      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
              business_name: businessName.trim(),
              business_address: businessAddress.trim(),
              social_handle:
                socialHandle.trim() || null,
            },
          },
        });

      /* =========================
         AUTH ERROR
      ========================= */

      if (error) {
        console.error("Signup error:", error);

        showNotification(
          "error",
          "Account creation failed",
          error.message
        );

        return;
      }

      /* =========================
         CHECK USER
      ========================= */

      if (!data.user) {
        showNotification(
          "error",
          "Account creation failed",
          "Unable to create your account. Please try again."
        );

        return;
      }

      /* =========================
         CHECK SESSION
      ========================= */

      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      const session = sessionData.session;

      /*
        If email confirmation is enabled,
        Supabase creates the user but may not
        give us an active session yet.
      */

      if (!session) {
        showNotification(
          "success",
          "Account created!",
          "Your account was created successfully. Please check your email to confirm your account, then log in to continue setting up your business profile."
        );

        return;
      }

      /* =========================
         LOGO URL
      ========================= */

      let logoUrl: string | null = null;

      /* =========================
         UPLOAD LOGO
      ========================= */

      if (logoFile) {
        const fileExtension =
          logoFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "png";

        const filePath =
          `${data.user.id}/logo-${Date.now()}.${fileExtension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("business-logos")
          .upload(filePath, logoFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: logoFile.type,
          });

        /* =========================
           LOGO UPLOAD ERROR
        ========================= */

        if (uploadError) {
          console.error(
            "Logo upload error:",
            uploadError
          );

          showNotification(
            "error",
            "Logo upload failed",
            "Your account can still be created, but the logo could not be uploaded. You can add your logo later from My Account."
          );

          return;
        }

        /* =========================
           GET PUBLIC LOGO URL
        ========================= */

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("business-logos")
          .getPublicUrl(filePath);

        logoUrl = publicUrlData.publicUrl;
      }

      /* =========================
         CREATE BUSINESS PROFILE
         
         UPSERT:
         Existing row -> update
         No row -> create
      ========================= */

      const {
        error: profileError,
      } = await supabase
        .from("business_profiles")
        .upsert(
          {
            user_id: data.user.id,
            business_name:
              businessName.trim(),
            address:
              businessAddress.trim(),
            social_handle:
              socialHandle.trim() || null,
            logo_url: logoUrl,
          },
          {
            onConflict: "user_id",
          }
        );

      /* =========================
         PROFILE ERROR
      ========================= */

      if (profileError) {
        console.error(
          "Business profile error:",
          profileError
        );

        showNotification(
          "error",
          "Profile setup failed",
          "Your account was created, but your business profile could not be saved. Please check your Supabase business_profiles permissions."
        );

        return;
      }

      /* =========================
         SUCCESS
      ========================= */

      showNotification(
        "success",
        "Account created!",
        "Your BizzBill account and business profile have been created successfully."
      );
    } catch (error) {
      console.error(
        "Unexpected signup error:",
        error
      );

      showNotification(
        "error",
        "Something went wrong",
        "We could not complete your registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PAGE
  ========================= */

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">

          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-950 sm:text-4xl">
              Create your account
            </h1>

            <p className="mt-2 text-base font-medium text-gray-700">
              Create your BizzBill account and set up your business profile.
            </p>
          </div>

          {/* =========================
              FORM
          ========================= */}

          <form
            onSubmit={handleSignup}
            className="space-y-5"
          >

            {/* =========================
                FULL NAME
            ========================= */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-base font-semibold text-gray-950"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 outline-none placeholder:font-medium placeholder:text-gray-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* =========================
                EMAIL
            ========================= */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-base font-semibold text-gray-950"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 outline-none placeholder:font-medium placeholder:text-gray-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* =========================
                PASSWORD
            ========================= */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-base font-semibold text-gray-950"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 pr-12 text-base font-semibold text-gray-950 outline-none placeholder:font-medium placeholder:text-gray-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={21}
                      strokeWidth={2.2}
                    />
                  ) : (
                    <Eye
                      size={21}
                      strokeWidth={2.2}
                    />
                  )}
                </button>
              </div>

              <p className="mt-1 text-sm font-medium text-gray-700">
                Password must be at least 6 characters.
              </p>
            </div>

            {/* =========================
                BUSINESS INFORMATION
            ========================= */}

            <div className="border-t border-gray-300 pt-4">

              <h2 className="mb-5 text-xl font-bold text-gray-950">
                Business information
              </h2>

              {/* =========================
                  BUSINESS LOGO
              ========================= */}

              <div className="mb-5">
                <label className="mb-2 block text-base font-semibold text-gray-950">
                  Business logo
                </label>

                <div className="rounded-xl border border-gray-300 bg-gray-50 p-5">

                  {/* LOGO PREVIEW */}

                  <div className="flex flex-col items-center">

                    {logoPreview ? (
                      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <img
                          src={logoPreview}
                          alt="Business logo preview"
                          className="h-full w-full object-contain p-3"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white">
                        <div className="text-center">
                          <div className="text-4xl">
                            🏢
                          </div>

                          <p className="mt-2 text-xs font-bold text-gray-500">
                            No logo
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FILE INPUT */}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      className="hidden"
                    />

                    {/* BUTTONS */}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
                      >
                        {logoPreview
                          ? "Change Logo"
                          : "Upload Logo"}
                      </button>

                      {logoPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-extrabold text-red-600 transition hover:bg-red-50"
                        >
                          Remove Logo
                        </button>
                      )}

                    </div>

                    <p className="mt-3 text-center text-xs font-medium text-gray-500">
                      PNG, JPG or WEBP. Maximum size: 5MB.
                    </p>

                    <p className="mt-1 text-center text-xs font-medium text-gray-500">
                      Your logo will appear on your invoices and receipts.
                    </p>

                  </div>
                </div>
              </div>

              {/* =========================
                  BUSINESS NAME
              ========================= */}

              <div className="mb-5">
                <label
                  htmlFor="business-name"
                  className="mb-2 block text-base font-semibold text-gray-950"
                >
                  Business name
                </label>

                <input
                  id="business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) =>
                    setBusinessName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your business name"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 outline-none placeholder:font-medium placeholder:text-gray-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* =========================
                  BUSINESS ADDRESS
              ========================= */}

              <div className="mb-5">
                <label
                  htmlFor="business-address"
                  className="mb-2 block text-base font-semibold text-gray-950"
                >
                  Business address
                </label>

                <input
                  id="business-address"
                  type="text"
                  value={businessAddress}
                  onChange={(e) =>
                    setBusinessAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter your business address"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 outline-none placeholder:font-medium placeholder:text-gray-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* =========================
                  SOCIAL HANDLE
              ========================= */}

              <div>
                <label
                  htmlFor="social-handle"
                  className="mb-2 block text-base font-semibold text-gray-950"
                >
                  Social media handle
                </label>

                <input
                  id="social-handle"
                  type="text"
                  value={socialHandle}
                  onChange={(e) =>
                    setSocialHandle(
                      e.target.value
                    )
                  }
                  placeholder="@yourbusiness"
                  className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-base font-semibold text-gray-950 outline-none placeholder:font-medium placeholder:text-gray-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

            {/* =========================
                SUBMIT
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          {/* =========================
              LOGIN
          ========================= */}

          <p className="mt-6 text-center text-base font-medium text-gray-700">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                router.push("/login")
              }
              className="font-bold text-blue-700 hover:text-blue-800"
            >
              Log in
            </button>
          </p>

          {/* =========================
              NOTIFICATION MODAL
          ========================= */}

          <NotificationModal
            open={notificationOpen}
            type={notificationType}
            title={notificationTitle}
            message={notificationMessage}
            buttonText="Continue"
            onClose={() => {
              setNotificationOpen(false);

              if (
                notificationType ===
                "success"
              ) {
                router.push("/login");
              }
            }}
          />

        </div>
      </div>
    </main>
  );
}

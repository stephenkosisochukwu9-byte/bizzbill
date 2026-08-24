"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Profile = {
  id: string;
  user_id: string;
  business_name: string;
  address: string;
  logo_url: string | null;
  social_handle: string | null;
};

export default function AccountPage() {
  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [user, setUser] =
    useState<any>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [name, setName] =
    useState("");

  const [businessName, setBusinessName] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [socialHandle, setSocialHandle] =
    useState("");

  /* =========================
     LOGO
  ========================= */

  const [logoUrl, setLogoUrl] =
    useState<string | null>(null);

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [logoPreview, setLogoPreview] =
    useState<string | null>(null);

  const [removeLogo, setRemoveLogo] =
    useState(false);

  /* =========================
     LOADING
  ========================= */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /* =========================
     LOAD ACCOUNT
  ========================= */

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

      setName(
        user.user_metadata?.name || ""
      );

      const {
        data,
        error,
      } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Account profile error:",
          error
        );
      }

      if (data) {
        setProfile(data);

        setBusinessName(
          data.business_name || ""
        );

        setAddress(
          data.address || ""
        );

        setSocialHandle(
          data.social_handle || ""
        );

        setLogoUrl(
          data.logo_url || null
        );

        setLogoPreview(
          data.logo_url || null
        );
      }

      setLoading(false);
    };

    loadAccount();
  }, [supabase]);

  /* =========================
     SELECT LOGO
  ========================= */

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    /* ONLY IMAGES */

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    /* MAX 5MB */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Logo must be smaller than 5MB."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    /* CREATE PREVIEW */

    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setLogoFile(file);

    setLogoPreview(
      previewUrl
    );

    setRemoveLogo(false);
  };

  /* =========================
     REMOVE LOGO
  ========================= */

  const handleRemoveLogo = () => {
    if (
      logoPreview?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    setLogoFile(null);

    setLogoPreview(null);

    setRemoveLogo(true);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  /* =========================
     SAVE ACCOUNT
  ========================= */

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    if (!businessName.trim()) {
      alert(
        "Please enter your business name."
      );

      return;
    }

    setSaving(true);

    try {
      /* =========================
         UPDATE USER NAME
      ========================= */

      const {
        error: userError,
      } =
        await supabase.auth.updateUser({
          data: {
            name,
          },
        });

      if (userError) {
        alert(userError.message);
        return;
      }

      /* =========================
         START WITH CURRENT LOGO
      ========================= */

      let finalLogoUrl =
        logoUrl;

      /* =========================
         REMOVE LOGO
      ========================= */

      if (removeLogo) {
        finalLogoUrl = null;
      }

      /* =========================
         UPLOAD NEW LOGO
      ========================= */

      if (logoFile) {
        const fileExtension =
          logoFile.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "png";

        const filePath =
          `${user.id}/logo-${Date.now()}.${fileExtension}`;

        const {
          error: uploadError,
        } =
          await supabase.storage
            .from("business-logos")
            .upload(
              filePath,
              logoFile,
              {
                cacheControl:
                  "3600",

                upsert: false,

                contentType:
                  logoFile.type,
              }
            );

        if (uploadError) {
          console.error(
            "Logo upload error:",
            uploadError
          );

          alert(
            "Unable to upload your logo. Please try again."
          );

          return;
        }

        /* =========================
           GET PUBLIC URL
        ========================= */

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              "business-logos"
            )
            .getPublicUrl(
              filePath
            );

        finalLogoUrl =
          publicUrlData.publicUrl;

        setLogoUrl(
          finalLogoUrl
        );

        setLogoPreview(
          finalLogoUrl
        );

        setLogoFile(null);

        setRemoveLogo(false);
      }

      /* =========================
         CREATE OR UPDATE PROFILE
         
         THIS IS THE IMPORTANT FIX.
         
         UPSERT:
         - Existing profile → UPDATE
         - New profile → INSERT
      ========================= */

      const {
        data: savedProfile,
        error: profileError,
      } =
        await supabase
          .from("business_profiles")
          .upsert(
            {
              user_id: user.id,

              business_name:
                businessName.trim(),

              address:
                address.trim(),

              social_handle:
                socialHandle.trim() ||
                null,

              logo_url:
                finalLogoUrl,
            },
            {
              onConflict:
                "user_id",
            }
          )
          .select("*")
          .single();

      if (profileError) {
        console.error(
          "Profile save error:",
          profileError
        );

        alert(
          profileError.message
        );

        return;
      }

      /* =========================
         UPDATE LOCAL STATE
      ========================= */

      if (savedProfile) {
        setProfile(
          savedProfile
        );
      }

      setLogoUrl(
        finalLogoUrl
      );

      setLogoPreview(
        finalLogoUrl
      );

      setLogoFile(null);

      setRemoveLogo(false);

      alert(
        "Account information updated successfully."
      );
    } catch (error) {
      console.error(
        "Unexpected error:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

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

  /* =========================
     PAGE
  ========================= */

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-2xl font-bold text-gray-900"
          >
            Bizz
            <span className="text-blue-600">
              Bill
            </span>
          </Link>

          <Link
            href="/"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </Link>

        </div>
      </header>

      {/* MAIN */}

      <section className="mx-auto max-w-3xl px-6 py-10">

        {/* HEADING */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Account
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your personal and business information.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >

          {/* =========================
              PERSONAL INFORMATION
          ========================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your personal account details.
            </p>

            <div className="mt-6 space-y-5">

              {/* NAME */}

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
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* EMAIL */}

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
                  value={
                    user?.email || ""
                  }
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-medium text-gray-500"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Your email address cannot be changed here.
                </p>

              </div>

            </div>

          </div>

          {/* =========================
              BUSINESS INFORMATION
          ========================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Business Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This information can be used automatically on your invoices and receipts.
            </p>

            <div className="mt-6 space-y-5">

              {/* =========================
                  BUSINESS LOGO
              ========================= */}

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Business Logo
                </label>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                  {/* PREVIEW */}

                  <div className="flex flex-col items-center justify-center">

                    {logoPreview ? (

                      <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <img
                          src={logoPreview}
                          alt="Business logo"
                          className="h-full w-full object-contain p-3"
                        />

                      </div>

                    ) : (

                      <div className="flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white text-center">

                        <div>

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
                      onChange={
                        handleLogoChange
                      }
                      className="hidden"
                    />

                    {/* BUTTONS */}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

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
                          onClick={
                            handleRemoveLogo
                          }
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
                  onChange={(e) =>
                    setBusinessName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your business name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* =========================
                  ADDRESS
              ========================= */}

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
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                  placeholder="Enter your business address"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* =========================
                  SOCIAL HANDLE
              ========================= */}

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
                  onChange={(e) =>
                    setSocialHandle(
                      e.target.value
                    )
                  }
                  placeholder="@yourbusiness"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

          </div>

          {/* =========================
              SAVE BUTTON
          ========================= */}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>

        </form>

      </section>

    </main>
  );
}

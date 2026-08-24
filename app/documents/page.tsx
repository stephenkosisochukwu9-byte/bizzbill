"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DocumentType = "invoice" | "receipt";

type DocumentRecord = {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_number: string;
  customer_name: string;
  customer_phone: string | null;
  document_date: string;
  items: unknown;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string | null;
  payment_method: string | null;
  business_name: string | null;
  business_address: string | null;
  created_at: string;
};

type FilterType = "all" | "invoice" | "receipt";

export default function DocumentsPage() {
  const supabase = createClient();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [search, setSearch] = useState("");

  /* =========================
     FETCH DOCUMENTS
  ========================= */

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      /* =========================
         GET CURRENT USER
      ========================= */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "User fetch error:",
          userError
        );

        setErrorMessage(
          "Unable to verify your account."
        );

        return;
      }

      if (!user) {
        setErrorMessage(
          "You must be logged in to view your documents."
        );

        return;
      }

      /* =========================
         GET DOCUMENTS
      ========================= */

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Documents fetch error:",
          error
        );

        setErrorMessage(
          "Unable to load your documents. Please try again."
        );

        return;
      }

      setDocuments(
        (data || []) as DocumentRecord[]
      );
    } catch (error) {
      console.error(
        "Documents loading error:",
        error
      );

      setErrorMessage(
        "Something went wrong while loading your documents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* =========================
     DELETE DOCUMENT
  ========================= */

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(
          "Delete document error:",
          error
        );

        alert(
          "Unable to delete this document. Please try again."
        );

        return;
      }

      setDocuments((current) =>
        current.filter(
          (document) => document.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Something went wrong while deleting the document."
      );
    }
  };

  /* =========================
     FILTER + SEARCH
  ========================= */

  const filteredDocuments = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return documents.filter((document) => {
      /* FILTER */

      const matchesFilter =
        filter === "all" ||
        document.document_type === filter;

      if (!matchesFilter) {
        return false;
      }

      /* SEARCH */

      if (!searchValue) {
        return true;
      }

      const documentNumber =
        document.document_number?.toLowerCase() || "";

      const customerName =
        document.customer_name?.toLowerCase() || "";

      return (
        documentNumber.includes(searchValue) ||
        customerName.includes(searchValue)
      );
    });
  }, [documents, filter, search]);

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (date: string) => {
    if (!date) {
      return "-";
    }

    const formattedDate = new Date(
      `${date}T00:00:00`
    );

    return formattedDate.toLocaleDateString(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================
     DOCUMENT TYPE LABEL
  ========================= */

  const getDocumentTypeLabel = (
    type: DocumentType
  ) => {
    return type === "invoice"
      ? "Invoice"
      : "Receipt";
  };

  /* =========================
     PAYMENT LABEL
  ========================= */

  const getPaymentLabel = (
    document: DocumentRecord
  ) => {
    if (document.document_type === "invoice") {
      return document.payment_status || "Unpaid";
    }

    return document.payment_method || "Other";
  };

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

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
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
            >
              ← Home
            </Link>

          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-semibold text-gray-600">
            Loading your documents...
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

      {/* =========================
          HEADER
      ========================= */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

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
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Home
          </Link>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">

        {/* =========================
            TITLE
        ========================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Documents
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            View and manage your invoices and receipts.
          </p>

        </div>

        {/* =========================
            CREATE BUTTONS
        ========================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <Link
            href="/invoice"
            className="rounded-xl bg-blue-600 px-5 py-4 text-center font-bold text-white transition hover:bg-blue-700"
          >
            + Create Invoice
          </Link>

          <Link
            href="/receipt"
            className="rounded-xl bg-green-600 px-5 py-4 text-center font-bold text-white transition hover:bg-green-700"
          >
            + Create Receipt
          </Link>

        </div>

        {/* =========================
            ERROR
        ========================= */}

        {errorMessage && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={fetchDocuments}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        )}

        {/* =========================
            FILTERS
        ========================= */}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">

          {/* FILTER BUTTONS */}

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter("invoice")}
              className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                filter === "invoice"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Invoices
            </button>

            <button
              type="button"
              onClick={() => setFilter("receipt")}
              className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                filter === "receipt"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Receipts
            </button>

          </div>

          {/* SEARCH */}

          <div className="mt-4">

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search documents..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

        </section>

        {/* =========================
            DOCUMENT COUNT
        ========================= */}

        {documents.length > 0 && (

          <div className="mb-4">

            <p className="text-sm font-semibold text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredDocuments.length}
              </span>{" "}
              document
              {filteredDocuments.length === 1
                ? ""
                : "s"}
            </p>

          </div>

        )}

        {/* =========================
            NO DOCUMENTS
        ========================= */}

        {documents.length === 0 && (

          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center sm:px-10">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📁
            </div>

            <h2 className="mt-5 text-lg font-bold text-gray-800">
              No documents yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Your generated invoices and receipts will appear here.
            </p>

          </section>

        )}

        {/* =========================
            NO SEARCH RESULTS
        ========================= */}

        {documents.length > 0 &&
          filteredDocuments.length === 0 && (

            <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                🔍
              </div>

              <h2 className="mt-5 text-lg font-bold text-gray-800">
                No matching documents
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Try a different customer name or document number.
              </p>

            </section>

          )}

        {/* =========================
            DOCUMENT LIST
        ========================= */}

        {filteredDocuments.length > 0 && (

          <section className="space-y-4">

            {filteredDocuments.map(
              (document) => {

                const isInvoice =
                  document.document_type ===
                  "invoice";

                const documentType =
                  getDocumentTypeLabel(
                    document.document_type
                  );

                const paymentLabel =
                  getPaymentLabel(document);

                return (

                  <div
                    key={document.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >

                    <div className="flex flex-col gap-5">

                      {/* =========================
                          TOP
                      ========================= */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        {/* LEFT */}

                        <div className="flex items-start gap-4">

                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                              isInvoice
                                ? "bg-blue-50"
                                : "bg-green-50"
                            }`}
                          >
                            🧾
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                  isInvoice
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {documentType}
                              </span>

                              <h2 className="break-all font-extrabold text-gray-900">
                                {document.document_number}
                              </h2>

                            </div>

                            <p className="mt-2 text-sm text-gray-600">

                              Customer:{" "}

                              <span className="font-bold text-gray-900">
                                {document.customer_name}
                              </span>

                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatDate(
                                document.document_date
                              )}
                            </p>

                          </div>

                        </div>

                        {/* AMOUNT */}

                        <div className="sm:text-right">

                          <p className="text-xs font-semibold text-gray-500">
                            Total
                          </p>

                          <p className="text-xl font-extrabold text-gray-950">
                            ₦
                            {Number(
                              document.total_amount || 0
                            ).toLocaleString(
                              "en-NG"
                            )}
                          </p>

                        </div>

                      </div>

                      {/* =========================
                          BOTTOM INFO
                      ========================= */}

                      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* PAYMENT */}

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {isInvoice
                              ? "Payment Status"
                              : "Payment Method"}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              isInvoice
                                ? document.payment_status ===
                                  "Paid"
                                  ? "bg-green-100 text-green-700"
                                  : document.payment_status ===
                                    "Partially Paid"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {paymentLabel}
                          </span>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-2">

                          <Link
                            href={`/${
                              isInvoice
                                ? "invoice"
                                : "receipt"
                            }?id=${document.id}`}
                            className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                document.id
                              )
                            }
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </section>

        )}

      </div>

    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSavedDocuments,
  deleteDocument,
  SavedDocument,
} from "@/lib/documents";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);

  useEffect(() => {
    setDocuments(getSavedDocuments());
  }, []);

  const handleDelete = (id: string) => {
    deleteDocument(id);

    setDocuments((current) =>
      current.filter((document) => document.id !== id)
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

          <Link
            href="/"
            className="text-2xl font-bold text-gray-900"
          >
            Bizz
            <span className="text-blue-600">Bill</span>
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Home
          </Link>

        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">

        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Documents
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            View and manage your invoices and receipts.
          </p>
        </div>

        {/* CREATE BUTTONS */}
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

        {/* SAVED DOCUMENTS */}

        {documents.length === 0 ? (

          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center sm:px-10">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📁
            </div>

            <h2 className="mt-5 text-lg font-bold text-gray-800">
              No saved documents yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Your saved invoices and receipts will appear here.
            </p>

          </section>

        ) : (

          <section className="space-y-4">

            {documents.map((document) => (

              <div
                key={document.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  {/* DOCUMENT INFO */}

                  <div className="flex items-start gap-4">

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                        document.type === "Invoice"
                          ? "bg-blue-50"
                          : "bg-green-50"
                      }`}
                    >
                      🧾
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="font-bold text-gray-900">
                          {document.type}
                        </h2>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            document.type === "Invoice"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {document.documentNumber}
                        </span>

                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        Customer:{" "}
                        <span className="font-semibold">
                          {document.customerName}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {document.date}
                      </p>

                    </div>

                  </div>

                  {/* RIGHT SIDE */}

                  <div className="flex items-center justify-between gap-4 sm:justify-end">

                    <div className="text-left sm:text-right">

                      <p className="text-xs text-gray-500">
                        Total
                      </p>

                      <p className="text-lg font-bold text-gray-900">
                        ₦
                        {document.total.toLocaleString("en-NG")}
                      </p>

                    </div>

                    <div className="flex gap-2">

                      {/* OPEN */}

                      <Link
                        href={`/${
                          document.type === "Invoice"
                            ? "invoice"
                            : "receipt"
                        }?id=${document.id}`}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Open
                      </Link>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => handleDelete(document.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </section>

        )}

      </div>

    </main>
  );
}
"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";

type PaymentStatus = "Unpaid" | "Paid" | "Partially Paid";

type Item = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export default function InvoicePage() {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [generated, setGenerated] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("Unpaid");

  const [amountPaid, setAmountPaid] = useState(0);

  const [items, setItems] = useState<Item[]>([
    {
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  /* =========================
     ITEM FUNCTIONS
  ========================= */

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        name: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  /* =========================
     CALCULATIONS
  ========================= */

  const itemTotal = (item: Item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.unitPrice || 0)
    );
  };

  const grandTotal = items.reduce(
    (total, item) => total + itemTotal(item),
    0
  );

  const balanceDue =
    paymentStatus === "Partially Paid"
      ? Math.max(grandTotal - amountPaid, 0)
      : paymentStatus === "Unpaid"
      ? grandTotal
      : 0;

  /* =========================
     GENERATE INVOICE
  ========================= */

  const generateInvoice = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!invoiceNumber.trim()) {
      alert("Please enter invoice number.");
      return;
    }

    if (!invoiceDate) {
      alert("Please select invoice date.");
      return;
    }

    if (items.some((item) => !item.name.trim())) {
      alert("Please enter an item name for every item.");
      return;
    }

    setGenerated(true);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  /* =========================
     SAVE AS PNG
  ========================= */

  const saveAsImage = async () => {
    if (!invoiceRef.current) return;

    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const link = document.createElement("a");

      link.download = `Invoice-${invoiceNumber || "invoice"}.png`;

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the invoice as an image. Please try again."
      );
    }
  };

  /* =========================
     GENERATED INVOICE VIEW
  ========================= */

  if (generated) {
    return (
      <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-10">

        {/* TOP NAVIGATION */}

        <div className="mx-auto mb-5 flex w-full max-w-4xl items-center justify-between gap-3">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-gray-50"
          >
            ← Home
          </Link>

          <button
            type="button"
            onClick={() => setGenerated(false)}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            Edit Invoice
          </button>

        </div>

        {/* =========================
            INVOICE
        ========================= */}

        <div
          ref={invoiceRef}
          className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg"
        >

          {/* HEADER */}

          <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                  Bizz
                  <span className="text-blue-600">
                    Bill
                  </span>
                </h1>

                <p className="mt-2 text-sm font-semibold text-gray-700 sm:text-base">
                  Professional Invoice
                </p>

              </div>

              <div className="sm:text-right">

                <h2 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
                  INVOICE
                </h2>

                <div className="mt-3 space-y-1 text-sm text-gray-700">

                  <p>
                    Invoice No:{" "}
                    <span className="font-bold text-gray-950">
                      {invoiceNumber}
                    </span>
                  </p>

                  <p>
                    Date:{" "}
                    <span className="font-bold text-gray-950">
                      {invoiceDate}
                    </span>
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* CUSTOMER + PAYMENT STATUS */}

          <div className="grid grid-cols-1 gap-7 border-b border-gray-200 px-5 py-7 sm:grid-cols-2 sm:px-10">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                Bill To
              </p>

              <p className="mt-2 text-xl font-extrabold text-gray-950">
                {customerName}
              </p>

              {customerPhone && (
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {customerPhone}
                </p>
              )}

            </div>

            <div className="sm:text-right">

              <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                Payment Status
              </p>

              <p
                className={`mt-2 text-xl font-extrabold ${
                  paymentStatus === "Paid"
                    ? "text-green-600"
                    : paymentStatus === "Partially Paid"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {paymentStatus}
              </p>

            </div>

          </div>

          {/* ITEMS */}

          <div className="px-5 py-7 sm:px-10">

            {/* DESKTOP HEADER */}

            <div className="hidden grid-cols-12 gap-4 border-b-2 border-gray-300 pb-4 text-sm font-extrabold text-gray-800 sm:grid">

              <div className="col-span-5">
                Item
              </div>

              <div className="col-span-2 text-center">
                Qty
              </div>

              <div className="col-span-2 text-right">
                Unit Price
              </div>

              <div className="col-span-3 text-right">
                Amount
              </div>

            </div>

            {/* ITEMS */}

            <div className="divide-y divide-gray-200">

              {items.map((item, index) => (

                <div
                  key={index}
                  className="grid grid-cols-2 gap-x-4 gap-y-3 py-5 sm:grid-cols-12 sm:gap-4"
                >

                  {/* ITEM */}

                  <div className="col-span-2 sm:col-span-5">

                    <p className="text-xs font-bold text-gray-600 sm:hidden">
                      Item
                    </p>

                    <p className="mt-1 text-base font-bold text-gray-950 sm:mt-0">
                      {item.name}
                    </p>

                  </div>

                  {/* QUANTITY */}

                  <div className="sm:col-span-2 sm:text-center">

                    <p className="text-xs font-bold text-gray-600 sm:hidden">
                      Quantity
                    </p>

                    <p className="mt-1 text-base font-semibold text-gray-950 sm:mt-0">
                      {item.quantity}
                    </p>

                  </div>

                  {/* UNIT PRICE */}

                  <div className="sm:col-span-2 sm:text-right">

                    <p className="text-xs font-bold text-gray-600 sm:hidden">
                      Unit Price
                    </p>

                    <p className="mt-1 text-base font-semibold text-gray-950 sm:mt-0">
                      ₦
                      {Number(item.unitPrice).toLocaleString(
                        "en-NG"
                      )}
                    </p>

                  </div>

                  {/* TOTAL */}

                  <div className="sm:col-span-3 sm:text-right">

                    <p className="text-xs font-bold text-gray-600 sm:hidden">
                      Amount
                    </p>

                    <p className="mt-1 text-base font-extrabold text-gray-950 sm:mt-0">
                      ₦
                      {itemTotal(item).toLocaleString(
                        "en-NG"
                      )}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* TOTALS */}

          <div className="border-t border-gray-200 px-5 py-7 sm:px-10">

            <div className="ml-auto w-full max-w-md space-y-4">

              {/* GRAND TOTAL */}

              <div className="flex items-center justify-between gap-4 text-base">

                <span className="font-semibold text-gray-700">
                  Grand Total
                </span>

                <span className="font-extrabold text-gray-950">
                  ₦
                  {grandTotal.toLocaleString(
                    "en-NG"
                  )}
                </span>

              </div>

              {/* AMOUNT PAID */}

              {paymentStatus === "Partially Paid" && (
                <div className="flex items-center justify-between gap-4 text-base">

                  <span className="font-semibold text-gray-700">
                    Amount Paid
                  </span>

                  <span className="font-extrabold text-gray-950">
                    ₦
                    {amountPaid.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>
              )}

              {/* BALANCE DUE */}

              {paymentStatus !== "Paid" && (
                <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4">

                  <span className="font-extrabold text-gray-800">
                    Balance Due
                  </span>

                  <span className="font-extrabold text-red-600">
                    ₦
                    {balanceDue.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>
              )}

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-gray-200 px-5 py-7 text-center sm:px-10">

            <p className="text-base font-extrabold text-gray-900">
              Thank you for your business.
            </p>

            <p className="mt-2 text-sm font-semibold text-gray-600">
              Generated with BizzBill
            </p>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="mx-auto mt-5 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="button"
            onClick={saveAsImage}
            className="rounded-xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-blue-700"
          >
            🖼 Save Invoice as PNG
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-gray-900 px-5 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-black"
          >
            🖨 Print Invoice
          </button>

        </div>

        {/* PRINT STYLES */}

        <style jsx global>{`
          @media print {
            body {
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            [data-print-invoice],
            [data-print-invoice] * {
              visibility: visible;
            }

            [data-print-invoice] {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>

      </main>
    );
  }

  /* =========================
     CREATE INVOICE FORM
  ========================= */

  return (
    <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-10">

      <div className="mx-auto w-full max-w-5xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between gap-3">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-gray-50"
          >
            ← Home
          </Link>

          <h1 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
            Create Invoice
          </h1>

        </div>

        {/* FORM CARD */}

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">

          <h2 className="mb-7 text-2xl font-extrabold text-gray-950">
            Invoice Details
          </h2>

          {/* CUSTOMER INFORMATION */}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* CUSTOMER NAME */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Customer name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Customer name"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* PHONE */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Customer phone
              </label>

              <input
                type="tel"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(e.target.value)
                }
                placeholder="Customer phone"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* INVOICE NUMBER */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Invoice number
              </label>

              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) =>
                  setInvoiceNumber(e.target.value)
                }
                placeholder="Invoice number"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* DATE */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Invoice date
              </label>

              <input
                type="date"
                value={invoiceDate}
                onChange={(e) =>
                  setInvoiceDate(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* ITEMS */}

          <div className="mt-9">

            <div className="mb-5 flex items-center justify-between gap-3">

              <h2 className="text-2xl font-extrabold text-gray-950">
                Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
              >
                + Add Item
              </button>

            </div>

            <div className="space-y-5">

              {items.map((item, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-gray-300 bg-gray-50 p-4 sm:p-5"
                >

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* ITEM */}

                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-gray-900">
                        Item
                      </label>

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Item / Service"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                    {/* QUANTITY */}

                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-gray-900">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            Math.max(
                              1,
                              Number(e.target.value)
                            )
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                    {/* UNIT PRICE */}

                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-gray-900">
                        Unit price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPrice",
                            Math.max(
                              0,
                              Number(e.target.value)
                            )
                          )
                        }
                        placeholder="₦0"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                  </div>

                  {/* ITEM TOTAL + REMOVE */}

                  <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-base font-extrabold text-gray-900">
                      Item total: ₦
                      {itemTotal(item).toLocaleString(
                        "en-NG"
                      )}
                    </p>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        className="self-start font-extrabold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* GRAND TOTAL */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

            <div className="flex items-center justify-between gap-4">

              <span className="text-base font-extrabold text-gray-900">
                Grand Total
              </span>

              <span className="text-xl font-extrabold text-gray-950">
                ₦
                {grandTotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

          </div>

          {/* PAYMENT STATUS */}

          <div className="mt-8">

            <label className="mb-2 block text-sm font-extrabold text-gray-900">
              Payment status
            </label>

            <select
              value={paymentStatus}
              onChange={(e) => {
                const value =
                  e.target.value as PaymentStatus;

                setPaymentStatus(value);

                if (value === "Paid") {
                  setAmountPaid(grandTotal);
                }

                if (value === "Unpaid") {
                  setAmountPaid(0);
                }
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-extrabold text-gray-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >

              <option value="Unpaid">
                Unpaid
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Partially Paid">
                Partially Paid
              </option>

            </select>

          </div>

          {/* PARTIAL PAYMENT */}

          {paymentStatus === "Partially Paid" && (

            <div className="mt-5">

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Amount paid
              </label>

              <input
                type="number"
                min="0"
                max={grandTotal}
                value={amountPaid || ""}
                onChange={(e) => {
                  const value =
                    Number(e.target.value) || 0;

                  setAmountPaid(
                    Math.min(
                      Math.max(value, 0),
                      grandTotal
                    )
                  );
                }}
                placeholder="₦0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
              />

              <div className="mt-4 flex items-center justify-between rounded-xl bg-red-50 p-4">

                <span className="font-extrabold text-gray-900">
                  Balance Due
                </span>

                <span className="font-extrabold text-red-600">
                  ₦
                  {balanceDue.toLocaleString(
                    "en-NG"
                  )}
                </span>

              </div>

            </div>

          )}

          {/* GENERATE BUTTON */}

          <button
            type="button"
            onClick={generateInvoice}
            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-extrabold text-white shadow-sm transition hover:bg-blue-700"
          >
            Generate Invoice
          </button>

        </div>

      </div>

    </main>
  );
}

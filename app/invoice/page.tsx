"use client";

import Link from "next/link";
import { useState } from "react";
import { toPng } from "html-to-image";

type PaymentStatus =
  | "Paid"
  | "Unpaid"
  | "Partially Paid";

type InvoiceItem = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

export default function InvoicePage() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 1,
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("Unpaid");

  const [amountPaid, setAmountPaid] = useState("");

  const [generated, setGenerated] = useState(false);

  /* =========================
     ITEM FUNCTIONS
  ========================= */

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const updateItem = (
    id: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  /* =========================
     CALCULATIONS
  ========================= */

  const getItemTotal = (item: InvoiceItem) => {
    return item.quantity * item.unitPrice;
  };

  const subtotal = items.reduce(
    (total, item) =>
      total + getItemTotal(item),
    0
  );

  const grandTotal = subtotal;

  const paidAmount =
    paymentStatus === "Paid"
      ? grandTotal
      : paymentStatus === "Partially Paid"
      ? Math.min(
          Math.max(0, Number(amountPaid) || 0),
          grandTotal
        )
      : 0;

  const balanceDue =
    paymentStatus === "Partially Paid"
      ? Math.max(
          0,
          grandTotal - paidAmount
        )
      : 0;

  /* =========================
     GENERATE INVOICE
  ========================= */

  const generateInvoice = () => {
    if (!customerName.trim()) {
      alert("Please enter the customer name.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Please enter the customer phone.");
      return;
    }

    if (!invoiceNumber.trim()) {
      alert("Please enter the invoice number.");
      return;
    }

    if (!invoiceDate) {
      alert("Please select the invoice date.");
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        item.quantity <= 0 ||
        item.unitPrice < 0
    );

    if (invalidItem) {
      alert(
        "Please complete all item details."
      );
      return;
    }

    if (
      paymentStatus ===
        "Partially Paid" &&
      (!amountPaid ||
        Number(amountPaid) < 0 ||
        Number(amountPaid) > grandTotal)
    ) {
      alert(
        "Please enter a valid amount paid."
      );
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
     EDIT INVOICE
  ========================= */

  const editInvoice = () => {
    setGenerated(false);

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
    const invoice =
      document.getElementById(
        "invoice-preview"
      );

    if (!invoice) {
      alert("Invoice could not be found.");
      return;
    }

    try {
      const dataUrl = await toPng(invoice, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const link =
        document.createElement("a");

      link.download = `Invoice-${
        invoiceNumber || "BizzBill"
      }.png`;

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
     PRINT
  ========================= */

  const printInvoice = () => {
    window.print();
  };

  /* =====================================================
     GENERATED INVOICE
  ===================================================== */

  if (generated) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6">

        {/* TOP NAVIGATION */}

        <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Home
          </Link>

          <div className="text-xl font-bold text-gray-900">
            Bizz
            <span className="text-blue-600">
              Bill
            </span>
          </div>

        </div>

        {/* =========================
            INVOICE PREVIEW
        ========================= */}

        <div
          id="invoice-preview"
          data-print-invoice
          className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg sm:p-10"
        >

          {/* HEADER */}

          <div className="flex flex-col justify-between gap-6 border-b pb-8 sm:flex-row">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bizz
                <span className="text-blue-600">
                  Bill
                </span>
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Professional Invoice
              </p>
            </div>

            <div className="text-left sm:text-right">

              <h2 className="text-3xl font-bold text-gray-900">
                INVOICE
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Invoice No:{" "}
                <span className="font-semibold text-gray-900">
                  {invoiceNumber}
                </span>
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Date:{" "}
                <span className="font-semibold text-gray-900">
                  {invoiceDate}
                </span>
              </p>

            </div>

          </div>

          {/* CUSTOMER */}

          <div className="flex flex-col justify-between gap-6 border-b py-8 sm:flex-row">

            <div>

              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Bill To
              </p>

              <h3 className="mt-2 text-xl font-bold text-gray-900">
                {customerName}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {customerPhone}
              </p>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Payment Status
              </p>

              <p
                className={`mt-2 text-lg font-bold ${
                  paymentStatus === "Paid"
                    ? "text-green-600"
                    : paymentStatus ===
                      "Partially Paid"
                    ? "text-orange-500"
                    : "text-red-600"
                }`}
              >
                {paymentStatus}
              </p>

            </div>

          </div>

          {/* ITEMS */}

          <div className="overflow-x-auto py-8">

            <table className="w-full min-w-[650px]">

              <thead>

                <tr className="border-b text-left text-sm font-bold text-gray-500">

                  <th className="pb-4">
                    Item
                  </th>

                  <th className="pb-4 text-center">
                    Qty
                  </th>

                  <th className="pb-4 text-right">
                    Unit Price
                  </th>

                  <th className="pb-4 text-right">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b"
                  >

                    <td className="py-5 text-sm font-medium text-gray-900">
                      {item.name}
                    </td>

                    <td className="py-5 text-center text-sm text-gray-700">
                      {item.quantity}
                    </td>

                    <td className="py-5 text-right text-sm text-gray-700">
                      ₦
                      {item.unitPrice.toLocaleString(
                        "en-NG"
                      )}
                    </td>

                    <td className="py-5 text-right text-sm font-semibold text-gray-900">
                      ₦
                      {getItemTotal(
                        item
                      ).toLocaleString(
                        "en-NG"
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* TOTALS */}

          <div className="ml-auto max-w-md space-y-4">

            <div className="flex justify-between border-b pb-3 text-sm">

              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold text-gray-900">
                ₦
                {subtotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

            {paymentStatus ===
              "Partially Paid" && (
              <>
                <div className="flex justify-between border-b pb-3 text-sm">

                  <span className="text-gray-600">
                    Amount Paid
                  </span>

                  <span className="font-semibold text-gray-900">
                    ₦
                    {paidAmount.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                <div className="flex justify-between border-b pb-3 text-sm">

                  <span className="font-semibold text-gray-700">
                    Balance Due
                  </span>

                  <span className="font-bold text-red-600">
                    ₦
                    {balanceDue.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>
              </>
            )}

            <div className="flex justify-between pt-2">

              <span className="text-xl font-bold text-gray-900">
                Grand Total
              </span>

              <span className="text-xl font-bold text-blue-600">
                ₦
                {grandTotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

          </div>

          {/* FOOTER */}

          <div className="mt-12 border-t pt-8 text-center">

            <p className="font-semibold text-gray-900">
              Thank you for your patronage.
            </p>

            <p className="mt-1 text-sm text-gray-800">
              Generated with BizzBill
            </p>

          </div>

        </div>

        {/* =========================
            ACTION BUTTONS
        ========================= */}

        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">

          {/* SAVE PNG */}

          <button
            type="button"
            onClick={saveAsImage}
            className="rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            🖼️ Save Invoice as PNG
          </button>

          {/* PRINT */}

          <button
            type="button"
            onClick={printInvoice}
            className="rounded-xl bg-gray-900 px-6 py-4 font-bold text-white transition hover:bg-gray-800"
          >
            🖨️ Print Invoice
          </button>

          {/* EDIT */}

          <button
            type="button"
            onClick={editInvoice}
            className="rounded-xl border border-gray-300 bg-white px-6 py-4 font-bold text-gray-900 transition hover:bg-gray-50"
          >
            ← Edit Invoice
          </button>

        </div>

        {/* PRINT STYLE */}

        <style jsx global>{`
          @media print {
            body {
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            #invoice-preview,
            #invoice-preview * {
              visibility: visible;
            }

            #invoice-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: none;
              margin: 0;
              box-shadow: none;
              border-radius: 0;
            }
          }
        `}</style>

      </main>
    );
  }

  /* =====================================================
     INVOICE FORM
  ===================================================== */

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">

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
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
          >
            ← Home
          </Link>

        </div>

      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Create Invoice
          </h1>

          <p className="mt-2 text-sm text-gray-900">
            Enter the invoice details below.
          </p>

        </div>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          {/* =========================
              INVOICE DETAILS
          ========================= */}

          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Invoice Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* CUSTOMER NAME */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Customer name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                placeholder="Customer name"
                className="w-full rounded-xl border border-gray-800 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* CUSTOMER PHONE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Customer phone
              </label>

              <input
                type="tel"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(
                    e.target.value
                  )
                }
                placeholder="Customer phone"
                className="w-full rounded-xl border border-gray-800 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* INVOICE NUMBER */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Invoice number
              </label>

              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) =>
                  setInvoiceNumber(
                    e.target.value
                  )
                }
                placeholder="Invoice number"
                className="w-full rounded-xl border border-gray-800 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* INVOICE DATE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Invoice date
              </label>

              <input
                type="date"
                value={invoiceDate}
                onChange={(e) =>
                  setInvoiceDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-800 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* =========================
              ITEMS
          ========================= */}

          <div className="mt-10">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold text-gray-900">
                Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                + Add Item
              </button>

            </div>

            <div className="space-y-4">

              {items.map((item) => (

                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">

                    {/* ITEM */}

                    <div className="md:col-span-4">

                      <label className="mb-2 block text-xs font-semibold text-gray-900">
                        Item
                      </label>

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Item / Service"
                        className="w-full rounded-lg border border-gray-800 bg-white px-3 py-3 outline-none focus:border-blue-500"
                      />

                    </div>

                    {/* QUANTITY */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-xs font-semibold text-gray-900">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Math.max(
                              1,
                              Number(
                                e.target.value
                              )
                            )
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-blue-500"
                      />

                    </div>

                    {/* UNIT PRICE */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-xs font-semibold text-gray-900">
                        Unit price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          item.unitPrice === 0
                            ? ""
                            : item.unitPrice
                        }
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            Math.max(
                              0,
                              Number(
                                e.target.value
                              )
                            )
                          )
                        }
                        placeholder="₦0"
                        className="w-full rounded-lg border border-gray-800 bg-white px-3 py-3 outline-none focus:border-blue-500"
                      />

                    </div>

                    {/* ITEM TOTAL */}

                    <div className="md:col-span-3">

                      <label className="mb-2 block text-xs font-semibold text-gray-900">
                        Item total
                      </label>

                      <div className="flex h-[48px] items-center rounded-lg border border-gray-800 bg-gray-100 px-3 font-bold text-gray-900">
                        ₦
                        {getItemTotal(
                          item
                        ).toLocaleString(
                          "en-NG"
                        )}
                      </div>

                    </div>

                    {/* REMOVE */}

                    <div className="flex items-end md:col-span-1">

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                        disabled={
                          items.length === 1
                        }
                        className="h-[48px] w-full rounded-lg border border-red-800 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* =========================
              TOTALS
          ========================= */}

          <div className="mt-8 ml-auto max-w-md rounded-xl bg-gray-50 p-5">

            <div className="flex justify-between text-lg font-bold">

              <span>
                Subtotal
              </span>

              <span>
                ₦
                {subtotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

            <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">

              <span>
                Grand Total
              </span>

              <span className="text-blue-600">
                ₦
                {grandTotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

          </div>

          {/* =========================
              PAYMENT
          ========================= */}

          <div className="mt-10">

            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Payment
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* PAYMENT STATUS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Payment status
                </label>

                <select
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target
                        .value as PaymentStatus
                    )
                  }
                  className="w-full rounded-xl border border-gray-800 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="Unpaid">
                    Unpaid
                  </option>

                  <option value="Partially Paid">
                    Partially Paid
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                </select>

              </div>

              {/* AMOUNT PAID */}

              {paymentStatus ===
                "Partially Paid" && (
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Amount paid
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={amountPaid}
                    onChange={(e) =>
                      setAmountPaid(
                        e.target.value
                      )
                    }
                    placeholder="Amount paid"
                    className="w-full rounded-xl border border-gray-800 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>
              )}

            </div>

            {/* BALANCE DUE */}

            {paymentStatus ===
              "Partially Paid" && (
              <div className="mt-5 rounded-xl border border-orange-500 bg-orange-50 p-5">

                <div className="flex justify-between">

                  <span className="font-semibold text-gray-900">
                    Balance Due
                  </span>

                  <span className="font-bold text-red-600">
                    ₦
                    {balanceDue.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

              </div>
            )}

          </div>

          {/* =========================
              GENERATE BUTTON
          ========================= */}

          <div className="mt-10">

            <button
              type="button"
              onClick={generateInvoice}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Generate Invoice
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}

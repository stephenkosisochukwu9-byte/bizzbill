"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";

type Item = {
  name: string;
  quantity: number | "";
  unitPrice: number;
};

type PaymentStatus = "Unpaid" | "Paid" | "Partially Paid";

export default function InvoicePage() {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [generated, setGenerated] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("Unpaid");

  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [items, setItems] = useState<Item[]>([
    {
      name: "",
      quantity: "",
      unitPrice: 0,
    },
  ]);

  /* ---------------- ITEM FUNCTIONS ---------------- */

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
        quantity: "",
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

  /* ---------------- CALCULATIONS ---------------- */

  const itemTotal = (item: Item) =>
    Number(item.quantity || 0) *
    Number(item.unitPrice || 0);

  const grandTotal = items.reduce(
    (total, item) => total + itemTotal(item),
    0
  );

  const balanceDue =
    paymentStatus === "Partially Paid"
      ? Math.max(grandTotal - amountPaid, 0)
      : 0;

  /* ---------------- GENERATE ---------------- */

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

    const validItems = items.filter(
      (item) =>
        item.name.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) >= 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one valid item.");
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

  /* ---------------- SAVE PNG ---------------- */

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

  /* =========================================================
     GENERATED INVOICE
  ========================================================= */

  if (generated) {
    return (
      <>
        <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-8 print:bg-white print:p-0">

          {/* TOP CONTROLS */}

          <div className="mx-auto mb-4 flex w-full max-w-[720px] items-center justify-between gap-3 print:hidden">

            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              ← Home
            </Link>

            <button
              type="button"
              onClick={() => setGenerated(false)}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50"
            >
              Edit Invoice
            </button>

          </div>

          {/* =================================================
              COMPACT INVOICE
          ================================================= */}

          <div
            ref={invoiceRef}
            className="mx-auto w-full max-w-[720px] overflow-hidden rounded-2xl bg-white text-gray-900 shadow-lg print:max-w-none print:rounded-none print:shadow-none"
          >

            {/* HEADER */}

            <div className="border-b border-gray-200 px-5 py-6 sm:px-7 sm:py-7">

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto] sm:items-start">

                {/* BRAND */}

                <div>
                  <h1 className="text-3xl font-extrabold leading-none tracking-tight text-gray-950 sm:text-4xl">
                    Bizz
                    <span className="text-blue-600">
                      Bill
                    </span>
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-gray-700 sm:text-base">
                    Professional Invoice
                  </p>
                </div>

                {/* INVOICE INFO */}

                <div className="sm:text-right">

                  <h2 className="text-3xl font-extrabold leading-none text-gray-950 sm:text-4xl">
                    INVOICE
                  </h2>

                  <div className="mt-3 space-y-1 text-sm text-gray-700 sm:text-base">

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

            <div className="grid grid-cols-1 gap-6 border-b border-gray-200 px-5 py-6 sm:grid-cols-2 sm:px-7">

              {/* CUSTOMER */}

              <div>

                <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                  Bill To
                </p>

                <p className="mt-2 break-words text-xl font-extrabold text-gray-950">
                  {customerName}
                </p>

                {customerPhone && (
                  <p className="mt-1 break-words text-sm font-semibold text-gray-700 sm:text-base">
                    {customerPhone}
                  </p>
                )}

              </div>

              {/* PAYMENT STATUS */}

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

            {/* =================================================
                ITEMS TABLE
            ================================================= */}

            <div className="px-5 py-5 sm:px-7 sm:py-6">

              <table className="w-full table-fixed border-collapse">

                <thead>

                  <tr className="border-b-2 border-gray-300">

                    <th className="w-[40%] pb-3 pr-2 text-left text-xs font-extrabold text-gray-800 sm:text-sm">
                      Item
                    </th>

                    <th className="w-[14%] pb-3 px-1 text-center text-xs font-extrabold text-gray-800 sm:text-sm">
                      Qty
                    </th>

                    <th className="w-[22%] pb-3 px-1 text-right text-xs font-extrabold text-gray-800 sm:text-sm">
                      Unit Price
                    </th>

                    <th className="w-[24%] pb-3 pl-1 text-right text-xs font-extrabold text-gray-800 sm:text-sm">
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {items.map((item, index) => (

                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-b-0"
                    >

                      {/* ITEM */}

                      <td className="break-words whitespace-normal py-3 pr-2 text-left text-xs font-semibold leading-5 text-gray-950 sm:text-sm">
                        {item.name || "Item / Service"}
                      </td>

                      {/* QUANTITY */}

                      <td className="py-3 px-1 text-center text-xs font-semibold text-gray-950 sm:text-sm">
                        {item.quantity || 0}
                      </td>

                      {/* UNIT PRICE */}

                      <td className="whitespace-nowrap py-3 px-1 text-right text-xs font-semibold text-gray-950 sm:text-sm">
                        ₦
                        {Number(item.unitPrice || 0).toLocaleString(
                          "en-NG"
                        )}
                      </td>

                      {/* AMOUNT */}

                      <td className="whitespace-nowrap py-3 pl-1 text-right text-xs font-extrabold text-gray-950 sm:text-sm">
                        ₦
                        {itemTotal(item).toLocaleString(
                          "en-NG"
                        )}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* =================================================
                TOTALS
            ================================================= */}

            <div className="border-t border-gray-200 px-5 py-5 sm:px-7 sm:py-6">

              <div className="ml-auto w-full max-w-[390px] space-y-4">

                {/* GRAND TOTAL */}

                <div className="flex items-center justify-between gap-4">

                  <span className="text-base font-semibold text-gray-700 sm:text-lg">
                    Grand Total
                  </span>

                  <span className="whitespace-nowrap text-base font-extrabold text-gray-950 sm:text-lg">
                    ₦
                    {grandTotal.toLocaleString("en-NG")}
                  </span>

                </div>

                {/* PARTIAL PAYMENT */}

                {paymentStatus === "Partially Paid" && (
                  <>

                    <div className="flex items-center justify-between gap-4">

                      <span className="text-base font-semibold text-gray-700 sm:text-lg">
                        Amount Paid
                      </span>

                      <span className="whitespace-nowrap text-base font-extrabold text-gray-950 sm:text-lg">
                        ₦
                        {amountPaid.toLocaleString("en-NG")}
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4">

                      <span className="text-base font-extrabold text-gray-700 sm:text-lg">
                        Balance Due
                      </span>

                      <span className="whitespace-nowrap text-base font-extrabold text-red-600 sm:text-lg">
                        ₦
                        {balanceDue.toLocaleString("en-NG")}
                      </span>

                    </div>

                  </>

                )}

                {/* UNPAID */}

                {paymentStatus === "Unpaid" && (
                  <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4">

                    <span className="text-base font-extrabold text-gray-700 sm:text-lg">
                      Balance Due
                    </span>

                    <span className="whitespace-nowrap text-base font-extrabold text-red-600 sm:text-lg">
                      ₦
                      {grandTotal.toLocaleString("en-NG")}
                    </span>

                  </div>
                )}

              </div>

            </div>

            {/* FOOTER */}

            <div className="border-t border-gray-200 px-5 py-6 text-center sm:px-7">

              <p className="text-base font-extrabold text-gray-900 sm:text-lg">
                Thank you for your business.
              </p>

              <p className="mt-1 text-xs font-semibold text-gray-600 sm:text-sm">
                Generated with BizzBill
              </p>

            </div>

          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="mx-auto mt-4 grid w-full max-w-[720px] grid-cols-1 gap-3 sm:grid-cols-2 print:hidden">

            <button
              type="button"
              onClick={saveAsImage}
              className="rounded-xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white shadow-sm hover:bg-blue-700"
            >
              🖼 Save Invoice as PNG
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-gray-900 px-5 py-4 text-base font-extrabold text-white shadow-sm hover:bg-black"
            >
              🖨 Print Invoice
            </button>

          </div>

        </main>

        {/* PRINT SETTINGS */}

        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            html,
            body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </>
    );
  }

  /* =========================================================
     INVOICE FORM
  ========================================================= */

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between gap-3">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            ← Home
          </Link>

          <h1 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
            Create Invoice
          </h1>

        </div>

        {/* FORM */}

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-6 text-2xl font-extrabold text-gray-950">
            Invoice Details
          </h2>

          {/* CUSTOMER DETAILS */}

          <div className="grid gap-5 sm:grid-cols-2">

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

          {/* =================================================
              ITEMS
          ================================================= */}

          <div className="mt-8">

            <div className="mb-4 flex items-center justify-between gap-3">

              <h2 className="text-2xl font-extrabold text-gray-950">
                Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-blue-700"
              >
                + Add Item
              </button>

            </div>

            <div className="space-y-4">

              {items.map((item, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-gray-300 bg-gray-50 p-4"
                >

                  <div className="grid gap-4 sm:grid-cols-3">

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
                        onChange={(e) => {
                          const value = e.target.value;

                          updateItem(
                            index,
                            "quantity",
                            value === ""
                              ? ""
                              : Math.max(
                                  1,
                                  Number(value)
                                )
                          );
                        }}
                        placeholder=""
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
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
                        value={
                          item.unitPrice === 0
                            ? ""
                            : item.unitPrice
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPrice",
                            Number(e.target.value)
                          )
                        }
                        placeholder="₦0"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                  </div>

                  {/* ITEM TOTAL */}

                  <div className="mt-4 flex items-center justify-between gap-3">

                    <p className="font-extrabold text-gray-900">
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
                        className="font-extrabold text-red-600 hover:text-red-700"
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

              <span className="font-extrabold text-gray-900">
                Grand Total
              </span>

              <span className="whitespace-nowrap text-xl font-extrabold text-gray-950">
                ₦
                {grandTotal.toLocaleString("en-NG")}
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
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value as PaymentStatus
                )
              }
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

          {/* AMOUNT PAID */}

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

                  const value = Number(
                    e.target.value
                  );

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

          {/* GENERATE */}

          <button
            type="button"
            onClick={generateInvoice}
            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-extrabold text-white shadow-sm hover:bg-blue-700"
          >
            Generate Invoice
          </button>

        </div>

      </div>

    </main>
  );
}


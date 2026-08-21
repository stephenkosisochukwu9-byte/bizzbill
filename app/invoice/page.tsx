"use client";

import Link from "next/link";
import { useState } from "react";
import { toPng } from "html-to-image";

type Item = {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceData = {
  customerName: string;
  customerPhone: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: Item[];
  amountPaid: number;
  paymentStatus: "Paid" | "Partially Paid" | "Unpaid";
};

export default function InvoicePage() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");

  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [amountPaid, setAmountPaid] = useState(0);

  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Partially Paid" | "Unpaid"
  >("Unpaid");

  const [generated, setGenerated] = useState(false);

  const [invoiceData, setInvoiceData] =
    useState<InvoiceData | null>(null);

  // =========================
  // ITEM FUNCTIONS
  // =========================

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
    field: keyof Item,
    value: string | number
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "quantity" ||
                field === "unitPrice"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  // =========================
  // CALCULATIONS
  // =========================

  const getItemTotal = (item: Item) => {
    return item.quantity * item.unitPrice;
  };

  const subtotal = items.reduce(
    (total, item) => total + getItemTotal(item),
    0
  );

  const grandTotal = subtotal;

  const balanceDue = Math.max(
    grandTotal - amountPaid,
    0
  );

  // =========================
  // GENERATE INVOICE
  // =========================

  const generateInvoice = () => {
    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Please enter customer phone.");
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

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        item.quantity <= 0 ||
        item.unitPrice < 0
    );

    if (invalidItem) {
      alert(
        "Please complete all item details before generating the invoice."
      );
      return;
    }

    const data: InvoiceData = {
      customerName,
      customerPhone,
      invoiceNumber,
      invoiceDate,
      items: [...items],
      amountPaid,
      paymentStatus,
    };

    setInvoiceData(data);
    setGenerated(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SAVE INVOICE AS PNG
  // =========================

  const saveAsImage = async () => {
    const invoice =
      document.getElementById("invoice-preview");

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

      const link = document.createElement("a");

      link.download = `Invoice-${
        invoiceData?.invoiceNumber || "BizzBill"
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

  // =========================
  // PRINT
  // =========================

  const printInvoice = () => {
    window.print();
  };

  // =========================
  // GENERATED INVOICE VIEW
  // =========================

  if (generated && invoiceData) {
    const previewSubtotal =
      invoiceData.items.reduce(
        (total, item) =>
          total + item.quantity * item.unitPrice,
        0
      );

    const previewBalance = Math.max(
      previewSubtotal - invoiceData.amountPaid,
      0
    );

    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">

        {/* HOME BUTTON */}

        <div className="mx-auto mb-6 flex max-w-5xl justify-start print:hidden">
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← Home
          </Link>
        </div>

        {/* INVOICE */}

        <div
          id="invoice-preview"
          className="mx-auto max-w-5xl bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10"
        >

          {/* HEADER */}

          <div className="flex flex-col gap-6 border-b border-gray-200 pb-8 sm:flex-row sm:items-start sm:justify-between">

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

              <p className="mt-2 text-sm text-gray-500">
                Invoice No:{" "}
                <span className="font-semibold text-gray-800">
                  {invoiceData.invoiceNumber}
                </span>
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Date:{" "}
                <span className="font-semibold text-gray-800">
                  {invoiceData.invoiceDate}
                </span>
              </p>
            </div>

          </div>

          {/* CUSTOMER */}

          <div className="flex flex-col gap-6 border-b border-gray-200 py-8 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Bill To
              </p>

              <h3 className="mt-2 text-xl font-bold text-gray-900">
                {invoiceData.customerName}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {invoiceData.customerPhone}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Payment Status
              </p>

              <p
                className={`mt-2 text-lg font-bold ${
                  invoiceData.paymentStatus === "Paid"
                    ? "text-green-600"
                    : invoiceData.paymentStatus ===
                      "Partially Paid"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {invoiceData.paymentStatus}
              </p>
            </div>

          </div>

          {/* ITEMS */}

          <div className="py-8">

            <div className="grid grid-cols-12 border-b border-gray-200 pb-3 text-xs font-bold uppercase tracking-wide text-gray-500">

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

            {invoiceData.items.map((item) => (

              <div
                key={item.id}
                className="grid grid-cols-12 border-b border-gray-100 py-4 text-sm text-gray-800"
              >

                <div className="col-span-5">
                  {item.name}
                </div>

                <div className="col-span-2 text-center">
                  {item.quantity}
                </div>

                <div className="col-span-2 text-right">
                  ₦
                  {item.unitPrice.toLocaleString(
                    "en-NG"
                  )}
                </div>

                <div className="col-span-3 text-right font-semibold">
                  ₦
                  {(
                    item.quantity *
                    item.unitPrice
                  ).toLocaleString("en-NG")}
                </div>

              </div>

            ))}

          </div>

          {/* TOTALS */}

          <div className="ml-auto max-w-md">

            <div className="flex justify-between border-b border-gray-100 py-3 text-sm">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold text-gray-900">
                ₦
                {previewSubtotal.toLocaleString(
                  "en-NG"
                )}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 py-3 text-sm">
              <span className="text-gray-600">
                Amount Paid
              </span>

              <span className="font-semibold text-gray-900">
                ₦
                {invoiceData.amountPaid.toLocaleString(
                  "en-NG"
                )}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-100 py-3 text-sm">
              <span className="font-semibold text-gray-800">
                Balance Due
              </span>

              <span className="font-bold text-red-600">
                ₦
                {previewBalance.toLocaleString(
                  "en-NG"
                )}
              </span>
            </div>

            <div className="mt-4 flex justify-between border-t-2 border-gray-900 pt-4">

              <span className="text-lg font-bold text-gray-900">
                Grand Total
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₦
                {previewSubtotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

          </div>

          {/* FOOTER */}

          <div className="mt-12 border-t border-gray-200 pt-6 text-center">

            <p className="font-semibold text-gray-800">
              Thank you for your business.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Generated with BizzBill
            </p>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 print:hidden">

          <button
            type="button"
            onClick={saveAsImage}
            className="rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            🖼️ Save Invoice as PNG
          </button>

          <button
            type="button"
            onClick={printInvoice}
            className="rounded-xl bg-gray-900 px-5 py-4 font-bold text-white transition hover:bg-gray-800"
          >
            🖨️ Print Invoice
          </button>

        </div>

      </main>
    );
  }

  // =========================
  // INVOICE FORM
  // =========================

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">

      {/* HEADER */}

      <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between">

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
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          ← Home
        </Link>

      </div>

      <div className="mx-auto max-w-5xl">

        {/* FORM CARD */}

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <h1 className="text-2xl font-bold text-gray-900">
            Create Invoice
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Enter the details below to generate your invoice.
          </p>

          {/* INVOICE DETAILS */}

          <div className="mt-8">

            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Invoice Details
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <input
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <input
                type="tel"
                placeholder="Customer phone"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Invoice number"
                value={invoiceNumber}
                onChange={(e) =>
                  setInvoiceNumber(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <input
                type="date"
                value={invoiceDate}
                onChange={(e) =>
                  setInvoiceDate(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />

            </div>

          </div>

          {/* ITEMS */}

          <div className="mt-8">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-lg font-bold text-gray-900">
                Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
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

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">

                    {/* ITEM NAME */}

                    <input
                      type="text"
                      placeholder="Item"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "name",
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:col-span-4"
                    />

                    {/* QUANTITY */}

                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:col-span-2"
                    />

                    {/* UNIT PRICE */}

                    <input
                      type="number"
                      min="0"
                      placeholder="Unit price"
                      value={
                        item.unitPrice === 0
                          ? ""
                          : item.unitPrice
                      }
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unitPrice",
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 md:col-span-3"
                    />

                    {/* AUTOMATIC TOTAL */}

                    <div className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-3 font-bold text-gray-900 md:col-span-2">
                      ₦
                      {getItemTotal(
                        item
                      ).toLocaleString("en-NG")}
                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      disabled={items.length === 1}
                      className="rounded-lg px-3 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 md:col-span-1"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* PAYMENT */}

          <div className="mt-8">

            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Payment
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* AMOUNT PAID */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Amount Paid
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Amount paid"
                  value={
                    amountPaid === 0
                      ? ""
                      : amountPaid
                  }
                  onChange={(e) =>
                    setAmountPaid(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* BALANCE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Balance Due
                </label>

                <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-bold text-gray-900">
                  ₦
                  {balanceDue.toLocaleString(
                    "en-NG"
                  )}
                </div>
              </div>

              {/* PAYMENT STATUS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Payment Status
                </label>

                <select
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target.value as
                        | "Paid"
                        | "Partially Paid"
                        | "Unpaid"
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
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

            </div>

          </div>

          {/* TOTALS */}

          <div className="mt-8 rounded-xl bg-gray-50 p-5">

            <div className="flex justify-between border-b border-gray-200 py-3">

              <span className="font-semibold text-gray-600">
                Subtotal
              </span>

              <span className="font-bold text-gray-900">
                ₦
                {subtotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

            <div className="flex justify-between border-b border-gray-200 py-3">

              <span className="font-semibold text-gray-600">
                Amount Paid
              </span>

              <span className="font-bold text-gray-900">
                ₦
                {amountPaid.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

            <div className="flex justify-between border-b border-gray-200 py-3">

              <span className="font-semibold text-gray-600">
                Balance Due
              </span>

              <span className="font-bold text-red-600">
                ₦
                {balanceDue.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

            <div className="flex justify-between pt-4">

              <span className="text-xl font-bold text-gray-900">
                Grand Total
              </span>

              <span className="text-2xl font-bold text-blue-600">
                ₦
                {grandTotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

          </div>

          {/* GENERATE */}

          <button
            type="button"
            onClick={generateInvoice}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
          >
            Generate Invoice
          </button>

        </section>

      </div>

    </main>
  );
}

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

export default function ReceiptPage() {
  const [businessName, setBusinessName] = useState("Ommat");
  const [customerName, setCustomerName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("001");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [paymentInfo, setPaymentInfo] = useState("Cash");

  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [generated, setGenerated] = useState(false);

  // -----------------------------
  // ADD ITEM
  // -----------------------------

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

  // -----------------------------
  // REMOVE ITEM
  // -----------------------------

  const removeItem = (id: number) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  // -----------------------------
  // UPDATE ITEM
  // -----------------------------

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
              [field]: value,
            }
          : item
      )
    );
  };

  // -----------------------------
  // ITEM TOTAL
  // -----------------------------

  const getItemTotal = (item: Item) => {
    return item.quantity * item.unitPrice;
  };

  // -----------------------------
  // TOTAL AMOUNT
  // -----------------------------

  const totalAmount = items.reduce(
    (total, item) => total + getItemTotal(item),
    0
  );

  // -----------------------------
  // GENERATE RECEIPT
  // -----------------------------

  const generateReceipt = () => {
    setGenerated(true);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  // -----------------------------
  // EDIT RECEIPT
  // -----------------------------

  const editReceipt = () => {
    setGenerated(false);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  // -----------------------------
  // SAVE AS PNG
  // -----------------------------

  const saveAsImage = async () => {
    const receipt = document.querySelector(
      "[data-receipt]"
    ) as HTMLElement | null;

    if (!receipt) {
      alert("Receipt could not be found.");
      return;
    }

    try {
      const dataUrl = await toPng(receipt, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");

      link.download = `Receipt-${receiptNumber || "receipt"}.png`;
      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the receipt as an image. Please try again."
      );
    }
  };

  // -----------------------------
  // PRINT RECEIPT
  // -----------------------------

  const printReceipt = () => {
    window.print();
  };

 // =========================================================
// GENERATED RECEIPT
// =========================================================

if (generated) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">

      <div className="mx-auto max-w-4xl">

        {/* TOP NAVIGATION */}

        <div className="mb-6 flex items-center justify-between">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Home
          </Link>

          <button
            type="button"
            onClick={editReceipt}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            ✏️ Edit Receipt
          </button>

        </div>

        {/* RECEIPT */}

        <div
          data-receipt
          className="overflow-hidden rounded-xl bg-white shadow-lg"
        >

          {/* HEADER */}

          <div className="border-b-2 border-blue-600 px-6 py-7 sm:px-10">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <h1 className="text-3xl font-bold text-blue-600">
                  {businessName || "Business Name"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Payment Receipt
                </p>

              </div>

              <div className="text-left sm:text-right">

                <h2 className="text-xl font-bold text-gray-900">
                  RECEIPT
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  No:{" "}
                  <span className="font-semibold text-gray-900">
                    {receiptNumber || "—"}
                  </span>
                </p>

                <p className="text-sm text-gray-600">
                  Date:{" "}
                  <span className="font-semibold text-gray-900">
                    {date || "—"}
                  </span>
                </p>

              </div>

            </div>

          </div>

          {/* RECEIPT BODY */}

          <div className="p-6 sm:p-10">

            {/* CUSTOMER */}

            <div className="mb-8">

              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Received From
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                {customerName || "Customer"}
              </p>

            </div>

            {/* ITEMS TABLE */}

            <div className="overflow-hidden rounded-lg border border-gray-200">

              {/* TABLE HEADER */}

              <div className="grid grid-cols-4 bg-blue-50 px-4 py-3 text-sm font-semibold text-gray-800">

                <div>
                  Item / Service
                </div>

                <div className="text-center">
                  Qty
                </div>

                <div className="text-right">
                  Unit Price
                </div>

                <div className="text-right">
                  Total
                </div>

              </div>

              {/* TABLE ROWS */}

              {items.map((item, index) => (

                <div
                  key={item.id}
                  className={`grid grid-cols-4 border-t border-gray-200 px-4 py-4 text-sm ${
                    index % 2 === 1
                      ? "bg-gray-50"
                      : "bg-white"
                  }`}
                >

                  <div className="font-medium text-gray-900">
                    {item.name || "Item"}
                  </div>

                  <div className="text-center text-gray-700">
                    {item.quantity}
                  </div>

                  <div className="text-right text-gray-700">
                    ₦
                    {item.unitPrice.toLocaleString(
                      "en-NG"
                    )}
                  </div>

                  <div className="text-right font-semibold text-gray-900">
                    ₦
                    {getItemTotal(item).toLocaleString(
                      "en-NG"
                    )}
                  </div>

                </div>

              ))}

            </div>

            {/* TOTAL + PAYMENT */}

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              {/* PAYMENT */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment Method
                </p>

                <span className="mt-2 inline-block rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  {paymentInfo}
                </span>

              </div>

              {/* TOTAL */}

              <div className="w-full border-t-2 border-blue-600 pt-4 sm:w-72">

                <div className="flex items-center justify-between">

                  <span className="text-lg font-semibold text-gray-700">
                    Total Amount
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    ₦
                    {totalAmount.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="mt-10 border-t border-gray-200 pt-6 text-center">

              <p className="font-semibold text-gray-700">
                Thank you for your patronage.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Generated with BizzBill
              </p>

            </div>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="button"
            onClick={saveAsImage}
            className="rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            🖼️ Save as PNG
          </button>

          <button
            type="button"
            onClick={printReceipt}
            className="rounded-xl bg-gray-900 px-5 py-4 font-bold text-white transition hover:bg-gray-800"
          >
            🖨️ Print Receipt
          </button>

        </div>

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

          [data-receipt],
          [data-receipt] * {
            visibility: visible;
          }

          [data-receipt] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            box-shadow: none !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }

        }

      `}</style>

    </main>
  );
}


  // =========================================================
  // RECEIPT FORM
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Create Receipt
            </h1>

            <p className="mt-2 text-gray-500">
              Create a simple professional payment receipt.
            </p>

          </div>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Home
          </Link>

        </div>

        {/* RECEIPT DETAILS */}

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Receipt Details
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* BUSINESS NAME */}

            <input
              type="text"
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
              placeholder="Business name"
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* CUSTOMER NAME */}

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              placeholder="Customer name"
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* RECEIPT NUMBER */}

            <input
              type="text"
              value={receiptNumber}
              onChange={(e) =>
                setReceiptNumber(e.target.value)
              }
              placeholder="Receipt number"
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            {/* DATE */}

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

          </div>

        </section>

        {/* ITEMS */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-xl font-bold text-gray-900">
              Items
            </h2>

            <button
              type="button"
              onClick={addItem}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              + Add Item
            </button>

          </div>

          <div className="space-y-4">

            {items.map((item) => (

              <div
                key={item.id}
                className="rounded-xl border border-gray-200 p-4"
              >

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">

                  {/* ITEM */}

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
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  {/* QUANTITY */}

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Quantity"
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  {/* UNIT PRICE */}

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
                        Number(e.target.value)
                      )
                    }
                    placeholder="Unit price"
                    className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  {/* ACTION */}

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    disabled={items.length === 1}
                    className="rounded-lg border border-red-200 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>

                </div>

                {/* AUTOMATIC ITEM TOTAL */}

                <div className="mt-4 flex justify-between rounded-lg bg-gray-50 px-4 py-3">

                  <span className="font-medium text-gray-600">
                    Item Total
                  </span>

                  <span className="font-bold text-gray-900">
                    ₦
                    {getItemTotal(
                      item
                    ).toLocaleString("en-NG")}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* PAYMENT INFO */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Payment Info
          </h2>

          <select
            value={paymentInfo}
            onChange={(e) =>
              setPaymentInfo(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >

            <option value="Cash">
              Cash
            </option>

            <option value="Bank Transfer">
              Bank Transfer
            </option>

            <option value="Card">
              Card
            </option>

            <option value="POS">
              POS
            </option>

            <option value="Online Payment">
              Online Payment
            </option>

          </select>

        </section>

        {/* TOTAL */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <div className="flex items-center justify-between">

            <span className="text-lg font-semibold text-gray-700">
              Total Amount
            </span>

            <span className="text-2xl font-bold text-gray-900">
              ₦
              {totalAmount.toLocaleString(
                "en-NG"
              )}
            </span>

          </div>

        </section>

        {/* GENERATE */}

        <button
          type="button"
          onClick={generateReceipt}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
        >
          Generate Receipt
        </button>

      </div>

    </main>
  );
}

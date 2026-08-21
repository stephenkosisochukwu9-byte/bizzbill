"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";

type Item = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type PaymentMethod =
  | "Cash"
  | "Bank Transfer"
  | "Card"
  | "Mobile Money";

export default function ReceiptPage() {
  const receiptRef = useRef<HTMLDivElement>(null);

  const [generated, setGenerated] = useState(false);

  const [businessName, setBusinessName] = useState("BizzBill");
  const [customerName, setCustomerName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptDate, setReceiptDate] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash");

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

  const itemTotal = (item: Item) =>
    Number(item.quantity || 0) *
    Number(item.unitPrice || 0);

  const totalAmount = items.reduce(
    (total, item) => total + itemTotal(item),
    0
  );

  /* =========================
     GENERATE RECEIPT
  ========================= */

  const generateReceipt = () => {
    if (!businessName.trim()) {
      alert("Please enter business name.");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!receiptNumber.trim()) {
      alert("Please enter receipt number.");
      return;
    }

    if (!receiptDate) {
      alert("Please select receipt date.");
      return;
    }

    const hasItem = items.some(
      (item) => item.name.trim() !== ""
    );

    if (!hasItem) {
      alert("Please add at least one item.");
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
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const link = document.createElement("a");

      link.download = `Receipt-${
        receiptNumber || "receipt"
      }.png`;

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to save the receipt as an image. Please try again."
      );
    }
  };

  /* =========================
     GENERATED RECEIPT
  ========================= */

  if (generated) {
    return (
      <>
        <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-8 print:bg-white print:p-0">

          {/* TOP ACTIONS */}

          <div className="mx-auto mb-4 flex w-[calc(100%-8px)] max-w-2xl items-center justify-between gap-3 print:hidden">

            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-gray-50 sm:px-4"
            >
              ← Home
            </Link>

            <button
              type="button"
              onClick={() => setGenerated(false)}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:px-4"
            >
              Edit Receipt
            </button>

          </div>

          {/* RECEIPT */}

          <div
            ref={receiptRef}
            className="
              mx-auto
              w-[calc(100%-8px)]
              max-w-2xl
              overflow-hidden
              rounded-xl
              bg-white
              text-gray-950
              shadow-md
              print:w-full
              print:max-w-none
              print:rounded-none
              print:shadow-none
            "
          >

            {/* =========================
                HEADER
            ========================= */}

            <div className="border-b border-gray-200 px-5 py-5 sm:px-7 sm:py-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0">

                  <h1 className="break-words text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
                    {businessName}
                  </h1>

                  <p className="mt-1 text-sm font-semibold text-gray-700 sm:text-base">
                    Payment Receipt
                  </p>

                </div>

                <div className="sm:text-right">

                  <h2 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">
                    RECEIPT
                  </h2>

                  <div className="mt-2 space-y-1 text-sm text-gray-700">

                    <p>
                      Receipt No:{" "}
                      <span className="font-bold text-gray-950">
                        {receiptNumber}
                      </span>
                    </p>

                    <p>
                      Date:{" "}
                      <span className="font-bold text-gray-950">
                        {receiptDate}
                      </span>
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =========================
                CUSTOMER + PAYMENT
            ========================= */}

            <div className="grid grid-cols-1 gap-5 border-b border-gray-200 px-5 py-5 sm:grid-cols-2 sm:px-7 sm:py-6">

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Received From
                </p>

                <p className="mt-1 break-words text-lg font-extrabold text-gray-950 sm:text-xl">
                  {customerName}
                </p>

              </div>

              <div className="sm:text-right">

                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Payment Method
                </p>

                <p className="mt-1 break-words text-lg font-extrabold text-blue-600 sm:text-xl">
                  {paymentMethod}
                </p>

              </div>

            </div>

            {/* =========================
                ITEMS
            ========================= */}

            <div className="border-b border-gray-200 px-5 py-5 sm:px-7 sm:py-6">

              {/* DESKTOP TABLE */}

              <div className="hidden sm:block">

                <table className="w-full table-fixed">

                  <thead>

                    <tr className="border-b-2 border-gray-300">

                      <th className="w-[40%] pb-3 text-left text-sm font-extrabold text-gray-900">
                        Item / Service
                      </th>

                      <th className="w-[15%] pb-3 text-center text-sm font-extrabold text-gray-900">
                        Qty
                      </th>

                      <th className="w-[22%] pb-3 text-right text-sm font-extrabold text-gray-900">
                        Unit Price
                      </th>

                      <th className="w-[23%] pb-3 text-right text-sm font-extrabold text-gray-900">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {items.map((item, index) => (

                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-b-0"
                      >

                        <td className="break-words py-3 pr-2 text-left text-sm font-bold text-gray-950">
                          {item.name || "Item / Service"}
                        </td>

                        <td className="py-3 text-center text-sm font-bold text-gray-950">
                          {item.quantity}
                        </td>

                        <td className="py-3 text-right text-sm font-bold text-gray-950">
                          ₦
                          {Number(
                            item.unitPrice || 0
                          ).toLocaleString("en-NG")}
                        </td>

                        <td className="py-3 text-right text-sm font-extrabold text-gray-950">
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

              {/* MOBILE ITEMS */}

              <div className="space-y-3 sm:hidden">

                <div className="grid grid-cols-[1fr_55px_95px_95px] gap-2 border-b-2 border-gray-300 pb-3">

                  <p className="text-xs font-extrabold text-gray-900">
                    Item / Service
                  </p>

                  <p className="text-center text-xs font-extrabold text-gray-900">
                    Qty
                  </p>

                  <p className="text-right text-xs font-extrabold text-gray-900">
                    Unit Price
                  </p>

                  <p className="text-right text-xs font-extrabold text-gray-900">
                    Total
                  </p>

                </div>

                {items.map((item, index) => (

                  <div
                    key={index}
                    className="grid grid-cols-[1fr_55px_95px_95px] items-center gap-2 border-b border-gray-100 py-3 last:border-b-0"
                  >

                    <p className="min-w-0 break-words text-xs font-bold text-gray-950">
                      {item.name || "Item / Service"}
                    </p>

                    <p className="text-center text-xs font-bold text-gray-950">
                      {item.quantity}
                    </p>

                    <p className="text-right text-xs font-bold text-gray-950">
                      ₦
                      {Number(
                        item.unitPrice || 0
                      ).toLocaleString("en-NG")}
                    </p>

                    <p className="text-right text-xs font-extrabold text-gray-950">
                      ₦
                      {itemTotal(item).toLocaleString(
                        "en-NG"
                      )}
                    </p>

                  </div>

                ))}

              </div>

            </div>

            {/* =========================
                TOTALS
            ========================= */}

            <div className="border-b border-gray-200 px-5 py-5 sm:px-7 sm:py-6">

              <div className="ml-auto w-full max-w-sm space-y-3">

                <div className="flex items-center justify-between gap-4">

                  <span className="text-sm font-bold text-gray-700 sm:text-base">
                    Total Amount
                  </span>

                  <span className="text-base font-extrabold text-gray-950 sm:text-lg">
                    ₦
                    {totalAmount.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-4">

                  <span className="text-sm font-bold text-gray-700 sm:text-base">
                    Amount Paid
                  </span>

                  <span className="text-base font-extrabold text-gray-950 sm:text-lg">
                    ₦
                    {totalAmount.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3">

                  <span className="text-sm font-extrabold text-gray-700 sm:text-base">
                    Balance Due
                  </span>

                  <span className="text-base font-extrabold text-red-600 sm:text-lg">
                    ₦0
                  </span>

                </div>

              </div>

            </div>

            {/* =========================
                FOOTER
            ========================= */}

            <div className="px-5 py-4 text-center sm:px-7 sm:py-5">

              <p className="text-base font-extrabold text-gray-950 sm:text-lg">
                Thank you for your patronage.
              </p>

              <p className="mt-1 text-xs font-semibold text-gray-600 sm:text-sm">
                Generated with BizzBill
              </p>

            </div>

          </div>

          {/* =========================
              ACTION BUTTONS
          ========================= */}

          <div className="mx-auto mt-4 grid w-[calc(100%-8px)] max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 print:hidden">

            <button
              type="button"
              onClick={saveAsImage}
              className="rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 sm:text-base"
            >
              🖼 Save Receipt as PNG
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-gray-950 sm:text-base"
            >
              🖨 Print Receipt
            </button>

          </div>

        </main>

        {/* PRINT STYLES */}

        <style jsx global>{`
          @media print {
            @page {
              size: auto;
              margin: 8mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </>
    );
  }

  /* =========================
     RECEIPT FORM
  ========================= */

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between gap-3">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            ← Home
          </Link>

          <h1 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
            Create Receipt
          </h1>

        </div>

        {/* FORM */}

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-6 text-2xl font-extrabold text-gray-950">
            Receipt Details
          </h2>

          {/* BUSINESS */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-extrabold text-gray-900">
              Business name
            </label>

            <input
              type="text"
              value={businessName}
              onChange={(e) =>
                setBusinessName(e.target.value)
              }
              placeholder="Business name"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* CUSTOMER / RECEIPT / DATE */}

          <div className="grid gap-5 sm:grid-cols-2">

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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Receipt number
              </label>

              <input
                type="text"
                value={receiptNumber}
                onChange={(e) =>
                  setReceiptNumber(e.target.value)
                }
                placeholder="Receipt number"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Receipt date
              </label>

              <input
                type="date"
                value={receiptDate}
                onChange={(e) =>
                  setReceiptDate(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* ITEMS */}

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
                        Item / Service
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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                    {/* QUANTITY */}

                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-gray-900">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          item.quantity === 0
                            ? ""
                            : item.quantity
                        }
                        onChange={(e) => {
                          const value =
                            e.target.value;

                          updateItem(
                            index,
                            "quantity",
                            value === ""
                              ? 0
                              : Number(value)
                          );
                        }}
                        placeholder="Enter quantity"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none"
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
                        onChange={(e) => {
                          const value =
                            e.target.value;

                          updateItem(
                            index,
                            "unitPrice",
                            value === ""
                              ? 0
                              : Number(value)
                          );
                        }}
                        placeholder="₦0"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                  </div>

                  {/* ITEM TOTAL */}

                  <div className="mt-4 flex items-center justify-between gap-3">

                    <p className="text-sm font-extrabold text-gray-900 sm:text-base">
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
                        className="text-sm font-extrabold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* TOTAL */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

            <div className="flex items-center justify-between gap-4">

              <span className="text-base font-extrabold text-gray-900">
                Total Amount
              </span>

              <span className="text-xl font-extrabold text-gray-950">
                ₦
                {totalAmount.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

          </div>

          {/* PAYMENT METHOD */}

          <div className="mt-8">

            <label className="mb-2 block text-sm font-extrabold text-gray-900">
              Payment method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as PaymentMethod
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-extrabold text-gray-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
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

              <option value="Mobile Money">
                Mobile Money
              </option>

            </select>

          </div>

          {/* GENERATE */}

          <button
            type="button"
            onClick={generateReceipt}
            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-extrabold text-white shadow-sm transition hover:bg-blue-700"
          >
            Generate Receipt
          </button>

        </div>

      </div>

    </main>
  );
}


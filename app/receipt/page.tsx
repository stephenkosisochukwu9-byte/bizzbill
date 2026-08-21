"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";

type Item = {
  name: string;
  quantity: number | "";
  unitPrice: number;
};

type PaymentMethod =
  | "Cash"
  | "Bank Transfer"
  | "Card"
  | "Other";

export default function ReceiptPage() {
  const receiptRef = useRef<HTMLDivElement>(null);

  const [generated, setGenerated] = useState(false);

  const [businessName, setBusinessName] =
    useState("BizzBill");

  const [customerName, setCustomerName] =
    useState("");

  const [receiptNumber, setReceiptNumber] =
    useState("");

  const [receiptDate, setReceiptDate] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash");

  const [amountPaid, setAmountPaid] =
    useState<number>(0);

  const [items, setItems] = useState<Item[]>([
    {
      name: "",
      quantity: "",
      unitPrice: 0,
    },
  ]);

  /* =========================
     ITEM TOTAL
  ========================= */

  const itemTotal = (item: Item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.unitPrice || 0)
    );
  };

  /* =========================
     GRAND TOTAL
  ========================= */

  const grandTotal = items.reduce(
    (total, item) => total + itemTotal(item),
    0
  );

  /* =========================
     BALANCE
  ========================= */

  const balanceDue = Math.max(
    grandTotal - amountPaid,
    0
  );

  /* =========================
     UPDATE ITEM
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

  /* =========================
     ADD ITEM
  ========================= */

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

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem = (index: number) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter((_, i) => i !== index)
    );
  };

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

    if (items.some((item) => !item.name.trim())) {
      alert("Please enter a name for every item.");
      return;
    }

    if (
      items.some(
        (item) =>
          item.quantity === "" ||
          Number(item.quantity) <= 0
      )
    ) {
      alert("Please enter a valid quantity for every item.");
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
     SAVE RECEIPT AS PNG
  ========================= */

  const saveAsImage = async () => {
    if (!receiptRef.current) {
      return;
    }

    try {
      const dataUrl = await toPng(
        receiptRef.current,
        {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        }
      );

      const link =
        document.createElement("a");

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

  /* ==================================================
     GENERATED RECEIPT
  ================================================== */

  if (generated) {
    return (
      <>
        <style jsx global>{`
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            @page {
              size: A4;
              margin: 0;
            }

            .no-print {
              display: none !important;
            }

            [data-print-receipt] {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
          }
        `}</style>

        <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-10">

          {/* =========================
              TOP BUTTONS
          ========================= */}

          <div className="no-print mx-auto mb-5 flex w-full max-w-4xl items-center justify-between gap-3">

            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-50"
            >
              ← Home
            </Link>

            <button
              type="button"
              onClick={() =>
                setGenerated(false)
              }
              className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-extrabold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Edit Receipt
            </button>

          </div>

          {/* =========================
              RECEIPT
          ========================= */}

          <div
            ref={receiptRef}
            data-print-receipt
            className="mx-auto box-border w-full max-w-4xl overflow-hidden rounded-2xl bg-white text-gray-950 shadow-lg"
          >

            {/* =========================
                RECEIPT HEADER
            ========================= */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                {/* BUSINESS */}

                <div>

                  <h1 className="break-words text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                    {businessName}
                  </h1>

                  <p className="mt-1 text-sm font-semibold text-gray-700 sm:text-base">
                    Payment Receipt
                  </p>

                </div>

                {/* RECEIPT DETAILS */}

                <div className="sm:text-right">

                  <h2 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
                    RECEIPT
                  </h2>

                  <div className="mt-3 space-y-1.5 text-sm text-gray-700 sm:text-base">

                    <p>
                      Receipt No:{" "}
                      <span className="font-extrabold text-gray-950">
                        {receiptNumber}
                      </span>
                    </p>

                    <p>
                      Date:{" "}
                      <span className="font-extrabold text-gray-950">
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

            <div className="grid grid-cols-1 gap-7 border-b border-gray-200 px-5 py-7 sm:grid-cols-2 sm:px-10 sm:py-9">

              {/* CUSTOMER */}

              <div>

                <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600 sm:text-sm">
                  Received From
                </p>

                <p className="mt-2 break-words text-xl font-extrabold text-gray-950 sm:text-2xl">
                  {customerName}
                </p>

              </div>

              {/* PAYMENT METHOD */}

              <div className="sm:text-right">

                <p className="text-xs font-extrabold uppercase tracking-wide text-gray-600 sm:text-sm">
                  Payment Method
                </p>

                <p className="mt-2 text-xl font-extrabold text-blue-600 sm:text-2xl">
                  {paymentMethod}
                </p>

              </div>

            </div>

            {/* =========================
                ITEMS
            ========================= */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

              <div className="w-full overflow-hidden">

                <table className="w-full table-fixed border-collapse">

                  <thead>

                    <tr className="border-b-2 border-gray-300">

                      <th className="w-[38%] pb-4 pr-2 text-left text-xs font-extrabold text-gray-800 sm:text-sm">
                        Item / Service
                      </th>

                      <th className="w-[13%] pb-4 text-center text-xs font-extrabold text-gray-800 sm:text-sm">
                        Qty
                      </th>

                      <th className="w-[25%] pb-4 text-right text-xs font-extrabold text-gray-800 sm:text-sm">
                        Unit Price
                      </th>

                      <th className="w-[24%] pb-4 text-right text-xs font-extrabold text-gray-800 sm:text-sm">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {items.map(
                      (item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100"
                        >

                          <td className="break-words py-5 pr-2 text-left text-sm font-bold text-gray-950 sm:text-base">
                            {item.name}
                          </td>

                          <td className="py-5 text-center text-sm font-bold text-gray-950 sm:text-base">
                            {item.quantity}
                          </td>

                          <td className="whitespace-nowrap py-5 text-right text-sm font-semibold text-gray-950 sm:text-base">
                            ₦
                            {Number(
                              item.unitPrice
                            ).toLocaleString(
                              "en-NG"
                            )}
                          </td>

                          <td className="whitespace-nowrap py-5 text-right text-sm font-extrabold text-gray-950 sm:text-base">
                            ₦
                            {itemTotal(
                              item
                            ).toLocaleString(
                              "en-NG"
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =========================
                TOTALS
            ========================= */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

              <div className="ml-auto w-full max-w-md space-y-5">

                {/* TOTAL AMOUNT */}

                <div className="flex items-center justify-between gap-5">

                  <span className="text-base font-bold text-gray-800 sm:text-lg">
                    Total Amount
                  </span>

                  <span className="whitespace-nowrap text-lg font-extrabold text-gray-950 sm:text-xl">
                    ₦
                    {grandTotal.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                {/* AMOUNT PAID */}

                <div className="flex items-center justify-between gap-5">

                  <span className="text-base font-bold text-gray-800 sm:text-lg">
                    Amount Paid
                  </span>

                  <span className="whitespace-nowrap text-lg font-extrabold text-gray-950 sm:text-xl">
                    ₦
                    {amountPaid.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                {/* BALANCE */}

                <div className="flex items-center justify-between gap-5 border-t border-gray-200 pt-5">

                  <span className="text-base font-extrabold text-gray-800 sm:text-lg">
                    Balance Due
                  </span>

                  <span className="whitespace-nowrap text-lg font-extrabold text-red-600 sm:text-xl">
                    ₦
                    {balanceDue.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

              </div>

            </div>

            {/* =========================
                FOOTER
            ========================= */}

            <div className="px-5 py-7 text-center sm:px-10 sm:py-9">

              <p className="text-base font-extrabold text-gray-900 sm:text-lg">
                Thank you for your patronage.
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-600">
                Generated with BizzBill
              </p>

            </div>

          </div>

          {/* =========================
              ACTION BUTTONS
          ========================= */}

          <div className="no-print mx-auto mt-5 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={saveAsImage}
              className="rounded-xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-blue-700"
            >
              🖼 Save Receipt as PNG
            </button>

            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="rounded-xl bg-gray-900 px-5 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-gray-950"
            >
              🖨 Print Receipt
            </button>

          </div>

        </main>
      </>
    );
  }

  /* ==================================================
     RECEIPT FORM
  ================================================== */

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto w-full max-w-5xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6 flex items-center justify-between gap-3">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-900 shadow-sm transition hover:bg-gray-50"
          >
            ← Home
          </Link>

          <h1 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
            Create Receipt
          </h1>

        </div>

        {/* =========================
            FORM
        ========================= */}

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-6 text-2xl font-extrabold text-gray-950">
            Receipt Details
          </h2>

          {/* =========================
              BASIC DETAILS
          ========================= */}

          <div className="grid gap-5 sm:grid-cols-2">

            {/* BUSINESS NAME */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Business name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) =>
                  setBusinessName(
                    e.target.value
                  )
                }
                placeholder="Business name"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* CUSTOMER NAME */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* RECEIPT NUMBER */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Receipt number
              </label>

              <input
                type="text"
                value={receiptNumber}
                onChange={(e) =>
                  setReceiptNumber(
                    e.target.value
                  )
                }
                placeholder="Receipt number"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* DATE */}

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-900">
                Date
              </label>

              <input
                type="date"
                value={receiptDate}
                onChange={(e) =>
                  setReceiptDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* =========================
              ITEMS
          ========================= */}

          <div className="mt-8">

            <div className="mb-4 flex items-center justify-between gap-3">

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

            <div className="space-y-4">

              {items.map(
                (item, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border border-gray-300 bg-gray-50 p-4"
                  >

                    {/* ITEM */}

                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-gray-800">
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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                    {/* QUANTITY + PRICE */}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">

                      {/* QUANTITY */}

                      <div>

                        <label className="mb-2 block text-sm font-extrabold text-gray-800">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={
                            item.quantity
                          }
                          onChange={(e) => {

                            const value =
                              e.target.value;

                            updateItem(
                              index,
                              "quantity",
                              value === ""
                                ? ""
                                : Number(value)
                            );

                          }}
                          placeholder="Quantity"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                        />

                      </div>

                      {/* UNIT PRICE */}

                      <div>

                        <label className="mb-2 block text-sm font-extrabold text-gray-800">
                          Unit price
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            item.unitPrice || ""
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitPrice",
                              e.target.value === ""
                                ? 0
                                : Number(
                                    e.target
                                      .value
                                  )
                            )
                          }
                          placeholder="₦0"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                        />

                      </div>

                    </div>

                    {/* ITEM TOTAL */}

                    <div className="mt-4 flex items-center justify-between gap-4">

                      <p className="text-sm font-extrabold text-gray-900 sm:text-base">
                        Item total: ₦
                        {itemTotal(
                          item
                        ).toLocaleString(
                          "en-NG"
                        )}
                      </p>

                      {items.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          className="text-sm font-extrabold text-red-600 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* =========================
              TOTAL AMOUNT
          ========================= */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

            <div className="flex items-center justify-between gap-5">

              <span className="text-base font-extrabold text-gray-900">
                Total Amount
              </span>

              <span className="whitespace-nowrap text-xl font-extrabold text-gray-950">
                ₦
                {grandTotal.toLocaleString(
                  "en-NG"
                )}
              </span>

            </div>

          </div>

          {/* =========================
              PAYMENT INFO
          ========================= */}

          <div className="mt-8">

            <label className="mb-2 block text-sm font-extrabold text-gray-900">
              Payment info
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target
                    .value as PaymentMethod
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

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* =========================
              AMOUNT PAID
          ========================= */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-extrabold text-gray-900">
              Amount paid
            </label>

            <input
              type="number"
              min="0"
              max={grandTotal}
              value={
                amountPaid || ""
              }
              onChange={(e) => {

                const value =
                  e.target.value;

                if (value === "") {
                  setAmountPaid(0);
                  return;
                }

                setAmountPaid(
                  Math.min(
                    Math.max(
                      Number(value),
                      0
                    ),
                    grandTotal
                  )
                );

              }}
              placeholder="₦0"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* =========================
              BALANCE DUE
          ========================= */}

          <div className="mt-4 flex items-center justify-between gap-5 rounded-xl bg-red-50 p-4">

            <span className="font-extrabold text-gray-800">
              Balance Due
            </span>

            <span className="whitespace-nowrap font-extrabold text-red-600">
              ₦
              {balanceDue.toLocaleString(
                "en-NG"
              )}
            </span>

          </div>

          {/* =========================
              GENERATE
          ========================= */}

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


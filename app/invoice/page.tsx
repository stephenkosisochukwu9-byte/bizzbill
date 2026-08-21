"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";

type Item = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type PaymentStatus =
  | "Unpaid"
  | "Paid"
  | "Partially Paid";

export default function InvoicePage() {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [generated, setGenerated] = useState(false);

  // -----------------------------
  // CUSTOMER / INVOICE DETAILS
  // -----------------------------

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [invoiceDate, setInvoiceDate] =
    useState("");


  // -----------------------------
  // PAYMENT
  // -----------------------------

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("Unpaid");

  const [amountPaid, setAmountPaid] =
    useState<number>(0);


  // -----------------------------
  // ITEMS
  // -----------------------------

  const [items, setItems] = useState<Item[]>([
    {
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);


  // -----------------------------
  // UPDATE ITEM
  // -----------------------------

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


  // -----------------------------
  // ADD ITEM
  // -----------------------------

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


  // -----------------------------
  // REMOVE ITEM
  // -----------------------------

  const removeItem = (index: number) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter((_, i) => i !== index)
    );
  };


  // -----------------------------
  // ITEM TOTAL
  // -----------------------------

  const itemTotal = (item: Item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.unitPrice || 0)
    );
  };


  // -----------------------------
  // GRAND TOTAL
  // -----------------------------

  const grandTotal = items.reduce(
    (total, item) =>
      total + itemTotal(item),
    0
  );


  // -----------------------------
  // BALANCE DUE
  // -----------------------------

  const balanceDue =
    paymentStatus === "Partially Paid"
      ? Math.max(
          grandTotal - amountPaid,
          0
        )
      : 0;


  // -----------------------------
  // GENERATE INVOICE
  // -----------------------------

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
        item.name.trim() !== "" &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) >= 0
    );

    if (validItems.length === 0) {
      alert(
        "Please add at least one item with a name."
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


  // -----------------------------
  // SAVE AS PNG
  // -----------------------------

  const saveAsImage = async () => {
    if (!invoiceRef.current) {
      return;
    }

    try {
      const dataUrl = await toPng(
        invoiceRef.current,
        {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        }
      );

      const link =
        document.createElement("a");

      link.download = `Invoice-${
        invoiceNumber || "invoice"
      }.png`;

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error(
        "Invoice PNG error:",
        error
      );

      alert(
        "Unable to save the invoice as an image. Please try again."
      );
    }
  };


  // ============================================================
  // GENERATED INVOICE
  // ============================================================

  if (generated) {
    return (
      <>
        <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-10">

          {/* TOP NAVIGATION */}

          <div className="no-print mx-auto mb-5 flex w-full max-w-5xl items-center justify-between gap-3">

            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
            >
              ← Home
            </Link>

            <button
              type="button"
              onClick={() =>
                setGenerated(false)
              }
              className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Edit Invoice
            </button>

          </div>


          {/* ================================================== */}
          {/* INVOICE */}
          {/* ================================================== */}

          <div
            ref={invoiceRef}
            className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg"
          >

            {/* ================= HEADER ================= */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">

                {/* BUSINESS */}

                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                    Bizz
                    <span className="text-blue-600">
                      Bill
                    </span>
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-gray-600 sm:text-base">
                    Professional Invoice
                  </p>
                </div>


                {/* INVOICE DETAILS */}

                <div className="sm:text-right">

                  <h2 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
                    INVOICE
                  </h2>

                  <div className="mt-4 space-y-2 text-sm text-gray-600 sm:text-base">

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


            {/* ================= CUSTOMER ================= */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10">

              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">

                {/* BILL TO */}

                <div>

                  <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Bill To
                  </p>

                  <p className="mt-2 break-words text-xl font-extrabold text-gray-950 sm:text-2xl">
                    {customerName}
                  </p>

                  {customerPhone && (
                    <p className="mt-2 break-words text-sm font-medium text-gray-700 sm:text-base">
                      {customerPhone}
                    </p>
                  )}

                </div>


                {/* PAYMENT STATUS */}

                <div className="sm:text-right">

                  <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Payment Status
                  </p>

                  <p
                    className={`mt-2 text-xl font-extrabold sm:text-2xl ${
                      paymentStatus === "Paid"
                        ? "text-green-600"
                        : paymentStatus ===
                          "Partially Paid"
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {paymentStatus}
                  </p>

                </div>

              </div>

            </div>


            {/* ================================================== */}
            {/* ITEMS */}
            {/* ================================================== */}

            <div className="border-b border-gray-200 px-5 py-6 sm:px-10">

              {/* ITEM HEADER */}

              <div
                className="
                  grid
                  grid-cols-[minmax(0,1.6fr)_minmax(0,0.5fr)_minmax(0,1fr)_minmax(0,1fr)]
                  gap-2
                  border-b
                  border-gray-300
                  pb-4
                  text-xs
                  font-extrabold
                  text-gray-700
                  sm:gap-4
                  sm:text-sm
                "
              >

                <div>
                  Item
                </div>

                <div className="text-center">
                  Qty
                </div>

                <div className="text-right">
                  Unit Price
                </div>

                <div className="text-right">
                  Amount
                </div>

              </div>


              {/* ITEM ROWS */}

              <div>

                {items.map(
                  (item, index) => {

                    // Don't display completely
                    // empty rows in generated invoice
                    if (
                      !item.name.trim() &&
                      item.unitPrice === 0
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={index}
                        className="
                          grid
                          grid-cols-[minmax(0,1.6fr)_minmax(0,0.5fr)_minmax(0,1fr)_minmax(0,1fr)]
                          gap-2
                          border-b
                          border-gray-100
                          py-4
                          text-xs
                          sm:gap-4
                          sm:text-sm
                        "
                      >

                        {/* ITEM */}

                        <div className="min-w-0 break-words font-semibold text-gray-950">
                          {item.name}
                        </div>


                        {/* QUANTITY */}

                        <div className="text-center font-medium text-gray-900">
                          {item.quantity}
                        </div>


                        {/* UNIT PRICE */}

                        <div className="min-w-0 text-right font-medium text-gray-900">
                          ₦
                          {Number(
                            item.unitPrice
                          ).toLocaleString(
                            "en-NG"
                          )}
                        </div>


                        {/* AMOUNT */}

                        <div className="min-w-0 text-right font-extrabold text-gray-950">
                          ₦
                          {itemTotal(
                            item
                          ).toLocaleString(
                            "en-NG"
                          )}
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>


            {/* ================================================== */}
            {/* TOTALS */}
            {/* ================================================== */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10">

              <div className="ml-auto w-full max-w-md space-y-5">

                {/* GRAND TOTAL */}

                <div className="flex items-center justify-between gap-5 text-base sm:text-lg">

                  <span className="font-semibold text-gray-700">
                    Grand Total
                  </span>

                  <span className="shrink-0 font-extrabold text-gray-950">
                    ₦
                    {grandTotal.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>


                {/* PARTIAL PAYMENT */}

                {paymentStatus ===
                  "Partially Paid" && (
                  <>
                    {/* AMOUNT PAID */}

                    <div className="flex items-center justify-between gap-5 text-base sm:text-lg">

                      <span className="font-semibold text-gray-700">
                        Amount Paid
                      </span>

                      <span className="shrink-0 font-extrabold text-gray-950">
                        ₦
                        {amountPaid.toLocaleString(
                          "en-NG"
                        )}
                      </span>

                    </div>


                    {/* BALANCE */}

                    <div className="flex items-center justify-between gap-5 border-t border-gray-200 pt-5 text-base sm:text-lg">

                      <span className="font-extrabold text-gray-700">
                        Balance Due
                      </span>

                      <span className="shrink-0 font-extrabold text-red-600">
                        ₦
                        {balanceDue.toLocaleString(
                          "en-NG"
                        )}
                      </span>

                    </div>

                  </>
                )}

              </div>

            </div>


            {/* ================================================== */}
            {/* FOOTER */}
            {/* ================================================== */}

            <div className="px-5 py-7 text-center sm:px-10">

              <p className="text-base font-extrabold text-gray-900 sm:text-lg">
                Thank you for your business.
              </p>

              <p className="mt-2 text-xs font-medium text-gray-500 sm:text-sm">
                Generated with BizzBill
              </p>

            </div>

          </div>


          {/* ================================================== */}
          {/* ACTION BUTTONS */}
          {/* ================================================== */}

          <div className="no-print mx-auto mt-5 grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2">

            {/* SAVE PNG */}

            <button
              type="button"
              onClick={saveAsImage}
              className="rounded-xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-blue-700"
            >
              🖼 Save Invoice as PNG
            </button>


            {/* PRINT */}

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-gray-900 px-5 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-black"
            >
              🖨 Print Invoice
            </button>

          </div>

        </main>


        {/* ================================================== */}
        {/* PRINT STYLES */}
        {/* ================================================== */}

        <style jsx global>{`

          @media print {

            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .no-print {
              display: none !important;
            }

            main {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            [data-invoice="true"] {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: none !important;
              width: 100% !important;
            }

          }

        `}</style>
      </>
    );
  }


  // ============================================================
  // CREATE INVOICE FORM
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

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

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-7 text-2xl font-extrabold text-gray-950">
            Invoice Details
          </h2>


          {/* CUSTOMER DETAILS */}

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
                  setCustomerName(
                    e.target.value
                  )
                }
                placeholder="Customer name"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-4
                  text-base
                  font-semibold
                  text-gray-950
                  placeholder:text-gray-500
                  focus:border-blue-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-100
                "
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
                  setCustomerPhone(
                    e.target.value
                  )
                }
                placeholder="Customer phone"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-4
                  text-base
                  font-semibold
                  text-gray-950
                  placeholder:text-gray-500
                  focus:border-blue-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-100
                "
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
                  setInvoiceNumber(
                    e.target.value
                  )
                }
                placeholder="Invoice number"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-4
                  text-base
                  font-semibold
                  text-gray-950
                  placeholder:text-gray-500
                  focus:border-blue-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-100
                "
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
                  setInvoiceDate(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-4
                  text-base
                  font-semibold
                  text-gray-950
                  focus:border-blue-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

            </div>

          </div>


          {/* ================================================== */}
          {/* ITEMS FORM */}
          {/* ================================================== */}

          <div className="mt-8">

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


            <div className="space-y-4">

              {items.map(
                (item, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border border-gray-300 bg-gray-50 p-4"
                  >

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                      {/* ITEM */}

                      <div>

                        <label className="mb-2 block text-sm font-extrabold text-gray-800">
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
                          className="
                            w-full
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3.5
                            text-base
                            font-semibold
                            text-gray-950
                            placeholder:text-gray-500
                            focus:border-blue-600
                            focus:outline-none
                          "
                        />

                      </div>


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
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Math.max(
                                1,
                                Number(
                                  e.target.value
                                )
                              )
                            )
                          }
                          className="
                            w-full
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3.5
                            text-base
                            font-semibold
                            text-gray-950
                            focus:border-blue-600
                            focus:outline-none
                          "
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
                              Math.max(
                                0,
                                Number(
                                  e.target.value
                                )
                              )
                            )
                          }
                          placeholder="₦0"
                          className="
                            w-full
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-3.5
                            text-base
                            font-semibold
                            text-gray-950
                            placeholder:text-gray-500
                            focus:border-blue-600
                            focus:outline-none
                          "
                        />

                      </div>

                    </div>


                    {/* ITEM TOTAL / REMOVE */}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                      <p className="font-extrabold text-gray-900">
                        Item total: ₦
                        {itemTotal(
                          item
                        ).toLocaleString(
                          "en-NG"
                        )}
                      </p>


                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          className="font-extrabold text-red-600 transition hover:text-red-700"
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


          {/* ================================================== */}
          {/* GRAND TOTAL */}
          {/* ================================================== */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

            <div className="flex items-center justify-between gap-4">

              <span className="font-extrabold text-gray-900">
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


          {/* ================================================== */}
          {/* PAYMENT STATUS */}
          {/* ================================================== */}

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

                if (value !== "Partially Paid") {
                  setAmountPaid(0);
                }

              }}
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-4
                text-base
                font-extrabold
                text-gray-950
                focus:border-blue-600
                focus:outline-none
                focus:ring-2
                focus:ring-blue-100
              "
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


          {/* ================================================== */}
          {/* PARTIAL PAYMENT */}
          {/* ================================================== */}

          {paymentStatus ===
            "Partially Paid" && (

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
                    Number(
                      e.target.value
                    );

                  setAmountPaid(
                    Math.min(
                      Math.max(
                        value,
                        0
                      ),
                      grandTotal
                    )
                  );

                }}
                placeholder="₦0"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-4
                  text-base
                  font-semibold
                  text-gray-950
                  placeholder:text-gray-500
                  focus:border-blue-600
                  focus:outline-none
                "
              />


              {/* BALANCE */}

              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-red-50 p-4">

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

            </div>

          )}


          {/* ================================================== */}
          {/* GENERATE */}
          {/* ================================================== */}

          <button
            type="button"
            onClick={generateInvoice}
            className="
              mt-8
              w-full
              rounded-xl
              bg-blue-600
              px-5
              py-4
              text-lg
              font-extrabold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
            "
          >
            Generate Invoice
          </button>

        </div>

      </div>

    </main>
  );
}

"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";

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
    useState<"Unpaid" | "Paid" | "Partially Paid">("Unpaid");

  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [items, setItems] = useState<Item[]>([
    {
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

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

  const grandTotal = items.reduce(
    (total, item) => total + itemTotal(item),
    0
  );

  const balanceDue =
    paymentStatus === "Partially Paid"
      ? Math.max(grandTotal - amountPaid, 0)
      : 0;

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

    setGenerated(true);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  const saveAsImage = async () => {
    if (!invoiceRef.current) return;

    try {
      const dataUrl = await toPng(invoiceRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");

      link.download = `Invoice-${invoiceNumber || "invoice"}.png`;

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error(error);
      alert("Unable to save the invoice as an image. Please try again.");
    }
  };

  if (generated) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

        {/* TOP BUTTONS */}

        <div className="mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            ← Home
          </Link>

          <button
            type="button"
            onClick={() => setGenerated(false)}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            Edit Invoice
          </button>

        </div>

        {/* INVOICE */}

        <div
          ref={invoiceRef}
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg"
        >

          {/* HEADER */}

          <div className="border-b border-gray-200 px-6 py-7 sm:px-10">

            <div className="flex flex-col justify-between gap-6 sm:flex-row">

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bizz
                  <span className="text-blue-600">
                    Bill
                  </span>
                </h1>

                <p className="mt-1 text-sm font-medium text-gray-600">
                  Professional Invoice
                </p>
              </div>

              <div className="sm:text-right">

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

          </div>

          {/* CUSTOMER */}

          <div className="grid gap-6 border-b border-gray-200 px-6 py-7 sm:grid-cols-2 sm:px-10">

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Bill To
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                {customerName}
              </p>

              {customerPhone && (
                <p className="mt-1 text-sm text-gray-700">
                  {customerPhone}
                </p>
              )}
            </div>

            <div className="sm:text-right">

              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Payment Status
              </p>

              <p
                className={`mt-2 text-lg font-bold ${
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

          <div className="w-full overflow-hidden px-4 py-6 sm:px-10">


            <table className="w-full table fixed">

             <thead>
  <tr className="border-b border-gray-300">
    <th className="w-[40%] pb-4 text-left font-bold text-gray-800">
      Item
    </th>

    <th className="w-[15%] pb-4 text-center font-bold text-gray-800">
      Qty
    </th>

    <th className="w-[22%] pb-4 text-right font-bold text-gray-800">
      Unit Price
    </th>

    <th className="w-[23%] pb-4 text-right font-bold text-gray-800">
      Amount
    </th>
  </tr>
</thead>


              <tbody>

                {items.map((item, index) => (

                  <tr
                    key={index}
                    className="border-b border-gray-100"
                  >

                    <td className="py-4 font-medium text-gray-900">
                      {item.name || "Item / Service"}
                    </td>

                    <td className="py-4 text-center text-gray-900">
                      {item.quantity}
                    </td>

                    <td className="py-4 text-right text-gray-900">
                      ₦
                      {Number(item.unitPrice).toLocaleString(
                        "en-NG"
                      )}
                    </td>

                    <td className="py-4 text-right font-bold text-gray-900">
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

          {/* TOTALS */}

          <div className="border-t border-gray-200 px-6 py-7 sm:px-10">

            <div className="ml-auto w-full max-w-md space-y-4">

              <div className="flex justify-between text-gray-700">
                <span>Grand Total</span>

                <span className="font-bold text-gray-900">
                  ₦
                  {grandTotal.toLocaleString("en-NG")}
                </span>
              </div>

              {paymentStatus === "Partially Paid" && (
                <>
                  <div className="flex justify-between text-gray-700">
                    <span>Amount Paid</span>

                    <span className="font-bold text-gray-900">
                      ₦
                      {amountPaid.toLocaleString("en-NG")}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <span className="font-bold text-gray-700">
                      Balance Due
                    </span>

                    <span className="font-bold text-red-600">
                      ₦
                      {balanceDue.toLocaleString("en-NG")}
                    </span>
                  </div>
                </>
              )}

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-gray-200 px-6 py-6 text-center sm:px-10">

            <p className="font-semibold text-gray-800">
              Thank you for your business.
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Generated with BizzBill
            </p>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="mx-auto mt-5 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="button"
            onClick={saveAsImage}
            className="rounded-xl bg-blue-600 px-5 py-4 font-bold text-white hover:bg-blue-700"
          >
            🖼 Save Invoice as PNG
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-gray-800 px-5 py-4 font-bold text-white hover:bg-gray-900"
          >
            🖨 Print Invoice
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            ← Home
          </Link>

          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Create Invoice
          </h1>

        </div>

        {/* FORM */}

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Invoice Details
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Customer name
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Customer name"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Customer phone
              </label>

              <input
                type="tel"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(e.target.value)
                }
                placeholder="Customer phone"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Invoice number
              </label>

              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) =>
                  setInvoiceNumber(e.target.value)
                }
                placeholder="Invoice number"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Invoice date
              </label>

              <input
                type="date"
                value={invoiceDate}
                onChange={(e) =>
                  setInvoiceDate(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* ITEMS */}

          <div className="mt-8">

            <div className="mb-4 flex items-center justify-between gap-3">

              <h2 className="text-2xl font-bold text-gray-900">
                Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
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

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
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
                            Number(e.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
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
                            Number(e.target.value)
                          )
                        }
                        placeholder="₦0"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="font-bold text-gray-800">
                      Item total: ₦
                      {itemTotal(item).toLocaleString(
                        "en-NG"
                      )}
                    </p>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="font-bold text-red-600 hover:text-red-700"
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

            <div className="flex justify-between">

              <span className="font-bold text-gray-800">
                Grand Total
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₦
                {grandTotal.toLocaleString("en-NG")}
              </span>

            </div>

          </div>

          {/* PAYMENT */}

          <div className="mt-8">

            <label className="mb-2 block text-sm font-bold text-gray-800">
              Payment status
            </label>

            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value as
                    | "Unpaid"
                    | "Paid"
                    | "Partially Paid"
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
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

          {paymentStatus === "Partially Paid" && (

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-gray-800">
                Amount paid
              </label>

              <input
                type="number"
                min="0"
                max={grandTotal}
                value={amountPaid || ""}
                onChange={(e) =>
                  setAmountPaid(
                    Math.min(
                      Number(e.target.value),
                      grandTotal
                    )
                  )
                }
                placeholder="₦0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none"
              />

              <div className="mt-4 flex justify-between rounded-xl bg-red-50 p-4">

                <span className="font-bold text-gray-700">
                  Balance Due
                </span>

                <span className="font-bold text-red-600">
                  ₦
                  {balanceDue.toLocaleString("en-NG")}
                </span>

              </div>

            </div>

          )}

          {/* GENERATE */}

          <button
            type="button"
            onClick={generateInvoice}
            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-bold text-white shadow-sm hover:bg-blue-700"
          >
            Generate Invoice
          </button>

        </div>

      </div>

    </main>
  );
}

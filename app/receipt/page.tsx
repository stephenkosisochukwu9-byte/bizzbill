"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";

type Item = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export default function ReceiptPage() {
  const receiptRef = useRef<HTMLDivElement>(null);

  const [generated, setGenerated] = useState(false);

  const [businessName, setBusinessName] =
    useState("BizzBill");

  const [customerName, setCustomerName] =
    useState("");

  const [receiptNumber, setReceiptNumber] =
    useState("");

  const [date, setDate] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

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

  const totalAmount = items.reduce(
    (total, item) => total + itemTotal(item),
    0
  );

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

    if (!date) {
      alert("Please select date.");
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
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, {
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
      alert("Unable to save the receipt as an image. Please try again.");
    }
  };

  if (generated) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

        {/* TOP */}

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
            Edit Receipt
          </button>

        </div>

        {/* RECEIPT */}

        <div
          ref={receiptRef}
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg"
        >

          {/* HEADER */}

          <div className="border-b border-gray-200 px-6 py-8 text-center sm:px-10">

            <h1 className="text-3xl font-bold text-gray-900">
              {businessName}
            </h1>

            <p className="mt-2 font-semibold text-blue-600">
              Payment Receipt
            </p>

          </div>

          {/* RECEIPT INFO */}

          <div className="grid gap-6 border-b border-gray-200 px-6 py-7 sm:grid-cols-2 sm:px-10">

            <div>

              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Receipt No
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                {receiptNumber}
              </p>

            </div>

            <div className="sm:text-right">

              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Date
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                {date}
              </p>

            </div>

          </div>

          {/* CUSTOMER */}

          <div className="border-b border-gray-200 px-6 py-7 sm:px-10">

            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Received From
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {customerName}
            </p>

          </div>

          {/* ITEMS */}

          <div className="overflow-x-auto px-6 py-7 sm:px-10">

            <table className="w-full min-w-[600px]">

              <thead>

                <tr className="border-b border-gray-300 text-left">

                  <th className="pb-4 font-bold text-gray-700">
                    Item / Service
                  </th>

                  <th className="pb-4 text-center font-bold text-gray-700">
                    Qty
                  </th>

                  <th className="pb-4 text-right font-bold text-gray-700">
                    Unit Price
                  </th>

                  <th className="pb-4 text-right font-bold text-gray-700">
                    Total
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

          {/* TOTAL */}

          <div className="border-t border-gray-200 px-6 py-7 sm:px-10">

            <div className="ml-auto max-w-md space-y-4">

              <div className="flex justify-between">

                <span className="font-bold text-gray-700">
                  Total Amount
                </span>

                <span className="text-xl font-bold text-gray-900">
                  ₦
                  {totalAmount.toLocaleString("en-NG")}
                </span>

              </div>

              <div className="flex justify-between border-t border-gray-200 pt-4">

                <span className="font-bold text-gray-700">
                  Payment Method
                </span>

                <span className="font-bold text-blue-700">
                  {paymentMethod}
                </span>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-gray-200 px-6 py-7 text-center sm:px-10">

            <p className="font-semibold text-gray-800">
              Thank you for your payment.
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
            🖼 Save Receipt as PNG
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-gray-800 px-5 py-4 font-bold text-white hover:bg-gray-900"
          >
            🖨 Print Receipt
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
            Create Receipt
          </h1>

        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Receipt Details
          </h2>

          {/* BASIC INFO */}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Business name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) =>
                  setBusinessName(e.target.value)
                }
                placeholder="Business name"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

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
                Receipt number
              </label>

              <input
                type="text"
                value={receiptNumber}
                onChange={(e) =>
                  setReceiptNumber(e.target.value)
                }
                placeholder="Receipt number"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
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
                Total Amount
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₦
                {totalAmount.toLocaleString("en-NG")}
              </span>

            </div>

          </div>

          {/* PAYMENT METHOD */}

          <div className="mt-8">

            <label className="mb-2 block text-sm font-bold text-gray-800">
              Payment info
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >

              <option value="Cash">
                Cash
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="POS">
                POS
              </option>

              <option value="Card">
                Card
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* GENERATE */}

          <button
            type="button"
            onClick={generateReceipt}
            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-bold text-white shadow-sm hover:bg-blue-700"
          >
            Generate Receipt
          </button>

        </div>

      </div>

    </main>
  );
}

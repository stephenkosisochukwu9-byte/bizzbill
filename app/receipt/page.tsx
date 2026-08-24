"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

type PaymentStatus =
  | "Unpaid"
  | "Paid"
  | "Partially Paid";

type BusinessProfile = {
  business_name: string | null;
  address: string | null;
  logo_url: string | null;
};

type SavedReceipt = {
  id: string;
  user_id: string;
  document_type: "receipt";
  document_number: string;
  customer_name: string;
  customer_phone: string | null;
  document_date: string;
  items: Item[] | null;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status:
    | PaymentStatus
    | string
    | null;
  payment_method:
    | PaymentMethod
    | string
    | null;
  business_name: string | null;
  business_address: string | null;
  created_at: string;
};

export default function ReceiptPage() {
  const supabase = createClient();

  const receiptRef =
    useRef<HTMLDivElement>(null);

  const [generated, setGenerated] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [loadingReceipt, setLoadingReceipt] =
    useState(false);

  const [savedReceiptId, setSavedReceiptId] =
    useState<string | null>(null);

  /* =========================
     BUSINESS PROFILE
  ========================= */

  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  /* =========================
     RECEIPT DETAILS
  ========================= */

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

  const [items, setItems] =
    useState<Item[]>([
      {
        name: "",
        quantity: "",
        unitPrice: 0,
      },
    ]);

  /* =========================
     GET BUSINESS PROFILE
  ========================= */

  useEffect(() => {
    const getBusinessProfile = async () => {
      try {
        setProfileLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "User fetch error:",
            userError
          );
          return;
        }

        if (!user) {
          console.error(
            "No logged-in user found."
          );
          return;
        }

        const { data, error } =
          await supabase
            .from("business_profiles")
            .select(
              "business_name, address, logo_url"
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(1);

        if (error) {
          console.error(
            "Business profile fetch error:",
            error
          );
          return;
        }

        if (
          data &&
          data.length > 0
        ) {
          setBusinessProfile(
            data[0]
          );
        }
      } catch (error) {
        console.error(
          "Profile fetch error:",
          error
        );
      } finally {
        setProfileLoading(false);
      }
    };

    getBusinessProfile();
  }, [supabase]);

  /* =========================
     FETCH SAVED RECEIPT
  ========================= */

  useEffect(() => {
    const fetchSavedReceipt =
      async () => {
        try {
          const params =
            new URLSearchParams(
              window.location.search
            );

          const receiptId =
            params.get("id");

          if (!receiptId) {
            return;
          }

          setLoadingReceipt(true);

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            console.error(
              "User fetch error:",
              userError
            );
            return;
          }

          if (!user) {
            alert(
              "You must be logged in to view this receipt."
            );
            return;
          }

          const {
            data,
            error,
          } = await supabase
            .from("documents")
            .select("*")
            .eq("id", receiptId)
            .eq("user_id", user.id)
            .eq("document_type", "receipt")
            .maybeSingle();

          if (error) {
            console.error(
              "Receipt fetch error:",
              error
            );

            alert(
              "Unable to load this receipt."
            );

            return;
          }

          if (!data) {
            alert(
              "Receipt not found."
            );

            return;
          }

          const saved =
            data as SavedReceipt;

          /* =========================
             LOAD SAVED DATA
          ========================= */

          setSavedReceiptId(
            saved.id
          );

          setReceiptNumber(
            saved.document_number ||
              ""
          );

          setCustomerName(
            saved.customer_name ||
              ""
          );

          setReceiptDate(
            saved.document_date ||
              ""
          );

          const savedPaymentMethod =
            saved.payment_method;

          if (
            savedPaymentMethod ===
              "Cash" ||
            savedPaymentMethod ===
              "Bank Transfer" ||
            savedPaymentMethod ===
              "Card" ||
            savedPaymentMethod ===
              "Other"
          ) {
            setPaymentMethod(
              savedPaymentMethod
            );
          } else {
            setPaymentMethod(
              "Other"
            );
          }

          setAmountPaid(
            Number(
              saved.amount_paid ||
                0
            )
          );

          /* =========================
             LOAD ITEMS
          ========================= */

          if (
            Array.isArray(
              saved.items
            ) &&
            saved.items.length >
              0
          ) {
            setItems(
              saved.items.map(
                (item) => ({
                  name:
                    item?.name ||
                    "",

                  quantity:
                    item?.quantity ===
                      "" ||
                    item?.quantity ===
                      null ||
                    item?.quantity ===
                      undefined
                      ? ""
                      : Number(
                          item.quantity
                        ),

                  unitPrice:
                    Number(
                      item?.unitPrice ||
                        0
                    ),
                })
              )
            );
          } else {
            setItems([
              {
                name: "",
                quantity: "",
                unitPrice: 0,
              },
            ]);
          }

          /* =========================
             KEEP CURRENT LOGO
          ========================= */

          if (
            saved.business_name ||
            saved.business_address
          ) {
            setBusinessProfile(
              (current) => ({
                business_name:
                  saved.business_name ||
                  current?.business_name ||
                  null,

                address:
                  saved.business_address ||
                  current?.address ||
                  null,

                logo_url:
                  current?.logo_url ||
                  null,
              })
            );
          }

          /* =========================
             SHOW RECEIPT
          ========================= */

          setGenerated(true);

          setTimeout(() => {
            window.scrollTo({
              top: 0,
              behavior:
                "smooth",
            });
          }, 100);
        } catch (error) {
          console.error(
            "Saved receipt loading error:",
            error
          );

          alert(
            "Something went wrong while loading the receipt."
          );
        } finally {
          setLoadingReceipt(false);
        }
      };

    fetchSavedReceipt();
  }, [supabase]);

  /* =========================
     ITEM TOTAL
  ========================= */

  const itemTotal = (
    item: Item
  ) => {
    return (
      Number(item.quantity || 0) *
      Number(item.unitPrice || 0)
    );
  };

  /* =========================
     GRAND TOTAL
  ========================= */

  const grandTotal =
    items.reduce(
      (total, item) =>
        total + itemTotal(item),
      0
    );

  /* =========================
     PAYMENT STATUS
  ========================= */

  const paymentStatus: PaymentStatus =
    amountPaid >= grandTotal &&
    grandTotal > 0
      ? "Paid"
      : amountPaid > 0
      ? "Partially Paid"
      : "Unpaid";

  /* =========================
     BALANCE DUE
  ========================= */

  const balanceDue =
    Math.max(
      grandTotal -
        amountPaid,
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
      current.map(
        (item, i) =>
          i === index
            ? {
                ...item,
                [field]:
                  value,
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

  const removeItem = (
    index: number
  ) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =========================
     GENERATE + SAVE RECEIPT
  ========================= */

  const generateReceipt =
    async () => {
      if (saving) {
        return;
      }

      /* =========================
         VALIDATION
      ========================= */

      if (
        !businessProfile?.business_name?.trim()
      ) {
        alert(
          "Please complete your business profile first."
        );
        return;
      }

      if (!customerName.trim()) {
        alert(
          "Please enter customer name."
        );
        return;
      }

      if (!receiptDate) {
        alert(
          "Please select receipt date."
        );
        return;
      }

      if (
        items.some(
          (item) =>
            !item.name.trim()
        )
      ) {
        alert(
          "Please enter a name for every item."
        );
        return;
      }

      if (
        items.some(
          (item) =>
            item.quantity === "" ||
            Number(item.quantity) <=
              0
        )
      ) {
        alert(
          "Please enter a valid quantity for every item."
        );
        return;
      }

      if (
        items.some(
          (item) =>
            Number(
              item.unitPrice
            ) < 0
        )
      ) {
        alert(
          "Please enter a valid unit price for every item."
        );
        return;
      }

      if (grandTotal <= 0) {
        alert(
          "Receipt total must be greater than ₦0."
        );
        return;
      }

      try {
        setSaving(true);

        /* =========================
           GET CURRENT USER
        ========================= */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "User fetch error:",
            userError
          );

          alert(
            "Unable to verify your account. Please try again."
          );

          return;
        }

        if (!user) {
          alert(
            "You must be logged in to generate a receipt."
          );

          return;
        }

        /* =========================
           RECEIPT NUMBER
        ========================= */

        let finalReceiptNumber =
          receiptNumber;

        if (!finalReceiptNumber) {
          const {
            data:
              generatedNumber,
            error:
              numberError,
          } = await supabase.rpc(
            "get_next_receipt_number"
          );

          if (numberError) {
            console.error(
              "Receipt number generation error:",
              numberError
            );

            alert(
              "Unable to generate receipt number. Please try again."
            );

            return;
          }

          if (!generatedNumber) {
            alert(
              "Unable to generate receipt number. Please try again."
            );

            return;
          }

          finalReceiptNumber =
            String(
              generatedNumber
            );

          setReceiptNumber(
            finalReceiptNumber
          );
        }

        /* =========================
           RECEIPT DATA
        ========================= */

        const receiptData = {
          user_id: user.id,

          document_type:
            "receipt",

          document_number:
            finalReceiptNumber,

          customer_name:
            customerName.trim(),

          customer_phone:
            null,

          document_date:
            receiptDate,

          items: items,

          total_amount:
            grandTotal,

          amount_paid:
            amountPaid,

          balance_due:
            balanceDue,

          payment_status:
            paymentStatus,

          payment_method:
            paymentMethod,

          business_name:
            businessProfile.business_name,

          business_address:
            businessProfile.address,
        };

        /* =========================
           UPDATE EXISTING
        ========================= */

        if (savedReceiptId) {
          const {
            error:
              updateError,
          } = await supabase
            .from("documents")
            .update(
              receiptData
            )
            .eq(
              "id",
              savedReceiptId
            )
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "document_type",
              "receipt"
            );

          if (updateError) {
            console.error(
              "Receipt update error:",
              updateError
            );

            alert(
              "Unable to update receipt. Please try again."
            );

            return;
          }
        } else {
          /* =========================
             INSERT NEW
          ========================= */

          const {
            data:
              insertedReceipt,
            error:
              insertError,
          } = await supabase
            .from("documents")
            .insert(
              receiptData
            )
            .select("id")
            .single();

          if (insertError) {
            console.error(
              "Receipt save error:",
              insertError
            );

            alert(
              "Unable to save receipt. Please try again."
            );

            return;
          }

          if (
            insertedReceipt?.id
          ) {
            setSavedReceiptId(
              insertedReceipt.id
            );
          }
        }

        /* =========================
           SHOW RECEIPT
        ========================= */

        setGenerated(true);

        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior:
              "smooth",
          });
        }, 100);
      } catch (error) {
        console.error(
          "Receipt generation error:",
          error
        );

        alert(
          "Something went wrong while generating the receipt."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================
     SAVE RECEIPT AS PNG
  ========================= */

  const saveAsImage =
    async () => {
      if (!receiptRef.current) {
        return;
      }

      const element =
        receiptRef.current;

      const originalWidth =
        element.style.width;

      const originalMaxWidth =
        element.style.maxWidth;

      const originalMinWidth =
        element.style.minWidth;

      try {
        element.style.width =
          "720px";

        element.style.maxWidth =
          "720px";

        element.style.minWidth =
          "720px";

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              100
            )
        );

        const dataUrl =
          await toPng(element, {
            width: 720,
            height:
              element.scrollHeight,
            pixelRatio: 2,
            quality: 1,
            backgroundColor:
              "#ffffff",
            cacheBust: true,
          });

        const link =
          document.createElement(
            "a"
          );

        link.download = `Receipt-${
          receiptNumber ||
          "receipt"
        }.png`;

        link.href = dataUrl;

        link.click();
      } catch (error) {
        console.error(error);

        alert(
          "Unable to save the receipt as an image. Please try again."
        );
      } finally {
        element.style.width =
          originalWidth;

        element.style.maxWidth =
          originalMaxWidth;

        element.style.minWidth =
          originalMinWidth;
      }
    };

  /* =========================
     LOADING
  ========================= */

  if (loadingReceipt) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-8">

        <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center text-center">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />

          <h1 className="mt-5 text-lg font-extrabold text-gray-950">
            Loading receipt...
          </h1>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            Fetching your saved receipt.
          </p>

        </div>

      </main>
    );
  }

  /* =========================
     GENERATED RECEIPT
  ========================= */

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

          {/* TOP BUTTONS */}

          <div className="no-print mx-auto mb-5 flex w-full max-w-4xl items-center justify-between gap-3">

            <Link
              href="/documents"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-950 shadow-sm transition hover:bg-gray-50"
            >
              ← Documents
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

          {/* RECEIPT */}

          <div
            ref={receiptRef}
            data-print-receipt
            className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white text-gray-950 shadow-lg"
          >

            {/* HEADER */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                {/* BUSINESS */}

                <div className="min-w-0">

                  <div className="flex items-start gap-4">

                    {businessProfile?.logo_url && (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white sm:h-24 sm:w-24">

                        <img
                          src={
                            businessProfile.logo_url
                          }
                          alt={`${businessProfile.business_name || "Business"} logo`}
                          className="h-full w-full object-contain p-2"
                        />

                      </div>
                    )}

                    <div className="min-w-0">

                      <h1 className="break-words text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                        {businessProfile?.business_name ||
                          "BizzBill"}
                      </h1>

                      {businessProfile?.address && (
                        <p className="mt-2 max-w-md whitespace-pre-line break-words text-sm font-semibold leading-6 text-gray-800 sm:text-base">
                          {
                            businessProfile.address
                          }
                        </p>
                      )}

                      <p className="mt-2 text-sm font-semibold text-gray-800 sm:text-base">
                        Payment Receipt
                      </p>

                    </div>

                  </div>

                </div>

                {/* RECEIPT DETAILS */}

                <div className="sm:text-right">

                  <h2 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
                    RECEIPT
                  </h2>

                  <div className="mt-3 space-y-1.5 text-sm text-gray-800 sm:text-base">

                    <p>
                      Receipt No:{" "}
                      <span className="font-extrabold text-gray-950">
                        {
                          receiptNumber
                        }
                      </span>
                    </p>

                    <p>
                      Date:{" "}
                      <span className="font-extrabold text-gray-950">
                        {
                          receiptDate
                        }
                      </span>
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* CUSTOMER + PAYMENT */}

            <div className="grid grid-cols-1 gap-7 border-b border-gray-200 px-5 py-7 sm:grid-cols-2 sm:px-10 sm:py-9">

              <div>

                <p className="text-xs font-extrabold uppercase tracking-wide text-gray-700 sm:text-sm">
                  Received From
                </p>

                <p className="mt-2 break-words text-xl font-extrabold text-gray-950 sm:text-2xl">
                  {
                    customerName
                  }
                </p>

              </div>

              <div className="sm:text-right">

                <p className="text-xs font-extrabold uppercase tracking-wide text-gray-700 sm:text-sm">
                  Payment Method
                </p>

                <p className="mt-2 text-xl font-extrabold text-blue-700 sm:text-2xl">
                  {
                    paymentMethod
                  }
                </p>

              </div>

            </div>

            {/* ITEMS */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

              <div className="w-full overflow-hidden">

                <table className="w-full table-fixed border-collapse">

                  <thead>

                    <tr className="border-b-2 border-gray-300">

                      <th className="w-[38%] pb-4 pr-2 text-left text-xs font-extrabold text-gray-900 sm:text-sm">
                        Item / Service
                      </th>

                      <th className="w-[13%] pb-4 text-center text-xs font-extrabold text-gray-900 sm:text-sm">
                        Qty
                      </th>

                      <th className="w-[25%] pb-4 text-right text-xs font-extrabold text-gray-900 sm:text-sm">
                        Unit Price
                      </th>

                      <th className="w-[24%] pb-4 text-right text-xs font-extrabold text-gray-900 sm:text-sm">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {items.map(
                      (
                        item,
                        index
                      ) => (

                        <tr
                          key={
                            index
                          }
                          className="border-b border-gray-100"
                        >

                          <td className="break-words py-5 pr-2 text-left text-sm font-bold text-gray-950 sm:text-base">
                            {
                              item.name
                            }
                          </td>

                          <td className="py-5 text-center text-sm font-bold text-gray-950 sm:text-base">
                            {
                              item.quantity
                            }
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

            {/* TOTALS */}

            <div className="border-b border-gray-200 px-5 py-7 sm:px-10 sm:py-9">

              <div className="ml-auto w-full max-w-md space-y-5">

                <div className="flex items-center justify-between gap-5">

                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    Total Amount
                  </span>

                  <span className="whitespace-nowrap text-lg font-extrabold text-gray-950 sm:text-xl">
                    ₦
                    {grandTotal.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-5">

                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    Amount Paid
                  </span>

                  <span className="whitespace-nowrap text-lg font-extrabold text-gray-950 sm:text-xl">
                    ₦
                    {amountPaid.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-5 border-t border-gray-200 pt-5">

                  <span className="text-base font-extrabold text-gray-900 sm:text-lg">
                    Balance Due
                  </span>

                  <span className="whitespace-nowrap text-lg font-extrabold text-red-600 sm:text-xl">
                    ₦
                    {balanceDue.toLocaleString(
                      "en-NG"
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-5">

                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    Payment Status
                  </span>

                  <span
                    className={`text-base font-extrabold sm:text-lg ${
                      paymentStatus ===
                      "Paid"
                        ? "text-green-600"
                        : paymentStatus ===
                          "Partially Paid"
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {
                      paymentStatus
                    }
                  </span>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="px-5 py-7 text-center sm:px-10 sm:py-9">

              <p className="text-base font-extrabold text-gray-950 sm:text-lg">
                Thank you for your patronage.
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-700">
                Generated with BizzBill
              </p>

            </div>

          </div>

          {/* ACTION BUTTONS */}

          <div className="no-print mx-auto mt-5 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={
                saveAsImage
              }
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

  /* =========================
     RECEIPT FORM
  ========================= */

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto w-full max-w-5xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between gap-3">

          <Link
            href={
              savedReceiptId
                ? "/documents"
                : "/"
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-950 shadow-sm transition hover:bg-gray-50"
          >
            ←{" "}
            {savedReceiptId
              ? "Documents"
              : "Home"}
          </Link>

          <h1 className="text-xl font-extrabold text-gray-950 sm:text-2xl">
            {savedReceiptId
              ? "Edit Receipt"
              : "Create Receipt"}
          </h1>

        </div>

        {/* FORM */}

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">

          {/* BUSINESS PROFILE */}

          <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <p className="text-xs font-extrabold uppercase tracking-wide text-blue-800">
              Receipt From
            </p>

            {profileLoading ? (

              <p className="mt-2 text-sm font-semibold text-gray-700">
                Loading business information...
              </p>

            ) : businessProfile ? (

              <div className="mt-2">

                <div className="flex items-center gap-4">

                  {businessProfile.logo_url && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">

                      <img
                        src={
                          businessProfile.logo_url
                        }
                        alt="Business logo"
                        className="h-full w-full object-contain p-2"
                      />

                    </div>
                  )}

                  <div>

                    <p className="text-xl font-extrabold text-gray-950">
                      {
                        businessProfile.business_name ||
                        "Business name not set"
                      }
                    </p>

                    {businessProfile.address && (
                      <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-gray-800">
                        {
                          businessProfile.address
                        }
                      </p>
                    )}

                  </div>

                </div>

                <p className="mt-3 text-xs font-semibold text-blue-800">
                  This information will automatically appear on your receipt.
                </p>

              </div>

            ) : (

              <div className="mt-2">

                <p className="text-sm font-bold text-red-600">
                  No business profile found.
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  Please complete your business profile before creating receipts.
                </p>

              </div>

            )}

          </div>

          <h2 className="mb-6 text-2xl font-extrabold text-gray-950">
            Receipt Details
          </h2>

          {/* BASIC DETAILS */}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-950">
                Customer name
              </label>

              <input
                type="text"
                value={
                  customerName
                }
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                placeholder="Customer name"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-950">
                Date
              </label>

              <input
                type="date"
                value={
                  receiptDate
                }
                onChange={(e) =>
                  setReceiptDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base font-semibold text-gray-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-extrabold text-gray-950">
                Payment method
              </label>

              <select
                value={
                  paymentMethod
                }
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

          </div>

          {/* ITEMS */}

          <div className="mt-8">

            <div className="mb-4 flex items-center justify-between gap-3">

              <h2 className="text-2xl font-extrabold text-gray-950">
                Items
              </h2>

            </div>

            <div className="space-y-4">

              {items.map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={
                      index
                    }
                    className="rounded-2xl border border-gray-300 bg-gray-50 p-4"
                  >

                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-gray-900">
                        Item / Service
                      </label>

                      <input
                        type="text"
                        value={
                          item.name
                        }
                        onChange={(e) =>
                          updateItem(
                            index,
                            "name",
                            e.target
                              .value
                          )
                        }
                        placeholder="Item / Service"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-extrabold text-gray-900">
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
                              e.target
                                .value;

                            updateItem(
                              index,
                              "quantity",
                              value ===
                                ""
                                ? ""
                                : Number(
                                    value
                                  )
                            );

                          }}
                          placeholder="Quantity"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-extrabold text-gray-900">
                          Unit price
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            item.unitPrice ||
                            ""
                          }
                          onChange={(e) => {

                            const value =
                              e.target
                                .value;

                            updateItem(
                              index,
                              "unitPrice",
                              value ===
                                ""
                                ? 0
                                : Math.max(
                                    Number(
                                      value
                                    ),
                                    0
                                  )
                            );

                          }}
                          placeholder="₦0"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base font-semibold text-gray-950 placeholder:text-gray-700 focus:border-blue-600 focus:outline-none"
                        />

                      </div>

                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">

                      <p className="text-sm font-extrabold text-gray-950 sm:text-base">
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
              <div className="mt-5 flex justify-end">
  <button
    type="button"
    onClick={addItem}
    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
  >
    + Add Item
  </button>
</div>


            </div>

          </div>

          {/* TOTAL */}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

            <div className="flex items-center justify-between gap-5">

              <span className="text-base font-extrabold text-gray-950">
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

          {/* AMOUNT PAID */}

          <div className="mt-8">

            <label className="mb-2 block text-sm font-extrabold text-gray-950">
              Amount paid
            </label>

            <input
              type="number"
              min="0"
              max={
                grandTotal
              }
              value={
                amountPaid ||
                ""
              }
              onChange={(e) => {

                const value =
                  e.target.value;

                if (value === "") {
                  setAmountPaid(
                    0
                  );
                  return;
                }

                setAmountPaid(
                  Math.min(
                    Math.max(
                      Number(
                        value
                      ),
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

          {/* BALANCE */}

          <div className="mt-4 flex items-center justify-between gap-5 rounded-xl bg-red-50 p-4">

            <span className="font-extrabold text-gray-900">
              Balance Due
            </span>

            <span className="whitespace-nowrap font-extrabold text-red-600">
              ₦
              {balanceDue.toLocaleString(
                "en-NG"
              )}
            </span>

          </div>

          {/* PAYMENT STATUS */}

          <div className="mt-4 flex items-center justify-between gap-5 rounded-xl bg-gray-50 p-4">

            <span className="font-extrabold text-gray-900">
              Payment Status
            </span>

            <span
              className={`font-extrabold ${
                paymentStatus ===
                "Paid"
                  ? "text-green-600"
                  : paymentStatus ===
                    "Partially Paid"
                  ? "text-orange-600"
                  : "text-red-600"
              }`}
            >
              {
                paymentStatus
              }
            </span>

          </div>

          {/* GENERATE */}

          <button
            type="button"
            onClick={
              generateReceipt
            }
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? savedReceiptId
                ? "Updating Receipt..."
                : "Saving Receipt..."
              : savedReceiptId
              ? "Update Receipt"
              : "Generate Receipt"}
          </button>

        </div>

      </div>

    </main>
  );
}

import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Bizz<span className="text-blue-600">Bill</span>
          </h1>

         <Link
  href="/signup"
  aria-label="Sign Up"
  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
    />
  </svg>
</Link>




        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Create invoices and receipts
          <span className="block text-blue-600">
            in seconds
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Create professional invoices and receipts for your business,
          download them as PDF, and share them easily.
        </p>

        {/* Options */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">

          {/* Invoice */}
          <Link
  href="/invoice"
  className="block rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🧾
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              Create Invoice
            </h3>

            <p className="mt-2 text-gray-600">
              Create a professional invoice for your customers.
            </p>

            <div className="mt-6 font-semibold text-blue-600">
              Create Invoice →
            </div>
          </Link>

          {/* Receipt */}
          <Link
  href="/receipt"
  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
>
  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
    🧾
  </div>

  <h2 className="text-xl font-bold text-gray-900">
    Create Receipt
  </h2>

  <p className="mt-2 text-sm leading-6 text-gray-500">
    Generate a simple and professional payment receipt.
  </p>

  <div className="mt-5 font-semibold text-green-600">
    Create Receipt →
  </div>
</Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        Simple tools for your business.
      </footer>

    </main>
  );
}
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <p className="font-serif text-3xl">Page not found</p>
      <p className="mt-2 text-sm text-muted">That address doesn’t exist in Quill.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        Back to invoices
      </Link>
    </div>
  );
}

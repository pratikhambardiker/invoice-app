import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/components/StoreProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "Quill — simple invoices",
  description:
    "A personal invoicing app for freelancers. Create, preview, and print invoices. Data stays in your browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}

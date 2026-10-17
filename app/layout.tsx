import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif } from "next/font/google";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCurrentUser, isStaff } from "@/lib/auth";
import "./globals.css";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Atelier Maldives — Run Club & Running Apparel", template: "%s · Atelier Maldives" },
  description:
    "Technical running apparel made for heat, salt and long horizons. Join the virtual Atelier Maldives Run Club and train with an AI coach.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <CartProvider>
          <Header user={user && { firstName: user.name.split(" ")[0], staff: isStaff(user) }} />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

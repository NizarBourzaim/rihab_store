import "./globals.css";
import Navbar from "../components/Navbar";
import { CartProvider } from "../context/CartContext";

import { LanguageProvider } from "../context/LanguageContext";

export const metadata = {
  title: "Rinifaza Store | Luxurious Islamic Fashion",
  description:
    "Discover elegant, limited capsule collections designed for modest luxury.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <LanguageProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
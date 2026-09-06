import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

// Rounded, bold, friendly — matches the Lattice reference design.
const balooDisplay = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunitoSans = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Reskilling Copilot",
  description: "Swipe to explore roles, build a skills roadmap, and see what it unlocks.",
  appleWebApp: {
    title: "Lattice",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#7684c0",
  // Lets the page draw under the notch/home-indicator so env(safe-area-inset-*)
  // reports real values instead of always 0 — needed for the sticky bottom nav
  // once this is installed as a PWA on a notched device.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${balooDisplay.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

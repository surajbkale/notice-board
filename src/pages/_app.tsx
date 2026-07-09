import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.variable} style={{ minHeight: "100vh" }}>
      <Component {...pageProps} />
    </div>
  );
}

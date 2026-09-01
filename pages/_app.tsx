import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import "../styles/globals.css";
import { AuthProvider } from "../context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

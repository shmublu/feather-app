import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          integrity="sha384-V7Ieh9e+1LN6qY1jOKmS8EZAaSkI3nsCML8c82usFptdRfqpXT3w8zRyg9em8LUw"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-DiU8DCv4P+N2DIUYLaHRLF2mNEaFIAAOqh+apMI2vlA38nSxrdbidKfnUSsfxnob"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

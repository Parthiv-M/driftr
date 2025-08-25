import "./globals.css";

import { ApolloWrapper } from "@components/ApolloWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@geoapify/geocoder-autocomplete@2.0.1/styles/minimal.css"
        />
      </head>
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
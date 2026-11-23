import "./globals.css";
export const metadata = {
  title: "Rane (Madras) | Materials Management Decision Intelligence",
  description: "Enterprise decision support for materials, supply-chain resilience and procurement planning."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}

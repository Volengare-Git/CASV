// Root layout — minimal pass-through. The [locale] layout owns html + body.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

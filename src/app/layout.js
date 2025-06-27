import 'bootstrap/dist/css/bootstrap.min.css';

export const metadata = {
  title: 'Anteprima Libri',
  description: 'Cerca libri e fumetti con anteprima disponibile',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head />
      <body>{children}</body>
    </html>
  );
}

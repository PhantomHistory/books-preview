"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import BookCard from "../components/BookCard";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";

export default function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Funzione di ricerca (iniziale)
  const searchBooks = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Inserisci una parola chiave per la ricerca");
      return;
    }

    setBooks([]);
    setStartIndex(0);
    setError("");
    fetchBooks(true);
  };

  // Funzione fetch (iniziale o successiva) - wrapped in useCallback
  const fetchBooks = useCallback(
    async (initial = false) => {
      if (!query.trim()) return;
      if (!initial && loading) return;

      setLoading(true);
      const index = initial ? 0 : startIndex;

      try {
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query
          )}&startIndex=${index}&maxResults=20`
        );

        const items = res.data.items || [];

        // Filtra solo i libri con preview disponibile
        const filtered = items.filter(
          (book) =>
            book.volumeInfo?.previewLink &&
            ["PARTIAL", "ALL_PAGES"].includes(book.accessInfo?.viewability)
        );

        if (initial) {
          setBooks(filtered);
          setStartIndex(20);
        } else {
          setBooks((prev) => [...prev, ...filtered]);
          setStartIndex((prev) => prev + 20);
        }

        setHasMore(items.length === 20); // Google Books restituisce sempre max 20 per chiamata
        setError("");
      } catch (err) {
        console.error("Errore durante la ricerca:", err);
        setError("Errore durante la ricerca. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    },
    [query, loading, startIndex]
  );

  // Scroll listener per infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        hasMore &&
        !loading &&
        books.length > 0
      ) {
        fetchBooks(); // carica la prossima pagina
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, books.length, fetchBooks]);

  return (
    <>
      {/* Navbar con barra di ricerca */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container fluid>
          <Navbar.Brand href="/" className="me-2">
            📚 Home
          </Navbar.Brand>

          {/* Mobile: Form sotto il brand */}
          <div className="d-lg-none w-100 mt-2">
            <Form onSubmit={searchBooks}>
              <div className="d-flex gap-2">
                <Form.Control
                  type="search"
                  placeholder="Cerca libri..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size="sm"
                />
                <Button
                  type="submit"
                  variant="outline-light"
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Cerca"
                  )}
                </Button>
              </div>
            </Form>
          </div>

          {/* Desktop: Form inline */}
          <Form className="d-none d-lg-flex ms-auto" onSubmit={searchBooks}>
            <Form.Control
              type="search"
              placeholder="Cerca libri o fumetti..."
              className="me-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ minWidth: "300px" }}
            />
            <Button type="submit" variant="outline-light" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Cerca"}
            </Button>
          </Form>
        </Container>
      </Navbar>

      {/* Suggerimenti per la ricerca */}
      {!books.length && !loading && !error && (
        <Container fluid className="px-3">
          <div className="text-center mb-4">
            <h5 className="mb-3">💡 Suggerimenti per la ricerca:</h5>
            <div className="row justify-content-center">
              <div className="col-12 col-md-10 col-lg-8">
                <div className="d-flex flex-column gap-2 text-start">
                  <div className="p-2 bg-light rounded">
                    <strong>Titolo:</strong>{" "}
                    <small>&quot;Harry Potter e la pietra filosofale&quot;</small>
                  </div>
                  <div className="p-2 bg-light rounded">
                    <strong>Autore:</strong>{" "}
                    <small>&quot;Stephen King&quot;</small>
                  </div>
                  <div className="p-2 bg-light rounded">
                    <strong>Genere:</strong>{" "}
                    <small>&quot;fantasy&quot;, &quot;thriller&quot;, &quot;fumetti&quot;</small>
                  </div>
                  <div className="p-2 bg-light rounded">
                    <strong>Termini generici:</strong>{" "}
                    <small>&quot;programmazione&quot;, &quot;storia&quot;, &quot;cucina&quot;</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      )}

      {/* Risultati */}
      <Container fluid className="px-3">
        {error && (
          <div className="alert alert-danger" role="alert">
            ⚠️ {error}
          </div>
        )}

        <Row className="g-3">
          {books.map((book, index) => (
            <Col
              key={`${book.id}-${index}`}
              xs={12}
              sm={12}
              md={12}
              lg={6}
              xl={6}
              className="d-flex"
            >
              <div className="w-100">
                <BookCard book={book} />
              </div>
            </Col>
          ))}
        </Row>

        {loading && (
          <div className="text-center mt-4 mb-4">
            <Spinner animation="grow" variant="primary" className="me-2" />
            <span className="d-none d-sm-inline">Caricamento libri...</span>
            <span className="d-sm-none">Caricamento...</span>
          </div>
        )}

        {!loading && hasMore && books.length > 0 && (
          <div className="text-center mt-4 mb-4">
            <small className="text-muted">
              📜{" "}
              <span className="d-none d-sm-inline">
                Scorri verso il basso per caricare altri libri
              </span>
              <span className="d-sm-none">Scorri per altri libri</span>
            </small>
          </div>
        )}

        {!hasMore && books.length > 0 && (
          <div className="text-center mt-4 mb-4">
            <small className="text-muted">
              ✅{" "}
              <span className="d-none d-sm-inline">
                Hai visto tutti i risultati disponibili
              </span>
              <span className="d-sm-none">Fine risultati</span>
            </small>
          </div>
        )}
      </Container>
    </>
  );
}
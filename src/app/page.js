// src/app/page.js
"use client"; // Indispensabile per usare useState, useEffect, e i tuoi altri hook

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import BookCard from "../components/BookCard";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup"; // Importa ListGroup
import NavbarCustom from "@/components/NavbarCustom";

const LOCAL_STORAGE_KEY = "searchHistory"; // Chiave per il localStorage
const MAX_HISTORY_ITEMS = 10; // Limite delle stringhe nella cronologia

export default function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]); // Nuovo stato per la cronologia

  // --- LOGICA PER LA CRONOLOGIA DI RICERCA ---
  // Carica la cronologia dal localStorage all'avvio del componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedHistory) {
        try {
          setSearchHistory(JSON.parse(storedHistory));
        } catch (e) {
          console.error(
            "Errore nel parsing della cronologia da localStorage:",
            e
          );
          localStorage.removeItem(LOCAL_STORAGE_KEY); // Pulisci dati corrotti
        }
      }
    }
  }, []); // Esegui solo al mount del componente

  // Funzione per aggiungere una ricerca alla cronologia
  const addSearchToHistory = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return;

    setSearchHistory((prevHistory) => {
      // Filtra la query esistente per evitare duplicati e la rende la più recente
      const newHistory = prevHistory.filter(
        (item) => item.toLowerCase() !== searchQuery.toLowerCase()
      );
      // Aggiungi la nuova query all'inizio e limita la dimensione
      const updatedHistory = [searchQuery, ...newHistory].slice(
        0,
        MAX_HISTORY_ITEMS
      );

      // Salva nel localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
      }
      return updatedHistory;
    });
  }, []); // Nessuna dipendenza, in quanto prevHistory è gestito dalla callback

  // Funzione di ricerca iniziale (gestita dal submit del form)
  const handleInitialSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Inserisci una parola chiave per la ricerca.");
      return;
    }

    setBooks([]); // Resetta i libri
    setStartIndex(0); // Resetta l'indice di partenza
    setHasMore(true); // Assumiamo ci siano più risultati inizialmente
    setError(""); // Pulisci errori precedenti
    fetchBooks(true, query); // Avvia la ricerca iniziale con la query corrente
  };

  // Funzione fetch (iniziale o successiva) - wrapped in useCallback
  const fetchBooks = useCallback(
    async (initial = false, currentQuery = query) => {
      // Aggiunto currentQuery come parametro
      if (!currentQuery.trim()) return; // Usa currentQuery
      if (!initial && loading) return;

      setLoading(true);
      const index = initial ? 0 : startIndex;

      try {
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            currentQuery // Usa currentQuery qui
          )}&startIndex=${index}&maxResults=20`
        );

        const items = res.data.items || [];

        console.log(
          `API ha restituito ${items.length} risultati per startIndex=${index}`
        );

        // Filtra solo i libri con preview disponibile e viewability
        const filtered = items.filter(
          (book) =>
            book.volumeInfo?.previewLink &&
            ["PARTIAL", "ALL_PAGES"].includes(book.accessInfo?.viewability)
        );

        console.log(`Dopo il filtro: ${filtered.length} risultati visibili`);

        if (initial) {
          setBooks(filtered);
          setStartIndex(20);
        } else {
          setBooks((prev) => [...prev, ...filtered]);
          setStartIndex((prev) => prev + 20);
        }

        setHasMore(items.length === 20); // Continua a caricare se abbiamo riempito la pagina
        setError(""); // Pulisci errori dopo il successo

        // Aggiungi la ricerca alla cronologia SOLO SE è una ricerca iniziale e ha risultati
        if (initial && filtered.length > 0) {
          addSearchToHistory(currentQuery); // Usa currentQuery
        }
      } catch (err) {
        console.error("Errore durante la ricerca:", err);
        setError("Errore durante la ricerca. Riprova più tardi.");
        setHasMore(false); // Blocca ulteriori caricamenti se c'è un errore
      } finally {
        setLoading(false);
      }
    },
    [query, loading, startIndex, addSearchToHistory] // Aggiungi addSearchToHistory come dipendenza
  );

  // Scroll listener per infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 && // 500px prima della fine della pagina
        hasMore &&
        !loading &&
        books.length > 0 // Assicurati che ci siano libri già caricati
      ) {
        fetchBooks(false); // carica la prossima pagina
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, books.length, fetchBooks]);

  // --- Funzione per gestire il click su un elemento della cronologia ---
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem); // Imposta la barra di ricerca con il termine cliccato
    // Esegui una nuova ricerca iniziale con il termine della cronologia
    setBooks([]);
    setStartIndex(0);
    setHasMore(true);
    setError("");
    fetchBooks(true, historyItem); // Passa la query direttamente
  };

  return (
    <>
      <NavbarCustom
        query={query}
        setQuery={setQuery}
        loading={loading}
        handleSearch={handleInitialSearch}
      />

      <Container fluid className="px-3">
        {/* Visualizzazione della cronologia di ricerca o messaggio iniziale */}
        {!books.length && !loading && !error && (
          <div className="text-center mb-4">
            <h5 className="mb-3">📜 Storico delle ricerche:</h5>
            <div className="row justify-content-center">
              <div className="col-12 col-md-10 col-lg-8">
                <ListGroup>
                  {searchHistory.map((item, index) => (
                    <ListGroup.Item
                      key={index}
                      action
                      onClick={() => handleHistoryClick(item)}
                      className="text-start"
                    >
                      {item}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          </div>
        )}

        {/* Messaggi di stato (Caricamento, Errore, Nessun Risultato) */}
        {error && (
          <div className="alert alert-danger my-4" role="alert">
            ⚠️ {error}
          </div>
        )}

        {loading &&
          books.length === 0 && ( // Mostra spinner solo se nessun libro è ancora caricato
            <div className="text-center my-5">
              <Spinner animation="grow" className="me-2" />
              <span className="d-none d-sm-inline">Caricamento libri...</span>
              <span className="d-sm-none">Caricamento...</span>
            </div>
          )}

        {/* Griglia dei risultati della ricerca */}
        <Row className="g-3">
          {books.map((book, index) => (
            <Col
              key={`${book.id}-${index}`} // Chiave combinata per maggiore unicità
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={3}
              className="d-flex"
            >
              <div className="w-100">
                <BookCard book={book} />
              </div>
            </Col>
          ))}
        </Row>

        {/* Messaggio "Scorri per caricare altri" */}
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

        {/* Messaggio "Fine risultati" */}
        {!loading && !hasMore && books.length > 0 && (
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

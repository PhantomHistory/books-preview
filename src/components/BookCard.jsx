"use client";
import { useState } from "react";
import Link from "next/link"; // Considera se hai bisogno di questo import se il Link è commentato
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function BookCard({ book }) {
  const info = book.volumeInfo;
  const accessInfo = book.accessInfo; // Ottieni accessInfo

  //funzione per troncare il titolo se troppo lungo e va in ellipsis
  const truncateTitle = (title, number) => {
    if (title.length <= number) return title;
    return title.slice(0, number) + "...";
  };

  // Determina quale link usare per la preview
  // Preferisci webReaderLink se disponibile e embeddable è true
  // Altrimenti, usa il previewLink standard
  const previewHref = 
    accessInfo?.webReaderLink && accessInfo?.embeddable // Aggiunto controllo embeddable per coerenza
      ? accessInfo.webReaderLink 
      : info.previewLink;

  // Decide il testo del pulsante
  const buttonText = "Preview"
  return (
    <Card className="mb-3 h-100 w-100">
      <Card.Body className="d-flex flex-row gap-3 p-2">
        {info.imageLinks?.thumbnail && (
          <div
            className="flex-shrink-0"
            style={{ width: "100px", height: "150px" }}
          >
            <Card.Img
              src={info.imageLinks.thumbnail}
              alt={info.title}
              className="img-fluid h-100 w-100 object-fit-contain"
            />
          </div>
        )}
        <div className="d-flex flex-column justify-content-between flex-grow-1">
          <div>
            <Card.Title className="text-wrap">
              {truncateTitle(info.title, 40)}
            </Card.Title>
            {info.authors && (
              <Card.Text>di {info.authors.join(", ")}</Card.Text>
            )}
          </div>
          <div className="text-center">
            {previewHref && ( // Mostra il pulsante solo se c'è un link disponibile
              <Button
                size="sm"
                variant="dark"
                href={previewHref} // Usa il link determinato
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {buttonText} {/* Usa il testo determinato */}
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
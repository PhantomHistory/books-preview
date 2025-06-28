"use client";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

export default function BookCard({ book }) {
  const info = book.volumeInfo;
  const accessInfo = book.accessInfo;

  const [zoomLevel, setZoomLevel] = useState(2);

  useEffect(() => {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      const type = connection.effectiveType || "4g";
      if (type === "5g") {
        setZoomLevel(3);
        console.log(zoomLevel,'zoom 3')
      } else {
        setZoomLevel(2);
                console.log(zoomLevel,'zoom 2 ')

      }
    }
  }, []);

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Sostituisci zoom con zoomLevel dinamico
  const cleanThumbnailUrl = info.imageLinks?.thumbnail?.replace(
    /([&?])zoom=\d+(&|$)/,
    (match, p1, p2) => `${p1}zoom=${zoomLevel}${p2 === "&" ? "&" : ""}`
  );

  const previewHref =
    accessInfo?.webReaderLink && accessInfo?.embeddable
      ? accessInfo.webReaderLink
      : info.previewLink;

  const handleCardClick = () => {
    if (previewHref) {
      window.open(previewHref, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      className="h-100 w-100 cursor-pointer"
      onClick={handleCardClick}
      style={{ cursor: previewHref ? "pointer" : "default" }}
    >
      {info.imageLinks?.thumbnail && (
        <Card.Img
          src={cleanThumbnailUrl}
          alt={info.title}
          className="object-fit-contain"
          loading="lazy" // lazy loading nativo
        />
      )}
      <Card.Body>
        <Card.Title>{truncateText(info.title, 60)}</Card.Title>
        {info.authors && (
          <Card.Text className="mb-0">
            di {truncateText(info.authors.join(", "), 40)}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}

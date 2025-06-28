"use client";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

export default function BookCard({ book }) {
  const info = book.volumeInfo;
  const accessInfo = book.accessInfo;

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const cleanThumbnailUrl = info.imageLinks?.thumbnail?.replace(
    /([&?])zoom=1(&|$)/,
    (match, p1, p2) => `${p1}zoom=2${p2 === "&" ? "&" : ""}`
  );

  const previewHref =
    accessInfo?.webReaderLink && accessInfo?.embeddable
      ? accessInfo.webReaderLink
      : info.previewLink;

  // Funzione per aprire il link in una nuova scheda
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

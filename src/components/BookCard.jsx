"use client";
import { useState } from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row"; // Import Row
import Col from "react-bootstrap/Col"; // Import Col

export default function BookCard({ book }) {
  const info = book.volumeInfo;

  //funzione per troncare il titolo se troppo lungo e va in ellipsis
  const truncateTitle = (title, number) => {
    if (title.length <= number) return title;
    return title.slice(0, number) + "...";
  };

  return (
    // <Link href={`/book/${book.id}`} passHref>
    <Card className="mb-3 h-100 w-100 " >
      <Card.Body className="d-flex flex-row gap-3 p-2">
        {info.imageLinks?.thumbnail && (
          <div
            className="flex-shrink-0"
            style={{ width: "100px", height: "150px" }} // dimensioni fisse consigliate
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
          <div className=" text-center">
            <Button
              size="sm"
              variant="dark"
              href={book.volumeInfo.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              Preview
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
    // </Link>
  );
}

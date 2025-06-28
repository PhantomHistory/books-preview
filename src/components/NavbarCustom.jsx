"use client";

import { Navbar, Container, Form, Button, Spinner } from "react-bootstrap";

export default function NavbarCustom({ query, setQuery, loading, handleSearch }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container fluid className="flex-wrap">
        <Navbar.Brand href="/" className="me-3">
          📚 Home
        </Navbar.Brand>

        <div className="flex-grow-1">
          <Form
            onSubmit={handleSearch}
            className="d-flex flex-column flex-lg-row gap-2"
          >
            <Form.Control
              type="search"
              placeholder="Cerca libri o fumetti..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="outline-light" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Cerca"}
            </Button>
          </Form>
        </div>
      </Container>
    </Navbar>
  );
}

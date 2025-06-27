import axios from 'axios';

export default async function BookDetail({ params }) {
  const { id } = params;

  const res = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
  const info = res.data.volumeInfo;

  return (
    <div className="container mt-4">
      <h1>{info.title}</h1>
      {info.authors && <p>Autore: {info.authors.join(', ')}</p>}
      {info.imageLinks?.thumbnail && <img src={info.imageLinks.thumbnail} alt={info.title} />}
      <p>{info.description || 'Nessuna descrizione disponibile.'}</p>
      {info.previewLink && (
        <a href={info.previewLink} target="_blank" rel="noopener noreferrer">
          Vai all’anteprima su Google Books
        </a>
      )}
    </div>
  );
}

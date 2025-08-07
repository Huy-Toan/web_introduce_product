// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Breadcrumbs from "../components/Breadcrumbs";
// import BooksList from "../components/BooksList";
// import { groupByGenre } from "../lib/utils";

// export default function HomePage() {
//   const { genreId } = useParams();
//   const navigate = useNavigate();
//   const [genres, setGenres] = useState([]);
//   const [dataSource, setDataSource] = useState(null);

//   const activeGenre = genreId ? decodeURIComponent(genreId) : null;

//   useEffect(() => {
//     const loadGenres = async () => {
//       try {
//         const res = await fetch("/api/books");
//         const data = await res.json();
//         const booksArray = data.books || [];

//         if (data.source) setDataSource(data.source);
//         const grouped = groupByGenre(booksArray);
//         setGenres(grouped);
//       } catch (err) {
//         console.error("Failed to load genres:", err);
//       }
//     };

//     loadGenres();
//   }, []);

//   const handleSelectBook = (bookId) => {
//     navigate(`/book/${bookId}`);
//   };

//   const handleSelectGenre = (genre) => {
//     navigate(genre ? `/genre/${encodeURIComponent(genre)}` : "/");
//   };

//   return (
//     <>
//       <Breadcrumbs
//         items={[
//           { label: "All Books", value: null },
//           ...(activeGenre ? [{ label: activeGenre, value: activeGenre }] : []),
//         ]}
//         onNavigate={handleSelectGenre}
//       />

//       <BooksList onSelectBook={handleSelectBook} filter={activeGenre} />
//     </>
//   );
// }

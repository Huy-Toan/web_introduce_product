// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router";
// import { groupByGenre } from "./lib/utils";
// import Breadcrumbs from "./components/Breadcrumbs";
// import Sidebar from "./components/Sidebar";
// import BooksList from "./components/BooksList";
// import BookDetail from "./components/BookDetail";
// import TopNavigation from "./components/Navigation";
// import Footer from "./components/Footer";
// import HomePage from "./components/HomePage";


// function App() {
//   const navigate = useNavigate();
//   const params = useParams();
//   const [bookDetail, setBookDetail] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [genres, setGenres] = useState([]);
//   const [dataSource, setDataSource] = useState(null);

//   // Get route parameters
//   const { bookId } = params;
//   const { genreId } = params;
//   const activeGenre = genreId ? decodeURIComponent(genreId) : null;

//   // Load genres for sidebar
//   useEffect(() => {
//     const loadGenres = async () => {
//       try {
//         const response = await fetch("/api/books");
//         if (!response.ok) {
//           throw new Error(`API returned status: ${response.status}`);
//         }
//         const data = await response.json();

//         if (!data.books?.length) {
//           console.error("No books data found:", typeof data);
//           return;
//         }

//         const booksArray = data.books;

//         // Check if using mock data or database
//         if (data.source) {
//           setDataSource(data.source);
//         }

//         const genreGroups = groupByGenre(booksArray);
//         setGenres(genreGroups);
//       } catch (error) {
//         console.error("Error loading genres:", error);
//       }
//     };

//     loadGenres();
//   }, []);

//   // Load book details when a book is selected via URL
//   useEffect(() => {
//     if (!bookId) return;

//     const fetchBookDetail = async () => {
//       setLoading(true);
//       try {
//         // First get basic book details
//         const bookResponse = await fetch(`/api/books/${bookId}`);

//         if (!bookResponse.ok) {
//           throw new Error(`API returned status: ${bookResponse.status}`);
//         }

//         const bookData = await bookResponse.json();

//         // Then get related books data
//         const relatedResponse = await fetch(`/api/books/${bookId}/related`);

//         if (!relatedResponse.ok) {
//           throw new Error(`API returned status: ${relatedResponse.status}`);
//         }

//         const relatedData = await relatedResponse.json();

//         // Combine the data
//         const combinedData = {
//           book: bookData.book,
//           relatedBooks: relatedData.relatedBooks,
//           recentRecommendations: relatedData.recentRecommendations,
//           genreStats: relatedData.genreStats,
//         };

//         setBookDetail(combinedData);
//       } catch (error) {
//         console.error("Error fetching book details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookDetail();
//   }, [bookId]);

//   const handleSelectBook = (bookId) => {
//     navigate(`/book/${bookId}`);
//   };

//   const handleSelectGenre = (genre) => {
//     if (genre) {
//       navigate(`/genre/${encodeURIComponent(genre)}`);
//     } else {
//       navigate("/");
//     }
//   };

//   const handleNavigateToPage = (pageName) => {
//     setCurrentPage(pageName);
//     if (pageName === 'home') {
//       navigate('/home');
//     } else if (pageName === 'about') {
//       navigate('/about');
//     } else if (pageName === 'contact') {
//       navigate('/contact');
//     } else if (pageName === 'library') {
//       navigate('/');
//     }
//   };

//   const renderPageContent = () => {
//     if (currentPage === 'home') {
//       return <HomePage />;
//     } else if (currentPage === 'about') {
//       return <AboutPage />;
//     } else if (currentPage === 'contact') {
//       return <ContactPage />;
//     } else {
//       // Library content (trang mặc định)
//       return (
//         <>
//           {/* Breadcrumbs for main library page */}
//           {!bookId && (
//             <Breadcrumbs
//               items={[
//                 { label: "All Books", value: null },
//                 ...(activeGenre
//                   ? [{ label: activeGenre, value: activeGenre }]
//                   : []),
//               ]}
//               onNavigate={(value) => {
//                 if (value === null) {
//                   handleSelectGenre(null);
//                 }
//               }}
//             />
//           )}

//           <div className="page-header">
//             <h1>{activeGenre ? `${activeGenre} Books` : "My Library"}</h1>
//             <p className="text-gray-900">
//               {activeGenre
//                 ? `Explore our collection of ${activeGenre.toLowerCase()} books`
//                 : "Discover your next favorite book"}
//             </p>
//           </div>

//           {bookId ? (
//             loading ? (
//               <div className="flex justify-center items-center py-20">
//                 <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
//               </div>
//             ) : bookDetail ? (
//               <BookDetail bookData={bookDetail} />
//             ) : (
//               <div className="text-center py-20 text-gray-600">
//                 Error loading book details
//               </div>
//             )
//           ) : (
//             <BooksList onSelectBook={handleSelectBook} filter={activeGenre} />
//           )}
//         </>
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">

//       <TopNavigation
//         genres={genres}
//         activeGenre={activeGenre}
//         onSelectGenre={handleSelectGenre}
//       />

//       {/* <Sidebar
//         genres={genres}
//         activeGenre={activeGenre}
//         onSelectGenre={handleSelectGenre}
//         counts
//       /> */}

//       <main className="container mx-auto px-4 py-6 mt-12 max-w-7xl mx-auto">
//         {/* Breadcrumbs for main library page */}
//         {!bookId && (
//           <Breadcrumbs
//             items={[
//               { label: "All Books", value: null },
//               ...(activeGenre
//                 ? [{ label: activeGenre, value: activeGenre }]
//                 : []),
//             ]}
//             onNavigate={(value) => {
//               if (value === null) {
//                 handleSelectGenre(null);
//               }
//             }}
//           />
//         )}

//         {/* <div className="page-header">
//           <h1>{activeGenre ? `${activeGenre} Books` : "My Library"}</h1>
//           <p className="text-gray-900">
//             {activeGenre
//               ? `Explore our collection of ${activeGenre.toLowerCase()} books`
//               : "Discover your next favorite book"}
//           </p>
//         </div> */}

//         {bookId ? (
//           loading ? (
//             <div className="flex justify-center items-center py-20">
//               <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : bookDetail ? (
//             <BookDetail bookData={bookDetail} />
//           ) : (
//             <div className="text-center py-20 text-gray-600">
//               Error loading book details
//             </div>
//           )
//         ) : (
//           <BooksList onSelectBook={handleSelectBook} filter={activeGenre} />
//         )}
//       </main>

//       <Footer />
//     </div>
//   );
// }

// export default App;

import React from "react";

function SidebarGenres({ genres = [], activeGenre, onSelectGenre }) {

  return (
    <aside className="w-full md:w-64 bg-white p-4 border rounded-md shadow-sm self-start mt-16">
      <h2 className="text-lg font-bold mb-4">Genres</h2>
      <ul className="space-y-2">
        <li
          onClick={() => onSelectGenre(null)}
          className={`cursor-pointer px-3 py-2 rounded-md hover:bg-green-100 ${
            !activeGenre ? "bg-green-200 font-semibold" : ""
          }`}
        >
          All
        </li>
        {genres.map((genre, index) => (
          <li
            key={genre.books.name}
            onClick={() => onSelectGenre(genre.books.name)}
            className={`cursor-pointer px-3 py-2 rounded-md hover:bg-green-100 ${
              activeGenre === genre.books.name ? "bg-green-200 font-semibold" : ""
            }`}
          >
            {genre.books.name}
            <span className="ml-2 text-sm text-gray-500">({genre.books.count})</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default SidebarGenres;
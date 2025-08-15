function SidebarGenres({ genres = [], activeGenre, onSelectGenre }) {

  return (
    <aside className="w-full md:w-64 bg-white p-4 border rounded-md shadow-sm self-start">
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
        {genres.map((genre) => (
          <li
            key={genre.name}
            onClick={() => onSelectGenre(genre.name)}
            className={`cursor-pointer px-3 py-2 rounded-md hover:bg-green-100 ${
              activeGenre === genre.name ? "bg-green-200 font-semibold" : ""
            }`}
          >
            {genre.name}
            <span className="ml-2 text-sm text-gray-500">({genre.count})</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default SidebarGenres;
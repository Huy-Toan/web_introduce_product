import React from 'react';
import { Filter, SortAsc } from 'lucide-react';

const FilterSortBar = ({ genres = [], selectedGenre, setSelectedGenre, sortOptions = [], sortBy, setSortBy, total, filtered }) => (
  <div className="bg-white p-4 rounded-lg shadow mb-6">
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter size={20} className="text-gray-500" />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả thể loại</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <SortAsc size={20} className="text-gray-500" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-600">
        Hiển thị {filtered} / {total} sách
      </div>
    </div>
  </div>
);

export default FilterSortBar;
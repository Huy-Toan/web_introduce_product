import React from 'react';
import { BookOpen, Users, Settings } from 'lucide-react';

const DashboardOverview = ({ bookCount, genreCount }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tổng số sách</h3>
            <p className="text-2xl font-bold text-blue-600">{bookCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <Users className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Thể loại</h3>
            <p className="text-2xl font-bold text-green-600">{genreCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <Settings className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trạng thái</h3>
            <p className="text-2xl font-bold text-purple-600">Hoạt động</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardOverview;

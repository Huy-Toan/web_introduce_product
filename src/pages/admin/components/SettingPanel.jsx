import React from 'react';

const SettingsPanel = () => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoints</label>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">GET /api/books - Lấy danh sách sách</p>
            <p className="text-sm text-gray-600 mb-1">GET /api/books/:id - Chi tiết sách</p>
            <p className="text-sm text-gray-600 mb-1">POST /api/books - Thêm sách mới</p>
            <p className="text-sm text-gray-600 mb-1">PUT /api/books/:id - Cập nhật sách</p>
            <p className="text-sm text-gray-600">DELETE /api/books/:id - Xóa sách</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsPanel;
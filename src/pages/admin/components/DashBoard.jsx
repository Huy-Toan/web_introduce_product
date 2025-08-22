import { Library, Shapes, Newspaper, Activity } from 'lucide-react';

const DashboardOverview = ({ products, parents, news }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Tổng số sách */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <Library className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tổng số sản phẩm</h3>
            <p className="text-2xl font-bold text-blue-600">{products}</p>
          </div>
        </div>
      </div>

      {/* Thể loại */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <Shapes className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tổng số danh mục lớn</h3>
            <p className="text-2xl font-bold text-green-600">{parents}</p>
          </div>
        </div>
      </div>

      {/* Tin tức */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-lg mr-4">
            <Newspaper className="text-yellow-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tin tức</h3>
            <p className="text-2xl font-bold text-yellow-600">{news}</p>
          </div>
        </div>
      </div>

      {/* Trạng thái */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <Activity className="text-purple-600" size={24} />
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

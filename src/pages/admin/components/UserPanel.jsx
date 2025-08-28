import { useEffect, useState } from "react";

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.ok) {
        setUsers(data.items || []);
      } else {
        console.error(data.error || "Failed to load users");
      }
    } catch (e) {
      console.error("Error loading users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error || "Xóa thất bại");
      }
    } catch (e) {
      console.error("Error deleting user", e);
    }
  };

  const openAddForm = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "user" });
    setModalOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

    const isStrongPassword = (s) => s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s);

  const saveUser = async (e) => {
    e.preventDefault();
      if ((!editingUser && !isStrongPassword(form.password)) || (editingUser && form.password && !isStrongPassword(form.password))) {
          alert("Mật khẩu phải có ít nhất 8 ký tự và bao gồm cả chữ lẫn số");
          return;
      }
    try {
      let res;
      if (editingUser) {
        res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (data.ok) {
        setModalOpen(false);
        fetchUsers();
      } else {
        alert(data.error || "Lưu thất bại");
      }
    } catch (e) {
      console.error("Error saving user", e);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quản lý người dùng</h2>
      <div className="mb-4">
        <button
          onClick={openAddForm}
          className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p className="text-gray-600">Đang tải...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">Không có người dùng nào.</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2">ID</th>
                <th className="border border-gray-200 px-4 py-2">Tên</th>
                <th className="border border-gray-200 px-4 py-2">Email</th>
                <th className="border border-gray-200 px-4 py-2">Vai trò</th>
                <th className="border border-gray-200 px-4 py-2">Ngày tạo</th>
                <th className="border border-gray-200 px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{u.id}</td>
                  <td className="border border-gray-200 px-4 py-2">{u.name}</td>
                  <td className="border border-gray-200 px-4 py-2">{u.email}</td>
                  <td className="border border-gray-200 px-4 py-2">{u.role}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    {new Date(u.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 space-x-2">
                    <button
                      onClick={() => openEditForm(u)}
                      className="px-3 py-1 bg-blue-500 text-white cursor-pointer rounded hover:bg-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="px-3 py-1 bg-red-500 text-white cursor-pointer rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingUser ? "Sửa người dùng" : "Thêm người dùng"}
            </h3>
            <form onSubmit={saveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mật khẩu{editingUser && " (để trống nếu không đổi)"}
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                        {...(!editingUser ? { required: true } : {})}
                    />
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vai trò</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="admin">Admin</option>
                    <option value="content_manager">Content Manager</option>
                    <option value="user_manager">User Manager</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;

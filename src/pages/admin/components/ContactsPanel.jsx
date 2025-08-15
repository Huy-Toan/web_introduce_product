import React, { useEffect, useState } from "react";

const ContactsPanel = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.ok) {
        setContacts(data.items || []);
      } else {
        console.error(data.error || "Failed to load contacts");
      }
    } catch (e) {
      console.error("Error loading contacts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const markAsReviewed = async (id) => {
    try {
      const res = await fetch(`/api/contacts/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      });
      const data = await res.json();
      if (data.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "reviewed" } : c))
        );
      } else {
        alert(data.error || "Cập nhật trạng thái thất bại");
      }
    } catch (e) {
      console.error("Error updating status", e);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa liên hệ này?")) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(data.error || "Xóa thất bại");
      }
    } catch (e) {
      console.error("Error deleting contact", e);
    }
  };

  const truncate = (str, len = 40) =>
    str.length > len ? str.slice(0, len) + "..." : str;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quản lý liên hệ</h2>
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        {loading ? (
          <p className="text-gray-600">Đang tải...</p>
        ) : contacts.length === 0 ? (
          <p className="text-gray-600">Không có liên hệ nào.</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2">Họ tên</th>
                <th className="border border-gray-200 px-4 py-2">Email</th>
                <th className="border border-gray-200 px-4 py-2">Nội dung</th>
                <th className="border border-gray-200 px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{c.full_name}</td>
                  <td className="border border-gray-200 px-4 py-2">{c.email}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    {truncate(c.message, 40)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 space-x-2">
                    <button
                      onClick={() => setSelectedContact(c)}
                      className="px-3 py-1 bg-gray-500 cursor-pointer text-white rounded hover:bg-gray-600"
                    >
                      Xem
                    </button>
                    {c.status === "new" && (
                      <button
                        onClick={() => markAsReviewed(c.id)}
                        className="px-3 py-1 bg-blue-500 cursor-pointer text-white rounded hover:bg-blue-600"
                      >
                        Đánh dấu
                      </button>
                    )}
                    <button
                      onClick={() => deleteContact(c.id)}
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

      {/* Modal chi tiết */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
            <h3 className="text-lg font-bold mb-4">Chi tiết liên hệ</h3>
            <div className="space-y-2 text-gray-800">
              <p><strong>Họ tên:</strong> {selectedContact.full_name}</p>
              <p><strong>Email:</strong> {selectedContact.email}</p>
              <p><strong>Điện thoại:</strong> {selectedContact.phone || "-"}</p>
              <p><strong>Địa chỉ:</strong> {selectedContact.address || "-"}</p>
              <p><strong>Trạng thái:</strong> {selectedContact.status}</p>
              <p><strong>Ngày tạo:</strong> {new Date(selectedContact.created_at).toLocaleString("vi-VN")}</p>
              <p><strong>Nội dung:</strong></p>
              <p className="whitespace-pre-wrap">{selectedContact.message}</p>
            </div>
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-black"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPanel;

// components/R2FolderImportButton.jsx
import React, { useRef, useState } from "react";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; 

export default function R2FolderImportButton({
  apiUrl = "/api/upload-image",
  folder = "",                 
  concurrent = 3,            
  className = "",
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null); 

  const clickPicker = () => inputRef.current?.click();

  const uploadOne = async (file) => {
    // bỏ qua file không phải ảnh hoặc quá 5MB
    if (!ALLOWED.includes(file.type)) {
      return { ok: false, name: file.name, reason: "Loại file không hỗ trợ" };
    }
    if (file.size > MAX_SIZE) {
      return { ok: false, name: file.name, reason: "File > 5MB" };
    }

    // seoName = tên file không đuôi
    const seoName = file.name.replace(/\.[^.]+$/, "");

    const fd = new FormData();
    fd.append("image", file);
    fd.append("seoName", seoName);
    if (folder) fd.append("folder", folder);

    // nếu API yêu cầu token:
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(apiUrl, { method: "POST", body: fd, headers });
        if (res.ok) return { ok: true, name: file.name };
        if (res.status >= 400 && res.status < 500) {
          const txt = await res.text().catch(() => "");
          return { ok: false, name: file.name, reason: `HTTP ${res.status}${txt ? `: ${txt.slice(0,120)}` : ""}` };
        }
        lastErr = `HTTP ${res.status}`;
      } catch (e) {
        lastErr = e?.message || "Network error";
      }
      await new Promise(r => setTimeout(r, 300 * attempt));
    }
    return { ok: false, name: file.name, reason: lastErr || "Lỗi không xác định" };
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => f && f.type && f.size > 0);
    if (files.length === 0) {
      setSummary({ total: 0, ok: 0, fail: 0 });
      return;
    }

    setBusy(true);
    setSummary(null);

    let idx = 0;
    let ok = 0, fail = 0;

    const runner = async () => {
      while (idx < files.length) {
        const i = idx++;
        const result = await uploadOne(files[i]);
        if (result.ok) ok++; else fail++;
      }
    };

    const workers = Array.from({ length: Math.min(concurrent, files.length) }, runner);
    await Promise.all(workers);

    setBusy(false);
    setSummary({ total: files.length, ok, fail });
  };

  const onChange = (e) => {
    const fileList = e.target.files;
    e.target.value = "";
    if (fileList) handleFiles(fileList);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={clickPicker}
        disabled={busy}
        className={`cursor-pointer px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60`}
      >
        {busy ? "Đang import..." : "Import ảnh từ thư mục"}
      </button>

      <input
        ref={inputRef}
        type="file"
        webkitdirectory="true"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={onChange}
        className="hidden"
      />

      {summary && (
        <p className="mt-2 text-sm">
          Đã xử lý: <b>{summary.total}</b> file — Thành công: <b className="text-green-700">{summary.ok}</b>, Thất bại: <b className="text-red-700">{summary.fail}</b>.
        </p>
      )}
    </div>
  );
}

// components/R2FolderImportButton.jsx
import React, { useRef, useState, useEffect } from "react";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function R2FolderImportButton({
  apiUrl = "/api/upload-image",
  folder = "",
  concurrent = 3,
  className = "",
  disabled = false,         
  onBusyChange,               
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null);

  // Thông báo busy cho cha
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  const clickPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    el.value = "";
    el.click();
  };

  const uploadOne = async (file) => {
    if (!ALLOWED.includes(file.type)) {
      return { ok: false, name: file.name, reason: "Loại file không hỗ trợ" };
    }
    if (file.size > MAX_SIZE) {
      return { ok: false, name: file.name, reason: "File > 5MB" };
    }

    const seoName = file.name.replace(/\.[^.]+$/, "");
    const fd = new FormData();
    fd.append("image", file);
    fd.append("seoName", seoName);
    if (folder) fd.append("folder", folder);

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
    const el = inputRef.current;


    const files = Array.from(fileList || []);
    if (files.length === 0) {
      setSummary({ total: 0, ok: 0, fail: 0 });
      alert("Không có file nào được chọn.");
      return;
    }

    setBusy(true);
    setSummary(null);

    let idx = 0, ok = 0, fail = 0;
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

    alert(`Đã xử lý: ${files.length} file\nThành công: ${ok}\nThất bại: ${fail}`);
  };

  const onChange = (e) => {
    if (e?.target?.files) handleFiles(e.target.files);
    else {
      console.warn("onChange fired nhưng không có files.");
      setSummary({ total: 0, ok: 0, fail: 0 });
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={clickPicker}
        disabled={busy || disabled}
        className="cursor-pointer px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Đang import..." : "Import ảnh từ thư mục"}
      </button>

      <input
        id="r2-folder-input"
        ref={inputRef}
        type="file"
        directory=""
        webkitdirectory=""
        multiple
        onChange={onChange}
        style={{ position:"absolute", left:"-9999px", width:"1px", height:"1px", opacity:0 }}
      />
    </div>
  );
}

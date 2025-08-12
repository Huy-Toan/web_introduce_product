// src/components/EditorMd.jsx
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import $ from 'jquery'
import 'editor.md/css/editormd.min.css'

if (typeof window !== 'undefined') {
  window.$ = window.jQuery = $;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
function loadCSS(href) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve();
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.onload = resolve;
    l.onerror = reject;
    document.head.appendChild(l);
  });
}

const EditorMd = forwardRef(function EditorMd(
  {
    value = '',         
    onChangeMarkdown,
    onChangeHTML,
    onReady,
    height = 500,
  },
  ref
) {
  const idRef = useRef('edmd-' + Math.random().toString(36).slice(2));
  const instRef = useRef(null);
  const isSettingRef = useRef(false); // 🚩 phân biệt thay đổi lập trình
  const [status, setStatus] = useState('loading');

  const cbRef = useRef({ onChangeMarkdown, onChangeHTML, onReady });
  useEffect(() => { cbRef.current = { onChangeMarkdown, onChangeHTML, onReady }; }, [onChangeMarkdown, onChangeHTML, onReady]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadCSS('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/codemirror/codemirror.min.css');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/marked.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/prettify.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/raphael.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/underscore.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/sequence-diagram.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/flowchart.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/jquery.flowchart.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/codemirror/codemirror.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/editor.md@1.5.0/editormd.min.js');

        if (cancelled) return;
        if (!window.editormd) throw new Error('window.editormd not found');

        const inst = window.editormd(idRef.current, {
          width: '100%',
          height,
          markdown: '',
          path: 'https://cdn.jsdelivr.net/npm/editor.md@1.5.0/lib/',
          imageUpload: false,
          pasteImage: false,
          toolbarAutoFixed: false,
          watch: true,
          delay: 150,
          saveHTMLToTextarea: true,
          htmlDecode: 'style,script,iframe|on*',
          onload: function () {
            // set nội dung khởi tạo từ value
            isSettingRef.current = true;
            this.setMarkdown(value || '');
            this.cm.refresh();

            // lắng nghe gõ phím/người dùng
            this.cm.on('change', () => {
              if (isSettingRef.current) return; 
              cbRef.current.onChangeMarkdown?.(this.getMarkdown());
              cbRef.current.onChangeHTML?.(this.getHTML());
            });

            cbRef.current.onReady?.(this);
            setStatus('ready');

            // refresh sau 1 frame để chắc CodeMirror layout đúng (modal)
            requestAnimationFrame(() => this.cm.refresh());
          },
        });

        instRef.current = inst;
      } catch (err) {
        console.error('Editor.md init failed:', err);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      try {
        const wrap = document.getElementById(idRef.current);
        if (wrap) wrap.innerHTML = '';
        instRef.current = null;
      } catch {}
    };
  }, []);

  // 🔄 đồng bộ khi prop `value` đổi
  useEffect(() => {
    if (status !== 'ready' || !instRef.current) return;
    const cur = instRef.current.getMarkdown() || '';
    if ((value || '') !== cur) {
      isSettingRef.current = true;
      instRef.current.setMarkdown(value || '');
      instRef.current.cm.refresh();
      // xả cờ sau 1 tick để onChange của CodeMirror không bắn ngược
      setTimeout(() => { isSettingRef.current = false; }, 0);
    } else {
      // không đổi nội dung, nhưng vẫn đảm bảo refresh nếu modal mới mở
      requestAnimationFrame(() => instRef.current?.cm?.refresh());
    }
  }, [value, status]);

  // ✅ expose API hữu ích cho cha
  useImperativeHandle(ref, () => ({
    setMarkdown: (md) => {
      if (!instRef.current) return;
      isSettingRef.current = true;
      instRef.current.setMarkdown(md || '');
      instRef.current.cm.refresh();
      setTimeout(() => { isSettingRef.current = false; }, 0);
    },
    getMarkdown: () => instRef.current?.getMarkdown() || '',
    getHTML: () => instRef.current?.getHTML() || '',
    insertValue: (s) => instRef.current?.insertValue?.(s),
    cm: instRef.current?.cm,
    watch: (v) => v === false ? instRef.current?.unwatch?.() : instRef.current?.watch?.(),
    refresh: () => instRef.current?.cm?.refresh(),
  }), []);

  return (
    <div>
      {status === 'loading' && <div className="mb-2 text-sm text-gray-500">Đang tải trình soạn thảo…</div>}
      {status === 'error' && <div className="mb-2 text-sm text-red-600">Không tải được Editor.md (kiểm tra mạng/CDN hoặc xem Console).</div>}
      <div id={idRef.current} />
    </div>
  );
});

export default EditorMd;

import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { FaWhatsapp } from "react-icons/fa";
import { useWhatsAppLink } from "../hooks/useWhatsAppLink";
import { fetchHistory, sendUserMessage } from "../lib/waApi";

const QRCodeCanvas = lazy(() =>
    import("qrcode.react").then(m => ({ default: m.QRCodeCanvas }))
);

export default function UserChatBox({ msg }) {
    const [open, setOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const bottomRef = useRef(null);
    const canChat = /^\d{8,15}$/.test(phone);
    const { build, isPhoneOk } = useWhatsAppLink();
    const waUrl = useMemo(() => build(msg), [build, msg]);

    useEffect(() => {
        if (!canChat) return;
        let stop = false;
        const load = async () => {
            const rows = await fetchHistory(phone, 100);
            if (!stop) setMessages(rows);
        };
        load();
        const id = setInterval(load, 3000);
        return () => { stop = true; clearInterval(id); };
    }, [phone, canChat]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const onSend = async () => {
        const t = text.trim(); if (!t || !canChat) return;
        setText("");
        setMessages(m => [...m, { direction: "in", body: t, ts: Date.now() }]);
        try {
            await sendUserMessage(phone, t);
        } catch (e) {
            console.error("Send failed", e);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-8 w-14 h-14 rounded-full bg-[#25d366] text-white shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
                aria-label="Open chat"
            >
                <FaWhatsapp size={28} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-8 flex items-end space-x-3 z-50">
            {isPhoneOk() && (
                <div className="flex flex-col items-center space-y-2">
                    <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        aria-label="Open WhatsApp"
                    >
                        <FaWhatsapp size={28} />
                    </a>
                    <Suspense fallback={<div style={{ width: 96, height: 96 }} />}>
                        <QRCodeCanvas value={waUrl} size={96} />
                    </Suspense>
                </div>
            )}
            <div className="relative w-80 h-96 flex flex-col bg-[#111b21] text-white rounded-xl overflow-hidden shadow-xl">
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    aria-label="Close chat"
                >
                    ×
                </button>
                <div className="bg-[#202c33] p-3">
                    <div className="text-sm text-gray-300 mb-2">Số của bạn (E.164)</div>
                    <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
                           placeholder="VD: 8490xxxxxxx"
                           className="w-full px-3 py-2 rounded bg-[#0b141a] text-white outline-none"/>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a]">
                    {messages.map((m,i)=>(
                        <div key={i} className={`w-full flex ${m.direction === "out" ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[70%] px-3 py-2 rounded-lg text-[15px] whitespace-pre-wrap ${m.direction === "out" ? "bg-[#202c33]" : "bg-[#005c4b]"}`}>
                                {m.body}
                                <div className="text-[10px] text-gray-300 mt-1 text-right">{new Date(m.ts).toLocaleTimeString()}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                <div className="h-16 flex items-center gap-2 px-3 bg-[#202c33] border-t border-black/20">
                    <input value={text} onChange={e=>setText(e.target.value)}
                           onKeyDown={(e)=>(e.key==="Enter"&&!e.shiftKey?onSend():null)}
                           placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 rounded bg-[#0b141a] text-white outline-none"/>
                    <button onClick={onSend} className="px-4 py-2 rounded bg-[#00a884] text-white font-semibold">Send</button>
                </div>
            </div>
        </div>
    );
}

UserChatBox.propTypes = {
    msg: PropTypes.string
};
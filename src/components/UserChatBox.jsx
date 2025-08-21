import { useEffect, useRef, useState } from "react";
import { fetchHistory, sendUserMessage } from "../lib/waApi";

export default function UserChatBox() {
    const [phone, setPhone] = useState("");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const bottomRef = useRef(null);
    const canChat = /^\d{8,15}$/.test(phone);

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

    return (
        <div className="w-full h-[80vh] flex flex-col bg-[#111b21] text-white rounded-xl overflow-hidden">
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
    );
}

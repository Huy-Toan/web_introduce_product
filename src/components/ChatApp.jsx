import { useEffect, useRef, useState } from "react";
import { fetchHistory, sendMessage } from "../lib/waApi";

export default function ChatApp() {
    const [peer, setPeer] = useState("");           // số khách (E.164)
    const [messages, setMessages] = useState([]);   // {direction, body, ts}
    const [text, setText] = useState("");
    const bottomRef = useRef(null);
    const canChat = /^\d{8,15}$/.test(peer);

    useEffect(() => {
        if (!canChat) return;
        let stop = false;
        const load = async () => {
            const rows = await fetchHistory(peer, 100);
            if (!stop) setMessages(rows);
        };
        load();
        const id = setInterval(load, 3000);
        return () => { stop = true; clearInterval(id); };
    }, [peer, canChat]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

    const onSend = async () => {
        const t = text.trim(); if (!t || !canChat) return;
        setText("");
        setMessages(m => [...m, { direction: "out", body: t, ts: Date.now() }]);
        try {
            await sendMessage(peer, t);
        } catch (e) {
            console.error("Send failed", e);
        }
    };

    return (
        <div className="w-full h-[80vh] grid grid-cols-[320px_1fr] bg-[#111b21] text-white rounded-xl overflow-hidden">
            <div className="bg-[#202c33] p-3">
                <div className="text-sm text-gray-300 mb-2">Số khách (E.164)</div>
                <input value={peer} onChange={e=>setPeer(e.target.value.replace(/\D/g,""))}
                       placeholder="VD: 8490xxxxxxx"
                       className="w-full px-3 py-2 rounded bg-[#0b141a] text-white outline-none"/>
            </div>
            <div className="flex flex-col">
                <div className="h-14 flex items-center px-4 bg-[#202c33] border-b border-black/20">
                    <div className="font-semibold">{canChat ? `Chat với ${peer}` : "Nhập số khách để bắt đầu"}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a]">
                    {messages.map((m,i)=>(
                        <div key={i} className={`w-full flex ${m.direction==="out"?"justify-end":"justify-start"}`}>
                            <div className={`max-w-[70%] px-3 py-2 rounded-lg text-[15px] whitespace-pre-wrap ${m.direction==="out"?"bg-[#005c4b]":"bg-[#202c33]"}`}>
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

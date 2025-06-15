import { useEffect } from "react";

export function useWebSocket(onMessage) {
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    return () => ws.close();
  }, [onMessage]);
}
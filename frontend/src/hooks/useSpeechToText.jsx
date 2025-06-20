import { useRef, useState } from "react";

export function useSpeechToText({ onResult }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const start = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Reconhecimento de voz não suportado neste navegador.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      onResult && onResult(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current && recognitionRef.current.stop();
    setListening(false);
  };

  return { start, stop, listening };
}
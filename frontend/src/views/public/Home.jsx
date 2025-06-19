import { useEffect, useRef, useState } from "react";
import { getUserRole } from "../../services/auth";
import { Bot, User, BarChart3, Lock, MessageCircle, Settings } from "lucide-react";

const techImages = [
  { name: "React", src: "/images/react.png" },
  { name: "Vite", src: "/images/vite.png" },
  { name: "Tailwind CSS", src: "/images/tailwind.png" },
  { name: "FastAPI", src: "/images/fastapi.png" },
  { name: "Google Generative AI", src: "/images/gemini.png" },
  { name: "SQLite", src: "/images/sqlite.png" },
];

function TechCarousel3D() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % techImages.length);
    }, 2500);
    return () => clearTimeout(timeoutRef.current);
  }, [index]);

  return (
    <div className="w-full flex flex-col items-center mb-10">
      <h2 className="text-xl font-bold text-purple mb-4">Tecnologias Utilizadas</h2>
      <div className="relative w-full max-w-[450px] h-[250px] flex items-center justify-center select-none overflow-hidden">
        {techImages.map((tech, i) => {
          const total = techImages.length;
          let pos = "hidden";
          if (i === index) pos = "center";
          else if (i === (index - 1 + total) % total) pos = "left";
          else if (i === (index + 1) % total) pos = "right";

          let z = 0;
          let opacity = 0;
          let scale = 1;
          let translateX = 0;
          let blur = "";

          if (pos === "center") {
            z = 30;
            scale = 1.25;
            opacity = 1;
            blur = "";
            translateX = 0;
          } else if (pos === "left") {
            z = 20;
            scale = 0.9;
            opacity = 0.7;
            blur = "blur-[1px]";
            translateX = -120;
          } else if (pos === "right") {
            z = 20;
            scale = 0.9;
            opacity = 0.7;
            blur = "blur-[1px]";
            translateX = 120;
          } else {
            opacity = 0;
            z = 0;
            scale = 0.7;
            blur = "";
            translateX = 0;
          }

          return (
            <img
              key={tech.name}
              src={tech.src}
              alt={tech.name}
              className={`absolute transition-all duration-700 rounded-2xl shadow-lg bg-surface p-4 ${blur}`}
              style={{
                maxWidth: "220px",
                maxHeight: "120px",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                zIndex: z,
                opacity: opacity,
                pointerEvents: pos === "hidden" ? "none" : "auto",
                boxShadow: pos === "center" ? "0 8px 32px 0 rgba(80,80,160,0.18)" : "0 2px 8px 0 rgba(80,80,160,0.08)",
                border: pos === "center" ? "3px solid #737FEB" : "1px solid #eee",
              }}
            />
          );
        })}
      </div>
      <div className="flex gap-2 mt-3">
        {techImages.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-purple" : "bg-gray-300"}`}
          />
        ))}
      </div>
      <div className="mt-2 text-sm text-color-secondary">{techImages[index].name}</div>
    </div>
  );
}

export default function Home() {
  const role = getUserRole();

  const features = [
    {
      icon: <MessageCircle size={28} className="text-purple" />,
      title: "Chat Cliente",
      desc: "Interface para clientes conversarem com o MicroBot, com sugestões rápidas e envio de mensagens.",
    },
    {
      icon: <User size={28} className="text-green-600" />,
      title: "Painel do Funcionário/Admin",
      desc: "Visualização de chats abertos, fixação de chats importantes, acompanhamento em tempo real e respostas manuais.",
    },
    {
      icon: <Bot size={28} className="text-purple" />,
      title: "IA Ligável/Desligável",
      desc: "Funcionário pode ativar ou desativar a IA para cada chat.",
    },
    {
      icon: <BarChart3 size={28} className="text-blue-600" />,
      title: "Estatísticas em Tempo Real",
      desc: "Painel exibe número de chats abertos, resolvidos e iniciados nas últimas 24h.",
    },
    {
      icon: <Lock size={28} className="text-red-500" />,
      title: "Autenticação Segura",
      desc: "Cadastro, login e controle de acesso por papel (usuário, funcionário, admin).",
    },
    {
      icon: <Settings size={28} className="text-gray-500" />,
      title: "Responsividade",
      desc: "Interface adaptada para desktop e dispositivos móveis, com menu dropdown.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-color flex flex-col items-center">
      <header className="w-2/3 px-6 py-12 my-8 rounded-2xl bg-surface shadow-md flex flex-col items-center">
        <h1 className="font-bold text-4xl text-purple mb-2 text-center">
          MicroBot
        </h1>
        <p className="text-lg text-color mb-2 text-center max-w-2xl">
          Assistente virtual para autoatendimento de clientes e suporte
          inteligente ao atendente humano.
        </p>
        <div className="text-xs text-color-secondary text-center">
          Desenvolvido para o Hackathon Mundiale • by LLMakers
        </div>
      </header>

      <section className="flex flex-col items-center justify-center w-full mt-8">
        <TechCarousel3D />
      </section>

      <section className="w-full flex flex-col items-center px-2 sm:px-0 mt-8">
        <h2 className="text-xl font-bold text-purple">Funcionalidades</h2>
        <div className="flex flex-row flex-wrap justify-center gap-6 max-w-3xl w-full mb-8 min-w-4/5 p-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card flex items-start gap-3 bg-surface rounded-2xl p-4 shadow min-w-[330px] max-w-1/3"
            >
              <div>{f.icon}</div>
              <div>
                <div className="font-semibold text-color mb-1">{f.title}</div>
                <div className="text-color-secondary text-sm">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full flex flex-col items-center mb-12 p-6">
        {!role && (
          <div className="text-center">
            <p className="mb-2">
              Para acessar o chat ou dashboard, faça{" "}
              <a href="/login" className="text-purple underline">
                login
              </a>{" "}
              ou{" "}
              <a href="/register" className="text-purple underline">
                registre-se
              </a>
              .
            </p>
          </div>
        )}
        {role === "usuario" && (
          <div className="text-center">
            <p className="mb-2">
              Acesse o{" "}
              <a href="/chat" className="text-purple underline">
                Chat
              </a>{" "}
              para conversar com o MicroBot!
            </p>
          </div>
        )}
        {(role === "admin" || role === "funcionario") && (
          <div className="text-center">
            <p className="mb-2">
              Acesse o{" "}
              <a href="/dashboard" className="text-purple underline">
                Dashboard
              </a>{" "}
              para gerenciar atendimentos.
            </p>
          </div>
        )}
      </section>
      <footer className="w-full py-4 bg-surface text-center text-xs text-color-secondary mt-12">
        &copy; {new Date().getFullYear()} MicroBot. Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
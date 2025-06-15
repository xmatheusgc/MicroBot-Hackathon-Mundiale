import { getUserRole } from "../../services/auth";

export default function Home() {
  const role = getUserRole();

  return (
    <section className="flex flex-col items-center justify-center h-full w-full px-4">
      <div className="bg-surface rounded-3xl shadow-2xl p-10 max-w-2xl w-full mt-12">
        <h1 className="font-bold text-4xl text-purple mb-4 text-center">
          Bem-vindo ao MicroBot!
        </h1>
        <p className="text-lg text-color mb-6 text-center">
          O assistente virtual oficial da Mundiale para facilitar o atendimento,
          suporte e comunicação.
        </p>
        <ul className="mb-6 text-color">
          <li>
            🤖 <b>Chat:</b> Converse com o MicroBot para tirar dúvidas sobre a
            Mundiale.
          </li>
          <li>
            📊 <b>Dashboard:</b> (Acesso restrito) Gerencie e acompanhe os
            atendimentos em tempo real.
          </li>
        </ul>
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
              <a href="/Dashboard" className="text-purple underline">
                Dashboard
              </a>{" "}
              para gerenciar atendimentos.
            </p>
          </div>
        )}
        <div className="mt-8 text-xs text-color-secondary text-center">
          <p>Desenvolvido para o Hackathon Mundiale • by LLMakers</p>
        </div>
      </div>
    </section>
  );
}

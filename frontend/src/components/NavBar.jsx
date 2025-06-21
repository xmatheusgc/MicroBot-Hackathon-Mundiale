import { useState } from "react";
import { CircleUserRound, Menu, X, Sun, Moon } from "lucide-react"; // adicione Sun e Moon
import { getUserRole } from "../services/auth";

export default function NavBar({ theme, toggleTheme, authChanged }) {
  const role = getUserRole();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <li className="nav-item"><a href="/">Inicio</a></li>
      {role === "usuario" && (
        <li className="nav-item"><a href="/chat">Chat</a></li>
      )}
      {(role === "admin" || role === "funcionario") && (
        <li className="nav-item"><a href="/Dashboard">Painel</a></li>
      )}
      {!role && (
        <>
          <li className="nav-item"><a href="/login">Entrar</a></li>
          <li className="nav-item"><a href="/register">Registre-se</a></li>
        </>
      )}
      {role && (
        <li className="nav-item">
          <button className="cursor-pointer" onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}>
            Sair
          </button>
        </li>
      )}
    </>
  );

  return (
    <nav className="flex justify-between mx-4 sm:mx-8 mt-6 items-center relative">
      <div>
        <h1 className="font-bold text-4xl">MicroBot</h1>
        <p className="text-xs">by <a href="" className="text-purple">LLMakers</a></p>
        <p className="mt-2 text-sm text-color-secondary">
          {role
            ? `Usuário logado (${role})`
            : "Usuário não autenticado"}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <ul className="nav-list flex gap-6 text-sm">
          {navLinks}
        </ul>
        <button
          onClick={toggleTheme}
          className="ml-2 p-2 rounded-full transition-colors cursor-pointer input-color-hover"
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun size={22} />
          ) : (
            <Moon size={22} />
          )}
        </button>
      </div>
      <div className="sm:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-surface rounded-2xl shadow-2xl p-6 z-[100] w-48 flex flex-col gap-2 sm:hidden">
          <ul className="flex flex-col gap-4 text-sm">
            {navLinks}
          </ul>
          <button
            onClick={toggleTheme}
            className="mt-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors self-start"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? (
              <Sun size={22} />
            ) : (
              <Moon size={22} />
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
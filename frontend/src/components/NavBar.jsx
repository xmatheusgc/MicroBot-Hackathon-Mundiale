import { useState } from "react";
import { CircleUserRound } from "lucide-react";
import { getUserRole } from "../services/auth";

export default function NavBar({ theme, toggleTheme, authChanged }) {
  const role = getUserRole();

  return (
    <nav className="flex justify-between mx-8 mt-6">
      <div>
        <h1 className="font-bold text-4xl">MicroBot</h1>
        <p className="text-xs">by <a href="" className="text-purple">LLMakers</a></p>
        <p className="mt-2 text-sm text-color-secondary">
          {role
            ? `Usuário logado (${role})`
            : "Usuário não autenticado"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <ul className="nav-list flex gap-6 text-sm">
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
        </ul>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            defaultChecked={theme === "dark"}
            onChange={toggleTheme}
          />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
        </label>
      </div>  
    </nav>
  );
}
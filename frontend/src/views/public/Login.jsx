import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        onLogin && onLogin();
        navigate("/"); // Redireciona para a Home
      } else {
        setError(data.detail || "Erro ao fazer login");
      }
    } catch {
      setError("Erro de conexão");
    }
  };

  return (
    <section className="flex flex-col justify-center align-center w-full h-full">
      <form onSubmit={handleLogin} className="flex flex-col justify-center gap-4 max-w-sm mx-auto p-12 bg-surface rounded-3xl shadow-2xl max-h-400px">
        <h1 className="font-bold text-4xl text-center mb-8">Login</h1>
        <div>
          <label htmlFor="username">Usuário</label>
          <input 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Usuário" 
            className="w-full p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"
          />
        </div>
        <div>
          <label htmlFor="password">Senha</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Senha" 
            className="w-full p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"
          />
        </div>
        <button 
          type="submit" 
          className="ml-2 px-5 py-3 bg-purple text-white font-semibold rounded-4xl hover:bg-[#555] cursor-pointer transition disabled:bg-gray-400 mt-8"
        >
          Entrar
        </button>
        {error && <div>{error}</div>}
        <div className="text-center mt-4">
          <p>Não tem uma conta? <a href="/Register" className="text-purple">Registrar</a></p>
        </div>
      </form>
    </section>
  );
}
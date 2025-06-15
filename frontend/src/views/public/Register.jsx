import { useState } from "react";
import { useNavigate } from "react-router-dom";

function validateEmail(email) {
  // Regex simples para validação de e-mail
  return /\S+@\S+\.\S+/.test(email);
}

export default function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("usuario");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateEmail(email)) {
      setError("E-mail inválido");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Usuário registrado com sucesso!");
        onRegister && onRegister();
        navigate("/login"); // Redireciona para login
      } else {
        setError(data.detail || "Erro ao registrar");
      }
    } catch {
      setError("Erro de conexão");
    }
  };

  return (
    <section className="flex flex-col justify-center align-center w-full h-full">
      <form onSubmit={handleRegister} className="flex flex-col justify-center gap-4 max-w-sm mx-auto p-12 bg-surface rounded-3xl shadow-2xl max-h-400px">
        <h1 className="font-bold text-4xl text-center mb-8">Register</h1>
        <div>
          <label htmlFor="username">Usuário</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuário" className="w-full p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"/>
        </div>
        <div>
          <label htmlFor="email">E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"/>
        </div>
        <div>
          <label htmlFor="password">Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="w-full p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"/>
        </div>
        <div>
          <label htmlFor="role">Cargo</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none">
            <option value="usuario">Usuário</option>
            <option value="funcionario">Funcionário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" className="ml-2 px-5 py-3 bg-purple text-white font-semibold rounded-4xl hover:bg-[#555] cursor-pointer transition disabled:bg-gray-400 mt-8">Registrar</button>
        {error && <div>{error}</div>}
        {success && <div>{success}</div>}

        <div className="text-center mt-4">
          <p>Já tem uma conta? <a href="/Login" className="text-purple">Entrar</a></p>
        </div>
      </form>
    </section>
  );
}
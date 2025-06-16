# 🤖 MicroBot – Copiloto de Atendimento com IA

MicroBot é um assistente de inteligência artificial que oferece suporte em tempo real ao atendente humano durante o atendimento ao cliente, além de permitir o autoatendimento para clientes finais.

## Funcionalidades

- **Chat Cliente:**  
  Interface para clientes conversarem com o MicroBot, com sugestões rápidas e envio de mensagens.

- **Painel do Funcionário/Admin:**  
  Visualização de todos os chats abertos, fixação de chats importantes, acompanhamento em tempo real e envio de respostas manuais.

- **IA Ligável/Desligável:**  
  Funcionário pode ativar ou desativar a IA para cada chat.

- **Histórico de Conversa:**  
  Todo o histórico do chat é salvo e pode ser consultado tanto pelo cliente quanto pelo funcionário/admin.

- **Avaliação de Atendimento:**  
  O cliente pode avaliar o atendimento ao finalizar o chat.

- **Estatísticas do Painel:**  
  Exibe número de chats abertos, resolvidos e iniciados nas últimas 24h.

- **Autenticação e Controle de Acesso:**  
  Cadastro, login e controle de acesso por papel (usuário, funcionário, admin).

- **Responsividade:**  
  Interfaces adaptadas para desktop e dispositivos móveis, com menu dropdown na navegação.

## Tecnologias

- **Backend:** Python, FastAPI, SQLAlchemy, Google Generative AI, JWT, SQLite
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Outros:** WebSockets, dotenv, email-validator

## Como rodar o projeto

### Backend

1. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```
2. Configure as variáveis de ambiente em `.env` (veja `.env.example`).
3. Inicie o servidor:
   ```
   uvicorn main:app --reload
   ```

### Frontend

1. Instale as dependências:
   ```
   npm install
   ```
2. Inicie o frontend:
   ```
   npm run dev
   ```

Acesse o frontend em [http://localhost:5173](http://localhost:5173).

---

Desenvolvido para o Hackathon Mundiale • by LLMakers

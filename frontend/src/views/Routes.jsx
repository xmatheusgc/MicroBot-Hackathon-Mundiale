import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ClientChat from "./ClientChat";
import App from "./App";

function Rotas() {
  const location = useLocation();
  const [, setBg] = useState(`url("")`);
  return (
    <>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<ClientChat />}></Route>
      </Routes>
    </>
  );
}

export default Rotas;
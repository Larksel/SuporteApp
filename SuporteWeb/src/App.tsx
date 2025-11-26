import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Importe a Navbar
import TicketList from "./pages/TicketList";
import TicketChat from "./pages/TicketChat";
import UserList from "./pages/UserList"; // Importe a nova tela

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar fixa no topo */}
        <Navbar />

        {/* Conteúdo das páginas */}
        <div className="pt-4">
          <Routes>
            <Route path="/" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketChat />} />
            <Route path="/users" element={<UserList />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

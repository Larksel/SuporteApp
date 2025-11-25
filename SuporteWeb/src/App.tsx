import { BrowserRouter, Routes, Route } from "react-router-dom";
import TicketList from "./pages/TicketList";
import TicketChat from "./pages/TicketChat";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TicketList />} />

        {/* Rota do Chat individual */}
        <Route path="/tickets/:id" element={<TicketChat />} />
      </Routes>
    </BrowserRouter>
  );
}

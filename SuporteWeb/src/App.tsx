import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TicketChat from "./pages/TicketChat";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tickets/1" replace />} />
        <Route path="/tickets/:id" element={<TicketChat />} />
      </Routes>
    </BrowserRouter>
  );
}

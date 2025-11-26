import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TicketList from "./pages/TicketList";
import TicketChat from "./pages/TicketChat";
import UserList from "./pages/UserList";
import NewTicket from "./pages/NewTicket";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div>
          <Routes>
            <Route path="/" element={<TicketList />} />
            <Route path="/tickets/new" element={<NewTicket />} />
            <Route path="/tickets/:id" element={<TicketChat />} />
            <Route path="/users" element={<UserList />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

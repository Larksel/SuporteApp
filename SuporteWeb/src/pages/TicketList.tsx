import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { type Ticket, TicketStatus } from "../types";
import API_URL from "../api";

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tickets`);
      console.log(response);
      setTickets(response.data);
    } catch (error) {
      console.error("Erro ao buscar tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/api/tickets/${id}/status`,
        Number(newStatus),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: Number(newStatus) } : t))
      );
    } catch (error) {
      console.error("Erro ao atualizar status", error);
      alert("Erro ao atualizar status!");
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.Open:
        return "bg-green-100 text-green-800";
      case TicketStatus.InProgress:
        return "bg-yellow-100 text-yellow-800";
      case TicketStatus.Resolved:
        return "bg-blue-100 text-blue-800";
      case TicketStatus.Closed:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.Open:
        return "Aberto";
      case TicketStatus.InProgress:
        return "Em Progresso";
      case TicketStatus.Resolved:
        return "Resolvido";
      case TicketStatus.Closed:
        return "Fechado";
      default:
        return "Desconhecido";
    }
  };

  if (loading) return <div className="p-10">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Painel de Suporte
          </h1>
          <Link
            to="/tickets/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
          >
            <span>+</span> Novo Ticket
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(ticket.createdAt || "").toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4 items-center">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Abrir Chat
                    </Link>

                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(ticket.id, e.target.value)
                      }
                      className="border-gray-300 text-sm rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={TicketStatus.Open}>Aberto</option>
                      <option value={TicketStatus.InProgress}>
                        Em Andamento
                      </option>
                      <option value={TicketStatus.Resolved}>Resolvido</option>
                      <option value={TicketStatus.Closed}>Fechado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

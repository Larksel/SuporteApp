import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import axios from "axios";
import { TicketStatus, type Message, type Ticket, type User } from "../types";
import API_URL from "../api";
import { CURRENT_USER_ID } from "../constants";

export default function TicketChat() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(CURRENT_USER_ID);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const ticketRes = await axios.get(`${API_URL}/api/tickets/${id}`);
        setTicket(ticketRes.data);

        const historyRes = await axios.get(
          `${API_URL}/api/tickets/${id}/messages`
        );
        setMessages(historyRes.data);
        const usersRes = await axios.get(`${API_URL}/api/users`);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    const setupConnection = () => {
      const hubUrl = process.env.NODE_ENV === 'production' 
        ? '/hubs/chat'
        : `${API_URL}/hubs/chat`;
      
      const newConnection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      setConnection(newConnection);
    };

    setupConnection();
  }, []);

  useEffect(() => {
    if (connection) {
      const handleReceiveMessage = (
        senderId: number,
        senderName: string,
        content: string,
        sentAt: string
      ) => {
        const newMessage: Message = { content, senderId, senderName, sentAt };
        setMessages((prev) => [...prev, newMessage]);
      };

      connection
        .start()
        .then(() => {
          console.log("Conectado ao SignalR!");
          connection.invoke("JoinTicketGroup", id);
        })
        .catch((err) => console.error("Erro de conexão SignalR:", err));

      connection.on("ReceiveMessage", handleReceiveMessage);

      return () => {
        connection.off("ReceiveMessage", handleReceiveMessage);
        connection.stop();
      };
    }
  }, [connection, id]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !connection) return;

    try {
      await connection.invoke(
        "SendMessage",
        Number(id),
        currentUserId,
        inputText
      );
      setInputText("");
    } catch (err) {
      console.error("Falha ao enviar", err);
    }
  };

  if (!ticket) return <div className="p-10">Carregando...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Seletor de Usuário */}
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <label className="block text-xs font-bold text-indigo-800 mb-1">
            Simular Login Como:
          </label>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(Number(e.target.value))}
            className="w-full text-sm border-indigo-200 rounded text-indigo-900 focus:ring-indigo-500"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 0 ? "Cliente" : "Técnico"})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-indigo-600 mt-1">
            *Troque aqui para falar como outra pessoa.
          </p>
        </div>

        {/* Detalhes do Ticket */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Ticket #{ticket.id}
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold">
                Assunto
              </span>
              <p className="text-gray-800 font-medium">{ticket.title}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold">
                Descrição
              </span>
              <p className="text-gray-600 text-sm">{ticket.description}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold">
                Status
              </span>
              <span
                className={`ml-2 px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700 ${getStatusColor(
                  ticket.status
                )}`}
              >
                {getStatusLabel(ticket.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {" "}
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10">
          <h3 className="font-semibold text-gray-700">Histórico da Conversa</h3>
          <span className="text-xs text-gray-400">Tempo Real</span>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;

            return (
              <div
                key={index}
                className={`flex w-full ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex flex-col max-w-[75%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {!isMe && (
                    <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`
                    px-4 py-2 rounded-2xl shadow-sm text-sm wrap-break-word relative
                    ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }
                  `}
                  >
                    {msg.content}
                  </div>

                  <span className="text-[10px] text-gray-400 mt-1 mx-1">
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
              placeholder={`Mensagem como usuário #${currentUserId}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

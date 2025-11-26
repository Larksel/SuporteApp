import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import axios from "axios";
import type { Message, Ticket } from "../types";
import API_URL from "../api";

// SIMULAÇÃO: Usuário logado (João)
const CURRENT_USER_ID = 1;

export default function TicketChat() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar os dados
  useEffect(() => {
    async function fetchData() {
      try {
        const ticketRes = await axios.get(`${API_URL}/api/tickets/${id}`);
        setTicket(ticketRes.data);

        const historyRes = await axios.get(
          `${API_URL}/api/tickets/${id}/messages`
        );
        setMessages(historyRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    }
    fetchData();
  }, [id]);

  // Configurando SignalR (WebSocket)
  useEffect(() => {
    const setupConnection = () => {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/chat`) // Rota que definimos no Program.cs
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      setConnection(newConnection);
    };

    setupConnection();
  }, []);

  // 3. Iniciar Conexão e Definir Eventos
  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Conectado ao SignalR!");
          // Entrar no grupo do Ticket específico
          connection.invoke("JoinTicketGroup", id);
        })
        .catch((err) => console.error("Erro de conexão SignalR:", err));

      // OUVINTE: Quando o servidor manda "ReceiveMessage"
      connection.on(
        "ReceiveMessage",
        (senderId: number, content: string, sentAt: string) => {
          const newMessage: Message = {
            content,
            senderId,
            sentAt,
            // Nota: O nome poderia vir do back, ou buscamos de uma lista local.
            // Para simplificar, deixamos sem nome ou tratamos na UI.
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      );

      return () => {
        connection.stop();
      };
    }
  }, [connection, id]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enviar Mensagem
  const handleSendMessage = async () => {
    if (!inputText.trim() || !connection) return;

    try {
      // Chama o método "SendMessage" no Backend (SupportHub.cs)
      await connection.invoke(
        "SendMessage",
        Number(id),
        CURRENT_USER_ID,
        inputText
      );
      setInputText("");
    } catch (err) {
      console.error("Falha ao enviar", err);
    }
  };

  if (!ticket) return <div className="p-10">Carregando ticket...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Detalhes do Ticket */}
      <div className="w-1/4 bg-white p-6 border-r border-gray-200">
        <h2 className="text-xl font-bold mb-4">Ticket #{ticket.id}</h2>
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase font-bold">
            Assunto
          </span>
          <p className="text-gray-800 font-medium">{ticket.title}</p>
        </div>
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase font-bold">
            Descrição
          </span>
          <p className="text-gray-600 text-sm">{ticket.description}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase font-bold">
            Cliente
          </span>
          <p className="text-gray-800">{ticket.clientName}</p>
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {/* Lista de Mensagens */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === CURRENT_USER_ID;
            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg shadow ${
                    isMe ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`text-xs block mt-1 ${
                      isMe ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
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

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

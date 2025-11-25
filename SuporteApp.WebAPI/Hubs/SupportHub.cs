using Microsoft.AspNetCore.SignalR;
using SuporteApp.WebAPI.Data;
using SuporteApp.WebAPI.Objects.Models;

namespace SuporteApp.WebAPI.Hubs;

public class SupportHub : Hub
{
    private readonly AppDbContext _context;

    public SupportHub(AppDbContext context)
    {
        _context = context;
    }

    // Entrar no chat de um ticket específico
    public async Task JoinTicketGroup(string ticketId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, ticketId);
    }

    // Sair do chat
    public async Task LeaveTicketGroup(string ticketId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, ticketId);
    }

    // Enviar mensagem
    public async Task SendMessage(int ticketId, int senderId, string messageContent)
    {
        var newMessage = new Message
        {
            TicketId = ticketId,
            SenderId = senderId,
            Content = messageContent,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(newMessage);

        await _context.SaveChangesAsync();

        await Clients.Group(ticketId.ToString())
            .SendAsync("ReceiveMessage", senderId, messageContent, newMessage.SentAt);
    }
}
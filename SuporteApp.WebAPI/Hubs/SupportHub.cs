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

    public async Task JoinTicketGroup(string ticketId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, ticketId);
    }

    public async Task LeaveTicketGroup(string ticketId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, ticketId);
    }

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

        var sender = await _context.Users.FindAsync(senderId);
        string senderName = sender?.Name ?? "Desconhecido";

        await Clients.Group(ticketId.ToString())
            .SendAsync("ReceiveMessage", senderId, senderName, messageContent, newMessage.SentAt);
    }
}
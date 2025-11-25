using Microsoft.AspNetCore.SignalR;

namespace SuporteApp.WebAPI;

public class SupportHub : Hub
{
    public async Task SendMessage(string user, string message, string ticketId)
    {
        // Salvar no banco de dados aqui antes de enviar
        await Clients.Group(ticketId).SendAsync("ReceiveMessage", user, message);
    }

    public async Task JoinTicketGroup(string ticketId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, ticketId);
    }
}


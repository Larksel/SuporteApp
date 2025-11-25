using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuporteApp.WebAPI.Data;
using SuporteApp.WebAPI.Objects.Models;

namespace SuporteAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TicketController : ControllerBase
{
    private readonly AppDbContext _context;

    public TicketController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> CreateTicket(Ticket ticket)
    {
        // Garante que a data de criação é agora
        ticket.CreatedAt = DateTime.UtcNow;

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Ticket>> GetTicket(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Client)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null) return NotFound();

        return Ok(new
        {
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Status,
            ClientName = ticket.Client?.Name,
            ticket.TechnicianId
        });
    }

    // Carrega o histórico do chat ao abrir a tela
    [HttpGet("{id}/messages")]
    public async Task<ActionResult<IEnumerable<Message>>> GetTicketMessages(int id)
    {
        var messages = await _context.Messages
            .Where(m => m.TicketId == id)
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                m.Id,
                m.Content,
                m.SentAt,
                m.SenderId,
                SenderName = m.Sender.Name
            })
            .ToListAsync();

        return Ok(messages);
    }
}

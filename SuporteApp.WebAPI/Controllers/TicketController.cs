using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuporteApp.WebAPI.Data;
using SuporteApp.WebAPI.Objects.Enums;
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetTickets()
    {
        var tickets = await _context.Tickets
            .Include(t => t.Client)
            .Include(t => t.Technician)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.Status,
                t.CreatedAt,
                ClientName = t.Client.Name,
                TechnicianName = t.Technician != null ? t.Technician.Name : "Não atribuído"
            })
            .ToListAsync();

        return Ok(tickets);
    }

    // PUT: api/tickets/{id}/status
    // Atualiza apenas o status (ex: de Aberto para Resolvido)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateTicketStatus(int id, [FromBody] TicketStatus newStatus)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound();

        ticket.Status = newStatus;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
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

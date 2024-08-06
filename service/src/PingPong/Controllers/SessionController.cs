using Microsoft.AspNetCore.Mvc;
using PingPong.Models.Session;
using PingPong.Services;
using PingPong.Services.DTO;

namespace PingPong.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SessionController : ControllerBase
    {
        private readonly SessionService _sessionService;

        public SessionController(SessionService sessionService)
        {
            _sessionService = sessionService;
        }

        [HttpPost(nameof(CreateSession))]
        public Session CreateSession(CreateSessionDTO createDTO)
        {
            var result = _sessionService.CreateSession(createDTO);
            return result;
        }

        [HttpGet(nameof(GetAllSessions))]
        public ActionResult<List<SessionDTO>> GetAllSessions()
        {
            return Ok(_sessionService.GetAllSessions());
        }

        [HttpGet(nameof(GetSessionById) + "/{sessionId}")]
        public ActionResult<List<SessionDTO>> GetSessionById(Guid sessionId)
        {
            return Ok(_sessionService.GetSessionById(sessionId));
        }

        [HttpPost(nameof(Startgame))]
        public Session Startgame(SessionDTO sessionItem)
        {
            var updatedSession = _sessionService.StartGame(sessionItem);
            return updatedSession;
        }

        [HttpPost(nameof(EndGame))]
        public IActionResult EndGame(SessionDTO sessionId)
        {
            var result = _sessionService.EndGame(sessionId);
            if (result)
            {
                return Ok();
            }
            return NotFound();
        }
    }
}
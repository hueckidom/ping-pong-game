using Microsoft.AspNetCore.Mvc;
using PingPong.Services.PlayerService;
using PingPong.Services.PlayerService.DTOs;

namespace PingPong.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayerController : ControllerBase
    {
        private readonly PlayerService _playerService;

        public PlayerController(PlayerService playerService)
        {
            _playerService = playerService;
        }

        [HttpPost("JoinRoom/{sessionId}")]
        public async Task<IActionResult> JoinRoom([FromBody] CreatePlayerDTO createPlayerDTO, Guid sessionId)
        {
            var playerDTO = _playerService.JoinRoom(createPlayerDTO, sessionId);
            return Ok(playerDTO);
        }
    }
}
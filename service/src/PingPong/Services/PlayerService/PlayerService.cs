using PingPong.Models;
using PingPong.Repositories.Player;
using PingPong.Services.PlayerService.DTOs;

namespace PingPong.Services.PlayerService
{
    public class PlayerService
    {
        private readonly IPlayerRepository _playerRepository;
        private readonly SessionService _sessionService;

        public PlayerService(IPlayerRepository playerRepository, SessionService sessionService)
        {
            _playerRepository = playerRepository;
            _sessionService = sessionService;
        }

        public PlayerDTO JoinRoom(CreatePlayerDTO createDTO, Guid sessionId)
        {
            var newPlayer = new PlayerDTO
            {
                Id = Guid.NewGuid(),
                Name = createDTO.Playername,
                SessionId = sessionId
            };

            var addedPlayer = _playerRepository.CreatePlayer(newPlayer);

            _sessionService.AddPlayerToSession(addedPlayer);
            return addedPlayer;
        }
    }
}
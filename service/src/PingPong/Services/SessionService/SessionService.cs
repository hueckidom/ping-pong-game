using PingPong.Models;
using PingPong.Models.Session;
using PingPong.Repositories;
using PingPong.Repositories.Player;
using PingPong.Services.DTO;


namespace PingPong.Services
{
    public class SessionService
    {
        private readonly IPlayerRepository _playerRepository;
        private readonly ISessionRepository _sessionRepository;

        public SessionService(IPlayerRepository playerRepository, ISessionRepository sessionRepository)
        {
            _playerRepository = playerRepository;
            _sessionRepository = sessionRepository;
        }

        public Session CreateSession(CreateSessionDTO createDTO)
        {
            var newSession = _sessionRepository.AddNewSession(createDTO);

            var newOrganisator = _playerRepository.AddOrganisator(createDTO.Name, newSession.SessionId);
            newSession.Players.Add(newOrganisator);
            return newSession;

        }

        public Session AddPlayerToSession(PlayerDTO player)
        {
            var session = _sessionRepository.GetSessionById(player.SessionId);
            session.Players.Add(player);
            return session;
        }

        public List<Session> GetAllSessions()
        {
            return _sessionRepository.GetAllSessions();
        }

        public Session GetSessionById(Guid sessionId)
        {
            return _sessionRepository.GetSessionById(sessionId);
        }

        public Session StartGame(SessionDTO sessionId)
        {
            return _sessionRepository.StartGame(sessionId);
        }

        public bool EndGame(SessionDTO sessionId)
        {
            return _sessionRepository.EndGame(sessionId);
        }
    }
}
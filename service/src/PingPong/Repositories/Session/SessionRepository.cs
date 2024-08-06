using Microsoft.AspNetCore.Http;
using PingPong.Models;
using PingPong.Models.Session;
using PingPong.Services.DTO;

namespace PingPong.Repositories
{
    public class SessionRepository : ISessionRepository
    {
        private static List<Session> Sessions = new();

        public Session AddNewSession(CreateSessionDTO createDTO)
        {
            var newSession = new Session
            {
                SessionId = Guid.Empty,
                Players = new List<PlayerDTO>()
            };

            newSession.SessionId = Guid.NewGuid();

            Sessions.Add(newSession);

            return newSession;
        }

        public List<Session> GetAllSessions()
        {
            return Sessions;
        }

        public Session GetSessionById(Guid id)
        {
            var session = Sessions.Find(x => x.SessionId == id);
            if (session == null)
            {
                throw new InvalidOperationException("Nicht gefunden");
            }
            return session;
        }

        public Session StartGame(SessionDTO sessionId)
        {
            var session = Sessions.Find(x => x.SessionId == sessionId.SessionId);
            session.IsSessionRunning = true;
            return session;
        }

        public bool EndGame(SessionDTO sessionId) 
        {
            var session = Sessions.Find(x => x.SessionId == sessionId.SessionId);
            if(session == null)
            {
                return false;   
            }

            Sessions.Remove(session);
            return true;
        }
    }
}
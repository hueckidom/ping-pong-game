using PingPong.Models.Session;
using PingPong.Services.DTO;

namespace PingPong.Repositories
{
    public interface ISessionRepository
    {
        List<Session>? GetAllSessions();

        Session AddNewSession(CreateSessionDTO session);

        Session GetSessionById(Guid id);

        Session StartGame(SessionDTO isSessionRunning);

        bool EndGame(SessionDTO isSessionRunning);
    }
}
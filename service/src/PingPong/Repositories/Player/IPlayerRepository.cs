using PingPong.Models;

namespace PingPong.Repositories.Player
{
    public interface IPlayerRepository
    {
        PlayerDTO AddOrganisator(string organisatorName, Guid sessionId);

        PlayerDTO CreatePlayer(PlayerDTO player);
    }
}
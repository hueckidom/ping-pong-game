using PingPong.Models;

namespace PingPong.Repositories.Player
{
    public class PlayerRepository : IPlayerRepository
    {
        private static List<PlayerDTO> Players = new()
        {
        };

        public PlayerDTO CreatePlayer(PlayerDTO player)
        {
            Players.Add(player);
            return player;
        }

        public PlayerDTO AddOrganisator(string organisatorName, Guid sessionId)
        {
            var newPlayer = new PlayerDTO
            {
                Id = Guid.NewGuid(),
                Name = organisatorName,
                SessionId = sessionId
            };

            Players.Add(newPlayer);

            return newPlayer;
        }
    }
}
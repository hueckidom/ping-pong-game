

namespace PingPong.Models.Session
{
    public class Session
    {
        public Guid SessionId { get; set; }

        public List<PlayerDTO> Players { get; set; } = new List<PlayerDTO>();

        public bool IsSessionRunning { get; set; } = false;
    }
}
namespace PingPong.Models
{
    public class PlayerDTO
    {
        public Guid SessionId { get; set; }
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public int Score { get; set; }
    }
}
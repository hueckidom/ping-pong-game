namespace PingPong.Models.PlayerIngameModel
{
    public class PlayerPosition
    {
        public Guid PlayerId { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class PlayerSize
    {
        public Guid PlayerId { get; set; }
        public double Height { get; set; }
        public double Width { get; set; }
    }
}

namespace PingPong.Services.PlayerService.DTOs
{
    public class CreatePlayerDTO
    {
        //DTO = Data Transfer Object, unnötige Daten zu vermeiden
        public string Playername { get; set; } = string.Empty;
    }
}
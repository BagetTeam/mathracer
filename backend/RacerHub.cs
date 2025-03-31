using System.Text.Json;
using Microsoft.AspNetCore.SignalR;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    public async Task JoinLobby(string gameId, string name)
    {
        Player currentPlayer = new Player(name);

        if (!lobbies.ContainsKey(gameId))
        {
            lobbies.Add(gameId, new Dictionary<int, Player>());
            currentPlayer.isHost = true;
        }

        Dictionary<int, Player> lobby = lobbies[gameId];

        currentPlayer.id = lobby.Count + 1;

        lobby.Add(currentPlayer.id, currentPlayer);

        string json = JsonSerializer.Serialize(lobby.Values);
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        await Clients.Groups(gameId).SendAsync("NewPlayer", json);

        System.Console.WriteLine("[{0}]", string.Join(", ", lobbies.Keys));
        System.Console.WriteLine("[{0}]", string.Join(", ", lobby.Values));
    }
}

public class Player
{
    public int id { get; set; }
    public int progress { get; set; }
    public int score { get; set; }
    public bool isHost { get; set; }
    public string name { get; set; }

    public Player(string name)
    {
        id = 0;
        progress = 0;
        score = 0;
        isHost = false;
        this.name = name;
    }
}

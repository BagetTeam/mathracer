using System.Text.Json;
using Microsoft.AspNetCore.SignalR;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    public async void syncPlayers(string gameId)
    {
        Dictionary<int, Player> lobby = lobbies[gameId];
        string json = JsonSerializer.Serialize(lobby.Values);
        await Clients.Groups(gameId).SendAsync("SyncPlayers", json);
    }

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

        while (lobby.ContainsKey(currentPlayer.id))
        {
            currentPlayer.id = lobby.Count + 1;
        }

        lobby.Add(currentPlayer.id, currentPlayer);

        await Clients
            .Client(Context.ConnectionId)
            .SendAsync("AddUnloadEvenListener", JsonSerializer.Serialize(currentPlayer));

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        syncPlayers(gameId);
    }

    public void RemovePlayer(string gameId, int id)
    {
        if (!lobbies.ContainsKey(gameId))
        {
            return;
        }

        var lobby = lobbies[gameId];
        Player p = lobby[id];
        lobby.Remove(id);
        if (lobby.Count == 0)
        {
            lobbies.Remove(gameId);
        }

        // TODO: change host if host leaves
        // if (p.isHost) {}

        syncPlayers(gameId);
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

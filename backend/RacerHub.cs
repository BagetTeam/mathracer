using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    private static Dictionary<string, Game> games = new Dictionary<string, Game>();

    private async void syncPlayers(string gameId)
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
            .SendAsync("AddUnloadEventListener", JsonSerializer.Serialize(currentPlayer));

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        syncPlayers(gameId);

        System.Console.WriteLine("[{0}]", string.Join(", ", lobbies.Keys));
    }

    public async void RemovePlayer(string gameId, int id)
    {
        if (!lobbies.ContainsKey(gameId))
        {
            return;
        }

        var lobby = lobbies[gameId];

        if (!lobby.ContainsKey(id))
        {
            return;
        }

        Player p = lobby[id];
        lobby.Remove(id);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);

        if (lobby.Count == 0)
        {
            lobbies.Remove(gameId);
            return;
        }

        // TODO: change host if host leaves
        // if (p.isHost) {}

        syncPlayers(gameId);
    }

    public void StartGame(string gameId, string mode)
    {
        GameMode selectedMode = JsonSerializer.Deserialize<GameMode>(mode)!;
        GenerateEquations(gameId, selectedMode.type, selectedMode.count);
    }

    public void GenerateEquations(string gameId, string mode, int count)
    {
        Equation[] equations = Equation.GenerateAllEquations(count);
        Game game = new Game(gameId, equations, new GameMode(mode, count));
        games.Add(gameId, game);
    }
}


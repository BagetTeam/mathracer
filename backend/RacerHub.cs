using System.Collections.Concurrent;
using System.Text.Json;
using System.Timers;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    private static ConcurrentDictionary<string, System.Timers.Timer> timers = new();

    private static Dictionary<string, Game> games = new Dictionary<string, Game>();

    private async void syncPlayers(string gameId)
    {
        Dictionary<int, Player> lobby = lobbies[gameId];
        string json = JsonSerializer.Serialize(lobby.Values);
        await Clients.Groups(gameId).SendAsync("SyncPlayers", json);

        System.Console.WriteLine("[{0}]", string.Join(", ", lobbies[gameId].Keys));
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

    public async Task StartGame(string gameId, string mode)
    {
        GameMode selectedMode = JsonSerializer.Deserialize<GameMode>(mode)!;
        Equation[] equations = Equation.GenerateAllEquations(selectedMode.count);

        await Clients.Groups(gameId).SendAsync("GameStart", JsonSerializer.Serialize(equations));

        System.Timers.Timer timer = new System.Timers.Timer(1000);
        System.Console.WriteLine("GameStart");

        int counter = 3;

        timer.Elapsed += async (Object source, ElapsedEventArgs e) =>
        {
            await Clients.Groups(gameId).SendAsync("CountDown", counter);
            System.Console.WriteLine("Seconds pased {0}", counter);
            counter--;
        };
        timer.AutoReset = true;
        timer.Start();
    }
}


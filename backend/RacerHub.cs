using System.Text.Json;
using equation;
using Microsoft.AspNetCore.SignalR;
using models;

namespace hub;

public class RacerHub : Hub
{
    private static Dictionary<string, Dictionary<int, Player>> lobbies =
        new Dictionary<string, Dictionary<int, Player>>();

    private static Dictionary<string, System.Timers.Timer> timers = new();

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
        Console.WriteLine(selectedMode.count);
        Equation[] equations = Equation.GenerateAllEquations(selectedMode.count);

        await Clients
            .Groups(gameId)
            .SendAsync("StartCountdown", JsonSerializer.Serialize(equations));

        System.Console.WriteLine("Start Countdown");

        int count = 3;
        DateTime now = DateTime.Now;
        int elapsed = 1;
        while (count >= 0)
        {
            if (elapsed >= 1)
            {
                await Clients.Groups(gameId).SendAsync("CountDown", count);
                System.Console.WriteLine("Seconds pased {0}", count);
                elapsed = 0;
                now = DateTime.Now;
                count--;
            }

            elapsed = (DateTime.Now - now).Seconds;
        }

        System.Console.WriteLine("Game started!!");
        await Clients.Groups(gameId).SendAsync("GameStart");

        int time = 0;
        elapsed = 0;
        bool run = true;
        while (run)
        {
            if (elapsed >= 1)
            {
                time++;
                await Clients.Groups(gameId).SendAsync("TimeElapsed", time);
                System.Console.WriteLine("{0} Seconds passed", time);
                elapsed = 0;
                now = DateTime.Now;
            }

            elapsed = (DateTime.Now - now).Seconds;

            if (selectedMode.type == "time" && time > selectedMode.count)
            {
                run = false;
            }
        }
    }
}

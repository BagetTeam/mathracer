using System.Text.Json;
using Microsoft.AspNetCore.SignalR;

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
        if (lobby.Count == 0)
        {
            lobbies.Remove(gameId);
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);

        // TODO: change host if host leaves
        // if (p.isHost) {}

        syncPlayers(gameId);
    }

    private int GetRandomInt(int min, int max)
    {
        Random random = new Random();
        return random.Next(min, max + 1);
    }

    private int GenerateId()
    {
        return 0; //TODO
    }

    private Equation GenerateAddition()
    {
        int num1 = GetRandomInt(1, 20);
        int num2 = GetRandomInt(1, 20);
        return new Equation(GenerateId(), $"{num1} + {num2} = ?", num1 + num2);
    }

    private Equation GenerateSubtraction()
    {
        int answer = GetRandomInt(1, 20);
        int num2 = GetRandomInt(1, 10);
        int num1 = answer + num2;
        return new Equation(GenerateId(), $"{num1} - {num2} = ?", answer);
    }

    private Equation GenerateMultiplication()
    {
        int num1 = GetRandomInt(1, 12);
        int num2 = GetRandomInt(1, 12);
        return new Equation(GenerateId(), $"{num1} × {num2} = ?", num1 * num2);
    }

    private Equation GenerateDivision()
    {
        int answer = GetRandomInt(1, 10);
        int num2 = GetRandomInt(1, 10);
        int num1 = answer * num2;
        return new Equation(GenerateId(), $"{num1} ÷ {num2} = ?", answer);
    }

    private Equation GenerateEquation()
    {
        int operationType = GetRandomInt(1, 5);
        switch (operationType)
        {
            case 1:
                return GenerateAddition();
            case 2:
                return GenerateSubtraction();
            case 3:
                return GenerateMultiplication();
            case 4:
                return GenerateDivision();
            default:
                return GenerateAddition();
        }
    }

    public Equation[] GenerateAllEquations(int count)
    {
        Equation[] equations = new Equation[count];
        for (int i = 0; i < count; i++)
        {
            equations[i] = GenerateEquation();
        }
        return equations;
    }

    public void GenerateEquations(string gameId, string mode, int count)
    {
        Equation[] equations = GenerateAllEquations(count);
        Game game = new Game(gameId, equations, new GameMode(mode, count));
        games.Add(gameId, game);
    }

    public void StartGame(string gameId, string mode)
    {
        GameMode selectedMode = JsonSerializer.Deserialize<GameMode>(mode)!;
        GenerateEquations(gameId, selectedMode.type, selectedMode.count);
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

public class GameMode
{
    public string type { get; set; }
    public int count { get; set; }

    public GameMode()
    {
        this.type = "time";
        this.count = 100;
    }

    public GameMode(string type, int count)
    {
        this.type = type;
        this.count = count;
    }
}

public class Equation
{
    public int id { get; set; }
    public string equation { get; set; }
    public int answer { get; set; }

    public Equation(int id, string equation, int answer)
    {
        this.id = id;
        this.equation = equation;
        this.answer = answer;
    }
}

public class Game
{
    public string id { get; set; }
    public GameMode gameMode { get; set; }
    public Equation[] equations { get; set; }

    public Game(string id, Equation[] eq, GameMode gameMode)
    {
        this.id = id;
        this.gameMode = gameMode;
        this.equations = eq;
    }
}


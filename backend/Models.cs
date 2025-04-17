using equation;

namespace models;

public class Player
{
    public int id { get; set; }
    public int progress { get; set; }
    public int score { get; set; }
    public bool isHost { get; set; }
    public string name { get; set; }

    public bool hasComplete { get; set; }

    public Player(string name)
    {
        id = 0;
        progress = 0;
        score = 0;
        isHost = false;
        this.name = name;
        hasComplete = true;
    }
}

public class GameMode
{
    public string type { get; set; }
    public int count { get; set; }

    public GameMode()
    {
        this.type = "time";
        this.count = 10;
    }

    public GameMode(string type, int count)
    {
        this.type = type;
        this.count = count;
    }
}

public class PublicGame
{
    public string id { get; set; }
    public string hostName { get; set; }
    public int numPlayers {get; set; }
    public GameMode gameMode { get; set; }

    public PublicGame(string id,  string hostName, int numPlayers, GameMode gameMode)
    {
        this.id = id;
        this.gameMode = gameMode;
        this.hostName = hostName;
        this.numPlayers = numPlayers;
    }
}

public class Lobby
{
    public Dictionary<int, Player> players { get; set; }
    public GameMode gameMode { get; set; }

    public bool isPublic {get; set;}

    public Lobby()
    {
        players = new Dictionary<int, Player>();
        gameMode = new GameMode();
        isPublic = false;
    }

    public Lobby(string mode, int count)
    {
        players = new Dictionary<int, Player>();
        gameMode = new GameMode(mode, count);
        isPublic = false;
    }
}

using Microsoft.AspNetCore.SignalR;

namespace hub;

public class RacerHub : Hub
{
    public async Task NewMessege(long username, string message) =>
        await Clients.All.SendAsync("messageReceived", username, message);

    public async Task createLobby(string lobbyID) {
        //await 
    }
}

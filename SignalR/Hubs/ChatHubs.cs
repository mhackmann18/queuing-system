using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;

namespace SignalR.Hubs;

public class ChatHub : Hub
{
    public async Task NewMessage(string username, string message) {
        Debug.WriteLine($"New message from {username}: {message}");
        await Clients.All.SendAsync("messageReceived", username, message);
    }
}

using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class PresenceHub : Hub
    {
        //It is not scalable. This works only with 1 server. With more servers we need Redis.
        //It is possible to store the state in the Database, but it is bad approach.
        //We store the state in the server, with a dict.
        //services.AddSingleton<PresenceTracker>(); in ApplicationServicesExtensions. The dict is not be destroyed.
        private readonly PresenceTracker _tracker;

        public PresenceHub(PresenceTracker tracker)
        {
            _tracker = tracker;
        }
        public override async Task OnConnectedAsync()
        {
            var isOnline = await _tracker.UserConnected(Context.User.GetUsername(), Context.ConnectionId);
            if(isOnline)
                await Clients.Others.SendAsync("UserIsOnline", Context.User.GetUsername());

            var currentUsers = await _tracker.GetOnlineUsers();
            await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var isOfline = await _tracker.UserDisconnected(Context.User.GetUsername(), Context.ConnectionId);

            if (isOfline)
                await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUsername());

            await base.OnDisconnectedAsync(exception);
        }
    }
}
import * as signalR from "@microsoft/signalr";

export async function newConnection() {
  const c = new signalR.HubConnectionBuilder()
    .withUrl("https://mathracer.onrender.com/hub")
    .build();

  await c.start();
  return c;
}

export async function withConnection(
  f: (arg: signalR.HubConnection) => Promise<void>,
) {
  const c = new signalR.HubConnectionBuilder()
    .withUrl("https://mathracer.onrender.com/hub")
    .build();

  await c.start();
  await f(c);
  await c.stop();
}

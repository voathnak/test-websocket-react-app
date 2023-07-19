import asyncio
import websockets


async def echo(websocket):
    async for message in websocket:
        print(f"websocket message: {message}")
        await websocket.send(f"this is your sent message: <<{message}>>")


async def main():
    async with websockets.serve(echo, "localhost", 8765):
        await asyncio.Future()  # run forever


asyncio.run(main())

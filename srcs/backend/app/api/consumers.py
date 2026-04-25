from channels.generic.websocket import AsyncWebsocketConsumer

# mockup consumer for websocket connections (will expanded it later)
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass
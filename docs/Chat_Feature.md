# Marketplace Real-Time Chat Architecture (Django + Channels)

## Executive Summary (One-Pager)
Scalable WebSocket chat for marketplace listings—**one conversation per buyer-listing**—boosting conversions 20-30% via instant messaging.[web:4]

**Core Flow**: React → Nginx → Daphne → Channels → Redis → Clients (MySQL persists).

![Django WebSockets](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*5w8vfu6YJSbiWIby6mu_4A.png)

**Components**:
| Tool       | Role                              |
|------------|-----------------------------------|
| Django Channels | WS consumers/groups/rooms |
| Daphne     | ASGI server (HTTP+WS)            |
| Redis      | Pub/sub broker (scaling)         |
| MySQL      | Message storage/history          |
| Nginx      | Proxy/load balancer (wss://)     |

**MVP**: InMemory (no Redis). **Prod**: Redis + multi-Daphne (1000+ users).

**Status**: [ ] Models [ ] Consumer [ ] React [ ] Docker. Next: Auth/notifications.

---

## Overview

This document describes a **scalable real-time chat system for our
marketplace ** where buyers and sellers can communicate directly
about listings.

The architecture ideally will supports:

-   Persistent chat history
-   Real-time messaging
-   Scalable WebSocket infrastructure (with redis)
-   Secure authenticated communication
-   Typing indicators and online presence
-   Role-based access control

Typical platforms using similar patterns include marketplace systems
like OLX, Vinted, and Airbnb.

------------------------------------------------------------------------

# Core Concept: Conversation per Listing

Instead of creating arbitrary chat rooms, conversations are **bound to a
listing and a buyer**.

Rule:

> One buyer can have only one conversation with the seller for each
> listing.

Example:

  Buyer     Seller   Listing   Conversation
  --------- -------- --------- --------------
  Alice     Bob      Bike      chat_1
  Charlie   Bob      Bike      chat_2
  Alice     Bob      Guitar    chat_3

Advantages:

-   Prevents duplicate chats
-   Keeps conversations contextual
-   Simplifies moderation
-   Simplifies UI navigation

------------------------------------------------------------------------

# Technology Stack

## Backend

-   Django
-   Django Channels
-   ASGI
-   Daphne (ASGI server)
-   Redis (message broker -- for scalling up)
-   MySQL (persistent database storage)
-   Dataserver (or Django ORM)
-   JWT or other token-based authentication

## Frontend

-   React
-   WebSocket API
-   JWT authentication
-   Responsive UI

------------------------------------------------------------------------

# Infrastructure Architecture

    Browser
       │
       │ HTTP (API requests)
       │ WebSocket (chat)
       ▼
    Nginx (reverse proxy / gateway)
       │
       ├── HTTP → Django REST API
       │
       └── WebSocket → Daphne
                          │
                          ▼
                    Django Channels
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
          Redis              Django ORM / DataService
     (message distribution)          Database
                                  (MySQL/Postgres)

Responsibilities:

  Component   Role
  ----------- --------------------------------------------
  Nginx       Routes HTTP and WebSocket traffic
  Django      Marketplace API and business logic
  Channels    Handles WebSocket connections
  Redis       Message broker for real-time communication
  Database    Stores conversations and messages

------------------------------------------------------------------------

# Backend Architecture

## WebSocket Integration

The system uses **Django Channels** to support WebSocket communication.

Channels introduces the concept of **Consumers**, similar to Django
views but designed for asynchronous communication.

Example WebSocket route:

    ws/chat/<conversation_id>/

Example group name:

    chat_<conversation_id>

Users connected to the same conversation subscribe to the same channel
group.

------------------------------------------------------------------------

## Redis Message Broker

Redis enables communication between different server processes.

Without Redis:

    User A → Worker 1
    User B → Worker 2

Workers cannot communicate.

Redis acts as a **message bus**, distributing events between workers.

------------------------------------------------------------------------

## Daphne ASGI Server

Daphne is a **production-ready ASGI server** used to serve:

-   HTTP requests
-   WebSocket connections
-   asynchronous events

It acts similarly to Gunicorn but for ASGI applications.

------------------------------------------------------------------------

## Message Persistence

Messages are persisted and stored in our relational database.

Supported databases:

-   **MySQL**
-   PostgreSQL
-   SQLite (development)

Messages are always saved before being broadcast.

------------------------------------------------------------------------

## Authentication

Secure communication is implemented using **token-based
authentication**.

Common approaches:

-   **JWT tokens**
-   Django REST tokens
-   Session authentication

Authentication ensures:

-   Only logged-in users can connect
-   WebSocket sessions are secure

Example:

    wss://example.com/ws/chat/52/?token=<JWT>

------------------------------------------------------------------------

## Role-Based Access Control

Users can only access conversations they are part of.

Validation occurs when establishing the WebSocket connection.

Rules:

-   Buyer can access the conversation
-   Seller can access the conversation
-   Other users are rejected

Example validation logic:

    if user not in conversation participants:
        reject connection

------------------------------------------------------------------------

## Online Presence

The system can track **online users** in a conversation.

Approach:

-   Add user to Redis presence list on connection
-   Remove on disconnect

Example:

    online_users:conversation_52

Frontend can then display:

-   "Seller is online"
-   "Buyer is offline"

------------------------------------------------------------------------

## Typing Indicators

Typing notifications are sent via WebSocket events.

Events:

    typing_start
    typing_stop

Example message:

    {
      "event": "typing",
      "user": 12
    }

This enables real-time UI updates.

------------------------------------------------------------------------

# Database Schema

## Conversations

Represents a chat thread.

    conversations
    -------------
    id
    listing_id
    buyer_id
    seller_id
    created_at
    last_message
    last_message_at

Constraint:

    UNIQUE(listing_id, buyer_id)

Ensures one conversation per buyer per listing.

------------------------------------------------------------------------

## Messages

    messages
    --------
    id
    conversation_id
    sender_id
    content
    created_at
    read_at

Supports:

-   message history
-   ordering
-   pagination
-   read receipts

------------------------------------------------------------------------

# Message Flow

## Step 1 --- WebSocket Connection

User opens chat page.

Client connects:

    wss://example.com/ws/chat/52/

------------------------------------------------------------------------

## Step 2 --- Sending Message

Client sends:

    {
      "message": "Is this still available?"
    }

------------------------------------------------------------------------

## Step 3 --- Backend Processing

Consumer:

1.  Saves message in database
2.  Broadcasts event via Redis

Example:

    group_send(chat_52, message_event)

------------------------------------------------------------------------

## Step 4 --- Real-Time Delivery

Redis distributes the message to all workers.

Connected clients receive the message instantly.

------------------------------------------------------------------------

# Frontend Architecture

## Real-Time Updates

Frontend uses **WebSocket connections** to receive messages instantly.

Messages are pushed directly from the backend without polling.

------------------------------------------------------------------------

## User Interface

The chat interface is built using **React**.

Features:

-   responsive chat layout
-   message list
-   input box
-   conversation list

------------------------------------------------------------------------

## Online Status Display

Frontend displays presence indicators.

Example:

    Seller • Online
    Buyer • Offline

This information is received via WebSocket presence events.

------------------------------------------------------------------------

## Typing Indicators

When a user types a message, the frontend sends:

    typing_start

Other participants see:

    "Seller is typing..."

When typing stops:

    typing_stop

------------------------------------------------------------------------

## Authentication

Frontend manages authentication using **JWT tokens**.

JWT is sent with:

-   API requests
-   WebSocket connection

Example:

    Authorization: Bearer <token>

------------------------------------------------------------------------

## Error Handling

The frontend gracefully handles errors such as:

-   WebSocket disconnections
-   authentication errors
-   server failures

Strategies:

-   automatic reconnection
-   message retry
-   user notifications

------------------------------------------------------------------------

# Loading Message History

Historical messages are loaded via HTTP API.

Example:

    GET /api/conversations/<id>/messages

WebSocket is only used for **new messages**.

------------------------------------------------------------------------

# Scaling Strategy

As the platform grows:

    Users
       │
       ▼
    Nginx
       │
       ▼
    Multiple Daphne workers
       │
       ▼
    Channels
       │
       ▼
    Redis cluster
       │
       ▼
    Database cluster

Redis ensures all workers receive chat events.

------------------------------------------------------------------------

# Best Practices

-   Always persist messages in the database
-   Use Redis only for real-time events
-   Validate user access to conversations
-   Separate REST API and WebSocket responsibilities
-   Load chat history via API
-   Use WebSockets only for live updates

---

## Resources
### Official Docs
- [Channels Tutorial (Chat)](https://channels.readthedocs.io/en/stable/tutorial/part_2.html)
- [Channel Layers](https://channels.readthedocs.io/en/latest/topics/channel_layers.html)

### Tutorials & Videos
- [Django Channels WebSockets](https://oneuptime.com/blog/post/2026-02-02-django-channels-websockets/view)
- [Django + React Chat (YouTube)](https://www.youtube.com/watch?v=fXwaejZiwEQ)
- [Scaling Guide](https://medium.com/@connect.hashblock/scaling-django-websockets...)

### Code/Examples
- [Django-React Chat Repo](https://github.com/Joshyvibe/chatapp-with-django-react)
- [Docker + Channels](https://github.com/jhnoor/docker-nginx-django-channels)

### Basics
- [WebSockets Intro](https://dev.to/vincenttommi/understanding-websockets...)

# ChitChatGPT

## Overview
ChitChatGPT is a cutting-edge real-time chat application that offers users a comprehensive communication suite with text, voice, and video chat capabilities, integrated with a GPT-powered chatbox for AI-driven interactions. Designed for seamless and dynamic user experiences, ChitChatGPT bridges the gap between traditional messaging platforms and innovative AI technology, making it ideal for both personal and professional communication.

![Alt Text](https://i.imgur.com/3yw7slM.png)

## Table of contents
- [Features](#features)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)

## Features
- **Real-Time Messaging:** Instant text chat for quick and easy communication.
- **Voice and Video Calls:** High-quality voice and video chat options for more personal conversations.
- **GPT-Powered Chatbox:** Interact with an AI-driven chatbox for assistance, entertainment, or information.
- **Cross-Platform Accessibility:** Designed with React, ensuring a responsive and accessible experience across all devices.

## Architecture

![Alt Text](https://i.imgur.com/jOq7nXP.jpeg)

ChitChatGPT is built on a modern tech stack that ensures real-time performance and scalability. The backend, powered by Node.js, handles API requests, interacts with the PostgreSQL database for data persistence, and manages real-time communication through Socket.io and WebRTC for text, voice, and video chats. The frontend, developed with React, offers a seamless and interactive user experience, integrating the GPT-powered chatbox for engaging AI conversations.

## Technologies

- **Backend:** Node.js for a scalable and efficient server-side solution.
- **Frontend:** React for a dynamic and responsive user interface.
- **Database:** PostgreSQL for robust and reliable data storage.
- **Real-Time Text Chat:** Socket.io for seamless real-time messaging.
- **Video and Voice Chat:** WebRTC for peer-to-peer voice and video communication without the need for external plugins.


## Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- Git

### Environment Variables Configuration
- **Backend:** For backend make a .env file and add two variables:
  - ```CONNECTION_STRING= <your-postgres-connection-string>```
  - ```PASSWORD= <some-strong-secret-key>```

- **Frontend:** For frontend make a .env file and add one variable:
  - ```VITE_BACKEND_URL=http://localhost:8000```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AdoshSingh/ChitChatGPT.git
cd ChitChatGPT
```
2. Run the server:
```bash
cd backend
npm install
node index.js
```
3. Run the frontend:
```bash
cd frontend
npm install
npm run dev
```
4. Access: Open your browser and navigate to [http://localhost:5173](http://localhost:5173) and explore our app.

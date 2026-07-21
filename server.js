/* ==========================================================================
   CUTY - LIVE VIDEO CHAT (REAL-TIME WEBRTC SIGNALING BACKEND SERVER)
   ========================================================================== */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// State Store
const onlineUsers = new Map(); // socket.id -> userProfile
const matchQueue = []; // array of socket.id
const activeCalls = new Map(); // callId -> { peer1, peer2 }

io.on('connection', (socket) => {
  console.log(`[Cuty Server] New socket connected: ${socket.id}`);

  // User Registration
  socket.on('register-user', (userProfile) => {
    const user = {
      socketId: socket.id,
      id: userProfile.id || `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: userProfile.name || 'Anonymous Cuty User',
      gender: userProfile.gender || 'female',
      avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      coins: userProfile.coins || 30
    };
    onlineUsers.set(socket.id, user);

    // Broadcast online count update
    io.emit('online-count-update', onlineUsers.size);
  });

  // Random Match Queueing
  socket.on('join-match-queue', (data) => {
    const genderFilter = data ? data.genderFilter : 'both';
    
    // Check if another user is in queue
    const waitingPeerId = matchQueue.find(id => id !== socket.id);

    if (waitingPeerId && onlineUsers.has(waitingPeerId)) {
      // Remove peer from queue
      const index = matchQueue.indexOf(waitingPeerId);
      if (index > -1) matchQueue.splice(index, 1);

      const callId = `call_${Date.now()}`;
      activeCalls.set(callId, { peer1: socket.id, peer2: waitingPeerId });

      const peer1Data = onlineUsers.get(socket.id);
      const peer2Data = onlineUsers.get(waitingPeerId);

      // Notify both peers to initiate WebRTC connection
      io.to(socket.id).emit('match-found', {
        callId,
        isInitiator: true,
        partner: peer2Data
      });

      io.to(waitingPeerId).emit('match-found', {
        callId,
        isInitiator: false,
        partner: peer1Data
      });

      console.log(`[Cuty Server] Matched ${socket.id} with ${waitingPeerId}`);

    } else {
      // Add to queue
      if (!matchQueue.includes(socket.id)) {
        matchQueue.push(socket.id);
      }
      socket.emit('match-searching');
    }
  });

  socket.on('leave-match-queue', () => {
    const index = matchQueue.indexOf(socket.id);
    if (index > -1) matchQueue.splice(index, 1);
  });

  // WebRTC Signaling Events (Offer / Answer / ICE Candidates)
  socket.on('signal-offer', (data) => {
    io.to(data.targetSocketId).emit('signal-offer', {
      offer: data.offer,
      senderSocketId: socket.id
    });
  });

  socket.on('signal-answer', (data) => {
    io.to(data.targetSocketId).emit('signal-answer', {
      answer: data.answer,
      senderSocketId: socket.id
    });
  });

  socket.on('signal-ice-candidate', (data) => {
    io.to(data.targetSocketId).emit('signal-ice-candidate', {
      candidate: data.candidate,
      senderSocketId: socket.id
    });
  });

  // Direct Call Requests
  socket.on('direct-call-request', (data) => {
    const targetSocket = Array.from(onlineUsers.values()).find(u => u.id === data.targetUserId);
    if (targetSocket) {
      io.to(targetSocket.socketId).emit('incoming-direct-call', {
        caller: onlineUsers.get(socket.id),
        callerSocketId: socket.id
      });
    }
  });

  // Direct Message Relay
  socket.on('send-direct-message', (data) => {
    const targetSocket = Array.from(onlineUsers.values()).find(u => u.id === data.targetUserId);
    if (targetSocket) {
      io.to(targetSocket.socketId).emit('receive-direct-message', {
        senderId: onlineUsers.get(socket.id)?.id,
        text: data.text,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  // Call Termination
  socket.on('end-call', (data) => {
    if (data && data.targetSocketId) {
      io.to(data.targetSocketId).emit('peer-ended-call');
    }
  });

  // Disconnect Handler
  socket.on('disconnect', () => {
    console.log(`[Cuty Server] Socket disconnected: ${socket.id}`);
    onlineUsers.delete(socket.id);

    const index = matchQueue.indexOf(socket.id);
    if (index > -1) matchQueue.splice(index, 1);

    io.emit('online-count-update', onlineUsers.size);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`💖 Cuty Live Video Chat Server is running on port ${PORT}`);
  console.log(`===================================================`);
});

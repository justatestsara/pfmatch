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
    let name = userProfile.name || 'Anonymous Cuty User';
    let gender = userProfile.gender || 'female';
    let avatar = userProfile.avatar || '/Profile Images/imgi_14_thumb_32f22d27a0.jpg';
    let country = userProfile.country || 'Global';
    let flag = userProfile.flag || '🌍';

    // If it's a guest user account, override it to be a female model profile!
    if (name.startsWith('Guest_')) {
      const femaleNames = ['Elena', 'Sophia', 'Chloe', 'Maya', 'Emma', 'Isabella', 'Aria', 'Olivia', 'Zara', 'Mia', 'Lily', 'Sofia', 'Ava', 'Luna', 'Zoe', 'Mila', 'Ella', 'Camila', 'Layla'];
      name = femaleNames[Math.floor(Math.random() * femaleNames.length)];
      gender = 'female';
      
      const countries = ['Russia', 'Italy', 'Global'];
      const flags = { 'Russia': '🇷🇺', 'Italy': '🇮🇹', 'Global': '🌍' };
      country = countries[Math.floor(Math.random() * countries.length)];
      flag = flags[country];

      const profileImages = [
        'imgi_14_thumb_32f22d27a0.jpg', 'imgi_19_thumb_23e5bcff0c.jpg', 'imgi_22_thumb_1760b3e140.jpg',
        'imgi_22_thumb_6a7b87e5aa.jpg', 'imgi_23_thumb_bac15870c7.jpg', 'imgi_26_thumb_294ef15058.jpg',
        'imgi_28_thumb_21e4952114.jpg', 'imgi_29_thumb_1a17a016ac.jpg', 'imgi_31_thumb_848a38c3ff.jpg',
        'imgi_32_thumb_2cc404b9e2.jpg', 'imgi_32_thumb_85628c8d0e.jpg', 'imgi_34_thumb_5aaa875450.jpg',
        'imgi_35_thumb_86f09eb120.jpg', 'imgi_39_thumb_9a6017c292.jpg', 'imgi_3_thumb_1c308df074.jpg',
        'imgi_40_thumb_988bbaac3d.jpg', 'imgi_45_thumb_aa800007a0.jpg', 'imgi_4_thumb_8489afdea9.jpg',
        'imgi_6_thumb_12c7bc526d.jpg', 'imgi_8_thumb_42dfbb79c3.jpg', 'imgi_8_thumb_9350032849.jpg'
      ];
      const randomImg = profileImages[Math.floor(Math.random() * profileImages.length)];
      avatar = `/Profile Images/${randomImg}`;
    }

    const user = {
      socketId: socket.id,
      id: userProfile.id || `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      gender: gender,
      avatar: avatar,
      coins: userProfile.coins || 30,
      country: country,
      flag: flag
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

  socket.on('direct-call-accept', (data) => {
    if (data && data.targetSocketId) {
      io.to(data.targetSocketId).emit('direct-call-accept', {
        partnerSocketId: socket.id
      });
      // Register direct call mapping in activeCalls
      const callId = `call_${Date.now()}`;
      activeCalls.set(callId, { peer1: socket.id, peer2: data.targetSocketId });
    }
  });

  socket.on('direct-call-decline', (data) => {
    if (data && data.targetSocketId) {
      io.to(data.targetSocketId).emit('direct-call-decline');
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

  // In-Call Text Message Relay
  socket.on('call-text-message', (data) => {
    if (data && data.targetSocketId) {
      io.to(data.targetSocketId).emit('call-text-message', {
        text: data.text
      });
    }
  });

  // In-Call Gift Relay
  socket.on('call-gift', (data) => {
    if (data && data.targetSocketId) {
      io.to(data.targetSocketId).emit('call-gift', {
        giftType: data.giftType
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

    // Find and terminate any active call this socket was in
    for (const [callId, peers] of activeCalls.entries()) {
      if (peers.peer1 === socket.id || peers.peer2 === socket.id) {
        const partnerSocketId = peers.peer1 === socket.id ? peers.peer2 : peers.peer1;
        io.to(partnerSocketId).emit('peer-ended-call');
        activeCalls.delete(callId);
        break;
      }
    }

    io.emit('online-count-update', onlineUsers.size);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`💖 Cuty Live Video Chat Server is running on port ${PORT}`);
  console.log(`===================================================`);
});

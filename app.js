/* ==========================================================================
   CUTY - LIVE VIDEO CHAT (CORE APPLICATION LOGIC)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // ================= STATE MANAGEMENT =================
  const state = {
    coins: 30, // 1 coin = 1 minute talking time
    isVip: false,
    currentView: 'view-random',
    activeGenderFilter: 'both',
    localStream: null,
    inCall: false,
    currentPartner: null,
    callDurationSeconds: 0,
    callTimerInterval: null,
    beautyFilter: 'normal',
    audioMuted: false,
    callHistory: [
      { name: 'Elena Rostova', flag: '🇷🇺', duration: '03:14', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { name: 'Chloe Dubois', flag: '🇫🇷', duration: '05:40', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    ],
    dmPartner: null,
    dmMessages: {}
  };

  // ================= DEMO ONLINE USERS DATABASE =================
  const PEOPLE_DATABASE = [
    {
      id: 'usr_1',
      name: 'Elena Rostova',
      gender: 'female',
      age: 22,
      country: 'Russia',
      flag: '🇷🇺',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Love dancing, travel, and deep late night talks! 💃✨'
    },
    {
      id: 'usr_2',
      name: 'Sophia Rossi',
      gender: 'female',
      age: 24,
      country: 'Italy',
      flag: '🇮🇹',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      bio: 'Coffee lover & interior designer from Milan ☕🎨'
    },
    {
      id: 'usr_3',
      name: 'Chloe Dubois',
      gender: 'female',
      age: 21,
      country: 'France',
      flag: '🇫🇷',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      bio: 'Fashion enthusiast. Teach me your language! 🥐'
    },
    {
      id: 'usr_4',
      name: 'Maya Tanaka',
      gender: 'female',
      age: 23,
      country: 'Japan',
      flag: '🇯🇵',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      bio: 'Anime enthusiast and video gamer 🎮🌸'
    },
    {
      id: 'usr_5',
      name: 'Lucas Silva',
      gender: 'male',
      age: 25,
      country: 'Brazil',
      flag: '🇧🇷',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Surfer & DJ. Let’s vibe to music! 🏄‍♂️🎧'
    },
    {
      id: 'usr_6',
      name: 'David Miller',
      gender: 'male',
      age: 26,
      country: 'USA',
      flag: '🇺🇸',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Software dev & outdoor hiker ⛰️💻'
    },
    {
      id: 'usr_7',
      name: 'Amara Ndiaye',
      gender: 'female',
      age: 22,
      country: 'Senegal',
      flag: '🇸🇳',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
      bio: 'Modeling, music, and positivity 🌟✨'
    },
    {
      id: 'usr_8',
      name: 'Liam Smith',
      gender: 'male',
      age: 24,
      country: 'UK',
      flag: '🇬🇧',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
      bio: 'Guitar player & comedy lover 🎸😂'
    }
  ];

  // ================= WEB AUDIO SOUND ENGINE =================
  const SoundFX = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    },
    playBeep(freq = 440, type = 'sine', duration = 0.15, gainVal = 0.1) {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },
    playMatchSuccess() {
      this.playBeep(523.25, 'triangle', 0.12, 0.15);
      setTimeout(() => this.playBeep(659.25, 'triangle', 0.12, 0.15), 100);
      setTimeout(() => this.playBeep(783.99, 'triangle', 0.25, 0.2), 200);
    },
    playGiftPop() {
      this.playBeep(880, 'sine', 0.1, 0.2);
      setTimeout(() => this.playBeep(1320, 'sine', 0.15, 0.25), 80);
    },
    playCoinAdd() {
      this.playBeep(987.77, 'sine', 0.1, 0.15);
      setTimeout(() => this.playBeep(1318.51, 'sine', 0.2, 0.2), 90);
    }
  };

  // ================= DOM ELEMENTS =================
  const elements = {
    clock: document.getElementById('status-clock'),
    toggleFrameBtn: document.getElementById('toggle-frame-btn'),
    frameToggleText: document.getElementById('frame-toggle-text'),
    coinBalanceDisplays: [
      document.getElementById('coin-balance-display'),
      document.getElementById('profile-coin-balance'),
      document.getElementById('call-coin-balance')
    ],
    profileMinsDisplay: document.getElementById('profile-mins-display'),
    headerCoinBtn: document.getElementById('header-coin-btn'),
    profileBuyCoinsBtn: document.getElementById('profile-buy-coins-btn'),
    closeStoreBtn: document.getElementById('close-store-btn'),
    coinStoreModal: document.getElementById('coin-store-modal'),
    
    // Bottom Nav Tabs
    navTabs: document.querySelectorAll('.bottom-nav .nav-tab'),
    views: document.querySelectorAll('.app-view'),
    
    // Random Match
    radarVideo: document.getElementById('radar-camera-video'),
    radarContainer: document.getElementById('radar-container'),
    startMatchBtn: document.getElementById('start-match-btn'),
    startMatchBtnText: document.getElementById('start-match-btn-text'),
    matchStatusText: document.getElementById('match-status-text'),
    matchSubstatusText: document.getElementById('match-substatus-text'),
    genderTabs: document.querySelectorAll('#gender-filter-tabs .filter-tab'),

    // People View
    peopleGrid: document.getElementById('people-grid-container'),
    categoryPills: document.querySelectorAll('#people-category-pills .pill'),

    // Profile View
    callHistoryList: document.getElementById('call-history-list'),

    // Call Modal
    callModal: document.getElementById('call-modal'),
    remoteVideo: document.getElementById('remote-video-element'),
    simulatedCanvasWrapper: document.getElementById('simulated-canvas-wrapper'),
    simulatedCanvas: document.getElementById('simulated-video-canvas'),
    localPipVideo: document.getElementById('local-pip-video'),
    pipFlipBtn: document.getElementById('pip-flip-btn'),
    callPartnerAvatar: document.getElementById('call-partner-avatar'),
    callPartnerName: document.getElementById('call-partner-name'),
    callPartnerFlag: document.getElementById('call-partner-flag'),
    callPartnerLocation: document.getElementById('call-partner-location'),
    callTimerDisplay: document.getElementById('call-timer-display'),
    callChatOverlay: document.getElementById('call-chat-overlay'),
    callChatInput: document.getElementById('call-chat-input'),
    callSendChatBtn: document.getElementById('call-send-chat-btn'),
    callBtnReport: document.getElementById('call-btn-report'),
    
    // Call Actions
    callBtnMute: document.getElementById('call-btn-mute'),
    callBtnFilter: document.getElementById('call-btn-filter'),
    callBtnGift: document.getElementById('call-btn-gift'),
    callBtnNext: document.getElementById('call-btn-next'),
    callBtnEnd: document.getElementById('call-btn-end'),
    
    // Sheets & Canvas FX
    filterSheet: document.getElementById('filter-sheet'),
    closeFilterSheet: document.getElementById('close-filter-sheet'),
    filterOpts: document.querySelectorAll('.filter-opt'),
    giftSheet: document.getElementById('gift-sheet'),
    closeGiftSheet: document.getElementById('close-gift-sheet'),
    giftCards: document.querySelectorAll('.gift-card'),
    callFxCanvas: document.getElementById('call-fx-canvas'),

    // DM Modal
    dmModal: document.getElementById('dm-modal'),
    dmBackBtn: document.getElementById('dm-back-btn'),
    dmPartnerAvatar: document.getElementById('dm-partner-avatar'),
    dmPartnerName: document.getElementById('dm-partner-name'),
    dmCallTriggerBtn: document.getElementById('dm-call-trigger-btn'),
    dmMessagesList: document.getElementById('dm-messages-list'),
    dmInput: document.getElementById('dm-input'),
    dmSendBtn: document.getElementById('dm-send-btn'),

    toast: document.getElementById('toast-notification')
  };

  // ================= INITIALIZATION =================
  function init() {
    updateClock();
    setInterval(updateClock, 1000);
    setupCamera();
    renderCoinBalance();
    renderPeopleGrid(PEOPLE_DATABASE);
    renderCallHistory();
    setupEventListeners();
    initSocketServer();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    }
  }

  // ================= SOCKET.IO & WEBRTC SIGNALING =================
  let socket = null;
  let peerConnection = null;
  let targetPeerSocketId = null;

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  function initSocketServer() {
    if (typeof io !== 'undefined') {
      try {
        socket = io();
        socket.on('connect', () => {
          console.log('[Cuty WebRTC] Connected to signaling server:', socket.id);
          socket.emit('register-user', {
            id: 'usr_me_' + Math.floor(Math.random() * 1000),
            name: 'Alex Johnson',
            gender: 'female',
            coins: state.coins
          });
        });

        socket.on('online-count-update', (count) => {
          const badge = document.getElementById('people-online-count');
          if (badge) badge.textContent = count > 1 ? count + 24 : 24;
        });

        socket.on('match-found', async (data) => {
          targetPeerSocketId = data.partner.socketId;
          launchRealWebRTCCall(data.partner, data.isInitiator);
        });

        socket.on('signal-offer', async (data) => {
          targetPeerSocketId = data.senderSocketId;
          await handleSignalOffer(data.offer);
        });

        socket.on('signal-answer', async (data) => {
          await handleSignalAnswer(data.answer);
        });

        socket.on('signal-ice-candidate', async (data) => {
          await handleSignalCandidate(data.candidate);
        });

        socket.on('peer-ended-call', () => {
          showToast('Partner left the call');
          endCall();
        });
      } catch (err) {
        console.log('Standalone mode without active socket server.');
      }
    }
  }

  async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(rtcConfig);

    if (state.localStream) {
      state.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, state.localStream);
      });
    }

    peerConnection.ontrack = (event) => {
      if (elements.remoteVideo && event.streams[0]) {
        elements.simulatedCanvasWrapper.style.display = 'none';
        elements.remoteVideo.srcObject = event.streams[0];
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && targetPeerSocketId) {
        socket.emit('signal-ice-candidate', {
          targetSocketId: targetPeerSocketId,
          candidate: event.candidate
        });
      }
    };
  }

  async function launchRealWebRTCCall(partner, isInitiator) {
    launchVideoCall(partner);
    await createPeerConnection();

    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('signal-offer', {
        targetSocketId: targetPeerSocketId,
        offer
      });
    }
  }

  async function handleSignalOffer(offer) {
    if (!peerConnection) await createPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('signal-answer', {
      targetSocketId: targetPeerSocketId,
      answer
    });
  }

  async function handleSignalAnswer(answer) {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async function handleSignalCandidate(candidate) {
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // Status Clock
  function updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (elements.clock) elements.clock.textContent = `${hrs}:${mins}`;
  }

  // Toast Notifications
  function showToast(msg, duration = 3000) {
    if (!elements.toast) return;
    elements.toast.textContent = msg;
    elements.toast.classList.add('show');
    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, duration);
  }

  // Coin Balance UI Update
  function renderCoinBalance() {
    elements.coinBalanceDisplays.forEach(el => {
      if (el) el.textContent = state.coins;
    });
    if (elements.profileMinsDisplay) {
      elements.profileMinsDisplay.textContent = state.coins;
    }
  }

  // ================= WEBCAM INTEGRATION =================
  async function setupCamera() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        state.localStream = stream;
        if (elements.radarVideo) elements.radarVideo.srcObject = stream;
        if (elements.localPipVideo) elements.localPipVideo.srcObject = stream;
      } else {
        createCanvasFallbackStream();
      }
    } catch (err) {
      console.log('Webcam not allowed or unavailable. Using fallback canvas generator.');
      createCanvasFallbackStream();
    }
  }

  function createCanvasFallbackStream() {
    // Generate animated selfie fallback stream on canvas
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    function draw() {
      angle += 0.03;
      ctx.fillStyle = '#1e1430';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Face circle
      ctx.beginPath();
      ctx.arc(160, 220 + Math.sin(angle) * 5, 70, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb6c1';
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(135, 210, 8, 0, Math.PI * 2);
      ctx.arc(185, 210, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Smile
      ctx.beginPath();
      ctx.arc(160, 230, 25, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#e91e63';
      ctx.stroke();

      requestAnimationFrame(draw);
    }
    draw();
    
    const stream = canvas.captureStream(30);
    state.localStream = stream;
    if (elements.radarVideo) elements.radarVideo.srcObject = stream;
    if (elements.localPipVideo) elements.localPipVideo.srcObject = stream;
  }

  // ================= NAVIGATION MANAGER =================
  function switchView(targetViewId) {
    state.currentView = targetViewId;
    elements.views.forEach(view => {
      if (view.id === targetViewId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    elements.navTabs.forEach(tab => {
      if (tab.getAttribute('data-target') === targetViewId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    SoundFX.playBeep(600, 'sine', 0.05, 0.08);
  }

  // ================= RANDOM VIDEO MATCH ENGINE =================
  let isSearchingMatch = false;

  function startRandomMatch() {
    if (state.coins < 1) {
      showToast('⚠️ You need at least 1 coin to start a call!');
      openCoinStore();
      return;
    }

    if (isSearchingMatch) return;
    isSearchingMatch = true;

    // UI searching state
    elements.startMatchBtn.classList.add('searching');
    elements.startMatchBtnText.textContent = 'Searching Matches...';
    elements.matchStatusText.textContent = 'Finding cute people nearby...';
    elements.matchSubstatusText.textContent = `Filter: ${state.activeGenderFilter.toUpperCase()}`;

    SoundFX.playBeep(400, 'triangle', 0.2, 0.15);

    // Send Socket queue request if connected
    if (socket && socket.connected) {
      socket.emit('join-match-queue', { genderFilter: state.activeGenderFilter });
    }

    // Simulated search delay fallback
    setTimeout(() => {
      if (state.inCall) return; // already launched via WebRTC match-found event

      elements.matchStatusText.textContent = 'Match Found! Connecting HD stream...';
      SoundFX.playMatchSuccess();

      setTimeout(() => {
        if (state.inCall) return;
        isSearchingMatch = false;
        elements.startMatchBtn.classList.remove('searching');
        elements.startMatchBtnText.textContent = 'Start Random Match';
        elements.matchStatusText.textContent = 'Ready to meet cute people?';

        // Select partner from database based on gender filter
        let candidates = PEOPLE_DATABASE;
        if (state.activeGenderFilter !== 'both') {
          candidates = PEOPLE_DATABASE.filter(p => p.gender === state.activeGenderFilter);
        }
        const partner = candidates[Math.floor(Math.random() * candidates.length)];
        launchVideoCall(partner);
      }, 1000);

    }, 1800);
  }

  // ================= LIVE VIDEO CALL SYSTEM =================
  function launchVideoCall(partner) {
    state.inCall = true;
    state.currentPartner = partner;
    state.callDurationSeconds = 0;

    // Populate Partner UI
    elements.callPartnerName.textContent = partner.name;
    elements.callPartnerFlag.textContent = partner.flag;
    elements.callPartnerLocation.textContent = partner.country;
    elements.callPartnerAvatar.src = partner.avatar;
    elements.callTimerDisplay.textContent = '00:00';
    elements.callChatOverlay.innerHTML = '';

    // Show Call Modal
    elements.callModal.classList.add('active');

    // Setup Remote Partner Video Feed (Realistic Canvas Generator for demo)
    setupRemotePartnerCanvas(partner);

    // Initial Welcome Chat Bubble
    setTimeout(() => {
      appendCallChatBubble(partner.name, `Hi there! 👋 Happy to talk with you!`);
    }, 1200);

    // Start 1 Coin = 1 Minute Timer
    startCallTimer();
  }

  // Simulated High-Quality Animated Partner Stream
  let partnerCanvasAnimFrame = null;

  function setupRemotePartnerCanvas(partner) {
    elements.simulatedCanvasWrapper.style.display = 'block';
    const canvas = elements.simulatedCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = 480;
    canvas.height = 720;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = partner.avatar;

    let time = 0;

    function drawPartner() {
      if (!state.inCall) return;
      time += 0.04;

      // Draw background avatar with gentle breathing / sway effect
      ctx.save();
      const scale = 1 + Math.sin(time * 0.8) * 0.02;
      const offsetX = Math.cos(time * 0.5) * 6;
      const offsetY = Math.sin(time * 0.6) * 4;

      ctx.fillStyle = '#0f091a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (img.complete && img.naturalWidth > 0) {
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      }
      ctx.restore();

      // Apply AR Beauty filter on remote stream if active
      applyCanvasFilterEffects(ctx, canvas.width, canvas.height);

      partnerCanvasAnimFrame = requestAnimationFrame(drawPartner);
    }

    img.onload = () => {
      drawPartner();
    };
    // fallback start
    drawPartner();
  }

  function applyCanvasFilterEffects(ctx, width, height) {
    if (state.beautyFilter === 'smooth') {
      ctx.fillStyle = 'rgba(255, 192, 203, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else if (state.beautyFilter === 'warm') {
      ctx.fillStyle = 'rgba(255, 140, 0, 0.12)';
      ctx.fillRect(0, 0, width, height);
    } else if (state.beautyFilter === 'cyber') {
      ctx.fillStyle = 'rgba(0, 242, 254, 0.1)';
      ctx.fillRect(0, 0, width, height);
    } else if (state.beautyFilter === 'vintage') {
      ctx.fillStyle = 'rgba(120, 80, 20, 0.15)';
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 1 COIN = 1 MINUTE CALL TIMER LOGIC
  function startCallTimer() {
    if (state.callTimerInterval) clearInterval(state.callTimerInterval);

    state.callTimerInterval = setInterval(() => {
      state.callDurationSeconds++;

      // Update timer UI (mm:ss)
      const mins = Math.floor(state.callDurationSeconds / 60);
      const secs = state.callDurationSeconds % 60;
      elements.callTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      // EVERY 60 SECONDS = DEDUCT 1 COIN
      if (state.callDurationSeconds % 60 === 0 && state.callDurationSeconds > 0) {
        state.coins--;
        renderCoinBalance();
        showToast('⚡ 1 Coin deducted (1 min call time)');

        // Out of coins check
        if (state.coins < 1) {
          showToast('⚠️ You ran out of coins! Call ending...');
          endCall();
          openCoinStore();
        }
      }
    }, 1000);
  }

  function endCall() {
    if (!state.inCall) return;
    state.inCall = false;

    if (state.callTimerInterval) clearInterval(state.callTimerInterval);
    if (partnerCanvasAnimFrame) cancelAnimationFrame(partnerCanvasAnimFrame);

    elements.callModal.classList.remove('active');
    SoundFX.playBeep(300, 'sine', 0.2, 0.1);

    // Save to Call History
    if (state.currentPartner && state.callDurationSeconds > 3) {
      const mins = Math.floor(state.callDurationSeconds / 60);
      const secs = state.callDurationSeconds % 60;
      const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      state.callHistory.unshift({
        name: state.currentPartner.name,
        flag: state.currentPartner.flag,
        duration: durationStr,
        avatar: state.currentPartner.avatar
      });
      renderCallHistory();
    }

    state.currentPartner = null;
  }

  function nextMatch() {
    endCall();
    setTimeout(() => {
      startRandomMatch();
    }, 400);
  }

  // In-Call Chat Overlay
  function appendCallChatBubble(author, text, isSystem = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isSystem ? 'system' : ''}`;
    
    if (isSystem) {
      bubble.textContent = text;
    } else {
      bubble.innerHTML = `<span class="chat-author">${author}:</span> ${text}`;
    }

    elements.callChatOverlay.appendChild(bubble);
    elements.callChatOverlay.scrollTop = elements.callChatOverlay.scrollHeight;
  }

  // Virtual Gift Particle Animation
  function sendGift(giftType, cost) {
    if (state.coins < cost) {
      showToast(`⚠️ You need ${cost} coins to send this gift!`);
      openCoinStore();
      return;
    }

    state.coins -= cost;
    renderCoinBalance();
    elements.giftSheet.classList.remove('active');
    SoundFX.playGiftPop();

    const giftNames = { rose: 'Rose 🌹', diamond: 'Diamond 💎', crown: 'Crown 👑', car: 'Supercar 🏎️' };
    appendCallChatBubble('System', `You sent ${giftNames[giftType]}!`, true);

    // Trigger Canvas Particle Fireworks
    triggerGiftParticles(giftType);

    // Automated thank you from partner
    setTimeout(() => {
      if (state.inCall && state.currentPartner) {
        appendCallChatBubble(state.currentPartner.name, `OMG thank you so much for the ${giftNames[giftType]}!! 💖✨`);
      }
    }, 1500);
  }

  function triggerGiftParticles(giftType) {
    const canvas = elements.callFxCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const emojiMap = { rose: '🌹', diamond: '💎', crown: '👑', car: '🏎️' };
    const emoji = emojiMap[giftType] || '💖';

    for (let i = 0; i < 25; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 100,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 24 + 18,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        if (p.alpha > 0.01) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.3; // gravity
          p.alpha -= 0.018;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.font = `${p.size}px sans-serif`;
          ctx.fillText(emoji, p.x, p.y);
          ctx.restore();
        }
      });

      if (alive && state.inCall) {
        requestAnimationFrame(animateParticles);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animateParticles();
  }

  // ================= PEOPLE TAB (DIRECT CALL & DM) =================
  function renderPeopleGrid(list) {
    if (!elements.peopleGrid) return;
    elements.peopleGrid.innerHTML = '';

    list.forEach(person => {
      const card = document.createElement('div');
      card.className = 'person-card';
      card.innerHTML = `
        <div class="person-thumb-wrapper">
          <img src="${person.avatar}" alt="${person.name}" class="person-thumb" />
          <span class="card-status-dot">🟢 Online</span>
          <span class="card-rate-tag">${person.rate}</span>
        </div>
        <div class="person-body">
          <div class="person-name-row">
            <span class="person-name">${person.name}</span>
          </div>
          <span class="person-meta">${person.flag} ${person.country} • ${person.age}y</span>
          <div class="person-actions-row">
            <button class="btn-card-text" data-id="${person.id}">
              <i data-lucide="message-circle"></i> Text
            </button>
            <button class="btn-card-call" data-id="${person.id}">
              <i data-lucide="video"></i> Call
            </button>
          </div>
        </div>
      `;

      // Event listeners for DM and Direct Call
      card.querySelector('.btn-card-text').addEventListener('click', () => openDMModal(person));
      card.querySelector('.btn-card-call').addEventListener('click', () => {
        if (state.coins < 1) {
          showToast('⚠️ You need at least 1 coin to start a call!');
          openCoinStore();
          return;
        }
        launchVideoCall(person);
      });

      elements.peopleGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  // Category Filtering
  elements.categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      elements.categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const cat = pill.getAttribute('data-cat');
      let filtered = PEOPLE_DATABASE;
      if (cat === 'popular') filtered = PEOPLE_DATABASE.filter(p => p.popular);
      else if (cat === 'female') filtered = PEOPLE_DATABASE.filter(p => p.gender === 'female');
      else if (cat === 'male') filtered = PEOPLE_DATABASE.filter(p => p.gender === 'male');

      renderPeopleGrid(filtered);
    });
  });

  // ================= DIRECT MESSAGING (DM) MODAL =================
  function openDMModal(person) {
    state.dmPartner = person;
    elements.dmPartnerName.textContent = person.name;
    elements.dmPartnerAvatar.src = person.avatar;

    if (!state.dmMessages[person.id]) {
      state.dmMessages[person.id] = [
        { sender: 'them', text: `Hey! Thanks for visiting my profile. How is your day going? 😊` }
      ];
    }

    renderDMMessages();
    elements.dmModal.classList.add('active');
  }

  function renderDMMessages() {
    if (!state.dmPartner) return;
    const msgs = state.dmMessages[state.dmPartner.id] || [];
    elements.dmMessagesList.innerHTML = '';

    msgs.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `dm-bubble ${msg.sender === 'me' ? 'outgoing' : 'incoming'}`;
      bubble.textContent = msg.text;
      elements.dmMessagesList.appendChild(bubble);
    });

    elements.dmMessagesList.scrollTop = elements.dmMessagesList.scrollHeight;
  }

  function sendDMMessage() {
    const text = elements.dmInput.value.trim();
    if (!text || !state.dmPartner) return;

    state.dmMessages[state.dmPartner.id].push({ sender: 'me', text });
    elements.dmInput.value = '';
    renderDMMessages();
    SoundFX.playBeep(750, 'sine', 0.08, 0.1);

    // Simulated reply
    setTimeout(() => {
      const replies = [
        "That's so cool! Tell me more ✨",
        "Aww nice! Do you want to jump on a video call? 📹",
        "Haha love that! 😄 What music do you listen to?",
        "Awesome! I'm online right now!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      if (state.dmPartner && state.dmMessages[state.dmPartner.id]) {
        state.dmMessages[state.dmPartner.id].push({ sender: 'them', text: randomReply });
        renderDMMessages();
        SoundFX.playBeep(850, 'sine', 0.1, 0.1);
      }
    }, 1500);
  }

  // ================= PROFILE & CALL HISTORY =================
  function renderCallHistory() {
    if (!elements.callHistoryList) return;
    elements.callHistoryList.innerHTML = '';

    state.callHistory.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <div class="history-user">
          <img src="${item.avatar}" alt="${item.name}" class="history-avatar" />
          <div>
            <div class="history-name">${item.name} ${item.flag}</div>
            <div class="history-time">Today</div>
          </div>
        </div>
        <div class="history-duration">⏱️ ${item.duration}</div>
      `;
      elements.callHistoryList.appendChild(el);
    });
  }

  // ================= COIN STORE & VIP SUBSCRIPTION =================
  function openCoinStore() {
    elements.coinStoreModal.classList.add('active');
  }

  function closeCoinStore() {
    elements.coinStoreModal.classList.remove('active');
  }

  function buyCoinPackage(coins, price) {
    state.coins += coins;
    renderCoinBalance();
    SoundFX.playCoinAdd();
    showToast(`🎉 Purchase Successful! Added ${coins} coins.`);
    closeCoinStore();
  }

  // ================= EVENT LISTENERS SETUP =================
  function setupEventListeners() {
    // Desktop Frame Toggle
    elements.toggleFrameBtn.addEventListener('click', () => {
      document.body.classList.toggle('fullscreen-mode');
      const isFullscreen = document.body.classList.contains('fullscreen-mode');
      elements.frameToggleText.textContent = isFullscreen ? 'Toggle Android Frame' : 'Toggle Fullscreen View';
    });

    // Navigation Tabs
    elements.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-target');
        switchView(targetView);
      });
    });

    // Header & Profile Coin Store Triggers
    elements.headerCoinBtn.addEventListener('click', openCoinStore);
    if (elements.profileBuyCoinsBtn) elements.profileBuyCoinsBtn.addEventListener('click', openCoinStore);
    elements.closeStoreBtn.addEventListener('click', closeCoinStore);

    // Coin Pack Click Handlers
    document.querySelectorAll('.coin-pack-item').forEach(pack => {
      pack.addEventListener('click', () => {
        const coins = parseInt(pack.getAttribute('data-coins'), 10);
        const price = pack.getAttribute('data-price');
        buyCoinPackage(coins, price);
      });
    });

    // VIP Button
    const vipBtn = document.getElementById('profile-vip-btn');
    if (vipBtn) {
      vipBtn.addEventListener('click', () => {
        state.isVip = true;
        showToast('👑 VIP Membership Activated! Enjoy unlimited filters.');
        vipBtn.textContent = '✓ Active VIP Member';
        vipBtn.style.background = '#ffd700';
        vipBtn.style.color = '#000';
      });
    }

    // Gender Filter Tabs
    elements.genderTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.genderTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeGenderFilter = tab.getAttribute('data-gender');
      });
    });

    // Start Random Match Button
    elements.startMatchBtn.addEventListener('click', startRandomMatch);

    // In-Call Action Handlers
    elements.callBtnEnd.addEventListener('click', endCall);
    elements.callBtnNext.addEventListener('click', nextMatch);
    if (elements.callBtnReport) {
      elements.callBtnReport.addEventListener('click', () => {
        showToast('🛡️ User reported & blocked. Finding next match...');
        nextMatch();
      });
    }
    
    // Mute Button
    elements.callBtnMute.addEventListener('click', () => {
      state.audioMuted = !state.audioMuted;
      elements.callBtnMute.style.background = state.audioMuted ? '#ff3b30' : 'rgba(255,255,255,0.1)';
      showToast(state.audioMuted ? 'Microphone Muted' : 'Microphone Active');
    });

    // Filter Sheet Toggle
    elements.callBtnFilter.addEventListener('click', () => {
      elements.filterSheet.classList.toggle('active');
      elements.giftSheet.classList.remove('active');
    });
    elements.closeFilterSheet.addEventListener('click', () => {
      elements.filterSheet.classList.remove('active');
    });

    elements.filterOpts.forEach(opt => {
      opt.addEventListener('click', () => {
        elements.filterOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        state.beautyFilter = opt.getAttribute('data-filter');
        showToast(`Beauty Filter: ${opt.textContent}`);
        elements.filterSheet.classList.remove('active');
      });
    });

    // Gift Sheet Toggle
    elements.callBtnGift.addEventListener('click', () => {
      elements.giftSheet.classList.toggle('active');
      elements.filterSheet.classList.remove('active');
    });
    elements.closeGiftSheet.addEventListener('click', () => {
      elements.giftSheet.classList.remove('active');
    });

    elements.giftCards.forEach(card => {
      card.addEventListener('click', () => {
        const giftType = card.getAttribute('data-gift');
        const cost = parseInt(card.getAttribute('data-cost'), 10);
        sendGift(giftType, cost);
      });
    });

    // In-Call Chat Input
    elements.callSendChatBtn.addEventListener('click', () => {
      const text = elements.callChatInput.value.trim();
      if (!text) return;
      appendCallChatBubble('You', text);
      elements.callChatInput.value = '';

      // Reply simulation
      setTimeout(() => {
        if (state.inCall && state.currentPartner) {
          appendCallChatBubble(state.currentPartner.name, '😊✨');
        }
      }, 1400);
    });

    // DM Modal Handlers
    elements.dmBackBtn.addEventListener('click', () => {
      elements.dmModal.classList.remove('active');
    });
    elements.dmSendBtn.addEventListener('click', sendDMMessage);
    elements.dmInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendDMMessage();
    });
    elements.dmCallTriggerBtn.addEventListener('click', () => {
      if (state.dmPartner) {
        elements.dmModal.classList.remove('active');
        launchVideoCall(state.dmPartner);
      }
    });
  }

  // Start Application
  init();
});

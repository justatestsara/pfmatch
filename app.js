/* ==========================================================================
   CUTY - LIVE VIDEO CHAT (CORE APPLICATION LOGIC)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // ================= UTILS & HELPERS =================
  function getFirstName(fullName) {
    if (!fullName) return '';
    return fullName.trim().split(' ')[0];
  }

  // ================= STATE MANAGEMENT =================
  const state = {
    coins: 30, // 1 coin = 1 minute talking time
    currentView: 'view-random',
    activeGenderFilter: 'both',
    localStream: null,
    inCall: false,
    currentPartner: null,
    callDurationSeconds: 0,
    callTimerInterval: null,
    audioMuted: false,
    callHistory: [
      { name: 'Elena Rostova', flag: '🇷🇺', duration: '03:14', avatar: '/Profile Images/imgi_14_thumb_32f22d27a0.jpg' },
      { name: 'Chloe Dubois', flag: '🇫🇷', duration: '05:40', avatar: '/Profile Images/imgi_22_thumb_1760b3e140.jpg' },
    ],
    dmPartner: null,
    dmMessages: {}
  };

  // ================= DEMO ONLINE USERS DATABASE =================
  const PEOPLE_DATABASE = [
    {
      id: '0925d6a1-fad0-436d-9c0f-c5d6177f5a06',
      name: 'Elena Rostova',
      gender: 'female',
      age: 22,
      country: 'Russia',
      flag: '🇷🇺',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_14_thumb_32f22d27a0.jpg',
      bio: 'Love dancing, travel, and deep late night talks! 💃✨'
    },
    {
      id: 'a53ccf35-ea07-4ed9-8173-04dab36ae3a8',
      name: 'Sophia Rossi',
      gender: 'female',
      age: 24,
      country: 'Italy',
      flag: '🇮🇹',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_19_thumb_23e5bcff0c.jpg',
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
      avatar: '/Profile Images/imgi_22_thumb_1760b3e140.jpg',
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
      avatar: '/Profile Images/imgi_22_thumb_6a7b87e5aa.jpg',
      bio: 'Anime enthusiast and video gamer 🎮🌸'
    },
    {
      id: 'usr_5',
      name: 'Amelia Smith',
      gender: 'female',
      age: 22,
      country: 'USA',
      flag: '🇺🇸',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_23_thumb_bac15870c7.jpg',
      bio: 'Always down for a laugh! Let’s chat 🎸😂'
    },
    {
      id: 'usr_6',
      name: 'Mia Larsson',
      gender: 'female',
      age: 25,
      country: 'Sweden',
      flag: '🇸🇪',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_26_thumb_294ef15058.jpg',
      bio: 'Exploring the world one chat at a time 🌍✈️'
    },
    {
      id: 'usr_7',
      name: 'Clara Fischer',
      gender: 'female',
      age: 24,
      country: 'Germany',
      flag: '🇩🇪',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_28_thumb_21e4952114.jpg',
      bio: 'Art history student. Let’s talk about art! 🎨📖'
    },
    {
      id: 'usr_8',
      name: 'Olivia Martinez',
      gender: 'female',
      age: 23,
      country: 'Spain',
      flag: '🇪🇸',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_29_thumb_1a17a016ac.jpg',
      bio: 'Dance instructor from Barcelona 💃☀️'
    },
    {
      id: 'usr_9',
      name: 'Isabella Silva',
      gender: 'female',
      age: 21,
      country: 'Brazil',
      flag: '🇧🇷',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_31_thumb_848a38c3ff.jpg',
      bio: 'Beach lover & music enthusiast 🏖️🎧'
    },
    {
      id: 'usr_10',
      name: 'Aria Taylor',
      gender: 'female',
      age: 24,
      country: 'UK',
      flag: '🇬🇧',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_32_thumb_2cc404b9e2.jpg',
      bio: 'Bookworm and pet lover 🐶📚'
    },
    {
      id: 'usr_11',
      name: 'Emma Johnson',
      gender: 'female',
      age: 22,
      country: 'Canada',
      flag: '🇨🇦',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_32_thumb_85628c8d0e.jpg',
      bio: 'Photography student. Say cheese! 📸✨'
    },
    {
      id: 'usr_12',
      name: 'Hannah Wilson',
      gender: 'female',
      age: 23,
      country: 'Australia',
      flag: '🇦🇺',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_34_thumb_5aaa875450.jpg',
      bio: 'Surfing, sunshine, and positive vibes 🏄‍♀️☀️'
    },
    {
      id: 'usr_13',
      name: 'Lily Brown',
      gender: 'female',
      age: 21,
      country: 'New Zealand',
      flag: '🇳🇿',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_35_thumb_86f09eb120.jpg',
      bio: 'Nature walks and acoustic music 🌿🎶'
    },
    {
      id: 'usr_14',
      name: 'Zoe Davies',
      gender: 'female',
      age: 24,
      country: 'Wales',
      flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_39_thumb_9a6017c292.jpg',
      bio: 'Let’s enjoy good talks and virtual coffee ☕'
    },
    {
      id: 'usr_15',
      name: 'Sophie Clark',
      gender: 'female',
      age: 22,
      country: 'Scotland',
      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_3_thumb_1c308df074.jpg',
      bio: 'Always looking on the bright side of life ☀️'
    },
    {
      id: 'usr_16',
      name: 'Emily Evans',
      gender: 'female',
      age: 23,
      country: 'Ireland',
      flag: '🇮🇪',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_40_thumb_988bbaac3d.jpg',
      bio: 'Irish dancer and history geek 🍀💃'
    },
    {
      id: 'usr_17',
      name: 'Grace Roberts',
      gender: 'female',
      age: 25,
      country: 'Norway',
      flag: '🇳🇴',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_45_thumb_aa800007a0.jpg',
      bio: 'Skiing, winter hiking, and hot cocoa ❄️☕'
    },
    {
      id: 'usr_18',
      name: 'Ruby Walker',
      gender: 'female',
      age: 22,
      country: 'Denmark',
      flag: '🇩🇰',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_4_thumb_8489afdea9.jpg',
      bio: 'Hygge lover, designer, and bakery fan 🥐🎨'
    },
    {
      id: 'usr_19',
      name: 'Lucy Hall',
      gender: 'female',
      age: 24,
      country: 'Netherlands',
      flag: '🇳🇱',
      status: 'online',
      popular: false,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_6_thumb_12c7bc526d.jpg',
      bio: 'Cycling, tulip fields, and coding 🌷🚲'
    },
    {
      id: 'usr_20',
      name: 'Isla Green',
      gender: 'female',
      age: 21,
      country: 'Switzerland',
      flag: '🇨🇭',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_8_thumb_42dfbb79c3.jpg',
      bio: 'Alpine hiking and chocolate enthusiast 🍫🏔️'
    },
    {
      id: 'usr_21',
      name: 'Zara Wright',
      gender: 'female',
      age: 23,
      country: 'Austria',
      flag: '🇦🇹',
      status: 'online',
      popular: true,
      rate: '1 coin/min',
      avatar: '/Profile Images/imgi_8_thumb_9350032849.jpg',
      bio: 'Classical music lover and pastry baker 🎻🍰'
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
    callBtnGift: document.getElementById('call-btn-gift'),
    callBtnNext: document.getElementById('call-btn-next'),
    callBtnEnd: document.getElementById('call-btn-end'),
    
    // Sheets & Canvas FX
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

    toast: document.getElementById('toast-notification'),

    // Supabase Auth Elements
    authOverlay: document.getElementById('auth-overlay'),
    authConfigModal: document.getElementById('auth-config-modal'),
    btnAuthConfig: document.getElementById('btn-auth-config'),
    supabaseUrlInput: document.getElementById('supabase-url-input'),
    supabaseKeyInput: document.getElementById('supabase-key-input'),
    btnConfigSave: document.getElementById('btn-config-save'),
    btnConfigCancel: document.getElementById('btn-config-cancel'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    btnGuestLogin: document.getElementById('btn-guest-login'),
    tabLoginBtn: document.getElementById('tab-login-btn'),
    tabRegisterBtn: document.getElementById('tab-register-btn')
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
    initSupabase();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    }
  }

  // ================= SUPABASE CLIENT & AUTHENTICATION =================
  let db = null;
  let currentUser = null;
  let myProfile = null;

  function initSupabase() {
    let url = localStorage.getItem('supabase_url');
    let key = localStorage.getItem('supabase_key');

    // Sanitizer: clear invalid/blank settings inputs
    if (url === 'undefined' || url === 'null' || (url && url.trim() === '')) {
      localStorage.removeItem('supabase_url');
      url = null;
    }
    if (key === 'undefined' || key === 'null' || (key && key.trim() === '')) {
      localStorage.removeItem('supabase_key');
      key = null;
    }

    url = url || 'https://blxdnakypaawuktjufme.supabase.co';
    key = key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseGRuYWt5cGFhd3VrdGp1Zm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjgxODYsImV4cCI6MjA5NDcwNDE4Nn0.nQzOnYHn5Ocz-poVSfemBIRYEy1WHbXB3Hip7a20QfY';

    if (url && key && typeof window.supabase !== 'undefined') {
      try {
        db = window.supabase.createClient(url, key);
        console.log('[Cuty Supabase] Client initialized successfully');
        
        // Listen to Auth events
        db.auth.onAuthStateChange(async (event, session) => {
          if (session) {
            currentUser = session.user;
            await loadUserProfile(currentUser.id);
            elements.authOverlay.classList.remove('active');
            
            // Subscribe to real-time message tables
            subscribeToDMMessages();
          } else {
            currentUser = null;
            myProfile = null;
            elements.authOverlay.classList.add('active');
          }
        });

        // Trigger immediate check
        checkActiveSession();

      } catch (err) {
        console.log('[Cuty Supabase] Failed to initialize:', err);
        showToast('Supabase Init Error: ' + err.message);
        elements.authOverlay.classList.add('active');
      }
    } else {
      console.log('[Cuty Supabase] Credentials missing or library not loaded.');
      if (typeof window.supabase === 'undefined') {
        showToast('⚠️ Supabase JS library failed to load!');
      } else {
        showToast('⚠️ Database configuration missing!');
      }
      elements.authOverlay.classList.add('active');
    }
  }

  async function checkActiveSession() {
    if (!db) return;
    const { data } = await db.auth.getSession();
    if (data.session) {
      currentUser = data.session.user;
      await loadUserProfile(currentUser.id);
      elements.authOverlay.classList.remove('active');
    }
  }

  async function loadUserProfile(userId) {
    if (!db) return;
    try {
      const { data, error } = await db
        .from('cuty_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        myProfile = data;
        state.coins = data.coins;
        renderCoinBalance();

        // Update UI info
        document.getElementById('my-profile-name').textContent = data.username;
        document.getElementById('my-profile-avatar').src = data.avatar_url;
        document.getElementById('radar-user-avatar').src = data.avatar_url;
        
        // Update online status in database
        await db
          .from('cuty_profiles')
          .update({ online_status: 'online', updated_at: new Date() })
          .eq('id', userId);

        // Register user on socket server with correct username
        if (socket && socket.connected) {
          socket.emit('register-user', {
            id: userId,
            name: data.username,
            gender: data.gender || 'female',
            coins: data.coins,
            avatar: data.avatar_url
          });
        }
      }
    } catch (err) {
      console.log('Error loading profile:', err.message);
    }
  }

  async function updateDBCoins(newCoins) {
    if (!db || !currentUser) return;
    try {
      await db
        .from('cuty_profiles')
        .update({ coins: newCoins })
        .eq('id', currentUser.id);
    } catch (err) {
      console.log('Failed to save coin balance to Supabase:', err);
    }
  }

  // Auth Operations
  async function handleSignUp(email, password, username, gender) {
    if (!db) {
      showToast('⚠️ Please link your Supabase database first!');
      return;
    }
    try {
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            gender,
            country: 'Global',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          }
        }
      });

      if (error) throw error;
      showToast('Account created successfully! Logging in...');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    }
  }

  async function handleSignIn(email, password) {
    if (!db) {
      showToast('⚠️ Please link your Supabase database first!');
      return;
    }
    try {
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      showToast('Logged in successfully!');
    } catch (err) {
      showToast(`❌ Login failed: ${err.message}`);
    }
  }

  async function handleGuestLogin() {
    const guestId = Math.floor(Math.random() * 1000000);
    const guestEmail = `guest_${guestId}@cutylive.app`;
    const guestPassword = `guest_pass_${guestId}`;
    
    const randomNames = ['Alex', 'Emma', 'Taylor', 'Jordan', 'Sam', 'Chris', 'Jamie', 'Morgan', 'Casey', 'Robin'];
    const guestName = randomNames[Math.floor(Math.random() * randomNames.length)];
    
    const randomGender = Math.random() > 0.5 ? 'female' : 'male';

    await handleSignUp(guestEmail, guestPassword, guestName, randomGender);
    setTimeout(() => {
      handleSignIn(guestEmail, guestPassword);
    }, 1200);
  }

  // Direct Message Sync
  async function dbSendDM(receiverUserId, text) {
    if (!db || !currentUser) return;
    try {
      await db
        .from('cuty_messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: receiverUserId,
          text: text
        });
    } catch (err) {
      console.log('Failed to save message to database:', err);
    }
  }

  async function dbLoadDMHistory(partnerUserId) {
    if (!db || !currentUser) return;
    try {
      const { data, error } = await db
        .from('cuty_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${partnerUserId}),and(sender_id.eq.${partnerUserId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        state.dmMessages[partnerUserId] = data.map(m => ({
          sender: m.sender_id === currentUser.id ? 'me' : 'them',
          text: m.text
        }));
        renderDMMessages();
      }
    } catch (err) {
      console.log('Failed to fetch messages:', err);
    }
  }

  function subscribeToDMMessages() {
    if (!db || !currentUser) return;
    db.channel('messages-realtime-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cuty_messages' },
        (payload) => {
          const msg = payload.new;
          if (msg.receiver_id === currentUser.id || msg.sender_id === currentUser.id) {
            const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
            if (!state.dmMessages[partnerId]) state.dmMessages[partnerId] = [];
            
            // Check if already present to avoid duplicates
            const exists = state.dmMessages[partnerId].some(m => m.text === msg.text);
            if (!exists) {
              state.dmMessages[partnerId].push({
                sender: msg.sender_id === currentUser.id ? 'me' : 'them',
                text: msg.text
              });
              if (state.dmPartner && state.dmPartner.id === partnerId) {
                renderDMMessages();
              }
            }
          }
        }
      )
      .subscribe();
  }

  // Report Blocks Persistence
  async function dbBlockUser(blockedUserId) {
    if (!db || !currentUser) return;
    try {
      await db
        .from('cuty_blocks')
        .insert({
          blocker_id: currentUser.id,
          blocked_id: blockedUserId
        });
    } catch (err) {
      console.log('Block record failed:', err);
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
          const randomNames = ['Alex', 'Emma', 'Taylor', 'Jordan', 'Sam', 'Chris', 'Jamie', 'Morgan', 'Casey', 'Robin'];
          const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
          socket.emit('register-user', {
            id: 'usr_me_' + Math.floor(Math.random() * 1000),
            name: randomName,
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
          if (!state.localStream) {
            await setupCamera();
          }
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
          nextMatch();
        });

        socket.on('call-text-message', (data) => {
          const partnerName = state.currentPartner ? getFirstName(state.currentPartner.name) : 'Partner';
          appendCallChatBubble(partnerName, data.text);
        });

        socket.on('call-gift', (data) => {
          const partnerName = state.currentPartner ? getFirstName(state.currentPartner.name) : 'Partner';
          const giftNames = { rose: 'Rose 🌹', diamond: 'Diamond 💎', crown: 'Crown 👑', car: 'Supercar 🏎️' };
          const giftCosts = { rose: 1, diamond: 5, crown: 10, car: 25 };
          
          showToast(`🎁 Received ${giftNames[data.giftType]} from partner!`);
          SoundFX.playGiftPop();
          appendCallChatBubble('System', `${partnerName} sent ${giftNames[data.giftType]}!`, true);
          triggerGiftParticles(data.giftType);

          // Credit coins to receiver
          const addedCoins = giftCosts[data.giftType] || 0;
          state.coins += addedCoins;
          renderCoinBalance();
          updateDBCoins(state.coins);
        });
      } catch (err) {
        console.log('Standalone mode without active socket server.');
      }
    }
  }

  let iceCandidatesQueue = [];

  async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(rtcConfig);
    iceCandidatesQueue = [];

    if (state.localStream) {
      state.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, state.localStream);
      });
    }

    peerConnection.ontrack = (event) => {
      if (elements.remoteVideo && event.streams[0]) {
        elements.simulatedCanvasWrapper.style.display = 'none';
        elements.remoteVideo.srcObject = event.streams[0];
        elements.remoteVideo.play().catch(err => {
          console.log("Remote video autoplay blocked, trying play again:", err);
        });
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
    launchVideoCall(partner, true);
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
    await processQueuedCandidates();
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
      await processQueuedCandidates();
    }
  }

  async function handleSignalCandidate(candidate) {
    if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.log("Error adding ice candidate:", e);
      }
    } else {
      iceCandidatesQueue.push(candidate);
    }
  }

  async function processQueuedCandidates() {
    if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
      while (iceCandidatesQueue.length > 0) {
        const candidate = iceCandidatesQueue.shift();
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.log("Error adding queued candidate:", e);
        }
      }
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

  async function startRandomMatch() {
    if (state.coins < 1) {
      showToast('⚠️ You need at least 1 coin to start a call!');
      openCoinStore();
      return;
    }

    if (isSearchingMatch) {
      cancelMatchSearch();
      return;
    }

    // Ensure camera is fully ready
    if (!state.localStream) {
      elements.matchStatusText.textContent = 'Initializing camera...';
      await setupCamera();
    }

    isSearchingMatch = true;

    // UI searching state
    elements.startMatchBtn.classList.add('searching');
    elements.startMatchBtnText.textContent = 'Cancel Search';
    elements.matchStatusText.textContent = 'Finding cute people nearby...';
    elements.matchSubstatusText.textContent = `Filter: ${state.activeGenderFilter.toUpperCase()}`;

    SoundFX.playBeep(400, 'triangle', 0.2, 0.15);

    // Send Socket queue request if connected
    if (socket && socket.connected) {
      socket.emit('join-match-queue', { genderFilter: state.activeGenderFilter });
    }
  }

  function cancelMatchSearch() {
    isSearchingMatch = false;
    elements.startMatchBtn.classList.remove('searching');
    elements.startMatchBtnText.textContent = 'Start Random Match';
    elements.matchStatusText.textContent = 'Ready to meet cute people?';
    if (socket && socket.connected) {
      socket.emit('leave-match-queue');
    }
  }

  // ================= LIVE VIDEO CALL SYSTEM =================
  function launchVideoCall(partner, isRealCall = false) {
    state.inCall = true;
    state.currentPartner = partner;
    state.callDurationSeconds = 0;

    // Populate Partner UI
    elements.callPartnerName.textContent = getFirstName(partner.name);
    elements.callPartnerFlag.textContent = partner.flag || '🌎';
    elements.callPartnerLocation.textContent = partner.country || 'Global';
    elements.callPartnerAvatar.src = partner.avatar;
    elements.callTimerDisplay.textContent = '00:00';
    elements.callChatOverlay.innerHTML = '';

    // Show Call Modal
    elements.callModal.classList.add('active');

    // Setup Video Feed
    if (isRealCall) {
      elements.simulatedCanvasWrapper.style.display = 'none';
      if (elements.remoteVideo) {
        elements.remoteVideo.style.display = 'block';
      }
    } else {
      elements.simulatedCanvasWrapper.style.display = 'block';
      if (elements.remoteVideo) {
        elements.remoteVideo.style.display = 'none';
      }
      setupRemotePartnerCanvas(partner);
    }

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

      partnerCanvasAnimFrame = requestAnimationFrame(drawPartner);
    }

    img.onload = () => {
      drawPartner();
    };
    // fallback start
    drawPartner();
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
        updateDBCoins(state.coins);
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

    if (socket && socket.connected && targetPeerSocketId) {
      socket.emit('end-call', { targetSocketId: targetPeerSocketId });
    }
    targetPeerSocketId = null;

    // Clean up WebRTC peer connection
    if (peerConnection) {
      try {
        peerConnection.close();
      } catch (e) {
        console.log("Error closing peerConnection:", e);
      }
      peerConnection = null;
    }

    // Clear remote video source element stream
    if (elements.remoteVideo) {
      elements.remoteVideo.srcObject = null;
    }

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
      bubble.innerHTML = `<span class="chat-author">${getFirstName(author)}:</span> ${text}`;
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
    updateDBCoins(state.coins);
    elements.giftSheet.classList.remove('active');
    SoundFX.playGiftPop();

    const giftNames = { rose: 'Rose 🌹', diamond: 'Diamond 💎', crown: 'Crown 👑', car: 'Supercar 🏎️' };
    appendCallChatBubble('System', `You sent ${giftNames[giftType]}!`, true);

    // Trigger Canvas Particle Fireworks
    triggerGiftParticles(giftType);

    if (socket && socket.connected && targetPeerSocketId) {
      socket.emit('call-gift', { targetSocketId: targetPeerSocketId, giftType: giftType });
    }
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
          <img src="${person.avatar}" alt="${getFirstName(person.name)}" class="person-thumb" />
          <span class="card-status-dot">🟢 Online</span>
          <span class="card-rate-tag">${person.rate}</span>
        </div>
        <div class="person-body">
          <div class="person-name-row">
            <span class="person-name">${getFirstName(person.name)}</span>
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
    elements.dmPartnerName.textContent = getFirstName(person.name);
    elements.dmPartnerAvatar.src = person.avatar;

    if (db && currentUser) {
      dbLoadDMHistory(person.id);
    } else {
      if (!state.dmMessages[person.id]) {
        state.dmMessages[person.id] = [];
      }
      renderDMMessages();
    }

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

    if (db && currentUser) {
      // Save directly to Supabase table
      dbSendDM(state.dmPartner.id, text);
    } else {
      if (!state.dmMessages[state.dmPartner.id]) state.dmMessages[state.dmPartner.id] = [];
      state.dmMessages[state.dmPartner.id].push({ sender: 'me', text });
      renderDMMessages();
      SoundFX.playBeep(750, 'sine', 0.08, 0.1);
    }

    elements.dmInput.value = '';
    SoundFX.playBeep(750, 'sine', 0.08, 0.1);
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
          <img src="${item.avatar}" alt="${getFirstName(item.name)}" class="history-avatar" />
          <div>
            <div class="history-name">${getFirstName(item.name)} ${item.flag}</div>
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
        if (!state.currentPartner) return;
        const confirmReport = confirm(`Are you sure you want to report and block ${getFirstName(state.currentPartner.name)}?`);
        if (confirmReport) {
          dbBlockUser(state.currentPartner.id);
          showToast('🛡️ User reported & blocked. Finding next match...');
          nextMatch();
        }
      });
    }
    
    // Mute Button
    elements.callBtnMute.addEventListener('click', () => {
      state.audioMuted = !state.audioMuted;
      elements.callBtnMute.style.background = state.audioMuted ? '#ff3b30' : 'rgba(255,255,255,0.1)';
      showToast(state.audioMuted ? 'Microphone Muted' : 'Microphone Active');
    });

    // Gift Sheet Toggle
    elements.callBtnGift.addEventListener('click', () => {
      elements.giftSheet.classList.toggle('active');
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

      if (socket && socket.connected && targetPeerSocketId) {
        socket.emit('call-text-message', { targetSocketId: targetPeerSocketId, text: text });
      }
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

    // Supabase Auth Settings Dialog
    elements.btnAuthConfig.addEventListener('click', () => {
      elements.supabaseUrlInput.value = localStorage.getItem('supabase_url') || '';
      elements.supabaseKeyInput.value = localStorage.getItem('supabase_key') || '';
      elements.authConfigModal.classList.add('active');
    });

    elements.btnConfigCancel.addEventListener('click', () => {
      elements.authConfigModal.classList.remove('active');
    });

    elements.btnConfigSave.addEventListener('click', () => {
      const url = elements.supabaseUrlInput.value.trim();
      const key = elements.supabaseKeyInput.value.trim();

      if (url && key) {
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);
        elements.authConfigModal.classList.remove('active');
        showToast('🔑 Credentials saved. Re-connecting...');
        initSupabase();
      } else {
        showToast('⚠️ Please enter both URL and Key!');
      }
    });

    // Auth Form Toggle (Login / Register)
    elements.tabLoginBtn.addEventListener('click', () => {
      elements.tabLoginBtn.classList.add('active');
      elements.tabRegisterBtn.classList.remove('active');
      elements.loginForm.classList.add('active');
      elements.registerForm.classList.remove('active');
    });

    elements.tabRegisterBtn.addEventListener('click', () => {
      elements.tabRegisterBtn.classList.add('active');
      elements.tabLoginBtn.classList.remove('active');
      elements.registerForm.classList.add('active');
      elements.loginForm.classList.remove('active');
    });

    // Login Form Submit
    elements.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      handleSignIn(email, pass);
    });

    // Register Form Submit
    elements.registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-password').value;
      const gender = document.getElementById('reg-gender').value;
      handleSignUp(email, pass, username, gender);
    });

    // Guest Button Trigger
    elements.btnGuestLogin.addEventListener('click', () => {
      handleGuestLogin();
    });
  }

  // Start Application
  init();
});

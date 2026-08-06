(function() {
  'use strict';

  // State Management
  let isOpen = false;
  let isExpanded = false;
  let isSpeaking = false;
  let isListening = false;
  let isMuted = false;
  let audioUnlocked = false;
  let conversationHistory = [];
  let recognition = null;
  let greetingPlayed = false;
  let autoGreetingShown = false;

  const GREETING_TEXT = "Hey! 👋 Welcome to Rameshwor Chaudhary's portfolio. I'm Rameshwor Chaudhary — AI & ML Developer.";

  // Unlock Speech Synthesis Audio Engine on mobile touch/click
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0.01;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn('Audio unlock warning:', e);
      }
    }
  }

  // Initialize Assistant DOM
  function initDOM() {
    if (document.getElementById('ishwor-panel')) return;

    // Attach unlock listeners for mobile touch
    document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    document.addEventListener('click', unlockAudio, { once: true, passive: true });

    // Inject Trigger Button
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'ishwor-trigger-btn';
    triggerBtn.setAttribute('aria-label', 'Open Ishwor AI Voice Assistant');
    triggerBtn.innerHTML = `
      <div class="ishwor-avatar-ring">🎙️</div>
      <div class="ishwor-btn-label">
        <span class="ishwor-btn-title">Ask Ishwor AI</span>
        <span class="ishwor-btn-sub">Voice Assistant</span>
      </div>
    `;
    document.body.appendChild(triggerBtn);

    // Inject Autoplay Voice Toast
    const voiceToast = document.createElement('div');
    voiceToast.id = 'ishwor-voice-toast';
    voiceToast.className = 'hidden';
    voiceToast.innerHTML = `
      <span>🔊</span>
      <span>Tap to hear Ishwor's Welcome Greeting</span>
      <span style="font-weight:bold; margin-left: auto;">✕</span>
    `;
    document.body.appendChild(voiceToast);

    // Inject Main Panel
    const panel = document.createElement('div');
    panel.id = 'ishwor-panel';
    panel.innerHTML = `
      <div class="ishwor-mobile-bar"></div>
      <div class="ishwor-header">
        <div class="ishwor-header-left">
          <div class="ishwor-avatar">🤖</div>
          <div class="ishwor-title-box">
            <span class="ishwor-name">Ishwor AI</span>
            <div class="ishwor-status-badge">
              <span class="ishwor-dot" id="ishwor-dot"></span>
              <span id="ishwor-status-text">Idle</span>
            </div>
          </div>
        </div>
        <div class="ishwor-header-actions">
          <button class="ishwor-icon-btn" id="ishwor-expand-btn" title="Expand View">⤢</button>
          <button class="ishwor-icon-btn" id="ishwor-mute-btn" title="Toggle Voice Mute">🔊</button>
          <button class="ishwor-icon-btn" id="ishwor-close-btn" title="Minimize">✕</button>
        </div>
      </div>

      <div class="ishwor-body" id="ishwor-body">
        <div class="ishwor-msg bot">
          <div class="ishwor-bubble">
            🙏 Namaste! I am <strong>Ishwor</strong>, Rameshwor Chaudhary's AI Voice Assistant.
            <br><br>
            Ask me anything about Rameshwor's AI/ML engineering, projects, skills, education at Chandigarh University, or general AI and technology!
          </div>
          <div class="ishwor-msg-footer">
            <button class="ishwor-speak-btn" data-speak="Namaste! I am Ishwor, Rameshwor Chaudhary's AI Voice Assistant. Ask me anything about Rameshwor's AI ML engineering, projects, skills, education at Chandigarh University, or general AI and technology!">🔊 Listen</button>
            <span class="ishwor-time">Just now</span>
          </div>
        </div>

        <div class="ishwor-chips">
          <button class="ishwor-chip" data-q="Who is Rameshwor Chaudhary?">Who is Rameshwor?</button>
          <button class="ishwor-chip" data-q="What are Rameshwor's top AI projects?">AI Projects</button>
          <button class="ishwor-chip" data-q="What programming languages and skills does he know?">Skills & Tech</button>
          <button class="ishwor-chip" data-q="Tell me about his education and university.">Education</button>
          <button class="ishwor-chip" data-q="What is Artificial Intelligence?">What is AI?</button>
          <button class="ishwor-chip" data-q="How can I contact Rameshwor for opportunities?">Contact Info</button>
        </div>
      </div>

      <div class="ishwor-footer">
        <div class="ishwor-input-row">
          <input type="text" id="ishwor-input" class="ishwor-input" placeholder="Ask in English or Hinglish..." autocomplete="off" />
          <button class="ishwor-action-btn" id="ishwor-mic-btn" title="Speak question">🎤</button>
          <button class="ishwor-action-btn ishwor-send-btn" id="ishwor-send-btn" title="Send message">➤</button>
        </div>
        <div class="ishwor-footer-hint">
          <span>Supported: English & Hinglish</span>
          <span>Tap mic to speak</span>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    panel.classList.remove('open');
    triggerBtn.classList.remove('active');

    // Setup Event Listeners
    triggerBtn.addEventListener('click', () => {
      unlockAudio();
      togglePanel();
      if (!greetingPlayed) {
        playWelcomeGreeting(true);
      }
    });

    triggerBtn.addEventListener('mouseenter', unlockAudio);
    triggerBtn.addEventListener('touchstart', unlockAudio, { passive: true });

    document.getElementById('ishwor-close-btn').addEventListener('click', togglePanel);
    document.getElementById('ishwor-expand-btn').addEventListener('click', toggleExpand);
    document.getElementById('ishwor-send-btn').addEventListener('click', handleUserSubmit);
    document.getElementById('ishwor-mute-btn').addEventListener('click', toggleMute);

    const inputEl = document.getElementById('ishwor-input');
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUserSubmit();
    });

    // Delegated Clicks on Chat Body (Chips & Manual Speak Buttons)
    document.getElementById('ishwor-body').addEventListener('click', (e) => {
      unlockAudio();

      // Chip click
      const chip = e.target.closest('.ishwor-chip');
      if (chip) {
        const question = chip.getAttribute('data-q');
        if (question) {
          inputEl.value = question;
          handleUserSubmit();
        }
        return;
      }

      // Manual Listen button on message
      const speakBtn = e.target.closest('.ishwor-speak-btn');
      if (speakBtn) {
        const textToSpeak = speakBtn.getAttribute('data-speak');
        if (textToSpeak) {
          speakText(textToSpeak);
        }
      }
    });

    // Voice Toast Click
    voiceToast.addEventListener('click', () => {
      unlockAudio();
      playWelcomeGreeting(true);
      voiceToast.classList.add('hidden');
    });

    // Setup Speech Recognition
    setupSpeechRecognition();
  }

  // Toggle Panel
  function togglePanel() {
    isOpen = !isOpen;
    const panel = document.getElementById('ishwor-panel');
    const triggerBtn = document.getElementById('ishwor-trigger-btn');

    if (isOpen) {
      panel.classList.add('open');
      triggerBtn.classList.add('active');
      setTimeout(() => {
        const input = document.getElementById('ishwor-input');
        if (input) input.focus();
      }, 200);
    } else {
      panel.classList.remove('open');
      triggerBtn.classList.remove('active');
      stopSpeech();
    }
  }

  // Toggle Expand
  function toggleExpand() {
    isExpanded = !isExpanded;
    const panel = document.getElementById('ishwor-panel');
    const expandBtn = document.getElementById('ishwor-expand-btn');

    if (isExpanded) {
      panel.classList.add('expanded');
      expandBtn.textContent = '⤦';
      expandBtn.title = 'Contract View';
    } else {
      panel.classList.remove('expanded');
      expandBtn.textContent = '⤢';
      expandBtn.title = 'Expand View';
    }
  }

  // Toggle Mute
  function toggleMute() {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('ishwor-mute-btn');
    if (isMuted) {
      muteBtn.textContent = '🔇';
      stopSpeech();
    } else {
      muteBtn.textContent = '🔊';
    }
  }

  // Set Status
  function setStatus(state, text) {
    const dot = document.getElementById('ishwor-dot');
    const statusText = document.getElementById('ishwor-status-text');

    if (!dot || !statusText) return;

    dot.className = 'ishwor-dot ' + (state || '');
    statusText.textContent = text || 'Idle';
  }

  // Helper to get best voice
  function getBestVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    return voices.find(v => 
      (v.lang.startsWith('en') || v.lang.startsWith('hi')) && 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Rishi'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  // Speech Synthesis
  function speakText(text) {
    if (isMuted || !('speechSynthesis' in window)) {
      return;
    }

    stopSpeech();
    unlockAudio();

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    isSpeaking = true;
    setStatus('speaking', 'Speaking...');

    const plainText = text
      .replace(/[\*\_\`\#]/g, '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!plainText) return;

    const utterance = new SpeechSynthesisUtterance(plainText);

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voice = getBestVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      isSpeaking = false;
      setStatus('', 'Idle');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      isSpeaking = false;
      setStatus('', 'Idle');
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('speechSynthesis.speak exception:', err);
      isSpeaking = false;
      setStatus('', 'Idle');
    }
  }

  function stopSpeech() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    setStatus('', 'Idle');
  }

  // Speech Recognition (STT)
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('ishwor-mic-btn');

    if (!SpeechRecognition) {
      if (micBtn) {
        micBtn.style.opacity = '0.5';
        micBtn.title = 'Speech recognition not supported in this browser';
      }
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening = true;
      setStatus('listening', 'Listening...');
      micBtn.classList.add('active-mic');
      stopSpeech();
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      document.getElementById('ishwor-input').value = transcript;
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition error:', event.error);
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
      const inputVal = document.getElementById('ishwor-input').value.trim();
      if (inputVal) {
        handleUserSubmit();
      }
    };

    micBtn.addEventListener('click', () => {
      unlockAudio();
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Mic start failed:', e);
        }
      }
    });
  }

  function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('ishwor-mic-btn');
    if (micBtn) micBtn.classList.remove('active-mic');
    setStatus('', 'Idle');
  }

  // Format markdown to HTML
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^\s*[\-\*]\s+(.*)$/gm, '• $1');

    return html.replace(/\n/g, '<br>');
  }

  // Handle User Submission
  async function handleUserSubmit() {
    const inputEl = document.getElementById('ishwor-input');
    const query = inputEl.value.trim();

    if (!query) return;

    inputEl.value = '';
    stopSpeech();
    unlockAudio();

    // Append User Message
    appendMessage(query, 'user');
    conversationHistory.push({ role: 'user', content: query });

    // Thinking state
    setStatus('thinking', 'Thinking...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: conversationHistory.slice(-6)
        })
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "I'm having trouble getting an answer right now. Please try again!";

      appendMessage(reply, 'bot');
      conversationHistory.push({ role: 'assistant', content: reply });

      // Speak response
      speakText(reply);

    } catch (err) {
      console.error('API Error:', err);
      const errMsg = "Sorry bhai, I'm having trouble connecting right now. Please check your connection and try again!";
      appendMessage(errMsg, 'bot');
      speakText(errMsg);
    } finally {
      setStatus('', 'Idle');
    }
  }

  // Append Message to Chat UI
  function appendMessage(text, sender) {
    const bodyEl = document.getElementById('ishwor-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = `ishwor-msg ${sender}`;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formattedText = sender === 'bot' ? formatMarkdown(text) : text.replace(/</g, '&lt;').replace(/\n/g, '<br>');
    const plainTextAttr = text.replace(/"/g, '&quot;').replace(/[\*\_\`]/g, '');

    if (sender === 'bot') {
      msgDiv.innerHTML = `
        <div class="ishwor-bubble">${formattedText}</div>
        <div class="ishwor-msg-footer">
          <button class="ishwor-speak-btn" data-speak="${plainTextAttr}">🔊 Listen</button>
          <span class="ishwor-time">${now}</span>
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="ishwor-bubble">${formattedText}</div>
        <span class="ishwor-time">${now}</span>
      `;
    }

    bodyEl.appendChild(msgDiv);
    
    // Scroll to bottom
    setTimeout(() => {
      bodyEl.scrollTo({ top: bodyEl.scrollHeight, behavior: 'smooth' });
    }, 50);
  }

  function showAutoGreeting() {
    if (autoGreetingShown) return;
    autoGreetingShown = true;

    const hero = document.getElementById('hero');
    if (!hero) return;

    let greetingEl = document.getElementById('hero-auto-greeting');
    if (!greetingEl) {
      greetingEl = document.createElement('div');
      greetingEl.id = 'hero-auto-greeting';
      greetingEl.className = 'hero-auto-greeting';
      greetingEl.setAttribute('aria-live', 'polite');
      greetingEl.innerHTML = `
        <p>Hey! 👋 Welcome to Rameshwor Chaudhary's portfolio.</p>
        <p>I'm <strong>Rameshwor Chaudhary</strong> — AI & ML Developer.</p>
      `;
      const titleEl = hero.querySelector('.hero-title-main');
      if (titleEl) {
        hero.insertBefore(greetingEl, titleEl);
      } else {
        hero.prepend(greetingEl);
      }
    }

    requestAnimationFrame(() => {
      greetingEl.classList.add('visible');
    });
  }

  // Play Welcome Greeting
  function playWelcomeGreeting(force) {
    if (greetingPlayed && !force) return;
    greetingPlayed = true;

    if (!('speechSynthesis' in window)) return;

    unlockAudio();

    if (speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        triggerGreetingUtterance(force);
      };
      setTimeout(() => triggerGreetingUtterance(force), 300);
    } else {
      triggerGreetingUtterance(force);
    }
  }

  function triggerGreetingUtterance(force) {
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(GREETING_TEXT);
    utterance.rate = 1.0;

    const voice = getBestVoice();
    if (voice) utterance.voice = voice;

    let greetingStarted = false;
    const toast = document.getElementById('ishwor-voice-toast');

    utterance.onstart = () => {
      greetingStarted = true;
      setStatus('speaking', 'Speaking...');
      if (toast) toast.classList.add('hidden');
    };

    utterance.onend = () => {
      setStatus('', 'Idle');
    };

    utterance.onerror = (e) => {
      console.warn('Greeting audio note:', e);
      setStatus('', 'Idle');
      if (!force && toast) {
        toast.classList.remove('hidden');
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Autoplay note:', e);
      if (!force && toast) {
        toast.classList.remove('hidden');
      }
    }

    setTimeout(() => {
      if (!greetingStarted && !force && toast) {
        toast.classList.remove('hidden');
      }
    }, 1500);
  }

  function scheduleAutoGreeting() {
    setTimeout(() => {
      showAutoGreeting();
      playWelcomeGreeting(false);
    }, 800);
  }

  // On DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDOM();
      window.addEventListener('load', scheduleAutoGreeting, { once: true });
    });
  } else {
    initDOM();
    if (document.readyState === 'complete') {
      scheduleAutoGreeting();
    } else {
      window.addEventListener('load', scheduleAutoGreeting, { once: true });
    }
  }

})();

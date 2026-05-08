function resizeGameCanvas() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  const shell = canvas.closest('.gameShell');
  if (!shell) return;

  const bounds = shell.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;

  const nextWidth = Math.max(320, Math.floor(bounds.width));
  const nextHeight = Math.max(180, Math.floor(bounds.height));

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }
}

function initGameOpening() {
  const openingScreen = document.getElementById('openingScreen');
  const gameCanvas = document.getElementById('gameCanvas');
  const newGameBtn = document.getElementById('newGameBtn');
  const continueBtn = document.getElementById('continueBtn');
  const creditsBtn = document.getElementById('creditsBtn');
  const sceneZeroOverlay = document.getElementById('sceneZeroOverlay');
  const sceneZeroText = document.getElementById('sceneZeroText');
  const sceneCreditsOverlay = document.getElementById('sceneCreditsOverlay');
  const sceneCreditsText = document.getElementById('sceneCreditsText');
  const storyScene = document.getElementById('storyScene');
  const storyNarration = document.getElementById('storyNarration');
  const interactionTitle = document.getElementById('interactionTitle');
  const interactionPrompt = document.getElementById('interactionPrompt');
  const interactionActions = document.getElementById('interactionActions');
  const phoneNotification = document.getElementById('phoneNotification');
  const statHealth = document.getElementById('statHealth');
  const statHunger = document.getElementById('statHunger');
  const statThirst = document.getElementById('statThirst');
  const statMental = document.getElementById('statMental');  
  const statHealthFill = document.getElementById('statHealthFill');
  const statHungerFill = document.getElementById('statHungerFill');
  const statThirstFill = document.getElementById('statThirstFill');
  const statMentalFill = document.getElementById('statMentalFill');
  const statsPanel = document.getElementById('statsPanel');
  const statsToggleBtn = document.getElementById('statsToggleBtn');
  const statsPanelBody = document.getElementById('statsPanelBody');

  if(!openingScreen || 
    !gameCanvas || 
    !newGameBtn || 
    !continueBtn || 
    !creditsBtn || 
    !sceneZeroOverlay || 
    !sceneZeroText || 
    !sceneCreditsOverlay ||
    !sceneCreditsText|| 
    !storyScene || 
    !storyNarration || 
    !interactionTitle || 
    !interactionPrompt || 
    !interactionActions || 
    !phoneNotification || 
    !statHealth || 
    !statHunger || 
    !statThirst || 
    !statMental ||
    !statHealthFill ||
    !statHungerFill ||
    !statThirstFill ||
    !statMentalFill ||
    !statsPanel ||
    !statsToggleBtn ||
    !statsPanelBody
  ) return;


  const sceneZeroLines = [
    'You wake up to a life that is finally yours',
    'No one will tell you what to do anymore.',
    'That also means no one will save you if you mess up.',
    '- Good luck'
  ];

  const sceneCreditLines = [
    'The lesson was never only about the tasks.',
    'Not the oil changes.',
    'Not the budgeting spreadsheets.',
    'Not the interviews, repairs, deadlines, or numbers.',
    'It was about learning how to continue forward',
    'in a world that rarely explains itself.',
    'You entered uncertain.',
    'Most people do.',
    'But knowledge changes people slowly.',
    'One choice at a time.',
    'One mistake corrected.',
    'One problem understood.',
    'And somewhere along the way,',
    'survival became confidence.',

    'Created by: The Chrysalis Project',
    'Game Design and Program: Jadhiel Tineo',
    'Educational Reaserch: Alejandro Torres',
    'Art and Interface Design: Daniel Santiago',
    'Concept Design: Tasiya Nelson',

    'Special Thanks:',
    'To the teachers, mentors, friends, and young people still trying to figure life out one step at a time.'
  ];

  let sceneCreditsTimeouts = [];
  let sceneZeroTimeouts = [];
  let storyTick = null;
  let narrationTypewriterTimeout = null;
  const storyState = {
    scene: 'bedroom',
    health: 100,
    hunger: 100,
    thirst: 100,
    mental: 100,
    responsibilityHabit: 0,
    currentContext: 'bed'
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateStats() {
    statHealth.textContent = `${storyState.health}%`;
    statHunger.textContent = `${storyState.hunger}%`;
    statThirst.textContent = `${storyState.thirst}%`;
    statMental.textContent = `${storyState.mental}%`;

    statHealthFill.style.width = `${storyState.health}%`;
    statHungerFill.style.width = `${storyState.hunger}%`;
    statThirstFill.style.width = `${storyState.thirst}%`;
    statMentalFill.style.width = `${storyState.mental}%`;
  }

  function setStatsPanelCollapsed(collapsed) {
    statsPanel.classList.toggle('collapsed', collapsed);
    statsToggleBtn.setAttribute('aria-expanded', String(!collapsed));
    statsToggleBtn.textContent = collapsed ? 'Show Stats' : 'Hide Stats';
  }

  statsToggleBtn.addEventListener('click', () => {
    const isCollapsed = statsPanel.classList.contains('collapsed');
    setStatsPanelCollapsed(!isCollapsed);
  });


  function setNarration(text, speaker = 'Narrator') {
    if (narrationTypewriterTimeout) {
      clearTimeout(narrationTypewriterTimeout);
      narrationTypewriterTimeout = null;
    }

    storyNarration.innerHTML = '';

    const speakerEl = document.createElement('div');
    speakerEl.className = 'storyNarrationSpeaker';
    speakerEl.textContent = speaker;

    const lineEl = document.createElement('p');
    lineEl.className = 'storyNarrationLine typing';

    storyNarration.appendChild(speakerEl);
    storyNarration.appendChild(lineEl);

    let index = 0;
    const typingDelay = 18;

    function typeNextCharacter() {
      if (index >= text.length) {
        lineEl.classList.remove('typing');
        narrationTypewriterTimeout = null;
        return;
      }

      lineEl.textContent += text.charAt(index);
      index += 1;
      narrationTypewriterTimeout = setTimeout(typeNextCharacter, typingDelay);
    }

    typeNextCharacter();
  }

  function setInteraction(title, prompt, options) {
    interactionTitle.textContent = title;
    interactionPrompt.textContent = prompt;
    interactionActions.innerHTML = '';

    options.forEach((option) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'storyBtn';
      btn.textContent = option.label;
      btn.addEventListener('click', option.onClick);
      interactionActions.appendChild(btn);
    });
  }

  function clearStoryTick() {
    if (storyTick) {
      clearInterval(storyTick);
      storyTick = null;
    }
  }

  phoneNotificationOkBtn.addEventListener('click', () => {
    phoneNotification.style.display = 'none';
  });

  function showHouseIntro() {
    storyState.scene = 'house';
    storyState.currentContext = 'move';
    setNarration('They set everything up; dishes, furniture, even the plants. From here on out, whatever happens is on me.');

    clearStoryTick();
    storyTick = setInterval(() => {
      storyState.hunger = clamp(storyState.hunger - 1, 0, 100);
      storyState.thirst = clamp(storyState.thirst - 1, 0, 100);
      updateStats();
    }, 8000);

    setInteraction('The house (Free Roam, Guided)', 'Choose where to interact first.', [
      { label: 'Go to Kitchen (Food)', onClick: openKitchen },
      { label: 'Go to Sink (Dishes)', onClick: openSink },
      { label: 'Go to Plants (Window)', onClick: openPlants }
    ]);
  }

  function openKitchen() {
    storyState.currentContext = 'kitchen';
    setNarration('This should do for now. I should really go shopping soon though');
    setInteraction('Interactable: Kitchen (Food)', 'Prompt Options: Eat a quick meal / Drink water / Close fridge', [
      {
        label: 'Eat a quick meal',
        onClick: () => {
          storyState.hunger = clamp(storyState.hunger + 18, 0, 100);
          storyState.mental = clamp(storyState.mental + 4, 0, 100);
          updateStats();
          setNarration('At least I won’t start today on empty.');
        }
      },
      {
        label: 'Drink water',
        onClick: () => {
          storyState.thirst = clamp(storyState.thirst + 20, 0, 100);
          storyState.mental = clamp(storyState.mental + 2, 0, 100);
          updateStats();
          setNarration('Water first. Think clearer after.');
        }
      },
      {
        label: 'Close fridge',
        onClick: () => {
          setNarration('I’ll deal with it later.');
        }
      },
      { label: 'Back to free roam', onClick: showHouseIntro }
    ]);
  }

  function openSink() {
    storyState.currentContext = 'sink';
    setNarration('I forgot to clean all my dishes yesterday');
    setInteraction('Interactable: Sink (Dishes)', 'Prompt Options: Wash dishes / Ignore', [
      {
        label: 'Wash dishes',
        onClick: () => {
          storyState.mental = clamp(storyState.mental + 4, 0, 100);
          storyState.hunger = clamp(storyState.hunger - 1, 0, 100);
          storyState.thirst = clamp(storyState.thirst - 1, 0, 100);
          updateStats();
          setNarration('No one’s grading this. But it feels better done.');
        }
      },
      {
        label: 'Ignore',
        onClick: () => {
          storyState.mental = clamp(storyState.mental - 2, 0, 100);
          updateStats();
          setNarration('It can wait. Everything can wait.');
        }
      },
      { label: 'Back to free roam', onClick: showHouseIntro }
    ]);
  }

  function openPlants() {
    storyState.currentContext = 'plants';
    setNarration('My plants look good, but they might need some water soon');
    setInteraction('Interactable: Plants (Window)', 'Prompt Options: Water Plants / Inspect / Ignore', [
      {
        label: 'Water Plants',
        onClick: () => {
          storyState.mental = clamp(storyState.mental + 3, 0, 100);
          storyState.responsibilityHabit += 1;
          updateStats();
          setNarration('One small thing cared for, and now they will not die');
        }
      },
      {
        label: 'Inspect',
        onClick: () => {
          setNarration('They’re alive. For now.');
        }
      },
      {
        label: 'Ignore',
        onClick: () => {
          setNarration('Not now.');
        }
      },
      { label: 'Back to free roam', onClick: showHouseIntro }
    ]);
  }

  function startSceneOne() {
    gameCanvas.style.display = 'none';
    storyScene.style.display = 'block';
    phoneNotification.style.display = 'block';
    updateStats();

    
    setInteraction('Interactable: Bed', 'Prompt: Get up / Stay a moment', [
      {
        label: 'Stay a moment',
        onClick: () => {
          storyState.mental = clamp(storyState.mental + 1, 0, 100);
          storyState.hunger = clamp(storyState.hunger - 1, 0, 100);
          storyState.thirst = clamp(storyState.thirst - 1, 0, 100);
          updateStats();
          setNarration('This place is quiet. Too quiet.');
        }
      },
      {
        label: 'Get up',
        onClick: () => {
          phoneNotification.style.display = 'none';
          showHouseIntro();
        }
      }
    ]);
  }
  
  function clearSceneZeroTimers() {
    sceneZeroTimeouts.forEach((timerId) => clearTimeout(timerId));
    sceneZeroTimeouts = [];
  }

  function clearSceneCreditsTimers() {
    sceneCreditsTimeouts.forEach((timerId) => clearTimeout(timerId));
    sceneCreditsTimeouts = [];
  }



  function typeWriterLineSceneZero(line, lineDelay = 40) {
    return new Promise((resolve) => {
      let charIndex = 0;
      const typeNext = () => {
        if (charIndex < line.length) {
          sceneZeroText.textContent += line.charAt(charIndex);
          charIndex += 1;
          const timeoutId = setTimeout(typeNext, lineDelay);
          sceneZeroTimeouts.push(timeoutId);
          return;
        }

        sceneZeroText.textContent += '\n\n';
        resolve();
      };

      typeNext();
    });
  }

  function typeWriterLine(line, lineDelay = 40) {
    return new Promise((resolve) => {
      let charIndex = 0;
      const typeNext = () => {
        if (charIndex < line.length) {
          sceneCreditsText.textContent += line.charAt(charIndex);
          charIndex += 1;
          const timeoutId = setTimeout(typeNext, lineDelay);
          sceneCreditsTimeouts.push(timeoutId);
          return;
        }

        sceneCreditsText.textContent += '\n\n';
        resolve();
      };

      typeNext();
    });
  }

  async function playSceneZero() {
    clearSceneZeroTimers();
    openingScreen.style.display = 'none';
    gameCanvas.style.display = 'none';
    sceneZeroText.textContent = '';
    sceneZeroOverlay.style.display = 'flex';

    requestAnimationFrame(() => {
      sceneZeroOverlay.classList.add('active');
    });

    for (const line of sceneZeroLines) {
      await typeWriterLineSceneZero(line);
      await new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, 500);
        sceneZeroTimeouts.push(timeoutId);
      });
    }

    const fadeOutDelay = setTimeout(() => {
      sceneZeroOverlay.classList.remove('active');

      const hideOverlayDelay = setTimeout(() => {
        sceneZeroOverlay.style.display = 'none';
        startSceneOne();
      }, 1000);

      sceneZeroTimeouts.push(hideOverlayDelay);
    }, 1200);

    sceneZeroTimeouts.push(fadeOutDelay);
  }

  async function playsceneCredits() {
    clearSceneCreditsTimers();
    openingScreen.style.display = 'none';
    gameCanvas.style.display = 'none';
    sceneCreditsText.textContent = '';
    sceneCreditsOverlay.style.display = 'flex';

    requestAnimationFrame(() => {
      sceneCreditsOverlay.classList.add('active');
    });

    for (const line of sceneCreditLines) {
      await typeWriterLine(line);
      await new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, 500);
        sceneCreditsTimeouts.push(timeoutId);
      });
    }

    const fadeOutDelay = setTimeout(() => {
      sceneCreditsOverlay.classList.remove('active');

      const hideOverlayDelay = setTimeout(() => {
        sceneCreditsOverlay.style.display = 'none';
        initGameOpening();
      }, 1000);

      sceneCreditsTimeouts.push(hideOverlayDelay);
    }, 1200);

    sceneCreditsTimeouts.push(fadeOutDelay);
  }

  newGameBtn.addEventListener('click', () => {
    playSceneZero();
  });

  continueBtn.addEventListener('click', () => {
    openingScreen.style.display = 'none';
    sceneZeroOverlay.style.display = 'none';
    gameCanvas.style.display = 'block';
    resizeGameCanvas();
  });

  creditsBtn.addEventListener('click', () => {
    playsceneCredits();
  });

}

setInterval(updateDate, 60000);
updateDate();
handleAppResize();
initGameOpening();
window.addEventListener('resize', handleAppResize);
window.addEventListener('orientationchange', handleAppResize);
document.addEventListener('fullscreenchange', handleAppResize);
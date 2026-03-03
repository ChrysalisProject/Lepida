// ----------------------
// LOGIN STATE
// ----------------------
let isLoggedIn = false;
let currentUser = null;
let currentSkill = null;
let currentLessonIndex = 0;

// ----------------------
// LocalStorage Helpers
// ----------------------
function loadUsers(){ return JSON.parse(localStorage.getItem('users') || '{}'); }
function saveUsers(obj){ localStorage.setItem('users', JSON.stringify(obj)); }

// ----------------------
// Auth
// ----------------------
function showLogin(){ document.getElementById('loginForm').style.display='block'; document.getElementById('signupForm').style.display='none'; clearFeedbacks(); 
}

function showSignup(){ document.getElementById('loginForm').style.display='none'; document.getElementById('signupForm').style.display='block'; clearFeedbacks(); 
}

function clearFeedbacks(){ document.getElementById('loginFeedback').textContent=''; document.getElementById('signupFeedback').textContent='';
}

function signup(){
  const u = document.getElementById('signupUsername').value.trim();
  const p = document.getElementById('signupPassword').value.trim();
  if(!u||!p){ document.getElementById('signupFeedback').textContent='Fill both fields.'; return; }
  const users = loadUsers();
  if(users[u]){ document.getElementById('signupFeedback').textContent='Username taken.'; return; }
  users[u]={password:p, progress:{completed:{},dailyPrompts:[]}};
  for(const s of Object.keys(lessonsData)) users[u].progress.completed[s]=new Array(lessonsData[s].length).fill(false);
  saveUsers(users);
  document.getElementById('signupFeedback').textContent='Account created — you can login.';
  showLogin();
}

function login(){
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value.trim();
  const users = loadUsers();
  if(users[u] && users[u].password===p){ 
      currentUser = u;
      postLoginInit();   
  } else {
      document.getElementById('loginFeedback').textContent='Invalid username or password.';
  }
}


function signOut(){
  currentUser=null;
  document.getElementById('navbar').style.display='none';
  hideAllScreens();
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('loginUsername').value=''; document.getElementById('loginPassword').value='';
}

// ----------------------
// Post-login
// ----------------------

function showScreen(screenId) {
  hideAllScreens(); // hide everything first
  const screen = document.getElementById(screenId);
  if(screen) {
    screen.style.display = 'flex'; // or 'block', depending on your layout
     handleAppResize();
  } else {
    console.warn("Screen not found:", screenId);
  }
}

function postLoginInit(){
  document.getElementById('navbar').style.display='flex';
  hideAllScreens();
  renderSkillsGrid();
  renderProgressList();
  renderDailyHistory();
  showScreen('welcomeScreen');
  setTimeout(()=> fadeOut('welcomeScreen',()=>showScreen('skillsScreen')),5000);
  renderSkillsGrid();
  isLoggedIn = true;
  document.getElementById("notificationBell").classList.remove("hidden");

}
//----------------------------------
// Fade
//----------------------------------
function fadeOut(id, callback){
  const el = document.getElementById(id);
  el.style.transition = 'opacity 0.6s';
  el.style.opacity = 0;
  setTimeout(()=>{
    el.style.display='none';
    el.style.opacity=1;
    if(callback) callback();
  }, 650);
}

function updateDate() {
  const now = new Date();
  const formatted = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  document.getElementById('currentDate').textContent = formatted;
}

function updateViewportUnit() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
}

function updateAppScale() {
  const styles = getComputedStyle(document.documentElement);
  const baseWidth = Number.parseFloat(styles.getPropertyValue('--app-base-width')) || 1440;
  const baseHeight = Number.parseFloat(styles.getPropertyValue('--app-base-height')) || 900;

  const widthScale = window.innerWidth / baseWidth;
  const heightScale = window.innerHeight / baseHeight;
  const nextScale = Math.min(widthScale, heightScale, 1);

  document.documentElement.style.setProperty('--app-scale', String(nextScale));
}

function handleAppResize() {
  updateViewportUnit();
  resizeGameCanvas();
}

// ----------------------
// Screens
// ----------------------
function hideAllScreens(){ document.querySelectorAll('.screen').forEach(s=>s.style.display='none'); }

// ----------------------
// Progress
// ----------------------
function updateTotalCompleted(){
  const users=loadUsers(); const p=users[currentUser].progress.completed; let total=0;
  for(const k in p) total+=p[k].filter(Boolean).length;
  document.getElementById('lessonsCompleted').textContent=total;
  renderProgressList();
}

function renderProgressList(){
  if(!currentUser) return;
  const users = loadUsers(); 
  const p = users[currentUser].progress.completed;
  const list = document.getElementById('progressList'); 
  list.innerHTML='';

  for(const skillId in p){
    const skillObj = skills.find(s => s.id === skillId);
    const row = document.createElement('div'); 
    row.className = 'progressRow';

    // Label
    const label = document.createElement('div');
    label.className = 'progressLabel';
    label.textContent = `${skillObj ? skillObj.title : skillId}: ${p[skillId].filter(Boolean).length}/${p[skillId].length}`;

    // Progress bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'progressBarContainer';

    // Progress bar fill
    const barFill = document.createElement('div');
    barFill.className = 'progressBar';
    if(skillObj) barFill.classList.add(skillObj.color);

    // Calculate % complete
    const percent = (p[skillId].filter(Boolean).length / p[skillId].length) * 100;
    barFill.style.width = percent + '%'; // dynamically sets width

    barContainer.appendChild(barFill);

    // Open skill button
    const btn = document.createElement('button');
    btn.textContent = 'Open';
    btn.addEventListener('click', () => {
      if(skillObj) goToLessons(skillId, skillObj.title);
      else alert("Skill not found: " + skillId);
    });

    row.appendChild(label);
    row.appendChild(barContainer);
    row.appendChild(btn);
    list.appendChild(row);
  }
}



document.getElementById('clearProgressBtn').addEventListener('click', () => {
  if (!currentUser) return;
  const confirmClear = confirm(
    "Are you sure you want to reset all completed lessons?"
  );
  if (!confirmClear) return;
  const users = loadUsers();

  // Reset completion per skill — keep structure intact
  for (const skillId in lessonsData) {
    users[currentUser].progress.completed[skillId] =
      new Array(lessonsData[skillId].length).fill(false);
  }

  saveUsers(users);
  updateTotalCompleted();
  renderProgressList();
});


// ----------------------
// Daily Prompts
// ----------------------

const dailyPromptsBank = [
   "What is one small goal for today?",
   "Name one thing you're grateful for today.",
   "What's one healthy habit you will try today?",
   "Identify one time-waster you'll avoid today.",
   "What's one question you want to learn the answer to today?",
   "What made me smile today?",
   "What emotion did I feel the most today?",
   "One word to describe today and why.",
   "What am I proud of myself for today?",
   "What challenged me today?",
   "What did I learn about myself today?",
   "What drained my energy today?",
   "What gave me energy today?",
   "What is one thing I want to improve?",
   "What do I value most right now?",
   "What motivates me?",
   "What scares me about the future?",
   "What excites me about the future?",
   "Who inspires me and why?",
   "What is my biggest strength?",
   "What is a weakness I’m working on?",
   "How do I usually handle stress?",
   "What calms me down?",
   "What makes me feel confident?",
   "When do I feel most like myself?",
   "What do I need more of in my life?",
   "What do I need less of in my life?",
   "What makes me feel safe?",
   "What makes me feel understood?",
   "What kind of person do I want to become?",
   "What habits define me right now?",
   "What habit would I like to change?",
   "How do I define success?",
   "What does happiness mean to me?",
   "What am I grateful for today?",
   "What do I avoid that I shouldn’t?",
   "How do I react to failure?",
   "What does confidence look like for me?",
   "What does kindness mean to me?",
   "What makes me proud of who I am?",
   "How do I show care for others?",
   "How do I show care for myself?",
   "What does balance mean to me?",
   "What does rest mean to me?",
   "What does growth mean to me?",
   "What do I want people to remember me for?",
   "What makes me feel anxious?",
   "How do I cope with disappointment?",
   "What does being strong mean to me?",
   "What is something I overthink?",
   "What helps me focus?",
   "What distracts me the most?",
   "How do I recharge my energy?",
   "What am I afraid to admit to myself?",
   "What makes me feel hopeful?",
   "What kind of friend am I?",
   "What kind of student am I?",
   "What kind of leader could I be?",
   "What makes me unique?",
   "What do I wish others understood about me?",
   "How do I react to change?",
   "What progress have I made recently?",
   "What does independence mean to me?",
   "What does responsibility mean to me?",
   "What does adulthood look like to me?",
   "What kind of life do I want to build?",
   "What makes me feel capable?",
   "What makes me doubt myself?",
   "How do I talk to myself internally?",
   "What belief about myself might be holding me back?",
   "What belief helps me move forward?",
   "What do I want to learn more about?",
   "What do I enjoy doing alone?",
   "What do I enjoy doing with others?",
   "What does self-respect mean to me?",
   "How do I handle criticism?",
   "How do I celebrate success?",
   "What does emotional maturity mean to me?",
   "What am I still figuring out?",
   "What does patience mean to me?",
   "What makes me feel grounded?",
   "What helps me feel organized?",
   "What makes me feel overwhelmed?",
   "What do I need reassurance about?",
   "What do I admire about myself?",
   "What makes me feel seen?",
   "What kind of future do I imagine?",
   "What scares me about growing up?",
   "What excites me about growing up?",
   "What does confidence feel like physically?",
   "What does calm feel like physically?",
   "What does stress feel like physically?",
   "How do I want to treat myself tomorrow?",
   "What do I want to let go of?",
   "What do I want to hold onto?",
];

function getTodayKey(){ return new Date().toISOString().slice(0,10); }
function getTodaysPromptText(){
  const key=getTodayKey();
  const idx=parseInt(key.replace(/-/g,''),10)%dailyPromptsBank.length;
  return dailyPromptsBank[idx];
}

function renderDailyHistory(){
  if(!currentUser) return;
  const users=loadUsers(); const history=users[currentUser].progress.dailyPrompts||[];
  const past=document.getElementById('pastPrompts'); past.innerHTML='';
  [...history].reverse().forEach(entry=>{
    const el=document.createElement('div'); el.className='item';
    el.innerHTML=`<strong>${entry.date}</strong><div style="margin-top:6px;color:#243b4a">${entry.text}</div>`;
    past.appendChild(el);
  });
  document.getElementById('todayPrompt').textContent=getTodaysPromptText();
  document.getElementById('todayResponse').value='';
}

function saveTodayPrompt(){
  if(!currentUser) return;
  const text=document.getElementById('todayResponse').value.trim();
  if(!text){ alert('Write something first.'); return; }
  const users=loadUsers(); const history=users[currentUser].progress.dailyPrompts||[];
  const today=getTodayKey(); history.push({date:today,text}); users[currentUser].progress.dailyPrompts=history;
  saveUsers(users); renderDailyHistory(); updateTotalCompleted();
}

document.getElementById('clearDailyBtn').addEventListener('click', () => {
  if(!currentUser) return;
  const confirmClear = confirm("Are you sure you want to delete all past responses?");
  if(!confirmClear) return;
  const users = loadUsers();
  users[currentUser].progress.dailyPrompts = [];
  saveUsers(users);
  renderDailyHistory();
  }
);

// -------------------
// Notifications
// -------------------
function openNotifications() {
  document.getElementById("notificationOverlay").classList.remove("hidden");
}
function closeNotifications() {
  document.getElementById("notificationOverlay").classList.add("hidden");
}
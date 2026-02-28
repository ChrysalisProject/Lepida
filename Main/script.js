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

function handleAppResize() {
  updateViewportUnit();
  resizeGameCanvas();
}

function initGameOpening() {
  const openingScreen = document.getElementById('openingScreen');
  const gameCanvas = document.getElementById('gameCanvas');
  const newGameBtn = document.getElementById('newGameBtn');
  const continueBtn = document.getElementById('countinueBtn');
  const creditsBtn = document.getElementById('creditsBtn');

  if (!openingScreen || !gameCanvas || !newGameBtn || !continueBtn || !creditsBtn) return;

  newGameBtn.addEventListener('click', () => {
    openingScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    resizeGameCanvas();
  });

  continueBtn.addEventListener('click', () => {
    openingScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    resizeGameCanvas();
  });

  creditsBtn.addEventListener('click', () => {
    openingScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    resizeGameCanvas();
  });

}

setInterval(updateDate, 60000);
updateDate();
handleAppResize();
initGameOpening();
window.addEventListener('resize', handleAppResize);
window.addEventListener('orientationchange', handleAppResize);
document.addEventListener('fullscreenchange', handleAppResize);

// ----------------------
// Screens
// ----------------------
function hideAllScreens(){ document.querySelectorAll('.screen').forEach(s=>s.style.display='none'); }

// ----------------------
// Skills / Lessons
// ----------------------

const skills = [
  { id: "Financial", title: "Financial Literacy", color: "blue", icon: "💰", desc: "Master essential money skills through hands-on lessons and real-world examples. Learn how to budget effectively, save for short- and long-term goals, understand banking basics, open and manage accounts, and make informed financial decisions that set you up for success." },

  { id: "Cooking", title: "Cooking Skills", color: "orange", icon: "🍳", desc: "Develop practical cooking techniques to prepare delicious and healthy meals. From simple breakfasts to full dinners, learn how to use basic kitchen tools, follow recipes, and gain confidence in creating meals that are both tasty and nutritious." },

  { id: "Car", title: "Car Maintenance", color: "red", icon: "🚗", desc: "Understand the fundamentals of car care and basic troubleshooting. Learn how to check fluids, perform simple repairs, and maintain your vehicle to keep it running safely and efficiently." },

  { id: "Health", title: "Health & Wellness", color: "green", icon: "🧠", desc: "Build habits that improve both physical and mental well-being. Explore topics such as sleep, exercise, nutrition, mindfulness, and stress management to create a balanced, healthy lifestyle." },

  { id: "Time", title: "Time Management", color: "purple", icon: "⏰", desc: "Learn strategies to organize your day, prioritize tasks, and stay focused. From creating effective to-do lists to planning long-term goals, develop the skills to manage your time efficiently and reduce stress." },

  { id: "Comm", title: "Communication Skills", color: "yellow", icon: "🗣️", desc: "Enhance your ability to express yourself clearly and connect with others. Practice active listening, effective writing, public speaking, and interpersonal communication to improve relationships and succeed in school, work, and daily life." }
];

function renderSkillsGrid(){
  const grid = document.getElementById('skillsGrid');
  grid.innerHTML = '';
  for(const s of skills){
    const card = document.createElement('div'); 
    card.className='card';

    // colored stripe
    const stripe = document.createElement('div'); 
    stripe.className = 'stripe ' + s.color;

    // content
    const content = document.createElement('div'); 
    content.className='content';
    const titleRow = document.createElement('div'); 
    titleRow.className='titleRow';
    const icon = document.createElement('div'); 
    icon.textContent = s.icon; 
    icon.style.fontSize='24px';
    const h3 = document.createElement('h3'); 
    h3.textContent = s.title;
    titleRow.appendChild(icon); 
    titleRow.appendChild(h3);
    const p = document.createElement('p'); 
    p.textContent = s.desc;
    content.appendChild(titleRow); 
    content.appendChild(p);

    card.appendChild(stripe); 
    card.appendChild(content);

    card.addEventListener('click', ()=> goToLessons(s.id, s.title));
    grid.appendChild(card);
  }
}


function goToLessons(skillId, skillTitle){
  if(!currentUser){
    alert("No user logged in!");
    return;
  }

  currentSkill = skillId;
  document.getElementById('lessonsSkillTitle').textContent = skillTitle + ' — Lessons';
  const list = document.getElementById('lessonsList'); 
  list.innerHTML = '';

  const arr = lessonsData[skillId] || [];
  const users = loadUsers(); 
  const userProgress = users[currentUser].progress.completed[skillId] || new Array(arr.length).fill(false);

  arr.forEach((lesson, i) => {
    const card = document.createElement('div');
    card.className = 'lessonCard';

    // Mark card as completed if user already completed this lesson
    if(userProgress[i]) {
      card.classList.add('completed');  // you can style completed cards in CSS
    }

    const title = document.createElement('h3');
    title.textContent = lesson.title;

    const desc = document.createElement('p');
    desc.innerHTML = lesson.content.slice(0, 100) + "..."; // use innerHTML for preview

    card.appendChild(title);
    card.appendChild(desc);

    card.onclick = () => openLessonDetail(skillId, i);

    list.appendChild(card);
  });
  showScreen('lessonsScreen');
}


const lessonsData = {
  Financial:[
    //Lesson 1//
    {title:"What Is Money Actually For?", 
      content:
      `<h1>What is Money Actually For?</h1>

      <h2>Introduction</h2>
      <p>Money is more than coins, bills, or numbers in a bank account. It is a tool that allows people to exchange value,       plan for the future, and make choices. Understanding what money is for helps you use it wisely and take control of         your financial life.</p>

      <h2>Money as a Medium of Exchange</h2>
      <p>At its simplest, money allows us to trade goods and services efficiently. Instead of bartering items like               chickens for bread, money acts as a standard way to give and receive value. This makes transactions faster and             easier.</p>
      <p><strong>Key points:</strong> You can use money to buy necessities like food and clothing, pay for services like         healthcare or transportation, and save time compared to direct bartering.</p>

      <h2>Money as a Store of Value</h2>
      <p>Money also acts as a store of value, allowing you to save today and use it in the future. Instead of spending           everything immediately, you can set aside money for emergencies, planned purchases, or long-term goals.</p>
      <p><strong>Key points:</strong> 
      <ul>
      <li>Emergency funds protect against unexpected expenses.</li>
      <li>Savings help reach short-term goals.</li>
      <li>Investments can grow your money over time for long-term goals.</li>
      </ul>
      </p>

      <h2>Money as a Unit of Account</h2>
      <p>Money helps measure and compare the value of items. It allows individuals to budget, track spending, and               determine how much things are worth.</p>
      <p><strong>Key points:</strong> You can compare prices to make smarter decisions, plan your budget, and track             progress toward financial goals.</p>

      <h2>Conclusion</h2>
      <p>Money is a powerful tool when used thoughtfully. It is not just something to spend — it is a way to gain control,       make choices, and plan for the future. By saving for emergencies, investing in your goals, and spending                   intentionally, you can use money to create opportunities and financial freedom.</p>`
    },
    //Lesson 2//
     {title:"Saving Basics", 
      content: 
        `<h1>Saving Basics</h1>

         <h2>Introduction</h2>
         <p>Saving money is one of the most important financial habits you can develop. It gives you security, helps               you reach goals, and prepares you for emergencies. Saving isn’t about depriving yourself — it’s about making               intentional choices for your future.</p>

        <h2>Why Saving Matters</h2>
        <p>Without savings, unexpected expenses like car repairs or medical bills can create stress and debt. Regular             saving helps you build a financial safety net and ensures that you have funds available when needed.</p>
        <p><strong>Key points:</strong> Saving allows you to:</p>
        <ul>
         <li>Prepare for emergencies</li>
        <li>Achieve short-term goals, like buying a gadget or attending an event</li>
         <li>Invest in long-term goals, such as college, a car, or a home</li>
         </ul>

         <h2>How to Start Saving</h2>
        <p>Starting small is better than not starting at all. Even saving $5 or $10 a week can grow over time. Consistency         is more important than the amount.</p>
        <p><strong>Steps to begin:</strong></p>
        <ul>
        <li>Set a goal: short-term (fun purchase) or long-term (college fund)</li>
        <li>Create a budget to identify money you can save each week</li>
        <li>Choose a safe place to save: a bank account or a secure digital wallet</li>
        </ul>

        <h2>Tips for Successful Saving</h2>
        <p>Saving consistently can be easier with the right strategies:</p>
         <ul>
        <li>Automate your savings if possible</li>
        <li>Track your progress to stay motivated</li>
         <li>Reward yourself responsibly when goals are reached</li>
         </ul>

        <h2>Conclusion</h2>
        <p>Saving is a skill that sets the foundation for financial security and freedom. By starting small, staying              consistent, and keeping your goals in mind, you can make your money work for you rather than the other way around.          </p>`
    }
  ],


  Cooking:[
    //Lesson 1//
    {title:"Cooking Basics", 
      content: 
      `<h1>Cooking Basics</h1>
      <h2>Introduction</h2>
      <p>Cooking is an essential life skill that gives you control over what you eat, helps you save money, and allows you       to express creativity in the kitchen. Learning basic cooking skills allows you to prepare safe, nutritious, and            tasty meals for yourself and others. Developing confidence in the kitchen opens the door to exploring new recipes,         ingredients, and flavors over time.</p>
      <h2>Essential Kitchen Tools</h2>
      <p>Before you start cooking, it’s important to know the basic tools you’ll need. Having the right equipment makes         cooking safer, faster, and more efficient. You don’t need a fully stocked kitchen at first — just the essentials.</p>
      <ul>
      <li><strong>Knives:</strong> A chef’s knife, paring knife, and serrated knife are sufficient for most cutting tasks.       Keeping knives sharp is safer than using dull knives, which can slip.</li>
      <li><strong>Cutting boards:</strong> Use separate boards for raw meat and vegetables to prevent cross-contamination.       Plastic boards are easy to sanitize, while wooden boards are durable for vegetables and bread.</li>
      <li><strong>Pots and pans:</strong> A saucepan, skillet, and stockpot cover most cooking needs. Non-stick or               stainless steel options work well for beginners.</li>
      <li><strong>Measuring cups and spoons:</strong> Accurate measurements are important, especially for baking. Having a       set of cups and spoons ensures consistency.</li>
      <li><strong>Utensils:</strong> Wooden spoons, tongs, and a spatula make cooking easier and safer.</li>
      </ul>
      <h2>Basic Cooking Techniques</h2>
      <p>Understanding a few fundamental techniques allows you to cook a wide variety of meals:</p>
      <ul>
      <li><strong>Boiling:</strong> Cooking food in water at high heat. Ideal for pasta, eggs, and vegetables. Make sure         water is at a rolling boil before adding food for consistent results.</li>
      <li><strong>Sautéing:</strong> Cooking quickly in a small amount of oil over medium-high heat. Vegetables and small       pieces of meat cook evenly and develop flavor through browning.</li>
      <li><strong>Baking:</strong> Using dry heat in an oven. Great for bread, casseroles, and desserts. Baking often           requires accurate measurements and precise timing.</li>
      <li><strong>Roasting:</strong> Cooking in the oven with dry heat, typically at high temperatures. Roasting brings         out natural sweetness in vegetables and gives meats a crispy exterior.</li>
      <li><strong>Grilling:</strong> Cooking food directly over heat, either on a grill or stovetop grill pan. Adds smoky       flavor and appealing char marks.</li>
      </ul>
      <h2>Food Safety Basics</h2>
      <p>Safe cooking is essential to prevent foodborne illness. Following these rules keeps you and those you cook for         healthy:</p>
      <ul>
      <li>Wash hands thoroughly before handling food and after touching raw ingredients.</li>
      <li>Cook meat to safe internal temperatures (use a food thermometer).</li>
      <li>Store leftovers promptly in the refrigerator or freezer.</li>
      <li>Keep raw and cooked foods separate to prevent cross-contamination.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Mastering basic cooking skills provides independence, saves money, and allows you to eat healthier. By learning         essential tools, cooking techniques, and safety practices, you can confidently prepare meals and gradually explore         more advanced culinary techniques and recipes.</p>`
    },
    //Lesson 2//
     {title:"Knife Skills & Preparation", 
      content:
      `<h1>Knife Skills & Preparation</h1>
       <h2>Introduction</h2>
       <p>Good knife skills and proper preparation make cooking safer, faster, and more enjoyable. Understanding how to           handle knives correctly and prepare ingredients sets the foundation for nearly every recipe you will cook.</p>
       <h2>Knife Safety</h2>
       <p>Knife safety is essential. Even experienced cooks can get injured by careless handling. Key rules include:</p>
       <ul>
       <li>Always cut away from your body to avoid accidental cuts.</li>
       <li>Keep knives sharp. Dull knives require more force and are more likely to slip.</li>
       <li>Use a stable cutting board to prevent movement while chopping.</li>
       <li>Never leave knives in sinks or unattended where someone could grab them.</li>
       </ul>
       <h2>Basic Cutting Techniques</h2>
       <p>Mastering a few fundamental techniques ensures even cooking and a professional look:</p>
       <ul>
       <li><strong>Chopping:</strong> Quick, rough cuts for vegetables like onions, peppers, and carrots.</li>
       <li><strong>Dicing:</strong> Small, uniform cubes for even cooking and presentation.</li>
       <li><strong>Slicing:</strong> Thin or thick cuts for meats, fruits, or vegetables, depending on the recipe.</li>
       <li><strong>Julienne:</strong> Thin matchstick-style strips, perfect for salads or stir-fries.</li>
       </ul>
       <h2>Meal Preparation (Mise en Place)</h2>
      <p>Mise en place means “everything in its place.” Preparing ingredients before cooking makes the process smoother          and reduces mistakes:</p>
      <ul>
      <li>Measure and organize ingredients before starting.</li>
      <li>Wash vegetables and herbs thoroughly.</li>
      <li>Marinate meats or proteins ahead of time to enhance flavor.</li>
      <li>Keep utensils and equipment ready and accessible.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Knife skills and proper preparation are the backbone of successful cooking. They save time, improve safety, and         lead to better results in the kitchen. With practice, these skills become second nature.</p>`
    }
  ],

  Car:[
    //Lesson 1//
    {title: "Basic Car Maintenance & Care",
      content: `
        <h1>Basic Car Maintenance & Care</h1>
        <h2>Introduction</h2>
        <p>Understanding basic car maintenance helps keep your vehicle reliable, safe, and affordable to own. Regular care         can prevent costly repairs and extend the life of your car, making it an essential life skill for any driver.</p>

        <h2>Why Car Maintenance Matters</h2>
        <p>Cars are complex machines with many moving parts that wear down over time. Routine maintenance ensures these           parts work properly and reduces the risk of breakdowns:</p>
        <ul>
        <li>Improves safety by keeping critical systems in good condition.</li>
        <li>Prevents expensive repairs caused by neglect.</li>
        <li>Maintains fuel efficiency and performance.</li>
        <li>Helps preserve the car’s resale value.</li>
        </ul>

        <h2>Routine Maintenance Tasks</h2>
        <p>Some maintenance tasks should be done regularly, regardless of how often you drive:</p>
        <ul>
        <li><strong>Oil changes:</strong> Keeps the engine lubricated and prevents overheating.</li>
        <li><strong>Fluid checks:</strong> Includes coolant, brake fluid, windshield washer fluid, and transmission                fluid.</li>
        <li><strong>Air filter replacement:</strong> Improves engine performance and fuel efficiency.</li>
        <li><strong>Battery inspection:</strong> Ensures reliable starts and electrical function.</li>
        </ul>

        <h2>Keeping a Maintenance Schedule</h2>
        <p>Following a maintenance schedule helps you stay organized and avoid forgetting important tasks:</p>
        <ul>
        <li>Check your vehicle’s owner manual for recommended service intervals.</li>
        <li>Track mileage and service dates.</li>
        <li>Set reminders for upcoming maintenance.</li>
        <li>Keep records of all services performed.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Basic car maintenance is about consistency and awareness. By taking care of your vehicle regularly, you reduce          stress, save money, and ensure your car is ready when you need it.</p>`
    },
    //Lesson 2//
    {title: "Tires, Brakes & Road Safety",
      content: `
        <h1>Tires, Brakes & Road Safety</h1>
        <h2>Introduction</h2>
        <p>Tires and brakes are two of the most important safety components on any vehicle. Understanding how they work            and how to care for them can significantly reduce the risk of accidents and improve driving confidence.</p>

        <h2>Understanding Tire Care</h2>
        <p>Tires affect traction, handling, and fuel efficiency. Proper tire maintenance ensures better control on the             road:</p>
        <ul>
        <li><strong>Tire pressure:</strong> Correct pressure improves handling and prevents uneven wear.</li>
        <li><strong>Tread depth:</strong> Adequate tread is necessary for grip, especially in rain or snow.</li>
        <li><strong>Tire rotation:</strong> Helps tires wear evenly and last longer.</li>
        <li><strong>Alignment:</strong> Keeps the car driving straight and prevents premature tire damage.</li>
        </ul>

        <h2>Brake System Basics</h2>
        <p>Brakes allow you to slow down and stop safely. Ignoring brake issues can be dangerous:</p>
        <ul>
        <li><strong>Brake pads:</strong> Wear down over time and need regular inspection.</li>
        <li><strong>Brake fluid:</strong> Transfers force from the pedal to the brakes and must be kept clean.</li>
        <li><strong>Warning signs:</strong> Squealing noises, vibrations, or longer stopping distances.</li>
        </ul>

        <h2>Safety Checks Before Driving</h2>
        <p>Quick safety checks before driving can help identify issues early:</p>
        <ul>
        <li>Look for visible tire damage or low pressure.</li>
        <li>Listen for unusual noises when braking.</li>
        <li>Pay attention to dashboard warning lights.</li>
        <li>Address problems promptly instead of delaying repairs.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Taking care of your tires and brakes is directly tied to road safety. Regular inspections and early action can           prevent accidents and ensure a safer driving experience for you and others.</p>`
    }

  ],

  Health:[
    //Lesson 1//
    {title: "Physical Health & Daily Wellness Habits",
      content: `
        <h1>Physical Health & Daily Wellness Habits</h1>
        <h2>Introduction</h2>
        <p>Physical health is the foundation of overall well-being. Daily habits such as movement, nutrition, sleep, and           hygiene directly affect energy levels, focus, and long-term health. Building consistent routines early makes it            easier to maintain a healthy lifestyle.</p>

        <h2>The Importance of Daily Movement</h2>
        <p>Regular physical activity keeps the body strong and supports mental health. Movement does not require intense           workouts to be effective:</p>
        <ul>
        <li>Improves heart health and circulation.</li>
        <li>Increases energy and reduces fatigue.</li>
        <li>Supports muscle strength and flexibility.</li>
        <li>Helps manage stress and improve mood.</li>
        </ul>

        <h2>Nutrition and Fueling the Body</h2>
        <p>Food provides the fuel your body needs to function properly. Balanced nutrition supports growth, concentration,         and immune health:</p>
        <ul>
        <li>Eating a variety of foods ensures nutrient balance.</li>
        <li>Regular meals help maintain steady energy levels.</li>
        <li>Staying hydrated supports digestion and focus.</li>
        <li>Limiting overly processed foods improves long-term health.</li>
        </ul>

        <h2>Sleep and Recovery</h2>
        <p>Sleep allows the body and mind to recover. Without adequate rest, performance and health decline:</p>
        <ul>
        <li>Supports memory, learning, and emotional regulation.</li>
        <li>Helps the body repair and grow.</li>
        <li>Improves immune system function.</li>
        <li>Establishing a sleep routine improves sleep quality.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Physical wellness is built through small, consistent choices. By prioritizing movement, nutrition, and rest,           individuals create habits that support long-term health and everyday performance.</p>`
    },
    //Lesson 2//
    {title: "Mental Health, Stress & Self-Care",
      content: `
        <h1>Mental Health, Stress & Self-Care</h1>
        <h2>Introduction</h2>
        <p>Mental health is just as important as physical health. It affects how people think, feel, and respond to               challenges. Learning to manage stress and practice self-care supports emotional balance and resilience.</p>

        <h2>Understanding Stress</h2>
        <p>Stress is a natural response to challenges, but unmanaged stress can affect both mental and physical health:</p>
        <ul>
        <li>Short-term stress can increase focus and motivation.</li>
        <li>Chronic stress can lead to fatigue and difficulty concentrating.</li>
        <li>Recognizing stress triggers helps with management.</li>
        <li>Healthy coping strategies reduce negative effects.</li>
        </ul>

        <h2>Healthy Coping Strategies</h2>
        <p>Effective coping skills help regulate emotions and reduce overwhelm:</p>
        <ul>
        <li>Taking breaks to reset and recharge.</li>
        <li>Practicing mindfulness or deep breathing.</li>
        <li>Talking with trusted friends or adults.</li>
        <li>Engaging in hobbies or creative outlets.</li>
        </ul>

        <h2>The Role of Self-Care</h2>
        <p>Self-care involves intentional actions that protect mental well-being. It is not selfish, but necessary:</p>
        <ul>
        <li>Maintains emotional balance.</li>
        <li>Prevents burnout and exhaustion.</li>
        <li>Improves confidence and self-awareness.</li>
        <li>Supports healthier relationships.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Taking care of mental health is an ongoing process. By understanding stress and practicing self-care,                   individuals build resilience and develop skills that support lifelong well-being.</p>`
    }

  ],

  Time:[
    //Lesson 1//
    {title:"Prioritize Tasks", 
     content:
       "Use a to-do list and time blocks."
    }
  ],

  Comm:[
    //Lesson 1//
    {title:"Active Listening", 
     content:
       "Focus, reflect, and clarify while listening."
    }
  ]
}

function openLessonDetail(skillId, lessonIndex){
  currentLessonIndex=lessonIndex;
  const lesson=lessonsData[skillId][lessonIndex];
  document.getElementById('lessonDetailTitle').textContent=`${skillId} — ${lesson.title}`;
  document.getElementById('lessonDetailContent').innerHTML = `
    <div class="lessonWrapper">
      <div class="content">${lesson.content}</div>
    </div>
  `;
  showScreen('lessonDetailScreen');
}

function markLessonComplete(){
  if(!currentUser||!currentSkill) return;
  const users=loadUsers();
  users[currentUser].progress.completed[currentSkill][currentLessonIndex]=true;
  saveUsers(users); updateTotalCompleted();
  goToLessons(currentSkill,skills.find(s=>s.id===currentSkill).title);
}

let completedLessons = [];
function completeLesson(id) {
  if (!completedLessons.includes(id)) {
    completedLessons.push(id);
  }
}

function loadFinancialLessons() {
  const path = document.getElementById("lessonPath");
  path.innerHTML = "";

  const units = lessons.Financial;

  Object.values(units).forEach(unit => {
    unit.lessons.forEach((lesson, index) => {
      const bubble = document.createElement("div");
      bubble.className = "lessonBubble";

      const previousLesson = unit.lessons[index - 1];
      const locked = previousLesson && !completedLessons.includes(previousLesson.id);

      if (locked) {
        bubble.classList.add("locked");
      } else {
        bubble.onclick = () => openLesson(lesson);
      }

      bubble.textContent = lesson.title;
      path.appendChild(bubble);
    });
  });
}

let currentLesson = null;
function openLesson(lesson) {
  currentLesson = lesson;
  document.getElementById("lessonTitle").textContent = lesson.title;

  const list = document.getElementById("lessonContent");
  list.innerHTML = "";
  lesson.content.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  document.getElementById("lessonPractice").textContent = lesson.practice;
  document.getElementById("lessonApply").textContent = lesson.apply;

  showScreen("lessonScreen");
}

function finishLesson() {
  completeLesson(currentLesson.id);
  showScreen("financialLessonsScreen");
  loadFinancialLessons();
}


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
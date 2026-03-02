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
    {title:"Lesson 1: What Is Money Actually For?", 
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
    {title:"Lesson 2: Saving Basics", 
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
    },

    //Lesson 3//
    {title:"Lesson 3: Budgeting 101", 
      content:
      `<h1>Budgeting 101</h1>

      <h2>Introduction</h2>
      <p>A budget is a plan for how you will use your money. It helps you control spending, prioritize needs, and work toward financial goals. Budgeting is not about restriction — it is about intention.</p>

      <h2>Understanding Income and Expenses</h2>
      <p>Your income is the money you earn or receive. Expenses are the costs you pay regularly or occasionally.</p>
      <p><strong>Key points:</strong></p>
      <ul>
      <li>Income can come from jobs, allowances, or side work.</li>
      <li>Fixed expenses stay the same each month (rent, subscriptions).</li>
      <li>Variable expenses change (food, entertainment).</li>
      </ul>

      <h2>Creating a Simple Budget</h2>
      <p>Start by listing your monthly income and subtracting your expenses. Allocate money for savings first, then essentials, then wants.</p>
      <p><strong>Steps:</strong></p>
      <ul>
      <li>Track your spending for one month.</li>
      <li>Group expenses into categories.</li>
      <li>Adjust spending to align with your goals.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>A budget gives clarity and control. With consistent tracking and small adjustments, you can make informed financial decisions.</p>`
    },

    //Lesson 4//
    {title:"Lesson 4: Understanding Needs vs. Wants", 
      content:
      `<h1>Understanding Needs vs. Wants</h1>

      <h2>Introduction</h2>
      <p>Distinguishing between needs and wants helps you prioritize spending and avoid unnecessary debt.</p>

      <h2>What Are Needs?</h2>
      <p>Needs are essential for survival and basic functioning.</p>
      <ul>
      <li>Food and water</li>
      <li>Shelter and utilities</li>
      <li>Basic clothing</li>
      <li>Healthcare</li>
      </ul>

      <h2>What Are Wants?</h2>
      <p>Wants improve comfort or enjoyment but are not essential.</p>
      <ul>
      <li>Entertainment subscriptions</li>
      <li>Dining out</li>
      <li>Luxury brands</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Balancing needs and wants ensures stability while still allowing enjoyment within limits.</p>`
    },

    //Lesson 5//
    {title:"Lesson 5: Emergency Funds Explained", 
      content:
      `<h1>Emergency Funds Explained</h1>

      <h2>Introduction</h2>
      <p>An emergency fund is money set aside for unexpected expenses. It protects you from relying on credit or loans.</p>

      <h2>Why It Matters</h2>
      <ul>
      <li>Reduces financial stress</li>
      <li>Prevents debt accumulation</li>
      <li>Provides peace of mind</li>
      </ul>

      <h2>How Much to Save</h2>
      <p>Financial experts often suggest saving three to six months of essential expenses.</p>

      <h2>Conclusion</h2>
      <p>Building an emergency fund strengthens financial resilience and independence.</p>`
    },

    //Lesson 6//
    {title:"Lesson 6: Introduction to Banking", 
      content:
      `<h1>Introduction to Banking</h1>

      <h2>Introduction</h2>
      <p>Banks provide secure places to store money and offer services that make managing finances easier.</p>

      <h2>Types of Accounts</h2>
      <ul>
      <li>Checking accounts for daily spending</li>
      <li>Savings accounts for storing money</li>
      </ul>

      <h2>Benefits of Banking</h2>
      <ul>
      <li>Security</li>
      <li>Convenient transactions</li>
      <li>Access to financial tools</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Understanding basic banking services helps you manage and protect your money effectively.</p>`
    },

    //Lesson 7//
    {title:"Lesson 7: Credit and How It Works", 
      content:
      `<h1>Credit and How It Works</h1>

      <h2>Introduction</h2>
      <p>Credit allows you to borrow money with the promise to repay it later, often with interest.</p>

      <h2>Key Concepts</h2>
      <ul>
      <li>Credit score measures reliability</li>
      <li>Interest is the cost of borrowing</li>
      <li>Timely payments improve credit</li>
      </ul>

      <h2>Responsible Credit Use</h2>
      <ul>
      <li>Borrow only what you can repay</li>
      <li>Pay balances on time</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Using credit wisely builds trust and opens financial opportunities.</p>`
    },

    //Lesson 8//
    {title:"Lesson 8: Introduction to Investing", 
      content:
      `<h1>Introduction to Investing</h1>

      <h2>Introduction</h2>
      <p>Investing involves using money to purchase assets that may grow in value over time.</p>

      <h2>Common Investment Types</h2>
      <ul>
      <li>Stocks</li>
      <li>Bonds</li>
      <li>Mutual funds</li>
      </ul>

      <h2>Risk and Reward</h2>
      <p>Higher potential returns often come with higher risk. Diversification helps reduce risk.</p>

      <h2>Conclusion</h2>
      <p>Investing supports long-term financial growth when approached thoughtfully.</p>`
    },

    //Lesson 9//
    {title:"Lesson 9: Understanding Interest", 
      content:
      `<h1>Understanding Interest</h1>

      <h2>Introduction</h2>
      <p>Interest is money earned on savings or paid on borrowed funds.</p>

      <h2>Simple vs. Compound Interest</h2>
      <ul>
      <li>Simple interest is calculated on the original amount.</li>
      <li>Compound interest grows on both the principal and accumulated interest.</li>
      </ul>

      <h2>Why It Matters</h2>
      <p>Compound interest can significantly increase savings over time.</p>

      <h2>Conclusion</h2>
      <p>Understanding interest helps you grow wealth and avoid costly debt.</p>`
    },

    //Lesson 10//
    {title:"Lesson 10: Avoiding Debt Traps", 
      content:
      `<h1>Avoiding Debt Traps</h1>

      <h2>Introduction</h2>
      <p>Debt becomes a problem when payments exceed your ability to repay comfortably.</p>

      <h2>Common Debt Traps</h2>
      <ul>
      <li>High-interest credit cards</li>
      <li>Payday loans</li>
      <li>Impulse purchases</li>
      </ul>

      <h2>Prevention Strategies</h2>
      <ul>
      <li>Create a budget</li>
      <li>Build savings</li>
      <li>Compare loan terms carefully</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Responsible planning prevents unnecessary financial strain.</p>`
    },

    //Lesson 11//
    {title:"Lesson 11: Financial Goal Setting", 
      content:
      `<h1>Financial Goal Setting</h1>

      <h2>Introduction</h2>
      <p>Clear financial goals provide direction and motivation.</p>

      <h2>Types of Goals</h2>
      <ul>
      <li>Short-term (less than 1 year)</li>
      <li>Medium-term (1–5 years)</li>
      <li>Long-term (5+ years)</li>
      </ul>

      <h2>SMART Goals</h2>
      <p>Goals should be Specific, Measurable, Achievable, Relevant, and Time-bound.</p>

      <h2>Conclusion</h2>
      <p>Defined goals improve focus and increase the likelihood of financial success.</p>`
    },

    //Lesson 12//
    {title:"Lesson 12: Building Financial Discipline", 
      content:
      `<h1>Building Financial Discipline</h1>

      <h2>Introduction</h2>
      <p>Financial discipline is the habit of making consistent, responsible money decisions.</p>

      <h2>Key Habits</h2>
      <ul>
      <li>Regular saving</li>
      <li>Tracking expenses</li>
      <li>Avoiding impulse spending</li>
      </ul>

      <h2>Long-Term Impact</h2>
      <p>Small, disciplined actions over time create stability and growth.</p>

      <h2>Conclusion</h2>
      <p>Financial discipline builds independence and confidence in managing money.</p>`
    }
  ],

  Cooking:[
    //Lesson 1//
    {title:"Lesson 1: Cooking Basics", 
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
     {title:"Lesson 2: Knife Skills & Preparation", 
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
    },

    //Lesson 3//
    {title:"Lesson 3: Understanding Heat & Temperature Control", 
      content:
      `<h1>Understanding Heat & Temperature Control</h1>

      <h2>Introduction</h2>
      <p>Controlling heat is one of the most important skills in cooking. Too much heat can burn food, while too little heat can result in undercooked or uneven meals. Learning how heat works helps you cook more precisely.</p>

      <h2>Types of Heat</h2>
      <ul>
      <li><strong>High heat:</strong> Best for searing meats and achieving browning quickly.</li>
      <li><strong>Medium heat:</strong> Ideal for sautéing and cooking most foods evenly.</li>
      <li><strong>Low heat:</strong> Used for simmering sauces and slow cooking.</li>
      </ul>

      <h2>Using a Thermometer</h2>
      <p>A food thermometer ensures proteins are cooked safely and prevents overcooking. Different meats require different safe internal temperatures.</p>

      <h2>Conclusion</h2>
      <p>Understanding heat levels allows you to cook food safely, evenly, and with better flavor development.</p>`
    },

    //Lesson 4//
    {title:"Lesson 4: Seasoning & Flavor Basics", 
      content:
      `<h1>Seasoning & Flavor Basics</h1>

      <h2>Introduction</h2>
      <p>Seasoning enhances the natural flavors of food. Proper use of salt, herbs, spices, and acids transforms simple ingredients into balanced dishes.</p>

      <h2>Core Flavor Elements</h2>
      <ul>
      <li><strong>Salt:</strong> Enhances and brightens flavor.</li>
      <li><strong>Acid:</strong> Lemon juice or vinegar adds freshness.</li>
      <li><strong>Fat:</strong> Butter or oil adds richness.</li>
      <li><strong>Sweetness:</strong> Balances bitterness or acidity.</li>
      </ul>

      <h2>Tasting as You Cook</h2>
      <p>Adjust seasoning gradually. Small additions prevent overpowering the dish.</p>

      <h2>Conclusion</h2>
      <p>Balanced seasoning creates depth and improves overall quality of meals.</p>`
    },

    //Lesson 5//
    {title:"Lesson 5: Cooking Proteins Safely", 
      content:
      `<h1>Cooking Proteins Safely</h1>

      <h2>Introduction</h2>
      <p>Proteins such as chicken, beef, fish, eggs, and plant-based alternatives require proper handling and cooking for safety and quality.</p>

      <h2>Safe Handling</h2>
      <ul>
      <li>Store raw meat separately from other foods.</li>
      <li>Wash hands after handling raw proteins.</li>
      <li>Use separate utensils for raw and cooked items.</li>
      </ul>

      <h2>Cooking Methods</h2>
      <ul>
      <li>Searing for flavor development.</li>
      <li>Baking for even cooking.</li>
      <li>Grilling for smoky taste.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Proper preparation and temperature control ensure both safety and quality.</p>`
    },

    //Lesson 6//
    {title:"Lesson 6: Cooking Grains & Pasta", 
      content:
      `<h1>Cooking Grains & Pasta</h1>

      <h2>Introduction</h2>
      <p>Grains and pasta are foundational components of many meals. Learning proper cooking techniques prevents undercooking or mushy textures.</p>

      <h2>Basic Steps</h2>
      <ul>
      <li>Use correct water-to-grain ratios.</li>
      <li>Bring water to a boil before adding pasta.</li>
      <li>Simmer grains with a lid for even cooking.</li>
      </ul>

      <h2>Testing for Doneness</h2>
      <p>Pasta should be firm but tender (al dente). Grains should be soft but not sticky.</p>

      <h2>Conclusion</h2>
      <p>Mastering grains and pasta creates reliable meal foundations.</p>`
    },

    //Lesson 7//
    {title:"Lesson 7: Vegetable Cooking Methods", 
      content:
      `<h1>Vegetable Cooking Methods</h1>

      <h2>Introduction</h2>
      <p>Vegetables provide nutrients, texture, and color. Cooking methods affect taste and nutritional value.</p>

      <h2>Common Methods</h2>
      <ul>
      <li><strong>Steaming:</strong> Preserves nutrients and color.</li>
      <li><strong>Roasting:</strong> Enhances sweetness through caramelization.</li>
      <li><strong>Sautéing:</strong> Quick cooking with light browning.</li>
      </ul>

      <h2>Avoid Overcooking</h2>
      <p>Overcooked vegetables lose texture and nutrients. Monitor closely and test frequently.</p>

      <h2>Conclusion</h2>
      <p>Choosing the right method improves flavor and presentation.</p>`
    },

    //Lesson 8//
    {title:"Lesson 8: Basic Sauces & Foundations", 
      content:
      `<h1>Basic Sauces & Foundations</h1>

      <h2>Introduction</h2>
      <p>Sauces enhance moisture and flavor. Learning simple sauce techniques expands cooking possibilities.</p>

      <h2>Simple Sauce Types</h2>
      <ul>
      <li>Pan sauces from meat drippings.</li>
      <li>Tomato-based sauces for pasta.</li>
      <li>Basic cream sauces thickened with flour.</li>
      </ul>

      <h2>Thickening Methods</h2>
      <p>Use flour, cornstarch, or reduction (simmering to evaporate liquid).</p>

      <h2>Conclusion</h2>
      <p>Understanding sauces improves versatility and flavor depth.</p>`
    },

    //Lesson 9//
    {title:"Lesson 9: Meal Planning & Grocery Shopping", 
      content:
      `<h1>Meal Planning & Grocery Shopping</h1>

      <h2>Introduction</h2>
      <p>Planning meals saves time, reduces waste, and controls costs.</p>

      <h2>Planning Steps</h2>
      <ul>
      <li>Choose recipes for the week.</li>
      <li>Create a detailed shopping list.</li>
      <li>Check pantry items before shopping.</li>
      </ul>

      <h2>Smart Shopping Tips</h2>
      <ul>
      <li>Buy seasonal produce.</li>
      <li>Compare unit prices.</li>
      <li>Avoid shopping while hungry.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Effective planning leads to efficient and economical cooking.</p>`
    },

    //Lesson 10//
    {title:"Lesson 10: Basic Baking Principles", 
      content:
      `<h1>Basic Baking Principles</h1>

      <h2>Introduction</h2>
      <p>Baking relies on precise measurements and chemical reactions between ingredients.</p>

      <h2>Key Concepts</h2>
      <ul>
      <li>Measure ingredients accurately.</li>
      <li>Preheat the oven before baking.</li>
      <li>Follow recipe timing carefully.</li>
      </ul>

      <h2>Common Ingredients</h2>
      <ul>
      <li>Flour for structure.</li>
      <li>Leavening agents for rise.</li>
      <li>Sugar for sweetness and texture.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Precision and patience are essential for successful baking.</p>`
    },

    //Lesson 11//
    {title:"Lesson 11: Food Storage & Leftovers", 
      content:
      `<h1>Food Storage & Leftovers</h1>

      <h2>Introduction</h2>
      <p>Proper storage extends freshness and prevents foodborne illness.</p>

      <h2>Refrigeration & Freezing</h2>
      <ul>
      <li>Store leftovers in airtight containers.</li>
      <li>Label with dates.</li>
      <li>Freeze items you will not use within a few days.</li>
      </ul>

      <h2>Reheating Safely</h2>
      <p>Reheat food thoroughly to safe temperatures before serving.</p>

      <h2>Conclusion</h2>
      <p>Good storage practices reduce waste and maintain food quality.</p>`
    },

    //Lesson 12//
    {title:"Lesson 12: Building Confidence in the Kitchen", 
      content:
      `<h1>Building Confidence in the Kitchen</h1>

      <h2>Introduction</h2>
      <p>Confidence grows through consistent practice and gradual skill development.</p>

      <h2>Strategies for Growth</h2>
      <ul>
      <li>Start with simple recipes.</li>
      <li>Repeat techniques to build muscle memory.</li>
      <li>Learn from mistakes without discouragement.</li>
      </ul>

      <h2>Expanding Skills</h2>
      <p>Once comfortable, experiment with new ingredients and cuisines.</p>

      <h2>Conclusion</h2>
      <p>Steady practice leads to independence and creativity in cooking.</p>`
    }
  ],

  Car:[
    //Lesson 1//
    {title: "Lesson 1: Basic Car Maintenance & Care",
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
    {title: "Lesson 2: Tires, Brakes & Road Safety",
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
    },

    //Lesson 3//
    {title: "Lesson 3: Understanding Your Engine",
      content: `
        <h1>Understanding Your Engine</h1>
        <h2>Introduction</h2>
        <p>The engine is the core of your vehicle. It converts fuel into mechanical energy that powers the car. Basic knowledge of engine function helps you recognize problems early.</p>

        <h2>How an Engine Works</h2>
        <ul>
        <li>Air and fuel mix inside cylinders.</li>
        <li>Spark plugs ignite the mixture.</li>
        <li>Controlled explosions create movement.</li>
        <li>This movement turns the wheels.</li>
        </ul>

        <h2>Common Warning Signs</h2>
        <ul>
        <li>Check engine light</li>
        <li>Unusual knocking or ticking sounds</li>
        <li>Excessive smoke from exhaust</li>
        <li>Loss of power or poor acceleration</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Understanding engine basics allows you to communicate issues clearly and seek repairs before major damage occurs.</p>`
    },

    //Lesson 4//
    {title: "Lesson 4: Fluids & Why They Matter",
      content: `
        <h1>Fluids & Why They Matter</h1>
        <h2>Introduction</h2>
        <p>Vehicles rely on several fluids to operate safely and efficiently. Regular checks prevent overheating and system failure.</p>

        <h2>Essential Fluids</h2>
        <ul>
        <li><strong>Engine oil:</strong> Lubricates moving parts.</li>
        <li><strong>Coolant:</strong> Prevents overheating.</li>
        <li><strong>Brake fluid:</strong> Ensures proper stopping power.</li>
        <li><strong>Transmission fluid:</strong> Supports gear changes.</li>
        <li><strong>Power steering fluid:</strong> Assists steering control.</li>
        </ul>

        <h2>When to Check</h2>
        <p>Check fluids monthly or before long trips. Refer to your owner’s manual for specific intervals.</p>

        <h2>Conclusion</h2>
        <p>Maintaining proper fluid levels reduces wear and prevents costly mechanical failures.</p>`
    },

    //Lesson 5//
    {title: "Lesson 5: Understanding Dashboard Warning Lights",
      content: `
        <h1>Understanding Dashboard Warning Lights</h1>
        <h2>Introduction</h2>
        <p>Dashboard lights alert you to potential issues. Ignoring them can lead to safety risks or expensive repairs.</p>

        <h2>Common Warning Lights</h2>
        <ul>
        <li>Check engine indicator</li>
        <li>Oil pressure warning</li>
        <li>Battery alert</li>
        <li>Tire pressure monitoring system (TPMS)</li>
        <li>Brake warning light</li>
        </ul>

        <h2>What to Do</h2>
        <p>Consult your owner’s manual immediately. Some lights require urgent attention, while others indicate routine service needs.</p>

        <h2>Conclusion</h2>
        <p>Promptly responding to warning lights protects both your safety and your vehicle.</p>`
    },

    //Lesson 6//
    {title: "Lesson 6: Changing a Tire Safely",
      content: `
        <h1>Changing a Tire Safely</h1>
        <h2>Introduction</h2>
        <p>Knowing how to change a tire prepares you for unexpected roadside situations.</p>

        <h2>Basic Steps</h2>
        <ul>
        <li>Park on a flat, stable surface.</li>
        <li>Turn on hazard lights.</li>
        <li>Loosen lug nuts before lifting the vehicle.</li>
        <li>Use a jack properly positioned under the frame.</li>
        <li>Tighten lug nuts securely after replacement.</li>
        </ul>

        <h2>Safety Reminders</h2>
        <ul>
        <li>Never place any part of your body under a lifted vehicle.</li>
        <li>Use reflective triangles if available.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Preparation and caution ensure safe tire replacement during emergencies.</p>`
    },

    //Lesson 7//
    {title: "Lesson 7: Battery Care & Jump-Starting",
      content: `
        <h1>Battery Care & Jump-Starting</h1>
        <h2>Introduction</h2>
        <p>Your car battery powers electrical systems and starts the engine. Proper care extends its lifespan.</p>

        <h2>Battery Maintenance</h2>
        <ul>
        <li>Inspect terminals for corrosion.</li>
        <li>Ensure cables are secure.</li>
        <li>Replace aging batteries proactively.</li>
        </ul>

        <h2>Jump-Starting Basics</h2>
        <ul>
        <li>Connect positive cable to positive terminal first.</li>
        <li>Attach negative cable to grounded metal surface.</li>
        <li>Start the working vehicle before the disabled one.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Proper battery care reduces the likelihood of unexpected starting failures.</p>`
    },

    //Lesson 8//
    {title: "Lesson 8: Fuel Efficiency & Smart Driving",
      content: `
        <h1>Fuel Efficiency & Smart Driving</h1>
        <h2>Introduction</h2>
        <p>Driving habits directly impact fuel consumption and vehicle wear.</p>

        <h2>Efficiency Tips</h2>
        <ul>
        <li>Avoid rapid acceleration and braking.</li>
        <li>Maintain steady speeds when possible.</li>
        <li>Keep tires properly inflated.</li>
        <li>Remove unnecessary weight from the vehicle.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Smart driving habits lower fuel costs and reduce mechanical strain.</p>`
    },

    //Lesson 9//
    {title: "Lesson 9: Basic Car Insurance Knowledge",
      content: `
        <h1>Basic Car Insurance Knowledge</h1>
        <h2>Introduction</h2>
        <p>Car insurance protects you financially in case of accidents or damage.</p>

        <h2>Coverage Types</h2>
        <ul>
        <li>Liability coverage</li>
        <li>Collision coverage</li>
        <li>Comprehensive coverage</li>
        <li>Uninsured motorist protection</li>
        </ul>

        <h2>Why It Matters</h2>
        <p>Understanding your policy ensures you have adequate protection and avoid unexpected expenses.</p>

        <h2>Conclusion</h2>
        <p>Insurance knowledge supports responsible vehicle ownership.</p>`
    },

    //Lesson 10//
    {title: "Lesson 10: Seasonal Car Care",
      content: `
        <h1>Seasonal Car Care</h1>
        <h2>Introduction</h2>
        <p>Weather changes affect vehicle performance and safety.</p>

        <h2>Winter Preparation</h2>
        <ul>
        <li>Check battery strength.</li>
        <li>Inspect tire tread for snow traction.</li>
        <li>Ensure antifreeze levels are correct.</li>
        </ul>

        <h2>Summer Preparation</h2>
        <ul>
        <li>Monitor coolant levels.</li>
        <li>Check air conditioning performance.</li>
        <li>Inspect belts and hoses for wear.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Seasonal maintenance keeps your vehicle reliable year-round.</p>`
    },

    //Lesson 11//
    {title: "Lesson 11: Understanding Transmission Basics",
      content: `
        <h1>Understanding Transmission Basics</h1>
        <h2>Introduction</h2>
        <p>The transmission transfers engine power to the wheels and controls speed.</p>

        <h2>Types of Transmissions</h2>
        <ul>
        <li>Automatic transmission</li>
        <li>Manual transmission</li>
        <li>Continuously variable transmission (CVT)</li>
        </ul>

        <h2>Warning Signs</h2>
        <ul>
        <li>Delayed shifting</li>
        <li>Grinding noises</li>
        <li>Fluid leaks</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Recognizing early transmission issues prevents major mechanical damage.</p>`
    },

    //Lesson 12//
    {title: "Lesson 12: Emergency Preparedness for Drivers",
      content: `
        <h1>Emergency Preparedness for Drivers</h1>
        <h2>Introduction</h2>
        <p>Prepared drivers handle unexpected situations more safely and calmly.</p>

        <h2>Essential Emergency Items</h2>
        <ul>
        <li>Spare tire and jack</li>
        <li>Jumper cables</li>
        <li>Flashlight</li>
        <li>First-aid kit</li>
        <li>Reflective warning triangles</li>
        </ul>

        <h2>Staying Safe</h2>
        <p>If stranded, remain inside the vehicle when safe, activate hazard lights, and contact roadside assistance.</p>

        <h2>Conclusion</h2>
        <p>Preparation increases safety and reduces stress during roadside emergencies.</p>`
    }
  ],

  Health:[
    //Lesson 1//
    {title: "Lesson 1: Physical Health & Daily Wellness Habits",
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
    {title: "Lesson 2: Mental Health, Stress & Self-Care",
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
    },

    //Lesson 3//
    {title: "Lesson 3: Nutrition Fundamentals & Balanced Eating",
      content: `
        <h1>Nutrition Fundamentals & Balanced Eating</h1>
        <h2>Introduction</h2>
        <p>Nutrition provides the body with essential nutrients needed for growth, repair, and energy. Understanding basic nutrition principles supports long-term health and stable energy levels.</p>

        <h2>Macronutrients</h2>
        <ul>
        <li><strong>Carbohydrates:</strong> Primary source of energy.</li>
        <li><strong>Proteins:</strong> Support muscle repair and immune function.</li>
        <li><strong>Fats:</strong> Essential for hormone production and nutrient absorption.</li>
        </ul>

        <h2>Micronutrients</h2>
        <p>Vitamins and minerals regulate body processes, support immunity, and maintain bone health.</p>

        <h2>Conclusion</h2>
        <p>Balanced eating involves variety, moderation, and consistency rather than restriction.</p>`
    },

    //Lesson 4//
    {title: "Lesson 4: Understanding the Immune System",
      content: `
        <h1>Understanding the Immune System</h1>
        <h2>Introduction</h2>
        <p>The immune system protects the body from harmful pathogens such as bacteria and viruses. Maintaining immune health reduces illness risk.</p>

        <h2>How It Works</h2>
        <ul>
        <li>White blood cells identify and attack invaders.</li>
        <li>Antibodies help recognize repeated threats.</li>
        <li>Inflammation signals the body to respond.</li>
        </ul>

        <h2>Supporting Immune Health</h2>
        <ul>
        <li>Adequate sleep</li>
        <li>Balanced nutrition</li>
        <li>Regular exercise</li>
        <li>Vaccination when recommended</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Healthy lifestyle habits strengthen the body’s natural defenses.</p>`
    },

    //Lesson 5//
    {title: "Lesson 5: Hydration & Its Importance",
      content: `
        <h1>Hydration & Its Importance</h1>
        <h2>Introduction</h2>
        <p>Water is essential for nearly every body function, including temperature regulation, digestion, and circulation.</p>

        <h2>Benefits of Proper Hydration</h2>
        <ul>
        <li>Improves concentration and alertness.</li>
        <li>Supports digestion and nutrient transport.</li>
        <li>Prevents fatigue and headaches.</li>
        </ul>

        <h2>Signs of Dehydration</h2>
        <ul>
        <li>Dry mouth</li>
        <li>Dizziness</li>
        <li>Dark-colored urine</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Consistent hydration supports both physical and cognitive performance.</p>`
    },

    //Lesson 6//
    {title: "Lesson 6: Understanding Common Illness Prevention",
      content: `
        <h1>Understanding Common Illness Prevention</h1>
        <h2>Introduction</h2>
        <p>Preventive habits reduce the spread of infections and promote community health.</p>

        <h2>Preventive Practices</h2>
        <ul>
        <li>Handwashing with soap and water.</li>
        <li>Covering coughs and sneezes.</li>
        <li>Staying home when ill.</li>
        <li>Keeping vaccinations up to date.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Prevention reduces health risks and supports overall well-being.</p>`
    },

    //Lesson 7//
    {title: "Lesson 7: Building Healthy Sleep Routines",
      content: `
        <h1>Building Healthy Sleep Routines</h1>
        <h2>Introduction</h2>
        <p>Consistent sleep patterns regulate mood, focus, and physical recovery.</p>

        <h2>Sleep Hygiene Tips</h2>
        <ul>
        <li>Maintain a regular bedtime.</li>
        <li>Limit screen exposure before sleep.</li>
        <li>Create a quiet, dark sleeping environment.</li>
        </ul>

        <h2>Effects of Sleep Deprivation</h2>
        <ul>
        <li>Reduced concentration</li>
        <li>Irritability</li>
        <li>Lower immune response</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Structured routines improve both sleep quality and daytime performance.</p>`
    },

    //Lesson 8//
    {title: "Lesson 8: Understanding Emotional Regulation",
      content: `
        <h1>Understanding Emotional Regulation</h1>
        <h2>Introduction</h2>
        <p>Emotional regulation refers to managing and responding to emotions in healthy ways.</p>

        <h2>Healthy Regulation Techniques</h2>
        <ul>
        <li>Deep breathing exercises</li>
        <li>Journaling thoughts and feelings</li>
        <li>Physical movement to release tension</li>
        <li>Seeking support when needed</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Developing emotional awareness strengthens resilience and communication skills.</p>`
    },

    //Lesson 9//
    {title: "Lesson 9: Digital Wellness & Screen Balance",
      content: `
        <h1>Digital Wellness & Screen Balance</h1>
        <h2>Introduction</h2>
        <p>Technology use affects sleep, posture, and mental health. Balanced habits protect overall wellness.</p>

        <h2>Healthy Screen Practices</h2>
        <ul>
        <li>Take regular breaks using the 20-20-20 rule.</li>
        <li>Limit screen time before bed.</li>
        <li>Maintain proper posture while using devices.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Intentional technology use supports mental clarity and physical comfort.</p>`
    },

    //Lesson 10//
    {title: "Lesson 10: Understanding Preventive Healthcare",
      content: `
        <h1>Understanding Preventive Healthcare</h1>
        <h2>Introduction</h2>
        <p>Preventive healthcare focuses on identifying risks early and maintaining long-term wellness.</p>

        <h2>Examples of Preventive Care</h2>
        <ul>
        <li>Annual physical check-ups</li>
        <li>Dental cleanings</li>
        <li>Vision screenings</li>
        <li>Routine vaccinations</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Early detection and routine care reduce the likelihood of serious health conditions.</p>`
    },

    //Lesson 11//
    {title: "Lesson 11: Healthy Relationships & Social Well-Being",
      content: `
        <h1>Healthy Relationships & Social Well-Being</h1>
        <h2>Introduction</h2>
        <p>Social connections influence emotional health and overall life satisfaction.</p>

        <h2>Characteristics of Healthy Relationships</h2>
        <ul>
        <li>Mutual respect</li>
        <li>Clear communication</li>
        <li>Healthy boundaries</li>
        <li>Trust and accountability</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Positive relationships contribute to resilience and mental well-being.</p>`
    },

    //Lesson 12//
    {title: "Lesson 12: Developing Long-Term Healthy Habits",
      content: `
        <h1>Developing Long-Term Healthy Habits</h1>
        <h2>Introduction</h2>
        <p>Long-term health is built through consistent daily behaviors rather than short-term changes.</p>

        <h2>Habit Formation Strategies</h2>
        <ul>
        <li>Set realistic, measurable goals.</li>
        <li>Track progress consistently.</li>
        <li>Build routines gradually.</li>
        <li>Adjust strategies as needed.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Sustainable habits create lasting improvements in physical and mental health.</p>`
    }
  ],

  Time:[
    //Lesson 1//
    {title:"Lesson 1: Prioritize Tasks", 
      content:
      `<h1>Prioritize Tasks</h1>

      <h2>Introduction</h2>
      <p>Effective time management begins with prioritization. Not all tasks carry the same level of urgency or importance. Learning to identify what requires immediate attention versus what can be scheduled for later reduces stress and increases clarity.</p>

      <h2>Why Prioritization Matters</h2>
      <p>Without clear priorities, time is often spent on low-impact activities while essential responsibilities remain unfinished.</p>
      <ul>
        <li>Improves focus on high-value tasks.</li>
        <li>Reduces last-minute pressure.</li>
        <li>Increases productivity and efficiency.</li>
        <li>Supports balance between responsibilities.</li>
      </ul>

      <h2>Using To-Do Lists</h2>
      <ul>
        <li>List all tasks for the day or week.</li>
        <li>Label items by priority level.</li>
        <li>Break large tasks into smaller steps.</li>
      </ul>

      <h2>Time Blocking Strategy</h2>
      <ul>
        <li>Assign specific time periods for focused work.</li>
        <li>Schedule short breaks between sessions.</li>
        <li>Avoid multitasking during blocks.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Consistent prioritization builds discipline and improves long-term productivity.</p>`
    },

    //Lesson 2//
    {title:"Lesson 2: Avoiding Procrastination",
      content:
      `<h1>Avoiding Procrastination</h1>

      <h2>Introduction</h2>
      <p>Procrastination delays important responsibilities and increases stress. Structured strategies help reduce avoidance.</p>

      <h2>Common Causes</h2>
      <ul>
        <li>Feeling overwhelmed.</li>
        <li>Perfectionism or fear of failure.</li>
        <li>Unclear goals.</li>
        <li>Environmental distractions.</li>
      </ul>

      <h2>Practical Solutions</h2>
      <ul>
        <li>Break work into small tasks.</li>
        <li>Use focused timers.</li>
        <li>Remove distractions.</li>
        <li>Set firm deadlines.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Small, consistent action reduces avoidance behaviors and builds momentum.</p>`
    },

    //Lesson 3//
    {title:"Lesson 3: Setting Realistic Goals",
      content:
      `<h1>Setting Realistic Goals</h1>

      <h2>Introduction</h2>
      <p>Clear goals provide structure and direction. Achievable targets promote steady progress.</p>

      <h2>Characteristics of Effective Goals</h2>
      <ul>
        <li>Specific.</li>
        <li>Measurable.</li>
        <li>Achievable.</li>
        <li>Time-bound.</li>
      </ul>

      <h2>Breaking Down Goals</h2>
      <p>Divide long-term objectives into manageable milestones.</p>
  
      <h2>Conclusion</h2>
      <p>Realistic goal setting strengthens focus and accountability.</p>`
    },

    //Lesson 4//
    {title:"Lesson 4: Balancing Work & Rest",
      content:
      `<h1>Balancing Work & Rest</h1>

      <h2>Introduction</h2>
      <p>Rest is necessary for sustained productivity.</p>

      <h2>The Importance of Breaks</h2>
      <ul>
        <li>Improves concentration.</li>
        <li>Prevents burnout.</li>
        <li>Maintains energy levels.</li>
      </ul>

      <h2>Creating Balance</h2>
      <ul>
        <li>Schedule breaks intentionally.</li>
        <li>Maintain consistent sleep.</li>
        <li>Set work-life boundaries.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Balanced routines support long-term efficiency.</p>`
    },

    //Lesson 5//
    {title:"Lesson 5: Creating a Daily Routine",
    content:
    `<h1>Creating a Daily Routine</h1>
      <h2>Introduction</h2>
      <p>A structured routine reduces decision fatigue and increases consistency.</p>
      <h2>Key Elements</h2>
      <ul>
        <li>Consistent wake and sleep times.</li>
        <li>Dedicated study periods.</li>
        <li>Scheduled personal time.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Routine builds stability and predictability.</p>`
    },

    //Lesson 6//
    {title:"Lesson 6: Managing Energy Levels",
    content:
    `<h1>Managing Energy Levels</h1>
      <h2>Introduction</h2>
      <p>Productivity depends on managing energy, not just time.</p>
      <h2>Strategies</h2>
      <ul>
        <li>Work during peak focus hours.</li>
        <li>Hydrate and eat balanced meals.</li>
        <li>Protect sleep quality.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Energy awareness enhances performance.</p>`
    },

    //Lesson 7//
    {title:"Lesson 7: Minimizing Distractions",
    content:
    `<h1>Minimizing Distractions</h1>
      <h2>Introduction</h2>
      <p>Focused environments improve efficiency.</p>
      <h2>Techniques</h2>
      <ul>
        <li>Organize workspace.</li>
        <li>Silence notifications.</li>
        <li>Use website blockers if needed.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Controlled environments protect concentration.</p>`
    },

    //Lesson 8//
    {title:"Lesson 8: Using Reflection",
    content:
    `<h1>Using Reflection</h1>
      <h2>Introduction</h2>
      <p>Regular evaluation improves strategy.</p>
      <h2>Weekly Review</h2>
      <ul>
        <li>Assess completed tasks.</li>
        <li>Identify obstacles.</li>
        <li>Adjust upcoming plans.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Reflection supports continuous improvement.</p>`
    },

    //Lesson 9//
    {title:"Lesson 9: Breaking Down Large Projects",
    content:
    `<h1>Breaking Down Large Projects</h1>
      <h2>Introduction</h2>
      <p>Large tasks become manageable when segmented.</p>
      <h2>Steps</h2>
      <ul>
        <li>Define project phases.</li>
        <li>Set milestone deadlines.</li>
        <li>Track incremental progress.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Structured breakdown prevents overwhelm.</p>`
    },

    //Lesson 10//
    {title:"Lesson 10: Building Consistency",
    content:
    `<h1>Building Consistency</h1>
      <h2>Introduction</h2>
      <p>Consistency produces sustainable results.</p>
      <h2>Methods</h2>
      <ul>
        <li>Create daily habits.</li>
        <li>Track progress.</li>
        <li>Adjust without abandoning goals.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Repeated effort leads to long-term success.</p>`
    },

    //Lesson 11//
    {title:"Lesson 11: Maintaining Accountability",
    content:
    `<h1>Maintaining Accountability</h1>
      <h2>Introduction</h2>
      <p>Accountability strengthens commitment.</p>
      <h2>Approaches</h2>
      <ul>
        <li>Share goals responsibly.</li>
        <li>Use progress journals.</li>
        <li>Conduct self-check-ins.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Monitoring progress reinforces discipline.</p>`
    },

    //Lesson 12//
    {title:"Lesson 12: Planning Ahead",
    content:
    `<h1>Planning Ahead</h1>
      <h2>Introduction</h2>
      <p>Preparation reduces uncertainty and stress.</p>
      <h2>Planning Strategies</h2>
      <ul>
        <li>Review weekly commitments.</li>
        <li>Anticipate busy periods.</li>
        <li>Prepare materials in advance.</li>
      </ul>
      <h2>Conclusion</h2>
      <p>Proactive planning strengthens time management systems.</p>`
    }
  ],

  Comm:[

    //Lesson 1//
    {title:"Lesson 1: Active Listening",
      content:
      `<h1>Active Listening</h1>

      <h2>Introduction</h2>
      <p>Active listening is the intentional practice of fully concentrating on a speaker, understanding their message, and responding thoughtfully. It strengthens relationships and reduces misunderstandings.</p>

      <h2>Core Principles</h2>
      <ul>
        <li>Maintain eye contact and open body language.</li>
        <li>Avoid interrupting while the speaker is talking.</li>
        <li>Focus on understanding rather than preparing a response.</li>
      </ul>

      <h2>Techniques</h2>
      <ul>
        <li>Reflect key points back to the speaker.</li>
        <li>Ask clarifying questions.</li>
        <li>Summarize important ideas to confirm understanding.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Active listening improves communication accuracy and builds mutual respect.</p>`
    },

    //Lesson 2//
    {title:"Lesson 2: Clear Verbal Expression",
      content:
      `<h1>Clear Verbal Expression</h1>

      <h2>Introduction</h2>
      <p>Effective communication requires clarity and organization. Expressing ideas in a structured manner prevents confusion.</p>

      <h2>Key Practices</h2>
      <ul>
        <li>Organize thoughts before speaking.</li>
        <li>Use precise language.</li>
        <li>Speak at a steady pace and appropriate volume.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Clear verbal expression enhances understanding and professionalism.</p>`
    },

    //Lesson 3//
    {title:"Lesson 3: Nonverbal Communication",
      content:
      `<h1>Nonverbal Communication</h1>

      <h2>Introduction</h2>
      <p>Body language, facial expressions, and tone influence how messages are received.</p>

      <h2>Components</h2>
      <ul>
        <li>Posture and gestures.</li>
        <li>Eye contact.</li>
        <li>Tone of voice.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Aligning verbal and nonverbal cues strengthens credibility.</p>`
    },

    //Lesson 4//
    {title:"Lesson 4: Asking Effective Questions",
      content:
      `<h1>Asking Effective Questions</h1>

      <h2>Introduction</h2>
      <p>Thoughtful questions promote deeper understanding and engagement.</p>

      <h2>Strategies</h2>
      <ul>
        <li>Use open-ended questions.</li>
        <li>Avoid leading or biased phrasing.</li>
        <li>Follow up for clarification when needed.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Effective questioning encourages dialogue and insight.</p>`
    },

    //Lesson 5//
    {title:"Lesson 5: Constructive Feedback",
      content:
      `<h1>Constructive Feedback</h1>

      <h2>Introduction</h2>
      <p>Providing feedback respectfully promotes growth and improvement.</p>

      <h2>Guidelines</h2>
      <ul>
        <li>Be specific and objective.</li>
        <li>Focus on behavior, not personality.</li>
        <li>Offer actionable suggestions.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Constructive feedback strengthens collaboration.</p>`
    },

    //Lesson 6//
    {title:"Lesson 6: Receiving Feedback",
      content:
      `<h1>Receiving Feedback</h1>

      <h2>Introduction</h2>
      <p>Accepting feedback with openness supports personal development.</p>

      <h2>Approach</h2>
      <ul>
        <li>Listen without defensiveness.</li>
        <li>Ask clarifying questions.</li>
        <li>Reflect before responding.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Receptiveness improves performance and communication.</p>`
    },

    //Lesson 7//
    {title:"Lesson 7: Conflict Resolution",
      content:
      `<h1>Conflict Resolution</h1>

      <h2>Introduction</h2>
      <p>Conflict is natural in communication. Effective management prevents escalation.</p>

      <h2>Strategies</h2>
      <ul>
        <li>Address issues promptly.</li>
        <li>Use respectful language.</li>
        <li>Seek mutually beneficial solutions.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Constructive resolution preserves relationships.</p>`
    },

    //Lesson 8//
    {title:"Lesson 8: Empathy in Communication",
      content:
      `<h1>Empathy in Communication</h1>

      <h2>Introduction</h2>
      <p>Empathy involves understanding another person’s perspective.</p>

      <h2>Practices</h2>
      <ul>
        <li>Acknowledge emotions.</li>
        <li>Validate experiences respectfully.</li>
        <li>Respond with consideration.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Empathy strengthens trust and connection.</p>`
    },

    //Lesson 9//
    {title:"Lesson 9: Professional Communication",
      content:
      `<h1>Professional Communication</h1>

      <h2>Introduction</h2>
      <p>Professional settings require clarity, respect, and formality.</p>

      <h2>Standards</h2>
      <ul>
        <li>Use appropriate tone.</li>
        <li>Organize written messages clearly.</li>
        <li>Respond promptly and respectfully.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Professionalism enhances credibility.</p>`
    },

    //Lesson 10//
    {title:"Lesson 10: Digital Communication",
      content:
      `<h1>Digital Communication</h1>

      <h2>Introduction</h2>
      <p>Online communication requires clarity and awareness of tone.</p>

      <h2>Best Practices</h2>
      <ul>
        <li>Review messages before sending.</li>
        <li>Avoid ambiguous wording.</li>
        <li>Maintain respectful language.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Thoughtful digital communication prevents misunderstandings.</p>`
    },

    //Lesson 11//
    {title:"Lesson 11: Public Speaking Basics",
      content:
      `<h1>Public Speaking Basics</h1>

      <h2>Introduction</h2>
      <p>Clear structure and confidence improve presentations.</p>

      <h2>Preparation</h2>
      <ul>
        <li>Outline key points.</li>
        <li>Practice delivery.</li>
        <li>Manage pacing and tone.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Preparation strengthens clarity and audience engagement.</p>`
    },

    //Lesson 12//
    {title:"Lesson 12: Building Communication Confidence",
      content:
      `<h1>Building Communication Confidence</h1>

      <h2>Introduction</h2>
      <p>Confidence develops through practice and reflection.</p>

      <h2>Development Strategies</h2>
      <ul>
        <li>Seek opportunities to speak.</li>
        <li>Reflect on improvements.</li>
        <li>Accept constructive feedback.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Consistent effort strengthens communication skills over time.</p>`
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

//--------------------
//Game
//--------------------
function initGameOpening() {
  const openingScreen = document.getElementById('openingScreen');
  const gameCanvas = document.getElementById('gameCanvas');
  const newGameBtn = document.getElementById('newGameBtn');
  const continueBtn = document.getElementById('continueBtn');
  const creditsBtn = document.getElementById('creditsBtn');
  const sceneZeroOverlay = document.getElementById('sceneZeroOverlay');
  const sceneZeroText = document.getElementById('sceneZeroText');
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

   if(!openingScreen || 
      !gameCanvas || 
      !newGameBtn || 
      !continueBtn || 
     !creditsBtn || 
     !sceneZeroOverlay || 
     !sceneZeroText ||  
      !storyScene || 
      !storyNarration || 
      !interactionTitle || 
      !interactionPrompt || 
      !interactionActions || 
      !phoneNotification || 
      !statHealth || 
      !statHunger || 
      !statThirst || 
      !statMental
    ) return;

  const sceneZeroLines = [
    'You wake up to a life that is finally yours',
    'No one will tell you what to do anymore.',
    'That also means no one will save you if you mess up.',
    '- Good luck'
  ];

  let sceneZeroTimeouts = [];
   let storyTick = null;
  const storyState = {
    scene: 'bedroom',
    health: 72,
    hunger: 46,
    thirst: 43,
    mental: 32,
    responsibilityHabit: 0,
    currentContext: 'bed'
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateStats() {
    statHealth.textContent = storyState.health;
    statHunger.textContent = storyState.hunger;
    statThirst.textContent = storyState.thirst;
    statMental.textContent = storyState.mental;
  }

  function setNarration(text) {
    storyNarration.textContent = text;
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

  function showHouseIntro() {
    storyState.scene = 'house';
    storyState.currentContext = 'move';
    setNarration('They set everything up. Dishes. Furniture. Even the plants. From here on out, what happens is on me.');

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
    setNarration('You open the fridge. It’s half full.');
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
    setNarration('Some dishes are clean. Some aren’t.');
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
    setNarration('Small plants sit near the window.');
    setInteraction('Interactable: Plants (Window)', 'Prompt Options: Water Plants / Inspect / Ignore', [
      {
        label: 'Water Plants',
        onClick: () => {
          storyState.mental = clamp(storyState.mental + 3, 0, 100);
          storyState.responsibilityHabit += 1;
          updateStats();
          setNarration('One small thing cared for. Responsibility Habit +1.');
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
    setNarration('Ambient: distant traffic, a refrigerator hum, birds outside. Ceiling fan slowly spinning.');

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

  function typeWriterLine(line, lineDelay = 40) {
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
      await typeWriterLine(line);
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
    openingScreen.style.display = 'none';
    sceneZeroOverlay.style.display = 'none';
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

// -------------------
// Notifications
// -------------------
function openNotifications() {
  document.getElementById("notificationOverlay").classList.remove("hidden");
}
function closeNotifications() {
  document.getElementById("notificationOverlay").classList.add("hidden");
}
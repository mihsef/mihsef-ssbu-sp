
const starters = [
  { name: 'Battlefield', id: 'Battlefield', img: './assets/stages/battlefield.jpg' },
  { name: 'Pokémon Stadium 2', id: 'pokemon-stadium-2', img: './assets/stages/ps2.jpg' },
  { name: 'Smashville', id: 'smashville', img: './assets/stages/smashville.jpg' },
  { name: 'Town & City', id: 'town-and-city', img: './assets/stages/town_and_city.jpg' },
  { name: 'Small Battlefield', id: 'small-battlefield', img: './assets/stages/small_battlefield.jpg' }
];

const counterpicks = [
  { name: 'Kalos Pokémon League', id: 'kalos', img: './assets/stages/kalos.jpg' },
  { name: 'Hollow Bastion', id: 'hollow-bastion', img: './assets/stages/hollow_bastion.jpg' },
  { name: 'Final Destination', id: 'final-destination', img: './assets/stages/final_destination.jpg' }
];

const crewsPool = [
  { name: 'Battlefield', id: 'Battlefield', img: './assets/stages/battlefield.jpg' },
  { name: 'Kalos Pokémon League', id: 'kalos', img: './assets/stages/kalos.jpg' },
  { name: 'Pokémon Stadium 2', id: 'pokemon-stadium-2', img: './assets/stages/ps2.jpg' },
  { name: 'Town & City', id: 'town-and-city', img: './assets/stages/town_and_city.jpg' },
  { name: 'Small Battlefield', id: 'small-battlefield', img: './assets/stages/small_battlefield.jpg' },
  { name: 'Final Destination', id: 'final-destination', img: './assets/stages/final_destination.jpg' },
  { name: 'Smashville', id: 'smashville', img: './assets/stages/smashville.jpg' },
  { name: 'Unova Pokémon League', id: 'unova', img: './assets/stages/unova.png?v=new' },
  { name: 'Hollow Bastion', id: 'hollow-bastion', img: './assets/stages/hollow_bastion.jpg' }
];

// Game State
let currentState = {
  mode: 'solos', // 'solos' or 'crews'
  step: 0,
  bannedStages: [],
  game: 1
};

function updateFlowGuide() {
  const steps = document.getElementById('subsequent-steps');
  if (currentState.mode === 'solos') {
    steps.innerHTML = `
      <li><span class="flow-team winner">WINNER</span> announces character(s) first</li>
      <li><span class="flow-team loser">LOSER</span> announces character(s)</li>
      <li><span class="flow-team winner">WINNER</span> strikes 2 stages from full list</li>
      <li><span class="flow-team loser">LOSER</span> picks next stage (no DSR stage)</li>
    `;
  } else {
    steps.innerHTML = `
      <li><span class="flow-team winner">WINNING TEAM</span> declares player &amp; character first</li>
      <li><span class="flow-team loser">LOSING TEAM</span> declares player &amp; character</li>
      <li><span class="flow-team winner">WINNER</span> bans 3 stages from the pool</li>
      <li><span class="flow-team loser">LOSER</span> picks stage from remaining</li>
    `;
  }
}

function resetBoard() {
  currentState.step = 0;
  currentState.bannedStages = [];
  updateProgressHTML();
  renderStages();
  updateUI();
  updateRulesText();
  updateExternalLinks();
  updateFlowGuide();
}

function updateExternalLinks() {
  const btnBracket = document.getElementById('btn-bracket');
  const btnRules = document.getElementById('btn-rules');

  if (currentState.mode === 'solos') {
    btnBracket.href = "https://fan.fenworks.com/Michigan";
    btnRules.href = "/docs/game-manuals/ssbu-solos";
  } else {
    btnBracket.href = "https://fan.fenworks.com/Michigan";
    btnRules.href = "/docs/game-manuals/ssbu-crews";
  }
}

// Ban Sequence: 1-2-1
// Step 0: Home Ban
// Step 1: Away Ban
// Step 2: Away Ban
// Step 3: Home Pick
// Step 4: Complete

// Sequences
const STEPS_SOLOS = [
  { text: "<span class='text-home'>Home Team</span>: Ban 1 Stage", team: "Home" },
  { text: "<span class='text-away'>Away Team</span>: Ban 1st Stage", team: "Away" },
  { text: "<span class='text-away'>Away Team</span>: Ban 2nd Stage", team: "Away" },
  { text: "<span class='text-home'>Home Team</span>: Pick Stage", team: "Home" },
  { text: "<span class='text-neutral'>Game 1 Stage Selected</span>", team: "Done" }
];

// Crews Sequence: H-A-A-H-H-A-A-PICK
const STEPS_CREWS = [
  { text: "<span class='text-home'>Home Team</span>: Ban 1 Stage", team: "Home" },
  { text: "<span class='text-away'>Away Team</span>: Ban 1st Stage", team: "Away" },
  { text: "<span class='text-away'>Away Team</span>: Ban 2nd Stage", team: "Away" },
  { text: "<span class='text-home'>Home Team</span>: Ban 1st Stage", team: "Home" },
  { text: "<span class='text-home'>Home Team</span>: Ban 2nd Stage", team: "Home" },
  { text: "<span class='text-away'>Away Team</span>: Ban 3rd Stage", team: "Away" },
  { text: "<span class='text-away'>Away Team</span>: Ban 4th Stage", team: "Away" },
  { text: "<span class='text-home'>Home Team</span>: Pick Stage", team: "Home" },
  { text: "<span class='text-neutral'>Crew Battle Stage Selected</span>", team: "Done" }
];

function init() {
  renderStages();
  setupEventListeners();
  updateProgressHTML();
  updateRulesText();
  updateFlowGuide();
  updateUI();
}

function createStageCard(stage) {
  const card = document.createElement('div');
  card.className = 'stage-card';
  card.dataset.stage = stage.id;

  const img = document.createElement('img');
  img.src = stage.img;
  img.alt = stage.name;
  img.className = 'stage-img';

  const nameOverlay = document.createElement('div');
  nameOverlay.className = 'stage-name';
  nameOverlay.textContent = stage.name;

  card.appendChild(img);
  card.appendChild(nameOverlay);

  card.addEventListener('click', () => handleStageClick(stage.id));

  return card;
}

function updateProgressHTML() {
  const container = document.querySelector('.progress-steps');
  container.innerHTML = '';

  const currentSteps = currentState.mode === 'solos' ? STEPS_SOLOS : STEPS_CREWS;
  // Don't show the "Done" step as a bubble
  const renderLimit = currentSteps.length - 1;

  for (let i = 0; i < renderLimit; i++) {
    const stepData = currentSteps[i];
    const div = document.createElement('div');
    div.className = 'step';
    div.dataset.step = i;
    div.dataset.team = stepData.team.toLowerCase();

    // Check mode for label style
    let label = "";
    if (currentState.mode === 'solos') {
      // Solos: Full text requested by user
      if (i === renderLimit - 1) label = "HOME PICK";
      else label = `${stepData.team.toUpperCase()} BAN`;
    } else {
      // Crews: Use full text if space allows, usually shortened on mobile CSS?
      // User said "I'd rather it say home or away"
      if (i === renderLimit - 1) label = "PICK";
      else label = `${stepData.team.toUpperCase()} BAN`;
    }

    div.textContent = label;
    container.appendChild(div);
  }
}

function updateRulesText() {
  const rulesBox = document.querySelector('.rules-box');
  if (currentState.mode === 'solos') {
    rulesBox.innerHTML = `
      <h4>STAGE SELECTION (SUBSEQUENT GAMES)</h4>
      <ul>
        <li>Winner declares character(s) first, then Loser.</li>
        <li>Winner strikes <strong>2 stages</strong> from complete list of 8 stages.</li>
        <li>Loser chooses next stage.</li>
        <li class="note">*Cannot pick a stage you have already won on (DSR).</li>
      </ul>
    `;
    document.querySelector('.secondary h3').style.display = 'block';
    document.getElementById('counterpick-grid').style.display = 'flex'; // Fix visibility issue
    document.getElementById('subtitle').textContent = "GAME 1 STAGE STRIKING";
  } else {
    rulesBox.innerHTML = `
      <h4>CREW BATTLE RULES</h4>
      <ul>
        <li><strong>First Round:</strong> Group Phase (🪨📄✂️) / Bracket Phase (Lower Seed) declares Player & Character.</li>
        <li><strong>Subsequent Rounds:</strong> Winning team declares Player & Character first.</li>
        <li><strong>Subsequent Games:</strong> Winner bans <strong>3 stages</strong>. Loser picks from remaining.</li>
      </ul>
    `;
    document.querySelector('.secondary h3').style.display = 'none';
    document.getElementById('counterpick-grid').style.display = 'none';
    document.getElementById('subtitle').textContent = "CREW BATTLE STRIKING";
  }
}

function renderStages() {
  const starterGrid = document.getElementById('starter-grid');
  const counterpickGrid = document.getElementById('counterpick-grid');

  starterGrid.innerHTML = '';
  counterpickGrid.innerHTML = '';

  if (currentState.mode === 'solos') {
    starters.forEach(stage => starterGrid.appendChild(createStageCard(stage)));
    counterpicks.forEach(stage => counterpickGrid.appendChild(createStageCard(stage)));

    // Explicitly ensure grid layout is active
    starterGrid.style.display = 'flex';
    counterpickGrid.style.display = 'flex';
  } else {
    crewsPool.forEach(stage => starterGrid.appendChild(createStageCard(stage)));
    starterGrid.style.display = 'flex';
    counterpickGrid.style.display = 'none';
  }
}

function handleStageClick(stageId) {
  // If game complete, checking for undo via clicking the winner or banned
  if (currentState.step >= 4) {
    // Should we allow undoing the PICK?
    // Determine which was the last banned stage (the auto-banned one)
    // If they click the X'd one, we undo step 3.
    // If they click the Picked one, we undo step 3.
    // Let's rely on standard unban logic below if possible.
  }

  const stepsConfig = currentState.mode === 'solos' ? STEPS_SOLOS : STEPS_CREWS;
  const maxSteps = stepsConfig.length - 1; // Last step is "Done" message state

  // Helper to find existing ban
  const banIndex = currentState.bannedStages.findIndex(b => b.id === stageId);

  // UNBAN LOGIC (UNDO)
  if (banIndex !== -1) {
    if (banIndex === currentState.bannedStages.length - 1) {
      currentState.bannedStages.pop();
      currentState.step--;
      updateUI();
    }
    return;
  }

  if (currentState.step >= maxSteps) return;

  // Game 1 validation: Only Starters for Solos?
  // For Crews, all are valid.
  if (currentState.mode === 'solos') {
    const isStarter = starters.some(s => s.id === stageId);
    if (currentState.game === 1 && !isStarter) return;
  }

  // PICK LOGIC: Solos Step 3 is PICK. Crews Step 7 is PICK.
  const isPickStep = (currentState.mode === 'solos' && currentState.step === 3) ||
    (currentState.mode === 'crews' && currentState.step === 7);

  const currentTeam = stepsConfig[currentState.step].team;

  if (isPickStep) {
    // Pick Logic: Ban all others
    let pool = currentState.mode === 'solos' ? starters : crewsPool;
    const validStages = pool.filter(s => !currentState.bannedStages.some(b => b.id === s.id));
    validStages.forEach(s => {
      if (s.id !== stageId) {
        currentState.bannedStages.push({ id: s.id, team: 'auto' });
      }
    });
    currentState.step++;
    updateUI();
  } else {
    // STANDARD BAN LOGIC
    currentState.bannedStages.push({ id: stageId, team: currentTeam.toLowerCase() }); // 'home' or 'away'
    currentState.step++;
    updateUI();
  }
}

function updateUI() {
  const stepsConfig = currentState.mode === 'solos' ? STEPS_SOLOS : STEPS_CREWS;
  const pickStepIndex = stepsConfig.length - 2; // The step before "Done"
  const doneStepIndex = stepsConfig.length - 1;

  // Update Cards
  document.querySelectorAll('.stage-card').forEach(card => {
    const id = card.dataset.stage;

    // Find ban object
    const banData = currentState.bannedStages.find(b => b.id === id);
    const isBanned = !!banData;

    // Reset classes
    card.classList.remove('banned', 'banned-home', 'banned-away', 'picked', 'disabled');

    if (isBanned) {
      card.classList.add('banned');
      if (banData.team === 'home') card.classList.add('banned-home');
      if (banData.team === 'away') card.classList.add('banned-away');
      if (banData.team === 'auto') card.classList.add('banned-auto');
    } else if (currentState.step === doneStepIndex) {
      // Logic for picked highlighting varies, but generally if not banned, it's picked
      // Verify it's part of the active pool
      let isValidPool = true;
      if (currentState.mode === 'solos') isValidPool = starters.some(s => s.id === id);
      else isValidPool = crewsPool.some(s => s.id === id);

      if (isValidPool) card.classList.add('picked');
    }

    // Disable counterpicks visually during Game 1 (Only in Solos)
    if (currentState.mode === 'solos' && currentState.game === 1) {
      const isCounterpick = counterpicks.some(c => c.id === id);
      if (isCounterpick) {
        // Only disable if we are not done? Actually, user wanted them clickable in steps?
        // Wait, logic says "Game 1 validation: Only Starters" in handleStageClick
        // So they are logically disabled.
        card.classList.add('disabled');
      }
    }
  });

  // Update Progress Bar
  const steps = document.querySelectorAll('.step');
  steps.forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index < currentState.step) {
      el.classList.add('completed');
    } else if (index === currentState.step) {
      el.classList.add('active');
    }
  });

  // Update Message
  const msgEl = document.getElementById('turn-message');
  msgEl.innerHTML = stepsConfig[currentState.step].text;

  // Update Mini Reset Button Visibility
  const miniResetBtn = document.getElementById('mini-reset');
  if (currentState.step >= pickStepIndex) {
    miniResetBtn.classList.add('visible');
  } else {
    miniResetBtn.classList.remove('visible');
  }
}

function setupEventListeners() {
  // Main Reset Button
  document.getElementById('reset-btn').addEventListener('click', resetBoard);

  // Mini Reset Button
  document.getElementById('mini-reset').addEventListener('click', resetBoard);

  // Toggle Solos/Crews
  const toggle = document.getElementById('event-toggle');
  const labelSolos = document.getElementById('label-solos');
  const labelCrews = document.getElementById('label-crews');

  toggle.addEventListener('change', (e) => {
    currentState.mode = e.target.checked ? 'crews' : 'solos';

    if (currentState.mode === 'solos') {
      labelSolos.classList.add('active');
      labelCrews.classList.remove('active');
    } else {
      labelSolos.classList.remove('active');
      labelCrews.classList.add('active');
    }

    // Reset on mode switch?
    resetBoard();
  });

  // Set initial labels
  labelSolos.classList.add('active');
}

init();

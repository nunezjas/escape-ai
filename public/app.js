/* ==================================================
   DOM ELEMENTS
================================================== */

const commandForm = document.querySelector("#commandForm");
const commandInput = document.querySelector("#commandInput");
const messageHistory = document.querySelector("#messageHistory");

const restartButton = document.querySelector("#restartButton");
const playAgainButton = document.querySelector("#playAgainButton");
const showCreditsButton =
  document.querySelector("#showCreditsButton");

const closeCreditsButton =
  document.querySelector("#closeCreditsButton");

const skipEndingButton =
  document.querySelector("#skipEndingButton");

const victoryPanel =
  document.querySelector("#victoryPanel");

const endingCredits =
  document.querySelector("#endingCredits");

const finalCompletionTime =
  document.querySelector("#finalCompletionTime");

const finalTimeRemaining =
  document.querySelector("#finalTimeRemaining");

const finalRank =
  document.querySelector("#finalRank");

const soundButton = document.querySelector("#soundButton");
const sendButton = document.querySelector("#sendButton");

const exampleButtons =
  document.querySelectorAll(".command-example");

const inventoryList =
  document.querySelector("#inventoryList");

const inventoryCount =
  document.querySelector("#inventoryCount");

const progressBar =
  document.querySelector("#progressBar");

const progressText =
  document.querySelector("#progressText");

const objectiveItems =
  document.querySelectorAll("#objectiveList li");

const objectiveTexts =
  document.querySelectorAll(".objective-text");

const roomName =
  document.querySelector("#roomName");

const roomDescription =
  document.querySelector("#roomDescription");

const gameMasterName =
  document.querySelector("#gameMasterName");

const roomCounter =
  document.querySelector("#roomCounter");

const commandHelp =
  document.querySelector("#commandHelp");

const connectionStatus =
  document.querySelector("#connectionStatus");

const roomOneScene =
  document.querySelector("#roomOneScene");

const roomTwoScene =
  document.querySelector("#roomTwoScene");

const endingScene =
  document.querySelector("#endingScene");

const transitionOverlay =
  document.querySelector("#transitionOverlay");


/* ==================================================
   GENERAL VARIABLES
================================================== */

let secondsRemaining = 30 * 60;
let timerInterval = null;
let soundEnabled = true;
let transitionInProgress = false;


/* ==================================================
   GAME STATE
================================================== */

const gameState = {
  currentRoom: 1,

  inventory: [],

  room1: {
    inspectedBookshelf: false,
    redBookPulled: false,
    silverKeyCollected: false,
    journalOpened: false,
    secretPassageFound: false,
    completed: false,
  },

  room2: {
    laboratoryInspected: false,
    workbenchInspected: false,
    blueVialCollected: false,
    pedestalInspected: false,
    vialPoured: false,
    symbolsRead: false,
    passwordSpoken: false,
    completed: false,
  },

  gameCompleted: false,
};


/* ==================================================
   COMMAND LOADING
================================================== */

function setCommandLoading(isLoading) {
  commandInput.disabled = isLoading;
  sendButton.disabled = isLoading;

  sendButton.textContent =
    isLoading ? "Thinking..." : "Send";

  if (
    !isLoading &&
    !gameState.gameCompleted &&
    !transitionInProgress
  ) {
    commandInput.focus();
  }
}


/* ==================================================
   TIMER
================================================== */

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function startTimer() {
  const timer = document.querySelector("#timer");

  clearInterval(timerInterval);

  timer.textContent = formatTime(secondsRemaining);

  timerInterval = setInterval(() => {
    secondsRemaining -= 1;

    timer.textContent =
      formatTime(secondsRemaining);

    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);

      timer.textContent = "00:00";

      addMessage(
        "The final bell rings. The rooms collapse into darkness, and your chance to escape is lost.",
        "narrator"
      );

      disableGame();
    }
  }, 1000);
}

function disableGame() {
  commandInput.disabled = true;
  sendButton.disabled = true;
}


/* ==================================================
   MESSAGE DISPLAY
================================================== */

function addMessage(text, sender) {
  const article = document.createElement("article");

  const isPlayer = sender === "player";

  article.className = isPlayer
    ? "message player-message"
    : "message narrator-message";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";

  if (isPlayer) {
    avatar.textContent = "🧭";
  } else if (gameState.gameCompleted) {
    avatar.textContent = "✨";
  } else if (gameState.currentRoom === 1) {
    avatar.textContent = "👻";
  } else {
    avatar.textContent = "🔮";
  }

  const content = document.createElement("div");
  content.className = "message-content";

  const speaker = document.createElement("span");
  speaker.className = "speaker-name";

  if (isPlayer) {
    speaker.textContent = "Player";
  } else if (gameState.gameCompleted) {
    speaker.textContent = "Adventure Complete";
  } else if (gameState.currentRoom === 1) {
    speaker.textContent = "Ghost Librarian";
  } else {
    speaker.textContent = "Laboratory Voice";
  }

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  content.append(speaker, paragraph);
  article.append(avatar, content);

  messageHistory.append(article);

  messageHistory.scrollTop =
    messageHistory.scrollHeight;
}


/* ==================================================
   INVENTORY
================================================== */

function updateInventory() {
  inventoryList.innerHTML = "";

  if (gameState.inventory.length === 0) {
    const emptyMessage =
      document.createElement("p");

    emptyMessage.className = "empty-message";
    emptyMessage.textContent =
      "Your inventory is empty.";

    inventoryList.append(emptyMessage);
  } else {
    gameState.inventory.forEach((item) => {
      const inventoryItem =
        document.createElement("div");

      inventoryItem.className =
        "inventory-item";

      if (item === "Silver Key") {
        inventoryItem.textContent =
          `🗝️ ${item}`;
      } else if (item === "Blue Vial") {
        inventoryItem.textContent =
          `🧪 ${item}`;
      } else {
        inventoryItem.textContent = item;
      }

      inventoryList.append(inventoryItem);
    });
  }

  const itemWord =
    gameState.inventory.length === 1
      ? "item"
      : "items";

  inventoryCount.textContent =
    `${gameState.inventory.length} ${itemWord}`;
}

function addInventoryItem(itemName) {
  if (!gameState.inventory.includes(itemName)) {
    gameState.inventory.push(itemName);
  }

  updateInventory();
}

function removeInventoryItem(itemName) {
  gameState.inventory =
    gameState.inventory.filter(
      (item) => item !== itemName
    );

  updateInventory();
}


/* ==================================================
   PROGRESS
================================================== */

function updateProgress() {
  let completedObjectives = [];

  if (gameState.currentRoom === 1) {
    completedObjectives = [
      gameState.room1.inspectedBookshelf,
      gameState.room1.journalOpened,
      gameState.room1.secretPassageFound,
      gameState.room1.completed,
    ];
  } else {
    completedObjectives = [
      gameState.room2.laboratoryInspected,
      gameState.room2.blueVialCollected,
      gameState.room2.vialPoured,
      gameState.room2.completed,
    ];
  }

  const completedCount =
    completedObjectives.filter(Boolean).length;

  const progress = Math.round(
    (completedCount /
      completedObjectives.length) *
      100
  );

  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${progress}%`;

  objectiveItems.forEach((item, index) => {
    const completed =
      completedObjectives[index];

    item.classList.toggle(
      "completed",
      completed
    );

    const status =
      item.querySelector(".objective-status");

    if (status) {
      status.textContent =
        completed ? "✓" : "○";
    }
  });
}


/* ==================================================
   ROOM INTERFACE
================================================== */

function updateRoomInterface() {
  if (gameState.currentRoom === 1) {
    roomOneScene.classList.add(
      "active-room"
    );

    roomTwoScene.classList.remove(
      "active-room"
    );

    if (endingScene) {
      endingScene.classList.remove(
        "active-room"
      );
    }

    roomName.textContent =
      "The Haunted Library";

    roomDescription.textContent =
      "You wake up inside an abandoned library at midnight. " +
      "The exit door is locked, and a ghostly librarian watches " +
      "silently from behind an old wooden desk.";

    gameMasterName.textContent =
      "The Ghost Librarian";

    roomCounter.textContent = "1 of 2";

    commandHelp.textContent =
      "Speak naturally. Try describing what you want to inspect, take, open, or use.";

    objectiveTexts[0].textContent =
      "Search the library";

    objectiveTexts[1].textContent =
      "Open the locked journal";

    objectiveTexts[2].textContent =
      "Discover the secret passage";

    objectiveTexts[3].textContent =
      "Enter the next room";
  } else {
    roomOneScene.classList.remove(
      "active-room"
    );

    roomTwoScene.classList.add(
      "active-room"
    );

    if (endingScene) {
      endingScene.classList.remove(
        "active-room"
      );
    }

    roomName.textContent =
      "The Alchemist’s Laboratory";

    roomDescription.textContent =
      "The secret passage leads into an underground laboratory " +
      "filled with cracked bottles, ancient machines, a bubbling " +
      "cauldron, and a stone pedestal glowing with blue light.";

    gameMasterName.textContent =
      "The Laboratory Voice";

    roomCounter.textContent = "2 of 2";

    commandHelp.textContent =
      "Speak naturally. Describe how you want to interact with the laboratory.";

    objectiveTexts[0].textContent =
      "Inspect the laboratory";

    objectiveTexts[1].textContent =
      "Find the blue vial";

    objectiveTexts[2].textContent =
      "Activate the pedestal";

    objectiveTexts[3].textContent =
      "Escape the laboratory";
  }

  updateProgress();
}


/* ==================================================
   ROOM TRANSITION
================================================== */

function showRoomTransition() {
  transitionInProgress = true;

  commandInput.disabled = true;
  sendButton.disabled = true;

  const transitionLabel =
    transitionOverlay.querySelector("span");

  const transitionTitle =
    transitionOverlay.querySelector("strong");

  if (transitionLabel) {
    transitionLabel.textContent =
      "Entering";
  }

  if (transitionTitle) {
    transitionTitle.textContent =
      "The Alchemist’s Laboratory";
  }

  transitionOverlay.classList.add(
    "active"
  );

  setTimeout(() => {
    gameState.currentRoom = 2;
    updateRoomInterface();
  }, 650);

  setTimeout(() => {
    transitionOverlay.classList.remove(
      "active"
    );

    transitionInProgress = false;

    commandInput.disabled = false;
    sendButton.disabled = false;

    commandInput.focus();
  }, 1200);
}
/* ==================================================
   ROOM 1 — HAUNTED LIBRARY
================================================== */

function inspectBookshelf() {
  const room = gameState.room1;

  if (!room.inspectedBookshelf) {
    room.inspectedBookshelf = true;

    addMessage(
      "Most of the books are covered in dust, but one red book appears to have been moved recently.",
      "narrator"
    );

    updateProgress();
    return;
  }

  if (!room.redBookPulled) {
    addMessage(
      "The red book still sticks out slightly from the shelf.",
      "narrator"
    );
    return;
  }

  addMessage(
    "The hidden compartment behind the bookshelf is already open.",
    "narrator"
  );
}

function pullRedBook() {
  const room = gameState.room1;

  if (!room.inspectedBookshelf) {
    addMessage(
      "You should inspect the bookshelf first.",
      "narrator"
    );
    return;
  }

  if (room.redBookPulled) {
    addMessage(
      "You already pulled the red book.",
      "narrator"
    );
    return;
  }

  room.redBookPulled = true;

  addMessage(
    "You pull the red book. A hidden compartment opens behind the shelf, revealing a silver key.",
    "narrator"
  );
}

function collectSilverKey() {
  const room = gameState.room1;

  if (!room.redBookPulled) {
    addMessage(
      "You do not see a silver key yet.",
      "narrator"
    );
    return;
  }

  if (room.silverKeyCollected) {
    addMessage(
      "The silver key is already in your inventory.",
      "narrator"
    );
    return;
  }

  room.silverKeyCollected = true;

  addInventoryItem("Silver Key");

  addMessage(
    "You collect the silver key and place it in your inventory.",
    "narrator"
  );
}

function inspectDesk() {
  addMessage(
    "The old desk is covered in candle wax and scratches. A locked journal rests on top.",
    "narrator"
  );
}

function openJournal() {
  const room = gameState.room1;

  if (room.journalOpened) {
    addMessage(
      "The journal is already open. Its final page shows a drawing of the left bookshelf.",
      "narrator"
    );
    return;
  }

  if (!room.silverKeyCollected) {
    addMessage(
      "The journal is locked with a tiny silver lock. You need the silver key.",
      "narrator"
    );
    return;
  }

  room.journalOpened = true;

  addMessage(
    "The silver key unlocks the journal. Inside, a note reads: 'Push the third green book on the left shelf.'",
    "narrator"
  );

  updateProgress();
}

function discoverSecretPassage() {
  const room = gameState.room1;

  if (!room.journalOpened) {
    addMessage(
      "You do not know which book activates the passage.",
      "narrator"
    );
    return;
  }

  if (room.secretPassageFound) {
    addMessage(
      "The secret passage is already open.",
      "narrator"
    );
    return;
  }

  room.secretPassageFound = true;

  addMessage(
    "You push the third green book. The bookshelf slides aside, revealing a narrow passage leading underground.",
    "narrator"
  );

  updateProgress();
}

function enterSecondRoom() {
  const room = gameState.room1;

  if (!room.secretPassageFound) {
    addMessage(
      "You have not found a way out of the library yet.",
      "narrator"
    );
    return;
  }

  if (
    room.completed ||
    transitionInProgress
  ) {
    return;
  }

  room.completed = true;

  removeInventoryItem("Silver Key");
  updateProgress();

  addMessage(
    "You step into the narrow passage. The bookshelf begins closing behind you.",
    "narrator"
  );

  showRoomTransition();

  setTimeout(() => {
    addMessage(
      "You emerge inside the Alchemist’s Laboratory. A mechanical voice echoes: 'Restore the moonlight, and the final door shall open.'",
      "narrator"
    );
  }, 1550);
}


/* ==================================================
   ROOM 2 — ALCHEMIST'S LABORATORY
================================================== */

function inspectLaboratory() {
  const room = gameState.room2;

  if (!room.laboratoryInspected) {
    room.laboratoryInspected = true;

    addMessage(
      "The laboratory contains a wooden workbench, potion shelves, a bubbling cauldron, a stone pedestal, and a metal exit door covered in glowing symbols.",
      "narrator"
    );

    updateProgress();
    return;
  }

  addMessage(
    "You see the workbench, potion shelves, cauldron, pedestal, and sealed exit door.",
    "narrator"
  );
}

function inspectWorkbench() {
  const room = gameState.room2;

  if (!room.laboratoryInspected) {
    addMessage(
      "You should inspect the laboratory first.",
      "narrator"
    );
    return;
  }

  room.workbenchInspected = true;

  if (!room.blueVialCollected) {
    addMessage(
      "On the workbench, several empty bottles surround a single blue vial labeled 'Essence of Moonlight.'",
      "narrator"
    );
  } else {
    addMessage(
      "The workbench now holds only empty bottles and faded notes.",
      "narrator"
    );
  }
}

function collectBlueVial() {
  const room = gameState.room2;

  if (!room.workbenchInspected) {
    addMessage(
      "You have not found the blue vial yet. Try inspecting the workbench.",
      "narrator"
    );
    return;
  }

  if (room.blueVialCollected) {
    addMessage(
      "The blue vial is already in your inventory.",
      "narrator"
    );
    return;
  }

  room.blueVialCollected = true;

  addInventoryItem("Blue Vial");

  addMessage(
    "You carefully take the blue vial and place it in your inventory.",
    "narrator"
  );

  updateProgress();
}

function inspectPedestal() {
  const room = gameState.room2;

  room.pedestalInspected = true;

  if (!room.vialPoured) {
    addMessage(
      "The stone pedestal contains a circular basin. An inscription reads: 'Pour the light of the moon into the sleeping stone.'",
      "narrator"
    );
  } else {
    addMessage(
      "The pedestal glows with blue energy. Ancient symbols shine across its surface.",
      "narrator"
    );
  }
}

function pourBlueVial() {
  const room = gameState.room2;

  if (!room.pedestalInspected) {
    addMessage(
      "You should inspect the stone pedestal first.",
      "narrator"
    );
    return;
  }

  if (!room.blueVialCollected) {
    addMessage(
      "You do not have the blue vial.",
      "narrator"
    );
    return;
  }

  if (room.vialPoured) {
    addMessage(
      "The blue liquid has already been poured into the pedestal.",
      "narrator"
    );
    return;
  }

  room.vialPoured = true;

  removeInventoryItem("Blue Vial");

  addMessage(
    "You pour the blue liquid into the stone basin. The pedestal awakens, filling the laboratory with pale moonlight.",
    "narrator"
  );

  addMessage(
    "Glowing symbols appear: 'Speak the name of the light that rules the night.'",
    "narrator"
  );

  updateProgress();
}

function readSymbols() {
  const room = gameState.room2;

  if (!room.vialPoured) {
    addMessage(
      "The pedestal’s symbols are dark and unreadable.",
      "narrator"
    );
    return;
  }

  room.symbolsRead = true;

  addMessage(
    "The symbols translate to: 'Speak the name of the light that rules the night.'",
    "narrator"
  );
}

function speakMoonlight() {
  const room = gameState.room2;

  if (!room.vialPoured) {
    addMessage(
      "Nothing responds. The pedestal has not been activated.",
      "narrator"
    );
    return;
  }

  if (room.passwordSpoken) {
    addMessage(
      "The word has already been accepted. The final door is unlocked.",
      "narrator"
    );
    return;
  }

  room.passwordSpoken = true;

  addMessage(
    "You say, 'Moonlight.' The symbols flash brightly, and the metal exit door unlocks with a deep mechanical click.",
    "narrator"
  );
}


function escapeLaboratory() {
  const room = gameState.room2;

  if (gameState.gameCompleted) {
    return;
  }

  if (!room.passwordSpoken) {
    addMessage(
      "The final door is still sealed. Activate the pedestal and speak the correct password first.",
      "narrator"
    );
    return;
  }

  room.completed = true;
  gameState.gameCompleted = true;

  clearInterval(timerInterval);
  updateProgress();

  addMessage(
    "You push open the final door and step into the moonlit courtyard. You have escaped!",
    "narrator"
  );

  disableGame();

  setTimeout(() => {
    showEndingScene();
  }, 900);
}


/* ==================================================
   ENDING SCENE
================================================== */
/* ==================================================
   ENDING RESULTS
================================================== */

function calculateEndingResults() {
  const totalGameSeconds = 30 * 60;

  const usedSeconds = Math.max(
    0,
    totalGameSeconds - secondsRemaining
  );

  finalCompletionTime.textContent =
    formatTime(usedSeconds);

  finalTimeRemaining.textContent =
    formatTime(Math.max(0, secondsRemaining));

  let rank = "C";

  if (secondsRemaining >= 20 * 60) {
    rank = "S";
  } else if (secondsRemaining >= 12 * 60) {
    rank = "A";
  } else if (secondsRemaining >= 5 * 60) {
    rank = "B";
  }

  finalRank.textContent = rank;
}


/* ==================================================
   ENDING SOUND
================================================== */

function playVictorySound() {
  if (!soundEnabled) {
    return;
  }

  try {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext =
      new AudioContextClass();

    const notes = [
      { frequency: 261.63, start: 0 },
      { frequency: 329.63, start: 0.18 },
      { frequency: 392.0, start: 0.36 },
      { frequency: 523.25, start: 0.58 },
      { frequency: 659.25, start: 0.82 },
    ];

    notes.forEach((note, index) => {
      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.type =
        index === notes.length - 1
          ? "sine"
          : "triangle";

      oscillator.frequency.value =
        note.frequency;

      gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime + note.start
      );

      gain.gain.exponentialRampToValueAtTime(
        0.16,
        audioContext.currentTime +
          note.start +
          0.03
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime +
          note.start +
          1.15
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(
        audioContext.currentTime + note.start
      );

      oscillator.stop(
        audioContext.currentTime +
          note.start +
          1.2
      );
    });

    setTimeout(() => {
      audioContext.close();
    }, 2400);
  } catch (error) {
    console.warn(
      "Victory sound could not play:",
      error
    );
  }
}


/* ==================================================
   ENDING CONTROLS
================================================== */

function skipEndingAnimation() {
  if (!endingScene) {
    return;
  }

  endingScene.classList.remove(
    "ending-running"
  );

  endingScene.classList.add(
    "ending-skipped",
    "ending-finished"
  );
}

function openEndingCredits() {
  victoryPanel.classList.add(
    "results-hidden"
  );

  endingCredits.classList.add(
    "credits-visible"
  );

  endingCredits.setAttribute(
    "aria-hidden",
    "false"
  );
}

function closeEndingCredits() {
  endingCredits.classList.remove(
    "credits-visible"
  );

  endingCredits.setAttribute(
    "aria-hidden",
    "true"
  );

  victoryPanel.classList.remove(
    "results-hidden"
  );
}

function showEndingScene() {
  roomOneScene.classList.remove("active-room");
  roomTwoScene.classList.remove("active-room");

  if (endingScene) {
    endingScene.classList.remove("active-room");
  }

  calculateEndingResults();

  roomName.textContent = "The Moonlit Courtyard";
  roomDescription.textContent =
    "You escaped the haunted library and the alchemist’s laboratory.";
  gameMasterName.textContent = "Adventure Complete";
  roomCounter.textContent = "2 of 2";
  commandHelp.textContent = "The adventure is complete.";

  progressBar.style.width = "100%";
  progressText.textContent = "100%";

  objectiveTexts[0].textContent = "Found the secret passage";
  objectiveTexts[1].textContent = "Entered the laboratory";
  objectiveTexts[2].textContent = "Solved the moonlight puzzle";
  objectiveTexts[3].textContent = "Escaped both rooms";

  objectiveItems.forEach((item) => {
    item.classList.add("completed");

    const status = item.querySelector(".objective-status");

    if (status) {
      status.textContent = "✓";
    }
  });

  showVictoryOverlay();

  setTimeout(() => {
    playVictorySound();
  }, 700);
}

function showVictoryOverlay() {
  const oldOverlay = document.querySelector("#escapeVictoryOverlay");

  if (oldOverlay) {
    oldOverlay.remove();
  }

  const totalGameSeconds = 30 * 60;
  const usedSeconds = Math.max(
    0,
    totalGameSeconds - secondsRemaining
  );

  let rank = "C";

  if (secondsRemaining >= 20 * 60) {
    rank = "S";
  } else if (secondsRemaining >= 12 * 60) {
    rank = "A";
  } else if (secondsRemaining >= 5 * 60) {
    rank = "B";
  }

  const overlay = document.createElement("section");
  overlay.id = "escapeVictoryOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "EscapeAI victory screen");

  overlay.innerHTML = `
    <style>
      body.escape-victory-open {
        overflow: hidden;
      }

      #escapeVictoryOverlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        min-height: 100vh;
        padding: 24px;
        overflow: auto;
        color: #fffaf0;
        background:
          radial-gradient(circle at 50% 18%, rgba(226, 190, 102, 0.18), transparent 26%),
          radial-gradient(circle at 15% 80%, rgba(92, 61, 128, 0.2), transparent 30%),
          linear-gradient(155deg, #08070d 0%, #12101d 48%, #07070c 100%);
        isolation: isolate;
        animation: victoryFadeIn 700ms ease both;
      }

      #escapeVictoryOverlay::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -3;
        opacity: 0.65;
        background-image:
          radial-gradient(circle, rgba(255,255,255,0.95) 0 1px, transparent 1.5px),
          radial-gradient(circle, rgba(232,198,111,0.8) 0 1px, transparent 1.5px);
        background-position: 0 0, 48px 62px;
        background-size: 105px 105px, 145px 145px;
        animation: starDrift 18s linear infinite;
      }

      #escapeVictoryOverlay::after {
        content: "";
        position: fixed;
        left: -10%;
        right: -10%;
        bottom: -75px;
        z-index: -1;
        height: 220px;
        filter: blur(22px);
        background:
          radial-gradient(ellipse at center, rgba(211, 220, 226, 0.26), transparent 65%),
          linear-gradient(to top, rgba(220, 229, 235, 0.2), transparent);
        animation: fogMove 8s ease-in-out infinite alternate;
      }

      .victory-moon {
        position: absolute;
        top: clamp(30px, 7vh, 85px);
        left: 50%;
        width: clamp(110px, 12vw, 170px);
        aspect-ratio: 1;
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow:
          0 0 35px rgba(255, 230, 157, 0.62),
          0 0 110px rgba(226, 189, 97, 0.28);
        background:
          radial-gradient(circle at 35% 32%, rgba(255,255,255,0.9), transparent 8%),
          radial-gradient(circle at 66% 60%, rgba(148,119,80,0.22), transparent 13%),
          radial-gradient(circle at 45% 50%, #fff7d8 0%, #e7c775 72%, #c69d44 100%);
        animation: moonRise 1.3s cubic-bezier(.2,.8,.2,1) both;
      }

      .victory-card {
        width: min(760px, 100%);
        margin-top: clamp(80px, 14vh, 150px);
        padding: clamp(28px, 5vw, 58px);
        text-align: center;
        border: 1px solid rgba(226, 190, 102, 0.38);
        border-radius: 28px;
        background: linear-gradient(
          145deg,
          rgba(20, 17, 31, 0.91),
          rgba(10, 9, 16, 0.95)
        );
        box-shadow:
          0 30px 100px rgba(0, 0, 0, 0.65),
          inset 0 1px 0 rgba(255,255,255,0.06);
        backdrop-filter: blur(18px);
        animation: cardRise 950ms 180ms cubic-bezier(.2,.9,.2,1) both;
      }

      .victory-eyebrow {
        margin: 0 0 12px;
        color: #e2bd69;
        font: 700 0.82rem/1.2 system-ui, sans-serif;
        letter-spacing: 0.28em;
        text-transform: uppercase;
      }

      .victory-trophy {
        display: inline-grid;
        place-items: center;
        width: 70px;
        height: 70px;
        margin-bottom: 10px;
        font-size: 2.6rem;
        border: 1px solid rgba(226, 190, 102, 0.42);
        border-radius: 50%;
        background: rgba(226, 190, 102, 0.1);
        box-shadow: 0 0 32px rgba(226, 190, 102, 0.18);
        animation: trophyPop 900ms 700ms cubic-bezier(.2,1.4,.3,1) both;
      }

      .victory-title {
        margin: 0;
        color: #fffaf0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(2.5rem, 7vw, 5rem);
        line-height: 0.98;
        letter-spacing: -0.045em;
        text-shadow: 0 5px 28px rgba(0,0,0,0.5);
      }

      .victory-title span {
        color: #e5bd63;
      }

      .victory-copy {
        max-width: 590px;
        margin: 22px auto 30px;
        color: #c9c3d3;
        font: 400 clamp(1rem, 2vw, 1.12rem)/1.75 system-ui, sans-serif;
      }

      .victory-achievement {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 28px;
        padding: 10px 16px;
        color: #f5d889;
        font: 700 0.88rem/1.2 system-ui, sans-serif;
        border: 1px solid rgba(226, 190, 102, 0.35);
        border-radius: 999px;
        background: rgba(226, 190, 102, 0.08);
      }

      .victory-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin: 0 auto 30px;
      }

      .victory-stat {
        min-width: 0;
        padding: 18px 10px;
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 16px;
        background: rgba(255,255,255,0.035);
      }

      .victory-stat strong {
        display: block;
        overflow-wrap: anywhere;
        color: #fff4cf;
        font: 700 clamp(1.35rem, 4vw, 2rem)/1 Georgia, serif;
      }

      .victory-stat span {
        display: block;
        margin-top: 8px;
        color: #aaa3b8;
        font: 700 0.7rem/1 system-ui, sans-serif;
        letter-spacing: 0.13em;
        text-transform: uppercase;
      }

      .victory-actions {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
      }

      .victory-button {
        min-width: 155px;
        padding: 14px 22px;
        cursor: pointer;
        color: #17121e;
        font: 800 0.95rem/1 system-ui, sans-serif;
        border: 1px solid #e4bd64;
        border-radius: 12px;
        background: linear-gradient(135deg, #f1d07d, #c9983e);
        box-shadow: 0 10px 28px rgba(195, 142, 43, 0.2);
        transition: transform 180ms ease, box-shadow 180ms ease;
      }

      .victory-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 34px rgba(195, 142, 43, 0.3);
      }

      .victory-button.secondary {
        color: #eee8f4;
        border-color: rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.055);
        box-shadow: none;
      }

      .victory-credits {
        display: none;
        margin-top: 25px;
        padding: 20px;
        color: #bbb4c7;
        font: 400 0.94rem/1.65 system-ui, sans-serif;
        border-top: 1px solid rgba(255,255,255,0.09);
      }

      .victory-credits.visible {
        display: block;
        animation: victoryFadeIn 350ms ease both;
      }

      .victory-credits strong {
        color: #f3d37c;
      }

      @keyframes victoryFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes cardRise {
        from { opacity: 0; transform: translateY(34px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes moonRise {
        from { opacity: 0; transform: translate(-50%, 55px) scale(0.72); }
        to { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }

      @keyframes trophyPop {
        from { opacity: 0; transform: scale(0.35) rotate(-18deg); }
        to { opacity: 1; transform: scale(1) rotate(0); }
      }

      @keyframes starDrift {
        from { transform: translateY(0); }
        to { transform: translateY(105px); }
      }

      @keyframes fogMove {
        from { transform: translateX(-4%); opacity: 0.55; }
        to { transform: translateX(4%); opacity: 0.9; }
      }

      @media (max-width: 620px) {
        #escapeVictoryOverlay {
          padding: 14px;
          place-items: start center;
        }

        .victory-card {
          margin-top: 120px;
          padding: 28px 18px;
          border-radius: 22px;
        }

        .victory-stats {
          grid-template-columns: 1fr;
        }

        .victory-button {
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #escapeVictoryOverlay,
        #escapeVictoryOverlay *,
        #escapeVictoryOverlay::before,
        #escapeVictoryOverlay::after {
          animation: none !important;
          scroll-behavior: auto !important;
        }
      }
    </style>

    <div class="victory-moon" aria-hidden="true"></div>

    <article class="victory-card">
      <p class="victory-eyebrow">Adventure Complete</p>
      <div class="victory-trophy" aria-hidden="true">🏆</div>

      <h1 class="victory-title">
        You <span>Escaped!</span>
      </h1>

      <p class="victory-copy">
        The final door opens into a moonlit courtyard. Behind you,
        the haunted library and the alchemist’s laboratory disappear
        into the fog. Every puzzle has been solved.
      </p>

      <div class="victory-achievement">
        ✦ Achievement Unlocked: Escape Artist
      </div>

      <div class="victory-stats">
        <div class="victory-stat">
          <strong>${formatTime(usedSeconds)}</strong>
          <span>Completion Time</span>
        </div>

        <div class="victory-stat">
          <strong>${formatTime(Math.max(0, secondsRemaining))}</strong>
          <span>Time Remaining</span>
        </div>

        <div class="victory-stat">
          <strong>${rank}</strong>
          <span>Escape Rank</span>
        </div>
      </div>

      <div class="victory-actions">
        <button class="victory-button" id="victoryPlayAgain" type="button">
          Play Again
        </button>

        <button class="victory-button secondary" id="victoryCreditsButton" type="button">
          View Credits
        </button>
      </div>

      <div class="victory-credits" id="victoryCredits">
        <strong>EscapeAI</strong><br>
        Created by Jassiris Nunez<br>
        AI command interpretation powered by Google Gemini.
      </div>
    </article>
  `;

  document.body.classList.add("escape-victory-open");
  document.body.appendChild(overlay);

  const playAgain = overlay.querySelector("#victoryPlayAgain");
  const creditsButton = overlay.querySelector("#victoryCreditsButton");
  const credits = overlay.querySelector("#victoryCredits");

  playAgain.addEventListener("click", () => {
    window.location.reload();
  });

  creditsButton.addEventListener("click", () => {
    const isVisible = credits.classList.toggle("visible");

    creditsButton.textContent =
      isVisible ? "Hide Credits" : "View Credits";
  });

  playAgain.focus();
}

/* ==================================================
   HINTS
================================================== */

function askForHint() {
  if (gameState.currentRoom === 1) {
    const room = gameState.room1;

    if (!room.inspectedBookshelf) {
      addMessage(
        "The ghost whispers: One book has gathered less dust than the others.",
        "narrator"
      );
    } else if (!room.redBookPulled) {
      addMessage(
        "The ghost points toward the red book.",
        "narrator"
      );
    } else if (!room.silverKeyCollected) {
      addMessage(
        "The ghost whispers: Take what the hidden compartment revealed.",
        "narrator"
      );
    } else if (!room.journalOpened) {
      addMessage(
        "The ghost looks toward the locked journal.",
        "narrator"
      );
    } else if (!room.secretPassageFound) {
      addMessage(
        "The ghost whispers: Follow the journal’s instructions.",
        "narrator"
      );
    } else {
      addMessage(
        "The ghost points into the secret passage.",
        "narrator"
      );
    }

    return;
  }

  const room = gameState.room2;

  if (!room.laboratoryInspected) {
    addMessage(
      "A distant voice whispers: Begin by examining your surroundings.",
      "narrator"
    );
  } else if (!room.workbenchInspected) {
    addMessage(
      "A faint blue glow comes from the workbench.",
      "narrator"
    );
  } else if (!room.blueVialCollected) {
    addMessage(
      "The vial labeled 'Essence of Moonlight' may be important.",
      "narrator"
    );
  } else if (!room.pedestalInspected) {
    addMessage(
      "The circular basin on the pedestal appears designed to hold liquid.",
      "narrator"
    );
  } else if (!room.vialPoured) {
    addMessage(
      "Pour the blue vial into the pedestal’s basin.",
      "narrator"
    );
  } else if (!room.passwordSpoken) {
    addMessage(
      "What light rules the night?",
      "narrator"
    );
  } else {
    addMessage(
      "The final door is unlocked.",
      "narrator"
    );
  }
}


/* ==================================================
   INVENTORY CHECK
================================================== */

function checkInventory() {
  if (gameState.inventory.length === 0) {
    addMessage(
      "Your inventory is empty.",
      "narrator"
    );
    return;
  }

  addMessage(
    `Your inventory contains: ${gameState.inventory.join(", ")}.`,
    "narrator"
  );
}


/* ==================================================
   ROOM 1 FALLBACK COMMAND PARSER
================================================== */

function processRoomOneCommand(normalized) {
  if (
    normalized.includes("pull the red book") ||
    normalized.includes("pull red book") ||
    normalized.includes("move the red book")
  ) {
    pullRedBook();
    return true;
  }

  if (
    normalized.includes("inspect bookshelf") ||
    normalized.includes("inspect the bookshelf") ||
    normalized.includes("search bookshelf") ||
    normalized.includes("search the bookshelf") ||
    normalized.includes("look at bookshelf") ||
    normalized.includes("look at the bookshelf") ||
    normalized.includes("inspect books")
  ) {
    inspectBookshelf();
    return true;
  }

  if (
    normalized.includes("take silver key") ||
    normalized.includes("take the silver key") ||
    normalized.includes("pick up silver key") ||
    normalized.includes("pick up the silver key") ||
    normalized.includes("collect silver key") ||
    normalized.includes("collect the silver key")
  ) {
    collectSilverKey();
    return true;
  }

  if (
    normalized.includes("inspect desk") ||
    normalized.includes("inspect the desk") ||
    normalized.includes("search desk") ||
    normalized.includes("search the desk") ||
    normalized.includes("look at desk") ||
    normalized.includes("look at the desk")
  ) {
    inspectDesk();
    return true;
  }

  if (
    normalized.includes("open journal") ||
    normalized.includes("open the journal") ||
    normalized.includes("unlock journal") ||
    normalized.includes("unlock the journal")
  ) {
    openJournal();
    return true;
  }

  if (
    normalized.includes("push third green book") ||
    normalized.includes("push the third green book") ||
    normalized.includes("press third green book") ||
    normalized.includes("press the third green book")
  ) {
    discoverSecretPassage();
    return true;
  }

  if (
    normalized.includes("enter passage") ||
    normalized.includes("enter the passage") ||
    normalized.includes("go through passage") ||
    normalized.includes("go through the passage") ||
    normalized.includes("enter next room") ||
    normalized.includes("enter the next room")
  ) {
    enterSecondRoom();
    return true;
  }

  if (
    normalized.includes("inspect room") ||
    normalized.includes("inspect the room") ||
    normalized.includes("look around") ||
    normalized.includes("search room") ||
    normalized.includes("search the room")
  ) {
    inspectBookshelf();
    return true;
  }

  return false;
}


/* ==================================================
   ROOM 2 FALLBACK COMMAND PARSER
================================================== */

function processRoomTwoCommand(normalized) {
  if (
    normalized.includes("inspect laboratory") ||
    normalized.includes("inspect the laboratory") ||
    normalized.includes("inspect room") ||
    normalized.includes("inspect the room") ||
    normalized.includes("look around") ||
    normalized.includes("search room") ||
    normalized.includes("search the room")
  ) {
    inspectLaboratory();
    return true;
  }

  if (
    normalized.includes("inspect workbench") ||
    normalized.includes("inspect the workbench") ||
    normalized.includes("search workbench") ||
    normalized.includes("search the workbench") ||
    normalized.includes("look at workbench") ||
    normalized.includes("look at the workbench")
  ) {
    inspectWorkbench();
    return true;
  }

  if (
    normalized.includes("take blue vial") ||
    normalized.includes("take the blue vial") ||
    normalized.includes("pick up blue vial") ||
    normalized.includes("pick up the blue vial") ||
    normalized.includes("collect blue vial") ||
    normalized.includes("collect the blue vial")
  ) {
    collectBlueVial();
    return true;
  }

  if (
    normalized.includes("inspect pedestal") ||
    normalized.includes("inspect the pedestal") ||
    normalized.includes("inspect stone pedestal") ||
    normalized.includes("inspect the stone pedestal") ||
    normalized.includes("look at pedestal") ||
    normalized.includes("look at the pedestal")
  ) {
    inspectPedestal();
    return true;
  }

  if (
    normalized.includes("pour blue vial") ||
    normalized.includes("pour the blue vial") ||
    normalized.includes("pour vial into pedestal") ||
    normalized.includes("pour the vial into the pedestal") ||
    normalized.includes("use blue vial on pedestal") ||
    normalized.includes("use the blue vial on the pedestal")
  ) {
    pourBlueVial();
    return true;
  }

  if (
    normalized.includes("read symbols") ||
    normalized.includes("read the symbols") ||
    normalized.includes("inspect symbols") ||
    normalized.includes("inspect the symbols")
  ) {
    readSymbols();
    return true;
  }

  if (
    normalized === "moonlight" ||
    normalized.includes("say moonlight") ||
    normalized.includes("speak moonlight")
  ) {
    speakMoonlight();
    return true;
  }

  if (
  normalized.includes("open exit") ||
  normalized.includes("open the exit") ||
  normalized.includes("open final door") ||
  normalized.includes("open the final door") ||
  normalized.includes("go through final door") ||
  normalized.includes("go through the final door") ||
  normalized.includes("walk through final door") ||
  normalized.includes("walk through the final door") ||
  normalized.includes("enter final door") ||
  normalized.includes("enter the final door") ||
  normalized.includes("exit through final door") ||
  normalized.includes("exit through the final door") ||
  normalized.includes("escape laboratory") ||
  normalized.includes("escape the laboratory") ||
  normalized.includes("exit laboratory") ||
  normalized.includes("exit the laboratory") ||
  normalized.includes("leave laboratory") ||
  normalized.includes("leave the laboratory")
) {
  escapeLaboratory();
  return true;
}

  return false;
}


/* ==================================================
   AI ACTION EXECUTION
================================================== */

function executeGameAction(action) {
  const actions = {
    inspectBookshelf,
    pullRedBook,
    collectSilverKey,
    inspectDesk,
    openJournal,
    discoverSecretPassage,
    enterSecondRoom,

    inspectLaboratory,
    inspectWorkbench,
    collectBlueVial,
    inspectPedestal,
    pourBlueVial,
    readSymbols,
    speakMoonlight,
    escapeLaboratory,

    askForHint,
    checkInventory,
  };

  const selectedAction = actions[action];

  if (typeof selectedAction !== "function") {
    return false;
  }

  selectedAction();
  return true;
}


/* ==================================================
   AI COMMAND PROCESSING
================================================== */

async function processTypedCommand(command) {
  const normalized = command
    .toLowerCase()
    .replace(/[.,!?'"`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (
    normalized.includes("hint") ||
    normalized.includes("help")
  ) {
    askForHint();
    return;
  }

  if (
    normalized.includes("inventory") ||
    normalized.includes("what do i have")
  ) {
    checkInventory();
    return;
  }

  // Handle known game commands locally first.
  const locallyHandled =
    gameState.currentRoom === 1
      ? processRoomOneCommand(normalized)
      : processRoomTwoCommand(normalized);

  if (locallyHandled) {
    return;
  }

  setCommandLoading(true);

  try {
    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        command,
        currentRoom: gameState.currentRoom,
        gameState: {
          inventory: gameState.inventory,
          room1: gameState.room1,
          room2: gameState.room2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Interpreter returned ${response.status}`
      );
    }

    const interpretation = await response.json();

    console.log(
      "AI interpretation:",
      interpretation
    );

    const handled = executeGameAction(
      interpretation.action
    );

    if (
      !handled ||
      interpretation.action === "unknown"
    ) {
      addMessage(
        "I am not sure what action you intended. Try describing what object you want to inspect, take, use, open, or interact with.",
        "narrator"
      );
    }
  } catch (error) {
    console.error(
      "AI command error:",
      error
    );

    addMessage(
      "The magical interpreter is temporarily unavailable. Try a simpler command such as “inspect the pedestal” or “pour the vial.”",
      "narrator"
    );
  } finally {
    setCommandLoading(false);
  }
}

/* ==================================================
   EVENTS
================================================== */

commandForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (
    transitionInProgress ||
    commandInput.disabled ||
    gameState.gameCompleted
  ) {
    return;
  }

  const command = commandInput.value.trim();

  if (!command) {
    return;
  }

  addMessage(command, "player");

  commandInput.value = "";

  await processTypedCommand(command);
});

exampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    commandInput.value =
      button.textContent.trim();

    commandInput.focus();
  });
});


/* ==================================================
   BUTTONS
================================================== */

restartButton.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Restart the game and erase your current progress?"
  );

  if (confirmed) {
    window.location.reload();
  }
});

if (playAgainButton) {
  playAgainButton.addEventListener(
    "click",
    () => {
      window.location.reload();
    }
  );
}

if (showCreditsButton) {
  showCreditsButton.addEventListener(
    "click",
    openEndingCredits
  );
}

if (closeCreditsButton) {
  closeCreditsButton.addEventListener(
    "click",
    closeEndingCredits
  );
}

if (skipEndingButton) {
  skipEndingButton.addEventListener(
    "click",
    skipEndingAnimation
  );
}
soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundButton.textContent =
    soundEnabled ? "🔊" : "🔇";

  soundButton.setAttribute(
    "aria-label",
    soundEnabled
      ? "Mute sound"
      : "Enable sound"
  );
});


/* ==================================================
   SERVER STATUS
================================================== */

async function checkServer() {
  if (!connectionStatus) return;

  try {
    const response =
      await fetch("/api/status");

    if (!response.ok) {
      throw new Error();
    }

    connectionStatus.innerHTML =
      "<span></span> Online";
  } catch (error) {
    connectionStatus.textContent =
      "Offline";

    console.error(
      "EscapeAI server check failed:",
      error
    );
  }
}


/* ==================================================
   INITIALIZE GAME
================================================== */

function initializeGame() {
  updateInventory();

  updateRoomInterface();

  startTimer();

  checkServer();

  commandInput.focus();

  addMessage(
    "Welcome to EscapeAI. Speak naturally to interact with the world around you. Your objective is to escape the haunted library and the alchemist's laboratory before time runs out.",
    "narrator"
  );
}

initializeGame();
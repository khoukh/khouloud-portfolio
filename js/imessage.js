window.addEventListener("load", () => {
  const chat = document.getElementById("chat");
  const imessageSection = document.getElementById("imessage-section");
  const desktopSection = document.getElementById("desktop-section");
  const sendSound = document.getElementById("sendSound");
  const receiveSound = document.getElementById("receiveSound");

  let audioUnlocked = false;

  /* -----------------------------------------------------
     🔊 CREATE SOUND HINT
  ----------------------------------------------------- */
  const soundHint = document.createElement("div");
  soundHint.id = "sound-hint";
  soundHint.textContent = "🔊 Tap anywhere to enable sound";
  document.body.appendChild(soundHint);

  // Make it visible after paint
  setTimeout(() => soundHint.classList.add("visible"), 50);

  /* -----------------------------------------------------
     🟡 UNLOCK AUDIO ON FIRST INTERACTION
  ----------------------------------------------------- */
  window.addEventListener(
    "click",
    () => {
      audioUnlocked = true;

      // Hide hint
      soundHint.classList.remove("visible");
      soundHint.classList.add("hidden");

      // Unlock audio
      [sendSound, receiveSound].forEach((snd) => {
        snd.play().catch(() => {});
        snd.pause();
      });
    },
    { once: true }
  );

  /* -----------------------------------------------------
     🔄 RESET INTRO ONLY ON HARD REFRESH
  ----------------------------------------------------- */
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    sessionStorage.removeItem("introShown");
  }

  /* -----------------------------------------------------
     🎵 PLAY SOUND FUNCTION
  ----------------------------------------------------- */
  function playSound(sound) {
    if (!audioUnlocked) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  /* -----------------------------------------------------
     ✨ INTRO SEQUENCE
  ----------------------------------------------------- */
  function startIntro() {
    let index = 0;
    const messages = [
      { from: "them", text: "Hey Khouloud, what do you do?" },
      { from: "me", text: "I’m a Data Analyst with a focus on marketing data." },
      { from: "them", text: "Can you show me?" }
    ];

    function showMessage() {
      if (index >= messages.length) {
        createWelcomeMessage();
        return;
      }

      const msg = document.createElement("div");
      msg.className = `bubble ${messages[index].from}`;
      msg.textContent = messages[index].text;

      chat.appendChild(msg);

      if (messages[index].from === "me") playSound(sendSound);
      else playSound(receiveSound);

      index++;
      setTimeout(showMessage, 1200);
    }

    function createWelcomeMessage() {
      const welcomeMsg = document.createElement("div");
      welcomeMsg.classList.add("bubble", "me", "welcome");
      welcomeMsg.textContent = "Sure, welcome to my workspace!";
      chat.appendChild(welcomeMsg);

      welcomeMsg.style.transform = "scale(0.7)";
      welcomeMsg.style.opacity = "0";
      welcomeMsg.style.transition = "transform 0.9s ease, opacity 0.9s ease";

      setTimeout(() => {
        welcomeMsg.style.transform = "scale(1.5)";
        welcomeMsg.style.opacity = "1";
        playSound(sendSound);
      }, 50);

      setTimeout(() => {
        imessageSection.classList.add("fade-out");
        setTimeout(() => {
          imessageSection.classList.add("hidden");
          desktopSection.classList.remove("hidden");
        }, 800);
      }, 1500);

      sessionStorage.setItem("introShown", "true");
    }

    showMessage();
  }

  /* -----------------------------------------------------
     🔹 RUN INTRO OR SKIP IF ALREADY SHOWN
  ----------------------------------------------------- */
  if (!sessionStorage.getItem("introShown")) {
    startIntro();
  } else {
    imessageSection.classList.add("hidden");
    desktopSection.classList.remove("hidden");
  }
});

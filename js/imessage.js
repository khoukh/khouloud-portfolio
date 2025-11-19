window.addEventListener("load", () => {
  const chat = document.getElementById("chat");
  const imessageSection = document.getElementById("imessage-section");
  const desktopSection = document.getElementById("desktop-section");
  const sendSound = document.getElementById("sendSound");
  const receiveSound = document.getElementById("receiveSound");

  let audioUnlocked = false;

  // -----------------------------------------------------
  // 🔊 CREATE SOUND HINT
  // -----------------------------------------------------
  const soundHint = document.createElement("div");
  soundHint.id = "sound-hint";
  soundHint.textContent = "🔊 Tap anywhere to enable sound";
  document.body.appendChild(soundHint);

  // Show it after a tiny delay so it's visible
  setTimeout(() => soundHint.classList.add("visible"), 50);

  // Automatically hide the hint after 5 seconds
  setTimeout(() => {
    soundHint.classList.remove("visible");
    soundHint.classList.add("hidden");
  }, 5000);

  // -----------------------------------------------------
  // 🟡 UNLOCK AUDIO ON FIRST CLICK
  // -----------------------------------------------------
  window.addEventListener(
    "click",
    () => {
      audioUnlocked = true;

      // Hide the hint if it’s still visible
      soundHint.classList.remove("visible");
      soundHint.classList.add("hidden");

      // Unlock sounds silently
      [sendSound, receiveSound].forEach((snd) => {
        snd.play().catch(() => {});
        snd.pause();
      });
    },
    { once: true }
  );

  // -----------------------------------------------------
  // RESET INTRO ON HARD REFRESH
  // -----------------------------------------------------
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    sessionStorage.removeItem("introShown");
  }

  // -----------------------------------------------------
  // PLAY SOUND HELPER
  // -----------------------------------------------------
  function playSound(sound) {
    if (!audioUnlocked) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  // -----------------------------------------------------
  // START INTRO SEQUENCE
  // -----------------------------------------------------
  function startIntro() {
    let index = 0;
    const messages = [
      { from: "them", text: "Hey Khouloud, what do you do?" },
      { from: "me", text: "I’m a Data Analyst with a focus on marketing data." },
      { from: "them", text: "Can you show me?" }
    ];

    function showMessage() {
      if (index >= messages.length) {
        const welcomeMsg = document.createElement("div");
        welcomeMsg.classList.add("bubble", "me", "welcome");
        welcomeMsg.textContent = "Sure, welcome to my workspace!";
        chat.appendChild(welcomeMsg);

        welcomeMsg.style.transform = "scale(0)";
        welcomeMsg.style.transition = "transform 0.8s ease, opacity 0.8s ease";
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
        return;
      }

      const msg = document.createElement("div");
      msg.classList.add("bubble", messages[index].from);
      msg.textContent = messages[index].text;
      chat.appendChild(msg);

      if (messages[index].from === "me") {
        playSound(sendSound);
      } else {
        playSound(receiveSound);
      }

      index++;
      setTimeout(showMessage, 1200);
    }

    showMessage();
  }

  // -----------------------------------------------------
  // RUN INTRO OR SKIP
  // -----------------------------------------------------
  if (!sessionStorage.getItem("introShown")) {
    startIntro();
  } else {
    imessageSection.classList.add("hidden");
    desktopSection.classList.remove("hidden");
  }
});

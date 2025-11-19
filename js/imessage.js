window.addEventListener("load", () => {
  const chat = document.getElementById("chat");
  const imessageSection = document.getElementById("imessage-section");
  const desktopSection = document.getElementById("desktop-section");
  const sendSound = document.getElementById("sendSound");
  const receiveSound = document.getElementById("receiveSound");

  let audioUnlocked = false; // track whether audio is unlocked

  // CREATE SOUND HINT
  const soundHint = document.createElement("div");
  soundHint.id = "sound-hint";
  soundHint.textContent = "🔊 Tap anywhere to enable sound";
  document.body.appendChild(soundHint);

  // Small fade-in
  requestAnimationFrame(() => soundHint.classList.add("visible"));

  // Detect reload → clear intro flag so it runs again
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    sessionStorage.removeItem("introShown");
  }

  function playSound(sound) {
    if (!audioUnlocked) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

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

      if (messages[index].from === "me") playSound(sendSound);
      else playSound(receiveSound);

      index++;
      setTimeout(showMessage, 1200);
    }

    showMessage();
  }

  if (!sessionStorage.getItem("introShown")) {
    startIntro();
  } else {
    imessageSection.classList.add("hidden");
    desktopSection.classList.remove("hidden");
  }

  // UNLOCK AUDIO ON FIRST CLICK AND HIDE HINT
  window.addEventListener(
    "click",
    () => {
      audioUnlocked = true;

      // Hide hint
      soundHint.classList.remove("visible");
      soundHint.classList.add("hidden");

      // Preplay sounds silently to unlock them
      [sendSound, receiveSound].forEach((snd) => {
        snd.play().catch(() => {});
        snd.pause();
      });
    },
    { once: true }
  );
});

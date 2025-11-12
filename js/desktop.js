
// Get the real time using the clock
function updateClock() {
  const clock = document.getElementById("clock");
  if (!clock) return;

  const now = new Date();
  const options = {
    weekday: "short",
    month:"short",
    day:"numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
clock.textContent = now.toLocaleDateString("en-US", options).replace(",", "");
}

// Update immediately
updateClock();
// Then every 30s (no need for every second, saves resources)
setInterval(updateClock, 30000);

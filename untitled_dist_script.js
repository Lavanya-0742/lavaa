const flame = document.getElementById("flame-group");
const btn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const bdayMsg = document.getElementById("birthday-message");

btn.addEventListener("click", async () => {
  try {
    // 1. Get Mic Permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    btn.style.display = "none";
    statusText.innerText = "Listening... Blow now!";

    // 2. Set up Audio Analysis
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // 3. The Loop (This is where 'average' lives!)
    function detectBlow() {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      let average = sum / dataArray.length;

      // 4. Check the volume level
      if (average > 80) {
        // Put out flame
        flame.classList.add("extinguished");

        // Hide instructions
        statusText.style.display = "none";

        // Show Birthday Message
        bdayMsg.classList.add("reveal");
        bdayMsg.style.opacity = "1"; // Backup to ensure it shows

        // Stop the mic
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      requestAnimationFrame(detectBlow);
    }

    detectBlow();
  } catch (err) {
    statusText.innerText = "Error: Allow microphone access!";
    console.error(err);
  }
});
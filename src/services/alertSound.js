// Track which alerts have had sound played
const playedAlerts = new Set();

const playTone = (frequency, beeps) => {
  if (typeof window === 'undefined' || (!window.AudioContext && !window.webkitAudioContext)) return;
  
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    
    let time = ctx.currentTime;
    
    for (let i = 0; i < beeps; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + 0.05);
      gain.gain.linearRampToValueAtTime(0, time + 0.2);
      
      osc.start(time);
      osc.stop(time + 0.2);
      
      time += 0.3;
    }
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export function playAlertSound(alertId, severity = 'moderate') {
  // Check if already played
  if (playedAlerts.has(alertId)) return false;
  
  replayAlertSound(severity);
  
  // Mark as played
  playedAlerts.add(alertId);
  return true;
}

export function replayAlertSound(severity = 'moderate') {
  let frequency = 440;
  let beeps = 1;
  
  if (severity === 'critical' || severity === 'extreme') {
    frequency = 880;
    beeps = 3;
  } else if (severity === 'high' || severity === 'severe') {
    frequency = 660;
    beeps = 2;
  }
  
  playTone(frequency, beeps);
}

export function clearPlayedAlerts() {
  playedAlerts.clear();
}

export function hasPlayedAlert(alertId) {
  return playedAlerts.has(alertId);
}

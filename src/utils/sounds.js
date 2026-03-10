const AudioContext =
    window.AudioContext || window.webkitAudioContext;
let ctx = null;

const getCtx = () => {
    if (!ctx) ctx = new AudioContext();
    return ctx;
};

export const playWarningBeep = () => {
    try {
        const c = getCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
            110, c.currentTime + 0.5
        );
        gain.gain.setValueAtTime(0.3, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001, c.currentTime + 0.8
        );
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.8);
    } catch (e) { }
};

export const playSuccessChime = () => {
    try {
        const c = getCtx();
        [523, 659, 784].forEach((freq, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.connect(gain);
            gain.connect(c.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = c.currentTime + i * 0.15;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(
                0.001, start + 0.4
            );
            osc.start(start);
            osc.stop(start + 0.4);
        });
    } catch (e) { }
};

export const playClickSound = () => {
    try {
        const c = getCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001, c.currentTime + 0.05
        );
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.05);
    } catch (e) { }
};

export const playScanHum = () => {
    try {
        const c = getCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.type = 'sine';
        osc.frequency.value = 60;
        gain.gain.value = 0.05;
        osc.start(c.currentTime);
        setTimeout(() => {
            try { osc.stop(); } catch (e) { }
        }, 8000);
        return osc;
    } catch (e) { }
};

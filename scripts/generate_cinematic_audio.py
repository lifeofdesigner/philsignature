import numpy as np
import scipy.io.wavfile as wavfile
import os

def create_cinematic_track(filename="video_assets/audio/cinematic_soundtrack.wav", duration=60.0, sr=44100):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    n_samples = int(duration * sr)
    t = np.linspace(0, duration, n_samples, endpoint=False)
    
    # Left and Right stereo channels
    left = np.zeros(n_samples, dtype=np.float32)
    right = np.zeros(n_samples, dtype=np.float32)
    
    # 1. Warm Analog Synth Pads (Chord Progression: Dm -> Bb -> F -> C -> Dm)
    # Chord schedule (in seconds):
    chords = [
        (0.0, 8.0, [73.42, 110.0, 174.61, 220.0, 293.66]),    # Dm (D2, A2, F3, A3, D4)
        (8.0, 18.0, [58.27, 116.54, 146.83, 174.61, 233.08]), # Bb (Bb1, Bb2, D3, F3, Bb3)
        (18.0, 28.0, [87.31, 130.81, 174.61, 220.0, 261.63]), # F (F2, C3, F3, A3, C4)
        (28.0, 38.0, [65.41, 130.81, 164.81, 196.0, 246.94]), # C (C2, C3, E3, G3, B3)
        (38.0, 48.0, [73.42, 110.0, 174.61, 220.0, 293.66]),  # Dm (D2, A2, F3, A3, D4)
        (48.0, 55.0, [58.27, 116.54, 146.83, 174.61, 261.63]),# Bbadd9
        (55.0, 60.0, [73.42, 110.0, 146.83, 220.0, 293.66])   # Dm sus2 / resolve
    ]
    
    for start_t, end_t, freqs in chords:
        seg_len = int((end_t - start_t) * sr)
        seg_idx = slice(int(start_t * sr), int(start_t * sr) + seg_len)
        t_seg = np.linspace(0, end_t - start_t, seg_len, endpoint=False)
        
        # Envelope: smooth crossfade
        env = np.ones(seg_len, dtype=np.float32)
        fade_len = int(1.2 * sr)
        if fade_len > 0 and fade_len < seg_len // 2:
            env[:fade_len] = 0.5 * (1 - np.cos(np.pi * np.linspace(0, 1, fade_len)))
            env[-fade_len:] = 0.5 * (1 + np.cos(np.pi * np.linspace(0, 1, fade_len)))
        
        chord_l = np.zeros(seg_len, dtype=np.float32)
        chord_r = np.zeros(seg_len, dtype=np.float32)
        
        for f in freqs:
            # Multi-oscillator detuning for rich atmospheric stereo spread
            osc1 = np.sin(2 * np.pi * f * t_seg)
            osc2 = np.sin(2 * np.pi * (f * 1.003) * t_seg + 0.4)
            osc3 = np.sin(2 * np.pi * (f * 0.997) * t_seg - 0.4)
            osc_sub = np.sin(2 * np.pi * (f * 0.5) * t_seg) * 0.35 if f < 120 else 0
            
            chord_l += (osc1 * 0.6 + osc2 * 0.4 + osc_sub)
            chord_r += (osc1 * 0.6 + osc3 * 0.4 + osc_sub)
            
        chord_l = (chord_l / (len(freqs) * 1.2)) * env
        chord_r = (chord_r / (len(freqs) * 1.2)) * env
        
        left[seg_idx] += chord_l * 0.42
        right[seg_idx] += chord_r * 0.42
        
    # 2. Minimalist Piano Notes (Emotional cinematic touches)
    piano_notes = [
        # (time, freq, velocity)
        (1.5, 440.0, 0.45),    # A4
        (3.5, 523.25, 0.40),   # C5
        (5.5, 587.33, 0.50),   # D5
        (9.0, 466.16, 0.45),   # Bb4
        (11.5, 587.33, 0.45),  # D5
        (14.0, 698.46, 0.50),  # F5
        (19.0, 523.25, 0.45),  # C5
        (21.5, 659.25, 0.45),  # E5
        (24.5, 587.33, 0.50),  # D5
        (29.0, 440.0, 0.40),   # A4
        (31.5, 523.25, 0.45),  # C5
        (34.0, 659.25, 0.50),  # E5
        (39.0, 587.33, 0.55),  # D5
        (41.5, 698.46, 0.50),  # F5
        (44.0, 880.0, 0.45),   # A5
        (49.0, 587.33, 0.50),  # D5
        (51.5, 523.25, 0.45),  # C5
        (55.5, 440.0, 0.55),   # A4 (Resolving tone)
    ]
    
    for note_time, note_freq, vel in piano_notes:
        note_start = int(note_time * sr)
        note_dur = 4.0 # 4-second decay
        note_samples = min(int(note_dur * sr), n_samples - note_start)
        if note_samples <= 0:
            continue
            
        t_note = np.linspace(0, note_dur, note_samples, endpoint=False)
        decay = np.exp(-t_note * 1.6)
        
        # Harmonic overtone synthesis of acoustic grand piano timbre
        harmonics = (
            1.0 * np.sin(2 * np.pi * note_freq * t_note) +
            0.5 * np.sin(2 * np.pi * note_freq * 2 * t_note) * np.exp(-t_note * 2.2) +
            0.25 * np.sin(2 * np.pi * note_freq * 3 * t_note) * np.exp(-t_note * 3.0) +
            0.12 * np.sin(2 * np.pi * note_freq * 4 * t_note) * np.exp(-t_note * 4.0)
        )
        piano_wave = harmonics * decay * vel
        
        # Stereo delay / reverb simulation
        pan = np.sin(note_time) * 0.25 # subtle panning
        left_gain = 0.5 * (1.0 - pan)
        right_gain = 0.5 * (1.0 + pan)
        
        left[note_start:note_start + note_samples] += piano_wave * left_gain * 0.35
        right[note_start:note_start + note_samples] += piano_wave * right_gain * 0.35
        
        # Add 250ms delayed echo for spacious hall feeling
        echo_delay = int(0.25 * sr)
        if note_start + echo_delay + note_samples < n_samples:
            left[note_start + echo_delay:note_start + echo_delay + note_samples] += piano_wave * right_gain * 0.12
            right[note_start + echo_delay:note_start + echo_delay + note_samples] += piano_wave * left_gain * 0.12

    # 3. Cinematic Sub-Bass Swells at Scene Transitions (0s, 8s, 18s, 28s, 38s, 48s, 55s)
    transitions = [0.0, 8.0, 18.0, 28.0, 38.0, 48.0, 55.0]
    for tr_time in transitions:
        tr_start = int(tr_time * sr)
        tr_dur = 2.5
        tr_samples = min(int(tr_dur * sr), n_samples - tr_start)
        if tr_samples <= 0:
            continue
        t_tr = np.linspace(0, tr_dur, tr_samples, endpoint=False)
        sub_freq = 45.0 # 45Hz sub bass
        sub_env = np.sin(np.pi * np.clip(t_tr / tr_dur, 0, 1)) ** 2
        sub_wave = np.sin(2 * np.pi * sub_freq * t_tr) * sub_env * 0.22
        left[tr_start:tr_start + tr_samples] += sub_wave
        right[tr_start:tr_start + tr_samples] += sub_wave

    # 4. Master Volume Curve (Cinematic Fade In & Fade Out)
    master_env = np.ones(n_samples, dtype=np.float32)
    fade_in = int(2.0 * sr)
    fade_out = int(3.0 * sr)
    master_env[:fade_in] = np.linspace(0, 1, fade_in)
    master_env[-fade_out:] = np.linspace(1, 0, fade_out)
    
    left *= master_env
    right *= master_env
    
    # 5. Normalization & Limiter
    max_peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-6)
    target_peak = 0.88 # -1.1 dBFS ceiling
    left = (left / max_peak) * target_peak
    right = (right / max_peak) * target_peak
    
    # Interleave to stereo 16-bit PCM
    stereo = np.vstack(((left * 32767).astype(np.int16), (right * 32767).astype(np.int16))).T
    wavfile.write(filename, sr, stereo)
    print(f"Generated subtle cinematic soundtrack: {filename} ({duration}s at {sr}Hz)")

if __name__ == "__main__":
    create_cinematic_track()

# English voice samples

Short auditions for picking the English profile voice. Each `<voice>.pcm` /
`<voice>.wav` is the same passage (`demo_passage.md`) rendered with the
`en` language profile but a different `--voice` override. Same model
(`eleven_v3`), same `voice_settings` (stability 0.55, similarity_boost
0.75, style 0.15, speed 0.90).

Source: opening paragraph of `stories/continue/chapters/chapter_01_the_key.md`.
The passage is representative of "continue"'s imperative, flat-affect
register — a deliberately demanding test for any voice, since the form
forbids interpretive performance.

## How to listen

```bash
# WAV (any player)
open voice_samples/english/dr_alice.wav

# raw PCM (sox / ffplay)
play -t raw -r 24000 -b 16 -c 1 -e signed-integer voice_samples/english/dr_alice.pcm
```

## Voices included

| File | Voice | ElevenLabs ID | Notes |
|---|---|---|---|
| `mira.*` | Mira — Calm Grounded British | `DVxf8tkOIac2UAoDXYVS` | current `en` profile default; tentative |
| `dr_alice.*` | Dr Alice — Clear, Resonant, Articulate | `l2qjqoUskg4poHSh4wMx` | resonant, middle-aged Canadian |
| `madeline.*` | Madeline — Professional Narrator | `vFGMZkgYSmUshOKNyTXb` | professional, middle-aged American |
| `alex.*` | Alex — Neutral British Female Narrator | `zhoqoRb56kaT8dDbwmNV` | neutral, young British |

## Reproducing

```bash
cd tools/voice-renderer
for voice in DVxf8tkOIac2UAoDXYVS l2qjqoUskg4poHSh4wMx vFGMZkgYSmUshOKNyTXb zhoqoRb56kaT8dDbwmNV; do
  python3 reader.py synth --language en --voice "$voice" \
    --input voice_samples/english/demo_passage.md \
    --out /tmp/voice_audition/"$voice" --also-wav
done
```

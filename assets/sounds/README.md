# Assets – Sounds

Currently, all sound effects are generated **procedurally** via the Web Audio API in `js/utils/sound.js`.
No external audio files are needed.

If you wish to add custom sound files in the future, place `.mp3` or `.ogg` files here
and update `js/utils/sound.js` to load them via `HTMLAudioElement` or `AudioContext.decodeAudioData`.

Example file names:
- `correct.mp3`
- `wrong.mp3`
- `win.mp3`
- `click.mp3`
- `badge.mp3`

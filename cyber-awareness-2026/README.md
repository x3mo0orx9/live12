# SMA · Cybersecurity awareness 2026

A 17-slide awareness presentation for the staff of Sharjah Museums Authority,
in Arabic and English, written for a non-technical audience.

**Open `SMA-Cyber-Awareness.html`.** It is one self-contained file (fonts,
logo, styles and script are embedded), so it runs from a laptop, a USB stick
or a shared drive with no internet connection. Use a current Chrome or Edge
and press **F** for full screen.

## Controls

| Key | Action |
| --- | --- |
| `→` `Space` `Page Down` `Enter` | Next slide (presentation clickers work) |
| `←` `Page Up` | Back |
| `L` | Switch Arabic / English without losing your place |
| `G` | Slide list: jump to any slide |
| `N` | Presenter notes for the current slide |
| `F` | Full screen |
| `Home` / `End` | First / last slide |
| `Ctrl` + `P` | Print, or save as PDF, one slide per page |

The same controls are on the small bar at the bottom of the screen. It hides
itself after a few seconds and returns when the mouse moves.

## Before the first session

On slide 13, click the dashed line after "Tell the IT team straight away" and
type the IT Service Desk number or email. It is saved in that browser on that
computer. If it is left empty, the line is hidden in full screen and in print.

## Running order (about 25 to 30 minutes)

| # | Section | Slide |
| --- | --- | --- |
| 1 | | Pause. Check. Report. (cover, both languages) |
| 2 | Today | Four questions for today |
| 3 | Why it matters | The UAE is targeted every day |
| 4 | Why it matters | Technology alone is not enough |
| 5 | The habit | One habit to remember |
| 6 | Watch for | Fake messages |
| 7 | Watch for | Fake apps look real |
| 8 | Watch for | Five checks before you install |
| 9 | Watch for | Seeing is no longer proof (deepfakes) |
| 10 | Protect | Add a second step to your accounts |
| 11 | Protect | What you post leaves a trace |
| 12 | Protect | Keep your devices updated |
| 13 | Report | If something goes wrong, report it early |
| 14 | Sharjah | The Sharjah Cyber Security Center |
| 15 | Remember | Five habits for every day |
| 16 | | Thank you (both languages) |
| 17 | Sources | Official sources and dates |

## Content and sources

Every figure and piece of advice comes from an official statement that was
read in full on 15 November 2026. The source and its date are printed at the
bottom of each slide, and slide 17 lists them all.

| Date | Source |
| --- | --- |
| 31 Aug 2025 | UAE Cybersecurity Council, via WAM: importance of regular device updates |
| 30 Jan 2026 | UAE Cyber Security Council with Emirates Post Group and DARB, via WAM: fake, fraudulent messages |
| 18 Feb 2026 | Dr. Mohamed Hamad Al Kuwaiti, Head of the UAE Government Cybersecurity Council, to WAM: daily breach attempts, incidents, targeted sectors, deepfakes |
| 14 Mar 2026 | UAE Cyber Security Council, weekly "Cyber Pulse" message, via WAM: fake applications |
| 26 Apr 2026 | UAE Cyber Security Council, via WAM: protecting digital identity, multi-factor authentication |
| 28 Jun 2026 | UAE Cybersecurity Council, via WAM: digital footprint risks |
| 26 Aug 2026 | Sharjah Digital Department, via WAM: Sharjah Cyber Security Strategy 2026–2031 |
| Viewed 15 Nov 2026 | Sharjah Cyber Security Center website, scsc.shj.ae |

WAM is the Emirates News Agency, the UAE's official news agency. Notes:

- Nothing is estimated or rounded beyond what the source says. Figures that
  could not be confirmed in an official source were left out, including
  higher daily-attack numbers reported by other media later in 2026, and
  police or hotline phone numbers.
- The Arabic text is a translation of the English originals published by WAM
  and the Sharjah Cyber Security Center.
- "Pause. Check. Report." is this session's own three-word summary of the
  Council's advice, and slide 5 says so. The text message on slide 6 is an
  invented example and is labelled as one.

## Brand

- **Logo:** the official Sharjah Museums Authority wordmark from
  sharjahmuseums.ae, used unaltered in white on the dark slides and as the
  same mark in black on the light slides.
- **Colours:** off-white background, black type, neutral greys and a single
  copper accent, following the SMA website.
- **Type:** SMA's own typeface, Adapter, is a licensed font and is not
  bundled. The file embeds open-licence faces chosen to sit close to it:
  Alexandria (Arabic), Schibsted Grotesk (Latin) and Azeret Mono (labels,
  echoing the wordmark).
- No artefacts, collection objects, exhibition images or related artwork are
  used. The look is built from the wordmark, the palette and type only.

## Editing

`SMA-Cyber-Awareness.html` is generated from the files in `src/`:

```
src/deck.src.html   the slides and all their text
src/styles.css      palette, type, layout
src/app.js          navigation, language, presenter tools
src/build.py        embeds everything into ../SMA-Cyber-Awareness.html
```

Bilingual text is written as `{{English||العربية}}`. After any change run
`python3 src/build.py` (Python 3 is the only requirement). The build fails if
anything in the file would need the network.

## Licences

Embedded fonts, with licence texts in `src/licenses/`: Alexandria, Schibsted
Grotesk and Azeret Mono (SIL Open Font License 1.1). The SMA wordmark belongs
to Sharjah Museums Authority.

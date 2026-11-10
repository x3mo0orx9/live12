# SMA · Cybersecurity Awareness

A bilingual (Arabic / English) awareness presentation for non-IT staff at
Sharjah Museums Authority. It is presenter-led: one press of **Next** per slide. Each slide
plays its own animation, so nothing needs to be clicked or typed.

## Open it

Double-click **`index.html`**. It is a single self-contained file: fonts,
icons, logo, styles and scripts are all embedded, so it runs from a laptop,
a USB stick or a shared drive with no server and no internet connection.

Use a current version of Chrome or Edge, and press **F** for full screen.

## Controls

| Key | Action |
| --- | --- |
| `→` `↓` `Space` `Page Down` | Next step or slide (clickers work) |
| `←` `↑` `Page Up` | Back |
| `L` | Switch Arabic / English at any point, without losing your place |
| `G` | Slide list: jump to any slide |
| `N` | Presenter notes for the current slide |
| `T` | Pause or resume the timer (double-click the timer to reset) |
| `F` | Full screen |
| `Home` / `End` | First / last slide |

The **Next** button fills with colour while the current slide still has
something to reveal. The timer highlights when you are behind the plan.

## Running order (about 20 minutes)

| # | Gallery | Slide | Exhibit | Min |
| --- | --- | --- | --- | --- |
| 1 | Welcome | Security starts with you | Cover | 0.5 |
| 2 | Welcome | Why cybersecurity matters | Why it matters, with the 98% figure | 1 |
| 3 | Common threats | Six common cyber threats | Six threats, one placard each | 1.5 |
| 4 | Phishing | Look closely at the address | Magnifier over four look-alike addresses | 1 |
| 5 | Phishing | Find the six warning signs | Find six red flags in an email | 2 |
| 6 | Social engineering | The urgent request | Chat simulation with the attacker's playbook | 2 |
| 7 | Social engineering | Workplace scenarios | Five decisions on a floor plan | 2 |
| 8 | Malware and ransomware | Ransomware: one click | Ransomware demo with rewind | 2 |
| 9 | Passwords | Strong passwords | Password and passphrase lab | 1.5 |
| 10 | Passwords | Multi-factor authentication | MFA prompt-bombing simulation | 1 |
| 11 | AI-powered threats | AI deepfakes | Deepfake video-call decision | 1.5 |
| 12 | AI-powered threats | AI changed the rules | Four old instincts, four new rules | 1 |
| 13 | Good habits | Seven safe habits | Seven habits | 1 |
| 14 | Recognise and report | I clicked. Now what? | First five minutes, what to report, who to call | 1 |
| 15 | Quiz and close | Pause. Verify. Report. | Press-and-hold pledge | 0.5 |
| 16 | Quiz and close | Thank you | Official references | 0.5 |

Press **Next** as soon as you are ready to move on; you do not have to wait
for a slide to finish playing. Going back shows the slide fully revealed.

## Before the first session

**Add your IT Service Desk contact.** On slide 15, click the dashed line
under "At work: SMA IT Service Desk" and type the extension and email. It is
saved in that browser on that computer. To set it for everyone, put the text
inside the `<span class="contact" id="contact" …></span>` element in
`src/index.src.html` and rebuild.

## Content and sources

The guidance follows public awareness material from:

- **UAE Cyber Security Council**, Cyber Pulse national awareness campaign.
  The two figures shown come from the Council's statements as reported by the
  Emirates News Agency (WAM) and UAE press: social engineering is used in
  nearly 98% of cyberattacks, and AI-powered phishing is linked to more than
  90% of digital breaches.
- **Sharjah Cyber Security Centre**, Sharjah Digital Department, and the
  Sharjah Cyber Security Strategy 2026–2031.
- **UAE Government portal (u.ae)**, cyber safety and reporting cybercrime;
  **Ministry of Interior** cybercrime platform; police 901 and 999.
- Federal Decree-Law 34 of 2021 (cybercrimes) and 45 of 2021 (personal data).

Every email, message, phone number, web address and person in the
simulations is invented for training. The password "time to crack" is an
illustrative estimate, and nothing typed into the page leaves the browser.

## Brand

- **Logo:** the official SMA wordmark, taken from sharjahmuseums.ae.
- **Colours:** one off-white background, black type and neutral greys, with
  a single copper accent taken from the SMA website. Green and red appear only
  as right / wrong feedback.
- **Type:** SMA's own typeface (Adapter) is a licensed font and is not
  bundled. The presentation uses open-licence faces chosen to sit close to
  it: Alexandria (Arabic), Schibsted Grotesk (Latin text) and Azeret Mono
  (Latin display, echoing the wordmark).

## Editing

Sources are in `src/`; `index.html` is generated from them.

```
src/index.src.html   slide markup and all static text
src/styles.css       palette, type, layout
src/app.js           navigation, arch transitions, language, presenter tools
src/sims.js          the interactive exhibits and their bilingual content
src/build.py         inlines everything into ../index.html
```

Bilingual text in `index.src.html` is written as `{{English||العربية}}`; in
`sims.js` as `B('English', 'العربية')`. After any change:

```
python3 src/build.py
```

Python 3 is the only requirement.

## Licences

Embedded third-party components, with licence texts in `src/licenses/`:
Alexandria, Schibsted Grotesk and Azeret Mono (SIL Open Font License 1.1);
Lucide icons (ISC). The SMA wordmark belongs to Sharjah Museums Authority.

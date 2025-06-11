<a href="https://iliad.dev/?from=scroller-roller" target="_blank" title="Check out Iliad.dev"><img width="440" alt="scroller-roller" src="https://github.com/Smoke3785/scroller-roller-extension/blob/main/scroller_roller.png?raw=true"></a>

# Scroller Roller Chrome Extension

Scroller Roller is a Chrome extension designed to help you capture smooth, hands-free scrolling videos of your website for case studies, demos, and social media. It provides fine-grained control over scroll animation, speed, acceleration, cursor visibility, and more—making it easy to create professional-looking screen recordings.

## Features

- **Smooth, automated scroll animation** for capturing video.
- **Configurable acceleration and max speed** for natural movement.
- **Delay before animation** to give you time to start recording.
- **Option to hide the mouse cursor and block pointer events** for a clean look.
- **Decelerate near the bottom** for a more natural finish.
- **Cancel animation if you scroll up** (optional).
- **Enable/disable per site**.

## How to Use

1. **Install the extension** and pin it to your Chrome toolbar.
2. **Open the popup** on the site you want to record.
3. **Adjust the parameters** as needed (see below).
4. **Enable the extension for the current site** using the checkbox.
5. **Start your screen recording.**
6. **Press the spacebar** to trigger the scroll animation. The page will scroll smoothly from the top, hands-free.

## Parameters

| Setting                                 | Description                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| **Acceleration (px/s²)**                | How quickly the scroll speed increases. Higher = faster ramp-up.                       |
| **Max Speed (px/frame)**                | The maximum scroll speed. Higher = faster scrolling.                                   |
| **Hide mouse cursor**                   | Hides the mouse cursor and blocks pointer events during animation for a clean video.   |
| **Delay animation (ms)**                | Wait time after pressing space before the scroll starts. Lets you get ready to record. |
| **Decelerate near bottom**              | Gradually slows the scroll as it approaches the bottom for a natural finish.           |
| **Cancel animation if user scrolls up** | If enabled, manually scrolling up will stop the animation.                             |
| **Enable on this site**                 | Only enabled sites will respond to the spacebar trigger and apply cursor hiding, etc.  |

## Tips

- The extension only affects sites you explicitly enable.
- Cursor hiding and pointer blocking are maximally enforced (except for form controls) and always restored when the animation ends or the site is disabled.
- You can adjust parameters at any time in the popup.

---

**Made for smooth, beautiful video captures of your web projects.**

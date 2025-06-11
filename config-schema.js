const configFields = [
  {
    id: "accel",
    type: "number",
    default: 50,
    storageKey: "acceleration",
    label: "Acceleration (px/s²)",
    step: 0.1,
    min: 0,
  },
  {
    id: "speed",
    type: "number",
    default: 5,
    storageKey: "maxSpeed",
    label: "Max Speed (px/frame)",
    step: 0.1,
    min: 0,
  },
  {
    id: "hide-cursor",
    type: "checkbox",
    default: false,
    storageKey: "hideCursor",
    label: "Hide mouse cursor",
  },
  {
    id: "delay",
    type: "number",
    default: 50,
    storageKey: "delay",
    label: "Delay animation (ms)",
    step: 10,
    min: 0,
  },
  {
    id: "decelerate",
    type: "checkbox",
    default: false,
    storageKey: "decelerateNearBottom",
    label: "Decelerate near bottom",
  },
  {
    id: "cancel-on-scroll",
    type: "checkbox",
    default: false,
    storageKey: "cancelOnScrollUp",
    label: "Cancel animation if user scrolls up",
  },
];

chrome.runtime.onMessage.addListener(({ type }, sender, sendResponse) => {
  if (type === "GET:CONFIG_SCHEMA") sendResponse({ schema: configFields });

  // Allow async responses
  // https://developer.chrome.com/docs/extensions/develop/concepts/messaging#simple
  return true;
});

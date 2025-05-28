import { register } from "./scripts/hooks";

Hooks.once('init', register.initHook);
// Hooks.once('ready', register.readyHook);

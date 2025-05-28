import { register } from "./scripts/hooks-service";

Hooks.once('init', register.initHook);
// Hooks.once('ready', register.readyHook);

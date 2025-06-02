# Changelog

## Fix issue with light linking after scene reloads

Click event handler registration has been moved from 'ready' hook to 'canvasReady'.
That is allow to add click handler to the light sources right after the scene has ready.

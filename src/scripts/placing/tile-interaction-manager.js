import { flag } from "../constants/flags.js";
import { PermissionManager } from "./permission-manager.js";
import { Logger } from "../utils/logger.js";

export class TileInteractionManager {
    static HOOK_NAME = "leftClickTile";

    static AddClickHandlers() {
        this.AddSingleClickWrapper();
        this.AddDoubleClickWrapper();
    }

    static AddSingleClickWrapper() {
        Logger.info("Registering wrapper for a single click");
        libWrapper.register(
            'interactive-light',
            'foundry.canvas.layers.TokenLayer.prototype._onClickLeft',
            function (wrapped, event) {
                const handled = TileInteractionManager.handler(event, 1);

                if (handled) return true;
                else
                    return wrapped.call(this, event);
            },
            libWrapper.MIXED
        );
        Logger.info("The wrapper for a single click registered");
    }

    static AddDoubleClickWrapper() {
        Logger.info("Registering wrapper for a double click");
        libWrapper.register(
            'interactive-light',
            'foundry.canvas.layers.TokenLayer.prototype._onClickLeft2',
            function (wrapped, event) {
                const handled = TileInteractionManager.handler(event, 0);

                if (handled) return true;
                else
                    return wrapped.call(this, event);
            },
            libWrapper.MIXED
        );
        Logger.info("The wrapper for a double click registered");
    }

    static async handleTileClick(t) {
        if (!t) {
            Logger.warn("TileInteractionManager.handleTileClick: Empty Tile");
            return;
        }

        const lightInfo = TileInteractionManager.#getLightConfig(t);
        if (!lightInfo || !lightInfo.lightId) return;

        await PermissionManager.toggleLightHidden(lightInfo.lightId);

        Logger.info(`Tile clicked by ${game.user?.name}`, {
            tile: t.id,
            light: lightInfo.lightId,
            user: game.userId,
        });
    }

    static #getLightConfig(t) {
        if (!t) {
            Logger.warn("TileInteractionManager.#getLightConfig: Empty Tile");
            return;
        }

        const lightId = t.document.getFlag(flag.scope, flag.lightIdName);
        if (!lightId) {
            Logger.warn("TileInteractionManager.#getLightConfig: Empty light ID");
            return;
        }
        const lights = game.canvas.lighting.objects.children;
        if (lights && lights.length) {
            const filteredLights = lights.filter(l => l.id === lightId);
            if (filteredLights && filteredLights.length) {
                const mode = filteredLights[0].document.getFlag(flag.scope, flag.clickOptionsName);
                return { lightId, mode };
            }
            Logger.warn("TileInteractionManager.#getLightConfig: Light not found");
        }
        Logger.warn("TileInteractionManager.#getLightConfig: No lights on the layer");
    }

    //#region Canvas Work

    static handler = async (event, type) => {
        try {
            if (canvas.activeLayer !== canvas.tokens) return;
            const stagePos = event.data.getLocalPosition(canvas.stage);
            const globalPos = event.data.global;

            const searchRect = new PIXI.Rectangle(stagePos.x, stagePos.y, 1, 1);
            let candidates = [];
            try {
                candidates = canvas.tiles.quadtree.getObjects(searchRect) ?? [];
            } catch (e) {
                Logger.warn("Quadtree.getObjects failed, falling back to all placeables", e);
                candidates = Array.from(canvas.tiles.placeables);
            }

            if (!candidates.size) return false;

            if (!Array.isArray(candidates)) {
                try {
                    candidates = Array.from(candidates);
                } catch (e) {
                    candidates = Object.values(candidates);
                }
            }

            candidates.sort((a, b) => {
                const za = (a.document?.z ?? a.z ?? 0);
                const zb = (b.document?.z ?? b.z ?? 0);
                return zb - za;
            });

            for (let tile of candidates) {
                if (!tile?.visible) continue;

                const lightId = tile.document.getFlag(flag.scope, flag.lightIdName)
                    ?? tile.document?.flags?.[flag.scope]?.lightId
                    ?? null;
                if (!lightId) continue;

                let hit = false;
                const mesh = tile.mesh ?? tile._mesh ?? null;

                if (mesh && typeof mesh.containsPoint === "function") {
                    hit = TileInteractionManager.meshContains(mesh, globalPos);
                } else {
                    hit = TileInteractionManager.rectContainsRotated(tile, x, y);
                }

                if (!hit) continue;

                const light = canvas.lighting.placeables.find(l => l.document?.id === lightId || l.id === lightId);
                if (!light) {
                    ui.notifications?.warn?.(`Interactive-Light: свет ${lightId} не найден.`);
                    Logger.warn("AmbientLight not found for id", lightId, tile);
                    continue;
                }

                try {
                    const clickOption = light.document.getFlag(flag.scope, flag.clickOptionsName);
                    if (clickOption === type)
                        PermissionManager.toggleLightHidden(lightId);
                    else continue;

                    return true;
                } catch (err) {
                    Logger.error("Toggle failed", err);
                    ui.notifications?.error?.("Interactive-Light: ошибка переключения света. Проверьте логи.");
                }
            }
        } catch (err) {
            Logger.error("Unexpected handler error", err);
        }
    };

    static meshContains = (mesh, globalPoint) => {
        try {
            const hitGlobal = !!mesh.containsPoint(globalPoint);
            if (hitGlobal) return true;
            return false;
        } catch {
            return false;
        }
    };

    static rectContainsRotated = (tile, px, py) => {
        const rot = (typeof tile.rotation === "number") ? tile.rotation : (tile.mesh?.rotation ?? 0);
        const w = Math.abs(tile.width ?? tile.document.width ?? 0);
        const h = Math.abs(tile.height ?? tile.document.height ?? 0);

        let ax = 0, ay = 0;
        if (tile.mesh) {
            ax = tile.mesh.anchor?.x ?? tile.mesh._anchor?.x ?? ax;
            ay = tile.mesh.anchor?.y ?? tile.mesh._anchor?.y ?? ay;
        } else if (tile.anchor) {
            ax = tile.anchor.x ?? ax;
            ay = tile.anchor.y ?? ay;
        }

        const originX = tile.x - ax * w;
        const originY = tile.y - ay * h;

        const cx = originX + w / 2;
        const cy = originY + h / 2;

        const dx = px - cx;
        const dy = py - cy;

        const s = Math.sin(-rot);
        const c = Math.cos(-rot);
        const lx = dx * c - dy * s;
        const ly = dx * s + dy * c;

        const hw = w / 2, hh = h / 2;
        return (lx >= -hw && lx <= hw && ly >= -hh && ly <= hh);
    };

    //#endregion
}

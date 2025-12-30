import { Logger } from "../utils/logger.js";
import { JournalManager } from "../journal/journal-manager.js";
import { flag } from "../constants/flags.js";

export class PrefabPlacement {
    static #active = null;
    static _onMove;
    static _onClick;
    static #onWheel = this.#onRotate.bind(this);

    static async start(prefabId) {
        const prefab = await JournalManager.getPrefab(prefabId);
        if (!prefab) return;

        this.stop();

        this.#active = {
            prefab,
            preview: null,
            rotation: (prefab.tile.document?.rotation ?? 0) * (Math.PI / 180)
        };

        await this.#createPreview(prefab);
        this.#activateCanvasHandlers();
    }

    static async #createPreview(prefab) {
        const tileData = prefab.tile.document;
        const texture = await foundry.canvas.loadTexture(tileData.texture.src);

        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.width = tileData.width;
        sprite.height = tileData.height;
        sprite.rotation = tileData.rotation * (Math.PI / 180);
        sprite.alpha = 0.6;
        sprite.zIndex = 1000;

        canvas.controls.addChild(sprite);

        this.#active.preview = sprite;
    }

    static #activateCanvasHandlers() {
        this._onMove = event => {
            const pos = event.data.getLocalPosition(canvas.stage);
            this.#active.preview.position.set(pos.x, pos.y);
        };

        this._onClick = event => {
            const pos = event.data.getLocalPosition(canvas.stage);
            this.#placeAt(pos);
        };

        canvas.stage.on("mousemove", this._onMove);
        canvas.stage.on("mousedown", this._onClick);

        canvas.app.view.addEventListener("wheel", this.#onWheel, { passive: false, capture: true });
    }

    static #onRotate(event) {
        if (!event.altKey && !event.shiftKey) return;
        
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!this.#active?.preview) return;

        const step = event.shiftKey ?  
            Math.PI / 24 : // 7.5°
            Math.PI / 12; // 15°
        const direction = event.deltaY > 0 ? 1 : -1;

        this.#active.rotation += step * direction;
        this.#active.preview.rotation = this.#active.rotation;
    }

    static async #placeAt(pos) {
        const { prefab, rotation } = this.#active;

        const tileData = foundry.utils.deepClone(prefab.tile.document);
        tileData.x = pos.x - tileData.width / 2;
        tileData.y = pos.y - tileData.height / 2;
        tileData.rotation = rotation * (180 / Math.PI);

        const [tile] = await canvas.scene.createEmbeddedDocuments(
            "Tile",
            [tileData]
        );

        const lightData = foundry.utils.deepClone(prefab.light.document);
        lightData.x = pos.x;
        lightData.y = pos.y;

        const [light] = await canvas.scene.createEmbeddedDocuments(
            "AmbientLight",
            [lightData]
        );

        await tile.setFlag(flag.scope, flag.lightIdName, light.id);
        await light.setFlag(flag.scope, flag.tileIdName, tile.id);
    }

    static stop() {
        if (!this.#active) return;

        if (this.#active.preview) {
            this.#active.preview.destroy();
        }

        canvas.stage.off("mousemove", this._onMove);
        canvas.stage.off("mousedown", this._onClick);
        canvas.app.view.removeEventListener("wheel", this.#onWheel);

        this.#active = null;
    }
}
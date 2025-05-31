import { flag } from "./constants/flag";
import { locale } from "./constants/locale";
import { settings } from "./constants/settings";
import { LightTextureController } from "./light-texture-controller";
import { TokenInteractionManager } from "./token-interaction-manager";
import { Logger } from "./utils/logger";
import { fillTemplate } from "./utils/strings";

export class AmbientLightConfig {
    static #checkboxInput = "chekbox-input";
    static #textInput = "text-input";
    static #inputIdFormat = "${appId}.${flagPath}.${type}";

    //#region Hooks
    //#region trackLightPositionHook

    public static trackLightPositionHook = (
        doc: AmbientLightDocument,
        change: Record<string, any>
    ) => {
        Logger.log("=========================================================");
        Logger.log("---------------------------------------------------------");
        Logger.log(
            "AmbientLight updated!",
            document,
            change,
            "x" in change,
            "y" in change,
            "x" in change || "y" in change
        );

        if ("x" in change || "y" in change) {
            Logger.log("Light position changed:", change.x, change.y);

            const interactive = doc.getFlag(
                flag.scope,
                flag.interactiveName
            ) as boolean;
            const tokenId = doc.getFlag(flag.scope, flag.tokenIdName) as string;

            Logger.log(`tokenId: ${tokenId}`);
            if (!interactive || !tokenId) return;
            const ok = LightTextureController.changeTokenPositions(
                tokenId,
                change.x,
                change.y
            );
            if (!ok) {
                doc.setFlag(flag.scope, flag.tokenIdName, "" as never);
                doc.setFlag(flag.scope, flag.pathName, "" as never);
            }
        }
    };

    //#endregion

    //#region deleteAmbientLightHook

    public static deleteAmbientLightHook = async (
        doc: AmbientLightDocument,
        options: any,
        userId: string
    ) => {
        Logger.log(`AMBIENT LIGHT ${doc.id} WAS DELETED`);

        const tokenId = doc.getFlag(flag.scope, flag.tokenIdName) as string;

        if (!tokenId) return;
        await LightTextureController.delete(tokenId, null);
    };

    //#endregion

    //#region renderLightConfigHook

    public static renderLightConfigHook = (
        app: any,
        html: HTMLElement,
        context: any,
        options: any
    ) => {
        if (options && !options.isFirstRender) return;

        const document: AmbientLightDocument = app.document;
        const isInteractive =
            document.getFlag(flag.scope, flag.interactiveName) ?? false;

        const interactiveElement = this.createInteractiveCheckboxHtmlElement(
            app.id,
            isInteractive
        );

        const path = document.getFlag(flag.scope, flag.pathName);
        const pathElement = this.createInteractivePathHtmlElement(
            app.id,
            path,
            isInteractive
        );

        const advancedTabContent = html.querySelector(
            '[data-application-part="advanced"]'
        );
        advancedTabContent?.appendChild(interactiveElement);
        advancedTabContent?.appendChild(pathElement!);

        html.onsubmit = this.onConfigSubmit;
    };

    private static createInteractiveCheckboxHtmlElement = (
        id: string,
        checked: boolean
    ): HTMLElement => {
        const formGroup = document.createElement("div");
        formGroup.className = "form-group";

        const label = document.createElement("label") as HTMLLabelElement;
        label.innerText = game.i18n!.localize(locale.enabled);

        const formFields = document.createElement("div");
        formFields.className = "form-fields";

        const input = document.createElement("input") as HTMLInputElement;
        input.type = "checkbox";
        input.name = flag.interactive;
        input.checked = checked;
        input.id = fillTemplate(this.#inputIdFormat, {
            appId: id,
            flagPath: flag.interactive,
            type: this.#checkboxInput,
        });
        input.onchange = this.onInteractiveCheckboxChanged;

        const hint = document.createElement("p") as HTMLParagraphElement;
        hint.className = "hint";
        hint.innerText = game.i18n!.localize(locale.enabledHint);

        formFields.appendChild(input);
        formGroup.appendChild(label);
        formGroup.appendChild(formFields);
        formGroup.appendChild(hint);

        return formGroup;
    };

    private static createInteractivePathHtmlElement = (
        appId: string,
        path: string | undefined,
        checked: boolean
    ): HTMLElement => {
        const formGroup = document.createElement("div");
        formGroup.className = "form-group";
        formGroup.id = fillTemplate(this.#inputIdFormat, {
            appId: appId,
            flagPath: flag.path,
            type: "form-group",
        });
        formGroup.hidden = !checked;

        const label = document.createElement("label") as HTMLLabelElement;
        label.htmlFor = flag.path;
        label.innerText = game.i18n!.localize(locale.path);

        const formFields = document.createElement("div");
        formFields.className = "form-fields";
        formFields.innerHTML = `<file-picker name="${
            flag.path
        }" type="image" id="${appId}-${flag.path}" value="${
            path ?? ""
        }"></file-picker>`;

        formGroup.appendChild(label);
        formGroup.appendChild(formFields);

        return formGroup;
    };

    private static onInteractiveCheckboxChanged = (ev: Event) => {
        const input = ev.target as HTMLInputElement;
        if (!input) return;

        const appId = input.id.slice(
            0,
            input.id.indexOf(
                fillTemplate(this.#inputIdFormat, {
                    appId: "",
                    flagPath: flag.interactive,
                    type: this.#checkboxInput,
                })
            )
        );
        const checked = input.checked;
        const pathFormGroup = document.getElementById(
            fillTemplate(this.#inputIdFormat, {
                appId: appId,
                flagPath: flag.path,
                type: "form-group",
            })
        ) as HTMLDivElement;

        if (!pathFormGroup) return;
        pathFormGroup.hidden = !checked;
    };

    private static onConfigSubmit = async (ev: SubmitEvent) => {
        Logger.log("AMBIENT LIGHT CONFIGURATION SUBMITTED");

        const interactiveChk = this.getInteractiveCheckbox(
            ev.target as HTMLFormElement
        );
        const pathInput = this.getPathInput(ev.target as HTMLFormElement);
        const appId = this.getAppIdFromInteractiveCheckbox(interactiveChk);
        const lightId = appId.split("-").pop();
        if (!lightId) return;
        const ambientLight = canvas.lighting?.get(lightId);
        if (!ambientLight) return;
        const tokenId = ambientLight.document.getFlag(
            flag.scope,
            flag.tokenIdName
        );
        let pathComputing =
            pathInput.value ||
            ambientLight.document.getFlag(flag.scope, flag.pathName) ||
            settings.defaultIconPath;
        const path = pathComputing;

        if (interactiveChk.checked) {
            const changed = await LightTextureController.updateTextureSource(
                tokenId,
                lightId,
                path
            );
            if (changed) return;

            Logger.log("CREATING TOKEN");
            LightTextureController.createActorToken(
                path,
                LightTextureController.culcObjPosition(
                    ambientLight.position._x,
                    "X"
                ),
                LightTextureController.culcObjPosition(
                    ambientLight.position._y,
                    "Y"
                ),
                ambientLight.document
            ).then((tokenDoc: TokenDocument | undefined) => {
                Logger.log("DATA", tokenDoc);
            });
        } else {
            LightTextureController.delete(tokenId, ambientLight.document);
        }
    };

    private static getInteractiveCheckbox = (
        form: HTMLFormElement
    ): HTMLInputElement => {
        return form.querySelector(
            `[name="${flag.interactive}"]`
        ) as HTMLInputElement;
    };

    private static getPathInput = (form: HTMLFormElement): HTMLInputElement => {
        return form.querySelector(`[name="${flag.path}"]`) as HTMLInputElement;
    };

    private static getAppIdFromInteractiveCheckbox = (
        interactiveChk: HTMLInputElement
    ): string => {
        return interactiveChk.id.slice(
            0,
            interactiveChk.id.indexOf(
                fillTemplate(this.#inputIdFormat, {
                    appId: "",
                    flagPath: flag.interactive,
                    type: this.#checkboxInput,
                })
            )
        );
    };

    //#endregion
    //#endregion
}

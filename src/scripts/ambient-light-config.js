import { Logger } from "./utils/logger.js";

import { flag } from "./constants/flags.js";
import { locale } from "./constants/locale.js";
import { settings } from "./constants/settings.js";
import { LightTextureController } from "./light-texture-controller.js";
import { fillTemplate } from "./utils/strings.js";

export class AmbientLightConfig {
    static #checkboxInput = "chekbox-input";
    static #select = "select";
    static #textInput = "text-input";
    static #inputIdFormat = "${appId}.${flagPath}.${type}";

    //#region Hooks
    //#region trackLightPositionHook

    static trackLightPositionHook = (
        doc,
        change
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
            );
            const tokenId = doc.getFlag(flag.scope, flag.tokenIdName);

            Logger.log(`tokenId: ${tokenId}`);
            if (!interactive || !tokenId) return;
            const ok = LightTextureController.changeTokenPositions(
                tokenId,
                change.x,
                change.y
            );
            if (!ok) {
                doc.setFlag(flag.scope, flag.tokenIdName, "");
                doc.setFlag(flag.scope, flag.pathName, "");
            }
        }
    };

    //#endregion

    //#region deleteAmbientLightHook

    static deleteAmbientLightHook = async (
        doc,
        options,
        userId
    ) => {
        Logger.log(`AMBIENT LIGHT ${doc.id} WAS DELETED`);

        const tokenId = doc.getFlag(flag.scope, flag.tokenIdName);

        if (!tokenId) return;
        await LightTextureController.delete(tokenId, null);
    };

    //#endregion

    //#region renderLightConfigHook

    static renderLightConfigHook = (
        app,
        html,
        context,
        options
    ) => {
        Logger.info("Rendering Ambient Light Config");

        if (options && !options.isFirstRender) return;

        const document = app.document;
        const isInteractive =
            document.getFlag(flag.scope, flag.interactiveName) ?? false;

        const interactiveElement = this.__createInteractiveCheckboxHtmlElement(
            app.id,
            isInteractive
        );

        const path = document.getFlag(flag.scope, flag.pathName);
        const pathElement = this.__createInteractivePathHtmlElement(
            app.id,
            path,
            isInteractive
        );

        const clickOptions = document.getFlag(flag.scope, flag.clickOptionsName);
        const clickOptionsElement = this.__createInteractiveLightClickOptionsHtmlElement(
            app.id,
            clickOptions,
            isInteractive
        )

        const nav = html.querySelector(
            '[data-application-part="tabs"]'
        );
        const activeTabName = app.tabGroups.sheet;
        const tabTitle = this.__createTabHtmlElement(activeTabName);
        if (nav) nav.appendChild(tabTitle);
        
        const tabContent = this.__createTabContentHtmlElement(activeTabName);
        tabContent.appendChild(interactiveElement);
        tabContent.appendChild(pathElement);
        tabContent.appendChild(clickOptionsElement);

        const footer =  html.querySelector(
            '[data-application-part="footer"]'
        );
        const navBodyArr = html.getElementsByClassName('window-content standard-form');
        if (navBodyArr.length) {
            const navBody = navBodyArr[0];
            navBody.insertBefore(tabContent, footer);
        }

        html.onsubmit = this.__onConfigSubmit;
    };

    static __createInteractiveCheckboxHtmlElement = (
        id,
        checked
    ) => {
        const formGroup = document.createElement("div");
        formGroup.className = "form-group";

        const label = document.createElement("label");
        label.innerText = game.i18n.localize(`${locale.enabled}.${locale.label}`);

        const formFields = document.createElement("div");
        formFields.className = "form-fields";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = flag.interactive;
        input.checked = checked;
        input.id = fillTemplate(this.#inputIdFormat, {
            appId: id,
            flagPath: flag.interactive,
            type: this.#checkboxInput,
        });
        input.onchange = this.__onInteractiveCheckboxChanged;

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.innerText = game.i18n.localize(`${locale.enabled}.${locale.hint}`);

        formFields.appendChild(input);
        formGroup.appendChild(label);
        formGroup.appendChild(formFields);
        formGroup.appendChild(hint);

        return formGroup;
    };

    static __createInteractivePathHtmlElement = (
        appId,
        path,
        checked
    ) => {
        const formGroup = document.createElement("div");
        formGroup.className = "form-group";
        formGroup.id = fillTemplate(this.#inputIdFormat, {
            appId: appId,
            flagPath: flag.path,
            type: "form-group",
        });
        formGroup.hidden = !checked;

        const label = document.createElement("label");
        label.htmlFor = flag.path;
        label.innerText = game.i18n.localize(`${locale.path}.${locale.label}`);

        const formFields = document.createElement("div");
        formFields.className = "form-fields";
        formFields.innerHTML = `<file-picker name="${
            flag.path
        }" type="image" id="${appId}-${flag.path}" value="${
            path ?? ""
        }"></file-picker>`;

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.innerText = game.i18n.localize(`${locale.path}.${locale.hint}`);

        formGroup.appendChild(label);
        formGroup.appendChild(formFields);
        formGroup.appendChild(hint);

        return formGroup;
    };

    static __createInteractiveLightClickOptionsHtmlElement = (
        appId, 
        option,
        checked
    ) => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.id = fillTemplate(this.#inputIdFormat, {
            appId: appId,
            flagPath: flag.clickOptions,
            type: "form-group"
        })
        formGroup.hidden = !checked;

        const label = document.createElement('label');
        label.htmlFor = flag.clickOptions;
        label.innerText = game.i18n.localize(`${locale.clickOptions}.${locale.label}`);

        const formFields = document.createElement('div');
        formFields.className = "form-fields";
        
        const select = document.createElement('select');
        select.name = flag.clickOptions;
        select.id = fillTemplate(this.#inputIdFormat, {
            appId: appId,
            flagPath: flag.clickOptions,
            type: this.#select
        })
        select.dataset.dtype = "Number";

        const option1 = document.createElement('option');
        option1.value = 0;
        option1.selected = option == 0 ? 'selected' : '';
        option1.innerText = game.i18n.localize(`${locale.clickOptions}.Options.Double`);

        const option2 = document.createElement('option');
        option2.value = 1;
        option2.selected = option == 1 ? 'selected' : '';
        option2.innerText = game.i18n.localize(`${locale.clickOptions}.Options.Single`);

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.innerText = game.i18n.localize(`${locale.clickOptions}.${locale.hint}`);

        select.appendChild(option1);
        select.appendChild(option2);
        formFields.appendChild(select);
        formGroup.appendChild(label);
        formGroup.appendChild(select);
        formGroup.appendChild(hint);

        return formGroup;
    }

    static __createTabHtmlElement = (active) => {
        const link = document.createElement('a');
        link.dataset.action = "tab";
        link.dataset.group = "sheet";
        link.dataset.tab = "interactiveLight";
        if (active === 'interactiveLight') link.classList.add('active');

        const icon = document.createElement('i');
        icon.classList.add("fa-solid", "fa-fire-flame-simple"); //fa-fire
        icon.inert = true;

        const title = document.createElement('span');
        title.innerText = game.i18n.localize(locale.tablName);

        link.appendChild(icon);
        link.appendChild(title);

        return link;
    }

    static __createTabContentHtmlElement = (active) => {
        const section = document.createElement('section');
        section.classList.add("tab", "standard-form", "scrollable");
        if (active === "interactiveLight") section.classList.add('active');
        section.dataset.tab = "interactiveLight";
        section.dataset.group = "sheet";
        section.dataset.applicationPart  = "interactiveLight";

        return section;
    }

    static __onInteractiveCheckboxChanged = (ev) => {
        const input = ev.target;
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
        );
        const clickOptionsFormGroup = document.getElementById(
            fillTemplate(this.#inputIdFormat, {
                    appId: appId,
                    flagPath: flag.clickOptions,
                    type: "form-group"
                }
            )
        )

        if (pathFormGroup) pathFormGroup.hidden = !checked;
        if (clickOptionsFormGroup) clickOptionsFormGroup.hidden = !checked;
    };

    static __onConfigSubmit = async (ev) => {
        Logger.log("AMBIENT LIGHT CONFIGURATION SUBMITTED");

        const interactiveChk = this.__getInteractiveCheckbox(
            ev.target
        );
        const pathInput = this.__getPathInput(ev.target);
        const appId = this.__getAppIdFromInteractiveCheckbox(interactiveChk);
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
            ).then((tokenDoc) => {
                Logger.log("DATA", tokenDoc);
            });
        } else {
            LightTextureController.delete(tokenId, ambientLight.document);
        }
    };

    static __getInteractiveCheckbox = (
        form
    ) => {
        return form.querySelector(
            `[name="${flag.interactive}"]`
        );
    };

    static __getPathInput = (form) => {
        return form.querySelector(`[name="${flag.path}"]`);
    };

    static __getAppIdFromInteractiveCheckbox = (
        interactiveChk
    ) => {
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

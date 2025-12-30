import { logger, Logger } from "../utils/logger.js";

import { flag } from "../constants/flags.js";
import { locale } from "../constants/locale.js";
import { settings } from "../constants/settings.js";
import { LightTextureController } from "./light-texture-controller.js";
import { fillTemplate } from "../utils/strings.js";
import { JournalManager } from "../journal/journal-manager.js";
import { createMultiSelect } from "../../templates/multiselect.js";

export class AmbientLightConfig {
    static #checkboxInput = "chekbox-input";
    static #select = "select";
    static #textInput = "text-input";
    static #filePathInput = "file-path";
    static #inputIdFormat = "${appId}.${flagPath}.${type}";

    tagMultiselect;

    //#region trackLightPositionHook

    static trackLightPositionHook = async (
        doc,
        change
    ) => {
        Logger.info(
            "AmbientLight updated!",
            doc,
            change
        );

        if ("x" in change || "y" in change) {

            const interactive = doc.getFlag(
                flag.scope,
                flag.interactiveName
            );
            const tileId = doc.getFlag(flag.scope, flag.tileIdName);

            if (interactive && tileId) {
                const ok = LightTextureController.changeTilePositions(
                    tileId,
                    change.x,
                    change.y
                );
                if (!ok) {
                    doc.setFlag(flag.scope, flag.tokenIdName, "");
                    doc.setFlag(flag.scope, flag.pathName, "");
                }
            }
        }

        if (change.flags?.[flag.scope]?.[flag.makePrefabName]) {
            await this.#makePrefab(doc);
        }
    };

    //#endregion

    //#region deleteAmbientLightHook

    static deleteAmbientLightHook = async (
        doc,
        options,
        userId
    ) => {
        Logger.info(`AMBIENT LIGHT ${doc.id} WAS DELETED`);

        const tileId = doc.getFlag(flag.scope, flag.tileIdName);

        if (!tileId) return;
        await LightTextureController.delete(tileId, null);
    };

    //#endregion

    //#region renderLightConfigHook

    static renderLightConfigHook = async (
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

        const interactiveElement = this.#createInteractiveCheckboxHtmlElement(
            app.id,
            isInteractive
        );

        const path = document.getFlag(flag.scope, flag.pathName);
        const pathElement = this.#createInteractivePathHtmlElement(
            app.id,
            path,
            isInteractive
        );

        const clickOptions = document.getFlag(flag.scope, flag.clickOptionsName);
        const clickOptionsElement = this.#createInteractiveLightClickOptionsHtmlElement(
            app.id,
            clickOptions,
            isInteractive
        )

        const nav = html.querySelector(
            '[data-application-part="tabs"]'
        );
        const activeTabName = app.tabGroups.sheet;
        const tabTitle = this.#createTabHtmlElement(activeTabName);
        if (nav) nav.appendChild(tabTitle);

        const interactiveSettingsFieldset = this.#createInteractiveSettingsFieldsetHtmlElement();
        interactiveSettingsFieldset.appendChild(interactiveElement);
        interactiveSettingsFieldset.appendChild(pathElement);
        interactiveSettingsFieldset.appendChild(clickOptionsElement);

        this.tagMultiselect = await this.#createPreafbTagsHtmlElement(app);

        const prefabSettingsFieldset = this.#createPrefabSettingsFieldsetHtmlElement();
        const prefabName = document.getFlag(flag.scope, flag.prefabName);
        const prefabSettingsPrefabNameFormGroup = this.#createPrefabNameHtmlElement(app.id, prefabName);
        prefabSettingsFieldset.appendChild(prefabSettingsPrefabNameFormGroup);
        prefabSettingsFieldset.appendChild(this.tagMultiselect.element);

        const tabContent = this.#createTabContentHtmlElement(activeTabName);
        tabContent.appendChild(interactiveSettingsFieldset);
        tabContent.appendChild(prefabSettingsFieldset);

        const footer = html.querySelector(
            '[data-application-part="footer"]'
        );
        const navBodyArr = html.getElementsByClassName('window-content standard-form');
        if (navBodyArr.length) {
            const navBody = navBodyArr[0];
            navBody.insertBefore(tabContent, footer);
        }
        const makePrefabBtn = this.#createMakePrefabButton();
        makePrefabBtn.hidden = !this.#checkInteractiveLightTabActive(html);
        footer.insertBefore(makePrefabBtn, footer.firstChild);
        nav.addEventListener("click", () => {
            requestAnimationFrame(() => {
                this.#updateMakePrefabButtonVisibility(html);
            });
        });

        html.onsubmit = this.#onConfigSubmit;
    };

    static #createTabHtmlElement = (active) => {
        const link = document.createElement('a');
        link.dataset.action = "tab";
        link.dataset.group = "sheet";
        link.dataset.tab = "interactiveLight";
        if (active === 'interactiveLight') link.classList.add('active');

        const icon = document.createElement('i');
        icon.classList.add("fa-solid", "fa-fire-flame-simple");
        icon.inert = true;

        const title = document.createElement('span');
        title.innerText = game.i18n.localize(locale.tablName);

        link.appendChild(icon);
        link.appendChild(title);

        return link;
    }

    static #createTabContentHtmlElement = (active) => {
        const section = document.createElement('section');
        section.classList.add("tab", "standard-form", "scrollable");
        if (active === "interactiveLight") section.classList.add('active');
        section.dataset.tab = "interactiveLight";
        section.dataset.group = "sheet";
        section.dataset.applicationPart = "interactiveLight";

        return section;
    }

    static #createInteractiveCheckboxHtmlElement = (
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
        input.onchange = this.#onInteractiveCheckboxChanged;

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.innerText = game.i18n.localize(`${locale.enabled}.${locale.hint}`);

        formFields.appendChild(input);
        formGroup.appendChild(label);
        formGroup.appendChild(formFields);
        formGroup.appendChild(hint);

        return formGroup;
    };

    static #createInteractivePathHtmlElement = (
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
        const filePickerId = fillTemplate(this.#inputIdFormat, {
            appId: appId,
            flagPath: flag.path,
            type: this.#filePathInput
        })
        formFields.className = "form-fields";
        formFields.innerHTML = `<file-picker name="${flag.path
            }" type="image" id="${filePickerId}" value="${path ?? ""
            }"></file-picker>`;

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.innerText = game.i18n.localize(`${locale.path}.${locale.hint}`);

        formGroup.appendChild(label);
        formGroup.appendChild(formFields);
        formGroup.appendChild(hint);

        return formGroup;
    };

    static #createInteractiveLightClickOptionsHtmlElement = (
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

    static #createInteractiveSettingsFieldsetHtmlElement = () => {
        const legend = document.createElement('legend');
        legend.textContent = game.i18n.localize(locale.interactiveSettingsLegend);

        const fieldset = document.createElement('fieldset');
        fieldset.appendChild(legend);

        return fieldset;
    }

    static #createPrefabNameHtmlElement = (
        id,
        value
    ) => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.innerText = game.i18n.localize(`${locale.prefabName}.${locale.label}`);

        const formFields = document.createElement('div');
        formFields.className = 'form-fields';

        const input = document.createElement('input');
        input.type = "text";
        input.name = flag._prefabName;
        input.value = value ?? "";
        input.id = fillTemplate(this.#inputIdFormat, {
            appId: id,
            flagPath: flag._prefabName,
            type: this.#textInput
        });

        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.innerText = game.i18n.localize(`${locale.prefabName}.${locale.hint}`);

        formFields.appendChild(input);
        formGroup.appendChild(label);
        formGroup.appendChild(formFields);
        formGroup.appendChild(hint);

        return formGroup;
    }

    static #createPrefabSettingsFieldsetHtmlElement = () => {
        const legend = document.createElement('legend');
        legend.textContent = game.i18n.localize(locale.prefabSettingsLegend);

        const fieldset = document.createElement('fieldset');
        fieldset.appendChild(legend);

        return fieldset;
    }

    static #createPreafbTagsHtmlElement = async (app) => {
        const prefabId = app.document.getFlag(flag.scope, flag.prefabIdName);
        const lightId = app.document.id;

        const prefabTags = await JournalManager.getPrefabTags(prefabId || lightId, prefabId, app.document);
        const allTags = await JournalManager.getAllTags();

        const multiselect = createMultiSelect({ initial: prefabTags, available: allTags });
        return multiselect;
    }

    static #createMakePrefabButton = () => {
        const btn = document.createElement('button');
        btn.type = "submit";
        btn.innerHTML = `<i class="fa-solid fa-sticky-note" inert></i><span>${game.i18n.localize(locale.makePrefabButton)}</span>`;
        btn.name = locale.makePrefabButton;
        btn.dataset.action = "make-prefab";

        return btn;
    }

    static #updateMakePrefabButtonVisibility(html) {
        const activeTab = this.#checkInteractiveLightTabActive(html);
        const makePrefabBtn = this.#getMakePrefabButton(html);
        makePrefabBtn.hidden = !activeTab;
    }

    static #onInteractiveCheckboxChanged = (ev) => {
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

    static #onConfigSubmit = async (ev) => {
        Logger.info("AMBIENT LIGHT CONFIGURATION SUBMITTED:", ev);

        const interactiveChk = this.#getInteractiveCheckbox(
            ev.target
        );
        const pathInput = this.#getPathInput(ev.target);
        const appId = this.#getAppIdFromInteractiveCheckbox(interactiveChk);
        const lightId = appId.split("-").pop();
        if (!lightId) return;
        const ambientLight = canvas.lighting?.get(lightId);
        if (!ambientLight) return;
        const tileId = ambientLight.document.getFlag(
            flag.scope,
            flag.tileIdName
        );
        let pathComputing =
            pathInput.value ||
            ambientLight.document.getFlag(flag.scope, flag.pathName) ||
            settings.defaultIconPath;
        const path = pathComputing;

        if (interactiveChk.checked) {
            const changed = await LightTextureController.updateTextureSource(
                tileId,
                lightId,
                path
            );
            if (!changed) {
                Logger.info("CREATING TILE");
                await LightTextureController.createTile(
                    path,
                    ambientLight.position._x,
                    ambientLight.position._y,
                    ambientLight.document
                );
            }
        } else {
            await LightTextureController.delete(tileId, ambientLight.document);
        }

        // await ambientLight.document.setFlag(flag.scope, flag.prefabTagsName, this.tagMultiselect.getValue());

        if (ev.submitter.name === locale.makePrefabButton) {
            await ambientLight.document.setFlag(flag.scope, flag.makePrefabName, true);
            await ambientLight.document.unsetFlag(flag.scope, flag.makePrefabName);
        }
    };

    static #makePrefab = async (lightDocument) => {
        const prefab = JournalManager.buildLightPrefabV1(lightDocument);
        await lightDocument.setFlag(flag.scope, flag.prefabIdName, prefab.id);
        await JournalManager.savePrefab(prefab);
    }

    static #getInteractiveCheckbox = (form) => {
        return form.querySelector(`[name="${flag.interactive}"]`);
    };

    static #getPathInput = (form) => {
        return form.querySelector(`[name="${flag.path}"]`);
    };

    static #getMakePrefabButton = (html) => {
        return html.querySelector(`button[name="${locale.makePrefabButton}"]`);
    }

    static #checkInteractiveLightTabActive = (html) => {
        const interactiveTab = html.querySelector(`.tabs a.active[data-tab="interactiveLight"]`);
        return interactiveTab != null;
    }

    static #getAppIdFromInteractiveCheckbox = (interactiveChk) => {
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
}

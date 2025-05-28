export function initHook(data: any) {
    Hooks.on('renderAmbientLightConfig', renderLightConfigHook);
    Hooks.on('renderWallConfig', renderLightConfigHook);
}

// export function readyHook(data: any) {}

function renderLightConfigHook(app: any, html: HTMLElement, context: any, options: any) {
    const document: AmbientLightDocument = app.document;
    const isInteractive = document.getFlag("interactive-light", "interactive") ?? false;

    const interactiveElement = createInteractiveCheckboxHtmlElement(isInteractive);

    let pathElement: HTMLElement; 
    const path = document.getFlag("interactive-light", "path");
    if (isInteractive) {
        pathElement = createInteractivePathHtmlElement(app.id, path);
    }

    const advancetTabContent = html.querySelector('[data-application-part="advanced"]')
    advancetTabContent?.appendChild(interactiveElement);
    if (isInteractive) {
        advancetTabContent?.appendChild(pathElement!);
    }
}

function createInteractiveCheckboxHtmlElement(checked: boolean): HTMLElement {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label') as HTMLLabelElement;
    label.innerText = game.i18n!.localize("INTERACTIVE_LIGHT.Enabled");

    const formFields = document.createElement('div');
    formFields.className = 'form-fields'

    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'checkbox';
    input.name = 'flags.interactive-light.interactive';
    input.checked = checked;
    
    const hint = document.createElement('p') as HTMLParagraphElement;
    hint.className = 'hint';
    hint.innerText = game.i18n!.localize("INTERACTIVE_LIGHT.EnabledHint");

    formFields.appendChild(input);
    formGroup.appendChild(label);
    formGroup.appendChild(formFields);
    formGroup.appendChild(hint);

    return formGroup;
}

function createInteractivePathHtmlElement(id: string, path: string | undefined): HTMLElement {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label') as HTMLLabelElement;
    label.htmlFor = 'flags.interactive-light.path';
    label.innerText = game.i18n!.localize("INTERACTIVE_LIGHT.Path");

    const formFields = document.createElement('div');
    formFields.className = 'form-fields'
    formFields.innerHTML = `<file-picker name="flags.interactive-light.path" type="image" id="${id}-flags.interactive-light.path" value="${path ?? ''}"></file-picker>`;

    formGroup.appendChild(label); 
    formGroup.appendChild(formFields);

    return formGroup;
}

export * as register from './hooks-service';
import { DocumentNode } from "../../dom/node";
import { EvalContext, EvalContent } from "../evalEngine";
import { StyleBindType } from "../resourceBinder";

export class Component {
    readonly resPath: string;

    /**
     * Template section for this component
     */
    readonly template: ComponentTemplate;

    /**
     * Script section for this component
     */
    readonly script: ComponentScript;

    /**
     * Style section for this component, if preset. Will be undefined if this component does not have a style section.
     */
    readonly style?: ComponentStyle;

    constructor(resPath: string, template: ComponentTemplate, script: ComponentScript, style?: ComponentStyle) {
        this.resPath = resPath;
        this.template = template;
        this.script = script;
        this.style = style;
    }

    clone(): Component {
        const newTemplate: ComponentTemplate = this.template.clone();
        const newScript: ComponentScript = this.script.clone();
        const newStyle: ComponentStyle | undefined = this.style?.clone();

        const newComponent: Component = new Component(this.resPath, newTemplate, newScript, newStyle);

        return newComponent;
    }
}

export class ComponentTemplate {
    /**
     * DOM for this component template
     */
    readonly dom: DocumentNode;

    /**
     * Resource path of the external source for this template, if applicable.
     * Will be undefined for internal (single file) components.
     */
    readonly srcResPath?: string;

    constructor(dom: DocumentNode, srcResPath?: string) {
        this.dom = dom;
        this.srcResPath = srcResPath;
    }

    /**
     * Clones this template
     */
    clone(): ComponentTemplate {
        const newDom: DocumentNode = this.dom.clone(true);

        const newTemplate: ComponentTemplate = new ComponentTemplate(newDom, this.srcResPath);

        return newTemplate;
    }
}

export class ComponentScript {
    /**
     * Type of this script.
     * @see {@link ComponentScriptType}
     */
    readonly type: ComponentScriptType;
    
    /**
     * Resource path of the external source for this script, if applicable.
     * Will be undefined for internal (single file) components.
     */
    readonly srcResPath?: string;

    readonly scriptFunction: EvalContent<ComponentScriptInstance>;

    constructor(type: ComponentScriptType, scriptFunction: EvalContent<ComponentScriptInstance>, srcResPath?: string) {
        this.type = type;
        this.scriptFunction = scriptFunction;
        this.srcResPath = srcResPath;
    }

    /**
     * Clones this script
     */
    clone(): ComponentScript {
        return new ComponentScript(this.type, this.scriptFunction, this.srcResPath);
    }
}

/**
 * Recognized types of component script implementations
 */
export enum ComponentScriptType {
    /**
     * A component script implemented as an ES6 class
     */
    CLASS = 'class',

    /**
     * A component script implement as a tradition JS function
     */
    FUNCTION = 'function'
}

/**
 * A function that will execute the backing script of a component, and return the resulting object to use for compilation
 */
export type ComponentScriptRunner = (context: EvalContext) => ComponentScriptInstance;

/**
 * An instance of the backing code for a component
 */
export type ComponentScriptInstance = Record<string, unknown>;

/**
 * The style section of a component
 */
export class ComponentStyle {
    /**
     * The CSS stylesheet for this component
     */
    readonly styleContent: string;

    /**
     * Binding type for this stylesheet.
     * @see {@link ComponentStyleBindType}
     */
    readonly bindType: StyleBindType;

    /**
     * Resource path of the external source for this stylesheet, if applicable.
     * Will be undefined for internal (single file) components.
     */
    readonly srcResPath?: string;

    constructor(styleContent: string, bindType: StyleBindType, srcResPath?: string) {
        this.styleContent = styleContent;
        this.bindType = bindType;
        this.srcResPath = srcResPath;
    }

    /**
     * Clones this component style
     */
    clone(): ComponentStyle {
        return new ComponentStyle(this.styleContent, this.bindType, this.srcResPath);
    }
}
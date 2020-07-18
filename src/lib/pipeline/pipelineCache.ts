import { Fragment, Component, EvalContent } from "..";

/**
 * Caches any data that can be reused by the pipeline
 */
export class PipelineCache {
    private readonly fragmentCache: Map<string, Fragment> = new Map();
    private readonly componentCache: Map<string, Component> = new Map();
    private readonly scriptTextCache: Map<string, EvalContent<unknown>> = new Map();
    private readonly createdResourceCache: Map<string, string> = new Map();

    // Fragment

    hasFragment(resPath: string): boolean {
        return this.fragmentCache.has(resPath);
    }

    getFragment(resPath: string): Fragment {
        const fragment: Fragment | undefined = this.fragmentCache.get(resPath);

        if (fragment == undefined) {
            throw new Error(`Fragment not found in cache: ${resPath}.  Make sure to call hasFragment() before getFragment().`);
        }

        return fragment;
    }

    storeFragment(fragment: Fragment): void {
        this.fragmentCache.set(fragment.resPath, fragment);
    }

    // Component

    hasComponent(resPath: string): boolean {
        return this.componentCache.has(resPath);
    }

    getComponent(resPath: string): Component {
        const component: Component | undefined = this.componentCache.get(resPath);

        if (component == undefined) {
            throw new Error(`Component not found in cache: ${resPath}.  Make sure to call hasComponent() before getComponent().`);
        }

        return component;
    }

    storeComponent(component: Component): void {
        this.componentCache.set(component.resPath, component);
    }

    // Script text

    hasScriptText(signature: string): boolean {
        return this.scriptTextCache.has(signature);
    }

    getScriptText(signature: string): EvalContent<unknown> {
        const templateFunc: EvalContent<unknown> | undefined = this.scriptTextCache.get(signature);

        if (templateFunc == undefined) {
            throw new Error(`Script text function not found in cache: ${signature}.  Make sure to call hasScriptText() before getScriptText().`);
        }

        return templateFunc;
    }

    storeScriptText(signature: string, templateFunc: EvalContent<unknown>): void {
        this.scriptTextCache.set(signature, templateFunc);
    }

    // TODO test created resource cache

    // created resource
    hasCreatedResource(hash: string): boolean {
        return this.createdResourceCache.has(hash);
    }

    getCreatedResource(hash: string): string {
        const resPath: string | undefined = this.createdResourceCache.get(hash);

        if (resPath == undefined) {
            throw new Error(`Created resource not found in cache: ${hash}.  Make sure to call hasCreatedResource() before getCreatedResource().`);
        }

        return resPath;
    }

    storeCreatedResource(hash: string, resPath: string): void {
        this.createdResourceCache.set(hash, resPath);
    }

    // general

    clear(): void {
        this.fragmentCache.clear();
        this.componentCache.clear();
        this.scriptTextCache.clear();
        this.createdResourceCache.clear();
    }
}
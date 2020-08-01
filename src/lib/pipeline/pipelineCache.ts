import { Fragment } from '..';
import { Component } from './object/component';
import { EvalContent } from './module/evalEngine';

/**
 * Caches any data that can be reused by the pipeline
 */
export class PipelineCache {
    private readonly fragmentCache: Map<string, Fragment> = new Map();
    private readonly componentCache: Map<string, Component> = new Map();
    private readonly expressionCache: Map<string, EvalContent<unknown>> = new Map();
    private readonly scriptCache: Map<string, EvalContent<unknown>> = new Map();
    private readonly externalScriptCache: Map<string, string> = new Map();
    private readonly createdResourceCache: Map<string, string> = new Map();

    // Fragment

    hasFragment(resPath: string): boolean {
        return this.fragmentCache.has(resPath);
    }

    getFragment(resPath: string): Fragment {
        const fragment: Fragment | undefined = this.fragmentCache.get(resPath);

        if (fragment == undefined) {
            throw new Error(`Fragment not found in cache: ${ resPath }.  Make sure to call hasFragment() before getFragment().`);
        }

        return fragment;
    }

    storeFragment(fragment: Fragment): void {
        this.fragmentCache.set(fragment.path, fragment);
    }

    // Component

    hasComponent(resPath: string): boolean {
        return this.componentCache.has(resPath);
    }

    getComponent(resPath: string): Component {
        const component: Component | undefined = this.componentCache.get(resPath);

        if (component == undefined) {
            throw new Error(`Component not found in cache: ${ resPath }.  Make sure to call hasComponent() before getComponent().`);
        }

        return component;
    }

    storeComponent(component: Component): void {
        this.componentCache.set(component.resPath, component);
    }

    // Expression

    hasExpression(expression: string): boolean {
        return this.expressionCache.has(expression);
    }

    getExpression(expression: string): EvalContent<unknown> {
        const templateFunc: EvalContent<unknown> | undefined = this.expressionCache.get(expression);

        if (templateFunc == undefined) {
            throw new Error(`Expression not found in cache: ${ expression }.  Make sure to call hasExpression() before getExpression().`);
        }

        return templateFunc;
    }

    storeExpression(expression: string, func: EvalContent<unknown>): void {
        this.expressionCache.set(expression, func);
    }
    
    // Script

    hasScript(script: string): boolean {
        return this.scriptCache.has(script);
    }

    getScript(script: string): EvalContent<unknown> {
        const scriptFunc: EvalContent<unknown> | undefined = this.scriptCache.get(script);

        if (scriptFunc == undefined) {
            throw new Error(`Script not found in cache: ${ script }.  Make sure to call hasScript() before getScript().`);
        }

        return scriptFunc;
    }

    storeScript(script: string, func: EvalContent<unknown>): void {
        this.scriptCache.set(script, func);
    }   
     
    // ExternalScript

    hasExternalScript(resPath: string): boolean {
        return this.externalScriptCache.has(resPath);
    }

    getExternalScript(resPath: string): string {
        const scriptContent: string | undefined = this.externalScriptCache.get(resPath);

        if (scriptContent == undefined) {
            throw new Error(`ExternalScript not found in cache: ${ resPath }.  Make sure to call hasExternalScript() before getExternalScript().`);
        }

        return scriptContent;
    }

    storeExternalScript(resPath: string, script: string): void {
        this.externalScriptCache.set(resPath, script);
    }

    // created resource
    
    hasCreatedResource(hash: string): boolean {
        return this.createdResourceCache.has(hash);
    }

    getCreatedResource(hash: string): string {
        const resPath: string | undefined = this.createdResourceCache.get(hash);

        if (resPath == undefined) {
            throw new Error(`Created resource not found in cache: ${ hash }.  Make sure to call hasCreatedResource() before getCreatedResource().`);
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
        this.expressionCache.clear();
        this.scriptCache.clear();
        this.externalScriptCache.clear();
        this.createdResourceCache.clear();
    }
}
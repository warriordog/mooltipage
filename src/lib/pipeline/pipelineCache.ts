import { Fragment } from './object/fragment';
import { EvalContent } from './evalEngine';

export class PipelineCache {
    private readonly fragmentCache: Map<string, Fragment>;
    private readonly templateStringCache: Map<string, EvalContent<string>>;
    private readonly handlebarsCache: Map<string, EvalContent<unknown>>;

    constructor() {
        this.fragmentCache = new Map();
        this.templateStringCache = new Map();
        this.handlebarsCache = new Map();
    }

    // Fragment

    hasFragment(resId: string): boolean {
        return this.fragmentCache.has(resId);
    }

    getFragment(resId: string): Fragment {
        const fragment: Fragment | undefined = this.fragmentCache.get(resId);

        if (fragment == undefined) {
            throw new Error(`Fragment not found in cache: ${resId}.  Make sure to call hasFragment() before getFragment().`);
        }

        return fragment;
    }

    storeFragment(fragment: Fragment): void {
        this.fragmentCache.set(fragment.resId, fragment);
    }

    // Template string

    hasTemplateString(signature: string): boolean {
        return this.templateStringCache.has(signature);
    }

    getTemplateString(signature: string): EvalContent<string> {
        const templateFunc: EvalContent<string> | undefined = this.templateStringCache.get(signature);

        if (templateFunc == undefined) {
            throw new Error(`Template string function not found in cache: ${signature}.  Make sure to call hasTemplateString() before getTemplateString().`);
        }

        return templateFunc;
    }

    storeTemplateString(signature: string, templateFunc: EvalContent<string>): void {
        this.templateStringCache.set(signature, templateFunc);
    }

    // Handlebars

    hasHandlebars(signature: string): boolean {
        return this.handlebarsCache.has(signature);
    }

    getHandlebars(signature: string): EvalContent<unknown> {
        const handlebarsFunc: EvalContent<unknown> | undefined = this.handlebarsCache.get(signature);

        if (handlebarsFunc == undefined) {
            throw new Error(`Handlebars function not found in cache: ${signature}.  Make sure to call hasHanldebars() before getHandlebars().`);
        }

        return handlebarsFunc;
    }

    storeHandlebars(signature: string, templateFunc: EvalContent<unknown>): void {
        this.handlebarsCache.set(signature, templateFunc);
    }

    // general

    clear(): void {
        this.fragmentCache.clear();
        this.templateStringCache.clear();
        this.handlebarsCache.clear();
    }
}
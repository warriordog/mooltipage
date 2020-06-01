import { Fragment } from './fragment';
import { Page } from './page';

export class PipelineCache {
    private readonly fragmentCache: Map<string, Fragment>;
    private readonly pageCache: Map<string, Page>;

    constructor() {
        this.fragmentCache = new Map<string, Fragment>();
        this.pageCache = new Map<string, Page>();
    }

    hasFragment(resId: string): boolean {
        return this.fragmentCache.has(resId);
    }

    getFragment(resId: string): Fragment {
        const fragment: Fragment | undefined = this.fragmentCache.get(resId);

        if (fragment === undefined) {
            throw new Error(`Fragment not found in cache: ${resId}.  Make sure to call hasFragment() before getFragment().`);
        }

        return fragment;
    }

    storeFragment(resId: string, fragment: Fragment): void {
        this.fragmentCache.set(resId, fragment);
    }

    hasPage(resId: string): boolean {
        return this.pageCache.has(resId);
    }

    getPage(resId: string): Page {
        const page: Page | undefined = this.pageCache.get(resId);

        if (page === undefined) {
            throw new Error(`Page not found in cache: ${resId}.  Make sure to call hasPage() before getPage().`);
        }

        return page;
    }

    storePage(resId: string, page: Page): void {
        this.pageCache.set(resId, page);
    }
}
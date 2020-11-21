/**
 * Utility that tracks dependencies between pages and other resources.
 * A dependency is anything that can affect the compiled output of a page.
 * Provides a two-way mapping that allows listing all the resources dependencies of a page as well as all of the pages that depend on a particular resource.
 */
export class DependencyTracker {

    /**
     * Map of pages to dependencies
     */
    private readonly pageDependencies = new Map<string, Set<string>>();

    /**
     * Map of resources to dependent pages
     */
    private readonly resourceDependents = new Map<string, Set<string>>();

    /**
     * Gets a list of dependencies for a page
     * @param pageResPath Path to the page
     * @returns Set of paths to all unique resources that this page depends on. Will be empty for an unknown page
     */
    getDependenciesForPage(pageResPath: string): Set<string> {
        return getDependencySet(this.pageDependencies, pageResPath);
    }

    /**
     * Gets a list of pages that depend on a resource
     * @param resPath Path to the resource
     * @returns Set of paths to all unique pages that depend on this resource. Will be empty for an unknown resource
     */
    getDependentsForResource(resPath: string): Set<string> {
        return getDependencySet(this.resourceDependents, resPath);
    }

    /**
     * Gets all unique tracked resources and pages.
     * @returns Returns a set of unique strings representing all files tracked in this DependencyTracker.
     */
    getAllTrackedFiles(): Set<string> {
        const allFiles = new Set<string>();
        for (const page of this.pageDependencies.keys()) {
            allFiles.add(page);
        }
        for (const resource of this.resourceDependents.keys()) {
            allFiles.add(resource);
        }
        return allFiles;
    }

    /**
     * Sets the dependency set for a page.
     * Previous dependencies are cleared and replaced with newDependencies.
     * @param pageResPath Page to set dependencies for
     * @param newDependencies Dependencies for page
     */
    setPageDependencies(pageResPath: string, newDependencies: Set<string>): void {
        // get dependency set for page
        const pageDeps = this.getDependenciesForPage(pageResPath);

        // remove resource to page mappings
        for (const resPath of pageDeps) {
            this.getDependentsForResource(resPath).delete(pageResPath);
        }

        // delete existing page to resource mappings
        pageDeps.clear();

        // add new mappings
        for (const newDependency of newDependencies) {
            pageDeps.add(newDependency);
            this.getDependentsForResource(newDependency).add(pageResPath);
        }
    }

    /**
     * Checks a resource path is stored in this dependency tracker as a page.
     * @param resPath Resource path to check
     * @returns Returns true if resPath is stored as a page, false if not.
     */
    hasPage(resPath: string): boolean {
        return this.pageDependencies.has(resPath);
    }
}

function getDependencySet(mapping: Map<string, Set<string>>, resPath: string): Set<string> {
    let dependencyList = mapping.get(resPath);
    if (dependencyList === undefined) {
        dependencyList = new Set();
        mapping.set(resPath, dependencyList);
    }
    return dependencyList;
}
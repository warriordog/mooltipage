/**
 * Utilities to resolve TypeScript compatibilty issues,
 * particularly related to the fact that Node.JS has no DOM
 * classes at runtime.
 */
export default new class TsCompat {
    /**
     * Attempts to convert a DOM Node into an Element without using instanceof,
     * to avoid a runtime error caused by the fact the TS and JSDOM reference DOM
     * types that don't exist at NodeJS runtime.
     * 
     * @param node The node to convert
     * @returns @param node cast as an element, or null if @param node is not an element.
     */
    GetNodeAsElement(node: Node): Element | null {
        // node type 1 is Element
        if (node.nodeType === 1) {
            return node as Element;
        } else {
            return null;
        }
    }
}
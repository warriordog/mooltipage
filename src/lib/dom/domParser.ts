import { Handler, Parser, ParserOptions } from 'htmlparser2/lib/Parser';
import {
    DocumentNode,
    NodeWithChildren,
    TagNode,
    TextNode,
    CommentNode,
    CDATANode,
    ProcessingInstructionNode,
    MVarNode,
    MFragmentNode,
    MSlotNode,
    MContentNode,
    MImportNode,
    MIfNode,
    MScopeNode,
    MForNode,
    MForOfNode,
    MForInNode,
    MElseNode,
    MElseIfNode,
    MDataNode,
    ExternalStyleNode,
    InternalStyleNode,
    StyleNodeBind,
    StyleNode,
    ScriptNode,
    ExternalScriptNode,
    InternalScriptNode,
    UncompiledScriptNode,
    UncompiledStyleNode,
    AnchorNode,
    UncompiledAnchorNode,
    CompiledAnchorNode,
    parseAnchorNodeResolve
} from './node';
import { MimeType } from '..';

/**
 * Parses HTML into a dom using htmlparser2
 */
export class DomParser {
    /**
     * DomHandler instance that receives callbacks from {@link parser}
     */
    private readonly handler: DomHandler;

    /**
     * HTML parser instance
     */
    private readonly parser: Parser;

    /**
     * Creates a new DomParser instance
     * @param userOptions Optional options to pass to htmlparser2
     */
    constructor(userOptions?: ParserOptions) {
        // get parser options
        const options = createParserOptions(userOptions);

        // set up handler
        this.handler = new DomHandler();

        // create parser
        this.parser = new Parser(this.handler, options);
    }

    /**
     * Parse a string of HTML into a DOM
     * @param html HTML to parse
     * @returns a DocumentNode containing parsed HTML
     */
    parseDom(html: string): DocumentNode {
        // reset parser
        this.parser.reset();

        // process html
        this.parser.write(html);
        this.parser.end();

        // get generated dom
        return this.handler.getDom();
    }
}

/**
 * Creates an instance of ParserOptions.
 * Loads defaults and optionally overrides with a provided instance
 * @param userOptions optional options to include
 */
function createParserOptions(userOptions?: ParserOptions): ParserOptions {
    // base (default) options
    const options: ParserOptions = {
        recognizeSelfClosing: true,
        lowerCaseTags: true
    };

    // load user-supplied options
    if (userOptions != undefined) {
        Object.assign(options, userOptions);
    }

    return options;
}

/**
 * Implementation of htmlparser2's Handler interface that generates a DOM from the parsed HTML.
 */
export class DomHandler implements Partial<Handler> {
    /**
     * DOM containing parsed nodes
     */
    private dom: DocumentNode;

    /**
     * Current parent node.
     * The next incoming node will be attached as a child to this node
     */
    private currentParent: NodeWithChildren;

    /**
     * Creates a new DomHandler.
     * The instance will be fully initialized and ready to begin receiving callbacks from htmlparser2
     */
    constructor() {
        this.dom = new DocumentNode();
        this.currentParent = this.dom;
    }

    /**
     * Gets the generated DOM in its current state
     * @returns a DocumentNode containing all parsed HTML
     */
    getDom(): DocumentNode {
        return this.dom;
    }

    onreset(): void {
        this.dom = new DocumentNode();
        this.currentParent = this.dom;
    }

    onerror(error: Error): void {
        throw error;
    }

    onopentag(name: string, attribs: { [s: string]: string }): void {
        // normalize tag name
        const tagName = name.toLowerCase();

        // copy attribs
        const attributes = new Map<string, string | null>();
        for (const key of Object.keys(attribs)) {
            const attrVal = attribs[key];
            const value: string | null = attrVal.length > 0 ? attrVal : null;
            attributes.set(key, value);
        }

        // create tag
        const tag: TagNode = DomHandler.createTagNode(tagName, attributes);

        this.pushParent(tag);
    }

    onclosetag(): void {
        this.popParent();
    }

    ontext(data: string): void {
        // create text node
        const textNode = new TextNode(data);

        // append to parent
        this.currentParent.appendChild(textNode);
    }

    oncomment(data: string): void {
        // create comment node
        const commentNode = new CommentNode(data);

        // append to parent
        this.currentParent.appendChild(commentNode);
    }

    oncdatastart(): void {
        // create cdata node
        const cdataNode = new CDATANode();

        // append to parent
        this.currentParent.appendChild(cdataNode);

        // set as parent
        this.pushParent(cdataNode);
    }

    oncdataend(): void {
        this.popParent();
    }
    
    onprocessinginstruction(name: string, data: string): void {
        // create node
        const piNode = new ProcessingInstructionNode(name, data);

        // append to parent
        this.currentParent.appendChild(piNode);
    }

    /**
     * Attaches a node to the current parent, and then sets the new node as the current parent.
     * @param node Node to attach
     */
    private pushParent(node: NodeWithChildren): void {
        // attach to parent
        this.currentParent.appendChild(node);

        // push node
        this.currentParent = node;
    }

    /**
     * "closes" the current parent and sets its parent as the current
     */
    private popParent(): void {
        if (this.currentParent === this.dom) {
            throw new Error('Tried to close too many tags: DOM is currentParent');
        }
        
        this.currentParent = this.currentParent.parentNode ?? this.dom;
    }

    /**
     * Creates an instance of TagNode or one of its subclasses based on the provided tag data.
     * @param tagName Name of the tag to create
     * @param attributes Tag attributes
     * @returns Instance of TagNode or a subclass
     */
    private static createTagNode(tagName: string, attributes: Map<string, string | null>): TagNode {
        switch (tagName) {
            case 'm-fragment':
                return DomHandler.createMFragmentNode(attributes);
            case 'm-slot':
                return DomHandler.createMSlotNode(attributes);
            case 'm-content':
                return DomHandler.createMContentNode(attributes);
            case 'm-var':
                return new MVarNode(attributes);
            case 'm-scope':
                return new MScopeNode(attributes);
            case 'm-import':
                return DomHandler.createMImportNode(attributes);
            case 'm-if':
                return DomHandler.createMIfNode(attributes);
            case 'm-else-if':
                return DomHandler.createMElseIfNode(attributes);
            case 'm-else':
                return new MElseNode(attributes);
            case 'm-for':
                return DomHandler.createMForNode(attributes);
            case 'm-data':
                return DomHandler.createMDataNode(attributes);
            case 'style':
                return DomHandler.createStyleNode(attributes);
            case 'script':
                return DomHandler.createScriptNode(attributes);
            case 'a':
                return DomHandler.createAnchorNode(attributes);
            default:
                return new TagNode(tagName, attributes);
        }
    }

    private static createMFragmentNode(attributes: Map<string, string | null>): MFragmentNode {
        const src = attributes.get('src');
        if (src == undefined) throw new Error('Parse error: <m-fragment> is missing required attribute: src');
        return new MFragmentNode(src, attributes);
    }

    private static getSlotAttribute(attributes: Map<string, string | null>): string | undefined {
        const slot = attributes.get('slot');
        return slot != undefined ? String(slot) : undefined;
    }

    private static createMSlotNode = (attributes: Map<string, string | null>): MSlotNode => {
        const slot = DomHandler.getSlotAttribute(attributes);
        return new MSlotNode(slot, attributes);
    };

    private static createMContentNode = (attributes: Map<string, string | null>): MContentNode => {
        const slot = DomHandler.getSlotAttribute(attributes);
        return new MContentNode(slot, attributes);
    };

    private static createMImportNode(attributes: Map<string, string | null>): MImportNode {
        const src = attributes.get('src');
        if (src == undefined) throw new Error('Parse error: <m-import> is missing required attribute: src');
        const as = attributes.get('as');
        if (as == undefined) throw new Error('Parse error: <m-import> is missing required attribute: as');
        return new MImportNode(src, as, attributes);
    }

    private static createMIfNode(attributes: Map<string, string | null>): MIfNode {
        const expression = attributes.get('?');
        if (expression == undefined) throw new Error('Parse error: <m-if> is missing required attribute: ?');
        return new MIfNode(expression, attributes);
    }

    private static createMElseIfNode(attributes: Map<string, string | null>): MElseIfNode {
        const expression = attributes.get('?');
        if (expression == undefined) throw new Error('Parse error: <m-else-if> is missing required attribute: ?');
        return new MElseIfNode(expression, attributes);
    }

    private static createMForNode(attributes: Map<string, string | null>): MForNode {
        const varName = attributes.get('var');
        if (varName == undefined) throw new Error('Parse error: <m-for> is missing required attribute: varName');

        const indexName = attributes.get('index') ?? undefined;
        const ofExpression = attributes.get('of') ?? undefined;
        const inExpression = attributes.get('in') ?? undefined;

        if (ofExpression != undefined && inExpression == undefined) {
            return new MForOfNode(ofExpression, varName, indexName, attributes);
        } else if (inExpression != undefined && ofExpression == undefined) {
            return new MForInNode(inExpression, varName, indexName, attributes);
        } else {
            throw new Error('Parse error: <m-for> must have exactly one of these attributes: [of,in]');
        }
    }

    private static createMDataNode(attributes: Map<string, string | null>): MDataNode {
        const type = attributes.get('type');
        if (type == undefined) throw new Error('Parse error: <m-data> is missing required attribute: type');
        if (type !== MimeType.JSON && type !== MimeType.TEXT) throw new Error(`Parse error: <m-data> has invalid value for attribute 'type': '${ type }'`);
        return new MDataNode(type, attributes);
    }

    private static createStyleNode(attributes: Map<string, string | null>): StyleNode {
        // "uncompiled" style nodes should be passed on as-is
        if (!attributes.has('compiled')) {
            return new UncompiledStyleNode(attributes);
        }

        // "compiled" style nodes need further processing
        const bind = attributes.get('bind') ?? undefined;
        if (bind != undefined && bind != StyleNodeBind.HEAD && bind != StyleNodeBind.LINK) {
            throw new Error(`Parse error: 'style' tag has invalid value for attribute 'bind': '${ bind }'`);
        }

        const skipFormat = attributes.has('skip-format');

        const src = attributes.get('src');
        if (src != undefined) {
            return new ExternalStyleNode(src, bind, skipFormat, attributes);
        } else {
            return new InternalStyleNode(bind, skipFormat, attributes);
        }
    }

    private static createScriptNode(attributes: Map<string, string | null>): ScriptNode {
        // "uncompiled" script nodes should be passed on as-is
        if (!attributes.has('compiled')) {
            return new UncompiledScriptNode(attributes);
        }

        // "compiled" script nodes need further processing
        const src = attributes.get('src');
        if (src != undefined) {
            return new ExternalScriptNode(src, attributes);
        } else {
            return new InternalScriptNode(attributes);
        }
    }

    private static createAnchorNode(attributes: Map<string, string | null>): AnchorNode {
        // "uncompiled" anchor nodes should be passed on as-is
        if (!attributes.has('compiled')) {
            return new UncompiledAnchorNode(attributes);
        }

        const href = attributes.get('href');
        if (href == undefined) throw new Error('Parse error: <a> is missing required attribute: href');
        const resolve = parseAnchorNodeResolve(attributes.get('resolve') ?? undefined);

        return new CompiledAnchorNode(href, resolve, attributes);
    }
}
import {
    DocumentNode,
    Fragment,
    FragmentContext,
    Node
} from '../../lib';
import {
    HtmlCompilerContext
} from '../../lib/pipeline/module/htmlCompiler';
import {
    StandardPipeline, StandardPipelineContext
} from '../../lib/pipeline/standardPipeline';
import {MockPipeline} from './mockPipeline';

export class MockPipelineContext implements StandardPipelineContext {
    fragment: Fragment;
    fragmentContext: FragmentContext;
    pipeline: StandardPipeline;
    stylesInPage: Set<string>;
    linksInPage: Set<string>;

    constructor(fragment?: Fragment, fragmentContext?: FragmentContext, pipeline?: StandardPipeline, uniqueStyles?: Set<string>, uniqueLinks?: Set<string>) {
        this.fragment = fragment ?? {
            dom: new DocumentNode(),
            path: ''
        };
        this.fragmentContext = fragmentContext ?? {
            slotContents: new Map(),
            scope: {},
            fragmentResPath: this.fragment.path,
            rootResPath: this.fragment.path
        };
        this.pipeline = pipeline ?? new MockPipeline();
        this.stylesInPage = uniqueStyles ?? new Set();
        this.linksInPage = uniqueLinks ?? new Set();
    }
}

export class MockHtmlCompilerContext extends HtmlCompilerContext {
    readonly parentContext?: MockHtmlCompilerContext;

    constructor(node: Node, pipelineContext?: StandardPipelineContext, parentContext?: MockHtmlCompilerContext) {
        super(pipelineContext ?? new MockPipelineContext(), node, parentContext);

        this.parentContext = parentContext;
    }
}
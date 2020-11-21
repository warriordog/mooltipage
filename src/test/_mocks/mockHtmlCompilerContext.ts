import {
    DocumentNode,
    Fragment,
    FragmentContext,
    Node, PipelineContext
} from '../../lib';
import {
    HtmlCompilerContext,
    SharedHtmlCompilerContext
} from '../../lib/pipeline/module/htmlCompiler';
import {
    StandardPipeline, StandardPipelineContext
} from '../../lib/pipeline/standardPipeline';
import {MockPipeline} from './mockPipeline';

export class MockPipelineContext implements PipelineContext {
    fragment: Fragment;
    fragmentContext: FragmentContext;
    pipeline: StandardPipeline;

    constructor(fragment?: Fragment, fragmentContext?: FragmentContext, pipeline?: StandardPipeline) {
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
    }
}

export class MockSharedHtmlCompilerContext implements SharedHtmlCompilerContext {
    pipelineContext: StandardPipelineContext;
    uniqueLinks = new Set<string>();
    uniqueStyles = new Set<string>();

    constructor(pipelineContext?: StandardPipelineContext) {
        this.pipelineContext = pipelineContext ?? new MockPipelineContext();
    }
}

export class MockHtmlCompilerContext extends HtmlCompilerContext {
    readonly parentContext?: MockHtmlCompilerContext;

    constructor(node: Node, sharedContext?: SharedHtmlCompilerContext, parentContext?: MockHtmlCompilerContext) {
        super(sharedContext ?? new MockSharedHtmlCompilerContext(), node, parentContext);

        this.parentContext = parentContext;
    }
}
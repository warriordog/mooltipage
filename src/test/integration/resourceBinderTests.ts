import test from 'ava';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { StandardPipeline, PipelineContext } from '../../lib/pipeline/standardPipeline';
import { DocumentNode, TagNode, TextNode, Node, MimeType, Fragment } from '../../lib';
import { bindStyle, StyleBindType } from '../../lib/pipeline/module/resourceBinder';

test('[integration] ResourceBinder can bind stylesheet to head', t => {
    const stylesheet = '.some-class { } .other-class { }';

    const pipeline = new StandardPipeline(new MemoryPipelineInterface());
    const testFrag: Fragment = {
        path: 'page.html',
        dom: new DocumentNode()
    };
    const testContext: PipelineContext = {
        pipeline: pipeline,
        fragment: testFrag,
        fragmentContext: {
            parameters: new Map(),
            slotContents: new Map(),
            scope: {}
        }
    };
    
    bindStyle('component.html', stylesheet, StyleBindType.HEAD, testContext);

    const head = testFrag.dom.findChildTagByTagName('head') as TagNode;
    t.truthy(head);
    const styleTag = head.findChildTagByTagName('style');
    t.truthy(styleTag);

    const styleTagText = styleTag?.firstChild;
    t.truthy(styleTagText);
    t.true(TextNode.isTextNode(styleTagText as Node));
    t.is((styleTagText as TextNode).text, stylesheet);
});

test('[integration] ResourceBinder can bind stylesheet to link', t => {
    const stylesheet = '.some-class { } .other-class { }';

    const pi = new MemoryPipelineInterface();
    const pipeline = new StandardPipeline(pi);
    const testFrag: Fragment = {
        path: 'page.html',
        dom: new DocumentNode()
    };
    const testContext: PipelineContext = {
        pipeline: pipeline,
        fragment: testFrag,
        fragmentContext: {
            parameters: new Map(),
            slotContents: new Map(),
            scope: {}
        }
    };

    bindStyle('component.html', stylesheet, StyleBindType.LINK, testContext);

    // verify link
    
    const head = testFrag.dom.findChildTagByTagName('head') as TagNode;
    t.truthy(head);
    const linkTag = head.findChildTagByTagName('link');
    t.truthy(linkTag);
    t.is(linkTag?.getAttribute('rel'), 'stylesheet');

    // verify file created
    const href = linkTag?.getAttribute('href');
    t.truthy(href);
    t.true(pi.hasCreated(href as string));

    // verify file contents
    const createdStylesheet = pi.getCreated(href as string);
    t.is(createdStylesheet?.type, MimeType.CSS);
    t.is(createdStylesheet?.content, stylesheet);
});
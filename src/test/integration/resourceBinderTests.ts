import test from 'ava';
import { Pipeline, ResourceType, UsageContext, Page, DocumentNode, TextNode, Node, StyleBindType } from '../../lib';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';

test('[integration] ResourceBinder can bind stylesheet to head', t => {
    const stylesheet = '.some-class { } .other-class { }';

    const pipeline = new Pipeline(new MemoryPipelineInterface());
    const testPage = new Page('page.html', new DocumentNode());
    const testContext = new UsageContext(testPage);
    
    const resourceBinder = pipeline.resourceBinder;
    resourceBinder.bindStyle('component.html', stylesheet, StyleBindType.HEAD, testContext);

    const styleTag = testPage.head.findChildTagByTagName('style');
    t.truthy(styleTag);

    const styleTagText = styleTag?.firstChild;
    t.truthy(styleTagText);
    t.true(TextNode.isTextNode(styleTagText as Node));
    t.is((styleTagText as TextNode).text, stylesheet);
});

test('[integration] ResourceBinder can bind stylesheet to link', t => {
    const stylesheet = '.some-class { } .other-class { }';

    const pi = new MemoryPipelineInterface();
    const pipeline = new Pipeline(pi);
    const testPage = new Page('page.html', new DocumentNode());
    const testContext = new UsageContext(testPage);
    
    const resourceBinder = pipeline.resourceBinder;
    resourceBinder.bindStyle('component.html', stylesheet, StyleBindType.LINK, testContext);

    // verify link
    const linkTag = testPage.head.findChildTagByTagName('link');
    t.truthy(linkTag);
    t.is(linkTag?.getAttribute('rel'), 'stylesheet');

    // verify file created
    const href = linkTag?.getAttribute('href');
    t.truthy(href);
    t.true(pi.hasCreated(href as string));

    // verify file contents
    const createdStylesheet = pi.getCreated(href as string);
    t.is(createdStylesheet?.type, ResourceType.CSS);
    t.is(createdStylesheet?.content, stylesheet);
});
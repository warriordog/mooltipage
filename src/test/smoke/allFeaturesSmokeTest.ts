import test from 'ava';
import { Pipeline, BasicHtmlFormatter } from '../../lib/index';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';

test('[smoke] Build with all features produces valid page', t => {
    // set up pipeline
    const pipeline = createPipeline();

    // run build
    const page = pipeline.compilePage('page.html');

    // check output
    t.truthy(page);
    t.truthy(page.dom);
    t.truthy(page.head); // there should be a head
    t.truthy(page.body); // there should be a body
    t.is(page.dom.findChildTags(tag => tag.tagName === 'header').length, 6); // there should be 6 <header>
    t.is(page.dom.findChildTags(tag => tag.tagName === 'style').length, 3) // should be 3 <style>
    t.is(page.dom.findChildTags(tag => tag.tagName === 'script').length, 1) // should be 1 <script>
    t.is(page.dom.findChildTags(tag => tag.tagName === 'p').length, 3) // should be 3 <p>
});

function createPipeline(): Pipeline {
    const pipelineInterface = new MemoryPipelineInterface();
    pipelineInterface.htmlSource.set('page.html', `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <title>All Features Smoke Test</title>
            </head>
            <body>
                <script type="text/javascript">
                    window.foo = function() {
                        alert('Hello, world!");
                    }
                </script>
                <article>
                    <header>This is the main content of the page.</header>

                    <br>

                    <!-- include the main page content from a fragment -->
                    <m-fragment src="mainContent.html" />

                    <br>

                    <button onclick="foo">Click me!</button>
                </article>
            </body>
        </html>
    `);
    pipelineInterface.htmlSource.set('mainContent.html', `
        <v-var name="\${ 'Main' + 'Content' }Page" />

        <m-fragment src="header.html" title="{{ $.name }}" />

        <br>

        <m-component src="section.html" title="Section 1">
            <p>This is the content of section 1.</p>
        </m-component>

        <br>

        <m-component src="section.html" title="Section 2">
            <p>This is the content of section 2.</p>
        </m-component>

        <br>

        <m-component src="section.html" title="Section 3">
            <m-content slot="subheader">
                <m-fragment src="header.html" title="Subtitle" class="subheader" />
            </m-content>

            <br>

            <p>This is the content of section 3.</p>
        </m-component>
    `);
    pipelineInterface.htmlSource.set('header.html', `
        <header class="pageTitle \${ $.class || '' }">\${ $.name }</header>
    `);
    pipelineInterface.htmlSource.set('section.html', `
        <template>
            <section class="\${ $.sectionClass }">
                <header>\${ $.sectionTitle }</header>
                <m-slot slot="subheader" />
                <m-slot />
            </section>
        </template>

        <script>
            return class Section {
                constructor(scope, context) {
                    this.$ = scope;
                    this.$$ = context;

                    if (scope.class) {
                        this.sectionClass = scope.class;
                    } else {
                        this.sectionClass = 'defaultSection';
                    }

                    this.sectionTitle = scope.title;
                }
            }
        </script>

        <style bind="head">
            section.defaultSection {
                background-color: white;
            }
        </style>
    `);

    // enable pretty formatting
    const htmlFormatter = new BasicHtmlFormatter(true);

    return new Pipeline(pipelineInterface, htmlFormatter);
}
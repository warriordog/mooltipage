import test from 'ava';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import { ResourceType } from '../../lib';
import { StandardHtmlFormatter, StandardHtmlFormatterMode } from '../../lib/pipeline/module/standardHtmlFormatter';

test('[smoke] Build produces a page and does not crash', t => {
    // set up pipeline
    const pipeline = createPipeline();

    // run build
    const result = pipeline.compilePage('page.html');

    // check output
    t.truthy(result);
    t.truthy(result.path, 'Generated page should include resource path');
    t.truthy(result.html, 'Generated page should include HTML');
    t.truthy(result.dom, 'Generated page should have a DOM');
});

function createPipeline(): StandardPipeline {
    const pipelineInterface = new MemoryPipelineInterface();
    pipelineInterface.setSourceHtml('page.html', `
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
    pipelineInterface.setSourceHtml('mainContent.html', `
        <m-var name="\${ 'Main' + 'Content' }Page" />
        <m-import component src="section.html" as="custom-section" />

        <m-fragment src="header.html" title="{{ $.name }}" />

        <m-script src="sectionLoader.js" />

        <m-for var="sn" of="{{ $.sectionids }}">
            <br>

            <custom-section title="Section \${ $.sn }">
                <m-if ?="{{ $.sn === 3 }}">
                    <m-content slot="subheader">
                        <m-fragment src="header.html" title="Subtitle" class="subheader" />
                    </m-content>
                </m-if
    
                <p>This is the content of section \${ $.sn }.</p>
            </custom-section>
        </m-for>
    `);
    pipelineInterface.setSourceHtml('header.html', `
        <header class="pageTitle \${ $.class || '' }">\${ $.name }</header>
    `);
    pipelineInterface.setSourceHtml('section.html', `
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

        <style bind="head" src="section.style.css"></style>
    `);
    pipelineInterface.setSource('section.style.css', {
        type: ResourceType.CSS,
        content: `
            section.defaultSection {
                background-color: white;
            }
        `
    });
    pipelineInterface.setSource('sectionLoader.js', {
        type: ResourceType.JAVASCRIPT,
        content: `
            const sectionIds = [];
            for (let i = 0; i < 3; i++) {
                const sectionId = i + 1;
                sectionIds.push(sectionId);
            }
            $.sectionids = sectionIds;
        `
    });

    // enable pretty formatting
    const htmlFormatter = new StandardHtmlFormatter(StandardHtmlFormatterMode.PRETTY);

    return new StandardPipeline(pipelineInterface, htmlFormatter);
}
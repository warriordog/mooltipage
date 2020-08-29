import test from 'ava';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import { MimeType } from '../../lib';
import {
    StandardHtmlFormatter,
    PrettyFormatterPreset
} from '../../lib/pipeline/module/standardHtmlFormatter';

test('Build produces a page and does not crash', t => {
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

                    <button>Click me!</button>
                    
                    <a compiled href="index.html" resolve="root">Index</a>
                </article>

                <![CDATA[
                    This is ignored CDATA content
                ]]>
            </body>
        </html>
    `);
    pipelineInterface.setSourceHtml('mainContent.html', `
        <m-var name="\${ 'Main' + 'Content' }Page" />
        <m-import component src="section.html" as="custom-section" />

        <m-fragment src="header.html" title="{{ $.name }}" />

        <m-data type="application/json" sections="sectionData.json" />
        <script compiled src="sectionLoader.js"></script>

        <m-for var="sn" of="{{ $.sectionIds }}">
            <br>

            <custom-section title="Section \${ $.sn }">
                <m-if ?="{{ $.sn === 3 }}">
                    <m-content slot="subheader">
                        <m-fragment src="header.html" title="Subtitle" class="subheader" />
                    </m-content>
                </m-if>
    
                <p>This is the content of section \${ $.sn }.</p>
            </custom-section>
        </m-for>
    `);
    pipelineInterface.setSourceHtml('header.html', `
        <header class="pageTitle \${ $.class || '' }">\${ $.name }</header>
    `);
    pipelineInterface.setSourceHtml('section.html', `
        <script compiled>
            if ($.class) {
                this.sectionClass = $.class;
            } else {
                this.sectionClass = 'defaultSection';
            }

            this.sectionTitle = $.title;
        </script>

        <style bind="head" src="section.style.css"></style>
        
        <template>
            <section class="\${ $.sectionClass }">
                <header>\${ $.sectionTitle }</header>
                <m-slot slot="subheader" />
                <m-slot />
            </section>
        </template>
    `);
    pipelineInterface.setSource('section.style.css', {
        type: MimeType.CSS,
        content: `
            section.defaultSection {
                background-color: white;
            }
        `
    });
    pipelineInterface.setSource('sectionLoader.js', {
        type: MimeType.JAVASCRIPT,
        content: `
            $.sectionIds = $.sections.map(s => s.id);
        `
    });
    pipelineInterface.setSource('sectionData.json', {
        type: MimeType.JSON,
        content: `
        [
            { "id": 1 },
            { "id": 2 },
            { "id": 3 }
        ]
        `
    });

    // enable pretty formatting
    const htmlFormatter = new StandardHtmlFormatter(PrettyFormatterPreset);

    return new StandardPipeline(pipelineInterface, htmlFormatter);
}
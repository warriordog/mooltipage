import test from 'ava';
import {PipelineDependencyTracker} from '../../lib/pipeline/standardPipeline';

test('DependencyTracker tracks if a page is recorded or not', t => {
    const depTracker = new PipelineDependencyTracker();

    depTracker.recordDependency('page.html', 'resource.html');

    t.true(depTracker.hasTrackedPage('page.html'));
    t.false(depTracker.hasTrackedPage('wrong.html'));
});

test('DependencyTracker tracks if a resource is recorded or not', t => {
    const depTracker = new PipelineDependencyTracker();

    depTracker.recordDependency('page.html', 'resource.html');

    t.true(depTracker.hasTrackedResource('resource.html'));
    t.false(depTracker.hasTrackedResource('wrong.html'));
});

test('DependencyTracker maps dependencies', t => {
    const depTracker = new PipelineDependencyTracker();

    depTracker.recordDependency('page.html', 'resource.html');

    t.deepEqual(depTracker.getDependenciesForPage('page.html'), new Set([ 'resource.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource.html'), new Set([ 'page.html' ]));
});

test('DependencyTracker handles multiple mappings', t => {
    const depTracker = new PipelineDependencyTracker();

    depTracker.recordDependency('page1.html', 'resource1.html');
    depTracker.recordDependency('page1.html', 'resource2.html');
    depTracker.recordDependency('page2.html', 'resource3.html');
    depTracker.recordDependency('page2.html', 'resource4.html');

    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set([ 'resource1.html', 'resource2.html' ]));
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set([ 'resource3.html', 'resource4.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource3.html'), new Set([ 'page2.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource4.html'), new Set([ 'page2.html' ]));
});

test('DependencyTracker handles shared resources and pages', t => {
    const depTracker = new PipelineDependencyTracker();

    depTracker.recordDependency('page1.html', 'resource1.html');
    depTracker.recordDependency('page1.html', 'resource2.html');
    depTracker.recordDependency('page2.html', 'resource2.html');
    depTracker.recordDependency('page2.html', 'resource3.html');

    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set([ 'resource1.html', 'resource2.html' ]));
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set([ 'resource2.html', 'resource3.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set([ 'page1.html', 'page2.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource3.html'), new Set([ 'page2.html' ]));
});

test('DependencyTracker skips duplicate mappings', t => {
    const depTracker = new PipelineDependencyTracker();

    depTracker.recordDependency('page1.html', 'resource1.html');
    depTracker.recordDependency('page2.html', 'resource2.html');
    depTracker.recordDependency('page1.html', 'resource1.html');
    depTracker.recordDependency('page2.html', 'resource2.html');
    depTracker.recordDependency('page1.html', 'resource1.html');

    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set([ 'resource1.html' ]));
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set([ 'resource2.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set([ 'page2.html' ]));

});

test('DependencyTracker can clear all mappings', t => {
    const depTracker = new PipelineDependencyTracker();
    depTracker.recordDependency('page1.html', 'resource1.html');
    depTracker.recordDependency('page2.html', 'resource2.html');

    depTracker.clear();

    t.false(depTracker.hasTrackedPage('page1.html'));
    t.false(depTracker.hasTrackedPage('page2.html'));
    t.false(depTracker.hasTrackedResource('resource1.html'));
    t.false(depTracker.hasTrackedResource('resource2.html'));
    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set());
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set());
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set());
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set());
});

test('DependencyTracker.getAllTrackedFiles returns all deduplicated pages and resources', t => {
    const depTracker = new PipelineDependencyTracker();
    depTracker.recordDependency('page1.html', 'resource1.html');
    depTracker.recordDependency('page1.html', 'resource2.html');
    depTracker.recordDependency('page2.html', 'resource2.html');
    depTracker.recordDependency('page2.html', 'resource3.html');

    t.deepEqual(depTracker.getAllTrackedFiles(), new Set([
        'page1.html',
        'page2.html',
        'resource1.html',
        'resource2.html',
        'resource3.html'
    ]));
});

test('PipelineDependencyTracker.forgetTrackedPage forgets all mappings', t => {
    const depTracker = new PipelineDependencyTracker();
    depTracker.recordDependency('page1.html', 'resource1.html');
    depTracker.recordDependency('page1.html', 'resource2.html');
    depTracker.recordDependency('page2.html', 'resource2.html');

    depTracker.forgetTrackedPage('page1.html');

    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set());
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set([ 'resource2.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set());
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set([ 'page2.html' ]));
});
import test from 'ava';
import {DependencyTracker} from '../../../bin/watch/dependencyTracker';

test('DependencyTracker tracks if a page is recorded or not', t => {
    const depTracker = new DependencyTracker();

    depTracker.setPageDependencies('page.html', new Set([ 'resource.html' ]));

    t.true(depTracker.hasPage('page.html'));
    t.false(depTracker.hasPage('wrong.html'));
});

test('DependencyTracker maps dependencies', t => {
    const depTracker = new DependencyTracker();

    depTracker.setPageDependencies('page.html', new Set([ 'resource.html' ]));

    t.deepEqual(depTracker.getDependenciesForPage('page.html'), new Set([ 'resource.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource.html'), new Set([ 'page.html' ]));
});

test('DependencyTracker handles multiple mappings', t => {
    const depTracker = new DependencyTracker();

    depTracker.setPageDependencies('page1.html', new Set([ 'resource1.html', 'resource2.html' ]));
    depTracker.setPageDependencies('page2.html', new Set([ 'resource3.html', 'resource4.html' ]));

    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set([ 'resource1.html', 'resource2.html' ]));
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set([ 'resource3.html', 'resource4.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource3.html'), new Set([ 'page2.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource4.html'), new Set([ 'page2.html' ]));
});

test('DependencyTracker handles shared resources and pages', t => {
    const depTracker = new DependencyTracker();

    depTracker.setPageDependencies('page1.html', new Set([ 'resource1.html', 'resource2.html' ]));
    depTracker.setPageDependencies('page2.html', new Set([ 'resource2.html', 'resource3.html' ]));

    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set([ 'resource1.html', 'resource2.html' ]));
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set([ 'resource2.html', 'resource3.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set([ 'page1.html', 'page2.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource3.html'), new Set([ 'page2.html' ]));
});

test('DependencyTracker skips duplicate mappings', t => {
    const depTracker = new DependencyTracker();

    depTracker.setPageDependencies('page1.html', new Set([ 'resource1.html' ]));
    depTracker.setPageDependencies('page2.html', new Set([ 'resource2.html' ]));
    depTracker.setPageDependencies('page1.html', new Set([ 'resource1.html' ]));
    depTracker.setPageDependencies('page2.html', new Set([ 'resource2.html' ]));
    depTracker.setPageDependencies('page1.html', new Set([ 'resource1.html' ]));

    t.deepEqual(depTracker.getDependenciesForPage('page1.html'), new Set([ 'resource1.html' ]));
    t.deepEqual(depTracker.getDependenciesForPage('page2.html'), new Set([ 'resource2.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource1.html'), new Set([ 'page1.html' ]));
    t.deepEqual(depTracker.getDependentsForResource('resource2.html'), new Set([ 'page2.html' ]));

});

test('DependencyTracker.getAllTrackedFiles returns all deduplicated pages and resources', t => {
    const depTracker = new DependencyTracker();

    depTracker.setPageDependencies('page1.html', new Set([ 'resource1.html', 'resource2.html' ]));
    depTracker.setPageDependencies('page2.html', new Set([ 'resource2.html', 'resource3.html' ]));

    t.deepEqual(depTracker.getAllTrackedFiles(), new Set([
        'page1.html',
        'page2.html',
        'resource1.html',
        'resource2.html',
        'resource3.html'
    ]));
});


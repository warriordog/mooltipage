import test from 'ava';
import { ContentHasher } from '../../lib';

test('[unit] ContentHasher.fastHashContent() should hash html content', t => {
    const hasher = new ContentHasher();
    const testContent = '<html><head><style> .cls {}</style><script> function() {} </script></head><body><div class="cls"></div></html>';

    t.truthy(hasher.fastHashContent(testContent));
});

test('[unit] ContentHasher.fastHashContent() should hash whitespace', t => {
    const hasher = new ContentHasher();
    const testContent = '   \t\r  \n  \r\n   \t\t  \r   ';

    t.truthy(hasher.fastHashContent(testContent));
});

test('[unit] ContentHasher.fastHashContent() should hash empty string', t => {
    const hasher = new ContentHasher();
    const testContent = '';

    t.truthy(hasher.fastHashContent(testContent));
});

test('[unit] ContentHasher.fastHashContent() should produce matching hashes for identical input', t => {
    const hasher = new ContentHasher();

    const h1 = hasher.fastHashContent('foo');
    const h2 = hasher.fastHashContent('bar');
    const h3 = hasher.fastHashContent('bar');
    const h4 = hasher.fastHashContent('foo');

    t.truthy(h1);
    t.truthy(h2);
    t.truthy(h3);
    t.truthy(h4);

    t.is(h1, h4);
    t.is(h2, h3);
});
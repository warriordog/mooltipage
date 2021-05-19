import test from 'ava';
import {hashMD5} from '../../../lib/util/encodingUtils';

test('hashMD5() should hash html content', t => {
    const testContent = '<html lang="en"><head><title>MD5 Tests</title><style> .cls {}</style><script> function test() {} </script></head><body><div class="cls"></div></html>';

    t.truthy(hashMD5(testContent));
});

test('hashMD5() should hash whitespace', t => {
    const testContent = '   \t\r  \n  \r\n   \t\t  \r   ';

    t.truthy(hashMD5(testContent));
});

test('hashMD5() should hash empty string', t => {
    const testContent = '';

    t.truthy(hashMD5(testContent));
});

test('hashMD5() should produce matching hashes for identical input', t => {
    const h1 = hashMD5('foo');
    const h2 = hashMD5('bar');
    const h3 = hashMD5('bar');
    const h4 = hashMD5('foo');

    t.truthy(h1);
    t.truthy(h2);
    t.truthy(h3);
    t.truthy(h4);

    t.is(h1, h4);
    t.is(h2, h3);
});
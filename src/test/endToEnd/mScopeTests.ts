import test from 'ava';
import { compareFragmentMacro } from '../_util/htmlCompare';

test('[endToEnd] scope vars are available inside scope', compareFragmentMacro,
`<m-scope test="\${ 'TEST' }">\${ $.test }</m-scope>`,
`TEST`
);

test('[endToEnd] scope does not hide root scopes', compareFragmentMacro,
`
<m-var root="\${ 'root' }" />
<m-scope scope="\${ 'scope' }">\${ $.root }\${ $.scope }</m-scope>`,
`rootscope`
);

test('[endToEnd] child scope inherits parent scope', compareFragmentMacro,
`<m-scope parent="\${ 'parent' }">
    <m-scope child="\${ 'child' }">\${ $.parent }\${ $.child }</m-scope>
</m-scope>`,
`parentchild`
);

test('[endToEnd] child scope can shadow parent scope', compareFragmentMacro,
`<m-scope test="\${ 'parent' }">
    <m-scope test="\${ 'child' }">\${ $.test }</m-scope>
</m-scope>`,
`child`
);

test('[endToEnd] child scope is isolated from parent scope', compareFragmentMacro,
`<m-scope test="\${ 'parent' }"><m-scope test="\${ 'child' }">\${ $.test }</m-scope>\${ $.test }</m-scope>`,
`childparent`
);

test('[endToEnd] m-var writes to correct scope', compareFragmentMacro,
`<m-scope>
    <m-var test="\${ 'parent' }" />
    <m-scope>
        <m-var test="\${ 'child' }" />
        \${ $.test }
    </m-scope>
    \${ $.test }
</m-scope>`,
`childparent`
);

test('[endToEnd] fragment does not inherit parent local scope', compareFragmentMacro,
`<m-scope parent="\${ 'parent' }">
    <m-fragment src="child.html" />
</m-scope>`,
`undefined`,
[
    ['child.html', '${ $.parent }']
]
);

test('[endToEnd] fragment is isolated from parent local scope', compareFragmentMacro,
`<m-scope parent="\${ 'parent' }">
    <m-fragment src="child.html" />
    \${ $.parent }
</m-scope>`,
`parent`,
[
    ['child.html', `<m-var parent="\${ 'child' }" />`]
]
);
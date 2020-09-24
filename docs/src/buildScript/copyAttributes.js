const { TagNode } = require('./dom/node');

function getSourceAttrs(node) {
    if (node.hasAttribute('attributes')) {
        return node.getRawAttribute('attributes');

    } else {
        const blacklistAttrs = [ 'target-matcher', 'target-tag', 'compiled', 'src' ];

        // extract attributes
        return Array.from(node.getAttributes().entries())
            .filter(entry => !blacklistAttrs.includes(entry[0].toLowerCase()))
        ;
    }
}

function getTargetMatcher(node) {
    if (node.hasAttribute('target-matcher')) {
        return node.getRawAttribute('target-matcher');

    } else if (node.hasAttribute('target-tag')) {
        const targetTag = node.getAttribute('target-tag');
        return (node) => node.tagName === targetTag;

    } else {
        throw new Error('CopyAttributes.js: one of attributes "target-tag" or "target-matcher" is required.');
    }
}

// get current node
const currentNode = $$.sourceNode;

// only process if this is a tag node. If not a tag node then error
if (!TagNode.isTagNode(currentNode)) {
    throw new Error(`CopyAttributes.js: script must be run from a tag node. Currently bound to "${ currentNode.nodeType }"`);
}

// get attrs to pass to target
const sourceAttrs = getSourceAttrs(currentNode);

// find target tag
const targetMatcher = getTargetMatcher(currentNode);
const targetNode = currentNode.findNext(targetMatcher);
if (targetNode == null) {
    throw new Error('CopyAttributes.js: unable to find matching target node');
}

// copy attributes to target
for (const attr of sourceAttrs) {
    targetNode.setRawAttribute(attr[0], attr[1]);
}
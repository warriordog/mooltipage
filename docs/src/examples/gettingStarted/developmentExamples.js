$.exampleData = {
    sections: {
        page: {
            template: {
                lines: 11,
                language: 'html',
                code:
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
</head>
<body>
    
</body>
</html>`
            }
        },
        pageContent: {
            template: {
                lines: 22,
                language: 'html',
                code:
                    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mooltipage Example</title>
</head>
<body>
    <article>
        <section>
            Hello, world!
        </section>
        <br>
        <section>
            Hello, dog!
        </section>
        <br>
        <section>
            Hello, cat!
        </section>
    </article>
</body>
</html>`
            }
        },
        fragment: {
            template: {
                lines: 3,
                language: 'html',
                code:
`<section>
    Hello, \${ $.friend }!
</section>`
            },
            page: {
                lines: 17,
                language: 'html',
                code:
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mooltipage Example</title>
</head>
<body>
    <article>
        <m-fragment src="./hello.html" friend="world"></m-fragment>
        <br>
        <m-fragment src="./hello.html" friend="dog"></m-fragment>
        <br>
        <m-fragment src="./hello.html" friend="cat"></m-fragment>
    </article>
</body>
</html>`
            }
        },
        modify: {
            fragment: {
                lines: 3,
                language: 'html',
                code:
`<section>
    Hello, <strong>\${ $.friend }</strong>!
</section>`
            }
        },
        style: {
            useClass: {
                lines: 3,
                language: 'html',
                code:
`<section class="hello">
    Hello, <strong>\${ $.friend }</strong>!
</section>`
            },
            style: {
                lines: 3,
                language: 'css',
                code:
`.hello strong {
    color: red;
}`
            },
            classAndStyle: {
                lines: 8,
                language: 'html',
                code:
`<section class="hello">
    Hello, <strong>\${ $.friend }</strong>!
</section>
<style compiled>
    .hello strong {
        color: red;
    }
</style>`
            }
        },
        repeating: {
            duplicates: {
                lines: 5,
                language: 'html',
                code:
`<m-fragment src="./hello.html" friend="world"></m-fragment>
<br>
<m-fragment src="./hello.html" friend="dog"></m-fragment>
<br>
<m-fragment src="./hello.html" friend="cat"></m-fragment>`
            },
            for: {
                lines: 16,
                language: 'html',
                code:
                    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mooltipage Example</title>
</head>
<body>
    <article>
        <m-for var="friend" of="{{ ['world', 'dog', 'cat'] }}">
            <m-fragment src="./hello.html" friend="{{ $.friend }}"></m-fragment>
            <br>
        </m-for>
    </article>
</body>
</html>`
            },
            more: {
                lines: 16,
                language: 'html',
                code:
                    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mooltipage Example</title>
</head>
<body>
    <article>
        <m-for var="friend" of="{{ ['world', 'dog', 'cat', 'sky', 'tree', 'car'] }}">
            <m-fragment src="./hello.html" friend="{{ $.friend }}"></m-fragment>
            <br>
        </m-for>
    </article>
</body>
</html>`
            }
        },
        if: {
            index: {
                lines: 1,
                language: 'html',
                code:
`<m-for var="friend" index="i" of="{{ ['world', 'dog', 'cat', 'sky', 'tree', 'car'] }}">`
            },
            br: {
                lines: 3,
                language: 'html',
                code:
`<m-if ?="{{ $.i > 0 }}">
    <br>
</m-if>`
            },
            full: {
                lines: 18,
                language: 'html',
                code:
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mooltipage Example</title>
</head>
<body>
    <article>
        <m-for var="friend" index="i" of="{{ ['world', 'dog', 'cat', 'sky', 'tree', 'car'] }}">
            <m-if ?="{{ $.i > 0 }}">
                <br>
            </m-if>
            <m-fragment src="./hello.html" friend="{{ $.friend }}"></m-fragment>
        </m-for>
    </article>
</body>
</html>`
            }
        },
        compiled: {
            index: {
                lines: 18,
                language: 'html',
                code:
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mooltipage Example</title>
</head>
<body>
<article>
    <m-for var="friend" index="i" of="{{ ['world', 'dog', 'cat', 'sky', 'tree', 'car'] }}">
        <m-if ?="{{ $.i > 0 }}">
            <br>
        </m-if>
        <m-fragment src="./hello.html" friend="{{ $.friend }}"></m-fragment>
    </m-for>
</article>
</body>
</html>`
            },
            hello: {
                lines: 8,
                language: 'html',
                code:
`<section class="hello">
    Hello, <strong>\${ $.friend }</strong>!
</section>
<style compiled>
    .hello strong {
        color: red;
    }
</style>`
            },
            out: {
                lines: 40,
                language: 'html',
                index:
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mooltipage Example</title>
    <style>
        .hello strong {
            color: red;
        }
    </style>
</head>
<body>
<article>
    <section class="hello">
        Hello, <strong>world</strong>!
    </section>
    <br>
    <section class="hello">
        Hello, <strong>dog</strong>!
    </section>
    <br>
    <section class="hello">
        Hello, <strong>cat</strong>!
    </section>
    <br>
    <section class="hello">
        Hello, <strong>sky</strong>!
    </section>
    <br>
    <section class="hello">
        Hello, <strong>tree</strong>!
    </section>
    <br>
    <section class="hello">
        Hello, <strong>car</strong>!
    </section>
</article>
</body>
</html>`
            }
        }
    }
};
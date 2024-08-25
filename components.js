/* Utilities */

function generateUniqueID() {
    let url = URL.createObjectURL(new Blob());
    let uuid = url.substring(url.length - 36, url.length);
    URL.revokeObjectURL(url);
    let repl = 'ghijklmnop';
    return uuid.replace(/\-/g, '').replace(/[0-9]/g, (m) => repl[parseInt(m)]);
}

function getURLParams() {
    return new URLSearchParams(window.location.search);
}

function range(start, stop) {
    if (stop === undefined) {
        stop = start;
        start = 0;
    }

    return Array.from(new Array(stop - start).keys()).map((n) => (n + start));
}

// Fisher-Yates algorithm, should produce an unbiased permutation
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

function ensureOneTarget(target) {
    let $target = $(target);

    if ($target.length === 0) {
        throw new Error('Empty target!');
    } else if ($target.length > 1) {
        console.warn('Multiple targets, selecting the first one...');
        $target = $($target[0]);
    }

    return $target;
}

/* Constants */

const TITLE_SELECTOR = range(1, 7).map((n) => `h${n}`).join(',');  // h1 - h6

/* Components */

function registerComponent(cls) {
    if (!cls || !cls.name) {
        console.warn(`Failed to register class as component: ${cls.toString()}`);
        return;
    }

    $.fn[cls.name] = function(arg1, arg2) {
        let results = [];
        if (arg1 === undefined) arg1 = {};

        this.each(function() {
            if (typeof arg1 === 'object') {
                let component = new cls(this, arg1);
                $(this).data(cls.name, component);
                results.push(component);
            } else if (typeof arg1 === 'string') {
                let component = $(this).data(cls.name);
                if (component !== undefined && component[arg1] !== undefined) {
                    let ret = component[arg1](arg2);
                    if (ret !== undefined) results.push(ret);
                }
            }
        });

        if (typeof arg1 === 'string') {
            return results.length > 1 ? results : results[0];
        } else {
            return results;
        }
    }
}

class Component {
    defaultOptions() { return {} };

    constructor(elem, opts) {
        this.opts = $.extend(this.defaultOptions(), opts);
        this.$elem = $(elem);
        this.clear();
    }

    clear() {
        this.$elem.empty();
        return this;
    }

    slot(name) {
        if (name === undefined) {
            let slotElem = this.$elem.find('slot')[0];
            if (slotElem === undefined) {
                name = 'default';
            } else {
                return slotElem;
            }
        }
        return this.$elem.find(`slot[name="${name}"]`)[0];
    }
}

class Navbar extends Component {
    defaultOptions() {
        return {
            activeItem: ''
        };
    }

    constructor(elem, opts) {
        super(elem, opts);

        this.$elem.html(`
            <ul class="nav nav-pills nav-justified col-lg-4 container">
                <li class="nav-item">
                    <a class="nav-link" href="/index.html">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">
                        Posts <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="nav-item"><a class="dropdown-item" href="/list.html?t=weeb">Weeb Stuff</a></li>
                        <li class="nav-item"><a class="dropdown-item" href="/list.html?t=stem">STEM Topics</a></li>
                        <li class="nav-item"><a class="dropdown-item" href="/list.html?t=misc">Miscellaneous</a></li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/arcade.html">Arcade</a>
                </li>
            </ul>
        `);

        if (this.opts.activeItem === 'Hidden') {
            this.$elem.find('ul.nav').append(
                $(`
                    <li class="nav-item">
                        <a class="nav-link disabled">Hidden</a>
                    </li>
                `)
            );
        } else {
            this.activate(this.opts.activeItem);
        }
    }

    activate(activeItem) {
        let clickables = this.$elem.find('li.nav-item > a');
        for (let i = 0; i < clickables.length; i++) {
            let a = clickables[i];
            if (a.innerText.trim() === activeItem) {
                a.classList.add('active');
            }
        }
    }

    hrefToItem() {
        let mapping = {};
        let $links = this.$elem.find('a.nav-link, a.dropdown-item');
        for (let aElem of $links) {
            let href = aElem.getAttribute('href');
            if (href !== undefined && href !== '#') {
                mapping[href] = aElem.innerText;
            }
        }
        return mapping;
    }
}
registerComponent(Navbar);

class Footer extends Component {
    defaultOptions() {
        return {};
    }

    constructor(elem, opts) {
        super(elem, opts);

        this.$elem.html(`
            <div class="d-flex align-items-center" style="height: 100%; margin-left: 10%">
                <div>
                    <div title="Zero comedian talent.">
                        Powered by... jQuery and Bootstrap! ...and a few other libraries, admittedly. Inspect the &lt;head&gt; tag. :P
                    </div>
                    <div title="Why is there a clock here? Because I can." label="time"></div>
                </div>
            </div>
        `);
        this.$time = this.$elem.find('div[label="time"]');

        this.showTime();
    }

    showTime() {
        this.$time.text(new Date().toLocaleString());
        setTimeout(() => this.showTime(), 1000);
    }
}
registerComponent(Footer);

class MarkdownLoader extends Component {
    defaultOptions() {
        return {
            url: null,
            commentElem: null,
            onload: $.noop
        };
    }

    constructor(elem, opts) {
        super(elem, opts);
        let $this = this;

        if (!$this.opts.url) {
            console.warn('MarkdownLoader: empty URL!');
            return;
        }

        $this.$div = $('<div class="article">');
        $this.$elem.append($this.$div);

        $.ajax({
            url: $this.opts.url,
            method: 'GET',
            success: function(resp) {
                $this.$div.html(DOMPurify.sanitize(marked.parse(resp), {
                    ADD_TAGS: ['iframe'],
                    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
                }));

                // add id to titles
                let $titles = $this.$div.find(TITLE_SELECTOR);
                for (let hElem of $titles) {
                    let id = hElem.tagName.toLowerCase() + '-' + hElem.innerText.toLowerCase().replace(
                        /[^a-z0-9\s]/g, '').split(/\s+/g).filter((s) => s !== '').join('-');
                    if ($(`#${id}`).length > 0) {
                        // id already exists on page, too bad
                        id = hElem.tagName.toLowerCase() + '-' + generateUniqueID();
                    }
                    hElem.setAttribute('id', id);
                }

                // all links in article should be opened in new tab
                let $links = $this.$div.find('a');
                for (let aElem of $links) {
                    aElem.setAttribute('target', '_blank');
                }

                // handle main article title
                let titleElem = $titles[0];
                if (titleElem?.tagName === 'H1') {
                    let $title = $(titleElem);
                    
                    // add table of contents if specified
                    let next = $title.next()[0];
                    if (next !== undefined && next.tagName === 'P' && next.innerText === '[[ TOC ]]') {
                        let $toc = $('<div>');
                        $toc.TableOfContents({target: $this.$div});
                        $toc.addClass('toc').prepend($('<div class="toc-title">').text('Table of Contents'));
                        $(next).replaceWith($toc);
                    }

                    // add <hr> after article title
                    $('<hr>').insertAfter($title);
                }

                // better image styling
                let $images = $this.$div.find('img');
                for (let imgElem of $images) {
                    imgElem.classList.add('blog-image');
                    imgElem.classList.add('rounded');
                    imgElem.classList.add('border');
                }

                // improved mark
                let $marks = $this.$div.find('mark');
                if ($this.opts.commentElem) {
                    let $comment = $($this.opts.commentElem);
                    $comment.CommentDialog();
                    for (let markElem of $marks) {
                        let title = markElem.getAttribute('title');
                        if (!title) continue;

                        $(markElem).addClass('clickable').on('click', () => {
                            $comment.CommentDialog('text', title);
                            $comment.CommentDialog('show');
                        });
                    }
                }

                // code syntax highlight
                let $codeBlocks = $this.$div.find('pre > code');
                for (let codeElem of $codeBlocks) {
                    if (codeElem.classList.length === 0) {
                        codeElem.parentElement.classList.add('plaintext');
                        continue;
                    } else if (codeElem.classList.contains('language-sh')) {
                        // a hack to force shell commands to load a different highlight theme
                        // intentionally not adding line numbers; bash script will still load normal syntax highlights
                        hljs.highlightElement(codeElem);
                        let height = codeElem.parentElement.getBoundingClientRect().height;
                        let iframeContent = `
                        <html>
                            <head>
                                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
                                      integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
                                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/paraiso-dark.min.css">
                                <style type="text/css">
                                    body { margin: 0px; overflow: clip; }
                                    .language-sh { color: #f0f0f0; }
                                    pre > code.hljs { white-space: pre-wrap; word-break: break-all; }
                                </style>
                            </head>
                            <body><pre>${codeElem.parentElement.innerHTML}</pre></body>
                        </html>
                        `;
                        let $iframe = $('<iframe>').css({width: `100%`, height: `${height}px`, marginBottom: '12px'}).attr(
                            {src: `data:text/html;charset=utf-8,${escape(iframeContent)}`});
                        $(codeElem.parentElement).replaceWith($iframe);
                        continue;
                    } else if (codeElem.classList.contains('language-latex')) {
                        // render latex
                        let generator = new latexjs.HtmlGenerator({ hyphenate: false });
                        generator = latexjs.parse(codeElem.innerText, { generator: generator });
                        let dom = generator.domFragment();
                        $(codeElem).replaceWith($(dom));
                        continue;
                    }

                    hljs.highlightElement(codeElem);
                }
                $this.$div.find('code.hljs').each((i, block) => hljs.lineNumbersBlock(block));

                // blockquote
                let $blockQuotes = $this.$div.find('blockquote');
                for (let quoteElem of $blockQuotes) {
                    let $quote = $(quoteElem);
                    let text = $quote.text();
                    $quote.text('').addClass('container d-flex justify-content-between').append(
                        $('<div>').css({fontSize: '30px', marginRight: '10px'}).addClass('align-self-start').text('“')
                    ).append(
                        $('<div>').text(text)
                    ).append(
                        $('<div>').css({fontSize: '30px', marginLeft: '10px'}).addClass('align-self-end').text('”')
                    );
                }

                // tables
                let $tables = $this.$div.find('table');
                for (let tableElem of $tables) {
                    if (['CODE', 'PRE'].includes(tableElem.parentElement.tagName)) {
                        continue;
                    }
                    tableElem.classList.add('table');
                    tableElem.classList.add('table-striped');
                }

                $this.opts.onload();
            }
        });
    }
}
registerComponent(MarkdownLoader);

class AutoScrollSpy extends Component {
    defaultOptions() {
        return {
            target: null
        };
    }

    constructor(elem, opts) {
        super(elem, opts);
        let $target = ensureOneTarget(this.opts.target);

        this.$elem.html(`
            <div class="list-group sticky-top auto-scrollspy"></div>
        `);
        this.$elem.addClass('position-fixed');
        this.$nav = $(this.$elem.children()[0]);

        // construct table of contents
        let $titles = $target.find(TITLE_SELECTOR);
        for (let hElem of $titles) {
            let level = parseInt(hElem.tagName.substring(1));
            let hId = hElem.getAttribute('id') || '';
            let $a = $('<a class="list-group-item list-group-item-action">').text(
                hElem.innerText).css({paddingLeft: `${level * 15}px`}).attr({href: `#${hId}`});
            this.$nav.append($a);
        }

        // activate scroll spy
        let nav = this.$nav[0];
        let scrollspy = new bootstrap.ScrollSpy($target[0], {
            target: nav
        });
    }
}
registerComponent(AutoScrollSpy);

class TableOfContents extends Component {
    defaultOptions() {
        return {
            target: null,
            ulClass: null,
            liClass: null,
            aClass: null
        };
    }

    constructor(elem, opts) {
        super(elem, opts);
        let $target = ensureOneTarget(this.opts.target);

        let $titles = $target.find(TITLE_SELECTOR);
        let lastLevel = 0;
        let $parent = this.$elem;
        for (let hElem of $titles) {
            let currentLevel = parseInt(hElem.tagName.substring(1));
            if (currentLevel > lastLevel) {
                // e.g. h1 -> h2, or h1 -> h3, go down that many levels
                for (let i = 0; i < currentLevel - lastLevel; i++) {
                    let $ul = $('<ul>').addClass(this.opts.ulClass);
                    $parent.append($ul);
                    $parent = $ul;
                }
            } else if (currentLevel < lastLevel) {
                // e.g. h2 -> h1, or h3 -> h1, go up that many levels
                for (let i = 0; i < lastLevel - currentLevel; i++) {
                    $parent = $parent.parent();
                }
            }
            let hId = hElem.getAttribute('id') || '';
            let $li = $('<li>').addClass(this.opts.liClass).append(
                $('<a>').addClass(this.opts.aClass).text(hElem.innerText).attr({href: `#${hId}`})
            );
            $parent.append($li);

            lastLevel = currentLevel;
        }
    }
}
registerComponent(TableOfContents);

class BlogList extends Component {
    defaultOptions() {
        return {
            list: [],
            title: ''
        };
    }

    constructor(elem, opts) {
        super(elem, opts);

        let $h1 = $('<h1>').text(this.opts.title);
        let $div = $('<div class="article">');
        $div.append($h1).append($('<hr>'));

        let $ul = $('<ul>');
        for (let i = 0; i < this.opts.list.length; i++) {
            let item = this.opts.list[i];
            if (typeof item === 'string') {
                item = {title: item, post: item};
            }

            // TODO: actually load the first blog?

            $ul.append($('<li>').append(
                $('<h5>').append(
                    $('<a>').attr({href: `/blog.html?p=${item.post}`}).text(item.title)
                )
            ));
        }
        $div.append($ul);
        this.$elem.append($div);
    }
}
registerComponent(BlogList);

class Copyable extends Component {
    defaultOptions() {
        return {
            data: '',
            html: '<i class="fa-regular fa-copy"></i>'
        };
    }

    constructor(elem, opts) {
        super(elem, opts);

        let $span = $('<span class="clickable" title="Click to copy!">');
        $span.html(this.opts.html);
        let data = this.opts.data;
        $span.on('click', () => {
            navigator.clipboard.writeText(data);
        });

        this.$elem.append($span);
    }
}
registerComponent(Copyable);

class CommentDialog extends Component {
    defaultOptions() {
        return {
            html: ''
        }
    }

    constructor(elem, opts) {
        super(elem, opts);

        this.$elem.html(`
            <div class="modal fade comment-dialog" tabindex="-1">
                <div class="modal-dialog float-end">
                    <div class="modal-content">
                        <div class="modal-body">
                            <div class="d-flex flex-row-reverse">
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <slot></slot>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        this.$modal = $(this.$elem.children()[0]);
        this.$dialog = this.$modal.find('div.modal-dialog');

        this.$modal.on('shown.bs.modal', () => {
            // can only calculate this.$dialog.height() after shown
            this.$dialog.css({
                transform: `translateY(${(this.intrinsicHeight - this.$dialog.height()) / 2}px)`,
                transition: 'transform .2s ease-out'
            });
        });
        this.$modal.on('hide.bs.modal', () => {
            // hard code some smooth transition...
            this.$dialog.css({
                transform: `translate(100px, ${(this.intrinsicHeight - this.$dialog.height()) / 2}px)`,
                transition: 'transform .3s ease-out'
            });
        });
        this.$modal.on('hidden.bs.modal', () => {
            this.$dialog[0].removeAttribute('style');
        })
        this.modal = new bootstrap.Modal(this.$modal[0]);
        this.intrinsicHeight = 100;  // approximated height when there is no text, probably varies by browser

        this.html(this.opts.html);
    }

    text(content) {
        this.slot().innerText = content;
    }

    html(content) {
        this.slot().innerHTML = content;
    }

    show() {
        let top = (window.innerHeight - this.intrinsicHeight) / 2;
        this.$dialog.css({top: `${top}px`});
        this.modal.show();
    }
}
registerComponent(CommentDialog);

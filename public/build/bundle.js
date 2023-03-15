
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.56.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Comic.svelte generated by Svelte v3.56.0 */

    const { console: console_1 } = globals;
    const file$3 = "src/Comic.svelte";

    function create_fragment$3(ctx) {
    	let h1;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let div2;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Comic of the day:";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			attr_dev(h1, "class", "desc");
    			add_location(h1, file$3, 25, 0, 1462);
    			attr_dev(div0, "id", "comic-container");
    			add_location(div0, file$3, 28, 0, 1508);
    			attr_dev(div1, "id", "title-container");
    			add_location(div1, file$3, 29, 0, 1541);
    			attr_dev(div2, "id", "date-container");
    			add_location(div2, file$3, 30, 0, 1574);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function addComic() {
    	const innoURL = new URL("https://fwd.innopolis.app/api/hw2?email=a.salloum@innopolis.university");
    	const id_result = await fetch(innoURL);
    	const id = await id_result.json();
    	const comicURL = new URL("https://getxkcd.vercel.app/api/comic?num=" + id);
    	const response_object = await fetch(comicURL);
    	const comic_data = await response_object.json();
    	const imgElement = document.createElement("img");
    	imgElement.src = comic_data.img;
    	imgElement.className = "comic";
    	imgElement.alt = comic_data.alt;
    	const imageContainer = document.getElementById("comic-container");

    	imageContainer === null || imageContainer === void 0
    	? void 0
    	: imageContainer.appendChild(imgElement);

    	const titleText = document.createTextNode(comic_data.title);
    	const titleContainer = document.getElementById("title-container");

    	titleContainer === null || titleContainer === void 0
    	? void 0
    	: titleContainer.appendChild(titleText);

    	console.log(comic_data.year, comic_data.month, comic_data.day);
    	const publishDate = new Date(parseInt(comic_data.year), parseInt(comic_data.month) + 1, parseInt(comic_data.day));
    	const dateText = document.createTextNode(publishDate.toLocaleString());
    	const dateContainer = document.getElementById("date-container");

    	dateContainer === null || dateContainer === void 0
    	? void 0
    	: dateContainer.appendChild(dateText);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Comic', slots, []);
    	addComic();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Comic> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ addComic });
    	return [];
    }

    class Comic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Comic",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Icons.svelte generated by Svelte v3.56.0 */

    const file$2 = "src/Icons.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let a0;
    	let i0;
    	let t0;
    	let a1;
    	let i1;
    	let t1;
    	let a2;
    	let i2;
    	let t2;
    	let a3;
    	let i3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t1 = space();
    			a2 = element("a");
    			i2 = element("i");
    			t2 = space();
    			a3 = element("a");
    			i3 = element("i");
    			attr_dev(i0, "class", "fa-brands fa-github fa-lg svelte-1snq1uv");
    			add_location(i0, file$2, 2, 5, 84);
    			attr_dev(a0, "id", "gh-link");
    			attr_dev(a0, "href", "https://github.com/ali-salloum6");
    			add_location(a0, file$2, 1, 4, 24);
    			attr_dev(i1, "class", "fa-brands fa-linkedin fa-lg svelte-1snq1uv");
    			add_location(i1, file$2, 5, 5, 203);
    			attr_dev(a1, "id", "li-link");
    			attr_dev(a1, "href", "https://linkedin.com/in/ali-salloum");
    			add_location(a1, file$2, 4, 4, 139);
    			attr_dev(i2, "class", "fa-brands fa-telegram fa-lg svelte-1snq1uv");
    			add_location(i2, file$2, 8, 5, 311);
    			attr_dev(a2, "id", "tg-link");
    			attr_dev(a2, "href", "https://t.me/Salloum_A");
    			add_location(a2, file$2, 7, 4, 260);
    			attr_dev(i3, "class", "fa-solid fa-envelope fa-lg svelte-1snq1uv");
    			add_location(i3, file$2, 11, 5, 425);
    			attr_dev(a3, "id", "email");
    			attr_dev(a3, "href", "mailto:ali.e.salloum@gmail.com");
    			add_location(a3, file$2, 10, 4, 368);
    			attr_dev(div, "class", "icons");
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(a0, i0);
    			append_dev(div, t0);
    			append_dev(div, a1);
    			append_dev(a1, i1);
    			append_dev(div, t1);
    			append_dev(div, a2);
    			append_dev(a2, i2);
    			append_dev(div, t2);
    			append_dev(div, a3);
    			append_dev(a3, i3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icons', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icons> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Icons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icons",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/List.svelte generated by Svelte v3.56.0 */

    const file$1 = "src/List.svelte";

    function create_fragment$1(ctx) {
    	let ul;
    	let li0;
    	let t0;
    	let t1;
    	let li1;
    	let t2;
    	let t3;
    	let li2;
    	let t4;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			t0 = text(/*first*/ ctx[0]);
    			t1 = space();
    			li1 = element("li");
    			t2 = text(/*second*/ ctx[1]);
    			t3 = space();
    			li2 = element("li");
    			t4 = text(/*third*/ ctx[2]);
    			attr_dev(li0, "class", "svelte-1haxmpt");
    			add_location(li0, file$1, 6, 4, 93);
    			attr_dev(li1, "class", "svelte-1haxmpt");
    			add_location(li1, file$1, 7, 4, 114);
    			attr_dev(li2, "class", "svelte-1haxmpt");
    			add_location(li2, file$1, 8, 4, 136);
    			add_location(ul, file$1, 5, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*first*/ 1) set_data_dev(t0, /*first*/ ctx[0]);
    			if (dirty & /*second*/ 2) set_data_dev(t2, /*second*/ ctx[1]);
    			if (dirty & /*third*/ 4) set_data_dev(t4, /*third*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, []);
    	let { first } = $$props;
    	let { second } = $$props;
    	let { third } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (first === undefined && !('first' in $$props || $$self.$$.bound[$$self.$$.props['first']])) {
    			console.warn("<List> was created without expected prop 'first'");
    		}

    		if (second === undefined && !('second' in $$props || $$self.$$.bound[$$self.$$.props['second']])) {
    			console.warn("<List> was created without expected prop 'second'");
    		}

    		if (third === undefined && !('third' in $$props || $$self.$$.bound[$$self.$$.props['third']])) {
    			console.warn("<List> was created without expected prop 'third'");
    		}
    	});

    	const writable_props = ['first', 'second', 'third'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('first' in $$props) $$invalidate(0, first = $$props.first);
    		if ('second' in $$props) $$invalidate(1, second = $$props.second);
    		if ('third' in $$props) $$invalidate(2, third = $$props.third);
    	};

    	$$self.$capture_state = () => ({ first, second, third });

    	$$self.$inject_state = $$props => {
    		if ('first' in $$props) $$invalidate(0, first = $$props.first);
    		if ('second' in $$props) $$invalidate(1, second = $$props.second);
    		if ('third' in $$props) $$invalidate(2, third = $$props.third);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [first, second, third];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { first: 0, second: 1, third: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get first() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get second() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set second(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get third() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set third(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.56.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h10;
    	let t2;
    	let hr0;
    	let t3;
    	let p;
    	let t5;
    	let hr1;
    	let t6;
    	let h11;
    	let t8;
    	let list;
    	let t9;
    	let hr2;
    	let t10;
    	let icons;
    	let t11;
    	let hr3;
    	let t12;
    	let comic;
    	let current;

    	list = new List({
    			props: {
    				first: "HTML, CSS, JavaScript, TypeScript",
    				second: "Node.js, Express",
    				third: "Hardhat, Solidity"
    			},
    			$$inline: true
    		});

    	icons = new Icons({ $$inline: true });
    	comic = new Comic({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h10 = element("h1");
    			h10.textContent = "Ali Salloum";
    			t2 = space();
    			hr0 = element("hr");
    			t3 = space();
    			p = element("p");
    			p.textContent = "Hi! I'm a passionate blockchain developer constantly working on\n        expanding my skills";
    			t5 = space();
    			hr1 = element("hr");
    			t6 = space();
    			h11 = element("h1");
    			h11.textContent = "Skills:";
    			t8 = space();
    			create_component(list.$$.fragment);
    			t9 = space();
    			hr2 = element("hr");
    			t10 = space();
    			create_component(icons.$$.fragment);
    			t11 = space();
    			hr3 = element("hr");
    			t12 = space();
    			create_component(comic.$$.fragment);
    			attr_dev(img, "class", "personal-photo svelte-pfrhsl");
    			if (!src_url_equal(img.src, img_src_value = "personal-photo.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Personal photo");
    			add_location(img, file, 11, 8, 271);
    			attr_dev(div0, "class", "personal-photo-container svelte-pfrhsl");
    			add_location(div0, file, 9, 6, 170);
    			attr_dev(h10, "class", "name svelte-pfrhsl");
    			add_location(h10, file, 17, 6, 406);
    			attr_dev(hr0, "class", "separator svelte-pfrhsl");
    			add_location(hr0, file, 18, 6, 446);
    			attr_dev(p, "class", "desc svelte-pfrhsl");
    			add_location(p, file, 19, 6, 476);
    			attr_dev(hr1, "class", "separator svelte-pfrhsl");
    			add_location(hr1, file, 23, 6, 610);
    			attr_dev(h11, "class", "section svelte-pfrhsl");
    			add_location(h11, file, 24, 6, 640);
    			attr_dev(hr2, "class", "separator svelte-pfrhsl");
    			add_location(hr2, file, 30, 6, 821);
    			attr_dev(hr3, "class", "separator svelte-pfrhsl");
    			add_location(hr3, file, 32, 6, 866);
    			attr_dev(div1, "class", "container svelte-pfrhsl");
    			add_location(div1, file, 8, 1, 140);
    			add_location(main, file, 7, 0, 132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			append_dev(div1, h10);
    			append_dev(div1, t2);
    			append_dev(div1, hr0);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(div1, t5);
    			append_dev(div1, hr1);
    			append_dev(div1, t6);
    			append_dev(div1, h11);
    			append_dev(div1, t8);
    			mount_component(list, div1, null);
    			append_dev(div1, t9);
    			append_dev(div1, hr2);
    			append_dev(div1, t10);
    			mount_component(icons, div1, null);
    			append_dev(div1, t11);
    			append_dev(div1, hr3);
    			append_dev(div1, t12);
    			mount_component(comic, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			transition_in(icons.$$.fragment, local);
    			transition_in(comic.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			transition_out(icons.$$.fragment, local);
    			transition_out(comic.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(list);
    			destroy_component(icons);
    			destroy_component(comic);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Comic, Icons, List });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

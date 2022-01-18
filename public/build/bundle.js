
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
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
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
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
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
            ctx: null,
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src\componentes\Contatos.svelte generated by Svelte v3.44.3 */

    const file$6 = "src\\componentes\\Contatos.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let div13;
    	let section;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let br0;
    	let t4;
    	let div4;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let div0;
    	let p1;
    	let t7;
    	let br1;
    	let t8;
    	let a0;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let a1;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let a2;
    	let img3;
    	let img3_src_value;
    	let t11;
    	let div3;
    	let img4;
    	let img4_src_value;
    	let t12;
    	let div2;
    	let p2;
    	let t14;
    	let br2;
    	let t15;
    	let a3;
    	let img5;
    	let img5_src_value;
    	let t16;
    	let a4;
    	let img6;
    	let img6_src_value;
    	let t17;
    	let a5;
    	let img7;
    	let img7_src_value;
    	let t18;
    	let div9;
    	let div6;
    	let img8;
    	let img8_src_value;
    	let t19;
    	let div5;
    	let p3;
    	let t21;
    	let br3;
    	let t22;
    	let a6;
    	let img9;
    	let img9_src_value;
    	let t23;
    	let a7;
    	let img10;
    	let img10_src_value;
    	let t24;
    	let a8;
    	let img11;
    	let img11_src_value;
    	let t25;
    	let div8;
    	let img12;
    	let img12_src_value;
    	let t26;
    	let div7;
    	let p4;
    	let t28;
    	let br4;
    	let t29;
    	let a9;
    	let img13;
    	let img13_src_value;
    	let t30;
    	let a10;
    	let img14;
    	let img14_src_value;
    	let t31;
    	let a11;
    	let img15;
    	let img15_src_value;
    	let t32;
    	let div12;
    	let div11;
    	let img16;
    	let img16_src_value;
    	let t33;
    	let div10;
    	let p5;
    	let t35;
    	let br5;
    	let t36;
    	let a12;
    	let img17;
    	let img17_src_value;
    	let t37;
    	let a13;
    	let img18;
    	let img18_src_value;
    	let t38;
    	let a14;
    	let img19;
    	let img19_src_value;
    	let t39;
    	let t40;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div13 = element("div");
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Contatos";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Caso tenha dúvidas ou sugestões de melhorias sobre o jogo, pode escolher  qualquer um dos desenvolvedores abaixo, que responderemos o mais breve possível. Será um prazer entrar em contato com você!";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			div4 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t5 = space();
    			div0 = element("div");
    			p1 = element("p");
    			p1.textContent = "Amanda Gabriela da Silva Oliveira";
    			t7 = space();
    			br1 = element("br");
    			t8 = space();
    			a0 = element("a");
    			img1 = element("img");
    			t9 = space();
    			a1 = element("a");
    			img2 = element("img");
    			t10 = space();
    			a2 = element("a");
    			img3 = element("img");
    			t11 = space();
    			div3 = element("div");
    			img4 = element("img");
    			t12 = space();
    			div2 = element("div");
    			p2 = element("p");
    			p2.textContent = "Andrey Santana Mafra Guerra";
    			t14 = space();
    			br2 = element("br");
    			t15 = space();
    			a3 = element("a");
    			img5 = element("img");
    			t16 = space();
    			a4 = element("a");
    			img6 = element("img");
    			t17 = space();
    			a5 = element("a");
    			img7 = element("img");
    			t18 = space();
    			div9 = element("div");
    			div6 = element("div");
    			img8 = element("img");
    			t19 = space();
    			div5 = element("div");
    			p3 = element("p");
    			p3.textContent = "Bruno wilian Crispim da Silva";
    			t21 = space();
    			br3 = element("br");
    			t22 = space();
    			a6 = element("a");
    			img9 = element("img");
    			t23 = space();
    			a7 = element("a");
    			img10 = element("img");
    			t24 = space();
    			a8 = element("a");
    			img11 = element("img");
    			t25 = space();
    			div8 = element("div");
    			img12 = element("img");
    			t26 = space();
    			div7 = element("div");
    			p4 = element("p");
    			p4.textContent = "Daniele Saara dos Santos";
    			t28 = space();
    			br4 = element("br");
    			t29 = space();
    			a9 = element("a");
    			img13 = element("img");
    			t30 = space();
    			a10 = element("a");
    			img14 = element("img");
    			t31 = space();
    			a11 = element("a");
    			img15 = element("img");
    			t32 = space();
    			div12 = element("div");
    			div11 = element("div");
    			img16 = element("img");
    			t33 = space();
    			div10 = element("div");
    			p5 = element("p");
    			p5.textContent = "Flávio de Lima Santos";
    			t35 = space();
    			br5 = element("br");
    			t36 = space();
    			a12 = element("a");
    			img17 = element("img");
    			t37 = space();
    			a13 = element("a");
    			img18 = element("img");
    			t38 = space();
    			a14 = element("a");
    			img19 = element("img");
    			t39 = space();
    			t40 = text(">");
    			attr_dev(h1, "class", "svelte-1pouvhl");
    			add_location(h1, file$6, 4, 10, 57);
    			attr_dev(p0, "class", "texto svelte-1pouvhl");
    			add_location(p0, file$6, 5, 10, 86);
    			add_location(br0, file$6, 6, 10, 316);
    			add_location(section, file$6, 3, 8, 36);
    			attr_dev(img0, "class", "perfil svelte-1pouvhl");
    			if (!src_url_equal(img0.src, img0_src_value = "imagem/amanda.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$6, 12, 12, 505);
    			add_location(p1, file$6, 14, 14, 594);
    			add_location(br1, file$6, 15, 14, 650);
    			attr_dev(img1, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img1.src, img1_src_value = "imagem/linkedin.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Linkedin");
    			add_location(img1, file$6, 16, 79, 735);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/amanda-gabriela-a4a926200/");
    			add_location(a0, file$6, 16, 14, 670);
    			attr_dev(img2, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img2.src, img2_src_value = "imagem/instagram.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Instagram");
    			add_location(img2, file$6, 17, 68, 871);
    			attr_dev(a1, "href", "https://www.instagram.com/amandagabriela74/");
    			add_location(a1, file$6, 17, 14, 817);
    			attr_dev(img3, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img3.src, img3_src_value = "imagem/github.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Github");
    			add_location(img3, file$6, 18, 60, 1002);
    			attr_dev(a2, "href", "https://github.com/amandagabriela74");
    			add_location(a2, file$6, 18, 14, 956);
    			add_location(div0, file$6, 13, 12, 573);
    			attr_dev(div1, "class", "bloco svelte-1pouvhl");
    			add_location(div1, file$6, 11, 10, 472);
    			attr_dev(img4, "class", "perfil svelte-1pouvhl");
    			if (!src_url_equal(img4.src, img4_src_value = "imagem/andry.jpeg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$6, 23, 12, 1193);
    			add_location(p2, file$6, 25, 14, 1281);
    			add_location(br2, file$6, 26, 14, 1331);
    			attr_dev(img5, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img5.src, img5_src_value = "imagem/linkedin.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Linkedin");
    			add_location(img5, file$6, 27, 76, 1413);
    			attr_dev(a3, "href", "https://www.linkedin.com/in/andrey-mafra-aa4478214/");
    			add_location(a3, file$6, 27, 14, 1351);
    			attr_dev(img6, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img6.src, img6_src_value = "imagem/instagram.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Instagram");
    			add_location(img6, file$6, 28, 65, 1546);
    			attr_dev(a4, "href", "https://www.instagram.com/andrey_mafra5/");
    			add_location(a4, file$6, 28, 14, 1495);
    			attr_dev(img7, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img7.src, img7_src_value = "imagem/github.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Github");
    			add_location(img7, file$6, 29, 56, 1672);
    			attr_dev(a5, "href", "https://github.com/andreymafra5");
    			add_location(a5, file$6, 29, 14, 1630);
    			add_location(div2, file$6, 24, 12, 1260);
    			attr_dev(div3, "class", "bloco svelte-1pouvhl");
    			add_location(div3, file$6, 22, 10, 1160);
    			attr_dev(div4, "class", "coluna svelte-1pouvhl");
    			add_location(div4, file$6, 9, 8, 394);
    			attr_dev(img8, "class", "perfil svelte-1pouvhl");
    			if (!src_url_equal(img8.src, img8_src_value = "imagem/bruno.jpeg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$6, 37, 12, 1951);
    			add_location(p3, file$6, 39, 14, 2039);
    			add_location(br3, file$6, 40, 14, 2091);
    			attr_dev(img9, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img9.src, img9_src_value = "imagem/linkedin.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "");
    			add_location(img9, file$6, 41, 76, 2173);
    			attr_dev(a6, "href", "https://www.linkedin.com/in/bruno-wilian-317066192/");
    			add_location(a6, file$6, 41, 14, 2111);
    			attr_dev(img10, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img10.src, img10_src_value = "imagem/instagram.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Instagram");
    			add_location(img10, file$6, 42, 65, 2298);
    			attr_dev(a7, "href", "https://www.instagram.com/bruno_.wilian/");
    			add_location(a7, file$6, 42, 14, 2247);
    			attr_dev(img11, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img11.src, img11_src_value = "imagem/Github.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Github");
    			add_location(img11, file$6, 43, 55, 2425);
    			attr_dev(a8, "href", "https://github.com/brunowilian");
    			add_location(a8, file$6, 43, 14, 2384);
    			add_location(div5, file$6, 38, 12, 2018);
    			attr_dev(div6, "class", "bloco svelte-1pouvhl");
    			add_location(div6, file$6, 36, 10, 1918);
    			attr_dev(img12, "class", "perfil svelte-1pouvhl");
    			if (!src_url_equal(img12.src, img12_src_value = "imagem/saara.jpeg")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "");
    			add_location(img12, file$6, 48, 12, 2619);
    			add_location(p4, file$6, 50, 14, 2707);
    			add_location(br4, file$6, 51, 14, 2754);
    			attr_dev(img13, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img13.src, img13_src_value = "imagem/linkedin.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "");
    			add_location(img13, file$6, 52, 26, 2786);
    			attr_dev(a9, "href", " ");
    			add_location(a9, file$6, 52, 14, 2774);
    			attr_dev(img14, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img14.src, img14_src_value = "imagem/instagram.png")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "alt", "");
    			add_location(img14, file$6, 53, 66, 2913);
    			attr_dev(a10, "href", "https://www.instagram.com/daniele.saara");
    			add_location(a10, file$6, 53, 16, 2863);
    			attr_dev(img15, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img15.src, img15_src_value = "imagem/github.png")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "alt", "");
    			add_location(img15, file$6, 54, 60, 3035);
    			attr_dev(a11, "href", "https://github.com/danielesaara");
    			add_location(a11, file$6, 54, 18, 2993);
    			add_location(div7, file$6, 49, 12, 2686);
    			attr_dev(div8, "class", "bloco svelte-1pouvhl");
    			add_location(div8, file$6, 46, 10, 2539);
    			attr_dev(div9, "class", "coluna svelte-1pouvhl");
    			add_location(div9, file$6, 34, 8, 1841);
    			attr_dev(img16, "class", "perfil svelte-1pouvhl");
    			if (!src_url_equal(img16.src, img16_src_value = "imagem/flavio.jpeg")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "alt", "");
    			add_location(img16, file$6, 62, 12, 3311);
    			add_location(p5, file$6, 64, 14, 3400);
    			add_location(br5, file$6, 65, 14, 3444);
    			attr_dev(img17, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img17.src, img17_src_value = "imagem/linkedin.png")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "alt", "");
    			add_location(img17, file$6, 66, 27, 3477);
    			attr_dev(a12, "href", " ");
    			add_location(a12, file$6, 66, 14, 3464);
    			attr_dev(img18, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img18.src, img18_src_value = "imagem/instagram.png")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "alt", "");
    			add_location(img18, file$6, 67, 66, 3603);
    			attr_dev(a13, "href", "https://www.instagram.com/flaviolima_23");
    			add_location(a13, file$6, 67, 16, 3553);
    			attr_dev(img19, "class", "imagem svelte-1pouvhl");
    			if (!src_url_equal(img19.src, img19_src_value = "imagem/github.png")) attr_dev(img19, "src", img19_src_value);
    			attr_dev(img19, "alt", "");
    			add_location(img19, file$6, 68, 61, 3725);
    			attr_dev(a14, "href", "https://github.com/Flaviolima719");
    			add_location(a14, file$6, 68, 18, 3682);
    			add_location(div10, file$6, 63, 12, 3379);
    			attr_dev(div11, "class", "bloco svelte-1pouvhl");
    			add_location(div11, file$6, 61, 10, 3278);
    			attr_dev(div12, "class", "coluna svelte-1pouvhl");
    			add_location(div12, file$6, 59, 8, 3201);
    			add_location(div13, file$6, 2, 6, 21);
    			attr_dev(main, "class", "svelte-1pouvhl");
    			add_location(main, file$6, 1, 5, 7);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div13);
    			append_dev(div13, section);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, p0);
    			append_dev(section, t3);
    			append_dev(section, br0);
    			append_dev(div13, t4);
    			append_dev(div13, div4);
    			append_dev(div4, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(div0, t7);
    			append_dev(div0, br1);
    			append_dev(div0, t8);
    			append_dev(div0, a0);
    			append_dev(a0, img1);
    			append_dev(div0, t9);
    			append_dev(div0, a1);
    			append_dev(a1, img2);
    			append_dev(div0, t10);
    			append_dev(div0, a2);
    			append_dev(a2, img3);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, img4);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, p2);
    			append_dev(div2, t14);
    			append_dev(div2, br2);
    			append_dev(div2, t15);
    			append_dev(div2, a3);
    			append_dev(a3, img5);
    			append_dev(div2, t16);
    			append_dev(div2, a4);
    			append_dev(a4, img6);
    			append_dev(div2, t17);
    			append_dev(div2, a5);
    			append_dev(a5, img7);
    			append_dev(div13, t18);
    			append_dev(div13, div9);
    			append_dev(div9, div6);
    			append_dev(div6, img8);
    			append_dev(div6, t19);
    			append_dev(div6, div5);
    			append_dev(div5, p3);
    			append_dev(div5, t21);
    			append_dev(div5, br3);
    			append_dev(div5, t22);
    			append_dev(div5, a6);
    			append_dev(a6, img9);
    			append_dev(div5, t23);
    			append_dev(div5, a7);
    			append_dev(a7, img10);
    			append_dev(div5, t24);
    			append_dev(div5, a8);
    			append_dev(a8, img11);
    			append_dev(div9, t25);
    			append_dev(div9, div8);
    			append_dev(div8, img12);
    			append_dev(div8, t26);
    			append_dev(div8, div7);
    			append_dev(div7, p4);
    			append_dev(div7, t28);
    			append_dev(div7, br4);
    			append_dev(div7, t29);
    			append_dev(div7, a9);
    			append_dev(a9, img13);
    			append_dev(div7, t30);
    			append_dev(div7, a10);
    			append_dev(a10, img14);
    			append_dev(div7, t31);
    			append_dev(div7, a11);
    			append_dev(a11, img15);
    			append_dev(div13, t32);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, img16);
    			append_dev(div11, t33);
    			append_dev(div11, div10);
    			append_dev(div10, p5);
    			append_dev(div10, t35);
    			append_dev(div10, br5);
    			append_dev(div10, t36);
    			append_dev(div10, a12);
    			append_dev(a12, img17);
    			append_dev(div10, t37);
    			append_dev(div10, a13);
    			append_dev(a13, img18);
    			append_dev(div10, t38);
    			append_dev(div10, a14);
    			append_dev(a14, img19);
    			append_dev(main, t39);
    			insert_dev(target, t40, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t40);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contatos', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contatos> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contatos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contatos",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\componentes\Botao.svelte generated by Svelte v3.44.3 */

    const file$5 = "src\\componentes\\Botao.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let t_value = (/*value*/ ctx[0] || "") + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "botao svelte-oixyly");
    			add_location(button, file$5, 5, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*handleClick*/ ctx[1])) /*handleClick*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*value*/ 1 && t_value !== (t_value = (/*value*/ ctx[0] || "") + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Botao', slots, []);
    	let { value } = $$props;
    	let { handleClick } = $$props;
    	const writable_props = ['value', 'handleClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Botao> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('handleClick' in $$props) $$invalidate(1, handleClick = $$props.handleClick);
    	};

    	$$self.$capture_state = () => ({ value, handleClick });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('handleClick' in $$props) $$invalidate(1, handleClick = $$props.handleClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, handleClick];
    }

    class Botao extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 0, handleClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Botao",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Botao> was created without expected prop 'value'");
    		}

    		if (/*handleClick*/ ctx[1] === undefined && !('handleClick' in props)) {
    			console.warn("<Botao> was created without expected prop 'handleClick'");
    		}
    	}

    	get value() {
    		throw new Error("<Botao>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Botao>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClick() {
    		throw new Error("<Botao>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClick(value) {
    		throw new Error("<Botao>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\componentes\Sobre.svelte generated by Svelte v3.44.3 */

    const file$4 = "src\\componentes\\Sobre.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let header;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let p0;
    	let strong0;
    	let t2;
    	let p1;
    	let strong1;
    	let t4;
    	let t5;
    	let p2;
    	let strong2;
    	let t7;
    	let t8;
    	let p3;
    	let strong3;
    	let t10;
    	let t11;
    	let div1;
    	let section;
    	let br0;
    	let br1;
    	let t12;
    	let h1;
    	let t14;
    	let br2;
    	let br3;
    	let t15;
    	let h30;
    	let t17;
    	let br4;
    	let t18;
    	let p4;
    	let t20;
    	let br5;
    	let t21;
    	let h31;
    	let t23;
    	let br6;
    	let t24;
    	let p5;

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Instituto Federal de Educação, Ciência e Tecnologia - IFPE";
    			t2 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Cursos:";
    			t4 = text(" Informática para Internet (IPI) / Sistemas para Internet (TSI)");
    			t5 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Componentes:";
    			t7 = text(" Lógica de Programação e Estrutura de Dados | Programação Imperativa");
    			t8 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Alunos:";
    			t10 = text("  Amanda Gabriela, Andrey Santana, Bruno Wilian, Daniele Saara e Flávio de Lima.");
    			t11 = space();
    			div1 = element("div");
    			section = element("section");
    			br0 = element("br");
    			br1 = element("br");
    			t12 = space();
    			h1 = element("h1");
    			h1.textContent = "Sobre";
    			t14 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t15 = space();
    			h30 = element("h3");
    			h30.textContent = "1. Sobre o Projeto:";
    			t17 = space();
    			br4 = element("br");
    			t18 = space();
    			p4 = element("p");
    			p4.textContent = "Jogo desenvolvido por estudantes do Instituto Federal de Pernambuco - Campus Igarassu, utilizando recursos do compilador front-end Svelte para construir componentes através das linguagens JavaScript (Programação), HTML (Marcação de HiperTexto) e CSS (Estilo).";
    			t20 = space();
    			br5 = element("br");
    			t21 = space();
    			h31 = element("h3");
    			h31.textContent = "2. Sobre o Jogo:";
    			t23 = space();
    			br6 = element("br");
    			t24 = space();
    			p5 = element("p");
    			p5.textContent = "O jogo da velha é um jogo de regras extremamente simples, que é facilmente aprendido pelos seus jogadores e tem como objetivo fazer uma sequência de três símbolos iguais, seja em linha vertical, horizontal ou diagonal, enquanto tenta prever o movimento do adversário. Além disso, é uma boa oportunidade para estimular o raciocínio lógico, aprender a formar sequência e a ter paciência.";
    			attr_dev(img, "class", "cabecalho-imagem svelte-1jegwlx");
    			if (!src_url_equal(img.src, img_src_value = "imagem/ifpe.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo do IFPE");
    			add_location(img, file$4, 3, 8, 54);
    			attr_dev(strong0, "class", "svelte-1jegwlx");
    			add_location(strong0, file$4, 5, 40, 205);
    			attr_dev(p0, "class", "cabecalho-ifpe-a svelte-1jegwlx");
    			add_location(p0, file$4, 5, 12, 177);
    			attr_dev(strong1, "class", "svelte-1jegwlx");
    			add_location(strong1, file$4, 6, 40, 328);
    			attr_dev(p1, "class", "cabecalho-ifpe-a svelte-1jegwlx");
    			add_location(p1, file$4, 6, 12, 300);
    			attr_dev(strong2, "class", "svelte-1jegwlx");
    			add_location(strong2, file$4, 7, 40, 461);
    			attr_dev(p2, "class", "cabecalho-ifpe-a svelte-1jegwlx");
    			add_location(p2, file$4, 7, 12, 433);
    			attr_dev(strong3, "class", "svelte-1jegwlx");
    			add_location(strong3, file$4, 8, 40, 604);
    			attr_dev(p3, "class", "cabecalho-ifpe-a svelte-1jegwlx");
    			add_location(p3, file$4, 8, 12, 576);
    			attr_dev(div0, "class", "cabecalho-ifpe svelte-1jegwlx");
    			add_location(div0, file$4, 4, 8, 135);
    			attr_dev(header, "class", "cabecalho svelte-1jegwlx");
    			add_location(header, file$4, 2, 4, 18);
    			attr_dev(br0, "class", "svelte-1jegwlx");
    			add_location(br0, file$4, 14, 12, 833);
    			attr_dev(br1, "class", "svelte-1jegwlx");
    			add_location(br1, file$4, 14, 16, 837);
    			attr_dev(h1, "class", "conteudo-principal-titulo svelte-1jegwlx");
    			add_location(h1, file$4, 15, 12, 855);
    			attr_dev(br2, "class", "svelte-1jegwlx");
    			add_location(br2, file$4, 16, 12, 917);
    			attr_dev(br3, "class", "svelte-1jegwlx");
    			add_location(br3, file$4, 16, 16, 921);
    			attr_dev(h30, "class", "conteudo-principal-subtitulo svelte-1jegwlx");
    			add_location(h30, file$4, 17, 12, 939);
    			attr_dev(br4, "class", "svelte-1jegwlx");
    			add_location(br4, file$4, 18, 12, 1018);
    			attr_dev(p4, "class", "conteudo-principal-paragrafo svelte-1jegwlx");
    			add_location(p4, file$4, 19, 12, 1036);
    			attr_dev(br5, "class", "svelte-1jegwlx");
    			add_location(br5, file$4, 20, 12, 1353);
    			attr_dev(h31, "class", "conteudo-principal-subtitulo svelte-1jegwlx");
    			add_location(h31, file$4, 21, 12, 1371);
    			attr_dev(br6, "class", "svelte-1jegwlx");
    			add_location(br6, file$4, 22, 12, 1447);
    			attr_dev(p5, "class", "conteudo-principal-paragrafo svelte-1jegwlx");
    			add_location(p5, file$4, 23, 12, 1465);
    			attr_dev(section, "class", "conteudo-principal svelte-1jegwlx");
    			add_location(section, file$4, 13, 8, 783);
    			attr_dev(div1, "class", "conteudo svelte-1jegwlx");
    			add_location(div1, file$4, 12, 4, 751);
    			attr_dev(main, "class", "svelte-1jegwlx");
    			add_location(main, file$4, 1, 4, 6);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, img);
    			append_dev(header, t0);
    			append_dev(header, div0);
    			append_dev(div0, p0);
    			append_dev(p0, strong0);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, strong1);
    			append_dev(p1, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(p2, strong2);
    			append_dev(p2, t7);
    			append_dev(div0, t8);
    			append_dev(div0, p3);
    			append_dev(p3, strong3);
    			append_dev(p3, t10);
    			append_dev(main, t11);
    			append_dev(main, div1);
    			append_dev(div1, section);
    			append_dev(section, br0);
    			append_dev(section, br1);
    			append_dev(section, t12);
    			append_dev(section, h1);
    			append_dev(section, t14);
    			append_dev(section, br2);
    			append_dev(section, br3);
    			append_dev(section, t15);
    			append_dev(section, h30);
    			append_dev(section, t17);
    			append_dev(section, br4);
    			append_dev(section, t18);
    			append_dev(section, p4);
    			append_dev(section, t20);
    			append_dev(section, br5);
    			append_dev(section, t21);
    			append_dev(section, h31);
    			append_dev(section, t23);
    			append_dev(section, br6);
    			append_dev(section, t24);
    			append_dev(section, p5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sobre', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sobre> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Sobre extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sobre",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\componentes\Ajuda.svelte generated by Svelte v3.44.3 */

    const file$3 = "src\\componentes\\Ajuda.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let section;
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let h30;
    	let t5;
    	let p0;
    	let t7;
    	let h31;
    	let t9;
    	let p1;
    	let t11;
    	let h32;
    	let t13;
    	let p2;

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Suporte";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "Encontre aqui suas dúvidas sobre o Jogo da Velha:";
    			t3 = space();
    			h30 = element("h3");
    			h30.textContent = "1. Como jogar:";
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "O jogo da velha é uma brincadeira antiga, clássica e simples — que só precisa de duas pessoas para o jogo começar. Ele é um jogo de \"soma zero\", ou seja, duas pessoas igualmente habilidosas nunca conseguem derrotar uma à outra. No entanto, se você seguir as dicas e estratégias, vai ter muito mais chances de ser vitorioso nas partidas.";
    			t7 = space();
    			h31 = element("h3");
    			h31.textContent = "2. Objetivo do jogo:";
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "O principal objetivo do jogo da velha é fazer uma sequência de três símbolos iguais, seja em linha vertical, horizontal ou diagonal, enquanto tenta prever o movimento do adversário. Sendo uma boa oportunidade para estimular o raciocínio lógico, aprender a formar sequência e a ter paciência.";
    			t11 = space();
    			h32 = element("h3");
    			h32.textContent = "3. Melhor estratégia para jogar:";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Marque um dos cantos e, dependendo do que seu oponente fizer, marque outro canto, e você estará com a vitória nas mãos. Por exemplo, se você faz o X no canto inferior esquerdo, e ele coloca o O no canto inferior direito, você deve responder com um X no canto superior esquerdo.";
    			attr_dev(h1, "class", "svelte-1clgtnq");
    			add_location(h1, file$3, 8, 2, 72);
    			attr_dev(h2, "class", "svelte-1clgtnq");
    			add_location(h2, file$3, 10, 3, 95);
    			attr_dev(h30, "class", "svelte-1clgtnq");
    			add_location(h30, file$3, 12, 3, 160);
    			attr_dev(p0, "class", "svelte-1clgtnq");
    			add_location(p0, file$3, 13, 3, 188);
    			attr_dev(h31, "class", "svelte-1clgtnq");
    			add_location(h31, file$3, 15, 3, 538);
    			attr_dev(p1, "class", "svelte-1clgtnq");
    			add_location(p1, file$3, 16, 3, 573);
    			attr_dev(h32, "class", "svelte-1clgtnq");
    			add_location(h32, file$3, 18, 3, 878);
    			attr_dev(p2, "class", "svelte-1clgtnq");
    			add_location(p2, file$3, 19, 3, 925);
    			attr_dev(section, "class", "conteudo svelte-1clgtnq");
    			add_location(section, file$3, 7, 2, 42);
    			attr_dev(main, "class", "svelte-1clgtnq");
    			add_location(main, file$3, 6, 1, 31);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, h2);
    			append_dev(section, t3);
    			append_dev(section, h30);
    			append_dev(section, t5);
    			append_dev(section, p0);
    			append_dev(section, t7);
    			append_dev(section, h31);
    			append_dev(section, t9);
    			append_dev(section, p1);
    			append_dev(section, t11);
    			append_dev(section, h32);
    			append_dev(section, t13);
    			append_dev(section, p2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ajuda', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ajuda> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Ajuda extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ajuda",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\componentes\Jogo-da-velha9.svelte generated by Svelte v3.44.3 */

    const file$2 = "src\\componentes\\Jogo-da-velha9.svelte";

    // (67:6) {:else}
    function create_else_block$1(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*status*/ ctx[4]);
    			attr_dev(h3, "class", "status svelte-14tsag6");
    			add_location(h3, file$2, 67, 8, 1882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*status*/ 16) set_data_dev(t, /*status*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(67:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:8) {#if ganhou}
    function create_if_block_1$2(ctx) {
    	let p;
    	let t1;
    	let h3;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${/*placar*/ ctx[7]()}`;
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(/*ganhou*/ ctx[2]);
    			attr_dev(p, "class", "fun_placar svelte-14tsag6");
    			add_location(p, file$2, 64, 8, 1779);
    			attr_dev(h3, "class", "ganhou svelte-14tsag6");
    			add_location(h3, file$2, 65, 8, 1825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ganhou*/ 4) set_data_dev(t2, /*ganhou*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(64:8) {#if ganhou}",
    		ctx
    	});

    	return block;
    }

    // (93:8) {#if ganhou}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Reiniciar jogo";
    			attr_dev(button, "class", "reiniciar svelte-14tsag6");
    			add_location(button, file$2, 93, 8, 2926);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetar*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(93:8) {#if ganhou}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div0;
    	let span0;
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3;
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let section;
    	let div2;
    	let button0;
    	let t7_value = /*botoes*/ ctx[3][0] + "";
    	let t7;
    	let t8;
    	let button1;
    	let t9_value = /*botoes*/ ctx[3][1] + "";
    	let t9;
    	let t10;
    	let button2;
    	let t11_value = /*botoes*/ ctx[3][2] + "";
    	let t11;
    	let t12;
    	let div3;
    	let button3;
    	let t13_value = /*botoes*/ ctx[3][3] + "";
    	let t13;
    	let t14;
    	let button4;
    	let t15_value = /*botoes*/ ctx[3][4] + "";
    	let t15;
    	let t16;
    	let button5;
    	let t17_value = /*botoes*/ ctx[3][5] + "";
    	let t17;
    	let t18;
    	let div4;
    	let button6;
    	let t19_value = /*botoes*/ ctx[3][6] + "";
    	let t19;
    	let t20;
    	let button7;
    	let t21_value = /*botoes*/ ctx[3][7] + "";
    	let t21;
    	let t22;
    	let button8;
    	let t23_value = /*botoes*/ ctx[3][8] + "";
    	let t23;
    	let t24;
    	let div5;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*ganhou*/ ctx[2]) return create_if_block_1$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*ganhou*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text("JØ₲₳ĐØⱤ Ӿ : ");
    			t1 = text(/*play1*/ ctx[1]);
    			t2 = space();
    			span1 = element("span");
    			t3 = text("JØ₲₳ĐØⱤ Ø : ");
    			t4 = text(/*play2*/ ctx[0]);
    			t5 = space();
    			div1 = element("div");
    			if_block0.c();
    			t6 = space();
    			section = element("section");
    			div2 = element("div");
    			button0 = element("button");
    			t7 = text(t7_value);
    			t8 = space();
    			button1 = element("button");
    			t9 = text(t9_value);
    			t10 = space();
    			button2 = element("button");
    			t11 = text(t11_value);
    			t12 = space();
    			div3 = element("div");
    			button3 = element("button");
    			t13 = text(t13_value);
    			t14 = space();
    			button4 = element("button");
    			t15 = text(t15_value);
    			t16 = space();
    			button5 = element("button");
    			t17 = text(t17_value);
    			t18 = space();
    			div4 = element("div");
    			button6 = element("button");
    			t19 = text(t19_value);
    			t20 = space();
    			button7 = element("button");
    			t21 = text(t21_value);
    			t22 = space();
    			button8 = element("button");
    			t23 = text(t23_value);
    			t24 = space();
    			div5 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(span0, "class", "play1 svelte-14tsag6");
    			add_location(span0, file$2, 59, 6, 1626);
    			attr_dev(span1, "class", "play2 svelte-14tsag6");
    			add_location(span1, file$2, 60, 4, 1678);
    			attr_dev(div0, "class", "placar svelte-14tsag6");
    			add_location(div0, file$2, 58, 2, 1598);
    			add_location(div1, file$2, 62, 6, 1742);
    			attr_dev(button0, "id", "0");
    			attr_dev(button0, "class", "quadrado svelte-14tsag6");
    			add_location(button0, file$2, 73, 8, 2015);
    			attr_dev(button1, "id", "1");
    			attr_dev(button1, "class", "quadrado svelte-14tsag6");
    			add_location(button1, file$2, 74, 8, 2102);
    			attr_dev(button2, "id", "2");
    			attr_dev(button2, "class", "quadrado svelte-14tsag6");
    			add_location(button2, file$2, 75, 8, 2188);
    			attr_dev(div2, "class", "mudacorl");
    			add_location(div2, file$2, 72, 6, 1983);
    			attr_dev(button3, "id", "3");
    			attr_dev(button3, "class", "quadrado svelte-14tsag6");
    			add_location(button3, file$2, 79, 8, 2307);
    			attr_dev(button4, "id", "4");
    			attr_dev(button4, "class", "quadrado svelte-14tsag6");
    			add_location(button4, file$2, 80, 8, 2394);
    			attr_dev(button5, "id", "5");
    			attr_dev(button5, "class", "quadrado svelte-14tsag6");
    			add_location(button5, file$2, 81, 8, 2480);
    			add_location(div3, file$2, 78, 6, 2292);
    			attr_dev(button6, "id", "6");
    			attr_dev(button6, "class", "quadrado svelte-14tsag6");
    			add_location(button6, file$2, 85, 8, 2599);
    			attr_dev(button7, "id", "7");
    			attr_dev(button7, "class", "quadrado svelte-14tsag6");
    			add_location(button7, file$2, 86, 8, 2686);
    			attr_dev(button8, "id", "8");
    			attr_dev(button8, "class", "quadrado svelte-14tsag6");
    			add_location(button8, file$2, 87, 8, 2772);
    			add_location(div4, file$2, 84, 6, 2584);
    			attr_dev(section, "class", "botoes svelte-14tsag6");
    			add_location(section, file$2, 71, 6, 1951);
    			add_location(div5, file$2, 91, 6, 2888);
    			attr_dev(main, "class", "svelte-14tsag6");
    			add_location(main, file$2, 57, 2, 1588);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(main, t5);
    			append_dev(main, div1);
    			if_block0.m(div1, null);
    			append_dev(main, t6);
    			append_dev(main, section);
    			append_dev(section, div2);
    			append_dev(div2, button0);
    			append_dev(button0, t7);
    			append_dev(div2, t8);
    			append_dev(div2, button1);
    			append_dev(button1, t9);
    			append_dev(div2, t10);
    			append_dev(div2, button2);
    			append_dev(button2, t11);
    			append_dev(section, t12);
    			append_dev(section, div3);
    			append_dev(div3, button3);
    			append_dev(button3, t13);
    			append_dev(div3, t14);
    			append_dev(div3, button4);
    			append_dev(button4, t15);
    			append_dev(div3, t16);
    			append_dev(div3, button5);
    			append_dev(button5, t17);
    			append_dev(section, t18);
    			append_dev(section, div4);
    			append_dev(div4, button6);
    			append_dev(button6, t19);
    			append_dev(div4, t20);
    			append_dev(div4, button7);
    			append_dev(button7, t21);
    			append_dev(div4, t22);
    			append_dev(div4, button8);
    			append_dev(button8, t23);
    			append_dev(main, t24);
    			append_dev(main, div5);
    			if (if_block1) if_block1.m(div5, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button3, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button4, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button5, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button6, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button7, "click", /*handleClick*/ ctx[6], false, false, false),
    					listen_dev(button8, "click", /*handleClick*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*play1*/ 2) set_data_dev(t1, /*play1*/ ctx[1]);
    			if (dirty & /*play2*/ 1) set_data_dev(t4, /*play2*/ ctx[0]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			}

    			if (dirty & /*botoes*/ 8 && t7_value !== (t7_value = /*botoes*/ ctx[3][0] + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*botoes*/ 8 && t9_value !== (t9_value = /*botoes*/ ctx[3][1] + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*botoes*/ 8 && t11_value !== (t11_value = /*botoes*/ ctx[3][2] + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*botoes*/ 8 && t13_value !== (t13_value = /*botoes*/ ctx[3][3] + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*botoes*/ 8 && t15_value !== (t15_value = /*botoes*/ ctx[3][4] + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*botoes*/ 8 && t17_value !== (t17_value = /*botoes*/ ctx[3][5] + "")) set_data_dev(t17, t17_value);
    			if (dirty & /*botoes*/ 8 && t19_value !== (t19_value = /*botoes*/ ctx[3][6] + "")) set_data_dev(t19, t19_value);
    			if (dirty & /*botoes*/ 8 && t21_value !== (t21_value = /*botoes*/ ctx[3][7] + "")) set_data_dev(t21, t21_value);
    			if (dirty & /*botoes*/ 8 && t23_value !== (t23_value = /*botoes*/ ctx[3][8] + "")) set_data_dev(t23, t23_value);

    			if (/*ganhou*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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

    function calcularGanhador$1(botoes) {
    	const verificarCasas = [
    		// Codigos para verificaçao para os lados
    		[0, 1, 2],
    		[3, 4, 5],
    		[6, 7, 8],
    		// Codigos para verificaçao para cima e para baixo
    		[0, 3, 6],
    		[1, 4, 7],
    		[2, 5, 8],
    		//Codigos para verificaçao na horizontal 
    		[0, 4, 8],
    		[2, 4, 6]
    	];

    	// Codigo para verificar o array
    	for (let i = 0; i < verificarCasas.length; i++) {
    		const [a, b, c] = verificarCasas[i];

    		if (botoes[a] && botoes[a] === botoes[b] && botoes[a] === botoes[c]) {
    			return `Ganhou: ${botoes[a]}`;
    		}
    	}

    	const empate = botoes.every(Array => Array !== "");
    	return empate ? "O jogo foi empade" : "";
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let status;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Jogo_da_velha9', slots, []);
    	let play2 = 0;
    	let play1 = 0;
    	let ganhou = null;
    	let botoes = Array(9).fill("");
    	let jogador = true;

    	function resetar() {
    		$$invalidate(3, botoes = Array(9).fill(""));
    		$$invalidate(2, ganhou = null);
    		$$invalidate(8, jogador = true);
    	}

    	function handleClick() {
    		// usando o this.id 
    		if (!botoes[this.id]) {
    			$$invalidate(3, botoes[this.id] = jogador ? "X" : "O", botoes);
    			$$invalidate(8, jogador = !jogador);
    			$$invalidate(2, ganhou = calcularGanhador$1(botoes));
    		}
    	}

    	function placar() {
    		if (ganhou == "Ganhou: X") {
    			$$invalidate(1, play1++, play1);
    		} else if (ganhou == "Ganhou: O") {
    			$$invalidate(0, play2++, play2);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Jogo_da_velha9> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		play2,
    		play1,
    		ganhou,
    		botoes,
    		jogador,
    		resetar,
    		handleClick,
    		calcularGanhador: calcularGanhador$1,
    		placar,
    		status
    	});

    	$$self.$inject_state = $$props => {
    		if ('play2' in $$props) $$invalidate(0, play2 = $$props.play2);
    		if ('play1' in $$props) $$invalidate(1, play1 = $$props.play1);
    		if ('ganhou' in $$props) $$invalidate(2, ganhou = $$props.ganhou);
    		if ('botoes' in $$props) $$invalidate(3, botoes = $$props.botoes);
    		if ('jogador' in $$props) $$invalidate(8, jogador = $$props.jogador);
    		if ('status' in $$props) $$invalidate(4, status = $$props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*jogador*/ 256) {
    			$$invalidate(4, status = "Proximo jogador: " + (jogador ? "X" : "O"));
    		}
    	};

    	return [play2, play1, ganhou, botoes, status, resetar, handleClick, placar, jogador];
    }

    class Jogo_da_velha9 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jogo_da_velha9",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\componentes\Jogo-da-velha.svelte generated by Svelte v3.44.3 */
    const file$1 = "src\\componentes\\Jogo-da-velha.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (80:2) {:else}
    function create_else_block(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*status*/ ctx[4]);
    			attr_dev(h3, "class", "status svelte-97h4hc");
    			add_location(h3, file$1, 80, 4, 2155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*status*/ 16) set_data_dev(t, /*status*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(80:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:2) {#if ganhou}
    function create_if_block_1$1(ctx) {
    	let p;
    	let t1;
    	let h3;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${/*placar*/ ctx[7]()}`;
    			t1 = space();
    			h3 = element("h3");
    			t2 = text(/*ganhou*/ ctx[0]);
    			attr_dev(p, "class", "fun_placar svelte-97h4hc");
    			add_location(p, file$1, 77, 4, 2079);
    			attr_dev(h3, "class", "svelte-97h4hc");
    			add_location(h3, file$1, 78, 4, 2121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ganhou*/ 1) set_data_dev(t2, /*ganhou*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(77:2) {#if ganhou}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#each botoes as botao, i}
    function create_each_block(ctx) {
    	let botao;
    	let current;

    	function func() {
    		return /*func*/ ctx[9](/*i*/ ctx[12]);
    	}

    	botao = new Botao({
    			props: {
    				value: /*botao*/ ctx[10],
    				handleClick: func
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(botao.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(botao, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const botao_changes = {};
    			if (dirty & /*botoes*/ 8) botao_changes.value = /*botao*/ ctx[10];
    			botao.$set(botao_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(botao.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(botao.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(botao, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(84:4) {#each botoes as botao, i}",
    		ctx
    	});

    	return block;
    }

    // (88:6) {#if ganhou}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Reiniciar Jogo";
    			attr_dev(button, "class", "botaoreiniciar svelte-97h4hc");
    			add_location(button, file$1, 88, 8, 2378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetar*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(88:6) {#if ganhou}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let div0;
    	let span0;
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let div2;
    	let t7;
    	let div1;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*ganhou*/ ctx[0]) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let each_value = /*botoes*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block1 = /*ganhou*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text("JØ₲₳ĐØⱤ Ӿ : ");
    			t1 = text(/*play1*/ ctx[2]);
    			t2 = space();
    			span1 = element("span");
    			t3 = text("JØ₲₳ĐØⱤ Ø : ");
    			t4 = text(/*play2*/ ctx[1]);
    			t5 = space();
    			if_block0.c();
    			t6 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(span0, "class", "play1 svelte-97h4hc");
    			add_location(span0, file$1, 73, 4, 1949);
    			attr_dev(span1, "class", "play2 svelte-97h4hc");
    			add_location(span1, file$1, 74, 4, 2001);
    			attr_dev(div0, "class", "placar svelte-97h4hc");
    			add_location(div0, file$1, 72, 2, 1923);
    			add_location(div1, file$1, 86, 4, 2342);
    			attr_dev(div2, "class", "jogodavelha svelte-97h4hc");
    			add_location(div2, file$1, 82, 2, 2200);
    			attr_dev(main, "class", "teste");
    			add_location(main, file$1, 71, 0, 1899);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(main, t5);
    			if_block0.m(main, null);
    			append_dev(main, t6);
    			append_dev(main, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*play1*/ 4) set_data_dev(t1, /*play1*/ ctx[2]);
    			if (!current || dirty & /*play2*/ 2) set_data_dev(t4, /*play2*/ ctx[1]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(main, t6);
    				}
    			}

    			if (dirty & /*botoes, handleClick*/ 40) {
    				each_value = /*botoes*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, t7);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*ganhou*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
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

    function calcularGanhador(botoes) {
    	const verificarCasas = [
    		// Codigos para verificaçao para os lados
    		[0, 1, 2],
    		[1, 2, 3],
    		[4, 5, 6],
    		[5, 6, 7],
    		[8, 9, 10],
    		[9, 10, 11],
    		[12, 13, 14],
    		[13, 14, 15],
    		// Codigos para verificaçao para cima e para baixo
    		[0, 4, 8],
    		[4, 8, 12],
    		[1, 5, 9],
    		[5, 9, 13],
    		[2, 6, 10],
    		[6, 10, 14],
    		[3, 7, 11],
    		[7, 11, 15],
    		//Codigos para verificaçao na horizontal
    		[0, 5, 10],
    		[1, 6, 11],
    		[5, 10, 15],
    		[4, 9, 14],
    		[2, 5, 8],
    		[3, 6, 9],
    		[6, 9, 12],
    		[7, 10, 13]
    	];

    	// Codigo para verificar o array
    	for (let i = 0; i < verificarCasas.length; i++) {
    		const [a, b, c] = verificarCasas[i];

    		if (botoes[a] && botoes[a] === botoes[b] && botoes[a] === botoes[c]) {
    			return `Ganhou: ${botoes[a]}`;
    		}
    	}

    	const empate = botoes.every(botao => botao !== null);
    	return empate ? "O jogo foi empade" : null;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let status;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Jogo_da_velha', slots, []);
    	let ganhou = null;
    	let jogador = true;
    	let play2 = 0;
    	let play1 = 0;

    	// array para usar como botao
    	let botoes = Array(16).fill(null);

    	// Função para selecionar o proximo jogador
    	function handleClick(i) {
    		if (!botoes[i]) {
    			$$invalidate(3, botoes[i] = jogador ? "X" : "O", botoes); // comeca o jogador true = "X"
    			$$invalidate(8, jogador = !jogador); // Depois o jogador vira false = "O"
    			$$invalidate(0, ganhou = calcularGanhador(botoes));
    		}
    	}

    	// function para resetar o jogo e suas variaveis
    	function resetar() {
    		$$invalidate(3, botoes = Array(16).fill(null));
    		$$invalidate(0, ganhou = null);
    		$$invalidate(8, jogador = true);
    	}

    	function placar() {
    		if (ganhou == "Ganhou: X") {
    			$$invalidate(2, play1++, play1);
    		} else if (ganhou == "Ganhou: O") {
    			$$invalidate(1, play2++, play2);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Jogo_da_velha> was created with unknown prop '${key}'`);
    	});

    	const func = i => handleClick(i);

    	$$self.$capture_state = () => ({
    		Botao,
    		ganhou,
    		jogador,
    		play2,
    		play1,
    		botoes,
    		handleClick,
    		resetar,
    		calcularGanhador,
    		placar,
    		status
    	});

    	$$self.$inject_state = $$props => {
    		if ('ganhou' in $$props) $$invalidate(0, ganhou = $$props.ganhou);
    		if ('jogador' in $$props) $$invalidate(8, jogador = $$props.jogador);
    		if ('play2' in $$props) $$invalidate(1, play2 = $$props.play2);
    		if ('play1' in $$props) $$invalidate(2, play1 = $$props.play1);
    		if ('botoes' in $$props) $$invalidate(3, botoes = $$props.botoes);
    		if ('status' in $$props) $$invalidate(4, status = $$props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*jogador*/ 256) {
    			$$invalidate(4, status = "Proximo jogador: " + (jogador ? " X " : " O "));
    		}
    	};

    	return [
    		ganhou,
    		play2,
    		play1,
    		botoes,
    		status,
    		handleClick,
    		resetar,
    		placar,
    		jogador,
    		func
    	];
    }

    class Jogo_da_velha extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jogo_da_velha",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.3 */
    const file = "src\\App.svelte";

    // (66:21) 
    function create_if_block_3(ctx) {
    	let contatos;
    	let current;
    	contatos = new Contatos({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(contatos.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contatos, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contatos.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contatos.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contatos, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:21) ",
    		ctx
    	});

    	return block;
    }

    // (64:21) 
    function create_if_block_2(ctx) {
    	let ajuda;
    	let current;
    	ajuda = new Ajuda({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(ajuda.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(ajuda, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(ajuda.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(ajuda.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(ajuda, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:21) ",
    		ctx
    	});

    	return block;
    }

    // (62:21) 
    function create_if_block_1(ctx) {
    	let sobre;
    	let current;
    	sobre = new Sobre({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sobre.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sobre, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sobre.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sobre.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sobre, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(62:21) ",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if menu === 0}
    function create_if_block(ctx) {
    	let div0;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let main;
    	let div1;
    	let jogodavelha9;
    	let t4;
    	let div2;
    	let jogodavelha;
    	let current;
    	let mounted;
    	let dispose;
    	jogodavelha9 = new Jogo_da_velha9({ $$inline: true });
    	jogodavelha = new Jogo_da_velha({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "𝐉𝐨𝐠𝐚𝐫 𝐜𝐨𝐦 𝟗 𝐜𝐚𝐬𝐚𝐬.";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "𝐉𝐨𝐠𝐚𝐫 𝐜𝐨𝐦 𝟏𝟔 𝐜𝐚𝐬𝐚𝐬.";
    			t3 = space();
    			main = element("main");
    			div1 = element("div");
    			create_component(jogodavelha9.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			create_component(jogodavelha.$$.fragment);
    			attr_dev(button0, "class", "svelte-6bekof");
    			add_location(button0, file, 50, 1, 1360);
    			attr_dev(button1, "class", "svelte-6bekof");
    			add_location(button1, file, 51, 1, 1432);
    			attr_dev(div0, "class", "botoesmudar svelte-6bekof");
    			add_location(div0, file, 48, 0, 1314);
    			attr_dev(div1, "class", "acasas svelte-6bekof");
    			attr_dev(div1, "id", "9casas");
    			add_location(div1, file, 54, 1, 1519);
    			attr_dev(div2, "class", "ycasas svelte-6bekof");
    			attr_dev(div2, "id", "16casas");
    			add_location(div2, file, 57, 1, 1582);
    			attr_dev(main, "class", "svelte-6bekof");
    			add_location(main, file, 53, 0, 1511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			mount_component(jogodavelha9, div1, null);
    			append_dev(main, t4);
    			append_dev(main, div2);
    			mount_component(jogodavelha, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", jogarnove, false, false, false),
    					listen_dev(button1, "click", jogardez, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(jogodavelha9.$$.fragment, local);
    			transition_in(jogodavelha.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(jogodavelha9.$$.fragment, local);
    			transition_out(jogodavelha.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			destroy_component(jogodavelha9);
    			destroy_component(jogodavelha);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(48:0) {#if menu === 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let a3;
    	let t7;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*menu*/ ctx[0] === 0) return 0;
    		if (/*menu*/ ctx[0] === 1) return 1;
    		if (/*menu*/ ctx[0] === 2) return 2;
    		if (/*menu*/ ctx[0] === 3) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "𝑱𝒐𝒈𝒂𝒓";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "𝑺𝒐𝒃𝒓𝒆";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "𝑨𝒋𝒖𝒅𝒂";
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "𝑪𝒐𝒏𝒕𝒂𝒕𝒐";
    			t7 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-6bekof");
    			add_location(a0, file, 41, 20, 924);
    			attr_dev(li0, "class", "menuu svelte-6bekof");
    			add_location(li0, file, 41, 1, 905);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-6bekof");
    			add_location(a1, file, 42, 19, 1019);
    			attr_dev(li1, "class", "menuu svelte-6bekof");
    			add_location(li1, file, 42, 1, 1001);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "svelte-6bekof");
    			add_location(a2, file, 43, 19, 1115);
    			attr_dev(li2, "class", "menuu svelte-6bekof");
    			add_location(li2, file, 43, 1, 1097);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "svelte-6bekof");
    			add_location(a3, file, 44, 19, 1210);
    			attr_dev(li3, "class", "menuu svelte-6bekof");
    			add_location(li3, file, 44, 1, 1192);
    			attr_dev(ul, "id", "menu");
    			attr_dev(ul, "class", "svelte-6bekof");
    			add_location(ul, file, 40, 0, 889);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			insert_dev(target, t7, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*click_handler*/ ctx[1]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_1*/ ctx[2]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_2*/ ctx[3]), false, true, false),
    					listen_dev(a3, "click", prevent_default(/*click_handler_3*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t7);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
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

    function jogarnove() {
    	var x = document.getElementById("9casas");
    	var y = document.getElementById("16casas");

    	if (x.style.display === "none") {
    		x.style.display = "block";
    		y.style.display = "none";
    	} else {
    		x.style.display = "none";
    	}
    }

    function jogardez() {
    	var y = document.getElementById("16casas");
    	var x = document.getElementById("9casas");

    	if (y.style.display === "none") {
    		y.style.display = "block";
    		x.style.display = "none";
    	} else {
    		y.style.display = "none";
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let menu = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, menu = 0);
    	const click_handler_1 = () => $$invalidate(0, menu = 1);
    	const click_handler_2 = () => $$invalidate(0, menu = 2);
    	const click_handler_3 = () => $$invalidate(0, menu = 3);

    	$$self.$capture_state = () => ({
    		Contatos,
    		Botao,
    		Sobre,
    		Ajuda,
    		JogoDaVelha9: Jogo_da_velha9,
    		JogoDaVelha: Jogo_da_velha,
    		menu,
    		jogarnove,
    		jogardez
    	});

    	$$self.$inject_state = $$props => {
    		if ('menu' in $$props) $$invalidate(0, menu = $$props.menu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menu, click_handler, click_handler_1, click_handler_2, click_handler_3];
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
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map

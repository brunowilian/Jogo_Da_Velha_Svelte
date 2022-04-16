
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

    /* src\pages\Contatos.svelte generated by Svelte v3.44.3 */

    const file$6 = "src\\pages\\Contatos.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let div3;
    	let section;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let br0;
    	let t4;
    	let div2;
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
    	let t12;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Contatos";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Caso tenha dúvidas ou sugestões de melhorias sobre o jogo, pode escolher  qualquer um dos desenvolvedores abaixo, que responderemos o mais breve possível. Será um prazer entrar em contato com você!";
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t5 = space();
    			div0 = element("div");
    			p1 = element("p");
    			p1.textContent = "Bruno wilian Crispim da Silva";
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
    			t12 = text(">");
    			attr_dev(h1, "class", "svelte-1anzakb");
    			add_location(h1, file$6, 4, 10, 57);
    			attr_dev(p0, "class", "texto svelte-1anzakb");
    			add_location(p0, file$6, 5, 10, 86);
    			add_location(br0, file$6, 6, 10, 317);
    			add_location(section, file$6, 3, 8, 36);
    			attr_dev(img0, "class", "perfil svelte-1anzakb");
    			if (!src_url_equal(img0.src, img0_src_value = "imagem/bruno.jpeg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$6, 12, 12, 464);
    			add_location(p1, file$6, 14, 14, 552);
    			add_location(br1, file$6, 15, 14, 604);
    			attr_dev(img1, "class", "imagem svelte-1anzakb");
    			if (!src_url_equal(img1.src, img1_src_value = "imagem/linkedin.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$6, 16, 76, 686);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/bruno-wilian-317066192/");
    			add_location(a0, file$6, 16, 14, 624);
    			attr_dev(img2, "class", "imagem svelte-1anzakb");
    			if (!src_url_equal(img2.src, img2_src_value = "imagem/instagram.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Instagram");
    			add_location(img2, file$6, 17, 65, 811);
    			attr_dev(a1, "href", "https://www.instagram.com/bruno_.wilian/");
    			add_location(a1, file$6, 17, 14, 760);
    			attr_dev(img3, "class", "imagem svelte-1anzakb");
    			if (!src_url_equal(img3.src, img3_src_value = "imagem/Github.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Github");
    			add_location(img3, file$6, 18, 55, 938);
    			attr_dev(a2, "href", "https://github.com/brunowilian");
    			add_location(a2, file$6, 18, 14, 897);
    			add_location(div0, file$6, 13, 12, 531);
    			attr_dev(div1, "class", "bloco svelte-1anzakb");
    			add_location(div1, file$6, 11, 10, 431);
    			attr_dev(div2, "class", "coluna svelte-1anzakb");
    			add_location(div2, file$6, 9, 8, 354);
    			add_location(div3, file$6, 2, 6, 21);
    			attr_dev(main, "class", "svelte-1anzakb");
    			add_location(main, file$6, 1, 5, 7);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, section);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, p0);
    			append_dev(section, t3);
    			append_dev(section, br0);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
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
    			append_dev(main, t11);
    			insert_dev(target, t12, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t12);
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

    /* src\pages\Sobre.svelte generated by Svelte v3.44.3 */

    const file$5 = "src\\pages\\Sobre.svelte";

    function create_fragment$5(ctx) {
    	let div3;
    	let div1;
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
    	let section;
    	let div2;
    	let h1;
    	let t13;
    	let h30;
    	let t15;
    	let p4;
    	let t17;
    	let h31;
    	let t19;
    	let p5;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
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
    			t4 = text(" Informática para Internet (IPI) / Sistemas para\r\n        Internet (TSI)");
    			t5 = space();
    			p2 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "Componentes:";
    			t7 = text(" Lógica de Programação e Estrutura de Dados\r\n        | Programação Imperativa");
    			t8 = space();
    			p3 = element("p");
    			strong3 = element("strong");
    			strong3.textContent = "Aluno:";
    			t10 = text(" Bruno Wilian Crispim da Silva");
    			t11 = space();
    			section = element("section");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Sobre";
    			t13 = space();
    			h30 = element("h3");
    			h30.textContent = "1. Sobre o Projeto";
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "Jogo desenvolvido por estudante do Instituto Federal de Pernambuco -\r\n        Campus Igarassu, utilizando recursos do compilador front-end Svelte para\r\n        construir componentes através das linguagens JavaScript (Programação),\r\n        HTML (Marcação de HiperTexto) e CSS (Estilo).";
    			t17 = space();
    			h31 = element("h3");
    			h31.textContent = "2. Sobre o Jogo";
    			t19 = space();
    			p5 = element("p");
    			p5.textContent = "O jogo da velha é um jogo de regras extremamente simples, que é\r\n        facilmente aprendido pelos seus jogadores e tem como objetivo fazer uma\r\n        sequência de três símbolos iguais, seja em linha vertical, horizontal ou\r\n        diagonal, enquanto tenta prever o movimento do adversário. Além disso, é\r\n        uma boa oportunidade para estimular o raciocínio lógico, aprender a\r\n        formar sequência e a ter paciência.";
    			attr_dev(img, "class", "cabecalho-imagem");
    			if (!src_url_equal(img.src, img_src_value = "imagem/ifpe.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo do IFPE");
    			add_location(img, file$5, 2, 4, 62);
    			add_location(strong0, file$5, 5, 8, 215);
    			attr_dev(p0, "class", "cabecalho-ifpe-a");
    			add_location(p0, file$5, 4, 6, 177);
    			add_location(strong1, file$5, 10, 8, 370);
    			attr_dev(p1, "class", "cabecalho-ifpe-a");
    			add_location(p1, file$5, 9, 6, 332);
    			add_location(strong2, file$5, 14, 8, 524);
    			attr_dev(p2, "class", "cabecalho-ifpe-a");
    			add_location(p2, file$5, 13, 6, 486);
    			add_location(strong3, file$5, 18, 8, 688);
    			attr_dev(p3, "class", "cabecalho-ifpe-a");
    			add_location(p3, file$5, 17, 6, 650);
    			attr_dev(div0, "class", "cabecalho-ifpe");
    			add_location(div0, file$5, 3, 4, 141);
    			attr_dev(div1, "class", "cabecalho");
    			add_location(div1, file$5, 1, 2, 33);
    			attr_dev(h1, "class", "conteudo-principal-titulo");
    			add_location(h1, file$5, 25, 6, 856);
    			attr_dev(h30, "class", "conteudo-principal-subtitulo");
    			add_location(h30, file$5, 26, 6, 912);
    			attr_dev(p4, "class", "conteudo-principal-paragrafo");
    			add_location(p4, file$5, 27, 6, 984);
    			attr_dev(h31, "class", "conteudo-principal-subtitulo");
    			add_location(h31, file$5, 33, 6, 1339);
    			attr_dev(p5, "class", "conteudo-principal-paragrafo");
    			add_location(p5, file$5, 34, 6, 1408);
    			attr_dev(div2, "class", "campo-text");
    			add_location(div2, file$5, 24, 4, 824);
    			attr_dev(section, "class", "container-principal");
    			add_location(section, file$5, 23, 2, 781);
    			attr_dev(div3, "class", "container-sobre");
    			add_location(div3, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
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
    			append_dev(div3, t11);
    			append_dev(div3, section);
    			append_dev(section, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t13);
    			append_dev(div2, h30);
    			append_dev(div2, t15);
    			append_dev(div2, p4);
    			append_dev(div2, t17);
    			append_dev(div2, h31);
    			append_dev(div2, t19);
    			append_dev(div2, p5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
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

    function instance$5($$self, $$props) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sobre",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\Ajuda.svelte generated by Svelte v3.44.3 */

    const file$4 = "src\\pages\\Ajuda.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(h1, "class", "svelte-1w4gce");
    			add_location(h1, file$4, 8, 2, 72);
    			attr_dev(h2, "class", "svelte-1w4gce");
    			add_location(h2, file$4, 10, 3, 95);
    			attr_dev(h30, "class", "svelte-1w4gce");
    			add_location(h30, file$4, 12, 3, 160);
    			attr_dev(p0, "class", "svelte-1w4gce");
    			add_location(p0, file$4, 13, 3, 188);
    			attr_dev(h31, "class", "svelte-1w4gce");
    			add_location(h31, file$4, 15, 3, 538);
    			attr_dev(p1, "class", "svelte-1w4gce");
    			add_location(p1, file$4, 16, 3, 573);
    			attr_dev(h32, "class", "svelte-1w4gce");
    			add_location(h32, file$4, 18, 3, 878);
    			attr_dev(p2, "class", "svelte-1w4gce");
    			add_location(p2, file$4, 19, 3, 925);
    			attr_dev(section, "class", "conteudo svelte-1w4gce");
    			add_location(section, file$4, 7, 2, 42);
    			attr_dev(main, "class", "svelte-1w4gce");
    			add_location(main, file$4, 6, 1, 31);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ajuda",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\pages\Jogo-da-velha9.svelte generated by Svelte v3.44.3 */

    const file$3 = "src\\pages\\Jogo-da-velha9.svelte";

    // (65:6) {:else}
    function create_else_block$1(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*status*/ ctx[4]);
    			attr_dev(h3, "class", "status svelte-1yu6pcw");
    			add_location(h3, file$3, 65, 8, 1732);
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
    		source: "(65:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:8) {#if ganhou}
    function create_if_block_1$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${/*placar*/ ctx[7]()}`;
    			attr_dev(p, "class", "fun_placar svelte-1yu6pcw");
    			add_location(p, file$3, 63, 8, 1671);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(63:8) {#if ganhou}",
    		ctx
    	});

    	return block;
    }

    // (91:8) {#if ganhou}
    function create_if_block$2(ctx) {
    	let t_value = alert(/*ganhou*/ ctx[2], /*resetar*/ ctx[5]()) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ganhou*/ 4 && t_value !== (t_value = alert(/*ganhou*/ ctx[2], /*resetar*/ ctx[5]()) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(91:8) {#if ganhou}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    			attr_dev(span0, "class", "play1 svelte-1yu6pcw");
    			add_location(span0, file$3, 58, 6, 1518);
    			attr_dev(span1, "class", "play2 svelte-1yu6pcw");
    			add_location(span1, file$3, 59, 4, 1570);
    			attr_dev(div0, "class", "placar svelte-1yu6pcw");
    			add_location(div0, file$3, 57, 2, 1490);
    			add_location(div1, file$3, 61, 6, 1634);
    			attr_dev(button0, "id", "0");
    			attr_dev(button0, "class", "quadrado svelte-1yu6pcw");
    			add_location(button0, file$3, 71, 8, 1865);
    			attr_dev(button1, "id", "1");
    			attr_dev(button1, "class", "quadrado svelte-1yu6pcw");
    			add_location(button1, file$3, 72, 8, 1952);
    			attr_dev(button2, "id", "2");
    			attr_dev(button2, "class", "quadrado svelte-1yu6pcw");
    			add_location(button2, file$3, 73, 8, 2038);
    			attr_dev(div2, "class", "mudacorl");
    			add_location(div2, file$3, 70, 6, 1833);
    			attr_dev(button3, "id", "3");
    			attr_dev(button3, "class", "quadrado svelte-1yu6pcw");
    			add_location(button3, file$3, 77, 8, 2157);
    			attr_dev(button4, "id", "4");
    			attr_dev(button4, "class", "quadrado svelte-1yu6pcw");
    			add_location(button4, file$3, 78, 8, 2244);
    			attr_dev(button5, "id", "5");
    			attr_dev(button5, "class", "quadrado svelte-1yu6pcw");
    			add_location(button5, file$3, 79, 8, 2330);
    			add_location(div3, file$3, 76, 6, 2142);
    			attr_dev(button6, "id", "6");
    			attr_dev(button6, "class", "quadrado svelte-1yu6pcw");
    			add_location(button6, file$3, 83, 8, 2449);
    			attr_dev(button7, "id", "7");
    			attr_dev(button7, "class", "quadrado svelte-1yu6pcw");
    			add_location(button7, file$3, 84, 8, 2536);
    			attr_dev(button8, "id", "8");
    			attr_dev(button8, "class", "quadrado svelte-1yu6pcw");
    			add_location(button8, file$3, 85, 8, 2622);
    			add_location(div4, file$3, 82, 6, 2434);
    			attr_dev(section, "class", "botoes svelte-1yu6pcw");
    			add_location(section, file$3, 69, 6, 1801);
    			add_location(div5, file$3, 89, 6, 2738);
    			attr_dev(main, "class", "svelte-1yu6pcw");
    			add_location(main, file$3, 56, 2, 1480);
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
    		id: create_fragment$3.name,
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

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jogo_da_velha9",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\Botao.svelte generated by Svelte v3.44.3 */

    const file$2 = "src\\pages\\Botao.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let t_value = (/*value*/ ctx[0] || "") + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "botao svelte-hyd2w2");
    			add_location(button, file$2, 5, 0, 71);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, handleClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Botao",
    			options,
    			id: create_fragment$2.name
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

    /* src\pages\Jogo-da-velha.svelte generated by Svelte v3.44.3 */
    const file$1 = "src\\pages\\Jogo-da-velha.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (79:2) {:else}
    function create_else_block(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*status*/ ctx[4]);
    			attr_dev(h3, "class", "status svelte-1jolsbw");
    			add_location(h3, file$1, 79, 4, 2132);
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
    		source: "(79:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:2) {#if ganhou}
    function create_if_block_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `${/*placar*/ ctx[7]()}`;
    			attr_dev(p, "class", "fun_placar svelte-1jolsbw");
    			add_location(p, file$1, 77, 4, 2079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
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

    // (83:4) {#each botoes as botao, i}
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
    		source: "(83:4) {#each botoes as botao, i}",
    		ctx
    	});

    	return block;
    }

    // (87:6) {#if ganhou}
    function create_if_block$1(ctx) {
    	let t_value = alert(/*ganhou*/ ctx[0], /*resetar*/ ctx[6]()) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ganhou*/ 1 && t_value !== (t_value = alert(/*ganhou*/ ctx[0], /*resetar*/ ctx[6]()) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(87:6) {#if ganhou}",
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
    			attr_dev(span0, "class", "play1 svelte-1jolsbw");
    			add_location(span0, file$1, 73, 4, 1949);
    			attr_dev(span1, "class", "play2 svelte-1jolsbw");
    			add_location(span1, file$1, 74, 4, 2001);
    			attr_dev(div0, "class", "placar svelte-1jolsbw");
    			add_location(div0, file$1, 72, 2, 1923);
    			add_location(div1, file$1, 85, 4, 2319);
    			attr_dev(div2, "class", "jogodavelha svelte-1jolsbw");
    			add_location(div2, file$1, 81, 2, 2177);
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

    // (65:21) 
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
    		source: "(65:21) ",
    		ctx
    	});

    	return block;
    }

    // (63:21) 
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
    		source: "(63:21) ",
    		ctx
    	});

    	return block;
    }

    // (61:21) 
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
    		source: "(61:21) ",
    		ctx
    	});

    	return block;
    }

    // (47:0) {#if menu === 0}
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
    			attr_dev(button0, "class", "svelte-1q1r4h4");
    			add_location(button0, file, 49, 1, 1330);
    			attr_dev(button1, "class", "svelte-1q1r4h4");
    			add_location(button1, file, 50, 1, 1403);
    			attr_dev(div0, "class", "botoesmudar svelte-1q1r4h4");
    			add_location(div0, file, 47, 0, 1282);
    			attr_dev(div1, "class", "acasas svelte-1q1r4h4");
    			attr_dev(div1, "id", "9casas");
    			add_location(div1, file, 53, 1, 1493);
    			attr_dev(div2, "class", "ycasas svelte-1q1r4h4");
    			attr_dev(div2, "id", "16casas");
    			add_location(div2, file, 56, 1, 1559);
    			attr_dev(main, "class", "svelte-1q1r4h4");
    			add_location(main, file, 52, 0, 1484);
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
    		source: "(47:0) {#if menu === 0}",
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
    			attr_dev(a0, "class", "svelte-1q1r4h4");
    			add_location(a0, file, 40, 20, 885);
    			attr_dev(li0, "class", "menuu svelte-1q1r4h4");
    			add_location(li0, file, 40, 1, 866);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "svelte-1q1r4h4");
    			add_location(a1, file, 41, 19, 981);
    			attr_dev(li1, "class", "menuu svelte-1q1r4h4");
    			add_location(li1, file, 41, 1, 963);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "svelte-1q1r4h4");
    			add_location(a2, file, 42, 19, 1078);
    			attr_dev(li2, "class", "menuu svelte-1q1r4h4");
    			add_location(li2, file, 42, 1, 1060);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "svelte-1q1r4h4");
    			add_location(a3, file, 43, 19, 1174);
    			attr_dev(li3, "class", "menuu svelte-1q1r4h4");
    			add_location(li3, file, 43, 1, 1156);
    			attr_dev(ul, "id", "menu");
    			attr_dev(ul, "class", "svelte-1q1r4h4");
    			add_location(ul, file, 39, 0, 849);
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

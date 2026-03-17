(function() {
    const l = document.createElement("link").relList;
    if (l && l.supports && l.supports("modulepreload"))
        return;
    for (const c of document.querySelectorAll('link[rel="modulepreload"]'))
        u(c);
    new MutationObserver(c => {
        for (const f of c)
            if (f.type === "childList")
                for (const d of f.addedNodes)
                    d.tagName === "LINK" && d.rel === "modulepreload" && u(d)
    }
    ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function r(c) {
        const f = {};
        return c.integrity && (f.integrity = c.integrity),
        c.referrerPolicy && (f.referrerPolicy = c.referrerPolicy),
        c.crossOrigin === "use-credentials" ? f.credentials = "include" : c.crossOrigin === "anonymous" ? f.credentials = "omit" : f.credentials = "same-origin",
        f
    }
    function u(c) {
        if (c.ep)
            return;
        c.ep = !0;
        const f = r(c);
        fetch(c.href, f)
    }
}
)();
const Rs = [];
let dg = !0;
const hg = console.error;
function Ph(s) {
    Rs.length > 5 || !dg || Rs.push(s)
}
function mg(s) {
    Rs.push({
        type: "runtime",
        args: s
    })
}
function gg(s) {
    s.preventDefault()
}
function U0(s) {
    try {
        const l = s.find(r => r instanceof Error);
        if (l && l.stack)
            Ph({
                type: "console.error",
                args: l
            });
        else if (s.length > 0) {
            const r = s.map(c => typeof c == "object" ? JSON.stringify(c) : String(c)).join(" ")
              , u = new Error(r);
            Ph({
                type: "console.error",
                args: u
            })
        }
    } catch (l) {
        console.warn(l)
    }
}
window.addEventListener("error", mg);
window.addEventListener("unhandledrejection", gg);
console.error = function(...l) {
    U0(l),
    hg.apply(this, l)
}
;
function B0() {
    return window.removeEventListener("error", mg),
    window.removeEventListener("unhandledrejection", gg),
    console.error = hg,
    dg = !1,
    Rs
}
const H0 = 1e3
  , em = Symbol("postMessageResponseTimeout");
let xs = 0;
const ao = "*";
class Xa {
    client;
    baseTimeout;
    waitRes = new Map;
    removeListeners = new Set;
    clear;
    constructor(l, r) {
        this.client = l,
        this.baseTimeout = r?.timeout || H0;
        const u = this.emitResponse.bind(this);
        this.clear = () => {
            window.removeEventListener("message", u)
        }
        ,
        window.addEventListener("message", u)
    }
    destroy() {
        this.clear(),
        this.removeListeners.forEach(l => l())
    }
    isTimeout(l) {
        return l === em
    }
    post(l, r, u) {
        xs++;
        const {timeout: c, origin: f=ao} = u || {};
        return this.client.postMessage({
            data: r,
            id: xs,
            type: l
        }, f),
        new Promise(d => {
            this.waitRes.set(xs, m => {
                d(m)
            }
            ),
            setTimeout( () => {
                this.waitRes.delete(xs),
                d(em)
            }
            , c || this.baseTimeout)
        }
        )
    }
    on(l, r, u) {
        const {once: c, origin: f=ao} = u || {}
          , d = async g => {
            const {id: p, type: b, data: v} = g.data;
            let S;
            b === l && (S = await r(v),
            console.log(l, c, S, v),
            (p && f === g.origin || f === ao) && g.source?.postMessage({
                fromType: l,
                id: p,
                data: S
            }, g.origin),
            c && m())
        }
        ;
        window.addEventListener("message", d);
        const m = () => {
            window.removeEventListener("message", d),
            this.removeListeners.delete(m)
        }
        ;
        return this.removeListeners.add(m),
        m
    }
    emitResponse(l) {
        const r = l.data
          , {id: u, data: c} = r
          , f = this.waitRes.get(u);
        f && f(c)
    }
}
class q0 {
    #e = new WeakMap;
    #n;
    #a;
    #t = !1;
    constructor() {
        this.#n = HTMLElement.prototype.addEventListener,
        this.#a = HTMLElement.prototype.removeEventListener
    }
    patch() {
        if (this.#t)
            return;
        const l = this;
        HTMLElement.prototype.addEventListener = function(r, u, c) {
            return l.#l(this, r, u),
            l.#n.call(this, r, u, c)
        }
        ,
        HTMLElement.prototype.removeEventListener = function(r, u, c) {
            return l.#i(this, r, u),
            l.#a.call(this, r, u, c)
        }
        ,
        this.#t = !0,
        console.log("[EventListenerRegistry] ✅ addEventListener patched")
    }
    unpatch() {
        this.#t && (HTMLElement.prototype.addEventListener = this.#n,
        HTMLElement.prototype.removeEventListener = this.#a,
        this.#t = !1,
        console.log("[EventListenerRegistry] ⚠️ addEventListener unpatched"))
    }
    #l(l, r, u) {
        let c = this.#e.get(l);
        c || (c = new Map,
        this.#e.set(l, c));
        let f = c.get(r);
        f || (f = new Set,
        c.set(r, f)),
        f.add(u)
    }
    #i(l, r, u) {
        const c = this.#e.get(l);
        if (!c)
            return;
        const f = c.get(r);
        f && (f.delete(u),
        f.size === 0 && c.delete(r))
    }
    hasListeners(l, r) {
        const u = this.#e.get(l);
        return !u || u.size === 0 ? !1 : r ? r.some(c => {
            const f = u.get(c);
            return f && f.size > 0
        }
        ) : !0
    }
    getEventTypes(l) {
        const r = this.#e.get(l);
        return r ? Array.from(r.keys()) : []
    }
    getListenerCount(l, r) {
        const u = this.#e.get(l);
        if (!u)
            return 0;
        const c = u.get(r);
        return c ? c.size : 0
    }
    getDebugInfo() {
        return {
            patched: this.#t,
            note: "WeakMap is used for automatic memory cleanup. Cannot enumerate elements."
        }
    }
    getElementDebugInfo(l) {
        const r = this.#e.get(l);
        return r ? {
            element: l,
            tag: l.tagName,
            className: l.className,
            hasListeners: !0,
            eventTypes: Array.from(r.keys()),
            totalListeners: Array.from(r.values()).reduce( (u, c) => u + c.size, 0)
        } : {
            element: l,
            hasListeners: !1,
            eventTypes: [],
            totalListeners: 0
        }
    }
}
const Qa = new q0
  , pg = ["click", "dblclick", "contextmenu", "mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "pointerover", "pointerout", "pointercancel"];
function jo(s) {
    return Qa.hasListeners(s, pg)
}
function yg(s) {
    return Qa.getEventTypes(s).filter(r => pg.includes(r))
}
function vg(s) {
    const l = yg(s)
      , r = {};
    return l.forEach(u => {
        r[u] = Qa.getListenerCount(s, u)
    }
    ),
    {
        hasEvents: l.length > 0,
        eventTypes: l,
        listeners: r
    }
}
function G0(s) {
    return Qa.getElementDebugInfo(s)
}
function bg(s=window) {
    Qa.patch(),
    s.__eventListenerRegistry__ = {
        hasListeners: jo,
        getEventTypes: yg,
        getDetail: vg,
        getDebugInfo: () => Qa.getDebugInfo(),
        getElementDebugInfo: G0
    },
    console.log("[EnhancedEventDetector] ✅ Initialized and patched addEventListener")
}
typeof window < "u" && bg(window);
const Uo = ["onClick", "onDoubleClick", "onContextMenu", "onMouseDown", "onMouseUp", "onPointerDown", "onPointerUp", "onTouchStart", "onTouchEnd", "onDragStart", "onDrop", "onChange", "onSubmit", "onKeyDown", "onKeyUp"];
function Bo(s) {
    const l = Object.keys(s).find(r => r.startsWith("__reactFiber$") || r.startsWith("__reactInternalInstance$"));
    return l ? s[l] : null
}
function xg(s) {
    return !s || typeof s != "object" ? !1 : Uo.some(l => typeof s[l] == "function")
}
function Y0(s) {
    return !s || typeof s != "object" ? [] : Uo.filter(l => typeof s[l] == "function")
}
function Sg(s) {
    let l = Bo(s);
    for (; l; ) {
        if (l.memoizedProps && xg(l.memoizedProps))
            return !0;
        l = l.return || null
    }
    return !1
}
function Eg(s) {
    const l = {
        hasEvents: !1,
        events: []
    };
    let r = Bo(s);
    for (; r; ) {
        if (r.memoizedProps) {
            const u = Y0(r.memoizedProps);
            if (u.length > 0) {
                l.hasEvents = !0;
                const c = r.type?.displayName || r.type?.name || r.elementType?.name || "Unknown";
                l.events.push({
                    componentName: c,
                    eventNames: u,
                    props: r.memoizedProps
                })
            }
        }
        r = r.return || null
    }
    return l
}
function wg(s) {
    const l = Bo(s);
    return !l || !l.memoizedProps ? !1 : xg(l.memoizedProps)
}
function Cg(s=window) {
    s.__reactEventDetector__ = {
        hasReactInteractionEvents: Sg,
        getReactInteractionEventsDetail: Eg,
        hasReactInteractionEventsOnSelf: wg,
        REACT_EVENT_PROPS: Uo
    },
    console.log("[ReactEventDetector] Injected to window.__reactEventDetector__")
}
typeof window < "u" && Cg(window);
function _g(s) {
    return s ? Sg(s) || jo(s) : !1
}
function V0(s) {
    return s ? wg(s) || jo(s) : !1
}
function Ho(s) {
    const l = Eg(s)
      , r = vg(s);
    return {
        hasEvents: l.hasEvents || r.hasEvents,
        react: l,
        native: r
    }
}
function qo(s) {
    if (!s)
        return {
            error: "selector is required"
        };
    const l = document.querySelector(s);
    if (!l)
        return {
            error: "Element not found",
            selector: s
        };
    const r = Ho(l);
    return {
        selector: s,
        hasEvents: r.hasEvents
    }
}
function Ag(s, l) {
    if (typeof s != "number" || typeof l != "number")
        return {
            error: "x and y must be numbers"
        };
    const r = document.elementFromPoint(s, l);
    if (!r)
        return {
            error: "No element at point",
            x: s,
            y: l
        };
    const u = Ho(r);
    return {
        x: s,
        y: l,
        hasEvents: u.hasEvents
    }
}
function k0(s) {
    return s.map(l => ({
        element: l,
        hasEvents: _g(l)
    }))
}
function Tg(s) {
    return s.map(l => ({
        selector: l,
        result: qo(l)
    }))
}
const tm = "1.0.0";
function Q0() {
    window.__interactionDetector__ = {
        hasInteractionEvents: _g,
        hasInteractionEventsOnSelf: V0,
        getDetail: Ho,
        checkBySelector: qo,
        checkByPoint: Ag,
        checkMultiple: k0,
        checkMultipleSelectors: Tg,
        version: tm
    },
    console.log(`[InteractionDetector] Global API initialized (v${tm})`)
}
function X0() {
    const s = new Xa(window.parent);
    s.on("checkInteraction", l => {
        const {selector: r, x: u, y: c} = l || {};
        return r ? qo(r) : typeof u == "number" && typeof c == "number" ? Ag(u, c) : {
            error: "Invalid params: need selector or (x, y)"
        }
    }
    ),
    s.on("checkMultipleSelectors", l => {
        const {selectors: r} = l || {};
        return !r || !Array.isArray(r) ? {
            error: "selectors array is required"
        } : Tg(r)
    }
    ),
    console.log("[InteractionDetector] PostMessage listener initialized")
}
function F0() {
    bg(),
    Cg(),
    Q0(),
    X0(),
    console.log("[Continue] Module fully initialized")
}
function Z0(s) {
    return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s
}
function K0(s) {
    if (Object.prototype.hasOwnProperty.call(s, "__esModule"))
        return s;
    var l = s.default;
    if (typeof l == "function") {
        var r = function u() {
            var c = !1;
            try {
                c = this instanceof u
            } catch {}
            return c ? Reflect.construct(l, arguments, this.constructor) : l.apply(this, arguments)
        };
        r.prototype = l.prototype
    } else
        r = {};
    return Object.defineProperty(r, "__esModule", {
        value: !0
    }),
    Object.keys(s).forEach(function(u) {
        var c = Object.getOwnPropertyDescriptor(s, u);
        Object.defineProperty(r, u, c.get ? c : {
            enumerable: !0,
            get: function() {
                return s[u]
            }
        })
    }),
    r
}
var Gl = {}, lo = {}, io = {}, so = {}, nm;
function J0() {
    if (nm)
        return so;
    nm = 1;
    const s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    return so.encode = function(l) {
        if (0 <= l && l < s.length)
            return s[l];
        throw new TypeError("Must be between 0 and 63: " + l)
    }
    ,
    so
}
var am;
function Og() {
    if (am)
        return io;
    am = 1;
    const s = J0()
      , l = 5
      , r = 1 << l
      , u = r - 1
      , c = r;
    function f(d) {
        return d < 0 ? (-d << 1) + 1 : (d << 1) + 0
    }
    return io.encode = function(m) {
        let g = "", p, b = f(m);
        do
            p = b & u,
            b >>>= l,
            b > 0 && (p |= c),
            g += s.encode(p);
        while (b > 0);
        return g
    }
    ,
    io
}
var jt = {};
const $0 = {}
  , W0 = Object.freeze(Object.defineProperty({
    __proto__: null,
    default: $0
}, Symbol.toStringTag, {
    value: "Module"
}))
  , I0 = K0(W0);
var ro, lm;
function P0() {
    return lm || (lm = 1,
    ro = typeof URL == "function" ? URL : I0.URL),
    ro
}
var im;
function Ds() {
    if (im)
        return jt;
    im = 1;
    const s = P0();
    function l(k, X, Z) {
        if (X in k)
            return k[X];
        if (arguments.length === 3)
            return Z;
        throw new Error('"' + X + '" is a required argument.')
    }
    jt.getArg = l;
    const r = (function() {
        return !("__proto__"in Object.create(null))
    }
    )();
    function u(k) {
        return k
    }
    function c(k) {
        return d(k) ? "$" + k : k
    }
    jt.toSetString = r ? u : c;
    function f(k) {
        return d(k) ? k.slice(1) : k
    }
    jt.fromSetString = r ? u : f;
    function d(k) {
        if (!k)
            return !1;
        const X = k.length;
        if (X < 9 || k.charCodeAt(X - 1) !== 95 || k.charCodeAt(X - 2) !== 95 || k.charCodeAt(X - 3) !== 111 || k.charCodeAt(X - 4) !== 116 || k.charCodeAt(X - 5) !== 111 || k.charCodeAt(X - 6) !== 114 || k.charCodeAt(X - 7) !== 112 || k.charCodeAt(X - 8) !== 95 || k.charCodeAt(X - 9) !== 95)
            return !1;
        for (let Z = X - 10; Z >= 0; Z--)
            if (k.charCodeAt(Z) !== 36)
                return !1;
        return !0
    }
    function m(k, X) {
        return k === X ? 0 : k === null ? 1 : X === null ? -1 : k > X ? 1 : -1
    }
    function g(k, X) {
        let Z = k.generatedLine - X.generatedLine;
        return Z !== 0 || (Z = k.generatedColumn - X.generatedColumn,
        Z !== 0) || (Z = m(k.source, X.source),
        Z !== 0) || (Z = k.originalLine - X.originalLine,
        Z !== 0) || (Z = k.originalColumn - X.originalColumn,
        Z !== 0) ? Z : m(k.name, X.name)
    }
    jt.compareByGeneratedPositionsInflated = g;
    function p(k) {
        return JSON.parse(k.replace(/^\)]}'[^\n]*\n/, ""))
    }
    jt.parseSourceMapInput = p;
    const b = "http:"
      , v = `${b}//host`;
    function S(k) {
        return X => {
            const Z = M(X)
              , ne = O(X)
              , oe = new s(X,ne);
            k(oe);
            const fe = oe.toString();
            return Z === "absolute" ? fe : Z === "scheme-relative" ? fe.slice(b.length) : Z === "path-absolute" ? fe.slice(v.length) : G(ne, fe)
        }
    }
    function x(k, X) {
        return new s(k,X).toString()
    }
    function E(k, X) {
        let Z = 0;
        do {
            const ne = k + Z++;
            if (X.indexOf(ne) === -1)
                return ne
        } while (!0)
    }
    function O(k) {
        const X = k.split("..").length - 1
          , Z = E("p", k);
        let ne = `${v}/`;
        for (let oe = 0; oe < X; oe++)
            ne += `${Z}/`;
        return ne
    }
    const C = /^[A-Za-z0-9\+\-\.]+:/;
    function M(k) {
        return k[0] === "/" ? k[1] === "/" ? "scheme-relative" : "path-absolute" : C.test(k) ? "absolute" : "path-relative"
    }
    function G(k, X) {
        typeof k == "string" && (k = new s(k)),
        typeof X == "string" && (X = new s(X));
        const Z = X.pathname.split("/")
          , ne = k.pathname.split("/");
        for (ne.length > 0 && !ne[ne.length - 1] && ne.pop(); Z.length > 0 && ne.length > 0 && Z[0] === ne[0]; )
            Z.shift(),
            ne.shift();
        return ne.map( () => "..").concat(Z).join("/") + X.search + X.hash
    }
    const V = S(k => {
        k.pathname = k.pathname.replace(/\/?$/, "/")
    }
    )
      , K = S(k => {
        k.href = new s(".",k.toString()).toString()
    }
    )
      , W = S(k => {}
    );
    jt.normalize = W;
    function ue(k, X) {
        const Z = M(X)
          , ne = M(k);
        if (k = V(k),
        Z === "absolute")
            return x(X, void 0);
        if (ne === "absolute")
            return x(X, k);
        if (Z === "scheme-relative")
            return W(X);
        if (ne === "scheme-relative")
            return x(X, x(k, v)).slice(b.length);
        if (Z === "path-absolute")
            return W(X);
        if (ne === "path-absolute")
            return x(X, x(k, v)).slice(v.length);
        const oe = O(X + k)
          , fe = x(X, x(k, oe));
        return G(oe, fe)
    }
    jt.join = ue;
    function I(k, X) {
        const Z = ye(k, X);
        return typeof Z == "string" ? Z : W(X)
    }
    jt.relative = I;
    function ye(k, X) {
        if (M(k) !== M(X))
            return null;
        const ne = O(k + X)
          , oe = new s(k,ne)
          , fe = new s(X,ne);
        try {
            new s("",fe.toString())
        } catch {
            return null
        }
        return fe.protocol !== oe.protocol || fe.user !== oe.user || fe.password !== oe.password || fe.hostname !== oe.hostname || fe.port !== oe.port ? null : G(oe, fe)
    }
    function _e(k, X, Z) {
        k && M(X) === "path-absolute" && (X = X.replace(/^\//, ""));
        let ne = W(X || "");
        return k && (ne = ue(k, ne)),
        Z && (ne = ue(K(Z), ne)),
        ne
    }
    return jt.computeSourceURL = _e,
    jt
}
var uo = {}, sm;
function Rg() {
    if (sm)
        return uo;
    sm = 1;
    class s {
        constructor() {
            this._array = [],
            this._set = new Map
        }
        static fromArray(r, u) {
            const c = new s;
            for (let f = 0, d = r.length; f < d; f++)
                c.add(r[f], u);
            return c
        }
        size() {
            return this._set.size
        }
        add(r, u) {
            const c = this.has(r)
              , f = this._array.length;
            (!c || u) && this._array.push(r),
            c || this._set.set(r, f)
        }
        has(r) {
            return this._set.has(r)
        }
        indexOf(r) {
            const u = this._set.get(r);
            if (u >= 0)
                return u;
            throw new Error('"' + r + '" is not in the set.')
        }
        at(r) {
            if (r >= 0 && r < this._array.length)
                return this._array[r];
            throw new Error("No element indexed by " + r)
        }
        toArray() {
            return this._array.slice()
        }
    }
    return uo.ArraySet = s,
    uo
}
var oo = {}, rm;
function ev() {
    if (rm)
        return oo;
    rm = 1;
    const s = Ds();
    function l(u, c) {
        const f = u.generatedLine
          , d = c.generatedLine
          , m = u.generatedColumn
          , g = c.generatedColumn;
        return d > f || d == f && g >= m || s.compareByGeneratedPositionsInflated(u, c) <= 0
    }
    class r {
        constructor() {
            this._array = [],
            this._sorted = !0,
            this._last = {
                generatedLine: -1,
                generatedColumn: 0
            }
        }
        unsortedForEach(c, f) {
            this._array.forEach(c, f)
        }
        add(c) {
            l(this._last, c) ? (this._last = c,
            this._array.push(c)) : (this._sorted = !1,
            this._array.push(c))
        }
        toArray() {
            return this._sorted || (this._array.sort(s.compareByGeneratedPositionsInflated),
            this._sorted = !0),
            this._array
        }
    }
    return oo.MappingList = r,
    oo
}
var um;
function Ng() {
    if (um)
        return lo;
    um = 1;
    const s = Og()
      , l = Ds()
      , r = Rg().ArraySet
      , u = ev().MappingList;
    class c {
        constructor(d) {
            d || (d = {}),
            this._file = l.getArg(d, "file", null),
            this._sourceRoot = l.getArg(d, "sourceRoot", null),
            this._skipValidation = l.getArg(d, "skipValidation", !1),
            this._sources = new r,
            this._names = new r,
            this._mappings = new u,
            this._sourcesContents = null
        }
        static fromSourceMap(d) {
            const m = d.sourceRoot
              , g = new c({
                file: d.file,
                sourceRoot: m
            });
            return d.eachMapping(function(p) {
                const b = {
                    generated: {
                        line: p.generatedLine,
                        column: p.generatedColumn
                    }
                };
                p.source != null && (b.source = p.source,
                m != null && (b.source = l.relative(m, b.source)),
                b.original = {
                    line: p.originalLine,
                    column: p.originalColumn
                },
                p.name != null && (b.name = p.name)),
                g.addMapping(b)
            }),
            d.sources.forEach(function(p) {
                let b = p;
                m != null && (b = l.relative(m, p)),
                g._sources.has(b) || g._sources.add(b);
                const v = d.sourceContentFor(p);
                v != null && g.setSourceContent(p, v)
            }),
            g
        }
        addMapping(d) {
            const m = l.getArg(d, "generated")
              , g = l.getArg(d, "original", null);
            let p = l.getArg(d, "source", null)
              , b = l.getArg(d, "name", null);
            this._skipValidation || this._validateMapping(m, g, p, b),
            p != null && (p = String(p),
            this._sources.has(p) || this._sources.add(p)),
            b != null && (b = String(b),
            this._names.has(b) || this._names.add(b)),
            this._mappings.add({
                generatedLine: m.line,
                generatedColumn: m.column,
                originalLine: g && g.line,
                originalColumn: g && g.column,
                source: p,
                name: b
            })
        }
        setSourceContent(d, m) {
            let g = d;
            this._sourceRoot != null && (g = l.relative(this._sourceRoot, g)),
            m != null ? (this._sourcesContents || (this._sourcesContents = Object.create(null)),
            this._sourcesContents[l.toSetString(g)] = m) : this._sourcesContents && (delete this._sourcesContents[l.toSetString(g)],
            Object.keys(this._sourcesContents).length === 0 && (this._sourcesContents = null))
        }
        applySourceMap(d, m, g) {
            let p = m;
            if (m == null) {
                if (d.file == null)
                    throw new Error(`SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`);
                p = d.file
            }
            const b = this._sourceRoot;
            b != null && (p = l.relative(b, p));
            const v = this._mappings.toArray().length > 0 ? new r : this._sources
              , S = new r;
            this._mappings.unsortedForEach(function(x) {
                if (x.source === p && x.originalLine != null) {
                    const C = d.originalPositionFor({
                        line: x.originalLine,
                        column: x.originalColumn
                    });
                    C.source != null && (x.source = C.source,
                    g != null && (x.source = l.join(g, x.source)),
                    b != null && (x.source = l.relative(b, x.source)),
                    x.originalLine = C.line,
                    x.originalColumn = C.column,
                    C.name != null && (x.name = C.name))
                }
                const E = x.source;
                E != null && !v.has(E) && v.add(E);
                const O = x.name;
                O != null && !S.has(O) && S.add(O)
            }, this),
            this._sources = v,
            this._names = S,
            d.sources.forEach(function(x) {
                const E = d.sourceContentFor(x);
                E != null && (g != null && (x = l.join(g, x)),
                b != null && (x = l.relative(b, x)),
                this.setSourceContent(x, E))
            }, this)
        }
        _validateMapping(d, m, g, p) {
            if (m && typeof m.line != "number" && typeof m.column != "number")
                throw new Error("original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.");
            if (!(d && "line"in d && "column"in d && d.line > 0 && d.column >= 0 && !m && !g && !p)) {
                if (!(d && "line"in d && "column"in d && m && "line"in m && "column"in m && d.line > 0 && d.column >= 0 && m.line > 0 && m.column >= 0 && g))
                    throw new Error("Invalid mapping: " + JSON.stringify({
                        generated: d,
                        source: g,
                        original: m,
                        name: p
                    }))
            }
        }
        _serializeMappings() {
            let d = 0, m = 1, g = 0, p = 0, b = 0, v = 0, S = "", x, E, O, C;
            const M = this._mappings.toArray();
            for (let G = 0, V = M.length; G < V; G++) {
                if (E = M[G],
                x = "",
                E.generatedLine !== m)
                    for (d = 0; E.generatedLine !== m; )
                        x += ";",
                        m++;
                else if (G > 0) {
                    if (!l.compareByGeneratedPositionsInflated(E, M[G - 1]))
                        continue;
                    x += ","
                }
                x += s.encode(E.generatedColumn - d),
                d = E.generatedColumn,
                E.source != null && (C = this._sources.indexOf(E.source),
                x += s.encode(C - v),
                v = C,
                x += s.encode(E.originalLine - 1 - p),
                p = E.originalLine - 1,
                x += s.encode(E.originalColumn - g),
                g = E.originalColumn,
                E.name != null && (O = this._names.indexOf(E.name),
                x += s.encode(O - b),
                b = O)),
                S += x
            }
            return S
        }
        _generateSourcesContent(d, m) {
            return d.map(function(g) {
                if (!this._sourcesContents)
                    return null;
                m != null && (g = l.relative(m, g));
                const p = l.toSetString(g);
                return Object.prototype.hasOwnProperty.call(this._sourcesContents, p) ? this._sourcesContents[p] : null
            }, this)
        }
        toJSON() {
            const d = {
                version: this._version,
                sources: this._sources.toArray(),
                names: this._names.toArray(),
                mappings: this._serializeMappings()
            };
            return this._file != null && (d.file = this._file),
            this._sourceRoot != null && (d.sourceRoot = this._sourceRoot),
            this._sourcesContents && (d.sourcesContent = this._generateSourcesContent(d.sources, d.sourceRoot)),
            d
        }
        toString() {
            return JSON.stringify(this.toJSON())
        }
    }
    return c.prototype._version = 3,
    lo.SourceMapGenerator = c,
    lo
}
var Yl = {}, co = {}, om;
function tv() {
    return om || (om = 1,
    (function(s) {
        s.GREATEST_LOWER_BOUND = 1,
        s.LEAST_UPPER_BOUND = 2;
        function l(r, u, c, f, d, m) {
            const g = Math.floor((u - r) / 2) + r
              , p = d(c, f[g], !0);
            return p === 0 ? g : p > 0 ? u - g > 1 ? l(g, u, c, f, d, m) : m === s.LEAST_UPPER_BOUND ? u < f.length ? u : -1 : g : g - r > 1 ? l(r, g, c, f, d, m) : m == s.LEAST_UPPER_BOUND ? g : r < 0 ? -1 : r
        }
        s.search = function(u, c, f, d) {
            if (c.length === 0)
                return -1;
            let m = l(-1, c.length, u, c, f, d || s.GREATEST_LOWER_BOUND);
            if (m < 0)
                return -1;
            for (; m - 1 >= 0 && f(c[m], c[m - 1], !0) === 0; )
                --m;
            return m
        }
    }
    )(co)),
    co
}
var Ss = {
    exports: {}
}, cm;
function zg() {
    if (cm)
        return Ss.exports;
    cm = 1;
    let s = null;
    return Ss.exports = function() {
        if (typeof s == "string")
            return fetch(s).then(r => r.arrayBuffer());
        if (s instanceof ArrayBuffer)
            return Promise.resolve(s);
        throw new Error("You must provide the string URL or ArrayBuffer contents of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer")
    }
    ,
    Ss.exports.initialize = l => {
        s = l
    }
    ,
    Ss.exports
}
var fo, fm;
function nv() {
    if (fm)
        return fo;
    fm = 1;
    const s = zg();
    function l() {
        this.generatedLine = 0,
        this.generatedColumn = 0,
        this.lastGeneratedColumn = null,
        this.source = null,
        this.originalLine = null,
        this.originalColumn = null,
        this.name = null
    }
    let r = null;
    return fo = function() {
        if (r)
            return r;
        const c = [];
        return r = s().then(f => WebAssembly.instantiate(f, {
            env: {
                mapping_callback(d, m, g, p, b, v, S, x, E, O) {
                    const C = new l;
                    C.generatedLine = d + 1,
                    C.generatedColumn = m,
                    g && (C.lastGeneratedColumn = p - 1),
                    b && (C.source = v,
                    C.originalLine = S + 1,
                    C.originalColumn = x,
                    E && (C.name = O)),
                    c[c.length - 1](C)
                },
                start_all_generated_locations_for() {
                    console.time("all_generated_locations_for")
                },
                end_all_generated_locations_for() {
                    console.timeEnd("all_generated_locations_for")
                },
                start_compute_column_spans() {
                    console.time("compute_column_spans")
                },
                end_compute_column_spans() {
                    console.timeEnd("compute_column_spans")
                },
                start_generated_location_for() {
                    console.time("generated_location_for")
                },
                end_generated_location_for() {
                    console.timeEnd("generated_location_for")
                },
                start_original_location_for() {
                    console.time("original_location_for")
                },
                end_original_location_for() {
                    console.timeEnd("original_location_for")
                },
                start_parse_mappings() {
                    console.time("parse_mappings")
                },
                end_parse_mappings() {
                    console.timeEnd("parse_mappings")
                },
                start_sort_by_generated_location() {
                    console.time("sort_by_generated_location")
                },
                end_sort_by_generated_location() {
                    console.timeEnd("sort_by_generated_location")
                },
                start_sort_by_original_location() {
                    console.time("sort_by_original_location")
                },
                end_sort_by_original_location() {
                    console.timeEnd("sort_by_original_location")
                }
            }
        })).then(f => ({
            exports: f.instance.exports,
            withMappingCallback: (d, m) => {
                c.push(d);
                try {
                    m()
                } finally {
                    c.pop()
                }
            }
        })).then(null, f => {
            throw r = null,
            f
        }
        ),
        r
    }
    ,
    fo
}
var dm;
function av() {
    if (dm)
        return Yl;
    dm = 1;
    const s = Ds()
      , l = tv()
      , r = Rg().ArraySet;
    Og();
    const u = zg()
      , c = nv()
      , f = Symbol("smcInternal");
    class d {
        constructor(S, x) {
            return S == f ? Promise.resolve(this) : p(S, x)
        }
        static initialize(S) {
            u.initialize(S["lib/mappings.wasm"])
        }
        static fromSourceMap(S, x) {
            return b(S, x)
        }
        static async with(S, x, E) {
            const O = await new d(S,x);
            try {
                return await E(O)
            } finally {
                O.destroy()
            }
        }
        eachMapping(S, x, E) {
            throw new Error("Subclasses must implement eachMapping")
        }
        allGeneratedPositionsFor(S) {
            throw new Error("Subclasses must implement allGeneratedPositionsFor")
        }
        destroy() {
            throw new Error("Subclasses must implement destroy")
        }
    }
    d.prototype._version = 3,
    d.GENERATED_ORDER = 1,
    d.ORIGINAL_ORDER = 2,
    d.GREATEST_LOWER_BOUND = 1,
    d.LEAST_UPPER_BOUND = 2,
    Yl.SourceMapConsumer = d;
    class m extends d {
        constructor(S, x) {
            return super(f).then(E => {
                let O = S;
                typeof S == "string" && (O = s.parseSourceMapInput(S));
                const C = s.getArg(O, "version")
                  , M = s.getArg(O, "sources").map(String)
                  , G = s.getArg(O, "names", [])
                  , V = s.getArg(O, "sourceRoot", null)
                  , K = s.getArg(O, "sourcesContent", null)
                  , W = s.getArg(O, "mappings")
                  , ue = s.getArg(O, "file", null)
                  , I = s.getArg(O, "x_google_ignoreList", null);
                if (C != E._version)
                    throw new Error("Unsupported version: " + C);
                return E._sourceLookupCache = new Map,
                E._names = r.fromArray(G.map(String), !0),
                E._sources = r.fromArray(M, !0),
                E._absoluteSources = r.fromArray(E._sources.toArray().map(function(ye) {
                    return s.computeSourceURL(V, ye, x)
                }), !0),
                E.sourceRoot = V,
                E.sourcesContent = K,
                E._mappings = W,
                E._sourceMapURL = x,
                E.file = ue,
                E.x_google_ignoreList = I,
                E._computedColumnSpans = !1,
                E._mappingsPtr = 0,
                E._wasm = null,
                c().then(ye => (E._wasm = ye,
                E))
            }
            )
        }
        _findSourceIndex(S) {
            const x = this._sourceLookupCache.get(S);
            if (typeof x == "number")
                return x;
            const E = s.computeSourceURL(null, S, this._sourceMapURL);
            if (this._absoluteSources.has(E)) {
                const C = this._absoluteSources.indexOf(E);
                return this._sourceLookupCache.set(S, C),
                C
            }
            const O = s.computeSourceURL(this.sourceRoot, S, this._sourceMapURL);
            if (this._absoluteSources.has(O)) {
                const C = this._absoluteSources.indexOf(O);
                return this._sourceLookupCache.set(S, C),
                C
            }
            return -1
        }
        static fromSourceMap(S, x) {
            return new m(S.toString())
        }
        get sources() {
            return this._absoluteSources.toArray()
        }
        _getMappingsPtr() {
            return this._mappingsPtr === 0 && this._parseMappings(),
            this._mappingsPtr
        }
        _parseMappings() {
            const S = this._mappings
              , x = S.length
              , E = this._wasm.exports.allocate_mappings(x) >>> 0
              , O = new Uint8Array(this._wasm.exports.memory.buffer,E,x);
            for (let M = 0; M < x; M++)
                O[M] = S.charCodeAt(M);
            const C = this._wasm.exports.parse_mappings(E);
            if (!C) {
                const M = this._wasm.exports.get_last_error();
                let G = `Error parsing mappings (code ${M}): `;
                switch (M) {
                case 1:
                    G += "the mappings contained a negative line, column, source index, or name index";
                    break;
                case 2:
                    G += "the mappings contained a number larger than 2**32";
                    break;
                case 3:
                    G += "reached EOF while in the middle of parsing a VLQ";
                    break;
                case 4:
                    G += "invalid base 64 character while parsing a VLQ";
                    break;
                default:
                    G += "unknown error code";
                    break
                }
                throw new Error(G)
            }
            this._mappingsPtr = C
        }
        eachMapping(S, x, E) {
            const O = x || null
              , C = E || d.GENERATED_ORDER;
            this._wasm.withMappingCallback(M => {
                M.source !== null && (M.source = this._absoluteSources.at(M.source),
                M.name !== null && (M.name = this._names.at(M.name))),
                this._computedColumnSpans && M.lastGeneratedColumn === null && (M.lastGeneratedColumn = 1 / 0),
                S.call(O, M)
            }
            , () => {
                switch (C) {
                case d.GENERATED_ORDER:
                    this._wasm.exports.by_generated_location(this._getMappingsPtr());
                    break;
                case d.ORIGINAL_ORDER:
                    this._wasm.exports.by_original_location(this._getMappingsPtr());
                    break;
                default:
                    throw new Error("Unknown order of iteration.")
                }
            }
            )
        }
        allGeneratedPositionsFor(S) {
            let x = s.getArg(S, "source");
            const E = s.getArg(S, "line")
              , O = S.column || 0;
            if (x = this._findSourceIndex(x),
            x < 0)
                return [];
            if (E < 1)
                throw new Error("Line numbers must be >= 1");
            if (O < 0)
                throw new Error("Column numbers must be >= 0");
            const C = [];
            return this._wasm.withMappingCallback(M => {
                let G = M.lastGeneratedColumn;
                this._computedColumnSpans && G === null && (G = 1 / 0),
                C.push({
                    line: M.generatedLine,
                    column: M.generatedColumn,
                    lastColumn: G
                })
            }
            , () => {
                this._wasm.exports.all_generated_locations_for(this._getMappingsPtr(), x, E - 1, "column"in S, O)
            }
            ),
            C
        }
        destroy() {
            this._mappingsPtr !== 0 && (this._wasm.exports.free_mappings(this._mappingsPtr),
            this._mappingsPtr = 0)
        }
        computeColumnSpans() {
            this._computedColumnSpans || (this._wasm.exports.compute_column_spans(this._getMappingsPtr()),
            this._computedColumnSpans = !0)
        }
        originalPositionFor(S) {
            const x = {
                generatedLine: s.getArg(S, "line"),
                generatedColumn: s.getArg(S, "column")
            };
            if (x.generatedLine < 1)
                throw new Error("Line numbers must be >= 1");
            if (x.generatedColumn < 0)
                throw new Error("Column numbers must be >= 0");
            let E = s.getArg(S, "bias", d.GREATEST_LOWER_BOUND);
            E == null && (E = d.GREATEST_LOWER_BOUND);
            let O;
            if (this._wasm.withMappingCallback(C => O = C, () => {
                this._wasm.exports.original_location_for(this._getMappingsPtr(), x.generatedLine - 1, x.generatedColumn, E)
            }
            ),
            O && O.generatedLine === x.generatedLine) {
                let C = s.getArg(O, "source", null);
                C !== null && (C = this._absoluteSources.at(C));
                let M = s.getArg(O, "name", null);
                return M !== null && (M = this._names.at(M)),
                {
                    source: C,
                    line: s.getArg(O, "originalLine", null),
                    column: s.getArg(O, "originalColumn", null),
                    name: M
                }
            }
            return {
                source: null,
                line: null,
                column: null,
                name: null
            }
        }
        hasContentsOfAllSources() {
            return this.sourcesContent ? this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(S) {
                return S == null
            }) : !1
        }
        sourceContentFor(S, x) {
            if (!this.sourcesContent)
                return null;
            const E = this._findSourceIndex(S);
            if (E >= 0)
                return this.sourcesContent[E];
            if (x)
                return null;
            throw new Error('"' + S + '" is not in the SourceMap.')
        }
        generatedPositionFor(S) {
            let x = s.getArg(S, "source");
            if (x = this._findSourceIndex(x),
            x < 0)
                return {
                    line: null,
                    column: null,
                    lastColumn: null
                };
            const E = {
                source: x,
                originalLine: s.getArg(S, "line"),
                originalColumn: s.getArg(S, "column")
            };
            if (E.originalLine < 1)
                throw new Error("Line numbers must be >= 1");
            if (E.originalColumn < 0)
                throw new Error("Column numbers must be >= 0");
            let O = s.getArg(S, "bias", d.GREATEST_LOWER_BOUND);
            O == null && (O = d.GREATEST_LOWER_BOUND);
            let C;
            if (this._wasm.withMappingCallback(M => C = M, () => {
                this._wasm.exports.generated_location_for(this._getMappingsPtr(), E.source, E.originalLine - 1, E.originalColumn, O)
            }
            ),
            C && C.source === E.source) {
                let M = C.lastGeneratedColumn;
                return this._computedColumnSpans && M === null && (M = 1 / 0),
                {
                    line: s.getArg(C, "generatedLine", null),
                    column: s.getArg(C, "generatedColumn", null),
                    lastColumn: M
                }
            }
            return {
                line: null,
                column: null,
                lastColumn: null
            }
        }
    }
    m.prototype.consumer = d,
    Yl.BasicSourceMapConsumer = m;
    class g extends d {
        constructor(S, x) {
            return super(f).then(E => {
                let O = S;
                typeof S == "string" && (O = s.parseSourceMapInput(S));
                const C = s.getArg(O, "version")
                  , M = s.getArg(O, "sections");
                if (C != E._version)
                    throw new Error("Unsupported version: " + C);
                let G = {
                    line: -1,
                    column: 0
                };
                return Promise.all(M.map(V => {
                    if (V.url)
                        throw new Error("Support for url field in sections not implemented.");
                    const K = s.getArg(V, "offset")
                      , W = s.getArg(K, "line")
                      , ue = s.getArg(K, "column");
                    if (W < G.line || W === G.line && ue < G.column)
                        throw new Error("Section offsets must be ordered and non-overlapping.");
                    return G = K,
                    new d(s.getArg(V, "map"),x).then(ye => ({
                        generatedOffset: {
                            generatedLine: W + 1,
                            generatedColumn: ue + 1
                        },
                        consumer: ye
                    }))
                }
                )).then(V => (E._sections = V,
                E))
            }
            )
        }
        get sources() {
            const S = [];
            for (let x = 0; x < this._sections.length; x++)
                for (let E = 0; E < this._sections[x].consumer.sources.length; E++)
                    S.push(this._sections[x].consumer.sources[E]);
            return S
        }
        originalPositionFor(S) {
            const x = {
                generatedLine: s.getArg(S, "line"),
                generatedColumn: s.getArg(S, "column")
            }
              , E = l.search(x, this._sections, function(C, M) {
                const G = C.generatedLine - M.generatedOffset.generatedLine;
                return G || C.generatedColumn - (M.generatedOffset.generatedColumn - 1)
            })
              , O = this._sections[E];
            return O ? O.consumer.originalPositionFor({
                line: x.generatedLine - (O.generatedOffset.generatedLine - 1),
                column: x.generatedColumn - (O.generatedOffset.generatedLine === x.generatedLine ? O.generatedOffset.generatedColumn - 1 : 0),
                bias: S.bias
            }) : {
                source: null,
                line: null,
                column: null,
                name: null
            }
        }
        hasContentsOfAllSources() {
            return this._sections.every(function(S) {
                return S.consumer.hasContentsOfAllSources()
            })
        }
        sourceContentFor(S, x) {
            for (let E = 0; E < this._sections.length; E++) {
                const C = this._sections[E].consumer.sourceContentFor(S, !0);
                if (C)
                    return C
            }
            if (x)
                return null;
            throw new Error('"' + S + '" is not in the SourceMap.')
        }
        _findSectionIndex(S) {
            for (let x = 0; x < this._sections.length; x++) {
                const {consumer: E} = this._sections[x];
                if (E._findSourceIndex(S) !== -1)
                    return x
            }
            return -1
        }
        generatedPositionFor(S) {
            const x = this._findSectionIndex(s.getArg(S, "source"))
              , E = x >= 0 ? this._sections[x] : null
              , O = x >= 0 && x + 1 < this._sections.length ? this._sections[x + 1] : null
              , C = E && E.consumer.generatedPositionFor(S);
            if (C && C.line !== null) {
                const M = E.generatedOffset.generatedLine - 1
                  , G = E.generatedOffset.generatedColumn - 1;
                return C.line === 1 && (C.column += G,
                typeof C.lastColumn == "number" && (C.lastColumn += G)),
                C.lastColumn === 1 / 0 && O && C.line === O.generatedOffset.generatedLine && (C.lastColumn = O.generatedOffset.generatedColumn - 2),
                C.line += M,
                C
            }
            return {
                line: null,
                column: null,
                lastColumn: null
            }
        }
        allGeneratedPositionsFor(S) {
            const x = this._findSectionIndex(s.getArg(S, "source"))
              , E = x >= 0 ? this._sections[x] : null
              , O = x >= 0 && x + 1 < this._sections.length ? this._sections[x + 1] : null;
            return E ? E.consumer.allGeneratedPositionsFor(S).map(C => {
                const M = E.generatedOffset.generatedLine - 1
                  , G = E.generatedOffset.generatedColumn - 1;
                return C.line === 1 && (C.column += G,
                typeof C.lastColumn == "number" && (C.lastColumn += G)),
                C.lastColumn === 1 / 0 && O && C.line === O.generatedOffset.generatedLine && (C.lastColumn = O.generatedOffset.generatedColumn - 2),
                C.line += M,
                C
            }
            ) : []
        }
        eachMapping(S, x, E) {
            this._sections.forEach( (O, C) => {
                const M = C + 1 < this._sections.length ? this._sections[C + 1] : null
                  , {generatedOffset: G} = O
                  , V = G.generatedLine - 1
                  , K = G.generatedColumn - 1;
                O.consumer.eachMapping(function(W) {
                    W.generatedLine === 1 && (W.generatedColumn += K,
                    typeof W.lastGeneratedColumn == "number" && (W.lastGeneratedColumn += K)),
                    W.lastGeneratedColumn === 1 / 0 && M && W.generatedLine === M.generatedOffset.generatedLine && (W.lastGeneratedColumn = M.generatedOffset.generatedColumn - 2),
                    W.generatedLine += V,
                    S.call(this, W)
                }, x, E)
            }
            )
        }
        computeColumnSpans() {
            for (let S = 0; S < this._sections.length; S++)
                this._sections[S].consumer.computeColumnSpans()
        }
        destroy() {
            for (let S = 0; S < this._sections.length; S++)
                this._sections[S].consumer.destroy()
        }
    }
    Yl.IndexedSourceMapConsumer = g;
    function p(v, S) {
        let x = v;
        typeof v == "string" && (x = s.parseSourceMapInput(v));
        const E = x.sections != null ? new g(x,S) : new m(x,S);
        return Promise.resolve(E)
    }
    function b(v, S) {
        return m.fromSourceMap(v, S)
    }
    return Yl
}
var ho = {}, hm;
function lv() {
    if (hm)
        return ho;
    hm = 1;
    const s = Ng().SourceMapGenerator
      , l = Ds()
      , r = /(\r?\n)/
      , u = 10
      , c = "$$$isSourceNode$$$";
    class f {
        constructor(m, g, p, b, v) {
            this.children = [],
            this.sourceContents = {},
            this.line = m ?? null,
            this.column = g ?? null,
            this.source = p ?? null,
            this.name = v ?? null,
            this[c] = !0,
            b != null && this.add(b)
        }
        static fromStringWithSourceMap(m, g, p) {
            const b = new f
              , v = m.split(r);
            let S = 0;
            const x = function() {
                const V = W()
                  , K = W() || "";
                return V + K;
                function W() {
                    return S < v.length ? v[S++] : void 0
                }
            };
            let E = 1, O = 0, C = null, M;
            return g.eachMapping(function(V) {
                if (C !== null)
                    if (E < V.generatedLine)
                        G(C, x()),
                        E++,
                        O = 0;
                    else {
                        M = v[S] || "";
                        const K = M.substr(0, V.generatedColumn - O);
                        v[S] = M.substr(V.generatedColumn - O),
                        O = V.generatedColumn,
                        G(C, K),
                        C = V;
                        return
                    }
                for (; E < V.generatedLine; )
                    b.add(x()),
                    E++;
                O < V.generatedColumn && (M = v[S] || "",
                b.add(M.substr(0, V.generatedColumn)),
                v[S] = M.substr(V.generatedColumn),
                O = V.generatedColumn),
                C = V
            }, this),
            S < v.length && (C && G(C, x()),
            b.add(v.splice(S).join(""))),
            g.sources.forEach(function(V) {
                const K = g.sourceContentFor(V);
                K != null && (p != null && (V = l.join(p, V)),
                b.setSourceContent(V, K))
            }),
            b;
            function G(V, K) {
                if (V === null || V.source === void 0)
                    b.add(K);
                else {
                    const W = p ? l.join(p, V.source) : V.source;
                    b.add(new f(V.originalLine,V.originalColumn,W,K,V.name))
                }
            }
        }
        add(m) {
            if (Array.isArray(m))
                m.forEach(function(g) {
                    this.add(g)
                }, this);
            else if (m[c] || typeof m == "string")
                m && this.children.push(m);
            else
                throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + m);
            return this
        }
        prepend(m) {
            if (Array.isArray(m))
                for (let g = m.length - 1; g >= 0; g--)
                    this.prepend(m[g]);
            else if (m[c] || typeof m == "string")
                this.children.unshift(m);
            else
                throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + m);
            return this
        }
        walk(m) {
            let g;
            for (let p = 0, b = this.children.length; p < b; p++)
                g = this.children[p],
                g[c] ? g.walk(m) : g !== "" && m(g, {
                    source: this.source,
                    line: this.line,
                    column: this.column,
                    name: this.name
                })
        }
        join(m) {
            let g, p;
            const b = this.children.length;
            if (b > 0) {
                for (g = [],
                p = 0; p < b - 1; p++)
                    g.push(this.children[p]),
                    g.push(m);
                g.push(this.children[p]),
                this.children = g
            }
            return this
        }
        replaceRight(m, g) {
            const p = this.children[this.children.length - 1];
            return p[c] ? p.replaceRight(m, g) : typeof p == "string" ? this.children[this.children.length - 1] = p.replace(m, g) : this.children.push("".replace(m, g)),
            this
        }
        setSourceContent(m, g) {
            this.sourceContents[l.toSetString(m)] = g
        }
        walkSourceContents(m) {
            for (let p = 0, b = this.children.length; p < b; p++)
                this.children[p][c] && this.children[p].walkSourceContents(m);
            const g = Object.keys(this.sourceContents);
            for (let p = 0, b = g.length; p < b; p++)
                m(l.fromSetString(g[p]), this.sourceContents[g[p]])
        }
        toString() {
            let m = "";
            return this.walk(function(g) {
                m += g
            }),
            m
        }
        toStringWithSourceMap(m) {
            const g = {
                code: "",
                line: 1,
                column: 0
            }
              , p = new s(m);
            let b = !1
              , v = null
              , S = null
              , x = null
              , E = null;
            return this.walk(function(O, C) {
                g.code += O,
                C.source !== null && C.line !== null && C.column !== null ? ((v !== C.source || S !== C.line || x !== C.column || E !== C.name) && p.addMapping({
                    source: C.source,
                    original: {
                        line: C.line,
                        column: C.column
                    },
                    generated: {
                        line: g.line,
                        column: g.column
                    },
                    name: C.name
                }),
                v = C.source,
                S = C.line,
                x = C.column,
                E = C.name,
                b = !0) : b && (p.addMapping({
                    generated: {
                        line: g.line,
                        column: g.column
                    }
                }),
                v = null,
                b = !1);
                for (let M = 0, G = O.length; M < G; M++)
                    O.charCodeAt(M) === u ? (g.line++,
                    g.column = 0,
                    M + 1 === G ? (v = null,
                    b = !1) : b && p.addMapping({
                        source: C.source,
                        original: {
                            line: C.line,
                            column: C.column
                        },
                        generated: {
                            line: g.line,
                            column: g.column
                        },
                        name: C.name
                    })) : g.column++
            }),
            this.walkSourceContents(function(O, C) {
                p.setSourceContent(O, C)
            }),
            {
                code: g.code,
                map: p
            }
        }
    }
    return ho.SourceNode = f,
    ho
}
var mm;
function iv() {
    return mm || (mm = 1,
    Gl.SourceMapGenerator = Ng().SourceMapGenerator,
    Gl.SourceMapConsumer = av().SourceMapConsumer,
    Gl.SourceNode = lv().SourceNode),
    Gl
}
var No = iv();
function sv(s, l, r) {
    const u = s[l];
    if (!u)
        return {
            lineIndex: l,
            column: r
        };
    const c = u.trim()
      , f = /^<\/[A-Za-z][A-Za-z0-9\-_.]*\s*>$/.test(c)
      , d = /<\/[A-Za-z][A-Za-z0-9\-_.]*\s*>$/.test(c);
    let m = !1;
    if (r != null) {
        const g = u.substring(0, r);
        m = /<\/[A-Za-z][A-Za-z0-9\-_.]*\s*>$/.test(g)
    }
    if (f || d || m) {
        if (r != null) {
            const g = u.substring(r)
              , p = g.match(/<([A-Za-z][A-Za-z0-9\-_.]*)/);
            if (p && g[p.index + 1] !== "/")
                return {
                    lineIndex: l,
                    column: r + p.index + 1
                }
        }
        for (let g = l + 1; g < s.length && g < l + 50; g++) {
            const p = s[g]
              , b = p.match(/<([A-Za-z][A-Za-z0-9\-_.]*)/);
            if (b && p[b.index + 1] !== "/")
                return {
                    lineIndex: g,
                    column: b.index + 1
                }
        }
    }
    return {
        lineIndex: l,
        column: r
    }
}
function Go(s, l, r) {
    let u = 0;
    for (let c = l; c < s.length; c++) {
        const f = s[c]
          , d = c === l ? r : 0;
        for (let m = d; m < f.length; m++) {
            const g = f[m];
            if (g === "{")
                u++;
            else if (g === "}")
                u--;
            else if (u === 0) {
                if (g === "/" && f[m + 1] === ">")
                    return {
                        lineIndex: c,
                        columnEnd: m + 2,
                        isSelfClosing: !0
                    };
                if (g === ">")
                    return {
                        lineIndex: c,
                        columnEnd: m + 1,
                        isSelfClosing: !1
                    }
            }
        }
    }
}
function Lg(s, l, r, u) {
    let c = 1;
    const f = new RegExp(`<${l}(?=\\s|>|/>)`,"g")
      , d = new RegExp(`</${l}\\s*>`,"g");
    for (let m = r; m < s.length; m++) {
        const g = m === r ? u : 0
          , p = s[m].substring(g)
          , b = [];
        let v;
        for (f.lastIndex = 0; (v = f.exec(p)) !== null; ) {
            const S = Go([p], 0, v.index + v[0].length);
            S && !S.isSelfClosing && b.push({
                type: "open",
                index: v.index,
                length: v[0].length
            })
        }
        for (d.lastIndex = 0; (v = d.exec(p)) !== null; )
            b.push({
                type: "close",
                index: v.index,
                length: v[0].length
            });
        b.sort( (S, x) => S.index - x.index);
        for (const S of b)
            if (S.type === "open")
                c++;
            else if (S.type === "close" && (c--,
            c === 0))
                return {
                    lineIndex: m,
                    columnEnd: g + S.index + S.length
                }
    }
}
function gm(s, l, r) {
    let u;
    for (let c = l; c >= 0; c--) {
        const f = s[c]
          , d = /<([A-Za-z][A-Za-z0-9\-_.]*)/g;
        let m;
        for (; (m = d.exec(f)) !== null; ) {
            const g = m.index
              , p = m[1];
            if (f[g + 1] === "/" || !(c < l || c === l && g <= (r ?? f.length)))
                continue;
            const v = g + m[0].length
              , S = Go(s, c, v);
            if (!S)
                continue;
            let x = c
              , E = S.columnEnd;
            if (!S.isSelfClosing) {
                const C = Lg(s, p, c, S.columnEnd);
                if (!C)
                    continue;
                x = C.lineIndex,
                E = C.columnEnd
            }
            (c < l || c === l && g <= (r ?? f.length)) && (x > l || x === l && E >= (r ?? 0)) && (!u || x - c < u.closeLineIndex - u.lineIndex || x - c === u.closeLineIndex - u.lineIndex && E - g < u.closeColumnEnd - u.columnStart) && (u = {
                tagName: p,
                lineIndex: c,
                columnStart: g,
                columnEnd: S.columnEnd,
                isSelfClosing: S.isSelfClosing,
                closeLineIndex: x,
                closeColumnEnd: E
            })
        }
    }
    return u
}
function rv(s, l, r) {
    const u = new RegExp(`<(${r})(?=\\s|>|/>)`,"i");
    for (let c = l + 1; c < s.length && c < l + 50; c++) {
        const f = s[c]
          , d = u.exec(f);
        if (d) {
            const m = d.index
              , g = d[1]
              , p = m + d[0].length
              , b = Go(s, c, p);
            if (!b)
                continue;
            let v = c
              , S = b.columnEnd;
            if (!b.isSelfClosing) {
                const x = Lg(s, g, c, b.columnEnd);
                if (!x)
                    continue;
                v = x.lineIndex,
                S = x.columnEnd
            }
            return {
                tagName: g,
                lineIndex: c,
                columnStart: m,
                columnEnd: b.columnEnd,
                isSelfClosing: b.isSelfClosing,
                closeLineIndex: v,
                closeColumnEnd: S
            }
        }
    }
}
function uv(s, l, r, u, c) {
    if (l === u)
        return s[l].substring(r, c);
    let f = s[l].substring(r);
    for (let d = l + 1; d < u; d++)
        f += `
` + s[d];
    return f += `
` + s[u].substring(0, c),
    f
}
function ov(s, l, r=10) {
    const u = s.split(`
`)
      , c = Math.max(0, l - r - 1)
      , f = Math.min(u.length - 1, l + r - 1)
      , d = [];
    for (let m = c; m <= f; m++) {
        const g = m + 1
          , v = `${g === l ? ">>>" : "   "} ${g.toString().padStart(4, " ")} | ${u[m] || ""}`;
        d.push(v)
    }
    return d.join(`
`)
}
async function cv(s) {
    try {
        const l = await fetch(s);
        if (!l.ok)
            throw new Error(`Failed to load source map: ${l.status}`);
        return await l.json()
    } catch (l) {
        const r = l instanceof Error ? l.message : String(l);
        console.warn("Error loading source map from", s, r)
    }
}
let mo = !1;
const ka = new Map
  , fv = 300 * 1e3
  , dv = 1e3;
setInterval( () => {
    const s = Date.now();
    for (const [l,r] of ka.entries())
        s - r.timestamp > fv && ka.delete(l)
}
, 6e4);
async function hv() {
    if (!mo)
        try {
            await No.SourceMapConsumer.initialize({
                "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.6/lib/mappings.wasm"
            }),
            mo = !0
        } catch (s) {
            console.warn("Failed to initialize SourceMapConsumer:", s);
            try {
                await No.SourceMapConsumer.initialize({}),
                mo = !0
            } catch (l) {
                throw console.error("SourceMapConsumer initialization failed completely:", l),
                l
            }
        }
}
function mv(s) {
    if (!s || !s.stack)
        return `no-stack-${s?.message || "unknown"}`;
    const u = s.stack.split(`
`).slice(0, 6).map(c => c.replace(/\?t=\d+/g, "").replace(/\?v=[\w\d]+/g, "").replace(/\d{13,}/g, "TIMESTAMP"));
    return `${s.name || "Error"}-${s.message}-${u.join("|")}`
}
const gv = "preview-inject/";
async function Fl(s, l=10, r) {
    if (!s || !s.stack)
        return {
            errorMessage: s?.message || "",
            mappedStack: s?.stack || "",
            sourceContext: []
        };
    const u = mv(s);
    if (ka.has(u)) {
        const v = ka.get(u);
        return console.log("Using cached error mapping for:", u),
        v
    }
    if (ka.size >= dv)
        return null;
    await hv();
    const c = s.stack.split(`
`)
      , f = []
      , d = []
      , m = new Map
      , g = new Map;
    let p = 0;
    for (const v of c) {
        const S = v.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)|at\s+(.+?):(\d+):(\d+)|([^@]*)@(.+?):(\d+):(\d+)/);
        if (!S) {
            f.push(v);
            continue
        }
        let x, E, O, C;
        S[1] ? (x = S[1],
        E = S[2],
        O = parseInt(S[3]),
        C = parseInt(S[4])) : S[5] ? (x = "<anonymous>",
        E = S[5],
        O = parseInt(S[6]),
        C = parseInt(S[7])) : (x = S[8],
        E = S[9],
        O = parseInt(S[10]),
        C = parseInt(S[11]));
        try {
            const M = `${E}.map`;
            let G = m.get(M);
            if (!G) {
                const K = await cv(M);
                G = await new No.SourceMapConsumer(K),
                m.set(M, G)
            }
            const V = G.originalPositionFor({
                line: O,
                column: C
            });
            if (V.source) {
                if (V.source.includes(gv))
                    continue;
                const K = V.source.split("/").filter(I => I !== "..").join("/")
                  , ue = `    at ${V.name || x} (${K}:${V.line}:${V.column})`;
                if (f.push(ue),
                V.line && V.column && p < l) {
                    p++;
                    try {
                        const I = await pv(G, V.source, g);
                        if (I) {
                            const ye = K.includes("node_modules")
                              , _e = /\.(tsx|jsx)$/.test(K);
                            let k;
                            if (!ye && _e) {
                                const Z = yv(I, V.line, V.column, r);
                                Z && (k = {
                                    tagName: Z.tagName,
                                    code: Z.code,
                                    context: Z.context,
                                    startLine: Z.startLine,
                                    endLine: Z.endLine
                                })
                            }
                            const X = ov(I, V.line, ye ? 1 : 10);
                            d.push({
                                file: K,
                                line: V.line,
                                column: V.column,
                                context: X,
                                closedBlock: k
                            })
                        }
                    } catch (I) {
                        console.warn("Failed to extract source context:", I)
                    }
                }
            } else
                f.push(v)
        } catch (M) {
            console.warn("Failed to map stack line:", v, M),
            f.push(v)
        }
    }
    for (const v of m.values())
        v.destroy();
    const b = {
        errorMessage: s?.message || "",
        mappedStack: f.join(`
`),
        sourceContext: d
    };
    return b.timestamp = Date.now(),
    ka.set(u, b),
    b
}
async function pv(s, l, r) {
    if (r.has(l))
        return r.get(l) || null;
    const u = s.sourceContentFor(l);
    return u ? (r.set(l, u),
    u) : null
}
function yv(s, l, r, u) {
    const c = s.split(`
`);
    let f = l - 1;
    if (f < 0 || f >= c.length)
        return;
    let d = gm(c, f, r);
    if (u && d) {
        const x = u.toLowerCase()
          , E = d.tagName.toLowerCase();
        if (x !== E) {
            const O = rv(c, f, x);
            O && (d = O)
        }
    } else if (!d) {
        const x = sv(c, f, r);
        d = gm(c, x.lineIndex, x.column)
    }
    if (!d)
        return;
    const {tagName: m, lineIndex: g, columnStart: p, closeLineIndex: b, closeColumnEnd: v, isSelfClosing: S} = d;
    return {
        tagName: m,
        code: uv(c, g, p, b, v),
        context: c.slice(g, b + 1).join(`
`),
        startLine: g + 1,
        endLine: b + 1,
        isSelfClosing: S
    }
}
class vv {
    client;
    originalConsoleError;
    constructor() {
        const l = B0();
        l.length > 0 && l.forEach(r => {
            r.type === "console.error" ? this.handleConsoleError(r.args) : r.type === "runtime" && this.handleError(r.args)
        }
        ),
        this.client = new Xa(window.parent),
        this.originalConsoleError = console.error,
        this.initErrorHandlers()
    }
    initErrorHandlers() {
        window.addEventListener("error", this.handleError.bind(this)),
        window.addEventListener("unhandledrejection", this.handlePromiseRejection.bind(this)),
        this.interceptConsoleError()
    }
    async handleError(l) {
        const r = l.target;
        if (!(r && r instanceof HTMLElement && r.tagName && ["IMG", "SCRIPT", "LINK", "VIDEO", "AUDIO", "SOURCE", "IFRAME"].includes(r.tagName)) && l.error && l.error.stack)
            try {
                const u = await Fl(l.error);
                this.sendError(u)
            } catch (u) {
                console.warn("Failed to map error stack:", u)
            }
    }
    async handlePromiseRejection(l) {
        const r = l.reason instanceof Error ? l.reason : new Error(String(l.reason));
        if (r.stack)
            try {
                const u = await Fl(r);
                this.sendError(u)
            } catch (u) {
                console.warn("Failed to map promise rejection stack:", u)
            }
    }
    interceptConsoleError() {
        console.error = (...l) => {
            this.originalConsoleError.apply(console, l);
            const r = l.find(u => u instanceof Error);
            if (r && r.stack)
                this.handleConsoleError(r);
            else if (l.length > 0) {
                const u = l.map(f => typeof f == "object" ? JSON.stringify(f) : String(f)).join(" ")
                  , c = new Error(u);
                this.handleConsoleError(c)
            }
        }
    }
    async handleConsoleError(l) {
        try {
            const r = await Fl(l);
            this.sendError(r)
        } catch (r) {
            console.warn("Failed to map console error stack:", r)
        }
    }
    reportError(l) {
        this.handleReactError(l)
    }
    async handleReactError(l) {
        try {
            const r = await Fl(l);
            this.sendError(r)
        } catch (r) {
            console.warn("Failed to map React error stack:", r)
        }
    }
    async sendError(l) {
        if (!l) {
            console.warn("error is too many");
            return
        }
        if (l.sourceContext.length !== 0)
            try {
                await this.client.post("runtime-error", l)
            } catch (r) {
                console.warn("Failed to send error to parent:", r)
            }
    }
    destroy() {
        console.error = this.originalConsoleError,
        this.client.destroy()
    }
}
function bv() {
    const s = new vv;
    return window.runtimeErrorCollector = s,
    s
}
class xv {
    _client;
    constructor() {
        this._client = new Xa(window.parent),
        this._domContentLoadedListener()
    }
    _domContentLoadedListener() {
        const l = () => {
            console.log("DOMContentLoaded"),
            this._client.post("DOMContentLoaded"),
            document.removeEventListener("DOMContentLoaded", l)
        }
        ;
        document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", l) : (console.log("DOMContentLoaded"),
        this._client.post("DOMContentLoaded"))
    }
}
function Sv() {
    return new xv
}
const Yo = s => {
    const l = "/preview/9b2e8b58-f57b-4d65-baad-9e44f3a9e6a7/7401061";
    return s.startsWith(l) ? s.replaceAll(l, "") || "/" : s || "/"
}
  , Ev = "modulepreload"
  , wv = function(s) {
    return "/preview/9b2e8b58-f57b-4d65-baad-9e44f3a9e6a7/7401061/" + s
}
  , pm = {}
  , Mg = function(l, r, u) {
    let c = Promise.resolve();
    if (r && r.length > 0) {
        let p = function(b) {
            return Promise.all(b.map(v => Promise.resolve(v).then(S => ({
                status: "fulfilled",
                value: S
            }), S => ({
                status: "rejected",
                reason: S
            }))))
        };
        var d = p;
        document.getElementsByTagName("link");
        const m = document.querySelector("meta[property=csp-nonce]")
          , g = m?.nonce || m?.getAttribute("nonce");
        c = p(r.map(b => {
            if (b = wv(b),
            b in pm)
                return;
            pm[b] = !0;
            const v = b.endsWith(".css")
              , S = v ? '[rel="stylesheet"]' : "";
            if (document.querySelector(`link[href="${b}"]${S}`))
                return;
            const x = document.createElement("link");
            if (x.rel = v ? "stylesheet" : Ev,
            v || (x.as = "script"),
            x.crossOrigin = "",
            x.href = b,
            g && x.setAttribute("nonce", g),
            document.head.appendChild(x),
            v)
                return new Promise( (E, O) => {
                    x.addEventListener("load", E),
                    x.addEventListener("error", () => O(new Error(`Unable to preload CSS for ${b}`)))
                }
                )
        }
        ))
    }
    function f(m) {
        const g = new Event("vite:preloadError",{
            cancelable: !0
        });
        if (g.payload = m,
        window.dispatchEvent(g),
        !g.defaultPrevented)
            throw m
    }
    return c.then(m => {
        for (const g of m || [])
            g.status === "rejected" && f(g.reason);
        return l().catch(f)
    }
    )
};
async function Cv() {
    await await Mg( () => Promise.resolve().then( () => Bx), []).then(l => l.navigatePromise).catch(l => (console.error(l),
    Promise.resolve( () => {}
    ))),
    window.REACT_APP_ROUTER = {
        push: (l, r) => {
            window.REACT_APP_NAVIGATE(l, r)
        }
        ,
        replace: (l, r, u) => {
            window.REACT_APP_NAVIGATE(l, {
                replace: !0,
                ...u
            })
        }
        ,
        forward: () => {
            window.REACT_APP_NAVIGATE(1)
        }
        ,
        back: () => {
            window.REACT_APP_NAVIGATE(-1)
        }
        ,
        refresh: () => {
            window.REACT_APP_NAVIGATE(0)
        }
        ,
        prefetch: (l, r) => {
            window.REACT_APP_NAVIGATE(l, r)
        }
    }
}
const Dg = new Promise(s => {
    Cv().then( () => {
        s(window.REACT_APP_ROUTER)
    }
    )
}
)
  , Vo = () => window.REACT_APP_ROUTER
  , ko = new Xa(window.parent)
  , zo = async (s, l) => {
    await ko.post("routeWillChange", {
        next: Yo(s)
    }, l)
}
;
function _v(s) {
    const l = document.querySelector(s);
    l && l.scrollIntoView({
        behavior: "smooth"
    })
}
function Av() {
    const s = window.open;
    return window.open = function(l, r, u) {
        return l && typeof l == "string" && l.startsWith("#") ? (_v(l),
        null) : (s(l, "_blank", u),
        null)
    }
    ,
    () => {
        window.open = s
    }
}
function Tv() {
    const s = async l => {
        const u = l.target.closest("a");
        if (!u || u.tagName !== "A")
            return;
        const c = u.getAttribute("href");
        if (c && !["#", "javascript:void(0)", ""].includes(c) && !c.startsWith("#")) {
            if (l.preventDefault(),
            c.startsWith("/")) {
                const f = Vo();
                await zo(c, {
                    timeout: 500
                });
                const d = Yo(c);
                f.push(d);
                return
            }
            window.open(u.href, "_blank")
        }
    }
    ;
    return window.addEventListener("click", s, !0),
    () => {
        window.removeEventListener("click", s, !0)
    }
}
const ym = s => s.startsWith("http://") || s.startsWith("https://");
function Ov(s) {
    return !s || typeof s != "string" ? !1 : s.indexOf("accounts.google.com") !== -1 || s.indexOf("googleapis.com/oauth") !== -1 || s.indexOf("/auth/") !== -1 && s.indexOf("provider=google") !== -1
}
function Rv() {
    const s = () => {
        const l = Vo()
          , r = l.push;
        l.push = async function(c, f, d) {
            return ym(c) ? (window.open(c, "_blank"),
            Promise.resolve(!1)) : (await zo(c, {
                timeout: 500
            }),
            r.call(this, c, f, d))
        }
        ;
        const u = l.replace;
        l.replace = async function(c, f, d) {
            return ym(c) ? (window.open(c, "_blank"),
            Promise.resolve(!1)) : (await zo(c, {
                timeout: 500
            }),
            u.call(this, c, f, d))
        }
    }
    ;
    return window.addEventListener("load", s),
    () => {
        window.removeEventListener("load", s)
    }
}
function Nv() {
    if (!("navigation"in window))
        return () => {}
        ;
    const s = l => {
        Ov(l.destination.url) && ko.post("google-auth-blocked", {
            url: l.destination.url || ""
        })
    }
    ;
    return window.navigation.addEventListener("navigate", s),
    () => {
        window.navigation.removeEventListener("navigate", s)
    }
}
async function zv() {
    await Dg;
    const s = Av()
      , l = Tv()
      , r = Rv()
      , u = Nv();
    return () => {
        ko.destroy(),
        s(),
        l(),
        r(),
        u()
    }
}
async function Lv() {
    const s = await Mg( () => Promise.resolve().then( () => jx), void 0).then(f => f.default).catch(f => []);
    let l = []
      , r = 0;
    function u(f, d) {
        const {path: m="", children: g, index: p} = f;
        r++;
        const b = p === !0 || m === ""
          , v = m && m[0] === "/"
          , S = b ? d.path : `${d.path}/${m}`
          , x = v && !b ? m : S
          , E = {
            id: r,
            parentId: d.id,
            path: "/" + x.split("/").filter(Boolean).join("/")
        };
        /\*/.test(E.path) || l.push(E),
        g && g.forEach(O => u(O, E))
    }
    s.forEach(f => u(f, {
        id: 0,
        path: ""
    }));
    const c = new Set;
    return l = l.filter(f => c.has(f.path) ? !1 : (c.add(f.path),
    !0)),
    l
}
async function Mv() {
    const s = new Xa(window.parent)
      , l = await Lv();
    window.REACT_APP_ROUTES = l,
    s.post("routes", {
        routes: l
    }),
    s.on("getRouteInfo", async v => l),
    await Dg,
    s.on("routeAction", async v => {
        const S = Vo()
          , {action: x, route: E} = v;
        switch (x) {
        case "goForward":
            S.forward();
            break;
        case "goBack":
            S.back();
            break;
        case "refresh":
            S.refresh();
            break;
        case "goTo":
            E && S.push(E);
            break;
        default:
            console.warn("Unknown action:", x)
        }
    }
    );
    function r() {
        const v = window.history.state?.index ?? 0
          , S = window.history.length > v + 1
          , x = v > 0
          , E = window.location.pathname;
        s.post("updateNavigationState", {
            canGoForward: S,
            canGoBack: x,
            currentRoute: Yo(E)
        })
    }
    function u() {
        const v = new MutationObserver(x => {
            x.forEach(E => {
                (E.type === "childList" || E.type === "characterData") && s.post("titleChanged", {
                    title: document.title
                })
            }
            )
        }
        )
          , S = document.querySelector("title");
        return s.post("titleChanged", {
            title: document.title
        }),
        S && v.observe(S, {
            childList: !0,
            characterData: !0,
            subtree: !0
        }),
        v
    }
    let c = u();
    function f() {
        c.disconnect(),
        setTimeout( () => {
            c = u()
        }
        , 100)
    }
    const d = window.history.pushState
      , m = window.history.replaceState
      , g = window.history.go
      , p = window.history.back
      , b = window.history.forward;
    return window.history.pushState = function(v, S, x) {
        d.apply(this, arguments),
        r(),
        f()
    }
    ,
    window.history.replaceState = function(v, S, x) {
        m.apply(this, arguments),
        r(),
        f()
    }
    ,
    window.history.go = function(v) {
        g.apply(this, arguments),
        setTimeout( () => {
            r(),
            f()
        }
        , 100)
    }
    ,
    window.history.back = function() {
        p.apply(this, arguments),
        setTimeout( () => {
            r(),
            f()
        }
        , 100)
    }
    ,
    window.history.forward = function() {
        b.apply(this, arguments),
        setTimeout( () => {
            r(),
            f()
        }
        , 100)
    }
    ,
    {
        destroy: () => {
            s.destroy(),
            c.disconnect()
        }
    }
}
var go = {
    exports: {}
}
  , ie = {};
var vm;
function Dv() {
    if (vm)
        return ie;
    vm = 1;
    var s = Symbol.for("react.transitional.element")
      , l = Symbol.for("react.portal")
      , r = Symbol.for("react.fragment")
      , u = Symbol.for("react.strict_mode")
      , c = Symbol.for("react.profiler")
      , f = Symbol.for("react.consumer")
      , d = Symbol.for("react.context")
      , m = Symbol.for("react.forward_ref")
      , g = Symbol.for("react.suspense")
      , p = Symbol.for("react.memo")
      , b = Symbol.for("react.lazy")
      , v = Symbol.for("react.activity")
      , S = Symbol.iterator;
    function x(A) {
        return A === null || typeof A != "object" ? null : (A = S && A[S] || A["@@iterator"],
        typeof A == "function" ? A : null)
    }
    var E = {
        isMounted: function() {
            return !1
        },
        enqueueForceUpdate: function() {},
        enqueueReplaceState: function() {},
        enqueueSetState: function() {}
    }
      , O = Object.assign
      , C = {};
    function M(A, H, F) {
        this.props = A,
        this.context = H,
        this.refs = C,
        this.updater = F || E
    }
    M.prototype.isReactComponent = {},
    M.prototype.setState = function(A, H) {
        if (typeof A != "object" && typeof A != "function" && A != null)
            throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, A, H, "setState")
    }
    ,
    M.prototype.forceUpdate = function(A) {
        this.updater.enqueueForceUpdate(this, A, "forceUpdate")
    }
    ;
    function G() {}
    G.prototype = M.prototype;
    function V(A, H, F) {
        this.props = A,
        this.context = H,
        this.refs = C,
        this.updater = F || E
    }
    var K = V.prototype = new G;
    K.constructor = V,
    O(K, M.prototype),
    K.isPureReactComponent = !0;
    var W = Array.isArray;
    function ue() {}
    var I = {
        H: null,
        A: null,
        T: null,
        S: null
    }
      , ye = Object.prototype.hasOwnProperty;
    function _e(A, H, F) {
        var J = F.ref;
        return {
            $$typeof: s,
            type: A,
            key: H,
            ref: J !== void 0 ? J : null,
            props: F
        }
    }
    function k(A, H) {
        return _e(A.type, H, A.props)
    }
    function X(A) {
        return typeof A == "object" && A !== null && A.$$typeof === s
    }
    function Z(A) {
        var H = {
            "=": "=0",
            ":": "=2"
        };
        return "$" + A.replace(/[=:]/g, function(F) {
            return H[F]
        })
    }
    var ne = /\/+/g;
    function oe(A, H) {
        return typeof A == "object" && A !== null && A.key != null ? Z("" + A.key) : H.toString(36)
    }
    function fe(A) {
        switch (A.status) {
        case "fulfilled":
            return A.value;
        case "rejected":
            throw A.reason;
        default:
            switch (typeof A.status == "string" ? A.then(ue, ue) : (A.status = "pending",
            A.then(function(H) {
                A.status === "pending" && (A.status = "fulfilled",
                A.value = H)
            }, function(H) {
                A.status === "pending" && (A.status = "rejected",
                A.reason = H)
            })),
            A.status) {
            case "fulfilled":
                return A.value;
            case "rejected":
                throw A.reason
            }
        }
        throw A
    }
    function U(A, H, F, J, se) {
        var de = typeof A;
        (de === "undefined" || de === "boolean") && (A = null);
        var Ce = !1;
        if (A === null)
            Ce = !0;
        else
            switch (de) {
            case "bigint":
            case "string":
            case "number":
                Ce = !0;
                break;
            case "object":
                switch (A.$$typeof) {
                case s:
                case l:
                    Ce = !0;
                    break;
                case b:
                    return Ce = A._init,
                    U(Ce(A._payload), H, F, J, se)
                }
            }
        if (Ce)
            return se = se(A),
            Ce = J === "" ? "." + oe(A, 0) : J,
            W(se) ? (F = "",
            Ce != null && (F = Ce.replace(ne, "$&/") + "/"),
            U(se, H, F, "", function(Za) {
                return Za
            })) : se != null && (X(se) && (se = k(se, F + (se.key == null || A && A.key === se.key ? "" : ("" + se.key).replace(ne, "$&/") + "/") + Ce)),
            H.push(se)),
            1;
        Ce = 0;
        var nt = J === "" ? "." : J + ":";
        if (W(A))
            for (var Be = 0; Be < A.length; Be++)
                J = A[Be],
                de = nt + oe(J, Be),
                Ce += U(J, H, F, de, se);
        else if (Be = x(A),
        typeof Be == "function")
            for (A = Be.call(A),
            Be = 0; !(J = A.next()).done; )
                J = J.value,
                de = nt + oe(J, Be++),
                Ce += U(J, H, F, de, se);
        else if (de === "object") {
            if (typeof A.then == "function")
                return U(fe(A), H, F, J, se);
            throw H = String(A),
            Error("Objects are not valid as a React child (found: " + (H === "[object Object]" ? "object with keys {" + Object.keys(A).join(", ") + "}" : H) + "). If you meant to render a collection of children, use an array instead.")
        }
        return Ce
    }
    function Q(A, H, F) {
        if (A == null)
            return A;
        var J = []
          , se = 0;
        return U(A, J, "", "", function(de) {
            return H.call(F, de, se++)
        }),
        J
    }
    function te(A) {
        if (A._status === -1) {
            var H = A._result;
            H = H(),
            H.then(function(F) {
                (A._status === 0 || A._status === -1) && (A._status = 1,
                A._result = F)
            }, function(F) {
                (A._status === 0 || A._status === -1) && (A._status = 2,
                A._result = F)
            }),
            A._status === -1 && (A._status = 0,
            A._result = H)
        }
        if (A._status === 1)
            return A._result.default;
        throw A._result
    }
    var be = typeof reportError == "function" ? reportError : function(A) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
            var H = new window.ErrorEvent("error",{
                bubbles: !0,
                cancelable: !0,
                message: typeof A == "object" && A !== null && typeof A.message == "string" ? String(A.message) : String(A),
                error: A
            });
            if (!window.dispatchEvent(H))
                return
        } else if (typeof process == "object" && typeof process.emit == "function") {
            process.emit("uncaughtException", A);
            return
        }
        console.error(A)
    }
      , we = {
        map: Q,
        forEach: function(A, H, F) {
            Q(A, function() {
                H.apply(this, arguments)
            }, F)
        },
        count: function(A) {
            var H = 0;
            return Q(A, function() {
                H++
            }),
            H
        },
        toArray: function(A) {
            return Q(A, function(H) {
                return H
            }) || []
        },
        only: function(A) {
            if (!X(A))
                throw Error("React.Children.only expected to receive a single React element child.");
            return A
        }
    };
    return ie.Activity = v,
    ie.Children = we,
    ie.Component = M,
    ie.Fragment = r,
    ie.Profiler = c,
    ie.PureComponent = V,
    ie.StrictMode = u,
    ie.Suspense = g,
    ie.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = I,
    ie.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function(A) {
            return I.H.useMemoCache(A)
        }
    },
    ie.cache = function(A) {
        return function() {
            return A.apply(null, arguments)
        }
    }
    ,
    ie.cacheSignal = function() {
        return null
    }
    ,
    ie.cloneElement = function(A, H, F) {
        if (A == null)
            throw Error("The argument must be a React element, but you passed " + A + ".");
        var J = O({}, A.props)
          , se = A.key;
        if (H != null)
            for (de in H.key !== void 0 && (se = "" + H.key),
            H)
                !ye.call(H, de) || de === "key" || de === "__self" || de === "__source" || de === "ref" && H.ref === void 0 || (J[de] = H[de]);
        var de = arguments.length - 2;
        if (de === 1)
            J.children = F;
        else if (1 < de) {
            for (var Ce = Array(de), nt = 0; nt < de; nt++)
                Ce[nt] = arguments[nt + 2];
            J.children = Ce
        }
        return _e(A.type, se, J)
    }
    ,
    ie.createContext = function(A) {
        return A = {
            $$typeof: d,
            _currentValue: A,
            _currentValue2: A,
            _threadCount: 0,
            Provider: null,
            Consumer: null
        },
        A.Provider = A,
        A.Consumer = {
            $$typeof: f,
            _context: A
        },
        A
    }
    ,
    ie.createElement = function(A, H, F) {
        var J, se = {}, de = null;
        if (H != null)
            for (J in H.key !== void 0 && (de = "" + H.key),
            H)
                ye.call(H, J) && J !== "key" && J !== "__self" && J !== "__source" && (se[J] = H[J]);
        var Ce = arguments.length - 2;
        if (Ce === 1)
            se.children = F;
        else if (1 < Ce) {
            for (var nt = Array(Ce), Be = 0; Be < Ce; Be++)
                nt[Be] = arguments[Be + 2];
            se.children = nt
        }
        if (A && A.defaultProps)
            for (J in Ce = A.defaultProps,
            Ce)
                se[J] === void 0 && (se[J] = Ce[J]);
        return _e(A, de, se)
    }
    ,
    ie.createRef = function() {
        return {
            current: null
        }
    }
    ,
    ie.forwardRef = function(A) {
        return {
            $$typeof: m,
            render: A
        }
    }
    ,
    ie.isValidElement = X,
    ie.lazy = function(A) {
        return {
            $$typeof: b,
            _payload: {
                _status: -1,
                _result: A
            },
            _init: te
        }
    }
    ,
    ie.memo = function(A, H) {
        return {
            $$typeof: p,
            type: A,
            compare: H === void 0 ? null : H
        }
    }
    ,
    ie.startTransition = function(A) {
        var H = I.T
          , F = {};
        I.T = F;
        try {
            var J = A()
              , se = I.S;
            se !== null && se(F, J),
            typeof J == "object" && J !== null && typeof J.then == "function" && J.then(ue, be)
        } catch (de) {
            be(de)
        } finally {
            H !== null && F.types !== null && (H.types = F.types),
            I.T = H
        }
    }
    ,
    ie.unstable_useCacheRefresh = function() {
        return I.H.useCacheRefresh()
    }
    ,
    ie.use = function(A) {
        return I.H.use(A)
    }
    ,
    ie.useActionState = function(A, H, F) {
        return I.H.useActionState(A, H, F)
    }
    ,
    ie.useCallback = function(A, H) {
        return I.H.useCallback(A, H)
    }
    ,
    ie.useContext = function(A) {
        return I.H.useContext(A)
    }
    ,
    ie.useDebugValue = function() {}
    ,
    ie.useDeferredValue = function(A, H) {
        return I.H.useDeferredValue(A, H)
    }
    ,
    ie.useEffect = function(A, H) {
        return I.H.useEffect(A, H)
    }
    ,
    ie.useEffectEvent = function(A) {
        return I.H.useEffectEvent(A)
    }
    ,
    ie.useId = function() {
        return I.H.useId()
    }
    ,
    ie.useImperativeHandle = function(A, H, F) {
        return I.H.useImperativeHandle(A, H, F)
    }
    ,
    ie.useInsertionEffect = function(A, H) {
        return I.H.useInsertionEffect(A, H)
    }
    ,
    ie.useLayoutEffect = function(A, H) {
        return I.H.useLayoutEffect(A, H)
    }
    ,
    ie.useMemo = function(A, H) {
        return I.H.useMemo(A, H)
    }
    ,
    ie.useOptimistic = function(A, H) {
        return I.H.useOptimistic(A, H)
    }
    ,
    ie.useReducer = function(A, H, F) {
        return I.H.useReducer(A, H, F)
    }
    ,
    ie.useRef = function(A) {
        return I.H.useRef(A)
    }
    ,
    ie.useState = function(A) {
        return I.H.useState(A)
    }
    ,
    ie.useSyncExternalStore = function(A, H, F) {
        return I.H.useSyncExternalStore(A, H, F)
    }
    ,
    ie.useTransition = function() {
        return I.H.useTransition()
    }
    ,
    ie.version = "19.2.4",
    ie
}
var bm;
function Qo() {
    return bm || (bm = 1,
    go.exports = Dv()),
    go.exports
}
var j = Qo();
const xm = Z0(j);
var po = {
    exports: {}
}
  , Vl = {};
var Sm;
function jv() {
    if (Sm)
        return Vl;
    Sm = 1;
    var s = Symbol.for("react.transitional.element")
      , l = Symbol.for("react.fragment");
    function r(u, c, f) {
        var d = null;
        if (f !== void 0 && (d = "" + f),
        c.key !== void 0 && (d = "" + c.key),
        "key"in c) {
            f = {};
            for (var m in c)
                m !== "key" && (f[m] = c[m])
        } else
            f = c;
        return c = f.ref,
        {
            $$typeof: s,
            type: u,
            key: d,
            ref: c !== void 0 ? c : null,
            props: f
        }
    }
    return Vl.Fragment = l,
    Vl.jsx = r,
    Vl.jsxs = r,
    Vl
}
var Em;
function Uv() {
    return Em || (Em = 1,
    po.exports = jv()),
    po.exports
}
var w = Uv()
  , yo = {
    exports: {}
}
  , Es = {};
var wm;
function Bv() {
    if (wm)
        return Es;
    wm = 1;
    var s = Symbol.for("react.fragment");
    return Es.Fragment = s,
    Es.jsxDEV = void 0,
    Es
}
var Cm;
function Hv() {
    return Cm || (Cm = 1,
    yo.exports = Bv()),
    yo.exports
}
var _m = Hv();
class jg {
    static getFiberFromDOMNode(l) {
        if (!l)
            return null;
        const r = Object.keys(l).find(u => u.startsWith("__reactFiber$") || u.startsWith("__reactInternalInstance$"));
        return r ? l[r] : null
    }
}
const Ug = new WeakMap
  , Bg = new WeakMap
  , Am = new WeakMap
  , vo = new WeakMap
  , Tm = new WeakMap
  , Om = new WeakMap
  , bo = (s, l) => {
    try {
        Bg.set(s, l);
        const r = jg.getFiberFromDOMNode(s);
        r && Ug.set(r, l)
    } catch {}
}
  , ws = (s, l) => {
    if (!s)
        return r => {
            r instanceof HTMLElement && bo(r, l)
        }
        ;
    if (typeof s == "function") {
        let r = vo.get(s);
        r || (r = [],
        vo.set(s, r)),
        r.push(l);
        let u = Am.get(s);
        return u || (u = c => {
            if (c instanceof HTMLElement) {
                const f = vo.get(s);
                if (f && f.length > 0) {
                    const d = f.shift();
                    bo(c, d)
                }
            }
            s(c)
        }
        ,
        Am.set(s, u)),
        u
    }
    if (s && typeof s == "object" && "current"in s) {
        Om.set(s, l);
        let r = Tm.get(s);
        return r || (r = u => {
            if (u instanceof HTMLElement) {
                const c = Om.get(s);
                c && bo(u, c)
            }
            s.current = u
        }
        ,
        Tm.set(s, r)),
        r
    }
}
;
function qv() {
    const s = xm.createElement
      , l = w.jsx
      , r = w.jsxs
      , u = _m.jsxDEV
      , c = () => {
        const d = new Error;
        return () => d
    }
      , f = d => typeof d == "string";
    xm.createElement = function(d, m, ...g) {
        if (!f(d) && typeof d != "function")
            return s(d, m, ...g);
        const p = c()
          , b = m ? {
            ...m
        } : {}
          , v = ws(b.ref, p);
        return v && (b.ref = v),
        s(d, b, ...g)
    }
    ,
    w.jsx = function(d, m, g) {
        if (!f(d) && typeof d != "function")
            return l(d, m, g);
        const p = c()
          , b = m ? {
            ...m
        } : {}
          , v = ws(b.ref, p);
        return v && (b.ref = v),
        l(d, b, g)
    }
    ,
    w.jsxs = function(d, m, g) {
        if (!f(d) && typeof d != "function")
            return r(d, m, g);
        const p = c()
          , b = m ? {
            ...m
        } : {}
          , v = ws(b.ref, p);
        return v && (b.ref = v),
        r(d, b, g)
    }
    ,
    u && (_m.jsxDEV = function(d, m, g, p, b, v) {
        if (!f(d) && typeof d != "function")
            return u(d, m, g, p, b, v);
        const S = c()
          , x = m ? {
            ...m
        } : {}
          , E = ws(x.ref, S);
        return E && (x.ref = E),
        u(d, x, g, p, b, v)
    }
    )
}
function Gv(s) {
    const l = document.querySelector(s);
    if (!l)
        return null;
    const r = l.tagName.toLowerCase()
      , u = Bg.get(l);
    if (u)
        return {
            element: l,
            tagName: r,
            debugError: u()
        };
    const c = jg.getFiberFromDOMNode(l);
    if (c) {
        const f = Ug.get(c);
        if (f)
            return {
                element: l,
                tagName: r,
                debugError: f()
            }
    }
    return null
}
qv();
function Yv() {
    const s = new WeakMap
      , l = new Xa(window.parent);
    return l.on("get-element-source", async ({selector: r}) => {
        const u = Gv(r);
        if (!u)
            return null;
        const {element: c, tagName: f, debugError: d} = u;
        if (s.has(c))
            return s.get(c);
        const m = await Fl(d, 10, f);
        if (!m)
            return null;
        const p = {
            ...m.sourceContext.filter(b => !b.file.includes("node_modules"))[0],
            domInfo: {
                tagName: c.tagName,
                textContent: c.textContent.slice(0, 300)
            }
        };
        return s.set(c, p),
        p
    }
    ),
    () => {
        l.destroy()
    }
}
const Vv = !0;
console.log("Is preview build:", Vv);
async function kv() {
    F0(),
    bv(),
    zv(),
    Sv(),
    Mv(),
    Yv()
}
kv();
const Qv = "phc_V7JMHB0fVJGRu8UHyrsj6pSL1BS76P5zD8qCi7lrTTV"
  , Ke = {
    colors: {
        text: "#5D5D5D",
        white: "#FFFFFF",
        border: "rgba(0, 10, 36, 0.08)"
    },
    font: {
        family: '"Geist"',
        weight: "600",
        size: {
            normal: "14px",
            button: "18px"
        },
        lineHeight: "20px"
    },
    button: {
        gradient: "linear-gradient(180deg, #A797FF 0%, #7057FF 100%)"
    },
    shadow: "0px 8px 12px 0px rgba(9, 10, 20, 0.06)",
    zIndex: `${Number.MAX_SAFE_INTEGER}`
}
  , Rm = {
    close: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D303D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>')}`,
    generate: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.87 4.94c.227-.71 1.21-.723 1.456-.02l1.177 3.378 3.101 1.013c.708.231.714 1.216.01 1.455l-3.183 1.082-1.105 3.17c-.245.704-1.23.69-1.455-.02l-.989-3.107-3.367-1.203c-.702-.25-.68-1.234.04-1.455l3.282-1.016 1.043-3.277Z" fill="#FFF"/><path fill-rule="evenodd" d="M12.238 1.3c.167-.667 1.1-.667 1.266 0l.388 1.551 1.55.388c.666.166.667 1.1 0 1.266l-1.55.388-.388 1.55c-.167.666-1.1.667-1.266 0l-.388-1.55-1.55-.388c-.667-.166-.667-1.1 0-1.266l1.55-.388.388-1.551Z" fill="#FFF"/></svg>')}`
}
 
  , Nm = {
    en: {
        prefix: "This Website is Made with",
        suffix: ". You can also get one like this in minutes",
        button: "Get one for FREE"
    },
    zh: {
        prefix: "本网站来自",
        suffix: "你也可以在几分钟内拥有同样的页面",
        button: "立即免费拥有"
    }
}
  , Xv = () => navigator.language?.toLowerCase().startsWith("zh") ?? !1
  , xo = () => Xv() ? Nm.zh : Nm.en
  , Fv = () => window.innerWidth > 768 && !("ontouchstart"in window)
  , Zv = () => {
    const s = window.location.hostname;
    
}
;
function Kv() {
    if (window.posthog)
        return;
    const s = document.createElement("script");
    s.src = Zl.posthogCDN,
    s.async = !0,
    s.onload = () => {
        window.posthog?.init(Qv, {
            api_host: "https://us.i.posthog.com",
            autocapture: !1,
            capture_pageview: !1,
            capture_pageleave: !1,
            disable_session_recording: !0,
            disable_scroll_properties: !0,
            capture_performance: {
                web_vitals: !1
            },
            rageclick: !1,
            loaded: function(l) {
                l.sessionRecording && l.sessionRecording.stopRecording()
            }
        })
    }
    ,
    document.head.appendChild(s)
}
function zm(s, l) {
    window.posthog?.capture(s, {
        ...l,
        version: 2
    })
}
function Gt(s, l) {
    Object.assign(s.style, l)
}
function So(s, l="0") {
    Gt(s, {
        color: Ke.colors.text,
        fontFamily: Ke.font.family,
        fontSize: Ke.font.size.normal,
        lineHeight: Ke.font.lineHeight,
        fontWeight: Ke.font.weight,
        whiteSpace: "nowrap",
        marginRight: l
    })
}
function Cs(s, l="row") {
    Gt(s, {
        display: "flex",
        flexDirection: l,
        alignItems: "center",
        justifyContent: "center"
    })
}
function Jv() {
    if (Zv())
        return;
    const s = 
      , l = "9b2e8b58-f57b-4d65-baad-9e44f3a9e6a7";
    async function r(x) {
        try {
            return !(await (await fetch(`${s}?projectId=${x}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })).json()).data.is_free
        } catch {
            return !0
        }
    }
    function u() {
        document.querySelector('link[rel="icon"]')?.remove();
        const x = document.createElement("link");
        x.type = "image/png",
        x.rel = "icon",
        x.href = Zl
        document.head.appendChild(x);
        const E = document.createElement("link");
        E.rel = "stylesheet",
        E.href = Zl.fontStylesheet,
        document.head.appendChild(E)
    }
    function c(x) {
        zm(x),
        window.open(Zl "_blank")
    }
    function f() {
        const x = document.createElement("div");
        x.id = "close-button",
        Gt(x, {
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "32px",
            height: "32px",
            backgroundColor: Ke.colors.white,
            borderRadius: "50%",
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: Ke.colors.border,
            cursor: "pointer",
            boxShadow: Ke.shadow
        }),
        Cs(x);
        const E = document.createElement("img");
        return E.src = Rm.close,
        Gt(E, {
            width: "24px",
            height: "24px"
        }),
        x.appendChild(E),
        x.addEventListener("click", O => {
            O.stopPropagation(),
            zm("watermark_close_button_click"),
            document.getElementById("watermark")?.remove()
        }
        ),
        x
    }
    function d(x) {
        const E = document.createElement("div");
        E.id = "generate-button",
        Gt(E, {
            padding: x ? "8px 16px" : "10px 20px",
            background: Ke.button.gradient,
            borderRadius: "999px",
            border: "none",
            gap: "6px",
            cursor: "pointer",
            marginLeft: x ? "12px" : "0",
            whiteSpace: "nowrap",
            width: x ? "auto" : "100%"
        }),
        Cs(E);
        const O = document.createElement("img");
        O.src = Rm.generate,
        Gt(O, {
            width: "16px",
            height: "16px",
            flexShrink: "0"
        });
        const C = document.createElement("span");
        return C.textContent = xo().button,
        Gt(C, {
            color: Ke.colors.white,
            fontFamily: Ke.font.family,
            fontSize: Ke.font.size.button,
            fontWeight: Ke.font.weight,
            lineHeight: Ke.font.lineHeight
        }),
        E.append(O, C),
        E.addEventListener("click", M => {
            M.stopPropagation(),
            c("watermark_create_button_click")
        }
        ),
        E
    }
    function m() {
        const x = document.createElement("img");
        return x.src = Zl.watermarkLogo,
        Gt(x, {
            width: "92px",
            height: "auto",
            paddingLeft: "8px",
            flexShrink: "0"
        }),
        x
    }
    function g(x) {
        const E = xo()
          , O = document.createElement("div");
        O.textContent = E.prefix,
        So(O);
        const C = m()
          , M = document.createElement("div");
        M.textContent = E.suffix,
        So(M, "12px"),
        x.append(O, C, M, d(!0))
    }
    function p(x, E) {
        const O = document.createElement("div");
        return O.textContent = x,
        So(O),
        E && Gt(O, E),
        O
    }
    function b(x) {
        const {prefix: E, suffix: O} = xo()
          , [C,M] = O.startsWith(".") ? [".", O.slice(1).trim()] : ["", O]
          , G = document.createElement("div");
        Cs(G),
        G.style.marginBottom = "4px",
        G.append(p(E, {
            marginRight: "6px"
        }), m(), ...C ? [p(C)] : []),
        x.append(G, p(M, {
            textAlign: "center",
            marginBottom: "12px"
        }), d(!1))
    }
    function v() {
        const x = Fv()
          , E = document.createElement("div");
        return E.id = "watermark",
        Gt(E, {
            zIndex: Ke.zIndex,
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            width: x ? "fit-content" : "calc(100% - 32px)",
            maxWidth: x ? "none" : "100%",
            backgroundColor: Ke.colors.white,
            borderStyle: "solid",
            borderWidth: "1px",
            borderRadius: x ? "999px" : "36px",
            borderColor: Ke.colors.border,
            padding: x ? "12px 20px" : "16px",
            boxShadow: Ke.shadow,
            cursor: "pointer"
        }),
        Cs(E, x ? "row" : "column"),
        E.appendChild(f()),
        x ? g(E) : b(E),
        E.addEventListener("click", O => {
            O.target.closest("#generate-button, #close-button") || c("watermark_create_button_click")
        }
        ),
        E
    }
    function S(x) {
        const E = document.getElementById("watermark");
        !E && !x ? (document.body.appendChild(v()),
        u(),
        Kv()) : x && E && E.remove()
    }
    r(l).then(S)
}
Jv();
const le = s => typeof s == "string"
  , kl = () => {
    let s, l;
    const r = new Promise( (u, c) => {
        s = u,
        l = c
    }
    );
    return r.resolve = s,
    r.reject = l,
    r
}
  , Lm = s => s == null ? "" : "" + s
  , $v = (s, l, r) => {
    s.forEach(u => {
        l[u] && (r[u] = l[u])
    }
    )
}
  , Wv = /###/g
  , Mm = s => s && s.indexOf("###") > -1 ? s.replace(Wv, ".") : s
  , Dm = s => !s || le(s)
  , Jl = (s, l, r) => {
    const u = le(l) ? l.split(".") : l;
    let c = 0;
    for (; c < u.length - 1; ) {
        if (Dm(s))
            return {};
        const f = Mm(u[c]);
        !s[f] && r && (s[f] = new r),
        Object.prototype.hasOwnProperty.call(s, f) ? s = s[f] : s = {},
        ++c
    }
    return Dm(s) ? {} : {
        obj: s,
        k: Mm(u[c])
    }
}
  , jm = (s, l, r) => {
    const {obj: u, k: c} = Jl(s, l, Object);
    if (u !== void 0 || l.length === 1) {
        u[c] = r;
        return
    }
    let f = l[l.length - 1]
      , d = l.slice(0, l.length - 1)
      , m = Jl(s, d, Object);
    for (; m.obj === void 0 && d.length; )
        f = `${d[d.length - 1]}.${f}`,
        d = d.slice(0, d.length - 1),
        m = Jl(s, d, Object),
        m?.obj && typeof m.obj[`${m.k}.${f}`] < "u" && (m.obj = void 0);
    m.obj[`${m.k}.${f}`] = r
}
  , Iv = (s, l, r, u) => {
    const {obj: c, k: f} = Jl(s, l, Object);
    c[f] = c[f] || [],
    c[f].push(r)
}
  , Ns = (s, l) => {
    const {obj: r, k: u} = Jl(s, l);
    if (r && Object.prototype.hasOwnProperty.call(r, u))
        return r[u]
}
  , Pv = (s, l, r) => {
    const u = Ns(s, r);
    return u !== void 0 ? u : Ns(l, r)
}
  , Hg = (s, l, r) => {
    for (const u in l)
        u !== "__proto__" && u !== "constructor" && (u in s ? le(s[u]) || s[u]instanceof String || le(l[u]) || l[u]instanceof String ? r && (s[u] = l[u]) : Hg(s[u], l[u], r) : s[u] = l[u]);
    return s
}
  , Ga = s => s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var e1 = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
};
const t1 = s => le(s) ? s.replace(/[&<>"'\/]/g, l => e1[l]) : s;
class n1 {
    constructor(l) {
        this.capacity = l,
        this.regExpMap = new Map,
        this.regExpQueue = []
    }
    getRegExp(l) {
        const r = this.regExpMap.get(l);
        if (r !== void 0)
            return r;
        const u = new RegExp(l);
        return this.regExpQueue.length === this.capacity && this.regExpMap.delete(this.regExpQueue.shift()),
        this.regExpMap.set(l, u),
        this.regExpQueue.push(l),
        u
    }
}
const a1 = [" ", ",", "?", "!", ";"]
  , l1 = new n1(20)
  , i1 = (s, l, r) => {
    l = l || "",
    r = r || "";
    const u = a1.filter(d => l.indexOf(d) < 0 && r.indexOf(d) < 0);
    if (u.length === 0)
        return !0;
    const c = l1.getRegExp(`(${u.map(d => d === "?" ? "\\?" : d).join("|")})`);
    let f = !c.test(s);
    if (!f) {
        const d = s.indexOf(r);
        d > 0 && !c.test(s.substring(0, d)) && (f = !0)
    }
    return f
}
  , Lo = (s, l, r=".") => {
    if (!s)
        return;
    if (s[l])
        return Object.prototype.hasOwnProperty.call(s, l) ? s[l] : void 0;
    const u = l.split(r);
    let c = s;
    for (let f = 0; f < u.length; ) {
        if (!c || typeof c != "object")
            return;
        let d, m = "";
        for (let g = f; g < u.length; ++g)
            if (g !== f && (m += r),
            m += u[g],
            d = c[m],
            d !== void 0) {
                if (["string", "number", "boolean"].indexOf(typeof d) > -1 && g < u.length - 1)
                    continue;
                f += g - f + 1;
                break
            }
        c = d
    }
    return c
}
  , $l = s => s?.replace("_", "-")
  , s1 = {
    type: "logger",
    log(s) {
        this.output("log", s)
    },
    warn(s) {
        this.output("warn", s)
    },
    error(s) {
        this.output("error", s)
    },
    output(s, l) {
        console?.[s]?.apply?.(console, l)
    }
};
class zs {
    constructor(l, r={}) {
        this.init(l, r)
    }
    init(l, r={}) {
        this.prefix = r.prefix || "i18next:",
        this.logger = l || s1,
        this.options = r,
        this.debug = r.debug
    }
    log(...l) {
        return this.forward(l, "log", "", !0)
    }
    warn(...l) {
        return this.forward(l, "warn", "", !0)
    }
    error(...l) {
        return this.forward(l, "error", "")
    }
    deprecate(...l) {
        return this.forward(l, "warn", "WARNING DEPRECATED: ", !0)
    }
    forward(l, r, u, c) {
        return c && !this.debug ? null : (le(l[0]) && (l[0] = `${u}${this.prefix} ${l[0]}`),
        this.logger[r](l))
    }
    create(l) {
        return new zs(this.logger,{
            prefix: `${this.prefix}:${l}:`,
            ...this.options
        })
    }
    clone(l) {
        return l = l || this.options,
        l.prefix = l.prefix || this.prefix,
        new zs(this.logger,l)
    }
}
var Yt = new zs;
class js {
    constructor() {
        this.observers = {}
    }
    on(l, r) {
        return l.split(" ").forEach(u => {
            this.observers[u] || (this.observers[u] = new Map);
            const c = this.observers[u].get(r) || 0;
            this.observers[u].set(r, c + 1)
        }
        ),
        this
    }
    off(l, r) {
        if (this.observers[l]) {
            if (!r) {
                delete this.observers[l];
                return
            }
            this.observers[l].delete(r)
        }
    }
    emit(l, ...r) {
        this.observers[l] && Array.from(this.observers[l].entries()).forEach( ([c,f]) => {
            for (let d = 0; d < f; d++)
                c(...r)
        }
        ),
        this.observers["*"] && Array.from(this.observers["*"].entries()).forEach( ([c,f]) => {
            for (let d = 0; d < f; d++)
                c.apply(c, [l, ...r])
        }
        )
    }
}
class Um extends js {
    constructor(l, r={
        ns: ["translation"],
        defaultNS: "translation"
    }) {
        super(),
        this.data = l || {},
        this.options = r,
        this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
        this.options.ignoreJSONStructure === void 0 && (this.options.ignoreJSONStructure = !0)
    }
    addNamespaces(l) {
        this.options.ns.indexOf(l) < 0 && this.options.ns.push(l)
    }
    removeNamespaces(l) {
        const r = this.options.ns.indexOf(l);
        r > -1 && this.options.ns.splice(r, 1)
    }
    getResource(l, r, u, c={}) {
        const f = c.keySeparator !== void 0 ? c.keySeparator : this.options.keySeparator
          , d = c.ignoreJSONStructure !== void 0 ? c.ignoreJSONStructure : this.options.ignoreJSONStructure;
        let m;
        l.indexOf(".") > -1 ? m = l.split(".") : (m = [l, r],
        u && (Array.isArray(u) ? m.push(...u) : le(u) && f ? m.push(...u.split(f)) : m.push(u)));
        const g = Ns(this.data, m);
        return !g && !r && !u && l.indexOf(".") > -1 && (l = m[0],
        r = m[1],
        u = m.slice(2).join(".")),
        g || !d || !le(u) ? g : Lo(this.data?.[l]?.[r], u, f)
    }
    addResource(l, r, u, c, f={
        silent: !1
    }) {
        const d = f.keySeparator !== void 0 ? f.keySeparator : this.options.keySeparator;
        let m = [l, r];
        u && (m = m.concat(d ? u.split(d) : u)),
        l.indexOf(".") > -1 && (m = l.split("."),
        c = r,
        r = m[1]),
        this.addNamespaces(r),
        jm(this.data, m, c),
        f.silent || this.emit("added", l, r, u, c)
    }
    addResources(l, r, u, c={
        silent: !1
    }) {
        for (const f in u)
            (le(u[f]) || Array.isArray(u[f])) && this.addResource(l, r, f, u[f], {
                silent: !0
            });
        c.silent || this.emit("added", l, r, u)
    }
    addResourceBundle(l, r, u, c, f, d={
        silent: !1,
        skipCopy: !1
    }) {
        let m = [l, r];
        l.indexOf(".") > -1 && (m = l.split("."),
        c = u,
        u = r,
        r = m[1]),
        this.addNamespaces(r);
        let g = Ns(this.data, m) || {};
        d.skipCopy || (u = JSON.parse(JSON.stringify(u))),
        c ? Hg(g, u, f) : g = {
            ...g,
            ...u
        },
        jm(this.data, m, g),
        d.silent || this.emit("added", l, r, u)
    }
    removeResourceBundle(l, r) {
        this.hasResourceBundle(l, r) && delete this.data[l][r],
        this.removeNamespaces(r),
        this.emit("removed", l, r)
    }
    hasResourceBundle(l, r) {
        return this.getResource(l, r) !== void 0
    }
    getResourceBundle(l, r) {
        return r || (r = this.options.defaultNS),
        this.getResource(l, r)
    }
    getDataByLanguage(l) {
        return this.data[l]
    }
    hasLanguageSomeTranslations(l) {
        const r = this.getDataByLanguage(l);
        return !!(r && Object.keys(r) || []).find(c => r[c] && Object.keys(r[c]).length > 0)
    }
    toJSON() {
        return this.data
    }
}
var qg = {
    processors: {},
    addPostProcessor(s) {
        this.processors[s.name] = s
    },
    handle(s, l, r, u, c) {
        return s.forEach(f => {
            l = this.processors[f]?.process(l, r, u, c) ?? l
        }
        ),
        l
    }
};
const Gg = Symbol("i18next/PATH_KEY");
function r1() {
    const s = []
      , l = Object.create(null);
    let r;
    return l.get = (u, c) => (r?.revoke?.(),
    c === Gg ? s : (s.push(c),
    r = Proxy.revocable(u, l),
    r.proxy)),
    Proxy.revocable(Object.create(null), l).proxy
}
function Mo(s, l) {
    const {[Gg]: r} = s(r1());
    return r.join(l?.keySeparator ?? ".")
}
const Bm = {}
  , Hm = s => !le(s) && typeof s != "boolean" && typeof s != "number";
class Ls extends js {
    constructor(l, r={}) {
        super(),
        $v(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils"], l, this),
        this.options = r,
        this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
        this.logger = Yt.create("translator")
    }
    changeLanguage(l) {
        l && (this.language = l)
    }
    exists(l, r={
        interpolation: {}
    }) {
        const u = {
            ...r
        };
        return l == null ? !1 : this.resolve(l, u)?.res !== void 0
    }
    extractFromKey(l, r) {
        let u = r.nsSeparator !== void 0 ? r.nsSeparator : this.options.nsSeparator;
        u === void 0 && (u = ":");
        const c = r.keySeparator !== void 0 ? r.keySeparator : this.options.keySeparator;
        let f = r.ns || this.options.defaultNS || [];
        const d = u && l.indexOf(u) > -1
          , m = !this.options.userDefinedKeySeparator && !r.keySeparator && !this.options.userDefinedNsSeparator && !r.nsSeparator && !i1(l, u, c);
        if (d && !m) {
            const g = l.match(this.interpolator.nestingRegexp);
            if (g && g.length > 0)
                return {
                    key: l,
                    namespaces: le(f) ? [f] : f
                };
            const p = l.split(u);
            (u !== c || u === c && this.options.ns.indexOf(p[0]) > -1) && (f = p.shift()),
            l = p.join(c)
        }
        return {
            key: l,
            namespaces: le(f) ? [f] : f
        }
    }
    translate(l, r, u) {
        let c = typeof r == "object" ? {
            ...r
        } : r;
        if (typeof c != "object" && this.options.overloadTranslationOptionHandler && (c = this.options.overloadTranslationOptionHandler(arguments)),
        typeof options == "object" && (c = {
            ...c
        }),
        c || (c = {}),
        l == null)
            return "";
        typeof l == "function" && (l = Mo(l, c)),
        Array.isArray(l) || (l = [String(l)]);
        const f = c.returnDetails !== void 0 ? c.returnDetails : this.options.returnDetails
          , d = c.keySeparator !== void 0 ? c.keySeparator : this.options.keySeparator
          , {key: m, namespaces: g} = this.extractFromKey(l[l.length - 1], c)
          , p = g[g.length - 1];
        let b = c.nsSeparator !== void 0 ? c.nsSeparator : this.options.nsSeparator;
        b === void 0 && (b = ":");
        const v = c.lng || this.language
          , S = c.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
        if (v?.toLowerCase() === "cimode")
            return S ? f ? {
                res: `${p}${b}${m}`,
                usedKey: m,
                exactUsedKey: m,
                usedLng: v,
                usedNS: p,
                usedParams: this.getUsedParamsDetails(c)
            } : `${p}${b}${m}` : f ? {
                res: m,
                usedKey: m,
                exactUsedKey: m,
                usedLng: v,
                usedNS: p,
                usedParams: this.getUsedParamsDetails(c)
            } : m;
        const x = this.resolve(l, c);
        let E = x?.res;
        const O = x?.usedKey || m
          , C = x?.exactUsedKey || m
          , M = ["[object Number]", "[object Function]", "[object RegExp]"]
          , G = c.joinArrays !== void 0 ? c.joinArrays : this.options.joinArrays
          , V = !this.i18nFormat || this.i18nFormat.handleAsObject
          , K = c.count !== void 0 && !le(c.count)
          , W = Ls.hasDefaultValue(c)
          , ue = K ? this.pluralResolver.getSuffix(v, c.count, c) : ""
          , I = c.ordinal && K ? this.pluralResolver.getSuffix(v, c.count, {
            ordinal: !1
        }) : ""
          , ye = K && !c.ordinal && c.count === 0
          , _e = ye && c[`defaultValue${this.options.pluralSeparator}zero`] || c[`defaultValue${ue}`] || c[`defaultValue${I}`] || c.defaultValue;
        let k = E;
        V && !E && W && (k = _e);
        const X = Hm(k)
          , Z = Object.prototype.toString.apply(k);
        if (V && k && X && M.indexOf(Z) < 0 && !(le(G) && Array.isArray(k))) {
            if (!c.returnObjects && !this.options.returnObjects) {
                this.options.returnedObjectHandler || this.logger.warn("accessing an object - but returnObjects options is not enabled!");
                const ne = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(O, k, {
                    ...c,
                    ns: g
                }) : `key '${m} (${this.language})' returned an object instead of string.`;
                return f ? (x.res = ne,
                x.usedParams = this.getUsedParamsDetails(c),
                x) : ne
            }
            if (d) {
                const ne = Array.isArray(k)
                  , oe = ne ? [] : {}
                  , fe = ne ? C : O;
                for (const U in k)
                    if (Object.prototype.hasOwnProperty.call(k, U)) {
                        const Q = `${fe}${d}${U}`;
                        W && !E ? oe[U] = this.translate(Q, {
                            ...c,
                            defaultValue: Hm(_e) ? _e[U] : void 0,
                            joinArrays: !1,
                            ns: g
                        }) : oe[U] = this.translate(Q, {
                            ...c,
                            joinArrays: !1,
                            ns: g
                        }),
                        oe[U] === Q && (oe[U] = k[U])
                    }
                E = oe
            }
        } else if (V && le(G) && Array.isArray(E))
            E = E.join(G),
            E && (E = this.extendTranslation(E, l, c, u));
        else {
            let ne = !1
              , oe = !1;
            !this.isValidLookup(E) && W && (ne = !0,
            E = _e),
            this.isValidLookup(E) || (oe = !0,
            E = m);
            const U = (c.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey) && oe ? void 0 : E
              , Q = W && _e !== E && this.options.updateMissing;
            if (oe || ne || Q) {
                if (this.logger.log(Q ? "updateKey" : "missingKey", v, p, m, Q ? _e : E),
                d) {
                    const A = this.resolve(m, {
                        ...c,
                        keySeparator: !1
                    });
                    A && A.res && this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.")
                }
                let te = [];
                const be = this.languageUtils.getFallbackCodes(this.options.fallbackLng, c.lng || this.language);
                if (this.options.saveMissingTo === "fallback" && be && be[0])
                    for (let A = 0; A < be.length; A++)
                        te.push(be[A]);
                else
                    this.options.saveMissingTo === "all" ? te = this.languageUtils.toResolveHierarchy(c.lng || this.language) : te.push(c.lng || this.language);
                const we = (A, H, F) => {
                    const J = W && F !== E ? F : U;
                    this.options.missingKeyHandler ? this.options.missingKeyHandler(A, p, H, J, Q, c) : this.backendConnector?.saveMissing && this.backendConnector.saveMissing(A, p, H, J, Q, c),
                    this.emit("missingKey", A, p, H, E)
                }
                ;
                this.options.saveMissing && (this.options.saveMissingPlurals && K ? te.forEach(A => {
                    const H = this.pluralResolver.getSuffixes(A, c);
                    ye && c[`defaultValue${this.options.pluralSeparator}zero`] && H.indexOf(`${this.options.pluralSeparator}zero`) < 0 && H.push(`${this.options.pluralSeparator}zero`),
                    H.forEach(F => {
                        we([A], m + F, c[`defaultValue${F}`] || _e)
                    }
                    )
                }
                ) : we(te, m, _e))
            }
            E = this.extendTranslation(E, l, c, x, u),
            oe && E === m && this.options.appendNamespaceToMissingKey && (E = `${p}${b}${m}`),
            (oe || ne) && this.options.parseMissingKeyHandler && (E = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${p}${b}${m}` : m, ne ? E : void 0, c))
        }
        return f ? (x.res = E,
        x.usedParams = this.getUsedParamsDetails(c),
        x) : E
    }
    extendTranslation(l, r, u, c, f) {
        if (this.i18nFormat?.parse)
            l = this.i18nFormat.parse(l, {
                ...this.options.interpolation.defaultVariables,
                ...u
            }, u.lng || this.language || c.usedLng, c.usedNS, c.usedKey, {
                resolved: c
            });
        else if (!u.skipInterpolation) {
            u.interpolation && this.interpolator.init({
                ...u,
                interpolation: {
                    ...this.options.interpolation,
                    ...u.interpolation
                }
            });
            const g = le(l) && (u?.interpolation?.skipOnVariables !== void 0 ? u.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
            let p;
            if (g) {
                const v = l.match(this.interpolator.nestingRegexp);
                p = v && v.length
            }
            let b = u.replace && !le(u.replace) ? u.replace : u;
            if (this.options.interpolation.defaultVariables && (b = {
                ...this.options.interpolation.defaultVariables,
                ...b
            }),
            l = this.interpolator.interpolate(l, b, u.lng || this.language || c.usedLng, u),
            g) {
                const v = l.match(this.interpolator.nestingRegexp)
                  , S = v && v.length;
                p < S && (u.nest = !1)
            }
            !u.lng && c && c.res && (u.lng = this.language || c.usedLng),
            u.nest !== !1 && (l = this.interpolator.nest(l, (...v) => f?.[0] === v[0] && !u.context ? (this.logger.warn(`It seems you are nesting recursively key: ${v[0]} in key: ${r[0]}`),
            null) : this.translate(...v, r), u)),
            u.interpolation && this.interpolator.reset()
        }
        const d = u.postProcess || this.options.postProcess
          , m = le(d) ? [d] : d;
        return l != null && m?.length && u.applyPostProcessor !== !1 && (l = qg.handle(m, l, r, this.options && this.options.postProcessPassResolved ? {
            i18nResolved: {
                ...c,
                usedParams: this.getUsedParamsDetails(u)
            },
            ...u
        } : u, this)),
        l
    }
    resolve(l, r={}) {
        let u, c, f, d, m;
        return le(l) && (l = [l]),
        l.forEach(g => {
            if (this.isValidLookup(u))
                return;
            const p = this.extractFromKey(g, r)
              , b = p.key;
            c = b;
            let v = p.namespaces;
            this.options.fallbackNS && (v = v.concat(this.options.fallbackNS));
            const S = r.count !== void 0 && !le(r.count)
              , x = S && !r.ordinal && r.count === 0
              , E = r.context !== void 0 && (le(r.context) || typeof r.context == "number") && r.context !== ""
              , O = r.lngs ? r.lngs : this.languageUtils.toResolveHierarchy(r.lng || this.language, r.fallbackLng);
            v.forEach(C => {
                this.isValidLookup(u) || (m = C,
                !Bm[`${O[0]}-${C}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(m) && (Bm[`${O[0]}-${C}`] = !0,
                this.logger.warn(`key "${c}" for languages "${O.join(", ")}" won't get resolved as namespace "${m}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")),
                O.forEach(M => {
                    if (this.isValidLookup(u))
                        return;
                    d = M;
                    const G = [b];
                    if (this.i18nFormat?.addLookupKeys)
                        this.i18nFormat.addLookupKeys(G, b, M, C, r);
                    else {
                        let K;
                        S && (K = this.pluralResolver.getSuffix(M, r.count, r));
                        const W = `${this.options.pluralSeparator}zero`
                          , ue = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
                        if (S && (r.ordinal && K.indexOf(ue) === 0 && G.push(b + K.replace(ue, this.options.pluralSeparator)),
                        G.push(b + K),
                        x && G.push(b + W)),
                        E) {
                            const I = `${b}${this.options.contextSeparator || "_"}${r.context}`;
                            G.push(I),
                            S && (r.ordinal && K.indexOf(ue) === 0 && G.push(I + K.replace(ue, this.options.pluralSeparator)),
                            G.push(I + K),
                            x && G.push(I + W))
                        }
                    }
                    let V;
                    for (; V = G.pop(); )
                        this.isValidLookup(u) || (f = V,
                        u = this.getResource(M, C, V, r))
                }
                ))
            }
            )
        }
        ),
        {
            res: u,
            usedKey: c,
            exactUsedKey: f,
            usedLng: d,
            usedNS: m
        }
    }
    isValidLookup(l) {
        return l !== void 0 && !(!this.options.returnNull && l === null) && !(!this.options.returnEmptyString && l === "")
    }
    getResource(l, r, u, c={}) {
        return this.i18nFormat?.getResource ? this.i18nFormat.getResource(l, r, u, c) : this.resourceStore.getResource(l, r, u, c)
    }
    getUsedParamsDetails(l={}) {
        const r = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"]
          , u = l.replace && !le(l.replace);
        let c = u ? l.replace : l;
        if (u && typeof l.count < "u" && (c.count = l.count),
        this.options.interpolation.defaultVariables && (c = {
            ...this.options.interpolation.defaultVariables,
            ...c
        }),
        !u) {
            c = {
                ...c
            };
            for (const f of r)
                delete c[f]
        }
        return c
    }
    static hasDefaultValue(l) {
        const r = "defaultValue";
        for (const u in l)
            if (Object.prototype.hasOwnProperty.call(l, u) && r === u.substring(0, r.length) && l[u] !== void 0)
                return !0;
        return !1
    }
}
class qm {
    constructor(l) {
        this.options = l,
        this.supportedLngs = this.options.supportedLngs || !1,
        this.logger = Yt.create("languageUtils")
    }
    getScriptPartFromCode(l) {
        if (l = $l(l),
        !l || l.indexOf("-") < 0)
            return null;
        const r = l.split("-");
        return r.length === 2 || (r.pop(),
        r[r.length - 1].toLowerCase() === "x") ? null : this.formatLanguageCode(r.join("-"))
    }
    getLanguagePartFromCode(l) {
        if (l = $l(l),
        !l || l.indexOf("-") < 0)
            return l;
        const r = l.split("-");
        return this.formatLanguageCode(r[0])
    }
    formatLanguageCode(l) {
        if (le(l) && l.indexOf("-") > -1) {
            let r;
            try {
                r = Intl.getCanonicalLocales(l)[0]
            } catch {}
            return r && this.options.lowerCaseLng && (r = r.toLowerCase()),
            r || (this.options.lowerCaseLng ? l.toLowerCase() : l)
        }
        return this.options.cleanCode || this.options.lowerCaseLng ? l.toLowerCase() : l
    }
    isSupportedCode(l) {
        return (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) && (l = this.getLanguagePartFromCode(l)),
        !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(l) > -1
    }
    getBestMatchFromCodes(l) {
        if (!l)
            return null;
        let r;
        return l.forEach(u => {
            if (r)
                return;
            const c = this.formatLanguageCode(u);
            (!this.options.supportedLngs || this.isSupportedCode(c)) && (r = c)
        }
        ),
        !r && this.options.supportedLngs && l.forEach(u => {
            if (r)
                return;
            const c = this.getScriptPartFromCode(u);
            if (this.isSupportedCode(c))
                return r = c;
            const f = this.getLanguagePartFromCode(u);
            if (this.isSupportedCode(f))
                return r = f;
            r = this.options.supportedLngs.find(d => {
                if (d === f)
                    return d;
                if (!(d.indexOf("-") < 0 && f.indexOf("-") < 0) && (d.indexOf("-") > 0 && f.indexOf("-") < 0 && d.substring(0, d.indexOf("-")) === f || d.indexOf(f) === 0 && f.length > 1))
                    return d
            }
            )
        }
        ),
        r || (r = this.getFallbackCodes(this.options.fallbackLng)[0]),
        r
    }
    getFallbackCodes(l, r) {
        if (!l)
            return [];
        if (typeof l == "function" && (l = l(r)),
        le(l) && (l = [l]),
        Array.isArray(l))
            return l;
        if (!r)
            return l.default || [];
        let u = l[r];
        return u || (u = l[this.getScriptPartFromCode(r)]),
        u || (u = l[this.formatLanguageCode(r)]),
        u || (u = l[this.getLanguagePartFromCode(r)]),
        u || (u = l.default),
        u || []
    }
    toResolveHierarchy(l, r) {
        const u = this.getFallbackCodes((r === !1 ? [] : r) || this.options.fallbackLng || [], l)
          , c = []
          , f = d => {
            d && (this.isSupportedCode(d) ? c.push(d) : this.logger.warn(`rejecting language code not found in supportedLngs: ${d}`))
        }
        ;
        return le(l) && (l.indexOf("-") > -1 || l.indexOf("_") > -1) ? (this.options.load !== "languageOnly" && f(this.formatLanguageCode(l)),
        this.options.load !== "languageOnly" && this.options.load !== "currentOnly" && f(this.getScriptPartFromCode(l)),
        this.options.load !== "currentOnly" && f(this.getLanguagePartFromCode(l))) : le(l) && f(this.formatLanguageCode(l)),
        u.forEach(d => {
            c.indexOf(d) < 0 && f(this.formatLanguageCode(d))
        }
        ),
        c
    }
}
const Gm = {
    zero: 0,
    one: 1,
    two: 2,
    few: 3,
    many: 4,
    other: 5
}
  , Ym = {
    select: s => s === 1 ? "one" : "other",
    resolvedOptions: () => ({
        pluralCategories: ["one", "other"]
    })
};
class u1 {
    constructor(l, r={}) {
        this.languageUtils = l,
        this.options = r,
        this.logger = Yt.create("pluralResolver"),
        this.pluralRulesCache = {}
    }
    addRule(l, r) {
        this.rules[l] = r
    }
    clearCache() {
        this.pluralRulesCache = {}
    }
    getRule(l, r={}) {
        const u = $l(l === "dev" ? "en" : l)
          , c = r.ordinal ? "ordinal" : "cardinal"
          , f = JSON.stringify({
            cleanedCode: u,
            type: c
        });
        if (f in this.pluralRulesCache)
            return this.pluralRulesCache[f];
        let d;
        try {
            d = new Intl.PluralRules(u,{
                type: c
            })
        } catch {
            if (!Intl)
                return this.logger.error("No Intl support, please use an Intl polyfill!"),
                Ym;
            if (!l.match(/-|_/))
                return Ym;
            const g = this.languageUtils.getLanguagePartFromCode(l);
            d = this.getRule(g, r)
        }
        return this.pluralRulesCache[f] = d,
        d
    }
    needsPlural(l, r={}) {
        let u = this.getRule(l, r);
        return u || (u = this.getRule("dev", r)),
        u?.resolvedOptions().pluralCategories.length > 1
    }
    getPluralFormsOfKey(l, r, u={}) {
        return this.getSuffixes(l, u).map(c => `${r}${c}`)
    }
    getSuffixes(l, r={}) {
        let u = this.getRule(l, r);
        return u || (u = this.getRule("dev", r)),
        u ? u.resolvedOptions().pluralCategories.sort( (c, f) => Gm[c] - Gm[f]).map(c => `${this.options.prepend}${r.ordinal ? `ordinal${this.options.prepend}` : ""}${c}`) : []
    }
    getSuffix(l, r, u={}) {
        const c = this.getRule(l, u);
        return c ? `${this.options.prepend}${u.ordinal ? `ordinal${this.options.prepend}` : ""}${c.select(r)}` : (this.logger.warn(`no plural rule found for: ${l}`),
        this.getSuffix("dev", r, u))
    }
}
const Vm = (s, l, r, u=".", c=!0) => {
    let f = Pv(s, l, r);
    return !f && c && le(r) && (f = Lo(s, r, u),
    f === void 0 && (f = Lo(l, r, u))),
    f
}
  , Eo = s => s.replace(/\$/g, "$$$$");
class o1 {
    constructor(l={}) {
        this.logger = Yt.create("interpolator"),
        this.options = l,
        this.format = l?.interpolation?.format || (r => r),
        this.init(l)
    }
    init(l={}) {
        l.interpolation || (l.interpolation = {
            escapeValue: !0
        });
        const {escape: r, escapeValue: u, useRawValueToEscape: c, prefix: f, prefixEscaped: d, suffix: m, suffixEscaped: g, formatSeparator: p, unescapeSuffix: b, unescapePrefix: v, nestingPrefix: S, nestingPrefixEscaped: x, nestingSuffix: E, nestingSuffixEscaped: O, nestingOptionsSeparator: C, maxReplaces: M, alwaysFormat: G} = l.interpolation;
        this.escape = r !== void 0 ? r : t1,
        this.escapeValue = u !== void 0 ? u : !0,
        this.useRawValueToEscape = c !== void 0 ? c : !1,
        this.prefix = f ? Ga(f) : d || "{{",
        this.suffix = m ? Ga(m) : g || "}}",
        this.formatSeparator = p || ",",
        this.unescapePrefix = b ? "" : v || "-",
        this.unescapeSuffix = this.unescapePrefix ? "" : b || "",
        this.nestingPrefix = S ? Ga(S) : x || Ga("$t("),
        this.nestingSuffix = E ? Ga(E) : O || Ga(")"),
        this.nestingOptionsSeparator = C || ",",
        this.maxReplaces = M || 1e3,
        this.alwaysFormat = G !== void 0 ? G : !1,
        this.resetRegExp()
    }
    reset() {
        this.options && this.init(this.options)
    }
    resetRegExp() {
        const l = (r, u) => r?.source === u ? (r.lastIndex = 0,
        r) : new RegExp(u,"g");
        this.regexp = l(this.regexp, `${this.prefix}(.+?)${this.suffix}`),
        this.regexpUnescape = l(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`),
        this.nestingRegexp = l(this.nestingRegexp, `${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`)
    }
    interpolate(l, r, u, c) {
        let f, d, m;
        const g = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {}
          , p = x => {
            if (x.indexOf(this.formatSeparator) < 0) {
                const M = Vm(r, g, x, this.options.keySeparator, this.options.ignoreJSONStructure);
                return this.alwaysFormat ? this.format(M, void 0, u, {
                    ...c,
                    ...r,
                    interpolationkey: x
                }) : M
            }
            const E = x.split(this.formatSeparator)
              , O = E.shift().trim()
              , C = E.join(this.formatSeparator).trim();
            return this.format(Vm(r, g, O, this.options.keySeparator, this.options.ignoreJSONStructure), C, u, {
                ...c,
                ...r,
                interpolationkey: O
            })
        }
        ;
        this.resetRegExp();
        const b = c?.missingInterpolationHandler || this.options.missingInterpolationHandler
          , v = c?.interpolation?.skipOnVariables !== void 0 ? c.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
        return [{
            regex: this.regexpUnescape,
            safeValue: x => Eo(x)
        }, {
            regex: this.regexp,
            safeValue: x => this.escapeValue ? Eo(this.escape(x)) : Eo(x)
        }].forEach(x => {
            for (m = 0; f = x.regex.exec(l); ) {
                const E = f[1].trim();
                if (d = p(E),
                d === void 0)
                    if (typeof b == "function") {
                        const C = b(l, f, c);
                        d = le(C) ? C : ""
                    } else if (c && Object.prototype.hasOwnProperty.call(c, E))
                        d = "";
                    else if (v) {
                        d = f[0];
                        continue
                    } else
                        this.logger.warn(`missed to pass in variable ${E} for interpolating ${l}`),
                        d = "";
                else
                    !le(d) && !this.useRawValueToEscape && (d = Lm(d));
                const O = x.safeValue(d);
                if (l = l.replace(f[0], O),
                v ? (x.regex.lastIndex += d.length,
                x.regex.lastIndex -= f[0].length) : x.regex.lastIndex = 0,
                m++,
                m >= this.maxReplaces)
                    break
            }
        }
        ),
        l
    }
    nest(l, r, u={}) {
        let c, f, d;
        const m = (g, p) => {
            const b = this.nestingOptionsSeparator;
            if (g.indexOf(b) < 0)
                return g;
            const v = g.split(new RegExp(`${b}[ ]*{`));
            let S = `{${v[1]}`;
            g = v[0],
            S = this.interpolate(S, d);
            const x = S.match(/'/g)
              , E = S.match(/"/g);
            ((x?.length ?? 0) % 2 === 0 && !E || E.length % 2 !== 0) && (S = S.replace(/'/g, '"'));
            try {
                d = JSON.parse(S),
                p && (d = {
                    ...p,
                    ...d
                })
            } catch (O) {
                return this.logger.warn(`failed parsing options string in nesting for key ${g}`, O),
                `${g}${b}${S}`
            }
            return d.defaultValue && d.defaultValue.indexOf(this.prefix) > -1 && delete d.defaultValue,
            g
        }
        ;
        for (; c = this.nestingRegexp.exec(l); ) {
            let g = [];
            d = {
                ...u
            },
            d = d.replace && !le(d.replace) ? d.replace : d,
            d.applyPostProcessor = !1,
            delete d.defaultValue;
            const p = /{.*}/.test(c[1]) ? c[1].lastIndexOf("}") + 1 : c[1].indexOf(this.formatSeparator);
            if (p !== -1 && (g = c[1].slice(p).split(this.formatSeparator).map(b => b.trim()).filter(Boolean),
            c[1] = c[1].slice(0, p)),
            f = r(m.call(this, c[1].trim(), d), d),
            f && c[0] === l && !le(f))
                return f;
            le(f) || (f = Lm(f)),
            f || (this.logger.warn(`missed to resolve ${c[1]} for nesting ${l}`),
            f = ""),
            g.length && (f = g.reduce( (b, v) => this.format(b, v, u.lng, {
                ...u,
                interpolationkey: c[1].trim()
            }), f.trim())),
            l = l.replace(c[0], f),
            this.regexp.lastIndex = 0
        }
        return l
    }
}
const c1 = s => {
    let l = s.toLowerCase().trim();
    const r = {};
    if (s.indexOf("(") > -1) {
        const u = s.split("(");
        l = u[0].toLowerCase().trim();
        const c = u[1].substring(0, u[1].length - 1);
        l === "currency" && c.indexOf(":") < 0 ? r.currency || (r.currency = c.trim()) : l === "relativetime" && c.indexOf(":") < 0 ? r.range || (r.range = c.trim()) : c.split(";").forEach(d => {
            if (d) {
                const [m,...g] = d.split(":")
                  , p = g.join(":").trim().replace(/^'+|'+$/g, "")
                  , b = m.trim();
                r[b] || (r[b] = p),
                p === "false" && (r[b] = !1),
                p === "true" && (r[b] = !0),
                isNaN(p) || (r[b] = parseInt(p, 10))
            }
        }
        )
    }
    return {
        formatName: l,
        formatOptions: r
    }
}
  , km = s => {
    const l = {};
    return (r, u, c) => {
        let f = c;
        c && c.interpolationkey && c.formatParams && c.formatParams[c.interpolationkey] && c[c.interpolationkey] && (f = {
            ...f,
            [c.interpolationkey]: void 0
        });
        const d = u + JSON.stringify(f);
        let m = l[d];
        return m || (m = s($l(u), c),
        l[d] = m),
        m(r)
    }
}
  , f1 = s => (l, r, u) => s($l(r), u)(l);
class d1 {
    constructor(l={}) {
        this.logger = Yt.create("formatter"),
        this.options = l,
        this.init(l)
    }
    init(l, r={
        interpolation: {}
    }) {
        this.formatSeparator = r.interpolation.formatSeparator || ",";
        const u = r.cacheInBuiltFormats ? km : f1;
        this.formats = {
            number: u( (c, f) => {
                const d = new Intl.NumberFormat(c,{
                    ...f
                });
                return m => d.format(m)
            }
            ),
            currency: u( (c, f) => {
                const d = new Intl.NumberFormat(c,{
                    ...f,
                    style: "currency"
                });
                return m => d.format(m)
            }
            ),
            datetime: u( (c, f) => {
                const d = new Intl.DateTimeFormat(c,{
                    ...f
                });
                return m => d.format(m)
            }
            ),
            relativetime: u( (c, f) => {
                const d = new Intl.RelativeTimeFormat(c,{
                    ...f
                });
                return m => d.format(m, f.range || "day")
            }
            ),
            list: u( (c, f) => {
                const d = new Intl.ListFormat(c,{
                    ...f
                });
                return m => d.format(m)
            }
            )
        }
    }
    add(l, r) {
        this.formats[l.toLowerCase().trim()] = r
    }
    addCached(l, r) {
        this.formats[l.toLowerCase().trim()] = km(r)
    }
    format(l, r, u, c={}) {
        const f = r.split(this.formatSeparator);
        if (f.length > 1 && f[0].indexOf("(") > 1 && f[0].indexOf(")") < 0 && f.find(m => m.indexOf(")") > -1)) {
            const m = f.findIndex(g => g.indexOf(")") > -1);
            f[0] = [f[0], ...f.splice(1, m)].join(this.formatSeparator)
        }
        return f.reduce( (m, g) => {
            const {formatName: p, formatOptions: b} = c1(g);
            if (this.formats[p]) {
                let v = m;
                try {
                    const S = c?.formatParams?.[c.interpolationkey] || {}
                      , x = S.locale || S.lng || c.locale || c.lng || u;
                    v = this.formats[p](m, x, {
                        ...b,
                        ...c,
                        ...S
                    })
                } catch (S) {
                    this.logger.warn(S)
                }
                return v
            } else
                this.logger.warn(`there was no format function for ${p}`);
            return m
        }
        , l)
    }
}
const h1 = (s, l) => {
    s.pending[l] !== void 0 && (delete s.pending[l],
    s.pendingCount--)
}
;
class m1 extends js {
    constructor(l, r, u, c={}) {
        super(),
        this.backend = l,
        this.store = r,
        this.services = u,
        this.languageUtils = u.languageUtils,
        this.options = c,
        this.logger = Yt.create("backendConnector"),
        this.waitingReads = [],
        this.maxParallelReads = c.maxParallelReads || 10,
        this.readingCalls = 0,
        this.maxRetries = c.maxRetries >= 0 ? c.maxRetries : 5,
        this.retryTimeout = c.retryTimeout >= 1 ? c.retryTimeout : 350,
        this.state = {},
        this.queue = [],
        this.backend?.init?.(u, c.backend, c)
    }
    queueLoad(l, r, u, c) {
        const f = {}
          , d = {}
          , m = {}
          , g = {};
        return l.forEach(p => {
            let b = !0;
            r.forEach(v => {
                const S = `${p}|${v}`;
                !u.reload && this.store.hasResourceBundle(p, v) ? this.state[S] = 2 : this.state[S] < 0 || (this.state[S] === 1 ? d[S] === void 0 && (d[S] = !0) : (this.state[S] = 1,
                b = !1,
                d[S] === void 0 && (d[S] = !0),
                f[S] === void 0 && (f[S] = !0),
                g[v] === void 0 && (g[v] = !0)))
            }
            ),
            b || (m[p] = !0)
        }
        ),
        (Object.keys(f).length || Object.keys(d).length) && this.queue.push({
            pending: d,
            pendingCount: Object.keys(d).length,
            loaded: {},
            errors: [],
            callback: c
        }),
        {
            toLoad: Object.keys(f),
            pending: Object.keys(d),
            toLoadLanguages: Object.keys(m),
            toLoadNamespaces: Object.keys(g)
        }
    }
    loaded(l, r, u) {
        const c = l.split("|")
          , f = c[0]
          , d = c[1];
        r && this.emit("failedLoading", f, d, r),
        !r && u && this.store.addResourceBundle(f, d, u, void 0, void 0, {
            skipCopy: !0
        }),
        this.state[l] = r ? -1 : 2,
        r && u && (this.state[l] = 0);
        const m = {};
        this.queue.forEach(g => {
            Iv(g.loaded, [f], d),
            h1(g, l),
            r && g.errors.push(r),
            g.pendingCount === 0 && !g.done && (Object.keys(g.loaded).forEach(p => {
                m[p] || (m[p] = {});
                const b = g.loaded[p];
                b.length && b.forEach(v => {
                    m[p][v] === void 0 && (m[p][v] = !0)
                }
                )
            }
            ),
            g.done = !0,
            g.errors.length ? g.callback(g.errors) : g.callback())
        }
        ),
        this.emit("loaded", m),
        this.queue = this.queue.filter(g => !g.done)
    }
    read(l, r, u, c=0, f=this.retryTimeout, d) {
        if (!l.length)
            return d(null, {});
        if (this.readingCalls >= this.maxParallelReads) {
            this.waitingReads.push({
                lng: l,
                ns: r,
                fcName: u,
                tried: c,
                wait: f,
                callback: d
            });
            return
        }
        this.readingCalls++;
        const m = (p, b) => {
            if (this.readingCalls--,
            this.waitingReads.length > 0) {
                const v = this.waitingReads.shift();
                this.read(v.lng, v.ns, v.fcName, v.tried, v.wait, v.callback)
            }
            if (p && b && c < this.maxRetries) {
                setTimeout( () => {
                    this.read.call(this, l, r, u, c + 1, f * 2, d)
                }
                , f);
                return
            }
            d(p, b)
        }
          , g = this.backend[u].bind(this.backend);
        if (g.length === 2) {
            try {
                const p = g(l, r);
                p && typeof p.then == "function" ? p.then(b => m(null, b)).catch(m) : m(null, p)
            } catch (p) {
                m(p)
            }
            return
        }
        return g(l, r, m)
    }
    prepareLoading(l, r, u={}, c) {
        if (!this.backend)
            return this.logger.warn("No backend was added via i18next.use. Will not load resources."),
            c && c();
        le(l) && (l = this.languageUtils.toResolveHierarchy(l)),
        le(r) && (r = [r]);
        const f = this.queueLoad(l, r, u, c);
        if (!f.toLoad.length)
            return f.pending.length || c(),
            null;
        f.toLoad.forEach(d => {
            this.loadOne(d)
        }
        )
    }
    load(l, r, u) {
        this.prepareLoading(l, r, {}, u)
    }
    reload(l, r, u) {
        this.prepareLoading(l, r, {
            reload: !0
        }, u)
    }
    loadOne(l, r="") {
        const u = l.split("|")
          , c = u[0]
          , f = u[1];
        this.read(c, f, "read", void 0, void 0, (d, m) => {
            d && this.logger.warn(`${r}loading namespace ${f} for language ${c} failed`, d),
            !d && m && this.logger.log(`${r}loaded namespace ${f} for language ${c}`, m),
            this.loaded(l, d, m)
        }
        )
    }
    saveMissing(l, r, u, c, f, d={}, m= () => {}
    ) {
        if (this.services?.utils?.hasLoadedNamespace && !this.services?.utils?.hasLoadedNamespace(r)) {
            this.logger.warn(`did not save key "${u}" as the namespace "${r}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
            return
        }
        if (!(u == null || u === "")) {
            if (this.backend?.create) {
                const g = {
                    ...d,
                    isUpdate: f
                }
                  , p = this.backend.create.bind(this.backend);
                if (p.length < 6)
                    try {
                        let b;
                        p.length === 5 ? b = p(l, r, u, c, g) : b = p(l, r, u, c),
                        b && typeof b.then == "function" ? b.then(v => m(null, v)).catch(m) : m(null, b)
                    } catch (b) {
                        m(b)
                    }
                else
                    p(l, r, u, c, m, g)
            }
            !l || !l[0] || this.store.addResource(l[0], r, u, c)
        }
    }
}
const Qm = () => ({
    debug: !1,
    initAsync: !0,
    ns: ["translation"],
    defaultNS: ["translation"],
    fallbackLng: ["dev"],
    fallbackNS: !1,
    supportedLngs: !1,
    nonExplicitSupportedLngs: !1,
    load: "all",
    preload: !1,
    simplifyPluralSuffix: !0,
    keySeparator: ".",
    nsSeparator: ":",
    pluralSeparator: "_",
    contextSeparator: "_",
    partialBundledLanguages: !1,
    saveMissing: !1,
    updateMissing: !1,
    saveMissingTo: "fallback",
    saveMissingPlurals: !0,
    missingKeyHandler: !1,
    missingInterpolationHandler: !1,
    postProcess: !1,
    postProcessPassResolved: !1,
    returnNull: !1,
    returnEmptyString: !0,
    returnObjects: !1,
    joinArrays: !1,
    returnedObjectHandler: !1,
    parseMissingKeyHandler: !1,
    appendNamespaceToMissingKey: !1,
    appendNamespaceToCIMode: !1,
    overloadTranslationOptionHandler: s => {
        let l = {};
        if (typeof s[1] == "object" && (l = s[1]),
        le(s[1]) && (l.defaultValue = s[1]),
        le(s[2]) && (l.tDescription = s[2]),
        typeof s[2] == "object" || typeof s[3] == "object") {
            const r = s[3] || s[2];
            Object.keys(r).forEach(u => {
                l[u] = r[u]
            }
            )
        }
        return l
    }
    ,
    interpolation: {
        escapeValue: !0,
        format: s => s,
        prefix: "{{",
        suffix: "}}",
        formatSeparator: ",",
        unescapePrefix: "-",
        nestingPrefix: "$t(",
        nestingSuffix: ")",
        nestingOptionsSeparator: ",",
        maxReplaces: 1e3,
        skipOnVariables: !0
    },
    cacheInBuiltFormats: !0
})
  , Xm = s => (le(s.ns) && (s.ns = [s.ns]),
le(s.fallbackLng) && (s.fallbackLng = [s.fallbackLng]),
le(s.fallbackNS) && (s.fallbackNS = [s.fallbackNS]),
s.supportedLngs?.indexOf?.("cimode") < 0 && (s.supportedLngs = s.supportedLngs.concat(["cimode"])),
typeof s.initImmediate == "boolean" && (s.initAsync = s.initImmediate),
s)
  , _s = () => {}
  , g1 = s => {
    Object.getOwnPropertyNames(Object.getPrototypeOf(s)).forEach(r => {
        typeof s[r] == "function" && (s[r] = s[r].bind(s))
    }
    )
}
;
class Wl extends js {
    constructor(l={}, r) {
        if (super(),
        this.options = Xm(l),
        this.services = {},
        this.logger = Yt,
        this.modules = {
            external: []
        },
        g1(this),
        r && !this.isInitialized && !l.isClone) {
            if (!this.options.initAsync)
                return this.init(l, r),
                this;
            setTimeout( () => {
                this.init(l, r)
            }
            , 0)
        }
    }
    init(l={}, r) {
        this.isInitializing = !0,
        typeof l == "function" && (r = l,
        l = {}),
        l.defaultNS == null && l.ns && (le(l.ns) ? l.defaultNS = l.ns : l.ns.indexOf("translation") < 0 && (l.defaultNS = l.ns[0]));
        const u = Qm();
        this.options = {
            ...u,
            ...this.options,
            ...Xm(l)
        },
        this.options.interpolation = {
            ...u.interpolation,
            ...this.options.interpolation
        },
        l.keySeparator !== void 0 && (this.options.userDefinedKeySeparator = l.keySeparator),
        l.nsSeparator !== void 0 && (this.options.userDefinedNsSeparator = l.nsSeparator);
        const c = p => p ? typeof p == "function" ? new p : p : null;
        if (!this.options.isClone) {
            this.modules.logger ? Yt.init(c(this.modules.logger), this.options) : Yt.init(null, this.options);
            let p;
            this.modules.formatter ? p = this.modules.formatter : p = d1;
            const b = new qm(this.options);
            this.store = new Um(this.options.resources,this.options);
            const v = this.services;
            v.logger = Yt,
            v.resourceStore = this.store,
            v.languageUtils = b,
            v.pluralResolver = new u1(b,{
                prepend: this.options.pluralSeparator,
                simplifyPluralSuffix: this.options.simplifyPluralSuffix
            }),
            this.options.interpolation.format && this.options.interpolation.format !== u.interpolation.format && this.logger.deprecate("init: you are still using the legacy format function, please use the new approach: https://www.i18next.com/translation-function/formatting"),
            p && (!this.options.interpolation.format || this.options.interpolation.format === u.interpolation.format) && (v.formatter = c(p),
            v.formatter.init && v.formatter.init(v, this.options),
            this.options.interpolation.format = v.formatter.format.bind(v.formatter)),
            v.interpolator = new o1(this.options),
            v.utils = {
                hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
            },
            v.backendConnector = new m1(c(this.modules.backend),v.resourceStore,v,this.options),
            v.backendConnector.on("*", (x, ...E) => {
                this.emit(x, ...E)
            }
            ),
            this.modules.languageDetector && (v.languageDetector = c(this.modules.languageDetector),
            v.languageDetector.init && v.languageDetector.init(v, this.options.detection, this.options)),
            this.modules.i18nFormat && (v.i18nFormat = c(this.modules.i18nFormat),
            v.i18nFormat.init && v.i18nFormat.init(this)),
            this.translator = new Ls(this.services,this.options),
            this.translator.on("*", (x, ...E) => {
                this.emit(x, ...E)
            }
            ),
            this.modules.external.forEach(x => {
                x.init && x.init(this)
            }
            )
        }
        if (this.format = this.options.interpolation.format,
        r || (r = _s),
        this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
            const p = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
            p.length > 0 && p[0] !== "dev" && (this.options.lng = p[0])
        }
        !this.services.languageDetector && !this.options.lng && this.logger.warn("init: no languageDetector is used and no lng is defined"),
        ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"].forEach(p => {
            this[p] = (...b) => this.store[p](...b)
        }
        ),
        ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"].forEach(p => {
            this[p] = (...b) => (this.store[p](...b),
            this)
        }
        );
        const m = kl()
          , g = () => {
            const p = (b, v) => {
                this.isInitializing = !1,
                this.isInitialized && !this.initializedStoreOnce && this.logger.warn("init: i18next is already initialized. You should call init just once!"),
                this.isInitialized = !0,
                this.options.isClone || this.logger.log("initialized", this.options),
                this.emit("initialized", this.options),
                m.resolve(v),
                r(b, v)
            }
            ;
            if (this.languages && !this.isInitialized)
                return p(null, this.t.bind(this));
            this.changeLanguage(this.options.lng, p)
        }
        ;
        return this.options.resources || !this.options.initAsync ? g() : setTimeout(g, 0),
        m
    }
    loadResources(l, r=_s) {
        let u = r;
        const c = le(l) ? l : this.language;
        if (typeof l == "function" && (u = l),
        !this.options.resources || this.options.partialBundledLanguages) {
            if (c?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0))
                return u();
            const f = []
              , d = m => {
                if (!m || m === "cimode")
                    return;
                this.services.languageUtils.toResolveHierarchy(m).forEach(p => {
                    p !== "cimode" && f.indexOf(p) < 0 && f.push(p)
                }
                )
            }
            ;
            c ? d(c) : this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach(g => d(g)),
            this.options.preload?.forEach?.(m => d(m)),
            this.services.backendConnector.load(f, this.options.ns, m => {
                !m && !this.resolvedLanguage && this.language && this.setResolvedLanguage(this.language),
                u(m)
            }
            )
        } else
            u(null)
    }
    reloadResources(l, r, u) {
        const c = kl();
        return typeof l == "function" && (u = l,
        l = void 0),
        typeof r == "function" && (u = r,
        r = void 0),
        l || (l = this.languages),
        r || (r = this.options.ns),
        u || (u = _s),
        this.services.backendConnector.reload(l, r, f => {
            c.resolve(),
            u(f)
        }
        ),
        c
    }
    use(l) {
        if (!l)
            throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
        if (!l.type)
            throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
        return l.type === "backend" && (this.modules.backend = l),
        (l.type === "logger" || l.log && l.warn && l.error) && (this.modules.logger = l),
        l.type === "languageDetector" && (this.modules.languageDetector = l),
        l.type === "i18nFormat" && (this.modules.i18nFormat = l),
        l.type === "postProcessor" && qg.addPostProcessor(l),
        l.type === "formatter" && (this.modules.formatter = l),
        l.type === "3rdParty" && this.modules.external.push(l),
        this
    }
    setResolvedLanguage(l) {
        if (!(!l || !this.languages) && !(["cimode", "dev"].indexOf(l) > -1)) {
            for (let r = 0; r < this.languages.length; r++) {
                const u = this.languages[r];
                if (!(["cimode", "dev"].indexOf(u) > -1) && this.store.hasLanguageSomeTranslations(u)) {
                    this.resolvedLanguage = u;
                    break
                }
            }
            !this.resolvedLanguage && this.languages.indexOf(l) < 0 && this.store.hasLanguageSomeTranslations(l) && (this.resolvedLanguage = l,
            this.languages.unshift(l))
        }
    }
    changeLanguage(l, r) {
        this.isLanguageChangingTo = l;
        const u = kl();
        this.emit("languageChanging", l);
        const c = m => {
            this.language = m,
            this.languages = this.services.languageUtils.toResolveHierarchy(m),
            this.resolvedLanguage = void 0,
            this.setResolvedLanguage(m)
        }
          , f = (m, g) => {
            g ? this.isLanguageChangingTo === l && (c(g),
            this.translator.changeLanguage(g),
            this.isLanguageChangingTo = void 0,
            this.emit("languageChanged", g),
            this.logger.log("languageChanged", g)) : this.isLanguageChangingTo = void 0,
            u.resolve( (...p) => this.t(...p)),
            r && r(m, (...p) => this.t(...p))
        }
          , d = m => {
            !l && !m && this.services.languageDetector && (m = []);
            const g = le(m) ? m : m && m[0]
              , p = this.store.hasLanguageSomeTranslations(g) ? g : this.services.languageUtils.getBestMatchFromCodes(le(m) ? [m] : m);
            p && (this.language || c(p),
            this.translator.language || this.translator.changeLanguage(p),
            this.services.languageDetector?.cacheUserLanguage?.(p)),
            this.loadResources(p, b => {
                f(b, p)
            }
            )
        }
        ;
        return !l && this.services.languageDetector && !this.services.languageDetector.async ? d(this.services.languageDetector.detect()) : !l && this.services.languageDetector && this.services.languageDetector.async ? this.services.languageDetector.detect.length === 0 ? this.services.languageDetector.detect().then(d) : this.services.languageDetector.detect(d) : d(l),
        u
    }
    getFixedT(l, r, u) {
        const c = (f, d, ...m) => {
            let g;
            typeof d != "object" ? g = this.options.overloadTranslationOptionHandler([f, d].concat(m)) : g = {
                ...d
            },
            g.lng = g.lng || c.lng,
            g.lngs = g.lngs || c.lngs,
            g.ns = g.ns || c.ns,
            g.keyPrefix !== "" && (g.keyPrefix = g.keyPrefix || u || c.keyPrefix);
            const p = this.options.keySeparator || ".";
            let b;
            return g.keyPrefix && Array.isArray(f) ? b = f.map(v => (typeof v == "function" && (v = Mo(v, d)),
            `${g.keyPrefix}${p}${v}`)) : (typeof f == "function" && (f = Mo(f, d)),
            b = g.keyPrefix ? `${g.keyPrefix}${p}${f}` : f),
            this.t(b, g)
        }
        ;
        return le(l) ? c.lng = l : c.lngs = l,
        c.ns = r,
        c.keyPrefix = u,
        c
    }
    t(...l) {
        return this.translator?.translate(...l)
    }
    exists(...l) {
        return this.translator?.exists(...l)
    }
    setDefaultNamespace(l) {
        this.options.defaultNS = l
    }
    hasLoadedNamespace(l, r={}) {
        if (!this.isInitialized)
            return this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages),
            !1;
        if (!this.languages || !this.languages.length)
            return this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages),
            !1;
        const u = r.lng || this.resolvedLanguage || this.languages[0]
          , c = this.options ? this.options.fallbackLng : !1
          , f = this.languages[this.languages.length - 1];
        if (u.toLowerCase() === "cimode")
            return !0;
        const d = (m, g) => {
            const p = this.services.backendConnector.state[`${m}|${g}`];
            return p === -1 || p === 0 || p === 2
        }
        ;
        if (r.precheck) {
            const m = r.precheck(this, d);
            if (m !== void 0)
                return m
        }
        return !!(this.hasResourceBundle(u, l) || !this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages || d(u, l) && (!c || d(f, l)))
    }
    loadNamespaces(l, r) {
        const u = kl();
        return this.options.ns ? (le(l) && (l = [l]),
        l.forEach(c => {
            this.options.ns.indexOf(c) < 0 && this.options.ns.push(c)
        }
        ),
        this.loadResources(c => {
            u.resolve(),
            r && r(c)
        }
        ),
        u) : (r && r(),
        Promise.resolve())
    }
    loadLanguages(l, r) {
        const u = kl();
        le(l) && (l = [l]);
        const c = this.options.preload || []
          , f = l.filter(d => c.indexOf(d) < 0 && this.services.languageUtils.isSupportedCode(d));
        return f.length ? (this.options.preload = c.concat(f),
        this.loadResources(d => {
            u.resolve(),
            r && r(d)
        }
        ),
        u) : (r && r(),
        Promise.resolve())
    }
    dir(l) {
        if (l || (l = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language)),
        !l)
            return "rtl";
        try {
            const c = new Intl.Locale(l);
            if (c && c.getTextInfo) {
                const f = c.getTextInfo();
                if (f && f.direction)
                    return f.direction
            }
        } catch {}
        const r = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"]
          , u = this.services?.languageUtils || new qm(Qm());
        return l.toLowerCase().indexOf("-latn") > 1 ? "ltr" : r.indexOf(u.getLanguagePartFromCode(l)) > -1 || l.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr"
    }
    static createInstance(l={}, r) {
        return new Wl(l,r)
    }
    cloneInstance(l={}, r=_s) {
        const u = l.forkResourceStore;
        u && delete l.forkResourceStore;
        const c = {
            ...this.options,
            ...l,
            isClone: !0
        }
          , f = new Wl(c);
        if ((l.debug !== void 0 || l.prefix !== void 0) && (f.logger = f.logger.clone(l)),
        ["store", "services", "language"].forEach(m => {
            f[m] = this[m]
        }
        ),
        f.services = {
            ...this.services
        },
        f.services.utils = {
            hasLoadedNamespace: f.hasLoadedNamespace.bind(f)
        },
        u) {
            const m = Object.keys(this.store.data).reduce( (g, p) => (g[p] = {
                ...this.store.data[p]
            },
            g[p] = Object.keys(g[p]).reduce( (b, v) => (b[v] = {
                ...g[p][v]
            },
            b), g[p]),
            g), {});
            f.store = new Um(m,c),
            f.services.resourceStore = f.store
        }
        return f.translator = new Ls(f.services,c),
        f.translator.on("*", (m, ...g) => {
            f.emit(m, ...g)
        }
        ),
        f.init(c, r),
        f.translator.options = c,
        f.translator.backendConnector.services.utils = {
            hasLoadedNamespace: f.hasLoadedNamespace.bind(f)
        },
        f
    }
    toJSON() {
        return {
            options: this.options,
            store: this.store,
            language: this.language,
            languages: this.languages,
            resolvedLanguage: this.resolvedLanguage
        }
    }
}
const et = Wl.createInstance();
et.createInstance = Wl.createInstance;
et.createInstance;
et.dir;
et.init;
et.loadResources;
et.reloadResources;
et.use;
et.changeLanguage;
et.getFixedT;
et.t;
et.exists;
et.setDefaultNamespace;
et.hasLoadedNamespace;
et.loadNamespaces;
et.loadLanguages;
const p1 = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g
  , y1 = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"',
    "&nbsp;": " ",
    "&#160;": " ",
    "&copy;": "©",
    "&#169;": "©",
    "&reg;": "®",
    "&#174;": "®",
    "&hellip;": "…",
    "&#8230;": "…",
    "&#x2F;": "/",
    "&#47;": "/"
}
  , v1 = s => y1[s]
  , b1 = s => s.replace(p1, v1);
let Fm = {
    bindI18n: "languageChanged",
    bindI18nStore: "",
    transEmptyNodeValue: "",
    transSupportBasicHtmlNodes: !0,
    transWrapTextNodes: "",
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
    useSuspense: !0,
    unescape: b1
};
const x1 = (s={}) => {
    Fm = {
        ...Fm,
        ...s
    }
}
  , S1 = {
    type: "3rdParty",
    init(s) {
        x1(s.options.react)
    }
}
  , E1 = j.createContext();
function w1({i18n: s, defaultNS: l, children: r}) {
    const u = j.useMemo( () => ({
        i18n: s,
        defaultNS: l
    }), [s, l]);
    return j.createElement(E1.Provider, {
        value: u
    }, r)
}
const {slice: C1, forEach: _1} = [];
function A1(s) {
    return _1.call(C1.call(arguments, 1), l => {
        if (l)
            for (const r in l)
                s[r] === void 0 && (s[r] = l[r])
    }
    ),
    s
}
function T1(s) {
    return typeof s != "string" ? !1 : [/<\s*script.*?>/i, /<\s*\/\s*script\s*>/i, /<\s*img.*?on\w+\s*=/i, /<\s*\w+\s*on\w+\s*=.*?>/i, /javascript\s*:/i, /vbscript\s*:/i, /expression\s*\(/i, /eval\s*\(/i, /alert\s*\(/i, /document\.cookie/i, /document\.write\s*\(/i, /window\.location/i, /innerHTML/i].some(r => r.test(s))
}
const Zm = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/
  , O1 = function(s, l) {
    const u = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        path: "/"
    }
      , c = encodeURIComponent(l);
    let f = `${s}=${c}`;
    if (u.maxAge > 0) {
        const d = u.maxAge - 0;
        if (Number.isNaN(d))
            throw new Error("maxAge should be a Number");
        f += `; Max-Age=${Math.floor(d)}`
    }
    if (u.domain) {
        if (!Zm.test(u.domain))
            throw new TypeError("option domain is invalid");
        f += `; Domain=${u.domain}`
    }
    if (u.path) {
        if (!Zm.test(u.path))
            throw new TypeError("option path is invalid");
        f += `; Path=${u.path}`
    }
    if (u.expires) {
        if (typeof u.expires.toUTCString != "function")
            throw new TypeError("option expires is invalid");
        f += `; Expires=${u.expires.toUTCString()}`
    }
    if (u.httpOnly && (f += "; HttpOnly"),
    u.secure && (f += "; Secure"),
    u.sameSite)
        switch (typeof u.sameSite == "string" ? u.sameSite.toLowerCase() : u.sameSite) {
        case !0:
            f += "; SameSite=Strict";
            break;
        case "lax":
            f += "; SameSite=Lax";
            break;
        case "strict":
            f += "; SameSite=Strict";
            break;
        case "none":
            f += "; SameSite=None";
            break;
        default:
            throw new TypeError("option sameSite is invalid")
        }
    return u.partitioned && (f += "; Partitioned"),
    f
}
  , Km = {
    create(s, l, r, u) {
        let c = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {
            path: "/",
            sameSite: "strict"
        };
        r && (c.expires = new Date,
        c.expires.setTime(c.expires.getTime() + r * 60 * 1e3)),
        u && (c.domain = u),
        document.cookie = O1(s, l, c)
    },
    read(s) {
        const l = `${s}=`
          , r = document.cookie.split(";");
        for (let u = 0; u < r.length; u++) {
            let c = r[u];
            for (; c.charAt(0) === " "; )
                c = c.substring(1, c.length);
            if (c.indexOf(l) === 0)
                return c.substring(l.length, c.length)
        }
        return null
    },
    remove(s, l) {
        this.create(s, "", -1, l)
    }
};
var R1 = {
    name: "cookie",
    lookup(s) {
        let {lookupCookie: l} = s;
        if (l && typeof document < "u")
            return Km.read(l) || void 0
    },
    cacheUserLanguage(s, l) {
        let {lookupCookie: r, cookieMinutes: u, cookieDomain: c, cookieOptions: f} = l;
        r && typeof document < "u" && Km.create(r, s, u, c, f)
    }
}
  , N1 = {
    name: "querystring",
    lookup(s) {
        let {lookupQuerystring: l} = s, r;
        if (typeof window < "u") {
            let {search: u} = window.location;
            !window.location.search && window.location.hash?.indexOf("?") > -1 && (u = window.location.hash.substring(window.location.hash.indexOf("?")));
            const f = u.substring(1).split("&");
            for (let d = 0; d < f.length; d++) {
                const m = f[d].indexOf("=");
                m > 0 && f[d].substring(0, m) === l && (r = f[d].substring(m + 1))
            }
        }
        return r
    }
}
  , z1 = {
    name: "hash",
    lookup(s) {
        let {lookupHash: l, lookupFromHashIndex: r} = s, u;
        if (typeof window < "u") {
            const {hash: c} = window.location;
            if (c && c.length > 2) {
                const f = c.substring(1);
                if (l) {
                    const d = f.split("&");
                    for (let m = 0; m < d.length; m++) {
                        const g = d[m].indexOf("=");
                        g > 0 && d[m].substring(0, g) === l && (u = d[m].substring(g + 1))
                    }
                }
                if (u)
                    return u;
                if (!u && r > -1) {
                    const d = c.match(/\/([a-zA-Z-]*)/g);
                    return Array.isArray(d) ? d[typeof r == "number" ? r : 0]?.replace("/", "") : void 0
                }
            }
        }
        return u
    }
};
let Ya = null;
const Jm = () => {
    if (Ya !== null)
        return Ya;
    try {
        if (Ya = typeof window < "u" && window.localStorage !== null,
        !Ya)
            return !1;
        const s = "i18next.translate.boo";
        window.localStorage.setItem(s, "foo"),
        window.localStorage.removeItem(s)
    } catch {
        Ya = !1
    }
    return Ya
}
;
var L1 = {
    name: "localStorage",
    lookup(s) {
        let {lookupLocalStorage: l} = s;
        if (l && Jm())
            return window.localStorage.getItem(l) || void 0
    },
    cacheUserLanguage(s, l) {
        let {lookupLocalStorage: r} = l;
        r && Jm() && window.localStorage.setItem(r, s)
    }
};
let Va = null;
const $m = () => {
    if (Va !== null)
        return Va;
    try {
        if (Va = typeof window < "u" && window.sessionStorage !== null,
        !Va)
            return !1;
        const s = "i18next.translate.boo";
        window.sessionStorage.setItem(s, "foo"),
        window.sessionStorage.removeItem(s)
    } catch {
        Va = !1
    }
    return Va
}
;
var M1 = {
    name: "sessionStorage",
    lookup(s) {
        let {lookupSessionStorage: l} = s;
        if (l && $m())
            return window.sessionStorage.getItem(l) || void 0
    },
    cacheUserLanguage(s, l) {
        let {lookupSessionStorage: r} = l;
        r && $m() && window.sessionStorage.setItem(r, s)
    }
}
  , D1 = {
    name: "navigator",
    lookup(s) {
        const l = [];
        if (typeof navigator < "u") {
            const {languages: r, userLanguage: u, language: c} = navigator;
            if (r)
                for (let f = 0; f < r.length; f++)
                    l.push(r[f]);
            u && l.push(u),
            c && l.push(c)
        }
        return l.length > 0 ? l : void 0
    }
}
  , j1 = {
    name: "htmlTag",
    lookup(s) {
        let {htmlTag: l} = s, r;
        const u = l || (typeof document < "u" ? document.documentElement : null);
        return u && typeof u.getAttribute == "function" && (r = u.getAttribute("lang")),
        r
    }
}
  , U1 = {
    name: "path",
    lookup(s) {
        let {lookupFromPathIndex: l} = s;
        if (typeof window > "u")
            return;
        const r = window.location.pathname.match(/\/([a-zA-Z-]*)/g);
        return Array.isArray(r) ? r[typeof l == "number" ? l : 0]?.replace("/", "") : void 0
    }
}
  , B1 = {
    name: "subdomain",
    lookup(s) {
        let {lookupFromSubdomainIndex: l} = s;
        const r = typeof l == "number" ? l + 1 : 1
          , u = typeof window < "u" && window.location?.hostname?.match(/^(\w{2,5})\.(([a-z0-9-]{1,63}\.[a-z]{2,6})|localhost)/i);
        if (u)
            return u[r]
    }
};
let Yg = !1;
try {
    document.cookie,
    Yg = !0
} catch {}
const Vg = ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"];
Yg || Vg.splice(1, 1);
const H1 = () => ({
    order: Vg,
    lookupQuerystring: "lng",
    lookupCookie: "i18next",
    lookupLocalStorage: "i18nextLng",
    lookupSessionStorage: "i18nextLng",
    caches: ["localStorage"],
    excludeCacheFor: ["cimode"],
    convertDetectedLanguage: s => s
});
class kg {
    constructor(l) {
        let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        this.type = "languageDetector",
        this.detectors = {},
        this.init(l, r)
    }
    init() {
        let l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
            languageUtils: {}
        }
          , r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}
          , u = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        this.services = l,
        this.options = A1(r, this.options || {}, H1()),
        typeof this.options.convertDetectedLanguage == "string" && this.options.convertDetectedLanguage.indexOf("15897") > -1 && (this.options.convertDetectedLanguage = c => c.replace("-", "_")),
        this.options.lookupFromUrlIndex && (this.options.lookupFromPathIndex = this.options.lookupFromUrlIndex),
        this.i18nOptions = u,
        this.addDetector(R1),
        this.addDetector(N1),
        this.addDetector(L1),
        this.addDetector(M1),
        this.addDetector(D1),
        this.addDetector(j1),
        this.addDetector(U1),
        this.addDetector(B1),
        this.addDetector(z1)
    }
    addDetector(l) {
        return this.detectors[l.name] = l,
        this
    }
    detect() {
        let l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.options.order
          , r = [];
        return l.forEach(u => {
            if (this.detectors[u]) {
                let c = this.detectors[u].lookup(this.options);
                c && typeof c == "string" && (c = [c]),
                c && (r = r.concat(c))
            }
        }
        ),
        r = r.filter(u => u != null && !T1(u)).map(u => this.options.convertDetectedLanguage(u)),
        this.services && this.services.languageUtils && this.services.languageUtils.getBestMatchFromCodes ? r : r.length > 0 ? r[0] : null
    }
    cacheUserLanguage(l) {
        let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.options.caches;
        r && (this.options.excludeCacheFor && this.options.excludeCacheFor.indexOf(l) > -1 || r.forEach(u => {
            this.detectors[u] && this.detectors[u].cacheUserLanguage(l, this.options)
        }
        ))
    }
}
kg.type = "languageDetector";
const Wm = Object.assign({})
  , Kl = {};
Object.keys(Wm).forEach(s => {
    const l = s.match(/\.\/([^/]+)\/([^/]+)\.ts$/);
    if (l) {
        const [,r] = l
          , u = Wm[s];
        Kl[r] || (Kl[r] = {
            translation: {}
        }),
        u.default && (Kl[r].translation = {
            ...Kl[r].translation,
            ...u.default
        })
    }
}
);
et.use(kg).use(S1).init({
    lng: "en",
    fallbackLng: "en",
    debug: !1,
    resources: Kl,
    interpolation: {
        escapeValue: !1
    }
});
var wo = {
    exports: {}
}
  , Ql = {}
  , Co = {
    exports: {}
}
  , _o = {};
var Im;
function q1() {
    return Im || (Im = 1,
    (function(s) {
        function l(U, Q) {
            var te = U.length;
            U.push(Q);
            e: for (; 0 < te; ) {
                var be = te - 1 >>> 1
                  , we = U[be];
                if (0 < c(we, Q))
                    U[be] = Q,
                    U[te] = we,
                    te = be;
                else
                    break e
            }
        }
        function r(U) {
            return U.length === 0 ? null : U[0]
        }
        function u(U) {
            if (U.length === 0)
                return null;
            var Q = U[0]
              , te = U.pop();
            if (te !== Q) {
                U[0] = te;
                e: for (var be = 0, we = U.length, A = we >>> 1; be < A; ) {
                    var H = 2 * (be + 1) - 1
                      , F = U[H]
                      , J = H + 1
                      , se = U[J];
                    if (0 > c(F, te))
                        J < we && 0 > c(se, F) ? (U[be] = se,
                        U[J] = te,
                        be = J) : (U[be] = F,
                        U[H] = te,
                        be = H);
                    else if (J < we && 0 > c(se, te))
                        U[be] = se,
                        U[J] = te,
                        be = J;
                    else
                        break e
                }
            }
            return Q
        }
        function c(U, Q) {
            var te = U.sortIndex - Q.sortIndex;
            return te !== 0 ? te : U.id - Q.id
        }
        if (s.unstable_now = void 0,
        typeof performance == "object" && typeof performance.now == "function") {
            var f = performance;
            s.unstable_now = function() {
                return f.now()
            }
        } else {
            var d = Date
              , m = d.now();
            s.unstable_now = function() {
                return d.now() - m
            }
        }
        var g = []
          , p = []
          , b = 1
          , v = null
          , S = 3
          , x = !1
          , E = !1
          , O = !1
          , C = !1
          , M = typeof setTimeout == "function" ? setTimeout : null
          , G = typeof clearTimeout == "function" ? clearTimeout : null
          , V = typeof setImmediate < "u" ? setImmediate : null;
        function K(U) {
            for (var Q = r(p); Q !== null; ) {
                if (Q.callback === null)
                    u(p);
                else if (Q.startTime <= U)
                    u(p),
                    Q.sortIndex = Q.expirationTime,
                    l(g, Q);
                else
                    break;
                Q = r(p)
            }
        }
        function W(U) {
            if (O = !1,
            K(U),
            !E)
                if (r(g) !== null)
                    E = !0,
                    ue || (ue = !0,
                    Z());
                else {
                    var Q = r(p);
                    Q !== null && fe(W, Q.startTime - U)
                }
        }
        var ue = !1
          , I = -1
          , ye = 5
          , _e = -1;
        function k() {
            return C ? !0 : !(s.unstable_now() - _e < ye)
        }
        function X() {
            if (C = !1,
            ue) {
                var U = s.unstable_now();
                _e = U;
                var Q = !0;
                try {
                    e: {
                        E = !1,
                        O && (O = !1,
                        G(I),
                        I = -1),
                        x = !0;
                        var te = S;
                        try {
                            t: {
                                for (K(U),
                                v = r(g); v !== null && !(v.expirationTime > U && k()); ) {
                                    var be = v.callback;
                                    if (typeof be == "function") {
                                        v.callback = null,
                                        S = v.priorityLevel;
                                        var we = be(v.expirationTime <= U);
                                        if (U = s.unstable_now(),
                                        typeof we == "function") {
                                            v.callback = we,
                                            K(U),
                                            Q = !0;
                                            break t
                                        }
                                        v === r(g) && u(g),
                                        K(U)
                                    } else
                                        u(g);
                                    v = r(g)
                                }
                                if (v !== null)
                                    Q = !0;
                                else {
                                    var A = r(p);
                                    A !== null && fe(W, A.startTime - U),
                                    Q = !1
                                }
                            }
                            break e
                        } finally {
                            v = null,
                            S = te,
                            x = !1
                        }
                        Q = void 0
                    }
                } finally {
                    Q ? Z() : ue = !1
                }
            }
        }
        var Z;
        if (typeof V == "function")
            Z = function() {
                V(X)
            }
            ;
        else if (typeof MessageChannel < "u") {
            var ne = new MessageChannel
              , oe = ne.port2;
            ne.port1.onmessage = X,
            Z = function() {
                oe.postMessage(null)
            }
        } else
            Z = function() {
                M(X, 0)
            }
            ;
        function fe(U, Q) {
            I = M(function() {
                U(s.unstable_now())
            }, Q)
        }
        s.unstable_IdlePriority = 5,
        s.unstable_ImmediatePriority = 1,
        s.unstable_LowPriority = 4,
        s.unstable_NormalPriority = 3,
        s.unstable_Profiling = null,
        s.unstable_UserBlockingPriority = 2,
        s.unstable_cancelCallback = function(U) {
            U.callback = null
        }
        ,
        s.unstable_forceFrameRate = function(U) {
            0 > U || 125 < U ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : ye = 0 < U ? Math.floor(1e3 / U) : 5
        }
        ,
        s.unstable_getCurrentPriorityLevel = function() {
            return S
        }
        ,
        s.unstable_next = function(U) {
            switch (S) {
            case 1:
            case 2:
            case 3:
                var Q = 3;
                break;
            default:
                Q = S
            }
            var te = S;
            S = Q;
            try {
                return U()
            } finally {
                S = te
            }
        }
        ,
        s.unstable_requestPaint = function() {
            C = !0
        }
        ,
        s.unstable_runWithPriority = function(U, Q) {
            switch (U) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            default:
                U = 3
            }
            var te = S;
            S = U;
            try {
                return Q()
            } finally {
                S = te
            }
        }
        ,
        s.unstable_scheduleCallback = function(U, Q, te) {
            var be = s.unstable_now();
            switch (typeof te == "object" && te !== null ? (te = te.delay,
            te = typeof te == "number" && 0 < te ? be + te : be) : te = be,
            U) {
            case 1:
                var we = -1;
                break;
            case 2:
                we = 250;
                break;
            case 5:
                we = 1073741823;
                break;
            case 4:
                we = 1e4;
                break;
            default:
                we = 5e3
            }
            return we = te + we,
            U = {
                id: b++,
                callback: Q,
                priorityLevel: U,
                startTime: te,
                expirationTime: we,
                sortIndex: -1
            },
            te > be ? (U.sortIndex = te,
            l(p, U),
            r(g) === null && U === r(p) && (O ? (G(I),
            I = -1) : O = !0,
            fe(W, te - be))) : (U.sortIndex = we,
            l(g, U),
            E || x || (E = !0,
            ue || (ue = !0,
            Z()))),
            U
        }
        ,
        s.unstable_shouldYield = k,
        s.unstable_wrapCallback = function(U) {
            var Q = S;
            return function() {
                var te = S;
                S = Q;
                try {
                    return U.apply(this, arguments)
                } finally {
                    S = te
                }
            }
        }
    }
    )(_o)),
    _o
}
var Pm;
function G1() {
    return Pm || (Pm = 1,
    Co.exports = q1()),
    Co.exports
}
var Ao = {
    exports: {}
}
  , tt = {};
var eg;
function Y1() {
    if (eg)
        return tt;
    eg = 1;
    var s = Qo();
    function l(g) {
        var p = "https://react.dev/errors/" + g;
        if (1 < arguments.length) {
            p += "?args[]=" + encodeURIComponent(arguments[1]);
            for (var b = 2; b < arguments.length; b++)
                p += "&args[]=" + encodeURIComponent(arguments[b])
        }
        return "Minified React error #" + g + "; visit " + p + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    }
    function r() {}
    var u = {
        d: {
            f: r,
            r: function() {
                throw Error(l(522))
            },
            D: r,
            C: r,
            L: r,
            m: r,
            X: r,
            S: r,
            M: r
        },
        p: 0,
        findDOMNode: null
    }
      , c = Symbol.for("react.portal");
    function f(g, p, b) {
        var v = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
        return {
            $$typeof: c,
            key: v == null ? null : "" + v,
            children: g,
            containerInfo: p,
            implementation: b
        }
    }
    var d = s.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function m(g, p) {
        if (g === "font")
            return "";
        if (typeof p == "string")
            return p === "use-credentials" ? p : ""
    }
    return tt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = u,
    tt.createPortal = function(g, p) {
        var b = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!p || p.nodeType !== 1 && p.nodeType !== 9 && p.nodeType !== 11)
            throw Error(l(299));
        return f(g, p, null, b)
    }
    ,
    tt.flushSync = function(g) {
        var p = d.T
          , b = u.p;
        try {
            if (d.T = null,
            u.p = 2,
            g)
                return g()
        } finally {
            d.T = p,
            u.p = b,
            u.d.f()
        }
    }
    ,
    tt.preconnect = function(g, p) {
        typeof g == "string" && (p ? (p = p.crossOrigin,
        p = typeof p == "string" ? p === "use-credentials" ? p : "" : void 0) : p = null,
        u.d.C(g, p))
    }
    ,
    tt.prefetchDNS = function(g) {
        typeof g == "string" && u.d.D(g)
    }
    ,
    tt.preinit = function(g, p) {
        if (typeof g == "string" && p && typeof p.as == "string") {
            var b = p.as
              , v = m(b, p.crossOrigin)
              , S = typeof p.integrity == "string" ? p.integrity : void 0
              , x = typeof p.fetchPriority == "string" ? p.fetchPriority : void 0;
            b === "style" ? u.d.S(g, typeof p.precedence == "string" ? p.precedence : void 0, {
                crossOrigin: v,
                integrity: S,
                fetchPriority: x
            }) : b === "script" && u.d.X(g, {
                crossOrigin: v,
                integrity: S,
                fetchPriority: x,
                nonce: typeof p.nonce == "string" ? p.nonce : void 0
            })
        }
    }
    ,
    tt.preinitModule = function(g, p) {
        if (typeof g == "string")
            if (typeof p == "object" && p !== null) {
                if (p.as == null || p.as === "script") {
                    var b = m(p.as, p.crossOrigin);
                    u.d.M(g, {
                        crossOrigin: b,
                        integrity: typeof p.integrity == "string" ? p.integrity : void 0,
                        nonce: typeof p.nonce == "string" ? p.nonce : void 0
                    })
                }
            } else
                p == null && u.d.M(g)
    }
    ,
    tt.preload = function(g, p) {
        if (typeof g == "string" && typeof p == "object" && p !== null && typeof p.as == "string") {
            var b = p.as
              , v = m(b, p.crossOrigin);
            u.d.L(g, b, {
                crossOrigin: v,
                integrity: typeof p.integrity == "string" ? p.integrity : void 0,
                nonce: typeof p.nonce == "string" ? p.nonce : void 0,
                type: typeof p.type == "string" ? p.type : void 0,
                fetchPriority: typeof p.fetchPriority == "string" ? p.fetchPriority : void 0,
                referrerPolicy: typeof p.referrerPolicy == "string" ? p.referrerPolicy : void 0,
                imageSrcSet: typeof p.imageSrcSet == "string" ? p.imageSrcSet : void 0,
                imageSizes: typeof p.imageSizes == "string" ? p.imageSizes : void 0,
                media: typeof p.media == "string" ? p.media : void 0
            })
        }
    }
    ,
    tt.preloadModule = function(g, p) {
        if (typeof g == "string")
            if (p) {
                var b = m(p.as, p.crossOrigin);
                u.d.m(g, {
                    as: typeof p.as == "string" && p.as !== "script" ? p.as : void 0,
                    crossOrigin: b,
                    integrity: typeof p.integrity == "string" ? p.integrity : void 0
                })
            } else
                u.d.m(g)
    }
    ,
    tt.requestFormReset = function(g) {
        u.d.r(g)
    }
    ,
    tt.unstable_batchedUpdates = function(g, p) {
        return g(p)
    }
    ,
    tt.useFormState = function(g, p, b) {
        return d.H.useFormState(g, p, b)
    }
    ,
    tt.useFormStatus = function() {
        return d.H.useHostTransitionStatus()
    }
    ,
    tt.version = "19.2.4",
    tt
}
var tg;
function V1() {
    if (tg)
        return Ao.exports;
    tg = 1;
    function s() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)
            } catch (l) {
                console.error(l)
            }
    }
    return s(),
    Ao.exports = Y1(),
    Ao.exports
}
var ng;
function k1() {
    if (ng)
        return Ql;
    ng = 1;
    var s = G1()
      , l = Qo()
      , r = V1();
    function u(e) {
        var t = "https://react.dev/errors/" + e;
        if (1 < arguments.length) {
            t += "?args[]=" + encodeURIComponent(arguments[1]);
            for (var n = 2; n < arguments.length; n++)
                t += "&args[]=" + encodeURIComponent(arguments[n])
        }
        return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    }
    function c(e) {
        return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
    }
    function f(e) {
        var t = e
          , n = e;
        if (e.alternate)
            for (; t.return; )
                t = t.return;
        else {
            e = t;
            do
                t = e,
                (t.flags & 4098) !== 0 && (n = t.return),
                e = t.return;
            while (e)
        }
        return t.tag === 3 ? n : null
    }
    function d(e) {
        if (e.tag === 13) {
            var t = e.memoizedState;
            if (t === null && (e = e.alternate,
            e !== null && (t = e.memoizedState)),
            t !== null)
                return t.dehydrated
        }
        return null
    }
    function m(e) {
        if (e.tag === 31) {
            var t = e.memoizedState;
            if (t === null && (e = e.alternate,
            e !== null && (t = e.memoizedState)),
            t !== null)
                return t.dehydrated
        }
        return null
    }
    function g(e) {
        if (f(e) !== e)
            throw Error(u(188))
    }
    function p(e) {
        var t = e.alternate;
        if (!t) {
            if (t = f(e),
            t === null)
                throw Error(u(188));
            return t !== e ? null : e
        }
        for (var n = e, a = t; ; ) {
            var i = n.return;
            if (i === null)
                break;
            var o = i.alternate;
            if (o === null) {
                if (a = i.return,
                a !== null) {
                    n = a;
                    continue
                }
                break
            }
            if (i.child === o.child) {
                for (o = i.child; o; ) {
                    if (o === n)
                        return g(i),
                        e;
                    if (o === a)
                        return g(i),
                        t;
                    o = o.sibling
                }
                throw Error(u(188))
            }
            if (n.return !== a.return)
                n = i,
                a = o;
            else {
                for (var h = !1, y = i.child; y; ) {
                    if (y === n) {
                        h = !0,
                        n = i,
                        a = o;
                        break
                    }
                    if (y === a) {
                        h = !0,
                        a = i,
                        n = o;
                        break
                    }
                    y = y.sibling
                }
                if (!h) {
                    for (y = o.child; y; ) {
                        if (y === n) {
                            h = !0,
                            n = o,
                            a = i;
                            break
                        }
                        if (y === a) {
                            h = !0,
                            a = o,
                            n = i;
                            break
                        }
                        y = y.sibling
                    }
                    if (!h)
                        throw Error(u(189))
                }
            }
            if (n.alternate !== a)
                throw Error(u(190))
        }
        if (n.tag !== 3)
            throw Error(u(188));
        return n.stateNode.current === n ? e : t
    }
    function b(e) {
        var t = e.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6)
            return e;
        for (e = e.child; e !== null; ) {
            if (t = b(e),
            t !== null)
                return t;
            e = e.sibling
        }
        return null
    }
    var v = Object.assign
      , S = Symbol.for("react.element")
      , x = Symbol.for("react.transitional.element")
      , E = Symbol.for("react.portal")
      , O = Symbol.for("react.fragment")
      , C = Symbol.for("react.strict_mode")
      , M = Symbol.for("react.profiler")
      , G = Symbol.for("react.consumer")
      , V = Symbol.for("react.context")
      , K = Symbol.for("react.forward_ref")
      , W = Symbol.for("react.suspense")
      , ue = Symbol.for("react.suspense_list")
      , I = Symbol.for("react.memo")
      , ye = Symbol.for("react.lazy")
      , _e = Symbol.for("react.activity")
      , k = Symbol.for("react.memo_cache_sentinel")
      , X = Symbol.iterator;
    function Z(e) {
        return e === null || typeof e != "object" ? null : (e = X && e[X] || e["@@iterator"],
        typeof e == "function" ? e : null)
    }
    var ne = Symbol.for("react.client.reference");
    function oe(e) {
        if (e == null)
            return null;
        if (typeof e == "function")
            return e.$$typeof === ne ? null : e.displayName || e.name || null;
        if (typeof e == "string")
            return e;
        switch (e) {
        case O:
            return "Fragment";
        case M:
            return "Profiler";
        case C:
            return "StrictMode";
        case W:
            return "Suspense";
        case ue:
            return "SuspenseList";
        case _e:
            return "Activity"
        }
        if (typeof e == "object")
            switch (e.$$typeof) {
            case E:
                return "Portal";
            case V:
                return e.displayName || "Context";
            case G:
                return (e._context.displayName || "Context") + ".Consumer";
            case K:
                var t = e.render;
                return e = e.displayName,
                e || (e = t.displayName || t.name || "",
                e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"),
                e;
            case I:
                return t = e.displayName || null,
                t !== null ? t : oe(e.type) || "Memo";
            case ye:
                t = e._payload,
                e = e._init;
                try {
                    return oe(e(t))
                } catch {}
            }
        return null
    }
    var fe = Array.isArray
      , U = l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
      , Q = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
      , te = {
        pending: !1,
        data: null,
        method: null,
        action: null
    }
      , be = []
      , we = -1;
    function A(e) {
        return {
            current: e
        }
    }
    function H(e) {
        0 > we || (e.current = be[we],
        be[we] = null,
        we--)
    }
    function F(e, t) {
        we++,
        be[we] = e.current,
        e.current = t
    }
    var J = A(null)
      , se = A(null)
      , de = A(null)
      , Ce = A(null);
    function nt(e, t) {
        switch (F(de, t),
        F(se, e),
        F(J, null),
        t.nodeType) {
        case 9:
        case 11:
            e = (e = t.documentElement) && (e = e.namespaceURI) ? Eh(e) : 0;
            break;
        default:
            if (e = t.tagName,
            t = t.namespaceURI)
                t = Eh(t),
                e = wh(t, e);
            else
                switch (e) {
                case "svg":
                    e = 1;
                    break;
                case "math":
                    e = 2;
                    break;
                default:
                    e = 0
                }
        }
        H(J),
        F(J, e)
    }
    function Be() {
        H(J),
        H(se),
        H(de)
    }
    function Za(e) {
        e.memoizedState !== null && F(Ce, e);
        var t = J.current
          , n = wh(t, e.type);
        t !== n && (F(se, e),
        F(J, n))
    }
    function ni(e) {
        se.current === e && (H(J),
        H(se)),
        Ce.current === e && (H(Ce),
        Ul._currentValue = te)
    }
    var qs, Wo;
    function Bn(e) {
        if (qs === void 0)
            try {
                throw Error()
            } catch (n) {
                var t = n.stack.trim().match(/\n( *(at )?)/);
                qs = t && t[1] || "",
                Wo = -1 < n.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < n.stack.indexOf("@") ? "@unknown:0:0" : ""
            }
        return `
` + qs + e + Wo
    }
    var Gs = !1;
    function Ys(e, t) {
        if (!e || Gs)
            return "";
        Gs = !0;
        var n = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            var a = {
                DetermineComponentFrameRoot: function() {
                    try {
                        if (t) {
                            var Y = function() {
                                throw Error()
                            };
                            if (Object.defineProperty(Y.prototype, "props", {
                                set: function() {
                                    throw Error()
                                }
                            }),
                            typeof Reflect == "object" && Reflect.construct) {
                                try {
                                    Reflect.construct(Y, [])
                                } catch (D) {
                                    var L = D
                                }
                                Reflect.construct(e, [], Y)
                            } else {
                                try {
                                    Y.call()
                                } catch (D) {
                                    L = D
                                }
                                e.call(Y.prototype)
                            }
                        } else {
                            try {
                                throw Error()
                            } catch (D) {
                                L = D
                            }
                            (Y = e()) && typeof Y.catch == "function" && Y.catch(function() {})
                        }
                    } catch (D) {
                        if (D && L && typeof D.stack == "string")
                            return [D.stack, L.stack]
                    }
                    return [null, null]
                }
            };
            a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var i = Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot, "name");
            i && i.configurable && Object.defineProperty(a.DetermineComponentFrameRoot, "name", {
                value: "DetermineComponentFrameRoot"
            });
            var o = a.DetermineComponentFrameRoot()
              , h = o[0]
              , y = o[1];
            if (h && y) {
                var _ = h.split(`
`)
                  , z = y.split(`
`);
                for (i = a = 0; a < _.length && !_[a].includes("DetermineComponentFrameRoot"); )
                    a++;
                for (; i < z.length && !z[i].includes("DetermineComponentFrameRoot"); )
                    i++;
                if (a === _.length || i === z.length)
                    for (a = _.length - 1,
                    i = z.length - 1; 1 <= a && 0 <= i && _[a] !== z[i]; )
                        i--;
                for (; 1 <= a && 0 <= i; a--,
                i--)
                    if (_[a] !== z[i]) {
                        if (a !== 1 || i !== 1)
                            do
                                if (a--,
                                i--,
                                0 > i || _[a] !== z[i]) {
                                    var B = `
` + _[a].replace(" at new ", " at ");
                                    return e.displayName && B.includes("<anonymous>") && (B = B.replace("<anonymous>", e.displayName)),
                                    B
                                }
                            while (1 <= a && 0 <= i);
                        break
                    }
            }
        } finally {
            Gs = !1,
            Error.prepareStackTrace = n
        }
        return (n = e ? e.displayName || e.name : "") ? Bn(n) : ""
    }
    function hp(e, t) {
        switch (e.tag) {
        case 26:
        case 27:
        case 5:
            return Bn(e.type);
        case 16:
            return Bn("Lazy");
        case 13:
            return e.child !== t && t !== null ? Bn("Suspense Fallback") : Bn("Suspense");
        case 19:
            return Bn("SuspenseList");
        case 0:
        case 15:
            return Ys(e.type, !1);
        case 11:
            return Ys(e.type.render, !1);
        case 1:
            return Ys(e.type, !0);
        case 31:
            return Bn("Activity");
        default:
            return ""
        }
    }
    function Io(e) {
        try {
            var t = ""
              , n = null;
            do
                t += hp(e, n),
                n = e,
                e = e.return;
            while (e);
            return t
        } catch (a) {
            return `
Error generating stack: ` + a.message + `
` + a.stack
        }
    }
    var Vs = Object.prototype.hasOwnProperty
      , ks = s.unstable_scheduleCallback
      , Qs = s.unstable_cancelCallback
      , mp = s.unstable_shouldYield
      , gp = s.unstable_requestPaint
      , ft = s.unstable_now
      , pp = s.unstable_getCurrentPriorityLevel
      , Po = s.unstable_ImmediatePriority
      , ec = s.unstable_UserBlockingPriority
      , ai = s.unstable_NormalPriority
      , yp = s.unstable_LowPriority
      , tc = s.unstable_IdlePriority
      , vp = s.log
      , bp = s.unstable_setDisableYieldValue
      , Ka = null
      , dt = null;
    function dn(e) {
        if (typeof vp == "function" && bp(e),
        dt && typeof dt.setStrictMode == "function")
            try {
                dt.setStrictMode(Ka, e)
            } catch {}
    }
    var ht = Math.clz32 ? Math.clz32 : Ep
      , xp = Math.log
      , Sp = Math.LN2;
    function Ep(e) {
        return e >>>= 0,
        e === 0 ? 32 : 31 - (xp(e) / Sp | 0) | 0
    }
    var li = 256
      , ii = 262144
      , si = 4194304;
    function Hn(e) {
        var t = e & 42;
        if (t !== 0)
            return t;
        switch (e & -e) {
        case 1:
            return 1;
        case 2:
            return 2;
        case 4:
            return 4;
        case 8:
            return 8;
        case 16:
            return 16;
        case 32:
            return 32;
        case 64:
            return 64;
        case 128:
            return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
            return e & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            return e & 62914560;
        case 67108864:
            return 67108864;
        case 134217728:
            return 134217728;
        case 268435456:
            return 268435456;
        case 536870912:
            return 536870912;
        case 1073741824:
            return 0;
        default:
            return e
        }
    }
    function ri(e, t, n) {
        var a = e.pendingLanes;
        if (a === 0)
            return 0;
        var i = 0
          , o = e.suspendedLanes
          , h = e.pingedLanes;
        e = e.warmLanes;
        var y = a & 134217727;
        return y !== 0 ? (a = y & ~o,
        a !== 0 ? i = Hn(a) : (h &= y,
        h !== 0 ? i = Hn(h) : n || (n = y & ~e,
        n !== 0 && (i = Hn(n))))) : (y = a & ~o,
        y !== 0 ? i = Hn(y) : h !== 0 ? i = Hn(h) : n || (n = a & ~e,
        n !== 0 && (i = Hn(n)))),
        i === 0 ? 0 : t !== 0 && t !== i && (t & o) === 0 && (o = i & -i,
        n = t & -t,
        o >= n || o === 32 && (n & 4194048) !== 0) ? t : i
    }
    function Ja(e, t) {
        return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0
    }
    function wp(e, t) {
        switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
            return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
            return -1;
        default:
            return -1
        }
    }
    function nc() {
        var e = si;
        return si <<= 1,
        (si & 62914560) === 0 && (si = 4194304),
        e
    }
    function Xs(e) {
        for (var t = [], n = 0; 31 > n; n++)
            t.push(e);
        return t
    }
    function $a(e, t) {
        e.pendingLanes |= t,
        t !== 268435456 && (e.suspendedLanes = 0,
        e.pingedLanes = 0,
        e.warmLanes = 0)
    }
    function Cp(e, t, n, a, i, o) {
        var h = e.pendingLanes;
        e.pendingLanes = n,
        e.suspendedLanes = 0,
        e.pingedLanes = 0,
        e.warmLanes = 0,
        e.expiredLanes &= n,
        e.entangledLanes &= n,
        e.errorRecoveryDisabledLanes &= n,
        e.shellSuspendCounter = 0;
        var y = e.entanglements
          , _ = e.expirationTimes
          , z = e.hiddenUpdates;
        for (n = h & ~n; 0 < n; ) {
            var B = 31 - ht(n)
              , Y = 1 << B;
            y[B] = 0,
            _[B] = -1;
            var L = z[B];
            if (L !== null)
                for (z[B] = null,
                B = 0; B < L.length; B++) {
                    var D = L[B];
                    D !== null && (D.lane &= -536870913)
                }
            n &= ~Y
        }
        a !== 0 && ac(e, a, 0),
        o !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= o & ~(h & ~t))
    }
    function ac(e, t, n) {
        e.pendingLanes |= t,
        e.suspendedLanes &= ~t;
        var a = 31 - ht(t);
        e.entangledLanes |= t,
        e.entanglements[a] = e.entanglements[a] | 1073741824 | n & 261930
    }
    function lc(e, t) {
        var n = e.entangledLanes |= t;
        for (e = e.entanglements; n; ) {
            var a = 31 - ht(n)
              , i = 1 << a;
            i & t | e[a] & t && (e[a] |= t),
            n &= ~i
        }
    }
    function ic(e, t) {
        var n = t & -t;
        return n = (n & 42) !== 0 ? 1 : Fs(n),
        (n & (e.suspendedLanes | t)) !== 0 ? 0 : n
    }
    function Fs(e) {
        switch (e) {
        case 2:
            e = 1;
            break;
        case 8:
            e = 4;
            break;
        case 32:
            e = 16;
            break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            e = 128;
            break;
        case 268435456:
            e = 134217728;
            break;
        default:
            e = 0
        }
        return e
    }
    function Zs(e) {
        return e &= -e,
        2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2
    }
    function sc() {
        var e = Q.p;
        return e !== 0 ? e : (e = window.event,
        e === void 0 ? 32 : Fh(e.type))
    }
    function rc(e, t) {
        var n = Q.p;
        try {
            return Q.p = e,
            t()
        } finally {
            Q.p = n
        }
    }
    var hn = Math.random().toString(36).slice(2)
      , Je = "__reactFiber$" + hn
      , lt = "__reactProps$" + hn
      , na = "__reactContainer$" + hn
      , Ks = "__reactEvents$" + hn
      , _p = "__reactListeners$" + hn
      , Ap = "__reactHandles$" + hn
      , uc = "__reactResources$" + hn
      , Wa = "__reactMarker$" + hn;
    function Js(e) {
        delete e[Je],
        delete e[lt],
        delete e[Ks],
        delete e[_p],
        delete e[Ap]
    }
    function aa(e) {
        var t = e[Je];
        if (t)
            return t;
        for (var n = e.parentNode; n; ) {
            if (t = n[na] || n[Je]) {
                if (n = t.alternate,
                t.child !== null || n !== null && n.child !== null)
                    for (e = Nh(e); e !== null; ) {
                        if (n = e[Je])
                            return n;
                        e = Nh(e)
                    }
                return t
            }
            e = n,
            n = e.parentNode
        }
        return null
    }
    function la(e) {
        if (e = e[Je] || e[na]) {
            var t = e.tag;
            if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
                return e
        }
        return null
    }
    function Ia(e) {
        var t = e.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6)
            return e.stateNode;
        throw Error(u(33))
    }
    function ia(e) {
        var t = e[uc];
        return t || (t = e[uc] = {
            hoistableStyles: new Map,
            hoistableScripts: new Map
        }),
        t
    }
    function Fe(e) {
        e[Wa] = !0
    }
    var oc = new Set
      , cc = {};
    function qn(e, t) {
        sa(e, t),
        sa(e + "Capture", t)
    }
    function sa(e, t) {
        for (cc[e] = t,
        e = 0; e < t.length; e++)
            oc.add(t[e])
    }
    var Tp = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$")
      , fc = {}
      , dc = {};
    function Op(e) {
        return Vs.call(dc, e) ? !0 : Vs.call(fc, e) ? !1 : Tp.test(e) ? dc[e] = !0 : (fc[e] = !0,
        !1)
    }
    function ui(e, t, n) {
        if (Op(t))
            if (n === null)
                e.removeAttribute(t);
            else {
                switch (typeof n) {
                case "undefined":
                case "function":
                case "symbol":
                    e.removeAttribute(t);
                    return;
                case "boolean":
                    var a = t.toLowerCase().slice(0, 5);
                    if (a !== "data-" && a !== "aria-") {
                        e.removeAttribute(t);
                        return
                    }
                }
                e.setAttribute(t, "" + n)
            }
    }
    function oi(e, t, n) {
        if (n === null)
            e.removeAttribute(t);
        else {
            switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(t);
                return
            }
            e.setAttribute(t, "" + n)
        }
    }
    function Qt(e, t, n, a) {
        if (a === null)
            e.removeAttribute(n);
        else {
            switch (typeof a) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(n);
                return
            }
            e.setAttributeNS(t, n, "" + a)
        }
    }
    function St(e) {
        switch (typeof e) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
            return e;
        case "object":
            return e;
        default:
            return ""
        }
    }
    function hc(e) {
        var t = e.type;
        return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio")
    }
    function Rp(e, t, n) {
        var a = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
        if (!e.hasOwnProperty(t) && typeof a < "u" && typeof a.get == "function" && typeof a.set == "function") {
            var i = a.get
              , o = a.set;
            return Object.defineProperty(e, t, {
                configurable: !0,
                get: function() {
                    return i.call(this)
                },
                set: function(h) {
                    n = "" + h,
                    o.call(this, h)
                }
            }),
            Object.defineProperty(e, t, {
                enumerable: a.enumerable
            }),
            {
                getValue: function() {
                    return n
                },
                setValue: function(h) {
                    n = "" + h
                },
                stopTracking: function() {
                    e._valueTracker = null,
                    delete e[t]
                }
            }
        }
    }
    function $s(e) {
        if (!e._valueTracker) {
            var t = hc(e) ? "checked" : "value";
            e._valueTracker = Rp(e, t, "" + e[t])
        }
    }
    function mc(e) {
        if (!e)
            return !1;
        var t = e._valueTracker;
        if (!t)
            return !0;
        var n = t.getValue()
          , a = "";
        return e && (a = hc(e) ? e.checked ? "true" : "false" : e.value),
        e = a,
        e !== n ? (t.setValue(e),
        !0) : !1
    }
    function ci(e) {
        if (e = e || (typeof document < "u" ? document : void 0),
        typeof e > "u")
            return null;
        try {
            return e.activeElement || e.body
        } catch {
            return e.body
        }
    }
    var Np = /[\n"\\]/g;
    function Et(e) {
        return e.replace(Np, function(t) {
            return "\\" + t.charCodeAt(0).toString(16) + " "
        })
    }
    function Ws(e, t, n, a, i, o, h, y) {
        e.name = "",
        h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" ? e.type = h : e.removeAttribute("type"),
        t != null ? h === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + St(t)) : e.value !== "" + St(t) && (e.value = "" + St(t)) : h !== "submit" && h !== "reset" || e.removeAttribute("value"),
        t != null ? Is(e, h, St(t)) : n != null ? Is(e, h, St(n)) : a != null && e.removeAttribute("value"),
        i == null && o != null && (e.defaultChecked = !!o),
        i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"),
        y != null && typeof y != "function" && typeof y != "symbol" && typeof y != "boolean" ? e.name = "" + St(y) : e.removeAttribute("name")
    }
    function gc(e, t, n, a, i, o, h, y) {
        if (o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.type = o),
        t != null || n != null) {
            if (!(o !== "submit" && o !== "reset" || t != null)) {
                $s(e);
                return
            }
            n = n != null ? "" + St(n) : "",
            t = t != null ? "" + St(t) : n,
            y || t === e.value || (e.value = t),
            e.defaultValue = t
        }
        a = a ?? i,
        a = typeof a != "function" && typeof a != "symbol" && !!a,
        e.checked = y ? e.checked : !!a,
        e.defaultChecked = !!a,
        h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" && (e.name = h),
        $s(e)
    }
    function Is(e, t, n) {
        t === "number" && ci(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n)
    }
    function ra(e, t, n, a) {
        if (e = e.options,
        t) {
            t = {};
            for (var i = 0; i < n.length; i++)
                t["$" + n[i]] = !0;
            for (n = 0; n < e.length; n++)
                i = t.hasOwnProperty("$" + e[n].value),
                e[n].selected !== i && (e[n].selected = i),
                i && a && (e[n].defaultSelected = !0)
        } else {
            for (n = "" + St(n),
            t = null,
            i = 0; i < e.length; i++) {
                if (e[i].value === n) {
                    e[i].selected = !0,
                    a && (e[i].defaultSelected = !0);
                    return
                }
                t !== null || e[i].disabled || (t = e[i])
            }
            t !== null && (t.selected = !0)
        }
    }
    function pc(e, t, n) {
        if (t != null && (t = "" + St(t),
        t !== e.value && (e.value = t),
        n == null)) {
            e.defaultValue !== t && (e.defaultValue = t);
            return
        }
        e.defaultValue = n != null ? "" + St(n) : ""
    }
    function yc(e, t, n, a) {
        if (t == null) {
            if (a != null) {
                if (n != null)
                    throw Error(u(92));
                if (fe(a)) {
                    if (1 < a.length)
                        throw Error(u(93));
                    a = a[0]
                }
                n = a
            }
            n == null && (n = ""),
            t = n
        }
        n = St(t),
        e.defaultValue = n,
        a = e.textContent,
        a === n && a !== "" && a !== null && (e.value = a),
        $s(e)
    }
    function ua(e, t) {
        if (t) {
            var n = e.firstChild;
            if (n && n === e.lastChild && n.nodeType === 3) {
                n.nodeValue = t;
                return
            }
        }
        e.textContent = t
    }
    var zp = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
    function vc(e, t, n) {
        var a = t.indexOf("--") === 0;
        n == null || typeof n == "boolean" || n === "" ? a ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : a ? e.setProperty(t, n) : typeof n != "number" || n === 0 || zp.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px"
    }
    function bc(e, t, n) {
        if (t != null && typeof t != "object")
            throw Error(u(62));
        if (e = e.style,
        n != null) {
            for (var a in n)
                !n.hasOwnProperty(a) || t != null && t.hasOwnProperty(a) || (a.indexOf("--") === 0 ? e.setProperty(a, "") : a === "float" ? e.cssFloat = "" : e[a] = "");
            for (var i in t)
                a = t[i],
                t.hasOwnProperty(i) && n[i] !== a && vc(e, i, a)
        } else
            for (var o in t)
                t.hasOwnProperty(o) && vc(e, o, t[o])
    }
    function Ps(e) {
        if (e.indexOf("-") === -1)
            return !1;
        switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
            return !1;
        default:
            return !0
        }
    }
    var Lp = new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]])
      , Mp = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function fi(e) {
        return Mp.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e
    }
    function Xt() {}
    var er = null;
    function tr(e) {
        return e = e.target || e.srcElement || window,
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
    }
    var oa = null
      , ca = null;
    function xc(e) {
        var t = la(e);
        if (t && (e = t.stateNode)) {
            var n = e[lt] || null;
            e: switch (e = t.stateNode,
            t.type) {
            case "input":
                if (Ws(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name),
                t = n.name,
                n.type === "radio" && t != null) {
                    for (n = e; n.parentNode; )
                        n = n.parentNode;
                    for (n = n.querySelectorAll('input[name="' + Et("" + t) + '"][type="radio"]'),
                    t = 0; t < n.length; t++) {
                        var a = n[t];
                        if (a !== e && a.form === e.form) {
                            var i = a[lt] || null;
                            if (!i)
                                throw Error(u(90));
                            Ws(a, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name)
                        }
                    }
                    for (t = 0; t < n.length; t++)
                        a = n[t],
                        a.form === e.form && mc(a)
                }
                break e;
            case "textarea":
                pc(e, n.value, n.defaultValue);
                break e;
            case "select":
                t = n.value,
                t != null && ra(e, !!n.multiple, t, !1)
            }
        }
    }
    var nr = !1;
    function Sc(e, t, n) {
        if (nr)
            return e(t, n);
        nr = !0;
        try {
            var a = e(t);
            return a
        } finally {
            if (nr = !1,
            (oa !== null || ca !== null) && (Ii(),
            oa && (t = oa,
            e = ca,
            ca = oa = null,
            xc(t),
            e)))
                for (t = 0; t < e.length; t++)
                    xc(e[t])
        }
    }
    function Pa(e, t) {
        var n = e.stateNode;
        if (n === null)
            return null;
        var a = n[lt] || null;
        if (a === null)
            return null;
        n = a[t];
        e: switch (t) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
            (a = !a.disabled) || (e = e.type,
            a = !(e === "button" || e === "input" || e === "select" || e === "textarea")),
            e = !a;
            break e;
        default:
            e = !1
        }
        if (e)
            return null;
        if (n && typeof n != "function")
            throw Error(u(231, t, typeof n));
        return n
    }
    var Ft = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u")
      , ar = !1;
    if (Ft)
        try {
            var el = {};
            Object.defineProperty(el, "passive", {
                get: function() {
                    ar = !0
                }
            }),
            window.addEventListener("test", el, el),
            window.removeEventListener("test", el, el)
        } catch {
            ar = !1
        }
    var mn = null
      , lr = null
      , di = null;
    function Ec() {
        if (di)
            return di;
        var e, t = lr, n = t.length, a, i = "value"in mn ? mn.value : mn.textContent, o = i.length;
        for (e = 0; e < n && t[e] === i[e]; e++)
            ;
        var h = n - e;
        for (a = 1; a <= h && t[n - a] === i[o - a]; a++)
            ;
        return di = i.slice(e, 1 < a ? 1 - a : void 0)
    }
    function hi(e) {
        var t = e.keyCode;
        return "charCode"in e ? (e = e.charCode,
        e === 0 && t === 13 && (e = 13)) : e = t,
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
    }
    function mi() {
        return !0
    }
    function wc() {
        return !1
    }
    function it(e) {
        function t(n, a, i, o, h) {
            this._reactName = n,
            this._targetInst = i,
            this.type = a,
            this.nativeEvent = o,
            this.target = h,
            this.currentTarget = null;
            for (var y in e)
                e.hasOwnProperty(y) && (n = e[y],
                this[y] = n ? n(o) : o[y]);
            return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? mi : wc,
            this.isPropagationStopped = wc,
            this
        }
        return v(t.prototype, {
            preventDefault: function() {
                this.defaultPrevented = !0;
                var n = this.nativeEvent;
                n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1),
                this.isDefaultPrevented = mi)
            },
            stopPropagation: function() {
                var n = this.nativeEvent;
                n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
                this.isPropagationStopped = mi)
            },
            persist: function() {},
            isPersistent: mi
        }),
        t
    }
    var Gn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function(e) {
            return e.timeStamp || Date.now()
        },
        defaultPrevented: 0,
        isTrusted: 0
    }, gi = it(Gn), tl = v({}, Gn, {
        view: 0,
        detail: 0
    }), Dp = it(tl), ir, sr, nl, pi = v({}, tl, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: ur,
        button: 0,
        buttons: 0,
        relatedTarget: function(e) {
            return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget
        },
        movementX: function(e) {
            return "movementX"in e ? e.movementX : (e !== nl && (nl && e.type === "mousemove" ? (ir = e.screenX - nl.screenX,
            sr = e.screenY - nl.screenY) : sr = ir = 0,
            nl = e),
            ir)
        },
        movementY: function(e) {
            return "movementY"in e ? e.movementY : sr
        }
    }), Cc = it(pi), jp = v({}, pi, {
        dataTransfer: 0
    }), Up = it(jp), Bp = v({}, tl, {
        relatedTarget: 0
    }), rr = it(Bp), Hp = v({}, Gn, {
        animationName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    }), qp = it(Hp), Gp = v({}, Gn, {
        clipboardData: function(e) {
            return "clipboardData"in e ? e.clipboardData : window.clipboardData
        }
    }), Yp = it(Gp), Vp = v({}, Gn, {
        data: 0
    }), _c = it(Vp), kp = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
    }, Qp = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
    }, Xp = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey"
    };
    function Fp(e) {
        var t = this.nativeEvent;
        return t.getModifierState ? t.getModifierState(e) : (e = Xp[e]) ? !!t[e] : !1
    }
    function ur() {
        return Fp
    }
    var Zp = v({}, tl, {
        key: function(e) {
            if (e.key) {
                var t = kp[e.key] || e.key;
                if (t !== "Unidentified")
                    return t
            }
            return e.type === "keypress" ? (e = hi(e),
            e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Qp[e.keyCode] || "Unidentified" : ""
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: ur,
        charCode: function(e) {
            return e.type === "keypress" ? hi(e) : 0
        },
        keyCode: function(e) {
            return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
        },
        which: function(e) {
            return e.type === "keypress" ? hi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
        }
    })
      , Kp = it(Zp)
      , Jp = v({}, pi, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0
    })
      , Ac = it(Jp)
      , $p = v({}, tl, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: ur
    })
      , Wp = it($p)
      , Ip = v({}, Gn, {
        propertyName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    })
      , Pp = it(Ip)
      , ey = v({}, pi, {
        deltaX: function(e) {
            return "deltaX"in e ? e.deltaX : "wheelDeltaX"in e ? -e.wheelDeltaX : 0
        },
        deltaY: function(e) {
            return "deltaY"in e ? e.deltaY : "wheelDeltaY"in e ? -e.wheelDeltaY : "wheelDelta"in e ? -e.wheelDelta : 0
        },
        deltaZ: 0,
        deltaMode: 0
    })
      , ty = it(ey)
      , ny = v({}, Gn, {
        newState: 0,
        oldState: 0
    })
      , ay = it(ny)
      , ly = [9, 13, 27, 32]
      , or = Ft && "CompositionEvent"in window
      , al = null;
    Ft && "documentMode"in document && (al = document.documentMode);
    var iy = Ft && "TextEvent"in window && !al
      , Tc = Ft && (!or || al && 8 < al && 11 >= al)
      , Oc = " "
      , Rc = !1;
    function Nc(e, t) {
        switch (e) {
        case "keyup":
            return ly.indexOf(t.keyCode) !== -1;
        case "keydown":
            return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
            return !0;
        default:
            return !1
        }
    }
    function zc(e) {
        return e = e.detail,
        typeof e == "object" && "data"in e ? e.data : null
    }
    var fa = !1;
    function sy(e, t) {
        switch (e) {
        case "compositionend":
            return zc(t);
        case "keypress":
            return t.which !== 32 ? null : (Rc = !0,
            Oc);
        case "textInput":
            return e = t.data,
            e === Oc && Rc ? null : e;
        default:
            return null
        }
    }
    function ry(e, t) {
        if (fa)
            return e === "compositionend" || !or && Nc(e, t) ? (e = Ec(),
            di = lr = mn = null,
            fa = !1,
            e) : null;
        switch (e) {
        case "paste":
            return null;
        case "keypress":
            if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                if (t.char && 1 < t.char.length)
                    return t.char;
                if (t.which)
                    return String.fromCharCode(t.which)
            }
            return null;
        case "compositionend":
            return Tc && t.locale !== "ko" ? null : t.data;
        default:
            return null
        }
    }
    var uy = {
        color: !0,
        date: !0,
        datetime: !0,
        "datetime-local": !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0
    };
    function Lc(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return t === "input" ? !!uy[e.type] : t === "textarea"
    }
    function Mc(e, t, n, a) {
        oa ? ca ? ca.push(a) : ca = [a] : oa = a,
        t = is(t, "onChange"),
        0 < t.length && (n = new gi("onChange","change",null,n,a),
        e.push({
            event: n,
            listeners: t
        }))
    }
    var ll = null
      , il = null;
    function oy(e) {
        ph(e, 0)
    }
    function yi(e) {
        var t = Ia(e);
        if (mc(t))
            return e
    }
    function Dc(e, t) {
        if (e === "change")
            return t
    }
    var jc = !1;
    if (Ft) {
        var cr;
        if (Ft) {
            var fr = "oninput"in document;
            if (!fr) {
                var Uc = document.createElement("div");
                Uc.setAttribute("oninput", "return;"),
                fr = typeof Uc.oninput == "function"
            }
            cr = fr
        } else
            cr = !1;
        jc = cr && (!document.documentMode || 9 < document.documentMode)
    }
    function Bc() {
        ll && (ll.detachEvent("onpropertychange", Hc),
        il = ll = null)
    }
    function Hc(e) {
        if (e.propertyName === "value" && yi(il)) {
            var t = [];
            Mc(t, il, e, tr(e)),
            Sc(oy, t)
        }
    }
    function cy(e, t, n) {
        e === "focusin" ? (Bc(),
        ll = t,
        il = n,
        ll.attachEvent("onpropertychange", Hc)) : e === "focusout" && Bc()
    }
    function fy(e) {
        if (e === "selectionchange" || e === "keyup" || e === "keydown")
            return yi(il)
    }
    function dy(e, t) {
        if (e === "click")
            return yi(t)
    }
    function hy(e, t) {
        if (e === "input" || e === "change")
            return yi(t)
    }
    function my(e, t) {
        return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t
    }
    var mt = typeof Object.is == "function" ? Object.is : my;
    function sl(e, t) {
        if (mt(e, t))
            return !0;
        if (typeof e != "object" || e === null || typeof t != "object" || t === null)
            return !1;
        var n = Object.keys(e)
          , a = Object.keys(t);
        if (n.length !== a.length)
            return !1;
        for (a = 0; a < n.length; a++) {
            var i = n[a];
            if (!Vs.call(t, i) || !mt(e[i], t[i]))
                return !1
        }
        return !0
    }
    function qc(e) {
        for (; e && e.firstChild; )
            e = e.firstChild;
        return e
    }
    function Gc(e, t) {
        var n = qc(e);
        e = 0;
        for (var a; n; ) {
            if (n.nodeType === 3) {
                if (a = e + n.textContent.length,
                e <= t && a >= t)
                    return {
                        node: n,
                        offset: t - e
                    };
                e = a
            }
            e: {
                for (; n; ) {
                    if (n.nextSibling) {
                        n = n.nextSibling;
                        break e
                    }
                    n = n.parentNode
                }
                n = void 0
            }
            n = qc(n)
        }
    }
    function Yc(e, t) {
        return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Yc(e, t.parentNode) : "contains"in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1
    }
    function Vc(e) {
        e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
        for (var t = ci(e.document); t instanceof e.HTMLIFrameElement; ) {
            try {
                var n = typeof t.contentWindow.location.href == "string"
            } catch {
                n = !1
            }
            if (n)
                e = t.contentWindow;
            else
                break;
            t = ci(e.document)
        }
        return t
    }
    function dr(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true")
    }
    var gy = Ft && "documentMode"in document && 11 >= document.documentMode
      , da = null
      , hr = null
      , rl = null
      , mr = !1;
    function kc(e, t, n) {
        var a = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
        mr || da == null || da !== ci(a) || (a = da,
        "selectionStart"in a && dr(a) ? a = {
            start: a.selectionStart,
            end: a.selectionEnd
        } : (a = (a.ownerDocument && a.ownerDocument.defaultView || window).getSelection(),
        a = {
            anchorNode: a.anchorNode,
            anchorOffset: a.anchorOffset,
            focusNode: a.focusNode,
            focusOffset: a.focusOffset
        }),
        rl && sl(rl, a) || (rl = a,
        a = is(hr, "onSelect"),
        0 < a.length && (t = new gi("onSelect","select",null,t,n),
        e.push({
            event: t,
            listeners: a
        }),
        t.target = da)))
    }
    function Yn(e, t) {
        var n = {};
        return n[e.toLowerCase()] = t.toLowerCase(),
        n["Webkit" + e] = "webkit" + t,
        n["Moz" + e] = "moz" + t,
        n
    }
    var ha = {
        animationend: Yn("Animation", "AnimationEnd"),
        animationiteration: Yn("Animation", "AnimationIteration"),
        animationstart: Yn("Animation", "AnimationStart"),
        transitionrun: Yn("Transition", "TransitionRun"),
        transitionstart: Yn("Transition", "TransitionStart"),
        transitioncancel: Yn("Transition", "TransitionCancel"),
        transitionend: Yn("Transition", "TransitionEnd")
    }
      , gr = {}
      , Qc = {};
    Ft && (Qc = document.createElement("div").style,
    "AnimationEvent"in window || (delete ha.animationend.animation,
    delete ha.animationiteration.animation,
    delete ha.animationstart.animation),
    "TransitionEvent"in window || delete ha.transitionend.transition);
    function Vn(e) {
        if (gr[e])
            return gr[e];
        if (!ha[e])
            return e;
        var t = ha[e], n;
        for (n in t)
            if (t.hasOwnProperty(n) && n in Qc)
                return gr[e] = t[n];
        return e
    }
    var Xc = Vn("animationend")
      , Fc = Vn("animationiteration")
      , Zc = Vn("animationstart")
      , py = Vn("transitionrun")
      , yy = Vn("transitionstart")
      , vy = Vn("transitioncancel")
      , Kc = Vn("transitionend")
      , Jc = new Map
      , pr = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    pr.push("scrollEnd");
    function Lt(e, t) {
        Jc.set(e, t),
        qn(t, [e])
    }
    var vi = typeof reportError == "function" ? reportError : function(e) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
            var t = new window.ErrorEvent("error",{
                bubbles: !0,
                cancelable: !0,
                message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
                error: e
            });
            if (!window.dispatchEvent(t))
                return
        } else if (typeof process == "object" && typeof process.emit == "function") {
            process.emit("uncaughtException", e);
            return
        }
        console.error(e)
    }
      , wt = []
      , ma = 0
      , yr = 0;
    function bi() {
        for (var e = ma, t = yr = ma = 0; t < e; ) {
            var n = wt[t];
            wt[t++] = null;
            var a = wt[t];
            wt[t++] = null;
            var i = wt[t];
            wt[t++] = null;
            var o = wt[t];
            if (wt[t++] = null,
            a !== null && i !== null) {
                var h = a.pending;
                h === null ? i.next = i : (i.next = h.next,
                h.next = i),
                a.pending = i
            }
            o !== 0 && $c(n, i, o)
        }
    }
    function xi(e, t, n, a) {
        wt[ma++] = e,
        wt[ma++] = t,
        wt[ma++] = n,
        wt[ma++] = a,
        yr |= a,
        e.lanes |= a,
        e = e.alternate,
        e !== null && (e.lanes |= a)
    }
    function vr(e, t, n, a) {
        return xi(e, t, n, a),
        Si(e)
    }
    function kn(e, t) {
        return xi(e, null, null, t),
        Si(e)
    }
    function $c(e, t, n) {
        e.lanes |= n;
        var a = e.alternate;
        a !== null && (a.lanes |= n);
        for (var i = !1, o = e.return; o !== null; )
            o.childLanes |= n,
            a = o.alternate,
            a !== null && (a.childLanes |= n),
            o.tag === 22 && (e = o.stateNode,
            e === null || e._visibility & 1 || (i = !0)),
            e = o,
            o = o.return;
        return e.tag === 3 ? (o = e.stateNode,
        i && t !== null && (i = 31 - ht(n),
        e = o.hiddenUpdates,
        a = e[i],
        a === null ? e[i] = [t] : a.push(t),
        t.lane = n | 536870912),
        o) : null
    }
    function Si(e) {
        if (50 < Rl)
            throw Rl = 0,
            Tu = null,
            Error(u(185));
        for (var t = e.return; t !== null; )
            e = t,
            t = e.return;
        return e.tag === 3 ? e.stateNode : null
    }
    var ga = {};
    function by(e, t, n, a) {
        this.tag = e,
        this.key = n,
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null,
        this.index = 0,
        this.refCleanup = this.ref = null,
        this.pendingProps = t,
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null,
        this.mode = a,
        this.subtreeFlags = this.flags = 0,
        this.deletions = null,
        this.childLanes = this.lanes = 0,
        this.alternate = null
    }
    function gt(e, t, n, a) {
        return new by(e,t,n,a)
    }
    function br(e) {
        return e = e.prototype,
        !(!e || !e.isReactComponent)
    }
    function Zt(e, t) {
        var n = e.alternate;
        return n === null ? (n = gt(e.tag, t, e.key, e.mode),
        n.elementType = e.elementType,
        n.type = e.type,
        n.stateNode = e.stateNode,
        n.alternate = e,
        e.alternate = n) : (n.pendingProps = t,
        n.type = e.type,
        n.flags = 0,
        n.subtreeFlags = 0,
        n.deletions = null),
        n.flags = e.flags & 65011712,
        n.childLanes = e.childLanes,
        n.lanes = e.lanes,
        n.child = e.child,
        n.memoizedProps = e.memoizedProps,
        n.memoizedState = e.memoizedState,
        n.updateQueue = e.updateQueue,
        t = e.dependencies,
        n.dependencies = t === null ? null : {
            lanes: t.lanes,
            firstContext: t.firstContext
        },
        n.sibling = e.sibling,
        n.index = e.index,
        n.ref = e.ref,
        n.refCleanup = e.refCleanup,
        n
    }
    function Wc(e, t) {
        e.flags &= 65011714;
        var n = e.alternate;
        return n === null ? (e.childLanes = 0,
        e.lanes = t,
        e.child = null,
        e.subtreeFlags = 0,
        e.memoizedProps = null,
        e.memoizedState = null,
        e.updateQueue = null,
        e.dependencies = null,
        e.stateNode = null) : (e.childLanes = n.childLanes,
        e.lanes = n.lanes,
        e.child = n.child,
        e.subtreeFlags = 0,
        e.deletions = null,
        e.memoizedProps = n.memoizedProps,
        e.memoizedState = n.memoizedState,
        e.updateQueue = n.updateQueue,
        e.type = n.type,
        t = n.dependencies,
        e.dependencies = t === null ? null : {
            lanes: t.lanes,
            firstContext: t.firstContext
        }),
        e
    }
    function Ei(e, t, n, a, i, o) {
        var h = 0;
        if (a = e,
        typeof e == "function")
            br(e) && (h = 1);
        else if (typeof e == "string")
            h = C0(e, n, J.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
        else
            e: switch (e) {
            case _e:
                return e = gt(31, n, t, i),
                e.elementType = _e,
                e.lanes = o,
                e;
            case O:
                return Qn(n.children, i, o, t);
            case C:
                h = 8,
                i |= 24;
                break;
            case M:
                return e = gt(12, n, t, i | 2),
                e.elementType = M,
                e.lanes = o,
                e;
            case W:
                return e = gt(13, n, t, i),
                e.elementType = W,
                e.lanes = o,
                e;
            case ue:
                return e = gt(19, n, t, i),
                e.elementType = ue,
                e.lanes = o,
                e;
            default:
                if (typeof e == "object" && e !== null)
                    switch (e.$$typeof) {
                    case V:
                        h = 10;
                        break e;
                    case G:
                        h = 9;
                        break e;
                    case K:
                        h = 11;
                        break e;
                    case I:
                        h = 14;
                        break e;
                    case ye:
                        h = 16,
                        a = null;
                        break e
                    }
                h = 29,
                n = Error(u(130, e === null ? "null" : typeof e, "")),
                a = null
            }
        return t = gt(h, n, t, i),
        t.elementType = e,
        t.type = a,
        t.lanes = o,
        t
    }
    function Qn(e, t, n, a) {
        return e = gt(7, e, a, t),
        e.lanes = n,
        e
    }
    function xr(e, t, n) {
        return e = gt(6, e, null, t),
        e.lanes = n,
        e
    }
    function Ic(e) {
        var t = gt(18, null, null, 0);
        return t.stateNode = e,
        t
    }
    function Sr(e, t, n) {
        return t = gt(4, e.children !== null ? e.children : [], e.key, t),
        t.lanes = n,
        t.stateNode = {
            containerInfo: e.containerInfo,
            pendingChildren: null,
            implementation: e.implementation
        },
        t
    }
    var Pc = new WeakMap;
    function Ct(e, t) {
        if (typeof e == "object" && e !== null) {
            var n = Pc.get(e);
            return n !== void 0 ? n : (t = {
                value: e,
                source: t,
                stack: Io(t)
            },
            Pc.set(e, t),
            t)
        }
        return {
            value: e,
            source: t,
            stack: Io(t)
        }
    }
    var pa = []
      , ya = 0
      , wi = null
      , ul = 0
      , _t = []
      , At = 0
      , gn = null
      , Ut = 1
      , Bt = "";
    function Kt(e, t) {
        pa[ya++] = ul,
        pa[ya++] = wi,
        wi = e,
        ul = t
    }
    function ef(e, t, n) {
        _t[At++] = Ut,
        _t[At++] = Bt,
        _t[At++] = gn,
        gn = e;
        var a = Ut;
        e = Bt;
        var i = 32 - ht(a) - 1;
        a &= ~(1 << i),
        n += 1;
        var o = 32 - ht(t) + i;
        if (30 < o) {
            var h = i - i % 5;
            o = (a & (1 << h) - 1).toString(32),
            a >>= h,
            i -= h,
            Ut = 1 << 32 - ht(t) + i | n << i | a,
            Bt = o + e
        } else
            Ut = 1 << o | n << i | a,
            Bt = e
    }
    function Er(e) {
        e.return !== null && (Kt(e, 1),
        ef(e, 1, 0))
    }
    function wr(e) {
        for (; e === wi; )
            wi = pa[--ya],
            pa[ya] = null,
            ul = pa[--ya],
            pa[ya] = null;
        for (; e === gn; )
            gn = _t[--At],
            _t[At] = null,
            Bt = _t[--At],
            _t[At] = null,
            Ut = _t[--At],
            _t[At] = null
    }
    function tf(e, t) {
        _t[At++] = Ut,
        _t[At++] = Bt,
        _t[At++] = gn,
        Ut = t.id,
        Bt = t.overflow,
        gn = e
    }
    var $e = null
      , Le = null
      , ve = !1
      , pn = null
      , Tt = !1
      , Cr = Error(u(519));
    function yn(e) {
        var t = Error(u(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", ""));
        throw ol(Ct(t, e)),
        Cr
    }
    function nf(e) {
        var t = e.stateNode
          , n = e.type
          , a = e.memoizedProps;
        switch (t[Je] = e,
        t[lt] = a,
        n) {
        case "dialog":
            me("cancel", t),
            me("close", t);
            break;
        case "iframe":
        case "object":
        case "embed":
            me("load", t);
            break;
        case "video":
        case "audio":
            for (n = 0; n < zl.length; n++)
                me(zl[n], t);
            break;
        case "source":
            me("error", t);
            break;
        case "img":
        case "image":
        case "link":
            me("error", t),
            me("load", t);
            break;
        case "details":
            me("toggle", t);
            break;
        case "input":
            me("invalid", t),
            gc(t, a.value, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name, !0);
            break;
        case "select":
            me("invalid", t);
            break;
        case "textarea":
            me("invalid", t),
            yc(t, a.value, a.defaultValue, a.children)
        }
        n = a.children,
        typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || a.suppressHydrationWarning === !0 || xh(t.textContent, n) ? (a.popover != null && (me("beforetoggle", t),
        me("toggle", t)),
        a.onScroll != null && me("scroll", t),
        a.onScrollEnd != null && me("scrollend", t),
        a.onClick != null && (t.onclick = Xt),
        t = !0) : t = !1,
        t || yn(e, !0)
    }
    function af(e) {
        for ($e = e.return; $e; )
            switch ($e.tag) {
            case 5:
            case 31:
            case 13:
                Tt = !1;
                return;
            case 27:
            case 3:
                Tt = !0;
                return;
            default:
                $e = $e.return
            }
    }
    function va(e) {
        if (e !== $e)
            return !1;
        if (!ve)
            return af(e),
            ve = !0,
            !1;
        var t = e.tag, n;
        if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type,
        n = !(n !== "form" && n !== "button") || Vu(e.type, e.memoizedProps)),
        n = !n),
        n && Le && yn(e),
        af(e),
        t === 13) {
            if (e = e.memoizedState,
            e = e !== null ? e.dehydrated : null,
            !e)
                throw Error(u(317));
            Le = Rh(e)
        } else if (t === 31) {
            if (e = e.memoizedState,
            e = e !== null ? e.dehydrated : null,
            !e)
                throw Error(u(317));
            Le = Rh(e)
        } else
            t === 27 ? (t = Le,
            zn(e.type) ? (e = Zu,
            Zu = null,
            Le = e) : Le = t) : Le = $e ? Rt(e.stateNode.nextSibling) : null;
        return !0
    }
    function Xn() {
        Le = $e = null,
        ve = !1
    }
    function _r() {
        var e = pn;
        return e !== null && (ot === null ? ot = e : ot.push.apply(ot, e),
        pn = null),
        e
    }
    function ol(e) {
        pn === null ? pn = [e] : pn.push(e)
    }
    var Ar = A(null)
      , Fn = null
      , Jt = null;
    function vn(e, t, n) {
        F(Ar, t._currentValue),
        t._currentValue = n
    }
    function $t(e) {
        e._currentValue = Ar.current,
        H(Ar)
    }
    function Tr(e, t, n) {
        for (; e !== null; ) {
            var a = e.alternate;
            if ((e.childLanes & t) !== t ? (e.childLanes |= t,
            a !== null && (a.childLanes |= t)) : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t),
            e === n)
                break;
            e = e.return
        }
    }
    function Or(e, t, n, a) {
        var i = e.child;
        for (i !== null && (i.return = e); i !== null; ) {
            var o = i.dependencies;
            if (o !== null) {
                var h = i.child;
                o = o.firstContext;
                e: for (; o !== null; ) {
                    var y = o;
                    o = i;
                    for (var _ = 0; _ < t.length; _++)
                        if (y.context === t[_]) {
                            o.lanes |= n,
                            y = o.alternate,
                            y !== null && (y.lanes |= n),
                            Tr(o.return, n, e),
                            a || (h = null);
                            break e
                        }
                    o = y.next
                }
            } else if (i.tag === 18) {
                if (h = i.return,
                h === null)
                    throw Error(u(341));
                h.lanes |= n,
                o = h.alternate,
                o !== null && (o.lanes |= n),
                Tr(h, n, e),
                h = null
            } else
                h = i.child;
            if (h !== null)
                h.return = i;
            else
                for (h = i; h !== null; ) {
                    if (h === e) {
                        h = null;
                        break
                    }
                    if (i = h.sibling,
                    i !== null) {
                        i.return = h.return,
                        h = i;
                        break
                    }
                    h = h.return
                }
            i = h
        }
    }
    function ba(e, t, n, a) {
        e = null;
        for (var i = t, o = !1; i !== null; ) {
            if (!o) {
                if ((i.flags & 524288) !== 0)
                    o = !0;
                else if ((i.flags & 262144) !== 0)
                    break
            }
            if (i.tag === 10) {
                var h = i.alternate;
                if (h === null)
                    throw Error(u(387));
                if (h = h.memoizedProps,
                h !== null) {
                    var y = i.type;
                    mt(i.pendingProps.value, h.value) || (e !== null ? e.push(y) : e = [y])
                }
            } else if (i === Ce.current) {
                if (h = i.alternate,
                h === null)
                    throw Error(u(387));
                h.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e !== null ? e.push(Ul) : e = [Ul])
            }
            i = i.return
        }
        e !== null && Or(t, e, n, a),
        t.flags |= 262144
    }
    function Ci(e) {
        for (e = e.firstContext; e !== null; ) {
            if (!mt(e.context._currentValue, e.memoizedValue))
                return !0;
            e = e.next
        }
        return !1
    }
    function Zn(e) {
        Fn = e,
        Jt = null,
        e = e.dependencies,
        e !== null && (e.firstContext = null)
    }
    function We(e) {
        return lf(Fn, e)
    }
    function _i(e, t) {
        return Fn === null && Zn(e),
        lf(e, t)
    }
    function lf(e, t) {
        var n = t._currentValue;
        if (t = {
            context: t,
            memoizedValue: n,
            next: null
        },
        Jt === null) {
            if (e === null)
                throw Error(u(308));
            Jt = t,
            e.dependencies = {
                lanes: 0,
                firstContext: t
            },
            e.flags |= 524288
        } else
            Jt = Jt.next = t;
        return n
    }
    var xy = typeof AbortController < "u" ? AbortController : function() {
        var e = []
          , t = this.signal = {
            aborted: !1,
            addEventListener: function(n, a) {
                e.push(a)
            }
        };
        this.abort = function() {
            t.aborted = !0,
            e.forEach(function(n) {
                return n()
            })
        }
    }
      , Sy = s.unstable_scheduleCallback
      , Ey = s.unstable_NormalPriority
      , Ge = {
        $$typeof: V,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0
    };
    function Rr() {
        return {
            controller: new xy,
            data: new Map,
            refCount: 0
        }
    }
    function cl(e) {
        e.refCount--,
        e.refCount === 0 && Sy(Ey, function() {
            e.controller.abort()
        })
    }
    var fl = null
      , Nr = 0
      , xa = 0
      , Sa = null;
    function wy(e, t) {
        if (fl === null) {
            var n = fl = [];
            Nr = 0,
            xa = Mu(),
            Sa = {
                status: "pending",
                value: void 0,
                then: function(a) {
                    n.push(a)
                }
            }
        }
        return Nr++,
        t.then(sf, sf),
        t
    }
    function sf() {
        if (--Nr === 0 && fl !== null) {
            Sa !== null && (Sa.status = "fulfilled");
            var e = fl;
            fl = null,
            xa = 0,
            Sa = null;
            for (var t = 0; t < e.length; t++)
                (0,
                e[t])()
        }
    }
    function Cy(e, t) {
        var n = []
          , a = {
            status: "pending",
            value: null,
            reason: null,
            then: function(i) {
                n.push(i)
            }
        };
        return e.then(function() {
            a.status = "fulfilled",
            a.value = t;
            for (var i = 0; i < n.length; i++)
                (0,
                n[i])(t)
        }, function(i) {
            for (a.status = "rejected",
            a.reason = i,
            i = 0; i < n.length; i++)
                (0,
                n[i])(void 0)
        }),
        a
    }
    var rf = U.S;
    U.S = function(e, t) {
        Qd = ft(),
        typeof t == "object" && t !== null && typeof t.then == "function" && wy(e, t),
        rf !== null && rf(e, t)
    }
    ;
    var Kn = A(null);
    function zr() {
        var e = Kn.current;
        return e !== null ? e : ze.pooledCache
    }
    function Ai(e, t) {
        t === null ? F(Kn, Kn.current) : F(Kn, t.pool)
    }
    function uf() {
        var e = zr();
        return e === null ? null : {
            parent: Ge._currentValue,
            pool: e
        }
    }
    var Ea = Error(u(460))
      , Lr = Error(u(474))
      , Ti = Error(u(542))
      , Oi = {
        then: function() {}
    };
    function of(e) {
        return e = e.status,
        e === "fulfilled" || e === "rejected"
    }
    function cf(e, t, n) {
        switch (n = e[n],
        n === void 0 ? e.push(t) : n !== t && (t.then(Xt, Xt),
        t = n),
        t.status) {
        case "fulfilled":
            return t.value;
        case "rejected":
            throw e = t.reason,
            df(e),
            e;
        default:
            if (typeof t.status == "string")
                t.then(Xt, Xt);
            else {
                if (e = ze,
                e !== null && 100 < e.shellSuspendCounter)
                    throw Error(u(482));
                e = t,
                e.status = "pending",
                e.then(function(a) {
                    if (t.status === "pending") {
                        var i = t;
                        i.status = "fulfilled",
                        i.value = a
                    }
                }, function(a) {
                    if (t.status === "pending") {
                        var i = t;
                        i.status = "rejected",
                        i.reason = a
                    }
                })
            }
            switch (t.status) {
            case "fulfilled":
                return t.value;
            case "rejected":
                throw e = t.reason,
                df(e),
                e
            }
            throw $n = t,
            Ea
        }
    }
    function Jn(e) {
        try {
            var t = e._init;
            return t(e._payload)
        } catch (n) {
            throw n !== null && typeof n == "object" && typeof n.then == "function" ? ($n = n,
            Ea) : n
        }
    }
    var $n = null;
    function ff() {
        if ($n === null)
            throw Error(u(459));
        var e = $n;
        return $n = null,
        e
    }
    function df(e) {
        if (e === Ea || e === Ti)
            throw Error(u(483))
    }
    var wa = null
      , dl = 0;
    function Ri(e) {
        var t = dl;
        return dl += 1,
        wa === null && (wa = []),
        cf(wa, e, t)
    }
    function hl(e, t) {
        t = t.props.ref,
        e.ref = t !== void 0 ? t : null
    }
    function Ni(e, t) {
        throw t.$$typeof === S ? Error(u(525)) : (e = Object.prototype.toString.call(t),
        Error(u(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)))
    }
    function hf(e) {
        function t(R, T) {
            if (e) {
                var N = R.deletions;
                N === null ? (R.deletions = [T],
                R.flags |= 16) : N.push(T)
            }
        }
        function n(R, T) {
            if (!e)
                return null;
            for (; T !== null; )
                t(R, T),
                T = T.sibling;
            return null
        }
        function a(R) {
            for (var T = new Map; R !== null; )
                R.key !== null ? T.set(R.key, R) : T.set(R.index, R),
                R = R.sibling;
            return T
        }
        function i(R, T) {
            return R = Zt(R, T),
            R.index = 0,
            R.sibling = null,
            R
        }
        function o(R, T, N) {
            return R.index = N,
            e ? (N = R.alternate,
            N !== null ? (N = N.index,
            N < T ? (R.flags |= 67108866,
            T) : N) : (R.flags |= 67108866,
            T)) : (R.flags |= 1048576,
            T)
        }
        function h(R) {
            return e && R.alternate === null && (R.flags |= 67108866),
            R
        }
        function y(R, T, N, q) {
            return T === null || T.tag !== 6 ? (T = xr(N, R.mode, q),
            T.return = R,
            T) : (T = i(T, N),
            T.return = R,
            T)
        }
        function _(R, T, N, q) {
            var ee = N.type;
            return ee === O ? B(R, T, N.props.children, q, N.key) : T !== null && (T.elementType === ee || typeof ee == "object" && ee !== null && ee.$$typeof === ye && Jn(ee) === T.type) ? (T = i(T, N.props),
            hl(T, N),
            T.return = R,
            T) : (T = Ei(N.type, N.key, N.props, null, R.mode, q),
            hl(T, N),
            T.return = R,
            T)
        }
        function z(R, T, N, q) {
            return T === null || T.tag !== 4 || T.stateNode.containerInfo !== N.containerInfo || T.stateNode.implementation !== N.implementation ? (T = Sr(N, R.mode, q),
            T.return = R,
            T) : (T = i(T, N.children || []),
            T.return = R,
            T)
        }
        function B(R, T, N, q, ee) {
            return T === null || T.tag !== 7 ? (T = Qn(N, R.mode, q, ee),
            T.return = R,
            T) : (T = i(T, N),
            T.return = R,
            T)
        }
        function Y(R, T, N) {
            if (typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint")
                return T = xr("" + T, R.mode, N),
                T.return = R,
                T;
            if (typeof T == "object" && T !== null) {
                switch (T.$$typeof) {
                case x:
                    return N = Ei(T.type, T.key, T.props, null, R.mode, N),
                    hl(N, T),
                    N.return = R,
                    N;
                case E:
                    return T = Sr(T, R.mode, N),
                    T.return = R,
                    T;
                case ye:
                    return T = Jn(T),
                    Y(R, T, N)
                }
                if (fe(T) || Z(T))
                    return T = Qn(T, R.mode, N, null),
                    T.return = R,
                    T;
                if (typeof T.then == "function")
                    return Y(R, Ri(T), N);
                if (T.$$typeof === V)
                    return Y(R, _i(R, T), N);
                Ni(R, T)
            }
            return null
        }
        function L(R, T, N, q) {
            var ee = T !== null ? T.key : null;
            if (typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint")
                return ee !== null ? null : y(R, T, "" + N, q);
            if (typeof N == "object" && N !== null) {
                switch (N.$$typeof) {
                case x:
                    return N.key === ee ? _(R, T, N, q) : null;
                case E:
                    return N.key === ee ? z(R, T, N, q) : null;
                case ye:
                    return N = Jn(N),
                    L(R, T, N, q)
                }
                if (fe(N) || Z(N))
                    return ee !== null ? null : B(R, T, N, q, null);
                if (typeof N.then == "function")
                    return L(R, T, Ri(N), q);
                if (N.$$typeof === V)
                    return L(R, T, _i(R, N), q);
                Ni(R, N)
            }
            return null
        }
        function D(R, T, N, q, ee) {
            if (typeof q == "string" && q !== "" || typeof q == "number" || typeof q == "bigint")
                return R = R.get(N) || null,
                y(T, R, "" + q, ee);
            if (typeof q == "object" && q !== null) {
                switch (q.$$typeof) {
                case x:
                    return R = R.get(q.key === null ? N : q.key) || null,
                    _(T, R, q, ee);
                case E:
                    return R = R.get(q.key === null ? N : q.key) || null,
                    z(T, R, q, ee);
                case ye:
                    return q = Jn(q),
                    D(R, T, N, q, ee)
                }
                if (fe(q) || Z(q))
                    return R = R.get(N) || null,
                    B(T, R, q, ee, null);
                if (typeof q.then == "function")
                    return D(R, T, N, Ri(q), ee);
                if (q.$$typeof === V)
                    return D(R, T, N, _i(T, q), ee);
                Ni(T, q)
            }
            return null
        }
        function $(R, T, N, q) {
            for (var ee = null, xe = null, P = T, ce = T = 0, pe = null; P !== null && ce < N.length; ce++) {
                P.index > ce ? (pe = P,
                P = null) : pe = P.sibling;
                var Se = L(R, P, N[ce], q);
                if (Se === null) {
                    P === null && (P = pe);
                    break
                }
                e && P && Se.alternate === null && t(R, P),
                T = o(Se, T, ce),
                xe === null ? ee = Se : xe.sibling = Se,
                xe = Se,
                P = pe
            }
            if (ce === N.length)
                return n(R, P),
                ve && Kt(R, ce),
                ee;
            if (P === null) {
                for (; ce < N.length; ce++)
                    P = Y(R, N[ce], q),
                    P !== null && (T = o(P, T, ce),
                    xe === null ? ee = P : xe.sibling = P,
                    xe = P);
                return ve && Kt(R, ce),
                ee
            }
            for (P = a(P); ce < N.length; ce++)
                pe = D(P, R, ce, N[ce], q),
                pe !== null && (e && pe.alternate !== null && P.delete(pe.key === null ? ce : pe.key),
                T = o(pe, T, ce),
                xe === null ? ee = pe : xe.sibling = pe,
                xe = pe);
            return e && P.forEach(function(Un) {
                return t(R, Un)
            }),
            ve && Kt(R, ce),
            ee
        }
        function ae(R, T, N, q) {
            if (N == null)
                throw Error(u(151));
            for (var ee = null, xe = null, P = T, ce = T = 0, pe = null, Se = N.next(); P !== null && !Se.done; ce++,
            Se = N.next()) {
                P.index > ce ? (pe = P,
                P = null) : pe = P.sibling;
                var Un = L(R, P, Se.value, q);
                if (Un === null) {
                    P === null && (P = pe);
                    break
                }
                e && P && Un.alternate === null && t(R, P),
                T = o(Un, T, ce),
                xe === null ? ee = Un : xe.sibling = Un,
                xe = Un,
                P = pe
            }
            if (Se.done)
                return n(R, P),
                ve && Kt(R, ce),
                ee;
            if (P === null) {
                for (; !Se.done; ce++,
                Se = N.next())
                    Se = Y(R, Se.value, q),
                    Se !== null && (T = o(Se, T, ce),
                    xe === null ? ee = Se : xe.sibling = Se,
                    xe = Se);
                return ve && Kt(R, ce),
                ee
            }
            for (P = a(P); !Se.done; ce++,
            Se = N.next())
                Se = D(P, R, ce, Se.value, q),
                Se !== null && (e && Se.alternate !== null && P.delete(Se.key === null ? ce : Se.key),
                T = o(Se, T, ce),
                xe === null ? ee = Se : xe.sibling = Se,
                xe = Se);
            return e && P.forEach(function(j0) {
                return t(R, j0)
            }),
            ve && Kt(R, ce),
            ee
        }
        function Ne(R, T, N, q) {
            if (typeof N == "object" && N !== null && N.type === O && N.key === null && (N = N.props.children),
            typeof N == "object" && N !== null) {
                switch (N.$$typeof) {
                case x:
                    e: {
                        for (var ee = N.key; T !== null; ) {
                            if (T.key === ee) {
                                if (ee = N.type,
                                ee === O) {
                                    if (T.tag === 7) {
                                        n(R, T.sibling),
                                        q = i(T, N.props.children),
                                        q.return = R,
                                        R = q;
                                        break e
                                    }
                                } else if (T.elementType === ee || typeof ee == "object" && ee !== null && ee.$$typeof === ye && Jn(ee) === T.type) {
                                    n(R, T.sibling),
                                    q = i(T, N.props),
                                    hl(q, N),
                                    q.return = R,
                                    R = q;
                                    break e
                                }
                                n(R, T);
                                break
                            } else
                                t(R, T);
                            T = T.sibling
                        }
                        N.type === O ? (q = Qn(N.props.children, R.mode, q, N.key),
                        q.return = R,
                        R = q) : (q = Ei(N.type, N.key, N.props, null, R.mode, q),
                        hl(q, N),
                        q.return = R,
                        R = q)
                    }
                    return h(R);
                case E:
                    e: {
                        for (ee = N.key; T !== null; ) {
                            if (T.key === ee)
                                if (T.tag === 4 && T.stateNode.containerInfo === N.containerInfo && T.stateNode.implementation === N.implementation) {
                                    n(R, T.sibling),
                                    q = i(T, N.children || []),
                                    q.return = R,
                                    R = q;
                                    break e
                                } else {
                                    n(R, T);
                                    break
                                }
                            else
                                t(R, T);
                            T = T.sibling
                        }
                        q = Sr(N, R.mode, q),
                        q.return = R,
                        R = q
                    }
                    return h(R);
                case ye:
                    return N = Jn(N),
                    Ne(R, T, N, q)
                }
                if (fe(N))
                    return $(R, T, N, q);
                if (Z(N)) {
                    if (ee = Z(N),
                    typeof ee != "function")
                        throw Error(u(150));
                    return N = ee.call(N),
                    ae(R, T, N, q)
                }
                if (typeof N.then == "function")
                    return Ne(R, T, Ri(N), q);
                if (N.$$typeof === V)
                    return Ne(R, T, _i(R, N), q);
                Ni(R, N)
            }
            return typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint" ? (N = "" + N,
            T !== null && T.tag === 6 ? (n(R, T.sibling),
            q = i(T, N),
            q.return = R,
            R = q) : (n(R, T),
            q = xr(N, R.mode, q),
            q.return = R,
            R = q),
            h(R)) : n(R, T)
        }
        return function(R, T, N, q) {
            try {
                dl = 0;
                var ee = Ne(R, T, N, q);
                return wa = null,
                ee
            } catch (P) {
                if (P === Ea || P === Ti)
                    throw P;
                var xe = gt(29, P, null, R.mode);
                return xe.lanes = q,
                xe.return = R,
                xe
            }
        }
    }
    var Wn = hf(!0)
      , mf = hf(!1)
      , bn = !1;
    function Mr(e) {
        e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {
                pending: null,
                lanes: 0,
                hiddenCallbacks: null
            },
            callbacks: null
        }
    }
    function Dr(e, t) {
        e = e.updateQueue,
        t.updateQueue === e && (t.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            callbacks: null
        })
    }
    function xn(e) {
        return {
            lane: e,
            tag: 0,
            payload: null,
            callback: null,
            next: null
        }
    }
    function Sn(e, t, n) {
        var a = e.updateQueue;
        if (a === null)
            return null;
        if (a = a.shared,
        (Ee & 2) !== 0) {
            var i = a.pending;
            return i === null ? t.next = t : (t.next = i.next,
            i.next = t),
            a.pending = t,
            t = Si(e),
            $c(e, null, n),
            t
        }
        return xi(e, a, t, n),
        Si(e)
    }
    function ml(e, t, n) {
        if (t = t.updateQueue,
        t !== null && (t = t.shared,
        (n & 4194048) !== 0)) {
            var a = t.lanes;
            a &= e.pendingLanes,
            n |= a,
            t.lanes = n,
            lc(e, n)
        }
    }
    function jr(e, t) {
        var n = e.updateQueue
          , a = e.alternate;
        if (a !== null && (a = a.updateQueue,
        n === a)) {
            var i = null
              , o = null;
            if (n = n.firstBaseUpdate,
            n !== null) {
                do {
                    var h = {
                        lane: n.lane,
                        tag: n.tag,
                        payload: n.payload,
                        callback: null,
                        next: null
                    };
                    o === null ? i = o = h : o = o.next = h,
                    n = n.next
                } while (n !== null);
                o === null ? i = o = t : o = o.next = t
            } else
                i = o = t;
            n = {
                baseState: a.baseState,
                firstBaseUpdate: i,
                lastBaseUpdate: o,
                shared: a.shared,
                callbacks: a.callbacks
            },
            e.updateQueue = n;
            return
        }
        e = n.lastBaseUpdate,
        e === null ? n.firstBaseUpdate = t : e.next = t,
        n.lastBaseUpdate = t
    }
    var Ur = !1;
    function gl() {
        if (Ur) {
            var e = Sa;
            if (e !== null)
                throw e
        }
    }
    function pl(e, t, n, a) {
        Ur = !1;
        var i = e.updateQueue;
        bn = !1;
        var o = i.firstBaseUpdate
          , h = i.lastBaseUpdate
          , y = i.shared.pending;
        if (y !== null) {
            i.shared.pending = null;
            var _ = y
              , z = _.next;
            _.next = null,
            h === null ? o = z : h.next = z,
            h = _;
            var B = e.alternate;
            B !== null && (B = B.updateQueue,
            y = B.lastBaseUpdate,
            y !== h && (y === null ? B.firstBaseUpdate = z : y.next = z,
            B.lastBaseUpdate = _))
        }
        if (o !== null) {
            var Y = i.baseState;
            h = 0,
            B = z = _ = null,
            y = o;
            do {
                var L = y.lane & -536870913
                  , D = L !== y.lane;
                if (D ? (ge & L) === L : (a & L) === L) {
                    L !== 0 && L === xa && (Ur = !0),
                    B !== null && (B = B.next = {
                        lane: 0,
                        tag: y.tag,
                        payload: y.payload,
                        callback: null,
                        next: null
                    });
                    e: {
                        var $ = e
                          , ae = y;
                        L = t;
                        var Ne = n;
                        switch (ae.tag) {
                        case 1:
                            if ($ = ae.payload,
                            typeof $ == "function") {
                                Y = $.call(Ne, Y, L);
                                break e
                            }
                            Y = $;
                            break e;
                        case 3:
                            $.flags = $.flags & -65537 | 128;
                        case 0:
                            if ($ = ae.payload,
                            L = typeof $ == "function" ? $.call(Ne, Y, L) : $,
                            L == null)
                                break e;
                            Y = v({}, Y, L);
                            break e;
                        case 2:
                            bn = !0
                        }
                    }
                    L = y.callback,
                    L !== null && (e.flags |= 64,
                    D && (e.flags |= 8192),
                    D = i.callbacks,
                    D === null ? i.callbacks = [L] : D.push(L))
                } else
                    D = {
                        lane: L,
                        tag: y.tag,
                        payload: y.payload,
                        callback: y.callback,
                        next: null
                    },
                    B === null ? (z = B = D,
                    _ = Y) : B = B.next = D,
                    h |= L;
                if (y = y.next,
                y === null) {
                    if (y = i.shared.pending,
                    y === null)
                        break;
                    D = y,
                    y = D.next,
                    D.next = null,
                    i.lastBaseUpdate = D,
                    i.shared.pending = null
                }
            } while (!0);
            B === null && (_ = Y),
            i.baseState = _,
            i.firstBaseUpdate = z,
            i.lastBaseUpdate = B,
            o === null && (i.shared.lanes = 0),
            An |= h,
            e.lanes = h,
            e.memoizedState = Y
        }
    }
    function gf(e, t) {
        if (typeof e != "function")
            throw Error(u(191, e));
        e.call(t)
    }
    function pf(e, t) {
        var n = e.callbacks;
        if (n !== null)
            for (e.callbacks = null,
            e = 0; e < n.length; e++)
                gf(n[e], t)
    }
    var Ca = A(null)
      , zi = A(0);
    function yf(e, t) {
        e = sn,
        F(zi, e),
        F(Ca, t),
        sn = e | t.baseLanes
    }
    function Br() {
        F(zi, sn),
        F(Ca, Ca.current)
    }
    function Hr() {
        sn = zi.current,
        H(Ca),
        H(zi)
    }
    var pt = A(null)
      , Ot = null;
    function En(e) {
        var t = e.alternate;
        F(He, He.current & 1),
        F(pt, e),
        Ot === null && (t === null || Ca.current !== null || t.memoizedState !== null) && (Ot = e)
    }
    function qr(e) {
        F(He, He.current),
        F(pt, e),
        Ot === null && (Ot = e)
    }
    function vf(e) {
        e.tag === 22 ? (F(He, He.current),
        F(pt, e),
        Ot === null && (Ot = e)) : wn()
    }
    function wn() {
        F(He, He.current),
        F(pt, pt.current)
    }
    function yt(e) {
        H(pt),
        Ot === e && (Ot = null),
        H(He)
    }
    var He = A(0);
    function Li(e) {
        for (var t = e; t !== null; ) {
            if (t.tag === 13) {
                var n = t.memoizedState;
                if (n !== null && (n = n.dehydrated,
                n === null || Xu(n) || Fu(n)))
                    return t
            } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
                if ((t.flags & 128) !== 0)
                    return t
            } else if (t.child !== null) {
                t.child.return = t,
                t = t.child;
                continue
            }
            if (t === e)
                break;
            for (; t.sibling === null; ) {
                if (t.return === null || t.return === e)
                    return null;
                t = t.return
            }
            t.sibling.return = t.return,
            t = t.sibling
        }
        return null
    }
    var Wt = 0
      , re = null
      , Oe = null
      , Ye = null
      , Mi = !1
      , _a = !1
      , In = !1
      , Di = 0
      , yl = 0
      , Aa = null
      , _y = 0;
    function je() {
        throw Error(u(321))
    }
    function Gr(e, t) {
        if (t === null)
            return !1;
        for (var n = 0; n < t.length && n < e.length; n++)
            if (!mt(e[n], t[n]))
                return !1;
        return !0
    }
    function Yr(e, t, n, a, i, o) {
        return Wt = o,
        re = t,
        t.memoizedState = null,
        t.updateQueue = null,
        t.lanes = 0,
        U.H = e === null || e.memoizedState === null ? td : nu,
        In = !1,
        o = n(a, i),
        In = !1,
        _a && (o = xf(t, n, a, i)),
        bf(e),
        o
    }
    function bf(e) {
        U.H = xl;
        var t = Oe !== null && Oe.next !== null;
        if (Wt = 0,
        Ye = Oe = re = null,
        Mi = !1,
        yl = 0,
        Aa = null,
        t)
            throw Error(u(300));
        e === null || Ve || (e = e.dependencies,
        e !== null && Ci(e) && (Ve = !0))
    }
    function xf(e, t, n, a) {
        re = e;
        var i = 0;
        do {
            if (_a && (Aa = null),
            yl = 0,
            _a = !1,
            25 <= i)
                throw Error(u(301));
            if (i += 1,
            Ye = Oe = null,
            e.updateQueue != null) {
                var o = e.updateQueue;
                o.lastEffect = null,
                o.events = null,
                o.stores = null,
                o.memoCache != null && (o.memoCache.index = 0)
            }
            U.H = nd,
            o = t(n, a)
        } while (_a);
        return o
    }
    function Ay() {
        var e = U.H
          , t = e.useState()[0];
        return t = typeof t.then == "function" ? vl(t) : t,
        e = e.useState()[0],
        (Oe !== null ? Oe.memoizedState : null) !== e && (re.flags |= 1024),
        t
    }
    function Vr() {
        var e = Di !== 0;
        return Di = 0,
        e
    }
    function kr(e, t, n) {
        t.updateQueue = e.updateQueue,
        t.flags &= -2053,
        e.lanes &= ~n
    }
    function Qr(e) {
        if (Mi) {
            for (e = e.memoizedState; e !== null; ) {
                var t = e.queue;
                t !== null && (t.pending = null),
                e = e.next
            }
            Mi = !1
        }
        Wt = 0,
        Ye = Oe = re = null,
        _a = !1,
        yl = Di = 0,
        Aa = null
    }
    function at() {
        var e = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null
        };
        return Ye === null ? re.memoizedState = Ye = e : Ye = Ye.next = e,
        Ye
    }
    function qe() {
        if (Oe === null) {
            var e = re.alternate;
            e = e !== null ? e.memoizedState : null
        } else
            e = Oe.next;
        var t = Ye === null ? re.memoizedState : Ye.next;
        if (t !== null)
            Ye = t,
            Oe = e;
        else {
            if (e === null)
                throw re.alternate === null ? Error(u(467)) : Error(u(310));
            Oe = e,
            e = {
                memoizedState: Oe.memoizedState,
                baseState: Oe.baseState,
                baseQueue: Oe.baseQueue,
                queue: Oe.queue,
                next: null
            },
            Ye === null ? re.memoizedState = Ye = e : Ye = Ye.next = e
        }
        return Ye
    }
    function ji() {
        return {
            lastEffect: null,
            events: null,
            stores: null,
            memoCache: null
        }
    }
    function vl(e) {
        var t = yl;
        return yl += 1,
        Aa === null && (Aa = []),
        e = cf(Aa, e, t),
        t = re,
        (Ye === null ? t.memoizedState : Ye.next) === null && (t = t.alternate,
        U.H = t === null || t.memoizedState === null ? td : nu),
        e
    }
    function Ui(e) {
        if (e !== null && typeof e == "object") {
            if (typeof e.then == "function")
                return vl(e);
            if (e.$$typeof === V)
                return We(e)
        }
        throw Error(u(438, String(e)))
    }
    function Xr(e) {
        var t = null
          , n = re.updateQueue;
        if (n !== null && (t = n.memoCache),
        t == null) {
            var a = re.alternate;
            a !== null && (a = a.updateQueue,
            a !== null && (a = a.memoCache,
            a != null && (t = {
                data: a.data.map(function(i) {
                    return i.slice()
                }),
                index: 0
            })))
        }
        if (t == null && (t = {
            data: [],
            index: 0
        }),
        n === null && (n = ji(),
        re.updateQueue = n),
        n.memoCache = t,
        n = t.data[t.index],
        n === void 0)
            for (n = t.data[t.index] = Array(e),
            a = 0; a < e; a++)
                n[a] = k;
        return t.index++,
        n
    }
    function It(e, t) {
        return typeof t == "function" ? t(e) : t
    }
    function Bi(e) {
        var t = qe();
        return Fr(t, Oe, e)
    }
    function Fr(e, t, n) {
        var a = e.queue;
        if (a === null)
            throw Error(u(311));
        a.lastRenderedReducer = n;
        var i = e.baseQueue
          , o = a.pending;
        if (o !== null) {
            if (i !== null) {
                var h = i.next;
                i.next = o.next,
                o.next = h
            }
            t.baseQueue = i = o,
            a.pending = null
        }
        if (o = e.baseState,
        i === null)
            e.memoizedState = o;
        else {
            t = i.next;
            var y = h = null
              , _ = null
              , z = t
              , B = !1;
            do {
                var Y = z.lane & -536870913;
                if (Y !== z.lane ? (ge & Y) === Y : (Wt & Y) === Y) {
                    var L = z.revertLane;
                    if (L === 0)
                        _ !== null && (_ = _.next = {
                            lane: 0,
                            revertLane: 0,
                            gesture: null,
                            action: z.action,
                            hasEagerState: z.hasEagerState,
                            eagerState: z.eagerState,
                            next: null
                        }),
                        Y === xa && (B = !0);
                    else if ((Wt & L) === L) {
                        z = z.next,
                        L === xa && (B = !0);
                        continue
                    } else
                        Y = {
                            lane: 0,
                            revertLane: z.revertLane,
                            gesture: null,
                            action: z.action,
                            hasEagerState: z.hasEagerState,
                            eagerState: z.eagerState,
                            next: null
                        },
                        _ === null ? (y = _ = Y,
                        h = o) : _ = _.next = Y,
                        re.lanes |= L,
                        An |= L;
                    Y = z.action,
                    In && n(o, Y),
                    o = z.hasEagerState ? z.eagerState : n(o, Y)
                } else
                    L = {
                        lane: Y,
                        revertLane: z.revertLane,
                        gesture: z.gesture,
                        action: z.action,
                        hasEagerState: z.hasEagerState,
                        eagerState: z.eagerState,
                        next: null
                    },
                    _ === null ? (y = _ = L,
                    h = o) : _ = _.next = L,
                    re.lanes |= Y,
                    An |= Y;
                z = z.next
            } while (z !== null && z !== t);
            if (_ === null ? h = o : _.next = y,
            !mt(o, e.memoizedState) && (Ve = !0,
            B && (n = Sa,
            n !== null)))
                throw n;
            e.memoizedState = o,
            e.baseState = h,
            e.baseQueue = _,
            a.lastRenderedState = o
        }
        return i === null && (a.lanes = 0),
        [e.memoizedState, a.dispatch]
    }
    function Zr(e) {
        var t = qe()
          , n = t.queue;
        if (n === null)
            throw Error(u(311));
        n.lastRenderedReducer = e;
        var a = n.dispatch
          , i = n.pending
          , o = t.memoizedState;
        if (i !== null) {
            n.pending = null;
            var h = i = i.next;
            do
                o = e(o, h.action),
                h = h.next;
            while (h !== i);
            mt(o, t.memoizedState) || (Ve = !0),
            t.memoizedState = o,
            t.baseQueue === null && (t.baseState = o),
            n.lastRenderedState = o
        }
        return [o, a]
    }
    function Sf(e, t, n) {
        var a = re
          , i = qe()
          , o = ve;
        if (o) {
            if (n === void 0)
                throw Error(u(407));
            n = n()
        } else
            n = t();
        var h = !mt((Oe || i).memoizedState, n);
        if (h && (i.memoizedState = n,
        Ve = !0),
        i = i.queue,
        $r(Cf.bind(null, a, i, e), [e]),
        i.getSnapshot !== t || h || Ye !== null && Ye.memoizedState.tag & 1) {
            if (a.flags |= 2048,
            Ta(9, {
                destroy: void 0
            }, wf.bind(null, a, i, n, t), null),
            ze === null)
                throw Error(u(349));
            o || (Wt & 127) !== 0 || Ef(a, t, n)
        }
        return n
    }
    function Ef(e, t, n) {
        e.flags |= 16384,
        e = {
            getSnapshot: t,
            value: n
        },
        t = re.updateQueue,
        t === null ? (t = ji(),
        re.updateQueue = t,
        t.stores = [e]) : (n = t.stores,
        n === null ? t.stores = [e] : n.push(e))
    }
    function wf(e, t, n, a) {
        t.value = n,
        t.getSnapshot = a,
        _f(t) && Af(e)
    }
    function Cf(e, t, n) {
        return n(function() {
            _f(t) && Af(e)
        })
    }
    function _f(e) {
        var t = e.getSnapshot;
        e = e.value;
        try {
            var n = t();
            return !mt(e, n)
        } catch {
            return !0
        }
    }
    function Af(e) {
        var t = kn(e, 2);
        t !== null && ct(t, e, 2)
    }
    function Kr(e) {
        var t = at();
        if (typeof e == "function") {
            var n = e;
            if (e = n(),
            In) {
                dn(!0);
                try {
                    n()
                } finally {
                    dn(!1)
                }
            }
        }
        return t.memoizedState = t.baseState = e,
        t.queue = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: It,
            lastRenderedState: e
        },
        t
    }
    function Tf(e, t, n, a) {
        return e.baseState = n,
        Fr(e, Oe, typeof a == "function" ? a : It)
    }
    function Ty(e, t, n, a, i) {
        if (Gi(e))
            throw Error(u(485));
        if (e = t.action,
        e !== null) {
            var o = {
                payload: i,
                action: e,
                next: null,
                isTransition: !0,
                status: "pending",
                value: null,
                reason: null,
                listeners: [],
                then: function(h) {
                    o.listeners.push(h)
                }
            };
            U.T !== null ? n(!0) : o.isTransition = !1,
            a(o),
            n = t.pending,
            n === null ? (o.next = t.pending = o,
            Of(t, o)) : (o.next = n.next,
            t.pending = n.next = o)
        }
    }
    function Of(e, t) {
        var n = t.action
          , a = t.payload
          , i = e.state;
        if (t.isTransition) {
            var o = U.T
              , h = {};
            U.T = h;
            try {
                var y = n(i, a)
                  , _ = U.S;
                _ !== null && _(h, y),
                Rf(e, t, y)
            } catch (z) {
                Jr(e, t, z)
            } finally {
                o !== null && h.types !== null && (o.types = h.types),
                U.T = o
            }
        } else
            try {
                o = n(i, a),
                Rf(e, t, o)
            } catch (z) {
                Jr(e, t, z)
            }
    }
    function Rf(e, t, n) {
        n !== null && typeof n == "object" && typeof n.then == "function" ? n.then(function(a) {
            Nf(e, t, a)
        }, function(a) {
            return Jr(e, t, a)
        }) : Nf(e, t, n)
    }
    function Nf(e, t, n) {
        t.status = "fulfilled",
        t.value = n,
        zf(t),
        e.state = n,
        t = e.pending,
        t !== null && (n = t.next,
        n === t ? e.pending = null : (n = n.next,
        t.next = n,
        Of(e, n)))
    }
    function Jr(e, t, n) {
        var a = e.pending;
        if (e.pending = null,
        a !== null) {
            a = a.next;
            do
                t.status = "rejected",
                t.reason = n,
                zf(t),
                t = t.next;
            while (t !== a)
        }
        e.action = null
    }
    function zf(e) {
        e = e.listeners;
        for (var t = 0; t < e.length; t++)
            (0,
            e[t])()
    }
    function Lf(e, t) {
        return t
    }
    function Mf(e, t) {
        if (ve) {
            var n = ze.formState;
            if (n !== null) {
                e: {
                    var a = re;
                    if (ve) {
                        if (Le) {
                            t: {
                                for (var i = Le, o = Tt; i.nodeType !== 8; ) {
                                    if (!o) {
                                        i = null;
                                        break t
                                    }
                                    if (i = Rt(i.nextSibling),
                                    i === null) {
                                        i = null;
                                        break t
                                    }
                                }
                                o = i.data,
                                i = o === "F!" || o === "F" ? i : null
                            }
                            if (i) {
                                Le = Rt(i.nextSibling),
                                a = i.data === "F!";
                                break e
                            }
                        }
                        yn(a)
                    }
                    a = !1
                }
                a && (t = n[0])
            }
        }
        return n = at(),
        n.memoizedState = n.baseState = t,
        a = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: Lf,
            lastRenderedState: t
        },
        n.queue = a,
        n = If.bind(null, re, a),
        a.dispatch = n,
        a = Kr(!1),
        o = tu.bind(null, re, !1, a.queue),
        a = at(),
        i = {
            state: t,
            dispatch: null,
            action: e,
            pending: null
        },
        a.queue = i,
        n = Ty.bind(null, re, i, o, n),
        i.dispatch = n,
        a.memoizedState = e,
        [t, n, !1]
    }
    function Df(e) {
        var t = qe();
        return jf(t, Oe, e)
    }
    function jf(e, t, n) {
        if (t = Fr(e, t, Lf)[0],
        e = Bi(It)[0],
        typeof t == "object" && t !== null && typeof t.then == "function")
            try {
                var a = vl(t)
            } catch (h) {
                throw h === Ea ? Ti : h
            }
        else
            a = t;
        t = qe();
        var i = t.queue
          , o = i.dispatch;
        return n !== t.memoizedState && (re.flags |= 2048,
        Ta(9, {
            destroy: void 0
        }, Oy.bind(null, i, n), null)),
        [a, o, e]
    }
    function Oy(e, t) {
        e.action = t
    }
    function Uf(e) {
        var t = qe()
          , n = Oe;
        if (n !== null)
            return jf(t, n, e);
        qe(),
        t = t.memoizedState,
        n = qe();
        var a = n.queue.dispatch;
        return n.memoizedState = e,
        [t, a, !1]
    }
    function Ta(e, t, n, a) {
        return e = {
            tag: e,
            create: n,
            deps: a,
            inst: t,
            next: null
        },
        t = re.updateQueue,
        t === null && (t = ji(),
        re.updateQueue = t),
        n = t.lastEffect,
        n === null ? t.lastEffect = e.next = e : (a = n.next,
        n.next = e,
        e.next = a,
        t.lastEffect = e),
        e
    }
    function Bf() {
        return qe().memoizedState
    }
    function Hi(e, t, n, a) {
        var i = at();
        re.flags |= e,
        i.memoizedState = Ta(1 | t, {
            destroy: void 0
        }, n, a === void 0 ? null : a)
    }
    function qi(e, t, n, a) {
        var i = qe();
        a = a === void 0 ? null : a;
        var o = i.memoizedState.inst;
        Oe !== null && a !== null && Gr(a, Oe.memoizedState.deps) ? i.memoizedState = Ta(t, o, n, a) : (re.flags |= e,
        i.memoizedState = Ta(1 | t, o, n, a))
    }
    function Hf(e, t) {
        Hi(8390656, 8, e, t)
    }
    function $r(e, t) {
        qi(2048, 8, e, t)
    }
    function Ry(e) {
        re.flags |= 4;
        var t = re.updateQueue;
        if (t === null)
            t = ji(),
            re.updateQueue = t,
            t.events = [e];
        else {
            var n = t.events;
            n === null ? t.events = [e] : n.push(e)
        }
    }
    function qf(e) {
        var t = qe().memoizedState;
        return Ry({
            ref: t,
            nextImpl: e
        }),
        function() {
            if ((Ee & 2) !== 0)
                throw Error(u(440));
            return t.impl.apply(void 0, arguments)
        }
    }
    function Gf(e, t) {
        return qi(4, 2, e, t)
    }
    function Yf(e, t) {
        return qi(4, 4, e, t)
    }
    function Vf(e, t) {
        if (typeof t == "function") {
            e = e();
            var n = t(e);
            return function() {
                typeof n == "function" ? n() : t(null)
            }
        }
        if (t != null)
            return e = e(),
            t.current = e,
            function() {
                t.current = null
            }
    }
    function kf(e, t, n) {
        n = n != null ? n.concat([e]) : null,
        qi(4, 4, Vf.bind(null, t, e), n)
    }
    function Wr() {}
    function Qf(e, t) {
        var n = qe();
        t = t === void 0 ? null : t;
        var a = n.memoizedState;
        return t !== null && Gr(t, a[1]) ? a[0] : (n.memoizedState = [e, t],
        e)
    }
    function Xf(e, t) {
        var n = qe();
        t = t === void 0 ? null : t;
        var a = n.memoizedState;
        if (t !== null && Gr(t, a[1]))
            return a[0];
        if (a = e(),
        In) {
            dn(!0);
            try {
                e()
            } finally {
                dn(!1)
            }
        }
        return n.memoizedState = [a, t],
        a
    }
    function Ir(e, t, n) {
        return n === void 0 || (Wt & 1073741824) !== 0 && (ge & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n,
        e = Fd(),
        re.lanes |= e,
        An |= e,
        n)
    }
    function Ff(e, t, n, a) {
        return mt(n, t) ? n : Ca.current !== null ? (e = Ir(e, n, a),
        mt(e, t) || (Ve = !0),
        e) : (Wt & 42) === 0 || (Wt & 1073741824) !== 0 && (ge & 261930) === 0 ? (Ve = !0,
        e.memoizedState = n) : (e = Fd(),
        re.lanes |= e,
        An |= e,
        t)
    }
    function Zf(e, t, n, a, i) {
        var o = Q.p;
        Q.p = o !== 0 && 8 > o ? o : 8;
        var h = U.T
          , y = {};
        U.T = y,
        tu(e, !1, t, n);
        try {
            var _ = i()
              , z = U.S;
            if (z !== null && z(y, _),
            _ !== null && typeof _ == "object" && typeof _.then == "function") {
                var B = Cy(_, a);
                bl(e, t, B, xt(e))
            } else
                bl(e, t, a, xt(e))
        } catch (Y) {
            bl(e, t, {
                then: function() {},
                status: "rejected",
                reason: Y
            }, xt())
        } finally {
            Q.p = o,
            h !== null && y.types !== null && (h.types = y.types),
            U.T = h
        }
    }
    function Ny() {}
    function Pr(e, t, n, a) {
        if (e.tag !== 5)
            throw Error(u(476));
        var i = Kf(e).queue;
        Zf(e, i, t, te, n === null ? Ny : function() {
            return Jf(e),
            n(a)
        }
        )
    }
    function Kf(e) {
        var t = e.memoizedState;
        if (t !== null)
            return t;
        t = {
            memoizedState: te,
            baseState: te,
            baseQueue: null,
            queue: {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: It,
                lastRenderedState: te
            },
            next: null
        };
        var n = {};
        return t.next = {
            memoizedState: n,
            baseState: n,
            baseQueue: null,
            queue: {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: It,
                lastRenderedState: n
            },
            next: null
        },
        e.memoizedState = t,
        e = e.alternate,
        e !== null && (e.memoizedState = t),
        t
    }
    function Jf(e) {
        var t = Kf(e);
        t.next === null && (t = e.alternate.memoizedState),
        bl(e, t.next.queue, {}, xt())
    }
    function eu() {
        return We(Ul)
    }
    function $f() {
        return qe().memoizedState
    }
    function Wf() {
        return qe().memoizedState
    }
    function zy(e) {
        for (var t = e.return; t !== null; ) {
            switch (t.tag) {
            case 24:
            case 3:
                var n = xt();
                e = xn(n);
                var a = Sn(t, e, n);
                a !== null && (ct(a, t, n),
                ml(a, t, n)),
                t = {
                    cache: Rr()
                },
                e.payload = t;
                return
            }
            t = t.return
        }
    }
    function Ly(e, t, n) {
        var a = xt();
        n = {
            lane: a,
            revertLane: 0,
            gesture: null,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        },
        Gi(e) ? Pf(t, n) : (n = vr(e, t, n, a),
        n !== null && (ct(n, e, a),
        ed(n, t, a)))
    }
    function If(e, t, n) {
        var a = xt();
        bl(e, t, n, a)
    }
    function bl(e, t, n, a) {
        var i = {
            lane: a,
            revertLane: 0,
            gesture: null,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        };
        if (Gi(e))
            Pf(t, i);
        else {
            var o = e.alternate;
            if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer,
            o !== null))
                try {
                    var h = t.lastRenderedState
                      , y = o(h, n);
                    if (i.hasEagerState = !0,
                    i.eagerState = y,
                    mt(y, h))
                        return xi(e, t, i, 0),
                        ze === null && bi(),
                        !1
                } catch {}
            if (n = vr(e, t, i, a),
            n !== null)
                return ct(n, e, a),
                ed(n, t, a),
                !0
        }
        return !1
    }
    function tu(e, t, n, a) {
        if (a = {
            lane: 2,
            revertLane: Mu(),
            gesture: null,
            action: a,
            hasEagerState: !1,
            eagerState: null,
            next: null
        },
        Gi(e)) {
            if (t)
                throw Error(u(479))
        } else
            t = vr(e, n, a, 2),
            t !== null && ct(t, e, 2)
    }
    function Gi(e) {
        var t = e.alternate;
        return e === re || t !== null && t === re
    }
    function Pf(e, t) {
        _a = Mi = !0;
        var n = e.pending;
        n === null ? t.next = t : (t.next = n.next,
        n.next = t),
        e.pending = t
    }
    function ed(e, t, n) {
        if ((n & 4194048) !== 0) {
            var a = t.lanes;
            a &= e.pendingLanes,
            n |= a,
            t.lanes = n,
            lc(e, n)
        }
    }
    var xl = {
        readContext: We,
        use: Ui,
        useCallback: je,
        useContext: je,
        useEffect: je,
        useImperativeHandle: je,
        useLayoutEffect: je,
        useInsertionEffect: je,
        useMemo: je,
        useReducer: je,
        useRef: je,
        useState: je,
        useDebugValue: je,
        useDeferredValue: je,
        useTransition: je,
        useSyncExternalStore: je,
        useId: je,
        useHostTransitionStatus: je,
        useFormState: je,
        useActionState: je,
        useOptimistic: je,
        useMemoCache: je,
        useCacheRefresh: je
    };
    xl.useEffectEvent = je;
    var td = {
        readContext: We,
        use: Ui,
        useCallback: function(e, t) {
            return at().memoizedState = [e, t === void 0 ? null : t],
            e
        },
        useContext: We,
        useEffect: Hf,
        useImperativeHandle: function(e, t, n) {
            n = n != null ? n.concat([e]) : null,
            Hi(4194308, 4, Vf.bind(null, t, e), n)
        },
        useLayoutEffect: function(e, t) {
            return Hi(4194308, 4, e, t)
        },
        useInsertionEffect: function(e, t) {
            Hi(4, 2, e, t)
        },
        useMemo: function(e, t) {
            var n = at();
            t = t === void 0 ? null : t;
            var a = e();
            if (In) {
                dn(!0);
                try {
                    e()
                } finally {
                    dn(!1)
                }
            }
            return n.memoizedState = [a, t],
            a
        },
        useReducer: function(e, t, n) {
            var a = at();
            if (n !== void 0) {
                var i = n(t);
                if (In) {
                    dn(!0);
                    try {
                        n(t)
                    } finally {
                        dn(!1)
                    }
                }
            } else
                i = t;
            return a.memoizedState = a.baseState = i,
            e = {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: e,
                lastRenderedState: i
            },
            a.queue = e,
            e = e.dispatch = Ly.bind(null, re, e),
            [a.memoizedState, e]
        },
        useRef: function(e) {
            var t = at();
            return e = {
                current: e
            },
            t.memoizedState = e
        },
        useState: function(e) {
            e = Kr(e);
            var t = e.queue
              , n = If.bind(null, re, t);
            return t.dispatch = n,
            [e.memoizedState, n]
        },
        useDebugValue: Wr,
        useDeferredValue: function(e, t) {
            var n = at();
            return Ir(n, e, t)
        },
        useTransition: function() {
            var e = Kr(!1);
            return e = Zf.bind(null, re, e.queue, !0, !1),
            at().memoizedState = e,
            [!1, e]
        },
        useSyncExternalStore: function(e, t, n) {
            var a = re
              , i = at();
            if (ve) {
                if (n === void 0)
                    throw Error(u(407));
                n = n()
            } else {
                if (n = t(),
                ze === null)
                    throw Error(u(349));
                (ge & 127) !== 0 || Ef(a, t, n)
            }
            i.memoizedState = n;
            var o = {
                value: n,
                getSnapshot: t
            };
            return i.queue = o,
            Hf(Cf.bind(null, a, o, e), [e]),
            a.flags |= 2048,
            Ta(9, {
                destroy: void 0
            }, wf.bind(null, a, o, n, t), null),
            n
        },
        useId: function() {
            var e = at()
              , t = ze.identifierPrefix;
            if (ve) {
                var n = Bt
                  , a = Ut;
                n = (a & ~(1 << 32 - ht(a) - 1)).toString(32) + n,
                t = "_" + t + "R_" + n,
                n = Di++,
                0 < n && (t += "H" + n.toString(32)),
                t += "_"
            } else
                n = _y++,
                t = "_" + t + "r_" + n.toString(32) + "_";
            return e.memoizedState = t
        },
        useHostTransitionStatus: eu,
        useFormState: Mf,
        useActionState: Mf,
        useOptimistic: function(e) {
            var t = at();
            t.memoizedState = t.baseState = e;
            var n = {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: null,
                lastRenderedState: null
            };
            return t.queue = n,
            t = tu.bind(null, re, !0, n),
            n.dispatch = t,
            [e, t]
        },
        useMemoCache: Xr,
        useCacheRefresh: function() {
            return at().memoizedState = zy.bind(null, re)
        },
        useEffectEvent: function(e) {
            var t = at()
              , n = {
                impl: e
            };
            return t.memoizedState = n,
            function() {
                if ((Ee & 2) !== 0)
                    throw Error(u(440));
                return n.impl.apply(void 0, arguments)
            }
        }
    }
      , nu = {
        readContext: We,
        use: Ui,
        useCallback: Qf,
        useContext: We,
        useEffect: $r,
        useImperativeHandle: kf,
        useInsertionEffect: Gf,
        useLayoutEffect: Yf,
        useMemo: Xf,
        useReducer: Bi,
        useRef: Bf,
        useState: function() {
            return Bi(It)
        },
        useDebugValue: Wr,
        useDeferredValue: function(e, t) {
            var n = qe();
            return Ff(n, Oe.memoizedState, e, t)
        },
        useTransition: function() {
            var e = Bi(It)[0]
              , t = qe().memoizedState;
            return [typeof e == "boolean" ? e : vl(e), t]
        },
        useSyncExternalStore: Sf,
        useId: $f,
        useHostTransitionStatus: eu,
        useFormState: Df,
        useActionState: Df,
        useOptimistic: function(e, t) {
            var n = qe();
            return Tf(n, Oe, e, t)
        },
        useMemoCache: Xr,
        useCacheRefresh: Wf
    };
    nu.useEffectEvent = qf;
    var nd = {
        readContext: We,
        use: Ui,
        useCallback: Qf,
        useContext: We,
        useEffect: $r,
        useImperativeHandle: kf,
        useInsertionEffect: Gf,
        useLayoutEffect: Yf,
        useMemo: Xf,
        useReducer: Zr,
        useRef: Bf,
        useState: function() {
            return Zr(It)
        },
        useDebugValue: Wr,
        useDeferredValue: function(e, t) {
            var n = qe();
            return Oe === null ? Ir(n, e, t) : Ff(n, Oe.memoizedState, e, t)
        },
        useTransition: function() {
            var e = Zr(It)[0]
              , t = qe().memoizedState;
            return [typeof e == "boolean" ? e : vl(e), t]
        },
        useSyncExternalStore: Sf,
        useId: $f,
        useHostTransitionStatus: eu,
        useFormState: Uf,
        useActionState: Uf,
        useOptimistic: function(e, t) {
            var n = qe();
            return Oe !== null ? Tf(n, Oe, e, t) : (n.baseState = e,
            [e, n.queue.dispatch])
        },
        useMemoCache: Xr,
        useCacheRefresh: Wf
    };
    nd.useEffectEvent = qf;
    function au(e, t, n, a) {
        t = e.memoizedState,
        n = n(a, t),
        n = n == null ? t : v({}, t, n),
        e.memoizedState = n,
        e.lanes === 0 && (e.updateQueue.baseState = n)
    }
    var lu = {
        enqueueSetState: function(e, t, n) {
            e = e._reactInternals;
            var a = xt()
              , i = xn(a);
            i.payload = t,
            n != null && (i.callback = n),
            t = Sn(e, i, a),
            t !== null && (ct(t, e, a),
            ml(t, e, a))
        },
        enqueueReplaceState: function(e, t, n) {
            e = e._reactInternals;
            var a = xt()
              , i = xn(a);
            i.tag = 1,
            i.payload = t,
            n != null && (i.callback = n),
            t = Sn(e, i, a),
            t !== null && (ct(t, e, a),
            ml(t, e, a))
        },
        enqueueForceUpdate: function(e, t) {
            e = e._reactInternals;
            var n = xt()
              , a = xn(n);
            a.tag = 2,
            t != null && (a.callback = t),
            t = Sn(e, a, n),
            t !== null && (ct(t, e, n),
            ml(t, e, n))
        }
    };
    function ad(e, t, n, a, i, o, h) {
        return e = e.stateNode,
        typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(a, o, h) : t.prototype && t.prototype.isPureReactComponent ? !sl(n, a) || !sl(i, o) : !0
    }
    function ld(e, t, n, a) {
        e = t.state,
        typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, a),
        typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, a),
        t.state !== e && lu.enqueueReplaceState(t, t.state, null)
    }
    function Pn(e, t) {
        var n = t;
        if ("ref"in t) {
            n = {};
            for (var a in t)
                a !== "ref" && (n[a] = t[a])
        }
        if (e = e.defaultProps) {
            n === t && (n = v({}, n));
            for (var i in e)
                n[i] === void 0 && (n[i] = e[i])
        }
        return n
    }
    function id(e) {
        vi(e)
    }
    function sd(e) {
        console.error(e)
    }
    function rd(e) {
        vi(e)
    }
    function Yi(e, t) {
        try {
            var n = e.onUncaughtError;
            n(t.value, {
                componentStack: t.stack
            })
        } catch (a) {
            setTimeout(function() {
                throw a
            })
        }
    }
    function ud(e, t, n) {
        try {
            var a = e.onCaughtError;
            a(n.value, {
                componentStack: n.stack,
                errorBoundary: t.tag === 1 ? t.stateNode : null
            })
        } catch (i) {
            setTimeout(function() {
                throw i
            })
        }
    }
    function iu(e, t, n) {
        return n = xn(n),
        n.tag = 3,
        n.payload = {
            element: null
        },
        n.callback = function() {
            Yi(e, t)
        }
        ,
        n
    }
    function od(e) {
        return e = xn(e),
        e.tag = 3,
        e
    }
    function cd(e, t, n, a) {
        var i = n.type.getDerivedStateFromError;
        if (typeof i == "function") {
            var o = a.value;
            e.payload = function() {
                return i(o)
            }
            ,
            e.callback = function() {
                ud(t, n, a)
            }
        }
        var h = n.stateNode;
        h !== null && typeof h.componentDidCatch == "function" && (e.callback = function() {
            ud(t, n, a),
            typeof i != "function" && (Tn === null ? Tn = new Set([this]) : Tn.add(this));
            var y = a.stack;
            this.componentDidCatch(a.value, {
                componentStack: y !== null ? y : ""
            })
        }
        )
    }
    function My(e, t, n, a, i) {
        if (n.flags |= 32768,
        a !== null && typeof a == "object" && typeof a.then == "function") {
            if (t = n.alternate,
            t !== null && ba(t, n, i, !0),
            n = pt.current,
            n !== null) {
                switch (n.tag) {
                case 31:
                case 13:
                    return Ot === null ? Pi() : n.alternate === null && Ue === 0 && (Ue = 3),
                    n.flags &= -257,
                    n.flags |= 65536,
                    n.lanes = i,
                    a === Oi ? n.flags |= 16384 : (t = n.updateQueue,
                    t === null ? n.updateQueue = new Set([a]) : t.add(a),
                    Nu(e, a, i)),
                    !1;
                case 22:
                    return n.flags |= 65536,
                    a === Oi ? n.flags |= 16384 : (t = n.updateQueue,
                    t === null ? (t = {
                        transitions: null,
                        markerInstances: null,
                        retryQueue: new Set([a])
                    },
                    n.updateQueue = t) : (n = t.retryQueue,
                    n === null ? t.retryQueue = new Set([a]) : n.add(a)),
                    Nu(e, a, i)),
                    !1
                }
                throw Error(u(435, n.tag))
            }
            return Nu(e, a, i),
            Pi(),
            !1
        }
        if (ve)
            return t = pt.current,
            t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256),
            t.flags |= 65536,
            t.lanes = i,
            a !== Cr && (e = Error(u(422), {
                cause: a
            }),
            ol(Ct(e, n)))) : (a !== Cr && (t = Error(u(423), {
                cause: a
            }),
            ol(Ct(t, n))),
            e = e.current.alternate,
            e.flags |= 65536,
            i &= -i,
            e.lanes |= i,
            a = Ct(a, n),
            i = iu(e.stateNode, a, i),
            jr(e, i),
            Ue !== 4 && (Ue = 2)),
            !1;
        var o = Error(u(520), {
            cause: a
        });
        if (o = Ct(o, n),
        Ol === null ? Ol = [o] : Ol.push(o),
        Ue !== 4 && (Ue = 2),
        t === null)
            return !0;
        a = Ct(a, n),
        n = t;
        do {
            switch (n.tag) {
            case 3:
                return n.flags |= 65536,
                e = i & -i,
                n.lanes |= e,
                e = iu(n.stateNode, a, e),
                jr(n, e),
                !1;
            case 1:
                if (t = n.type,
                o = n.stateNode,
                (n.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (Tn === null || !Tn.has(o))))
                    return n.flags |= 65536,
                    i &= -i,
                    n.lanes |= i,
                    i = od(i),
                    cd(i, e, n, a),
                    jr(n, i),
                    !1
            }
            n = n.return
        } while (n !== null);
        return !1
    }
    var su = Error(u(461))
      , Ve = !1;
    function Ie(e, t, n, a) {
        t.child = e === null ? mf(t, null, n, a) : Wn(t, e.child, n, a)
    }
    function fd(e, t, n, a, i) {
        n = n.render;
        var o = t.ref;
        if ("ref"in a) {
            var h = {};
            for (var y in a)
                y !== "ref" && (h[y] = a[y])
        } else
            h = a;
        return Zn(t),
        a = Yr(e, t, n, h, o, i),
        y = Vr(),
        e !== null && !Ve ? (kr(e, t, i),
        Pt(e, t, i)) : (ve && y && Er(t),
        t.flags |= 1,
        Ie(e, t, a, i),
        t.child)
    }
    function dd(e, t, n, a, i) {
        if (e === null) {
            var o = n.type;
            return typeof o == "function" && !br(o) && o.defaultProps === void 0 && n.compare === null ? (t.tag = 15,
            t.type = o,
            hd(e, t, o, a, i)) : (e = Ei(n.type, null, a, t, t.mode, i),
            e.ref = t.ref,
            e.return = t,
            t.child = e)
        }
        if (o = e.child,
        !mu(e, i)) {
            var h = o.memoizedProps;
            if (n = n.compare,
            n = n !== null ? n : sl,
            n(h, a) && e.ref === t.ref)
                return Pt(e, t, i)
        }
        return t.flags |= 1,
        e = Zt(o, a),
        e.ref = t.ref,
        e.return = t,
        t.child = e
    }
    function hd(e, t, n, a, i) {
        if (e !== null) {
            var o = e.memoizedProps;
            if (sl(o, a) && e.ref === t.ref)
                if (Ve = !1,
                t.pendingProps = a = o,
                mu(e, i))
                    (e.flags & 131072) !== 0 && (Ve = !0);
                else
                    return t.lanes = e.lanes,
                    Pt(e, t, i)
        }
        return ru(e, t, n, a, i)
    }
    function md(e, t, n, a) {
        var i = a.children
          , o = e !== null ? e.memoizedState : null;
        if (e === null && t.stateNode === null && (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null
        }),
        a.mode === "hidden") {
            if ((t.flags & 128) !== 0) {
                if (o = o !== null ? o.baseLanes | n : n,
                e !== null) {
                    for (a = t.child = e.child,
                    i = 0; a !== null; )
                        i = i | a.lanes | a.childLanes,
                        a = a.sibling;
                    a = i & ~o
                } else
                    a = 0,
                    t.child = null;
                return gd(e, t, o, n, a)
            }
            if ((n & 536870912) !== 0)
                t.memoizedState = {
                    baseLanes: 0,
                    cachePool: null
                },
                e !== null && Ai(t, o !== null ? o.cachePool : null),
                o !== null ? yf(t, o) : Br(),
                vf(t);
            else
                return a = t.lanes = 536870912,
                gd(e, t, o !== null ? o.baseLanes | n : n, n, a)
        } else
            o !== null ? (Ai(t, o.cachePool),
            yf(t, o),
            wn(),
            t.memoizedState = null) : (e !== null && Ai(t, null),
            Br(),
            wn());
        return Ie(e, t, i, n),
        t.child
    }
    function Sl(e, t) {
        return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null
        }),
        t.sibling
    }
    function gd(e, t, n, a, i) {
        var o = zr();
        return o = o === null ? null : {
            parent: Ge._currentValue,
            pool: o
        },
        t.memoizedState = {
            baseLanes: n,
            cachePool: o
        },
        e !== null && Ai(t, null),
        Br(),
        vf(t),
        e !== null && ba(e, t, a, !0),
        t.childLanes = i,
        null
    }
    function Vi(e, t) {
        return t = Qi({
            mode: t.mode,
            children: t.children
        }, e.mode),
        t.ref = e.ref,
        e.child = t,
        t.return = e,
        t
    }
    function pd(e, t, n) {
        return Wn(t, e.child, null, n),
        e = Vi(t, t.pendingProps),
        e.flags |= 2,
        yt(t),
        t.memoizedState = null,
        e
    }
    function Dy(e, t, n) {
        var a = t.pendingProps
          , i = (t.flags & 128) !== 0;
        if (t.flags &= -129,
        e === null) {
            if (ve) {
                if (a.mode === "hidden")
                    return e = Vi(t, a),
                    t.lanes = 536870912,
                    Sl(null, e);
                if (qr(t),
                (e = Le) ? (e = Oh(e, Tt),
                e = e !== null && e.data === "&" ? e : null,
                e !== null && (t.memoizedState = {
                    dehydrated: e,
                    treeContext: gn !== null ? {
                        id: Ut,
                        overflow: Bt
                    } : null,
                    retryLane: 536870912,
                    hydrationErrors: null
                },
                n = Ic(e),
                n.return = t,
                t.child = n,
                $e = t,
                Le = null)) : e = null,
                e === null)
                    throw yn(t);
                return t.lanes = 536870912,
                null
            }
            return Vi(t, a)
        }
        var o = e.memoizedState;
        if (o !== null) {
            var h = o.dehydrated;
            if (qr(t),
            i)
                if (t.flags & 256)
                    t.flags &= -257,
                    t = pd(e, t, n);
                else if (t.memoizedState !== null)
                    t.child = e.child,
                    t.flags |= 128,
                    t = null;
                else
                    throw Error(u(558));
            else if (Ve || ba(e, t, n, !1),
            i = (n & e.childLanes) !== 0,
            Ve || i) {
                if (a = ze,
                a !== null && (h = ic(a, n),
                h !== 0 && h !== o.retryLane))
                    throw o.retryLane = h,
                    kn(e, h),
                    ct(a, e, h),
                    su;
                Pi(),
                t = pd(e, t, n)
            } else
                e = o.treeContext,
                Le = Rt(h.nextSibling),
                $e = t,
                ve = !0,
                pn = null,
                Tt = !1,
                e !== null && tf(t, e),
                t = Vi(t, a),
                t.flags |= 4096;
            return t
        }
        return e = Zt(e.child, {
            mode: a.mode,
            children: a.children
        }),
        e.ref = t.ref,
        t.child = e,
        e.return = t,
        e
    }
    function ki(e, t) {
        var n = t.ref;
        if (n === null)
            e !== null && e.ref !== null && (t.flags |= 4194816);
        else {
            if (typeof n != "function" && typeof n != "object")
                throw Error(u(284));
            (e === null || e.ref !== n) && (t.flags |= 4194816)
        }
    }
    function ru(e, t, n, a, i) {
        return Zn(t),
        n = Yr(e, t, n, a, void 0, i),
        a = Vr(),
        e !== null && !Ve ? (kr(e, t, i),
        Pt(e, t, i)) : (ve && a && Er(t),
        t.flags |= 1,
        Ie(e, t, n, i),
        t.child)
    }
    function yd(e, t, n, a, i, o) {
        return Zn(t),
        t.updateQueue = null,
        n = xf(t, a, n, i),
        bf(e),
        a = Vr(),
        e !== null && !Ve ? (kr(e, t, o),
        Pt(e, t, o)) : (ve && a && Er(t),
        t.flags |= 1,
        Ie(e, t, n, o),
        t.child)
    }
    function vd(e, t, n, a, i) {
        if (Zn(t),
        t.stateNode === null) {
            var o = ga
              , h = n.contextType;
            typeof h == "object" && h !== null && (o = We(h)),
            o = new n(a,o),
            t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null,
            o.updater = lu,
            t.stateNode = o,
            o._reactInternals = t,
            o = t.stateNode,
            o.props = a,
            o.state = t.memoizedState,
            o.refs = {},
            Mr(t),
            h = n.contextType,
            o.context = typeof h == "object" && h !== null ? We(h) : ga,
            o.state = t.memoizedState,
            h = n.getDerivedStateFromProps,
            typeof h == "function" && (au(t, n, h, a),
            o.state = t.memoizedState),
            typeof n.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (h = o.state,
            typeof o.componentWillMount == "function" && o.componentWillMount(),
            typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(),
            h !== o.state && lu.enqueueReplaceState(o, o.state, null),
            pl(t, a, o, i),
            gl(),
            o.state = t.memoizedState),
            typeof o.componentDidMount == "function" && (t.flags |= 4194308),
            a = !0
        } else if (e === null) {
            o = t.stateNode;
            var y = t.memoizedProps
              , _ = Pn(n, y);
            o.props = _;
            var z = o.context
              , B = n.contextType;
            h = ga,
            typeof B == "object" && B !== null && (h = We(B));
            var Y = n.getDerivedStateFromProps;
            B = typeof Y == "function" || typeof o.getSnapshotBeforeUpdate == "function",
            y = t.pendingProps !== y,
            B || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (y || z !== h) && ld(t, o, a, h),
            bn = !1;
            var L = t.memoizedState;
            o.state = L,
            pl(t, a, o, i),
            gl(),
            z = t.memoizedState,
            y || L !== z || bn ? (typeof Y == "function" && (au(t, n, Y, a),
            z = t.memoizedState),
            (_ = bn || ad(t, n, _, a, L, z, h)) ? (B || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(),
            typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()),
            typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308),
            t.memoizedProps = a,
            t.memoizedState = z),
            o.props = a,
            o.state = z,
            o.context = h,
            a = _) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308),
            a = !1)
        } else {
            o = t.stateNode,
            Dr(e, t),
            h = t.memoizedProps,
            B = Pn(n, h),
            o.props = B,
            Y = t.pendingProps,
            L = o.context,
            z = n.contextType,
            _ = ga,
            typeof z == "object" && z !== null && (_ = We(z)),
            y = n.getDerivedStateFromProps,
            (z = typeof y == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (h !== Y || L !== _) && ld(t, o, a, _),
            bn = !1,
            L = t.memoizedState,
            o.state = L,
            pl(t, a, o, i),
            gl();
            var D = t.memoizedState;
            h !== Y || L !== D || bn || e !== null && e.dependencies !== null && Ci(e.dependencies) ? (typeof y == "function" && (au(t, n, y, a),
            D = t.memoizedState),
            (B = bn || ad(t, n, B, a, L, D, _) || e !== null && e.dependencies !== null && Ci(e.dependencies)) ? (z || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(a, D, _),
            typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(a, D, _)),
            typeof o.componentDidUpdate == "function" && (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || h === e.memoizedProps && L === e.memoizedState || (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && L === e.memoizedState || (t.flags |= 1024),
            t.memoizedProps = a,
            t.memoizedState = D),
            o.props = a,
            o.state = D,
            o.context = _,
            a = B) : (typeof o.componentDidUpdate != "function" || h === e.memoizedProps && L === e.memoizedState || (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && L === e.memoizedState || (t.flags |= 1024),
            a = !1)
        }
        return o = a,
        ki(e, t),
        a = (t.flags & 128) !== 0,
        o || a ? (o = t.stateNode,
        n = a && typeof n.getDerivedStateFromError != "function" ? null : o.render(),
        t.flags |= 1,
        e !== null && a ? (t.child = Wn(t, e.child, null, i),
        t.child = Wn(t, null, n, i)) : Ie(e, t, n, i),
        t.memoizedState = o.state,
        e = t.child) : e = Pt(e, t, i),
        e
    }
    function bd(e, t, n, a) {
        return Xn(),
        t.flags |= 256,
        Ie(e, t, n, a),
        t.child
    }
    var uu = {
        dehydrated: null,
        treeContext: null,
        retryLane: 0,
        hydrationErrors: null
    };
    function ou(e) {
        return {
            baseLanes: e,
            cachePool: uf()
        }
    }
    function cu(e, t, n) {
        return e = e !== null ? e.childLanes & ~n : 0,
        t && (e |= bt),
        e
    }
    function xd(e, t, n) {
        var a = t.pendingProps, i = !1, o = (t.flags & 128) !== 0, h;
        if ((h = o) || (h = e !== null && e.memoizedState === null ? !1 : (He.current & 2) !== 0),
        h && (i = !0,
        t.flags &= -129),
        h = (t.flags & 32) !== 0,
        t.flags &= -33,
        e === null) {
            if (ve) {
                if (i ? En(t) : wn(),
                (e = Le) ? (e = Oh(e, Tt),
                e = e !== null && e.data !== "&" ? e : null,
                e !== null && (t.memoizedState = {
                    dehydrated: e,
                    treeContext: gn !== null ? {
                        id: Ut,
                        overflow: Bt
                    } : null,
                    retryLane: 536870912,
                    hydrationErrors: null
                },
                n = Ic(e),
                n.return = t,
                t.child = n,
                $e = t,
                Le = null)) : e = null,
                e === null)
                    throw yn(t);
                return Fu(e) ? t.lanes = 32 : t.lanes = 536870912,
                null
            }
            var y = a.children;
            return a = a.fallback,
            i ? (wn(),
            i = t.mode,
            y = Qi({
                mode: "hidden",
                children: y
            }, i),
            a = Qn(a, i, n, null),
            y.return = t,
            a.return = t,
            y.sibling = a,
            t.child = y,
            a = t.child,
            a.memoizedState = ou(n),
            a.childLanes = cu(e, h, n),
            t.memoizedState = uu,
            Sl(null, a)) : (En(t),
            fu(t, y))
        }
        var _ = e.memoizedState;
        if (_ !== null && (y = _.dehydrated,
        y !== null)) {
            if (o)
                t.flags & 256 ? (En(t),
                t.flags &= -257,
                t = du(e, t, n)) : t.memoizedState !== null ? (wn(),
                t.child = e.child,
                t.flags |= 128,
                t = null) : (wn(),
                y = a.fallback,
                i = t.mode,
                a = Qi({
                    mode: "visible",
                    children: a.children
                }, i),
                y = Qn(y, i, n, null),
                y.flags |= 2,
                a.return = t,
                y.return = t,
                a.sibling = y,
                t.child = a,
                Wn(t, e.child, null, n),
                a = t.child,
                a.memoizedState = ou(n),
                a.childLanes = cu(e, h, n),
                t.memoizedState = uu,
                t = Sl(null, a));
            else if (En(t),
            Fu(y)) {
                if (h = y.nextSibling && y.nextSibling.dataset,
                h)
                    var z = h.dgst;
                h = z,
                a = Error(u(419)),
                a.stack = "",
                a.digest = h,
                ol({
                    value: a,
                    source: null,
                    stack: null
                }),
                t = du(e, t, n)
            } else if (Ve || ba(e, t, n, !1),
            h = (n & e.childLanes) !== 0,
            Ve || h) {
                if (h = ze,
                h !== null && (a = ic(h, n),
                a !== 0 && a !== _.retryLane))
                    throw _.retryLane = a,
                    kn(e, a),
                    ct(h, e, a),
                    su;
                Xu(y) || Pi(),
                t = du(e, t, n)
            } else
                Xu(y) ? (t.flags |= 192,
                t.child = e.child,
                t = null) : (e = _.treeContext,
                Le = Rt(y.nextSibling),
                $e = t,
                ve = !0,
                pn = null,
                Tt = !1,
                e !== null && tf(t, e),
                t = fu(t, a.children),
                t.flags |= 4096);
            return t
        }
        return i ? (wn(),
        y = a.fallback,
        i = t.mode,
        _ = e.child,
        z = _.sibling,
        a = Zt(_, {
            mode: "hidden",
            children: a.children
        }),
        a.subtreeFlags = _.subtreeFlags & 65011712,
        z !== null ? y = Zt(z, y) : (y = Qn(y, i, n, null),
        y.flags |= 2),
        y.return = t,
        a.return = t,
        a.sibling = y,
        t.child = a,
        Sl(null, a),
        a = t.child,
        y = e.child.memoizedState,
        y === null ? y = ou(n) : (i = y.cachePool,
        i !== null ? (_ = Ge._currentValue,
        i = i.parent !== _ ? {
            parent: _,
            pool: _
        } : i) : i = uf(),
        y = {
            baseLanes: y.baseLanes | n,
            cachePool: i
        }),
        a.memoizedState = y,
        a.childLanes = cu(e, h, n),
        t.memoizedState = uu,
        Sl(e.child, a)) : (En(t),
        n = e.child,
        e = n.sibling,
        n = Zt(n, {
            mode: "visible",
            children: a.children
        }),
        n.return = t,
        n.sibling = null,
        e !== null && (h = t.deletions,
        h === null ? (t.deletions = [e],
        t.flags |= 16) : h.push(e)),
        t.child = n,
        t.memoizedState = null,
        n)
    }
    function fu(e, t) {
        return t = Qi({
            mode: "visible",
            children: t
        }, e.mode),
        t.return = e,
        e.child = t
    }
    function Qi(e, t) {
        return e = gt(22, e, null, t),
        e.lanes = 0,
        e
    }
    function du(e, t, n) {
        return Wn(t, e.child, null, n),
        e = fu(t, t.pendingProps.children),
        e.flags |= 2,
        t.memoizedState = null,
        e
    }
    function Sd(e, t, n) {
        e.lanes |= t;
        var a = e.alternate;
        a !== null && (a.lanes |= t),
        Tr(e.return, t, n)
    }
    function hu(e, t, n, a, i, o) {
        var h = e.memoizedState;
        h === null ? e.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: a,
            tail: n,
            tailMode: i,
            treeForkCount: o
        } : (h.isBackwards = t,
        h.rendering = null,
        h.renderingStartTime = 0,
        h.last = a,
        h.tail = n,
        h.tailMode = i,
        h.treeForkCount = o)
    }
    function Ed(e, t, n) {
        var a = t.pendingProps
          , i = a.revealOrder
          , o = a.tail;
        a = a.children;
        var h = He.current
          , y = (h & 2) !== 0;
        if (y ? (h = h & 1 | 2,
        t.flags |= 128) : h &= 1,
        F(He, h),
        Ie(e, t, a, n),
        a = ve ? ul : 0,
        !y && e !== null && (e.flags & 128) !== 0)
            e: for (e = t.child; e !== null; ) {
                if (e.tag === 13)
                    e.memoizedState !== null && Sd(e, n, t);
                else if (e.tag === 19)
                    Sd(e, n, t);
                else if (e.child !== null) {
                    e.child.return = e,
                    e = e.child;
                    continue
                }
                if (e === t)
                    break e;
                for (; e.sibling === null; ) {
                    if (e.return === null || e.return === t)
                        break e;
                    e = e.return
                }
                e.sibling.return = e.return,
                e = e.sibling
            }
        switch (i) {
        case "forwards":
            for (n = t.child,
            i = null; n !== null; )
                e = n.alternate,
                e !== null && Li(e) === null && (i = n),
                n = n.sibling;
            n = i,
            n === null ? (i = t.child,
            t.child = null) : (i = n.sibling,
            n.sibling = null),
            hu(t, !1, i, n, o, a);
            break;
        case "backwards":
        case "unstable_legacy-backwards":
            for (n = null,
            i = t.child,
            t.child = null; i !== null; ) {
                if (e = i.alternate,
                e !== null && Li(e) === null) {
                    t.child = i;
                    break
                }
                e = i.sibling,
                i.sibling = n,
                n = i,
                i = e
            }
            hu(t, !0, n, null, o, a);
            break;
        case "together":
            hu(t, !1, null, null, void 0, a);
            break;
        default:
            t.memoizedState = null
        }
        return t.child
    }
    function Pt(e, t, n) {
        if (e !== null && (t.dependencies = e.dependencies),
        An |= t.lanes,
        (n & t.childLanes) === 0)
            if (e !== null) {
                if (ba(e, t, n, !1),
                (n & t.childLanes) === 0)
                    return null
            } else
                return null;
        if (e !== null && t.child !== e.child)
            throw Error(u(153));
        if (t.child !== null) {
            for (e = t.child,
            n = Zt(e, e.pendingProps),
            t.child = n,
            n.return = t; e.sibling !== null; )
                e = e.sibling,
                n = n.sibling = Zt(e, e.pendingProps),
                n.return = t;
            n.sibling = null
        }
        return t.child
    }
    function mu(e, t) {
        return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies,
        !!(e !== null && Ci(e)))
    }
    function jy(e, t, n) {
        switch (t.tag) {
        case 3:
            nt(t, t.stateNode.containerInfo),
            vn(t, Ge, e.memoizedState.cache),
            Xn();
            break;
        case 27:
        case 5:
            Za(t);
            break;
        case 4:
            nt(t, t.stateNode.containerInfo);
            break;
        case 10:
            vn(t, t.type, t.memoizedProps.value);
            break;
        case 31:
            if (t.memoizedState !== null)
                return t.flags |= 128,
                qr(t),
                null;
            break;
        case 13:
            var a = t.memoizedState;
            if (a !== null)
                return a.dehydrated !== null ? (En(t),
                t.flags |= 128,
                null) : (n & t.child.childLanes) !== 0 ? xd(e, t, n) : (En(t),
                e = Pt(e, t, n),
                e !== null ? e.sibling : null);
            En(t);
            break;
        case 19:
            var i = (e.flags & 128) !== 0;
            if (a = (n & t.childLanes) !== 0,
            a || (ba(e, t, n, !1),
            a = (n & t.childLanes) !== 0),
            i) {
                if (a)
                    return Ed(e, t, n);
                t.flags |= 128
            }
            if (i = t.memoizedState,
            i !== null && (i.rendering = null,
            i.tail = null,
            i.lastEffect = null),
            F(He, He.current),
            a)
                break;
            return null;
        case 22:
            return t.lanes = 0,
            md(e, t, n, t.pendingProps);
        case 24:
            vn(t, Ge, e.memoizedState.cache)
        }
        return Pt(e, t, n)
    }
    function wd(e, t, n) {
        if (e !== null)
            if (e.memoizedProps !== t.pendingProps)
                Ve = !0;
            else {
                if (!mu(e, n) && (t.flags & 128) === 0)
                    return Ve = !1,
                    jy(e, t, n);
                Ve = (e.flags & 131072) !== 0
            }
        else
            Ve = !1,
            ve && (t.flags & 1048576) !== 0 && ef(t, ul, t.index);
        switch (t.lanes = 0,
        t.tag) {
        case 16:
            e: {
                var a = t.pendingProps;
                if (e = Jn(t.elementType),
                t.type = e,
                typeof e == "function")
                    br(e) ? (a = Pn(e, a),
                    t.tag = 1,
                    t = vd(null, t, e, a, n)) : (t.tag = 0,
                    t = ru(null, t, e, a, n));
                else {
                    if (e != null) {
                        var i = e.$$typeof;
                        if (i === K) {
                            t.tag = 11,
                            t = fd(null, t, e, a, n);
                            break e
                        } else if (i === I) {
                            t.tag = 14,
                            t = dd(null, t, e, a, n);
                            break e
                        }
                    }
                    throw t = oe(e) || e,
                    Error(u(306, t, ""))
                }
            }
            return t;
        case 0:
            return ru(e, t, t.type, t.pendingProps, n);
        case 1:
            return a = t.type,
            i = Pn(a, t.pendingProps),
            vd(e, t, a, i, n);
        case 3:
            e: {
                if (nt(t, t.stateNode.containerInfo),
                e === null)
                    throw Error(u(387));
                a = t.pendingProps;
                var o = t.memoizedState;
                i = o.element,
                Dr(e, t),
                pl(t, a, null, n);
                var h = t.memoizedState;
                if (a = h.cache,
                vn(t, Ge, a),
                a !== o.cache && Or(t, [Ge], n, !0),
                gl(),
                a = h.element,
                o.isDehydrated)
                    if (o = {
                        element: a,
                        isDehydrated: !1,
                        cache: h.cache
                    },
                    t.updateQueue.baseState = o,
                    t.memoizedState = o,
                    t.flags & 256) {
                        t = bd(e, t, a, n);
                        break e
                    } else if (a !== i) {
                        i = Ct(Error(u(424)), t),
                        ol(i),
                        t = bd(e, t, a, n);
                        break e
                    } else
                        for (e = t.stateNode.containerInfo,
                        e.nodeType === 9 ? e = e.body : e = e.nodeName === "HTML" ? e.ownerDocument.body : e,
                        Le = Rt(e.firstChild),
                        $e = t,
                        ve = !0,
                        pn = null,
                        Tt = !0,
                        n = mf(t, null, a, n),
                        t.child = n; n; )
                            n.flags = n.flags & -3 | 4096,
                            n = n.sibling;
                else {
                    if (Xn(),
                    a === i) {
                        t = Pt(e, t, n);
                        break e
                    }
                    Ie(e, t, a, n)
                }
                t = t.child
            }
            return t;
        case 26:
            return ki(e, t),
            e === null ? (n = Dh(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : ve || (n = t.type,
            e = t.pendingProps,
            a = ss(de.current).createElement(n),
            a[Je] = t,
            a[lt] = e,
            Pe(a, n, e),
            Fe(a),
            t.stateNode = a) : t.memoizedState = Dh(t.type, e.memoizedProps, t.pendingProps, e.memoizedState),
            null;
        case 27:
            return Za(t),
            e === null && ve && (a = t.stateNode = zh(t.type, t.pendingProps, de.current),
            $e = t,
            Tt = !0,
            i = Le,
            zn(t.type) ? (Zu = i,
            Le = Rt(a.firstChild)) : Le = i),
            Ie(e, t, t.pendingProps.children, n),
            ki(e, t),
            e === null && (t.flags |= 4194304),
            t.child;
        case 5:
            return e === null && ve && ((i = a = Le) && (a = f0(a, t.type, t.pendingProps, Tt),
            a !== null ? (t.stateNode = a,
            $e = t,
            Le = Rt(a.firstChild),
            Tt = !1,
            i = !0) : i = !1),
            i || yn(t)),
            Za(t),
            i = t.type,
            o = t.pendingProps,
            h = e !== null ? e.memoizedProps : null,
            a = o.children,
            Vu(i, o) ? a = null : h !== null && Vu(i, h) && (t.flags |= 32),
            t.memoizedState !== null && (i = Yr(e, t, Ay, null, null, n),
            Ul._currentValue = i),
            ki(e, t),
            Ie(e, t, a, n),
            t.child;
        case 6:
            return e === null && ve && ((e = n = Le) && (n = d0(n, t.pendingProps, Tt),
            n !== null ? (t.stateNode = n,
            $e = t,
            Le = null,
            e = !0) : e = !1),
            e || yn(t)),
            null;
        case 13:
            return xd(e, t, n);
        case 4:
            return nt(t, t.stateNode.containerInfo),
            a = t.pendingProps,
            e === null ? t.child = Wn(t, null, a, n) : Ie(e, t, a, n),
            t.child;
        case 11:
            return fd(e, t, t.type, t.pendingProps, n);
        case 7:
            return Ie(e, t, t.pendingProps, n),
            t.child;
        case 8:
            return Ie(e, t, t.pendingProps.children, n),
            t.child;
        case 12:
            return Ie(e, t, t.pendingProps.children, n),
            t.child;
        case 10:
            return a = t.pendingProps,
            vn(t, t.type, a.value),
            Ie(e, t, a.children, n),
            t.child;
        case 9:
            return i = t.type._context,
            a = t.pendingProps.children,
            Zn(t),
            i = We(i),
            a = a(i),
            t.flags |= 1,
            Ie(e, t, a, n),
            t.child;
        case 14:
            return dd(e, t, t.type, t.pendingProps, n);
        case 15:
            return hd(e, t, t.type, t.pendingProps, n);
        case 19:
            return Ed(e, t, n);
        case 31:
            return Dy(e, t, n);
        case 22:
            return md(e, t, n, t.pendingProps);
        case 24:
            return Zn(t),
            a = We(Ge),
            e === null ? (i = zr(),
            i === null && (i = ze,
            o = Rr(),
            i.pooledCache = o,
            o.refCount++,
            o !== null && (i.pooledCacheLanes |= n),
            i = o),
            t.memoizedState = {
                parent: a,
                cache: i
            },
            Mr(t),
            vn(t, Ge, i)) : ((e.lanes & n) !== 0 && (Dr(e, t),
            pl(t, null, null, n),
            gl()),
            i = e.memoizedState,
            o = t.memoizedState,
            i.parent !== a ? (i = {
                parent: a,
                cache: a
            },
            t.memoizedState = i,
            t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i),
            vn(t, Ge, a)) : (a = o.cache,
            vn(t, Ge, a),
            a !== i.cache && Or(t, [Ge], n, !0))),
            Ie(e, t, t.pendingProps.children, n),
            t.child;
        case 29:
            throw t.pendingProps
        }
        throw Error(u(156, t.tag))
    }
    function en(e) {
        e.flags |= 4
    }
    function gu(e, t, n, a, i) {
        if ((t = (e.mode & 32) !== 0) && (t = !1),
        t) {
            if (e.flags |= 16777216,
            (i & 335544128) === i)
                if (e.stateNode.complete)
                    e.flags |= 8192;
                else if ($d())
                    e.flags |= 8192;
                else
                    throw $n = Oi,
                    Lr
        } else
            e.flags &= -16777217
    }
    function Cd(e, t) {
        if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
            e.flags &= -16777217;
        else if (e.flags |= 16777216,
        !qh(t))
            if ($d())
                e.flags |= 8192;
            else
                throw $n = Oi,
                Lr
    }
    function Xi(e, t) {
        t !== null && (e.flags |= 4),
        e.flags & 16384 && (t = e.tag !== 22 ? nc() : 536870912,
        e.lanes |= t,
        za |= t)
    }
    function El(e, t) {
        if (!ve)
            switch (e.tailMode) {
            case "hidden":
                t = e.tail;
                for (var n = null; t !== null; )
                    t.alternate !== null && (n = t),
                    t = t.sibling;
                n === null ? e.tail = null : n.sibling = null;
                break;
            case "collapsed":
                n = e.tail;
                for (var a = null; n !== null; )
                    n.alternate !== null && (a = n),
                    n = n.sibling;
                a === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : a.sibling = null
            }
    }
    function Me(e) {
        var t = e.alternate !== null && e.alternate.child === e.child
          , n = 0
          , a = 0;
        if (t)
            for (var i = e.child; i !== null; )
                n |= i.lanes | i.childLanes,
                a |= i.subtreeFlags & 65011712,
                a |= i.flags & 65011712,
                i.return = e,
                i = i.sibling;
        else
            for (i = e.child; i !== null; )
                n |= i.lanes | i.childLanes,
                a |= i.subtreeFlags,
                a |= i.flags,
                i.return = e,
                i = i.sibling;
        return e.subtreeFlags |= a,
        e.childLanes = n,
        t
    }
    function Uy(e, t, n) {
        var a = t.pendingProps;
        switch (wr(t),
        t.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
            return Me(t),
            null;
        case 1:
            return Me(t),
            null;
        case 3:
            return n = t.stateNode,
            a = null,
            e !== null && (a = e.memoizedState.cache),
            t.memoizedState.cache !== a && (t.flags |= 2048),
            $t(Ge),
            Be(),
            n.pendingContext && (n.context = n.pendingContext,
            n.pendingContext = null),
            (e === null || e.child === null) && (va(t) ? en(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024,
            _r())),
            Me(t),
            null;
        case 26:
            var i = t.type
              , o = t.memoizedState;
            return e === null ? (en(t),
            o !== null ? (Me(t),
            Cd(t, o)) : (Me(t),
            gu(t, i, null, a, n))) : o ? o !== e.memoizedState ? (en(t),
            Me(t),
            Cd(t, o)) : (Me(t),
            t.flags &= -16777217) : (e = e.memoizedProps,
            e !== a && en(t),
            Me(t),
            gu(t, i, e, a, n)),
            null;
        case 27:
            if (ni(t),
            n = de.current,
            i = t.type,
            e !== null && t.stateNode != null)
                e.memoizedProps !== a && en(t);
            else {
                if (!a) {
                    if (t.stateNode === null)
                        throw Error(u(166));
                    return Me(t),
                    null
                }
                e = J.current,
                va(t) ? nf(t) : (e = zh(i, a, n),
                t.stateNode = e,
                en(t))
            }
            return Me(t),
            null;
        case 5:
            if (ni(t),
            i = t.type,
            e !== null && t.stateNode != null)
                e.memoizedProps !== a && en(t);
            else {
                if (!a) {
                    if (t.stateNode === null)
                        throw Error(u(166));
                    return Me(t),
                    null
                }
                if (o = J.current,
                va(t))
                    nf(t);
                else {
                    var h = ss(de.current);
                    switch (o) {
                    case 1:
                        o = h.createElementNS("http://www.w3.org/2000/svg", i);
                        break;
                    case 2:
                        o = h.createElementNS("http://www.w3.org/1998/Math/MathML", i);
                        break;
                    default:
                        switch (i) {
                        case "svg":
                            o = h.createElementNS("http://www.w3.org/2000/svg", i);
                            break;
                        case "math":
                            o = h.createElementNS("http://www.w3.org/1998/Math/MathML", i);
                            break;
                        case "script":
                            o = h.createElement("div"),
                            o.innerHTML = "<script><\/script>",
                            o = o.removeChild(o.firstChild);
                            break;
                        case "select":
                            o = typeof a.is == "string" ? h.createElement("select", {
                                is: a.is
                            }) : h.createElement("select"),
                            a.multiple ? o.multiple = !0 : a.size && (o.size = a.size);
                            break;
                        default:
                            o = typeof a.is == "string" ? h.createElement(i, {
                                is: a.is
                            }) : h.createElement(i)
                        }
                    }
                    o[Je] = t,
                    o[lt] = a;
                    e: for (h = t.child; h !== null; ) {
                        if (h.tag === 5 || h.tag === 6)
                            o.appendChild(h.stateNode);
                        else if (h.tag !== 4 && h.tag !== 27 && h.child !== null) {
                            h.child.return = h,
                            h = h.child;
                            continue
                        }
                        if (h === t)
                            break e;
                        for (; h.sibling === null; ) {
                            if (h.return === null || h.return === t)
                                break e;
                            h = h.return
                        }
                        h.sibling.return = h.return,
                        h = h.sibling
                    }
                    t.stateNode = o;
                    e: switch (Pe(o, i, a),
                    i) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                        a = !!a.autoFocus;
                        break e;
                    case "img":
                        a = !0;
                        break e;
                    default:
                        a = !1
                    }
                    a && en(t)
                }
            }
            return Me(t),
            gu(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n),
            null;
        case 6:
            if (e && t.stateNode != null)
                e.memoizedProps !== a && en(t);
            else {
                if (typeof a != "string" && t.stateNode === null)
                    throw Error(u(166));
                if (e = de.current,
                va(t)) {
                    if (e = t.stateNode,
                    n = t.memoizedProps,
                    a = null,
                    i = $e,
                    i !== null)
                        switch (i.tag) {
                        case 27:
                        case 5:
                            a = i.memoizedProps
                        }
                    e[Je] = t,
                    e = !!(e.nodeValue === n || a !== null && a.suppressHydrationWarning === !0 || xh(e.nodeValue, n)),
                    e || yn(t, !0)
                } else
                    e = ss(e).createTextNode(a),
                    e[Je] = t,
                    t.stateNode = e
            }
            return Me(t),
            null;
        case 31:
            if (n = t.memoizedState,
            e === null || e.memoizedState !== null) {
                if (a = va(t),
                n !== null) {
                    if (e === null) {
                        if (!a)
                            throw Error(u(318));
                        if (e = t.memoizedState,
                        e = e !== null ? e.dehydrated : null,
                        !e)
                            throw Error(u(557));
                        e[Je] = t
                    } else
                        Xn(),
                        (t.flags & 128) === 0 && (t.memoizedState = null),
                        t.flags |= 4;
                    Me(t),
                    e = !1
                } else
                    n = _r(),
                    e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n),
                    e = !0;
                if (!e)
                    return t.flags & 256 ? (yt(t),
                    t) : (yt(t),
                    null);
                if ((t.flags & 128) !== 0)
                    throw Error(u(558))
            }
            return Me(t),
            null;
        case 13:
            if (a = t.memoizedState,
            e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                if (i = va(t),
                a !== null && a.dehydrated !== null) {
                    if (e === null) {
                        if (!i)
                            throw Error(u(318));
                        if (i = t.memoizedState,
                        i = i !== null ? i.dehydrated : null,
                        !i)
                            throw Error(u(317));
                        i[Je] = t
                    } else
                        Xn(),
                        (t.flags & 128) === 0 && (t.memoizedState = null),
                        t.flags |= 4;
                    Me(t),
                    i = !1
                } else
                    i = _r(),
                    e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i),
                    i = !0;
                if (!i)
                    return t.flags & 256 ? (yt(t),
                    t) : (yt(t),
                    null)
            }
            return yt(t),
            (t.flags & 128) !== 0 ? (t.lanes = n,
            t) : (n = a !== null,
            e = e !== null && e.memoizedState !== null,
            n && (a = t.child,
            i = null,
            a.alternate !== null && a.alternate.memoizedState !== null && a.alternate.memoizedState.cachePool !== null && (i = a.alternate.memoizedState.cachePool.pool),
            o = null,
            a.memoizedState !== null && a.memoizedState.cachePool !== null && (o = a.memoizedState.cachePool.pool),
            o !== i && (a.flags |= 2048)),
            n !== e && n && (t.child.flags |= 8192),
            Xi(t, t.updateQueue),
            Me(t),
            null);
        case 4:
            return Be(),
            e === null && Bu(t.stateNode.containerInfo),
            Me(t),
            null;
        case 10:
            return $t(t.type),
            Me(t),
            null;
        case 19:
            if (H(He),
            a = t.memoizedState,
            a === null)
                return Me(t),
                null;
            if (i = (t.flags & 128) !== 0,
            o = a.rendering,
            o === null)
                if (i)
                    El(a, !1);
                else {
                    if (Ue !== 0 || e !== null && (e.flags & 128) !== 0)
                        for (e = t.child; e !== null; ) {
                            if (o = Li(e),
                            o !== null) {
                                for (t.flags |= 128,
                                El(a, !1),
                                e = o.updateQueue,
                                t.updateQueue = e,
                                Xi(t, e),
                                t.subtreeFlags = 0,
                                e = n,
                                n = t.child; n !== null; )
                                    Wc(n, e),
                                    n = n.sibling;
                                return F(He, He.current & 1 | 2),
                                ve && Kt(t, a.treeForkCount),
                                t.child
                            }
                            e = e.sibling
                        }
                    a.tail !== null && ft() > $i && (t.flags |= 128,
                    i = !0,
                    El(a, !1),
                    t.lanes = 4194304)
                }
            else {
                if (!i)
                    if (e = Li(o),
                    e !== null) {
                        if (t.flags |= 128,
                        i = !0,
                        e = e.updateQueue,
                        t.updateQueue = e,
                        Xi(t, e),
                        El(a, !0),
                        a.tail === null && a.tailMode === "hidden" && !o.alternate && !ve)
                            return Me(t),
                            null
                    } else
                        2 * ft() - a.renderingStartTime > $i && n !== 536870912 && (t.flags |= 128,
                        i = !0,
                        El(a, !1),
                        t.lanes = 4194304);
                a.isBackwards ? (o.sibling = t.child,
                t.child = o) : (e = a.last,
                e !== null ? e.sibling = o : t.child = o,
                a.last = o)
            }
            return a.tail !== null ? (e = a.tail,
            a.rendering = e,
            a.tail = e.sibling,
            a.renderingStartTime = ft(),
            e.sibling = null,
            n = He.current,
            F(He, i ? n & 1 | 2 : n & 1),
            ve && Kt(t, a.treeForkCount),
            e) : (Me(t),
            null);
        case 22:
        case 23:
            return yt(t),
            Hr(),
            a = t.memoizedState !== null,
            e !== null ? e.memoizedState !== null !== a && (t.flags |= 8192) : a && (t.flags |= 8192),
            a ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (Me(t),
            t.subtreeFlags & 6 && (t.flags |= 8192)) : Me(t),
            n = t.updateQueue,
            n !== null && Xi(t, n.retryQueue),
            n = null,
            e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool),
            a = null,
            t.memoizedState !== null && t.memoizedState.cachePool !== null && (a = t.memoizedState.cachePool.pool),
            a !== n && (t.flags |= 2048),
            e !== null && H(Kn),
            null;
        case 24:
            return n = null,
            e !== null && (n = e.memoizedState.cache),
            t.memoizedState.cache !== n && (t.flags |= 2048),
            $t(Ge),
            Me(t),
            null;
        case 25:
            return null;
        case 30:
            return null
        }
        throw Error(u(156, t.tag))
    }
    function By(e, t) {
        switch (wr(t),
        t.tag) {
        case 1:
            return e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 3:
            return $t(Ge),
            Be(),
            e = t.flags,
            (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 26:
        case 27:
        case 5:
            return ni(t),
            null;
        case 31:
            if (t.memoizedState !== null) {
                if (yt(t),
                t.alternate === null)
                    throw Error(u(340));
                Xn()
            }
            return e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 13:
            if (yt(t),
            e = t.memoizedState,
            e !== null && e.dehydrated !== null) {
                if (t.alternate === null)
                    throw Error(u(340));
                Xn()
            }
            return e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 19:
            return H(He),
            null;
        case 4:
            return Be(),
            null;
        case 10:
            return $t(t.type),
            null;
        case 22:
        case 23:
            return yt(t),
            Hr(),
            e !== null && H(Kn),
            e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 24:
            return $t(Ge),
            null;
        case 25:
            return null;
        default:
            return null
        }
    }
    function _d(e, t) {
        switch (wr(t),
        t.tag) {
        case 3:
            $t(Ge),
            Be();
            break;
        case 26:
        case 27:
        case 5:
            ni(t);
            break;
        case 4:
            Be();
            break;
        case 31:
            t.memoizedState !== null && yt(t);
            break;
        case 13:
            yt(t);
            break;
        case 19:
            H(He);
            break;
        case 10:
            $t(t.type);
            break;
        case 22:
        case 23:
            yt(t),
            Hr(),
            e !== null && H(Kn);
            break;
        case 24:
            $t(Ge)
        }
    }
    function wl(e, t) {
        try {
            var n = t.updateQueue
              , a = n !== null ? n.lastEffect : null;
            if (a !== null) {
                var i = a.next;
                n = i;
                do {
                    if ((n.tag & e) === e) {
                        a = void 0;
                        var o = n.create
                          , h = n.inst;
                        a = o(),
                        h.destroy = a
                    }
                    n = n.next
                } while (n !== i)
            }
        } catch (y) {
            Te(t, t.return, y)
        }
    }
    function Cn(e, t, n) {
        try {
            var a = t.updateQueue
              , i = a !== null ? a.lastEffect : null;
            if (i !== null) {
                var o = i.next;
                a = o;
                do {
                    if ((a.tag & e) === e) {
                        var h = a.inst
                          , y = h.destroy;
                        if (y !== void 0) {
                            h.destroy = void 0,
                            i = t;
                            var _ = n
                              , z = y;
                            try {
                                z()
                            } catch (B) {
                                Te(i, _, B)
                            }
                        }
                    }
                    a = a.next
                } while (a !== o)
            }
        } catch (B) {
            Te(t, t.return, B)
        }
    }
    function Ad(e) {
        var t = e.updateQueue;
        if (t !== null) {
            var n = e.stateNode;
            try {
                pf(t, n)
            } catch (a) {
                Te(e, e.return, a)
            }
        }
    }
    function Td(e, t, n) {
        n.props = Pn(e.type, e.memoizedProps),
        n.state = e.memoizedState;
        try {
            n.componentWillUnmount()
        } catch (a) {
            Te(e, t, a)
        }
    }
    function Cl(e, t) {
        try {
            var n = e.ref;
            if (n !== null) {
                switch (e.tag) {
                case 26:
                case 27:
                case 5:
                    var a = e.stateNode;
                    break;
                case 30:
                    a = e.stateNode;
                    break;
                default:
                    a = e.stateNode
                }
                typeof n == "function" ? e.refCleanup = n(a) : n.current = a
            }
        } catch (i) {
            Te(e, t, i)
        }
    }
    function Ht(e, t) {
        var n = e.ref
          , a = e.refCleanup;
        if (n !== null)
            if (typeof a == "function")
                try {
                    a()
                } catch (i) {
                    Te(e, t, i)
                } finally {
                    e.refCleanup = null,
                    e = e.alternate,
                    e != null && (e.refCleanup = null)
                }
            else if (typeof n == "function")
                try {
                    n(null)
                } catch (i) {
                    Te(e, t, i)
                }
            else
                n.current = null
    }
    function Od(e) {
        var t = e.type
          , n = e.memoizedProps
          , a = e.stateNode;
        try {
            e: switch (t) {
            case "button":
            case "input":
            case "select":
            case "textarea":
                n.autoFocus && a.focus();
                break e;
            case "img":
                n.src ? a.src = n.src : n.srcSet && (a.srcset = n.srcSet)
            }
        } catch (i) {
            Te(e, e.return, i)
        }
    }
    function pu(e, t, n) {
        try {
            var a = e.stateNode;
            i0(a, e.type, n, t),
            a[lt] = t
        } catch (i) {
            Te(e, e.return, i)
        }
    }
    function Rd(e) {
        return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && zn(e.type) || e.tag === 4
    }
    function yu(e) {
        e: for (; ; ) {
            for (; e.sibling === null; ) {
                if (e.return === null || Rd(e.return))
                    return null;
                e = e.return
            }
            for (e.sibling.return = e.return,
            e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
                if (e.tag === 27 && zn(e.type) || e.flags & 2 || e.child === null || e.tag === 4)
                    continue e;
                e.child.return = e,
                e = e.child
            }
            if (!(e.flags & 2))
                return e.stateNode
        }
    }
    function vu(e, t, n) {
        var a = e.tag;
        if (a === 5 || a === 6)
            e = e.stateNode,
            t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n,
            t.appendChild(e),
            n = n._reactRootContainer,
            n != null || t.onclick !== null || (t.onclick = Xt));
        else if (a !== 4 && (a === 27 && zn(e.type) && (n = e.stateNode,
        t = null),
        e = e.child,
        e !== null))
            for (vu(e, t, n),
            e = e.sibling; e !== null; )
                vu(e, t, n),
                e = e.sibling
    }
    function Fi(e, t, n) {
        var a = e.tag;
        if (a === 5 || a === 6)
            e = e.stateNode,
            t ? n.insertBefore(e, t) : n.appendChild(e);
        else if (a !== 4 && (a === 27 && zn(e.type) && (n = e.stateNode),
        e = e.child,
        e !== null))
            for (Fi(e, t, n),
            e = e.sibling; e !== null; )
                Fi(e, t, n),
                e = e.sibling
    }
    function Nd(e) {
        var t = e.stateNode
          , n = e.memoizedProps;
        try {
            for (var a = e.type, i = t.attributes; i.length; )
                t.removeAttributeNode(i[0]);
            Pe(t, a, n),
            t[Je] = e,
            t[lt] = n
        } catch (o) {
            Te(e, e.return, o)
        }
    }
    var tn = !1
      , ke = !1
      , bu = !1
      , zd = typeof WeakSet == "function" ? WeakSet : Set
      , Ze = null;
    function Hy(e, t) {
        if (e = e.containerInfo,
        Gu = hs,
        e = Vc(e),
        dr(e)) {
            if ("selectionStart"in e)
                var n = {
                    start: e.selectionStart,
                    end: e.selectionEnd
                };
            else
                e: {
                    n = (n = e.ownerDocument) && n.defaultView || window;
                    var a = n.getSelection && n.getSelection();
                    if (a && a.rangeCount !== 0) {
                        n = a.anchorNode;
                        var i = a.anchorOffset
                          , o = a.focusNode;
                        a = a.focusOffset;
                        try {
                            n.nodeType,
                            o.nodeType
                        } catch {
                            n = null;
                            break e
                        }
                        var h = 0
                          , y = -1
                          , _ = -1
                          , z = 0
                          , B = 0
                          , Y = e
                          , L = null;
                        t: for (; ; ) {
                            for (var D; Y !== n || i !== 0 && Y.nodeType !== 3 || (y = h + i),
                            Y !== o || a !== 0 && Y.nodeType !== 3 || (_ = h + a),
                            Y.nodeType === 3 && (h += Y.nodeValue.length),
                            (D = Y.firstChild) !== null; )
                                L = Y,
                                Y = D;
                            for (; ; ) {
                                if (Y === e)
                                    break t;
                                if (L === n && ++z === i && (y = h),
                                L === o && ++B === a && (_ = h),
                                (D = Y.nextSibling) !== null)
                                    break;
                                Y = L,
                                L = Y.parentNode
                            }
                            Y = D
                        }
                        n = y === -1 || _ === -1 ? null : {
                            start: y,
                            end: _
                        }
                    } else
                        n = null
                }
            n = n || {
                start: 0,
                end: 0
            }
        } else
            n = null;
        for (Yu = {
            focusedElem: e,
            selectionRange: n
        },
        hs = !1,
        Ze = t; Ze !== null; )
            if (t = Ze,
            e = t.child,
            (t.subtreeFlags & 1028) !== 0 && e !== null)
                e.return = t,
                Ze = e;
            else
                for (; Ze !== null; ) {
                    switch (t = Ze,
                    o = t.alternate,
                    e = t.flags,
                    t.tag) {
                    case 0:
                        if ((e & 4) !== 0 && (e = t.updateQueue,
                        e = e !== null ? e.events : null,
                        e !== null))
                            for (n = 0; n < e.length; n++)
                                i = e[n],
                                i.ref.impl = i.nextImpl;
                        break;
                    case 11:
                    case 15:
                        break;
                    case 1:
                        if ((e & 1024) !== 0 && o !== null) {
                            e = void 0,
                            n = t,
                            i = o.memoizedProps,
                            o = o.memoizedState,
                            a = n.stateNode;
                            try {
                                var $ = Pn(n.type, i);
                                e = a.getSnapshotBeforeUpdate($, o),
                                a.__reactInternalSnapshotBeforeUpdate = e
                            } catch (ae) {
                                Te(n, n.return, ae)
                            }
                        }
                        break;
                    case 3:
                        if ((e & 1024) !== 0) {
                            if (e = t.stateNode.containerInfo,
                            n = e.nodeType,
                            n === 9)
                                Qu(e);
                            else if (n === 1)
                                switch (e.nodeName) {
                                case "HEAD":
                                case "HTML":
                                case "BODY":
                                    Qu(e);
                                    break;
                                default:
                                    e.textContent = ""
                                }
                        }
                        break;
                    case 5:
                    case 26:
                    case 27:
                    case 6:
                    case 4:
                    case 17:
                        break;
                    default:
                        if ((e & 1024) !== 0)
                            throw Error(u(163))
                    }
                    if (e = t.sibling,
                    e !== null) {
                        e.return = t.return,
                        Ze = e;
                        break
                    }
                    Ze = t.return
                }
    }
    function Ld(e, t, n) {
        var a = n.flags;
        switch (n.tag) {
        case 0:
        case 11:
        case 15:
            an(e, n),
            a & 4 && wl(5, n);
            break;
        case 1:
            if (an(e, n),
            a & 4)
                if (e = n.stateNode,
                t === null)
                    try {
                        e.componentDidMount()
                    } catch (h) {
                        Te(n, n.return, h)
                    }
                else {
                    var i = Pn(n.type, t.memoizedProps);
                    t = t.memoizedState;
                    try {
                        e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate)
                    } catch (h) {
                        Te(n, n.return, h)
                    }
                }
            a & 64 && Ad(n),
            a & 512 && Cl(n, n.return);
            break;
        case 3:
            if (an(e, n),
            a & 64 && (e = n.updateQueue,
            e !== null)) {
                if (t = null,
                n.child !== null)
                    switch (n.child.tag) {
                    case 27:
                    case 5:
                        t = n.child.stateNode;
                        break;
                    case 1:
                        t = n.child.stateNode
                    }
                try {
                    pf(e, t)
                } catch (h) {
                    Te(n, n.return, h)
                }
            }
            break;
        case 27:
            t === null && a & 4 && Nd(n);
        case 26:
        case 5:
            an(e, n),
            t === null && a & 4 && Od(n),
            a & 512 && Cl(n, n.return);
            break;
        case 12:
            an(e, n);
            break;
        case 31:
            an(e, n),
            a & 4 && jd(e, n);
            break;
        case 13:
            an(e, n),
            a & 4 && Ud(e, n),
            a & 64 && (e = n.memoizedState,
            e !== null && (e = e.dehydrated,
            e !== null && (n = Zy.bind(null, n),
            h0(e, n))));
            break;
        case 22:
            if (a = n.memoizedState !== null || tn,
            !a) {
                t = t !== null && t.memoizedState !== null || ke,
                i = tn;
                var o = ke;
                tn = a,
                (ke = t) && !o ? ln(e, n, (n.subtreeFlags & 8772) !== 0) : an(e, n),
                tn = i,
                ke = o
            }
            break;
        case 30:
            break;
        default:
            an(e, n)
        }
    }
    function Md(e) {
        var t = e.alternate;
        t !== null && (e.alternate = null,
        Md(t)),
        e.child = null,
        e.deletions = null,
        e.sibling = null,
        e.tag === 5 && (t = e.stateNode,
        t !== null && Js(t)),
        e.stateNode = null,
        e.return = null,
        e.dependencies = null,
        e.memoizedProps = null,
        e.memoizedState = null,
        e.pendingProps = null,
        e.stateNode = null,
        e.updateQueue = null
    }
    var De = null
      , st = !1;
    function nn(e, t, n) {
        for (n = n.child; n !== null; )
            Dd(e, t, n),
            n = n.sibling
    }
    function Dd(e, t, n) {
        if (dt && typeof dt.onCommitFiberUnmount == "function")
            try {
                dt.onCommitFiberUnmount(Ka, n)
            } catch {}
        switch (n.tag) {
        case 26:
            ke || Ht(n, t),
            nn(e, t, n),
            n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode,
            n.parentNode.removeChild(n));
            break;
        case 27:
            ke || Ht(n, t);
            var a = De
              , i = st;
            zn(n.type) && (De = n.stateNode,
            st = !1),
            nn(e, t, n),
            Ml(n.stateNode),
            De = a,
            st = i;
            break;
        case 5:
            ke || Ht(n, t);
        case 6:
            if (a = De,
            i = st,
            De = null,
            nn(e, t, n),
            De = a,
            st = i,
            De !== null)
                if (st)
                    try {
                        (De.nodeType === 9 ? De.body : De.nodeName === "HTML" ? De.ownerDocument.body : De).removeChild(n.stateNode)
                    } catch (o) {
                        Te(n, t, o)
                    }
                else
                    try {
                        De.removeChild(n.stateNode)
                    } catch (o) {
                        Te(n, t, o)
                    }
            break;
        case 18:
            De !== null && (st ? (e = De,
            Ah(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode),
            qa(e)) : Ah(De, n.stateNode));
            break;
        case 4:
            a = De,
            i = st,
            De = n.stateNode.containerInfo,
            st = !0,
            nn(e, t, n),
            De = a,
            st = i;
            break;
        case 0:
        case 11:
        case 14:
        case 15:
            Cn(2, n, t),
            ke || Cn(4, n, t),
            nn(e, t, n);
            break;
        case 1:
            ke || (Ht(n, t),
            a = n.stateNode,
            typeof a.componentWillUnmount == "function" && Td(n, t, a)),
            nn(e, t, n);
            break;
        case 21:
            nn(e, t, n);
            break;
        case 22:
            ke = (a = ke) || n.memoizedState !== null,
            nn(e, t, n),
            ke = a;
            break;
        default:
            nn(e, t, n)
        }
    }
    function jd(e, t) {
        if (t.memoizedState === null && (e = t.alternate,
        e !== null && (e = e.memoizedState,
        e !== null))) {
            e = e.dehydrated;
            try {
                qa(e)
            } catch (n) {
                Te(t, t.return, n)
            }
        }
    }
    function Ud(e, t) {
        if (t.memoizedState === null && (e = t.alternate,
        e !== null && (e = e.memoizedState,
        e !== null && (e = e.dehydrated,
        e !== null))))
            try {
                qa(e)
            } catch (n) {
                Te(t, t.return, n)
            }
    }
    function qy(e) {
        switch (e.tag) {
        case 31:
        case 13:
        case 19:
            var t = e.stateNode;
            return t === null && (t = e.stateNode = new zd),
            t;
        case 22:
            return e = e.stateNode,
            t = e._retryCache,
            t === null && (t = e._retryCache = new zd),
            t;
        default:
            throw Error(u(435, e.tag))
        }
    }
    function Zi(e, t) {
        var n = qy(e);
        t.forEach(function(a) {
            if (!n.has(a)) {
                n.add(a);
                var i = Ky.bind(null, e, a);
                a.then(i, i)
            }
        })
    }
    function rt(e, t) {
        var n = t.deletions;
        if (n !== null)
            for (var a = 0; a < n.length; a++) {
                var i = n[a]
                  , o = e
                  , h = t
                  , y = h;
                e: for (; y !== null; ) {
                    switch (y.tag) {
                    case 27:
                        if (zn(y.type)) {
                            De = y.stateNode,
                            st = !1;
                            break e
                        }
                        break;
                    case 5:
                        De = y.stateNode,
                        st = !1;
                        break e;
                    case 3:
                    case 4:
                        De = y.stateNode.containerInfo,
                        st = !0;
                        break e
                    }
                    y = y.return
                }
                if (De === null)
                    throw Error(u(160));
                Dd(o, h, i),
                De = null,
                st = !1,
                o = i.alternate,
                o !== null && (o.return = null),
                i.return = null
            }
        if (t.subtreeFlags & 13886)
            for (t = t.child; t !== null; )
                Bd(t, e),
                t = t.sibling
    }
    var Mt = null;
    function Bd(e, t) {
        var n = e.alternate
          , a = e.flags;
        switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            rt(t, e),
            ut(e),
            a & 4 && (Cn(3, e, e.return),
            wl(3, e),
            Cn(5, e, e.return));
            break;
        case 1:
            rt(t, e),
            ut(e),
            a & 512 && (ke || n === null || Ht(n, n.return)),
            a & 64 && tn && (e = e.updateQueue,
            e !== null && (a = e.callbacks,
            a !== null && (n = e.shared.hiddenCallbacks,
            e.shared.hiddenCallbacks = n === null ? a : n.concat(a))));
            break;
        case 26:
            var i = Mt;
            if (rt(t, e),
            ut(e),
            a & 512 && (ke || n === null || Ht(n, n.return)),
            a & 4) {
                var o = n !== null ? n.memoizedState : null;
                if (a = e.memoizedState,
                n === null)
                    if (a === null)
                        if (e.stateNode === null) {
                            e: {
                                a = e.type,
                                n = e.memoizedProps,
                                i = i.ownerDocument || i;
                                t: switch (a) {
                                case "title":
                                    o = i.getElementsByTagName("title")[0],
                                    (!o || o[Wa] || o[Je] || o.namespaceURI === "http://www.w3.org/2000/svg" || o.hasAttribute("itemprop")) && (o = i.createElement(a),
                                    i.head.insertBefore(o, i.querySelector("head > title"))),
                                    Pe(o, a, n),
                                    o[Je] = e,
                                    Fe(o),
                                    a = o;
                                    break e;
                                case "link":
                                    var h = Bh("link", "href", i).get(a + (n.href || ""));
                                    if (h) {
                                        for (var y = 0; y < h.length; y++)
                                            if (o = h[y],
                                            o.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && o.getAttribute("rel") === (n.rel == null ? null : n.rel) && o.getAttribute("title") === (n.title == null ? null : n.title) && o.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
                                                h.splice(y, 1);
                                                break t
                                            }
                                    }
                                    o = i.createElement(a),
                                    Pe(o, a, n),
                                    i.head.appendChild(o);
                                    break;
                                case "meta":
                                    if (h = Bh("meta", "content", i).get(a + (n.content || ""))) {
                                        for (y = 0; y < h.length; y++)
                                            if (o = h[y],
                                            o.getAttribute("content") === (n.content == null ? null : "" + n.content) && o.getAttribute("name") === (n.name == null ? null : n.name) && o.getAttribute("property") === (n.property == null ? null : n.property) && o.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && o.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
                                                h.splice(y, 1);
                                                break t
                                            }
                                    }
                                    o = i.createElement(a),
                                    Pe(o, a, n),
                                    i.head.appendChild(o);
                                    break;
                                default:
                                    throw Error(u(468, a))
                                }
                                o[Je] = e,
                                Fe(o),
                                a = o
                            }
                            e.stateNode = a
                        } else
                            Hh(i, e.type, e.stateNode);
                    else
                        e.stateNode = Uh(i, a, e.memoizedProps);
                else
                    o !== a ? (o === null ? n.stateNode !== null && (n = n.stateNode,
                    n.parentNode.removeChild(n)) : o.count--,
                    a === null ? Hh(i, e.type, e.stateNode) : Uh(i, a, e.memoizedProps)) : a === null && e.stateNode !== null && pu(e, e.memoizedProps, n.memoizedProps)
            }
            break;
        case 27:
            rt(t, e),
            ut(e),
            a & 512 && (ke || n === null || Ht(n, n.return)),
            n !== null && a & 4 && pu(e, e.memoizedProps, n.memoizedProps);
            break;
        case 5:
            if (rt(t, e),
            ut(e),
            a & 512 && (ke || n === null || Ht(n, n.return)),
            e.flags & 32) {
                i = e.stateNode;
                try {
                    ua(i, "")
                } catch ($) {
                    Te(e, e.return, $)
                }
            }
            a & 4 && e.stateNode != null && (i = e.memoizedProps,
            pu(e, i, n !== null ? n.memoizedProps : i)),
            a & 1024 && (bu = !0);
            break;
        case 6:
            if (rt(t, e),
            ut(e),
            a & 4) {
                if (e.stateNode === null)
                    throw Error(u(162));
                a = e.memoizedProps,
                n = e.stateNode;
                try {
                    n.nodeValue = a
                } catch ($) {
                    Te(e, e.return, $)
                }
            }
            break;
        case 3:
            if (os = null,
            i = Mt,
            Mt = rs(t.containerInfo),
            rt(t, e),
            Mt = i,
            ut(e),
            a & 4 && n !== null && n.memoizedState.isDehydrated)
                try {
                    qa(t.containerInfo)
                } catch ($) {
                    Te(e, e.return, $)
                }
            bu && (bu = !1,
            Hd(e));
            break;
        case 4:
            a = Mt,
            Mt = rs(e.stateNode.containerInfo),
            rt(t, e),
            ut(e),
            Mt = a;
            break;
        case 12:
            rt(t, e),
            ut(e);
            break;
        case 31:
            rt(t, e),
            ut(e),
            a & 4 && (a = e.updateQueue,
            a !== null && (e.updateQueue = null,
            Zi(e, a)));
            break;
        case 13:
            rt(t, e),
            ut(e),
            e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ji = ft()),
            a & 4 && (a = e.updateQueue,
            a !== null && (e.updateQueue = null,
            Zi(e, a)));
            break;
        case 22:
            i = e.memoizedState !== null;
            var _ = n !== null && n.memoizedState !== null
              , z = tn
              , B = ke;
            if (tn = z || i,
            ke = B || _,
            rt(t, e),
            ke = B,
            tn = z,
            ut(e),
            a & 8192)
                e: for (t = e.stateNode,
                t._visibility = i ? t._visibility & -2 : t._visibility | 1,
                i && (n === null || _ || tn || ke || ea(e)),
                n = null,
                t = e; ; ) {
                    if (t.tag === 5 || t.tag === 26) {
                        if (n === null) {
                            _ = n = t;
                            try {
                                if (o = _.stateNode,
                                i)
                                    h = o.style,
                                    typeof h.setProperty == "function" ? h.setProperty("display", "none", "important") : h.display = "none";
                                else {
                                    y = _.stateNode;
                                    var Y = _.memoizedProps.style
                                      , L = Y != null && Y.hasOwnProperty("display") ? Y.display : null;
                                    y.style.display = L == null || typeof L == "boolean" ? "" : ("" + L).trim()
                                }
                            } catch ($) {
                                Te(_, _.return, $)
                            }
                        }
                    } else if (t.tag === 6) {
                        if (n === null) {
                            _ = t;
                            try {
                                _.stateNode.nodeValue = i ? "" : _.memoizedProps
                            } catch ($) {
                                Te(_, _.return, $)
                            }
                        }
                    } else if (t.tag === 18) {
                        if (n === null) {
                            _ = t;
                            try {
                                var D = _.stateNode;
                                i ? Th(D, !0) : Th(_.stateNode, !1)
                            } catch ($) {
                                Te(_, _.return, $)
                            }
                        }
                    } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
                        t.child.return = t,
                        t = t.child;
                        continue
                    }
                    if (t === e)
                        break e;
                    for (; t.sibling === null; ) {
                        if (t.return === null || t.return === e)
                            break e;
                        n === t && (n = null),
                        t = t.return
                    }
                    n === t && (n = null),
                    t.sibling.return = t.return,
                    t = t.sibling
                }
            a & 4 && (a = e.updateQueue,
            a !== null && (n = a.retryQueue,
            n !== null && (a.retryQueue = null,
            Zi(e, n))));
            break;
        case 19:
            rt(t, e),
            ut(e),
            a & 4 && (a = e.updateQueue,
            a !== null && (e.updateQueue = null,
            Zi(e, a)));
            break;
        case 30:
            break;
        case 21:
            break;
        default:
            rt(t, e),
            ut(e)
        }
    }
    function ut(e) {
        var t = e.flags;
        if (t & 2) {
            try {
                for (var n, a = e.return; a !== null; ) {
                    if (Rd(a)) {
                        n = a;
                        break
                    }
                    a = a.return
                }
                if (n == null)
                    throw Error(u(160));
                switch (n.tag) {
                case 27:
                    var i = n.stateNode
                      , o = yu(e);
                    Fi(e, o, i);
                    break;
                case 5:
                    var h = n.stateNode;
                    n.flags & 32 && (ua(h, ""),
                    n.flags &= -33);
                    var y = yu(e);
                    Fi(e, y, h);
                    break;
                case 3:
                case 4:
                    var _ = n.stateNode.containerInfo
                      , z = yu(e);
                    vu(e, z, _);
                    break;
                default:
                    throw Error(u(161))
                }
            } catch (B) {
                Te(e, e.return, B)
            }
            e.flags &= -3
        }
        t & 4096 && (e.flags &= -4097)
    }
    function Hd(e) {
        if (e.subtreeFlags & 1024)
            for (e = e.child; e !== null; ) {
                var t = e;
                Hd(t),
                t.tag === 5 && t.flags & 1024 && t.stateNode.reset(),
                e = e.sibling
            }
    }
    function an(e, t) {
        if (t.subtreeFlags & 8772)
            for (t = t.child; t !== null; )
                Ld(e, t.alternate, t),
                t = t.sibling
    }
    function ea(e) {
        for (e = e.child; e !== null; ) {
            var t = e;
            switch (t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                Cn(4, t, t.return),
                ea(t);
                break;
            case 1:
                Ht(t, t.return);
                var n = t.stateNode;
                typeof n.componentWillUnmount == "function" && Td(t, t.return, n),
                ea(t);
                break;
            case 27:
                Ml(t.stateNode);
            case 26:
            case 5:
                Ht(t, t.return),
                ea(t);
                break;
            case 22:
                t.memoizedState === null && ea(t);
                break;
            case 30:
                ea(t);
                break;
            default:
                ea(t)
            }
            e = e.sibling
        }
    }
    function ln(e, t, n) {
        for (n = n && (t.subtreeFlags & 8772) !== 0,
        t = t.child; t !== null; ) {
            var a = t.alternate
              , i = e
              , o = t
              , h = o.flags;
            switch (o.tag) {
            case 0:
            case 11:
            case 15:
                ln(i, o, n),
                wl(4, o);
                break;
            case 1:
                if (ln(i, o, n),
                a = o,
                i = a.stateNode,
                typeof i.componentDidMount == "function")
                    try {
                        i.componentDidMount()
                    } catch (z) {
                        Te(a, a.return, z)
                    }
                if (a = o,
                i = a.updateQueue,
                i !== null) {
                    var y = a.stateNode;
                    try {
                        var _ = i.shared.hiddenCallbacks;
                        if (_ !== null)
                            for (i.shared.hiddenCallbacks = null,
                            i = 0; i < _.length; i++)
                                gf(_[i], y)
                    } catch (z) {
                        Te(a, a.return, z)
                    }
                }
                n && h & 64 && Ad(o),
                Cl(o, o.return);
                break;
            case 27:
                Nd(o);
            case 26:
            case 5:
                ln(i, o, n),
                n && a === null && h & 4 && Od(o),
                Cl(o, o.return);
                break;
            case 12:
                ln(i, o, n);
                break;
            case 31:
                ln(i, o, n),
                n && h & 4 && jd(i, o);
                break;
            case 13:
                ln(i, o, n),
                n && h & 4 && Ud(i, o);
                break;
            case 22:
                o.memoizedState === null && ln(i, o, n),
                Cl(o, o.return);
                break;
            case 30:
                break;
            default:
                ln(i, o, n)
            }
            t = t.sibling
        }
    }
    function xu(e, t) {
        var n = null;
        e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool),
        e = null,
        t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool),
        e !== n && (e != null && e.refCount++,
        n != null && cl(n))
    }
    function Su(e, t) {
        e = null,
        t.alternate !== null && (e = t.alternate.memoizedState.cache),
        t = t.memoizedState.cache,
        t !== e && (t.refCount++,
        e != null && cl(e))
    }
    function Dt(e, t, n, a) {
        if (t.subtreeFlags & 10256)
            for (t = t.child; t !== null; )
                qd(e, t, n, a),
                t = t.sibling
    }
    function qd(e, t, n, a) {
        var i = t.flags;
        switch (t.tag) {
        case 0:
        case 11:
        case 15:
            Dt(e, t, n, a),
            i & 2048 && wl(9, t);
            break;
        case 1:
            Dt(e, t, n, a);
            break;
        case 3:
            Dt(e, t, n, a),
            i & 2048 && (e = null,
            t.alternate !== null && (e = t.alternate.memoizedState.cache),
            t = t.memoizedState.cache,
            t !== e && (t.refCount++,
            e != null && cl(e)));
            break;
        case 12:
            if (i & 2048) {
                Dt(e, t, n, a),
                e = t.stateNode;
                try {
                    var o = t.memoizedProps
                      , h = o.id
                      , y = o.onPostCommit;
                    typeof y == "function" && y(h, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0)
                } catch (_) {
                    Te(t, t.return, _)
                }
            } else
                Dt(e, t, n, a);
            break;
        case 31:
            Dt(e, t, n, a);
            break;
        case 13:
            Dt(e, t, n, a);
            break;
        case 23:
            break;
        case 22:
            o = t.stateNode,
            h = t.alternate,
            t.memoizedState !== null ? o._visibility & 2 ? Dt(e, t, n, a) : _l(e, t) : o._visibility & 2 ? Dt(e, t, n, a) : (o._visibility |= 2,
            Oa(e, t, n, a, (t.subtreeFlags & 10256) !== 0 || !1)),
            i & 2048 && xu(h, t);
            break;
        case 24:
            Dt(e, t, n, a),
            i & 2048 && Su(t.alternate, t);
            break;
        default:
            Dt(e, t, n, a)
        }
    }
    function Oa(e, t, n, a, i) {
        for (i = i && ((t.subtreeFlags & 10256) !== 0 || !1),
        t = t.child; t !== null; ) {
            var o = e
              , h = t
              , y = n
              , _ = a
              , z = h.flags;
            switch (h.tag) {
            case 0:
            case 11:
            case 15:
                Oa(o, h, y, _, i),
                wl(8, h);
                break;
            case 23:
                break;
            case 22:
                var B = h.stateNode;
                h.memoizedState !== null ? B._visibility & 2 ? Oa(o, h, y, _, i) : _l(o, h) : (B._visibility |= 2,
                Oa(o, h, y, _, i)),
                i && z & 2048 && xu(h.alternate, h);
                break;
            case 24:
                Oa(o, h, y, _, i),
                i && z & 2048 && Su(h.alternate, h);
                break;
            default:
                Oa(o, h, y, _, i)
            }
            t = t.sibling
        }
    }
    function _l(e, t) {
        if (t.subtreeFlags & 10256)
            for (t = t.child; t !== null; ) {
                var n = e
                  , a = t
                  , i = a.flags;
                switch (a.tag) {
                case 22:
                    _l(n, a),
                    i & 2048 && xu(a.alternate, a);
                    break;
                case 24:
                    _l(n, a),
                    i & 2048 && Su(a.alternate, a);
                    break;
                default:
                    _l(n, a)
                }
                t = t.sibling
            }
    }
    var Al = 8192;
    function Ra(e, t, n) {
        if (e.subtreeFlags & Al)
            for (e = e.child; e !== null; )
                Gd(e, t, n),
                e = e.sibling
    }
    function Gd(e, t, n) {
        switch (e.tag) {
        case 26:
            Ra(e, t, n),
            e.flags & Al && e.memoizedState !== null && _0(n, Mt, e.memoizedState, e.memoizedProps);
            break;
        case 5:
            Ra(e, t, n);
            break;
        case 3:
        case 4:
            var a = Mt;
            Mt = rs(e.stateNode.containerInfo),
            Ra(e, t, n),
            Mt = a;
            break;
        case 22:
            e.memoizedState === null && (a = e.alternate,
            a !== null && a.memoizedState !== null ? (a = Al,
            Al = 16777216,
            Ra(e, t, n),
            Al = a) : Ra(e, t, n));
            break;
        default:
            Ra(e, t, n)
        }
    }
    function Yd(e) {
        var t = e.alternate;
        if (t !== null && (e = t.child,
        e !== null)) {
            t.child = null;
            do
                t = e.sibling,
                e.sibling = null,
                e = t;
            while (e !== null)
        }
    }
    function Tl(e) {
        var t = e.deletions;
        if ((e.flags & 16) !== 0) {
            if (t !== null)
                for (var n = 0; n < t.length; n++) {
                    var a = t[n];
                    Ze = a,
                    kd(a, e)
                }
            Yd(e)
        }
        if (e.subtreeFlags & 10256)
            for (e = e.child; e !== null; )
                Vd(e),
                e = e.sibling
    }
    function Vd(e) {
        switch (e.tag) {
        case 0:
        case 11:
        case 15:
            Tl(e),
            e.flags & 2048 && Cn(9, e, e.return);
            break;
        case 3:
            Tl(e);
            break;
        case 12:
            Tl(e);
            break;
        case 22:
            var t = e.stateNode;
            e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3,
            Ki(e)) : Tl(e);
            break;
        default:
            Tl(e)
        }
    }
    function Ki(e) {
        var t = e.deletions;
        if ((e.flags & 16) !== 0) {
            if (t !== null)
                for (var n = 0; n < t.length; n++) {
                    var a = t[n];
                    Ze = a,
                    kd(a, e)
                }
            Yd(e)
        }
        for (e = e.child; e !== null; ) {
            switch (t = e,
            t.tag) {
            case 0:
            case 11:
            case 15:
                Cn(8, t, t.return),
                Ki(t);
                break;
            case 22:
                n = t.stateNode,
                n._visibility & 2 && (n._visibility &= -3,
                Ki(t));
                break;
            default:
                Ki(t)
            }
            e = e.sibling
        }
    }
    function kd(e, t) {
        for (; Ze !== null; ) {
            var n = Ze;
            switch (n.tag) {
            case 0:
            case 11:
            case 15:
                Cn(8, n, t);
                break;
            case 23:
            case 22:
                if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
                    var a = n.memoizedState.cachePool.pool;
                    a != null && a.refCount++
                }
                break;
            case 24:
                cl(n.memoizedState.cache)
            }
            if (a = n.child,
            a !== null)
                a.return = n,
                Ze = a;
            else
                e: for (n = e; Ze !== null; ) {
                    a = Ze;
                    var i = a.sibling
                      , o = a.return;
                    if (Md(a),
                    a === n) {
                        Ze = null;
                        break e
                    }
                    if (i !== null) {
                        i.return = o,
                        Ze = i;
                        break e
                    }
                    Ze = o
                }
        }
    }
    var Gy = {
        getCacheForType: function(e) {
            var t = We(Ge)
              , n = t.data.get(e);
            return n === void 0 && (n = e(),
            t.data.set(e, n)),
            n
        },
        cacheSignal: function() {
            return We(Ge).controller.signal
        }
    }
      , Yy = typeof WeakMap == "function" ? WeakMap : Map
      , Ee = 0
      , ze = null
      , he = null
      , ge = 0
      , Ae = 0
      , vt = null
      , _n = !1
      , Na = !1
      , Eu = !1
      , sn = 0
      , Ue = 0
      , An = 0
      , ta = 0
      , wu = 0
      , bt = 0
      , za = 0
      , Ol = null
      , ot = null
      , Cu = !1
      , Ji = 0
      , Qd = 0
      , $i = 1 / 0
      , Wi = null
      , Tn = null
      , Qe = 0
      , On = null
      , La = null
      , rn = 0
      , _u = 0
      , Au = null
      , Xd = null
      , Rl = 0
      , Tu = null;
    function xt() {
        return (Ee & 2) !== 0 && ge !== 0 ? ge & -ge : U.T !== null ? Mu() : sc()
    }
    function Fd() {
        if (bt === 0)
            if ((ge & 536870912) === 0 || ve) {
                var e = ii;
                ii <<= 1,
                (ii & 3932160) === 0 && (ii = 262144),
                bt = e
            } else
                bt = 536870912;
        return e = pt.current,
        e !== null && (e.flags |= 32),
        bt
    }
    function ct(e, t, n) {
        (e === ze && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null) && (Ma(e, 0),
        Rn(e, ge, bt, !1)),
        $a(e, n),
        ((Ee & 2) === 0 || e !== ze) && (e === ze && ((Ee & 2) === 0 && (ta |= n),
        Ue === 4 && Rn(e, ge, bt, !1)),
        qt(e))
    }
    function Zd(e, t, n) {
        if ((Ee & 6) !== 0)
            throw Error(u(327));
        var a = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Ja(e, t)
          , i = a ? Qy(e, t) : Ru(e, t, !0)
          , o = a;
        do {
            if (i === 0) {
                Na && !a && Rn(e, t, 0, !1);
                break
            } else {
                if (n = e.current.alternate,
                o && !Vy(n)) {
                    i = Ru(e, t, !1),
                    o = !1;
                    continue
                }
                if (i === 2) {
                    if (o = t,
                    e.errorRecoveryDisabledLanes & o)
                        var h = 0;
                    else
                        h = e.pendingLanes & -536870913,
                        h = h !== 0 ? h : h & 536870912 ? 536870912 : 0;
                    if (h !== 0) {
                        t = h;
                        e: {
                            var y = e;
                            i = Ol;
                            var _ = y.current.memoizedState.isDehydrated;
                            if (_ && (Ma(y, h).flags |= 256),
                            h = Ru(y, h, !1),
                            h !== 2) {
                                if (Eu && !_) {
                                    y.errorRecoveryDisabledLanes |= o,
                                    ta |= o,
                                    i = 4;
                                    break e
                                }
                                o = ot,
                                ot = i,
                                o !== null && (ot === null ? ot = o : ot.push.apply(ot, o))
                            }
                            i = h
                        }
                        if (o = !1,
                        i !== 2)
                            continue
                    }
                }
                if (i === 1) {
                    Ma(e, 0),
                    Rn(e, t, 0, !0);
                    break
                }
                e: {
                    switch (a = e,
                    o = i,
                    o) {
                    case 0:
                    case 1:
                        throw Error(u(345));
                    case 4:
                        if ((t & 4194048) !== t)
                            break;
                    case 6:
                        Rn(a, t, bt, !_n);
                        break e;
                    case 2:
                        ot = null;
                        break;
                    case 3:
                    case 5:
                        break;
                    default:
                        throw Error(u(329))
                    }
                    if ((t & 62914560) === t && (i = Ji + 300 - ft(),
                    10 < i)) {
                        if (Rn(a, t, bt, !_n),
                        ri(a, 0, !0) !== 0)
                            break e;
                        rn = t,
                        a.timeoutHandle = Ch(Kd.bind(null, a, n, ot, Wi, Cu, t, bt, ta, za, _n, o, "Throttled", -0, 0), i);
                        break e
                    }
                    Kd(a, n, ot, Wi, Cu, t, bt, ta, za, _n, o, null, -0, 0)
                }
            }
            break
        } while (!0);
        qt(e)
    }
    function Kd(e, t, n, a, i, o, h, y, _, z, B, Y, L, D) {
        if (e.timeoutHandle = -1,
        Y = t.subtreeFlags,
        Y & 8192 || (Y & 16785408) === 16785408) {
            Y = {
                stylesheets: null,
                count: 0,
                imgCount: 0,
                imgBytes: 0,
                suspenseyImages: [],
                waitingForImages: !0,
                waitingForViewTransition: !1,
                unsuspend: Xt
            },
            Gd(t, o, Y);
            var $ = (o & 62914560) === o ? Ji - ft() : (o & 4194048) === o ? Qd - ft() : 0;
            if ($ = A0(Y, $),
            $ !== null) {
                rn = o,
                e.cancelPendingCommit = $(nh.bind(null, e, t, o, n, a, i, h, y, _, B, Y, null, L, D)),
                Rn(e, o, h, !z);
                return
            }
        }
        nh(e, t, o, n, a, i, h, y, _)
    }
    function Vy(e) {
        for (var t = e; ; ) {
            var n = t.tag;
            if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue,
            n !== null && (n = n.stores,
            n !== null)))
                for (var a = 0; a < n.length; a++) {
                    var i = n[a]
                      , o = i.getSnapshot;
                    i = i.value;
                    try {
                        if (!mt(o(), i))
                            return !1
                    } catch {
                        return !1
                    }
                }
            if (n = t.child,
            t.subtreeFlags & 16384 && n !== null)
                n.return = t,
                t = n;
            else {
                if (t === e)
                    break;
                for (; t.sibling === null; ) {
                    if (t.return === null || t.return === e)
                        return !0;
                    t = t.return
                }
                t.sibling.return = t.return,
                t = t.sibling
            }
        }
        return !0
    }
    function Rn(e, t, n, a) {
        t &= ~wu,
        t &= ~ta,
        e.suspendedLanes |= t,
        e.pingedLanes &= ~t,
        a && (e.warmLanes |= t),
        a = e.expirationTimes;
        for (var i = t; 0 < i; ) {
            var o = 31 - ht(i)
              , h = 1 << o;
            a[o] = -1,
            i &= ~h
        }
        n !== 0 && ac(e, n, t)
    }
    function Ii() {
        return (Ee & 6) === 0 ? (Nl(0),
        !1) : !0
    }
    function Ou() {
        if (he !== null) {
            if (Ae === 0)
                var e = he.return;
            else
                e = he,
                Jt = Fn = null,
                Qr(e),
                wa = null,
                dl = 0,
                e = he;
            for (; e !== null; )
                _d(e.alternate, e),
                e = e.return;
            he = null
        }
    }
    function Ma(e, t) {
        var n = e.timeoutHandle;
        n !== -1 && (e.timeoutHandle = -1,
        u0(n)),
        n = e.cancelPendingCommit,
        n !== null && (e.cancelPendingCommit = null,
        n()),
        rn = 0,
        Ou(),
        ze = e,
        he = n = Zt(e.current, null),
        ge = t,
        Ae = 0,
        vt = null,
        _n = !1,
        Na = Ja(e, t),
        Eu = !1,
        za = bt = wu = ta = An = Ue = 0,
        ot = Ol = null,
        Cu = !1,
        (t & 8) !== 0 && (t |= t & 32);
        var a = e.entangledLanes;
        if (a !== 0)
            for (e = e.entanglements,
            a &= t; 0 < a; ) {
                var i = 31 - ht(a)
                  , o = 1 << i;
                t |= e[i],
                a &= ~o
            }
        return sn = t,
        bi(),
        n
    }
    function Jd(e, t) {
        re = null,
        U.H = xl,
        t === Ea || t === Ti ? (t = ff(),
        Ae = 3) : t === Lr ? (t = ff(),
        Ae = 4) : Ae = t === su ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1,
        vt = t,
        he === null && (Ue = 1,
        Yi(e, Ct(t, e.current)))
    }
    function $d() {
        var e = pt.current;
        return e === null ? !0 : (ge & 4194048) === ge ? Ot === null : (ge & 62914560) === ge || (ge & 536870912) !== 0 ? e === Ot : !1
    }
    function Wd() {
        var e = U.H;
        return U.H = xl,
        e === null ? xl : e
    }
    function Id() {
        var e = U.A;
        return U.A = Gy,
        e
    }
    function Pi() {
        Ue = 4,
        _n || (ge & 4194048) !== ge && pt.current !== null || (Na = !0),
        (An & 134217727) === 0 && (ta & 134217727) === 0 || ze === null || Rn(ze, ge, bt, !1)
    }
    function Ru(e, t, n) {
        var a = Ee;
        Ee |= 2;
        var i = Wd()
          , o = Id();
        (ze !== e || ge !== t) && (Wi = null,
        Ma(e, t)),
        t = !1;
        var h = Ue;
        e: do
            try {
                if (Ae !== 0 && he !== null) {
                    var y = he
                      , _ = vt;
                    switch (Ae) {
                    case 8:
                        Ou(),
                        h = 6;
                        break e;
                    case 3:
                    case 2:
                    case 9:
                    case 6:
                        pt.current === null && (t = !0);
                        var z = Ae;
                        if (Ae = 0,
                        vt = null,
                        Da(e, y, _, z),
                        n && Na) {
                            h = 0;
                            break e
                        }
                        break;
                    default:
                        z = Ae,
                        Ae = 0,
                        vt = null,
                        Da(e, y, _, z)
                    }
                }
                ky(),
                h = Ue;
                break
            } catch (B) {
                Jd(e, B)
            }
        while (!0);
        return t && e.shellSuspendCounter++,
        Jt = Fn = null,
        Ee = a,
        U.H = i,
        U.A = o,
        he === null && (ze = null,
        ge = 0,
        bi()),
        h
    }
    function ky() {
        for (; he !== null; )
            Pd(he)
    }
    function Qy(e, t) {
        var n = Ee;
        Ee |= 2;
        var a = Wd()
          , i = Id();
        ze !== e || ge !== t ? (Wi = null,
        $i = ft() + 500,
        Ma(e, t)) : Na = Ja(e, t);
        e: do
            try {
                if (Ae !== 0 && he !== null) {
                    t = he;
                    var o = vt;
                    t: switch (Ae) {
                    case 1:
                        Ae = 0,
                        vt = null,
                        Da(e, t, o, 1);
                        break;
                    case 2:
                    case 9:
                        if (of(o)) {
                            Ae = 0,
                            vt = null,
                            eh(t);
                            break
                        }
                        t = function() {
                            Ae !== 2 && Ae !== 9 || ze !== e || (Ae = 7),
                            qt(e)
                        }
                        ,
                        o.then(t, t);
                        break e;
                    case 3:
                        Ae = 7;
                        break e;
                    case 4:
                        Ae = 5;
                        break e;
                    case 7:
                        of(o) ? (Ae = 0,
                        vt = null,
                        eh(t)) : (Ae = 0,
                        vt = null,
                        Da(e, t, o, 7));
                        break;
                    case 5:
                        var h = null;
                        switch (he.tag) {
                        case 26:
                            h = he.memoizedState;
                        case 5:
                        case 27:
                            var y = he;
                            if (h ? qh(h) : y.stateNode.complete) {
                                Ae = 0,
                                vt = null;
                                var _ = y.sibling;
                                if (_ !== null)
                                    he = _;
                                else {
                                    var z = y.return;
                                    z !== null ? (he = z,
                                    es(z)) : he = null
                                }
                                break t
                            }
                        }
                        Ae = 0,
                        vt = null,
                        Da(e, t, o, 5);
                        break;
                    case 6:
                        Ae = 0,
                        vt = null,
                        Da(e, t, o, 6);
                        break;
                    case 8:
                        Ou(),
                        Ue = 6;
                        break e;
                    default:
                        throw Error(u(462))
                    }
                }
                Xy();
                break
            } catch (B) {
                Jd(e, B)
            }
        while (!0);
        return Jt = Fn = null,
        U.H = a,
        U.A = i,
        Ee = n,
        he !== null ? 0 : (ze = null,
        ge = 0,
        bi(),
        Ue)
    }
    function Xy() {
        for (; he !== null && !mp(); )
            Pd(he)
    }
    function Pd(e) {
        var t = wd(e.alternate, e, sn);
        e.memoizedProps = e.pendingProps,
        t === null ? es(e) : he = t
    }
    function eh(e) {
        var t = e
          , n = t.alternate;
        switch (t.tag) {
        case 15:
        case 0:
            t = yd(n, t, t.pendingProps, t.type, void 0, ge);
            break;
        case 11:
            t = yd(n, t, t.pendingProps, t.type.render, t.ref, ge);
            break;
        case 5:
            Qr(t);
        default:
            _d(n, t),
            t = he = Wc(t, sn),
            t = wd(n, t, sn)
        }
        e.memoizedProps = e.pendingProps,
        t === null ? es(e) : he = t
    }
    function Da(e, t, n, a) {
        Jt = Fn = null,
        Qr(t),
        wa = null,
        dl = 0;
        var i = t.return;
        try {
            if (My(e, i, t, n, ge)) {
                Ue = 1,
                Yi(e, Ct(n, e.current)),
                he = null;
                return
            }
        } catch (o) {
            if (i !== null)
                throw he = i,
                o;
            Ue = 1,
            Yi(e, Ct(n, e.current)),
            he = null;
            return
        }
        t.flags & 32768 ? (ve || a === 1 ? e = !0 : Na || (ge & 536870912) !== 0 ? e = !1 : (_n = e = !0,
        (a === 2 || a === 9 || a === 3 || a === 6) && (a = pt.current,
        a !== null && a.tag === 13 && (a.flags |= 16384))),
        th(t, e)) : es(t)
    }
    function es(e) {
        var t = e;
        do {
            if ((t.flags & 32768) !== 0) {
                th(t, _n);
                return
            }
            e = t.return;
            var n = Uy(t.alternate, t, sn);
            if (n !== null) {
                he = n;
                return
            }
            if (t = t.sibling,
            t !== null) {
                he = t;
                return
            }
            he = t = e
        } while (t !== null);
        Ue === 0 && (Ue = 5)
    }
    function th(e, t) {
        do {
            var n = By(e.alternate, e);
            if (n !== null) {
                n.flags &= 32767,
                he = n;
                return
            }
            if (n = e.return,
            n !== null && (n.flags |= 32768,
            n.subtreeFlags = 0,
            n.deletions = null),
            !t && (e = e.sibling,
            e !== null)) {
                he = e;
                return
            }
            he = e = n
        } while (e !== null);
        Ue = 6,
        he = null
    }
    function nh(e, t, n, a, i, o, h, y, _) {
        e.cancelPendingCommit = null;
        do
            ts();
        while (Qe !== 0);
        if ((Ee & 6) !== 0)
            throw Error(u(327));
        if (t !== null) {
            if (t === e.current)
                throw Error(u(177));
            if (o = t.lanes | t.childLanes,
            o |= yr,
            Cp(e, n, o, h, y, _),
            e === ze && (he = ze = null,
            ge = 0),
            La = t,
            On = e,
            rn = n,
            _u = o,
            Au = i,
            Xd = a,
            (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null,
            e.callbackPriority = 0,
            Jy(ai, function() {
                return rh(),
                null
            })) : (e.callbackNode = null,
            e.callbackPriority = 0),
            a = (t.flags & 13878) !== 0,
            (t.subtreeFlags & 13878) !== 0 || a) {
                a = U.T,
                U.T = null,
                i = Q.p,
                Q.p = 2,
                h = Ee,
                Ee |= 4;
                try {
                    Hy(e, t, n)
                } finally {
                    Ee = h,
                    Q.p = i,
                    U.T = a
                }
            }
            Qe = 1,
            ah(),
            lh(),
            ih()
        }
    }
    function ah() {
        if (Qe === 1) {
            Qe = 0;
            var e = On
              , t = La
              , n = (t.flags & 13878) !== 0;
            if ((t.subtreeFlags & 13878) !== 0 || n) {
                n = U.T,
                U.T = null;
                var a = Q.p;
                Q.p = 2;
                var i = Ee;
                Ee |= 4;
                try {
                    Bd(t, e);
                    var o = Yu
                      , h = Vc(e.containerInfo)
                      , y = o.focusedElem
                      , _ = o.selectionRange;
                    if (h !== y && y && y.ownerDocument && Yc(y.ownerDocument.documentElement, y)) {
                        if (_ !== null && dr(y)) {
                            var z = _.start
                              , B = _.end;
                            if (B === void 0 && (B = z),
                            "selectionStart"in y)
                                y.selectionStart = z,
                                y.selectionEnd = Math.min(B, y.value.length);
                            else {
                                var Y = y.ownerDocument || document
                                  , L = Y && Y.defaultView || window;
                                if (L.getSelection) {
                                    var D = L.getSelection()
                                      , $ = y.textContent.length
                                      , ae = Math.min(_.start, $)
                                      , Ne = _.end === void 0 ? ae : Math.min(_.end, $);
                                    !D.extend && ae > Ne && (h = Ne,
                                    Ne = ae,
                                    ae = h);
                                    var R = Gc(y, ae)
                                      , T = Gc(y, Ne);
                                    if (R && T && (D.rangeCount !== 1 || D.anchorNode !== R.node || D.anchorOffset !== R.offset || D.focusNode !== T.node || D.focusOffset !== T.offset)) {
                                        var N = Y.createRange();
                                        N.setStart(R.node, R.offset),
                                        D.removeAllRanges(),
                                        ae > Ne ? (D.addRange(N),
                                        D.extend(T.node, T.offset)) : (N.setEnd(T.node, T.offset),
                                        D.addRange(N))
                                    }
                                }
                            }
                        }
                        for (Y = [],
                        D = y; D = D.parentNode; )
                            D.nodeType === 1 && Y.push({
                                element: D,
                                left: D.scrollLeft,
                                top: D.scrollTop
                            });
                        for (typeof y.focus == "function" && y.focus(),
                        y = 0; y < Y.length; y++) {
                            var q = Y[y];
                            q.element.scrollLeft = q.left,
                            q.element.scrollTop = q.top
                        }
                    }
                    hs = !!Gu,
                    Yu = Gu = null
                } finally {
                    Ee = i,
                    Q.p = a,
                    U.T = n
                }
            }
            e.current = t,
            Qe = 2
        }
    }
    function lh() {
        if (Qe === 2) {
            Qe = 0;
            var e = On
              , t = La
              , n = (t.flags & 8772) !== 0;
            if ((t.subtreeFlags & 8772) !== 0 || n) {
                n = U.T,
                U.T = null;
                var a = Q.p;
                Q.p = 2;
                var i = Ee;
                Ee |= 4;
                try {
                    Ld(e, t.alternate, t)
                } finally {
                    Ee = i,
                    Q.p = a,
                    U.T = n
                }
            }
            Qe = 3
        }
    }
    function ih() {
        if (Qe === 4 || Qe === 3) {
            Qe = 0,
            gp();
            var e = On
              , t = La
              , n = rn
              , a = Xd;
            (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Qe = 5 : (Qe = 0,
            La = On = null,
            sh(e, e.pendingLanes));
            var i = e.pendingLanes;
            if (i === 0 && (Tn = null),
            Zs(n),
            t = t.stateNode,
            dt && typeof dt.onCommitFiberRoot == "function")
                try {
                    dt.onCommitFiberRoot(Ka, t, void 0, (t.current.flags & 128) === 128)
                } catch {}
            if (a !== null) {
                t = U.T,
                i = Q.p,
                Q.p = 2,
                U.T = null;
                try {
                    for (var o = e.onRecoverableError, h = 0; h < a.length; h++) {
                        var y = a[h];
                        o(y.value, {
                            componentStack: y.stack
                        })
                    }
                } finally {
                    U.T = t,
                    Q.p = i
                }
            }
            (rn & 3) !== 0 && ts(),
            qt(e),
            i = e.pendingLanes,
            (n & 261930) !== 0 && (i & 42) !== 0 ? e === Tu ? Rl++ : (Rl = 0,
            Tu = e) : Rl = 0,
            Nl(0)
        }
    }
    function sh(e, t) {
        (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache,
        t != null && (e.pooledCache = null,
        cl(t)))
    }
    function ts() {
        return ah(),
        lh(),
        ih(),
        rh()
    }
    function rh() {
        if (Qe !== 5)
            return !1;
        var e = On
          , t = _u;
        _u = 0;
        var n = Zs(rn)
          , a = U.T
          , i = Q.p;
        try {
            Q.p = 32 > n ? 32 : n,
            U.T = null,
            n = Au,
            Au = null;
            var o = On
              , h = rn;
            if (Qe = 0,
            La = On = null,
            rn = 0,
            (Ee & 6) !== 0)
                throw Error(u(331));
            var y = Ee;
            if (Ee |= 4,
            Vd(o.current),
            qd(o, o.current, h, n),
            Ee = y,
            Nl(0, !1),
            dt && typeof dt.onPostCommitFiberRoot == "function")
                try {
                    dt.onPostCommitFiberRoot(Ka, o)
                } catch {}
            return !0
        } finally {
            Q.p = i,
            U.T = a,
            sh(e, t)
        }
    }
    function uh(e, t, n) {
        t = Ct(n, t),
        t = iu(e.stateNode, t, 2),
        e = Sn(e, t, 2),
        e !== null && ($a(e, 2),
        qt(e))
    }
    function Te(e, t, n) {
        if (e.tag === 3)
            uh(e, e, n);
        else
            for (; t !== null; ) {
                if (t.tag === 3) {
                    uh(t, e, n);
                    break
                } else if (t.tag === 1) {
                    var a = t.stateNode;
                    if (typeof t.type.getDerivedStateFromError == "function" || typeof a.componentDidCatch == "function" && (Tn === null || !Tn.has(a))) {
                        e = Ct(n, e),
                        n = od(2),
                        a = Sn(t, n, 2),
                        a !== null && (cd(n, a, t, e),
                        $a(a, 2),
                        qt(a));
                        break
                    }
                }
                t = t.return
            }
    }
    function Nu(e, t, n) {
        var a = e.pingCache;
        if (a === null) {
            a = e.pingCache = new Yy;
            var i = new Set;
            a.set(t, i)
        } else
            i = a.get(t),
            i === void 0 && (i = new Set,
            a.set(t, i));
        i.has(n) || (Eu = !0,
        i.add(n),
        e = Fy.bind(null, e, t, n),
        t.then(e, e))
    }
    function Fy(e, t, n) {
        var a = e.pingCache;
        a !== null && a.delete(t),
        e.pingedLanes |= e.suspendedLanes & n,
        e.warmLanes &= ~n,
        ze === e && (ge & n) === n && (Ue === 4 || Ue === 3 && (ge & 62914560) === ge && 300 > ft() - Ji ? (Ee & 2) === 0 && Ma(e, 0) : wu |= n,
        za === ge && (za = 0)),
        qt(e)
    }
    function oh(e, t) {
        t === 0 && (t = nc()),
        e = kn(e, t),
        e !== null && ($a(e, t),
        qt(e))
    }
    function Zy(e) {
        var t = e.memoizedState
          , n = 0;
        t !== null && (n = t.retryLane),
        oh(e, n)
    }
    function Ky(e, t) {
        var n = 0;
        switch (e.tag) {
        case 31:
        case 13:
            var a = e.stateNode
              , i = e.memoizedState;
            i !== null && (n = i.retryLane);
            break;
        case 19:
            a = e.stateNode;
            break;
        case 22:
            a = e.stateNode._retryCache;
            break;
        default:
            throw Error(u(314))
        }
        a !== null && a.delete(t),
        oh(e, n)
    }
    function Jy(e, t) {
        return ks(e, t)
    }
    var ns = null
      , ja = null
      , zu = !1
      , as = !1
      , Lu = !1
      , Nn = 0;
    function qt(e) {
        e !== ja && e.next === null && (ja === null ? ns = ja = e : ja = ja.next = e),
        as = !0,
        zu || (zu = !0,
        Wy())
    }
    function Nl(e, t) {
        if (!Lu && as) {
            Lu = !0;
            do
                for (var n = !1, a = ns; a !== null; ) {
                    if (e !== 0) {
                        var i = a.pendingLanes;
                        if (i === 0)
                            var o = 0;
                        else {
                            var h = a.suspendedLanes
                              , y = a.pingedLanes;
                            o = (1 << 31 - ht(42 | e) + 1) - 1,
                            o &= i & ~(h & ~y),
                            o = o & 201326741 ? o & 201326741 | 1 : o ? o | 2 : 0
                        }
                        o !== 0 && (n = !0,
                        hh(a, o))
                    } else
                        o = ge,
                        o = ri(a, a === ze ? o : 0, a.cancelPendingCommit !== null || a.timeoutHandle !== -1),
                        (o & 3) === 0 || Ja(a, o) || (n = !0,
                        hh(a, o));
                    a = a.next
                }
            while (n);
            Lu = !1
        }
    }
    function $y() {
        ch()
    }
    function ch() {
        as = zu = !1;
        var e = 0;
        Nn !== 0 && r0() && (e = Nn);
        for (var t = ft(), n = null, a = ns; a !== null; ) {
            var i = a.next
              , o = fh(a, t);
            o === 0 ? (a.next = null,
            n === null ? ns = i : n.next = i,
            i === null && (ja = n)) : (n = a,
            (e !== 0 || (o & 3) !== 0) && (as = !0)),
            a = i
        }
        Qe !== 0 && Qe !== 5 || Nl(e),
        Nn !== 0 && (Nn = 0)
    }
    function fh(e, t) {
        for (var n = e.suspendedLanes, a = e.pingedLanes, i = e.expirationTimes, o = e.pendingLanes & -62914561; 0 < o; ) {
            var h = 31 - ht(o)
              , y = 1 << h
              , _ = i[h];
            _ === -1 ? ((y & n) === 0 || (y & a) !== 0) && (i[h] = wp(y, t)) : _ <= t && (e.expiredLanes |= y),
            o &= ~y
        }
        if (t = ze,
        n = ge,
        n = ri(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1),
        a = e.callbackNode,
        n === 0 || e === t && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null)
            return a !== null && a !== null && Qs(a),
            e.callbackNode = null,
            e.callbackPriority = 0;
        if ((n & 3) === 0 || Ja(e, n)) {
            if (t = n & -n,
            t === e.callbackPriority)
                return t;
            switch (a !== null && Qs(a),
            Zs(n)) {
            case 2:
            case 8:
                n = ec;
                break;
            case 32:
                n = ai;
                break;
            case 268435456:
                n = tc;
                break;
            default:
                n = ai
            }
            return a = dh.bind(null, e),
            n = ks(n, a),
            e.callbackPriority = t,
            e.callbackNode = n,
            t
        }
        return a !== null && a !== null && Qs(a),
        e.callbackPriority = 2,
        e.callbackNode = null,
        2
    }
    function dh(e, t) {
        if (Qe !== 0 && Qe !== 5)
            return e.callbackNode = null,
            e.callbackPriority = 0,
            null;
        var n = e.callbackNode;
        if (ts() && e.callbackNode !== n)
            return null;
        var a = ge;
        return a = ri(e, e === ze ? a : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1),
        a === 0 ? null : (Zd(e, a, t),
        fh(e, ft()),
        e.callbackNode != null && e.callbackNode === n ? dh.bind(null, e) : null)
    }
    function hh(e, t) {
        if (ts())
            return null;
        Zd(e, t, !0)
    }
    function Wy() {
        o0(function() {
            (Ee & 6) !== 0 ? ks(Po, $y) : ch()
        })
    }
    function Mu() {
        if (Nn === 0) {
            var e = xa;
            e === 0 && (e = li,
            li <<= 1,
            (li & 261888) === 0 && (li = 256)),
            Nn = e
        }
        return Nn
    }
    function mh(e) {
        return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : fi("" + e)
    }
    function gh(e, t) {
        var n = t.ownerDocument.createElement("input");
        return n.name = t.name,
        n.value = t.value,
        e.id && n.setAttribute("form", e.id),
        t.parentNode.insertBefore(n, t),
        e = new FormData(e),
        n.parentNode.removeChild(n),
        e
    }
    function Iy(e, t, n, a, i) {
        if (t === "submit" && n && n.stateNode === i) {
            var o = mh((i[lt] || null).action)
              , h = a.submitter;
            h && (t = (t = h[lt] || null) ? mh(t.formAction) : h.getAttribute("formAction"),
            t !== null && (o = t,
            h = null));
            var y = new gi("action","action",null,a,i);
            e.push({
                event: y,
                listeners: [{
                    instance: null,
                    listener: function() {
                        if (a.defaultPrevented) {
                            if (Nn !== 0) {
                                var _ = h ? gh(i, h) : new FormData(i);
                                Pr(n, {
                                    pending: !0,
                                    data: _,
                                    method: i.method,
                                    action: o
                                }, null, _)
                            }
                        } else
                            typeof o == "function" && (y.preventDefault(),
                            _ = h ? gh(i, h) : new FormData(i),
                            Pr(n, {
                                pending: !0,
                                data: _,
                                method: i.method,
                                action: o
                            }, o, _))
                    },
                    currentTarget: i
                }]
            })
        }
    }
    for (var Du = 0; Du < pr.length; Du++) {
        var ju = pr[Du]
          , Py = ju.toLowerCase()
          , e0 = ju[0].toUpperCase() + ju.slice(1);
        Lt(Py, "on" + e0)
    }
    Lt(Xc, "onAnimationEnd"),
    Lt(Fc, "onAnimationIteration"),
    Lt(Zc, "onAnimationStart"),
    Lt("dblclick", "onDoubleClick"),
    Lt("focusin", "onFocus"),
    Lt("focusout", "onBlur"),
    Lt(py, "onTransitionRun"),
    Lt(yy, "onTransitionStart"),
    Lt(vy, "onTransitionCancel"),
    Lt(Kc, "onTransitionEnd"),
    sa("onMouseEnter", ["mouseout", "mouseover"]),
    sa("onMouseLeave", ["mouseout", "mouseover"]),
    sa("onPointerEnter", ["pointerout", "pointerover"]),
    sa("onPointerLeave", ["pointerout", "pointerover"]),
    qn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")),
    qn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),
    qn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    qn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")),
    qn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")),
    qn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var zl = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ")
      , t0 = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(zl));
    function ph(e, t) {
        t = (t & 4) !== 0;
        for (var n = 0; n < e.length; n++) {
            var a = e[n]
              , i = a.event;
            a = a.listeners;
            e: {
                var o = void 0;
                if (t)
                    for (var h = a.length - 1; 0 <= h; h--) {
                        var y = a[h]
                          , _ = y.instance
                          , z = y.currentTarget;
                        if (y = y.listener,
                        _ !== o && i.isPropagationStopped())
                            break e;
                        o = y,
                        i.currentTarget = z;
                        try {
                            o(i)
                        } catch (B) {
                            vi(B)
                        }
                        i.currentTarget = null,
                        o = _
                    }
                else
                    for (h = 0; h < a.length; h++) {
                        if (y = a[h],
                        _ = y.instance,
                        z = y.currentTarget,
                        y = y.listener,
                        _ !== o && i.isPropagationStopped())
                            break e;
                        o = y,
                        i.currentTarget = z;
                        try {
                            o(i)
                        } catch (B) {
                            vi(B)
                        }
                        i.currentTarget = null,
                        o = _
                    }
            }
        }
    }
    function me(e, t) {
        var n = t[Ks];
        n === void 0 && (n = t[Ks] = new Set);
        var a = e + "__bubble";
        n.has(a) || (yh(t, e, 2, !1),
        n.add(a))
    }
    function Uu(e, t, n) {
        var a = 0;
        t && (a |= 4),
        yh(n, e, a, t)
    }
    var ls = "_reactListening" + Math.random().toString(36).slice(2);
    function Bu(e) {
        if (!e[ls]) {
            e[ls] = !0,
            oc.forEach(function(n) {
                n !== "selectionchange" && (t0.has(n) || Uu(n, !1, e),
                Uu(n, !0, e))
            });
            var t = e.nodeType === 9 ? e : e.ownerDocument;
            t === null || t[ls] || (t[ls] = !0,
            Uu("selectionchange", !1, t))
        }
    }
    function yh(e, t, n, a) {
        switch (Fh(t)) {
        case 2:
            var i = R0;
            break;
        case 8:
            i = N0;
            break;
        default:
            i = Iu
        }
        n = i.bind(null, t, n, e),
        i = void 0,
        !ar || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0),
        a ? i !== void 0 ? e.addEventListener(t, n, {
            capture: !0,
            passive: i
        }) : e.addEventListener(t, n, !0) : i !== void 0 ? e.addEventListener(t, n, {
            passive: i
        }) : e.addEventListener(t, n, !1)
    }
    function Hu(e, t, n, a, i) {
        var o = a;
        if ((t & 1) === 0 && (t & 2) === 0 && a !== null)
            e: for (; ; ) {
                if (a === null)
                    return;
                var h = a.tag;
                if (h === 3 || h === 4) {
                    var y = a.stateNode.containerInfo;
                    if (y === i)
                        break;
                    if (h === 4)
                        for (h = a.return; h !== null; ) {
                            var _ = h.tag;
                            if ((_ === 3 || _ === 4) && h.stateNode.containerInfo === i)
                                return;
                            h = h.return
                        }
                    for (; y !== null; ) {
                        if (h = aa(y),
                        h === null)
                            return;
                        if (_ = h.tag,
                        _ === 5 || _ === 6 || _ === 26 || _ === 27) {
                            a = o = h;
                            continue e
                        }
                        y = y.parentNode
                    }
                }
                a = a.return
            }
        Sc(function() {
            var z = o
              , B = tr(n)
              , Y = [];
            e: {
                var L = Jc.get(e);
                if (L !== void 0) {
                    var D = gi
                      , $ = e;
                    switch (e) {
                    case "keypress":
                        if (hi(n) === 0)
                            break e;
                    case "keydown":
                    case "keyup":
                        D = Kp;
                        break;
                    case "focusin":
                        $ = "focus",
                        D = rr;
                        break;
                    case "focusout":
                        $ = "blur",
                        D = rr;
                        break;
                    case "beforeblur":
                    case "afterblur":
                        D = rr;
                        break;
                    case "click":
                        if (n.button === 2)
                            break e;
                    case "auxclick":
                    case "dblclick":
                    case "mousedown":
                    case "mousemove":
                    case "mouseup":
                    case "mouseout":
                    case "mouseover":
                    case "contextmenu":
                        D = Cc;
                        break;
                    case "drag":
                    case "dragend":
                    case "dragenter":
                    case "dragexit":
                    case "dragleave":
                    case "dragover":
                    case "dragstart":
                    case "drop":
                        D = Up;
                        break;
                    case "touchcancel":
                    case "touchend":
                    case "touchmove":
                    case "touchstart":
                        D = Wp;
                        break;
                    case Xc:
                    case Fc:
                    case Zc:
                        D = qp;
                        break;
                    case Kc:
                        D = Pp;
                        break;
                    case "scroll":
                    case "scrollend":
                        D = Dp;
                        break;
                    case "wheel":
                        D = ty;
                        break;
                    case "copy":
                    case "cut":
                    case "paste":
                        D = Yp;
                        break;
                    case "gotpointercapture":
                    case "lostpointercapture":
                    case "pointercancel":
                    case "pointerdown":
                    case "pointermove":
                    case "pointerout":
                    case "pointerover":
                    case "pointerup":
                        D = Ac;
                        break;
                    case "toggle":
                    case "beforetoggle":
                        D = ay
                    }
                    var ae = (t & 4) !== 0
                      , Ne = !ae && (e === "scroll" || e === "scrollend")
                      , R = ae ? L !== null ? L + "Capture" : null : L;
                    ae = [];
                    for (var T = z, N; T !== null; ) {
                        var q = T;
                        if (N = q.stateNode,
                        q = q.tag,
                        q !== 5 && q !== 26 && q !== 27 || N === null || R === null || (q = Pa(T, R),
                        q != null && ae.push(Ll(T, q, N))),
                        Ne)
                            break;
                        T = T.return
                    }
                    0 < ae.length && (L = new D(L,$,null,n,B),
                    Y.push({
                        event: L,
                        listeners: ae
                    }))
                }
            }
            if ((t & 7) === 0) {
                e: {
                    if (L = e === "mouseover" || e === "pointerover",
                    D = e === "mouseout" || e === "pointerout",
                    L && n !== er && ($ = n.relatedTarget || n.fromElement) && (aa($) || $[na]))
                        break e;
                    if ((D || L) && (L = B.window === B ? B : (L = B.ownerDocument) ? L.defaultView || L.parentWindow : window,
                    D ? ($ = n.relatedTarget || n.toElement,
                    D = z,
                    $ = $ ? aa($) : null,
                    $ !== null && (Ne = f($),
                    ae = $.tag,
                    $ !== Ne || ae !== 5 && ae !== 27 && ae !== 6) && ($ = null)) : (D = null,
                    $ = z),
                    D !== $)) {
                        if (ae = Cc,
                        q = "onMouseLeave",
                        R = "onMouseEnter",
                        T = "mouse",
                        (e === "pointerout" || e === "pointerover") && (ae = Ac,
                        q = "onPointerLeave",
                        R = "onPointerEnter",
                        T = "pointer"),
                        Ne = D == null ? L : Ia(D),
                        N = $ == null ? L : Ia($),
                        L = new ae(q,T + "leave",D,n,B),
                        L.target = Ne,
                        L.relatedTarget = N,
                        q = null,
                        aa(B) === z && (ae = new ae(R,T + "enter",$,n,B),
                        ae.target = N,
                        ae.relatedTarget = Ne,
                        q = ae),
                        Ne = q,
                        D && $)
                            t: {
                                for (ae = n0,
                                R = D,
                                T = $,
                                N = 0,
                                q = R; q; q = ae(q))
                                    N++;
                                q = 0;
                                for (var ee = T; ee; ee = ae(ee))
                                    q++;
                                for (; 0 < N - q; )
                                    R = ae(R),
                                    N--;
                                for (; 0 < q - N; )
                                    T = ae(T),
                                    q--;
                                for (; N--; ) {
                                    if (R === T || T !== null && R === T.alternate) {
                                        ae = R;
                                        break t
                                    }
                                    R = ae(R),
                                    T = ae(T)
                                }
                                ae = null
                            }
                        else
                            ae = null;
                        D !== null && vh(Y, L, D, ae, !1),
                        $ !== null && Ne !== null && vh(Y, Ne, $, ae, !0)
                    }
                }
                e: {
                    if (L = z ? Ia(z) : window,
                    D = L.nodeName && L.nodeName.toLowerCase(),
                    D === "select" || D === "input" && L.type === "file")
                        var xe = Dc;
                    else if (Lc(L))
                        if (jc)
                            xe = hy;
                        else {
                            xe = fy;
                            var P = cy
                        }
                    else
                        D = L.nodeName,
                        !D || D.toLowerCase() !== "input" || L.type !== "checkbox" && L.type !== "radio" ? z && Ps(z.elementType) && (xe = Dc) : xe = dy;
                    if (xe && (xe = xe(e, z))) {
                        Mc(Y, xe, n, B);
                        break e
                    }
                    P && P(e, L, z),
                    e === "focusout" && z && L.type === "number" && z.memoizedProps.value != null && Is(L, "number", L.value)
                }
                switch (P = z ? Ia(z) : window,
                e) {
                case "focusin":
                    (Lc(P) || P.contentEditable === "true") && (da = P,
                    hr = z,
                    rl = null);
                    break;
                case "focusout":
                    rl = hr = da = null;
                    break;
                case "mousedown":
                    mr = !0;
                    break;
                case "contextmenu":
                case "mouseup":
                case "dragend":
                    mr = !1,
                    kc(Y, n, B);
                    break;
                case "selectionchange":
                    if (gy)
                        break;
                case "keydown":
                case "keyup":
                    kc(Y, n, B)
                }
                var ce;
                if (or)
                    e: {
                        switch (e) {
                        case "compositionstart":
                            var pe = "onCompositionStart";
                            break e;
                        case "compositionend":
                            pe = "onCompositionEnd";
                            break e;
                        case "compositionupdate":
                            pe = "onCompositionUpdate";
                            break e
                        }
                        pe = void 0
                    }
                else
                    fa ? Nc(e, n) && (pe = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (pe = "onCompositionStart");
                pe && (Tc && n.locale !== "ko" && (fa || pe !== "onCompositionStart" ? pe === "onCompositionEnd" && fa && (ce = Ec()) : (mn = B,
                lr = "value"in mn ? mn.value : mn.textContent,
                fa = !0)),
                P = is(z, pe),
                0 < P.length && (pe = new _c(pe,e,null,n,B),
                Y.push({
                    event: pe,
                    listeners: P
                }),
                ce ? pe.data = ce : (ce = zc(n),
                ce !== null && (pe.data = ce)))),
                (ce = iy ? sy(e, n) : ry(e, n)) && (pe = is(z, "onBeforeInput"),
                0 < pe.length && (P = new _c("onBeforeInput","beforeinput",null,n,B),
                Y.push({
                    event: P,
                    listeners: pe
                }),
                P.data = ce)),
                Iy(Y, e, z, n, B)
            }
            ph(Y, t)
        })
    }
    function Ll(e, t, n) {
        return {
            instance: e,
            listener: t,
            currentTarget: n
        }
    }
    function is(e, t) {
        for (var n = t + "Capture", a = []; e !== null; ) {
            var i = e
              , o = i.stateNode;
            if (i = i.tag,
            i !== 5 && i !== 26 && i !== 27 || o === null || (i = Pa(e, n),
            i != null && a.unshift(Ll(e, i, o)),
            i = Pa(e, t),
            i != null && a.push(Ll(e, i, o))),
            e.tag === 3)
                return a;
            e = e.return
        }
        return []
    }
    function n0(e) {
        if (e === null)
            return null;
        do
            e = e.return;
        while (e && e.tag !== 5 && e.tag !== 27);
        return e || null
    }
    function vh(e, t, n, a, i) {
        for (var o = t._reactName, h = []; n !== null && n !== a; ) {
            var y = n
              , _ = y.alternate
              , z = y.stateNode;
            if (y = y.tag,
            _ !== null && _ === a)
                break;
            y !== 5 && y !== 26 && y !== 27 || z === null || (_ = z,
            i ? (z = Pa(n, o),
            z != null && h.unshift(Ll(n, z, _))) : i || (z = Pa(n, o),
            z != null && h.push(Ll(n, z, _)))),
            n = n.return
        }
        h.length !== 0 && e.push({
            event: t,
            listeners: h
        })
    }
    var a0 = /\r\n?/g
      , l0 = /\u0000|\uFFFD/g;
    function bh(e) {
        return (typeof e == "string" ? e : "" + e).replace(a0, `
`).replace(l0, "")
    }
    function xh(e, t) {
        return t = bh(t),
        bh(e) === t
    }
    function Re(e, t, n, a, i, o) {
        switch (n) {
        case "children":
            typeof a == "string" ? t === "body" || t === "textarea" && a === "" || ua(e, a) : (typeof a == "number" || typeof a == "bigint") && t !== "body" && ua(e, "" + a);
            break;
        case "className":
            oi(e, "class", a);
            break;
        case "tabIndex":
            oi(e, "tabindex", a);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            oi(e, n, a);
            break;
        case "style":
            bc(e, a, o);
            break;
        case "data":
            if (t !== "object") {
                oi(e, "data", a);
                break
            }
        case "src":
        case "href":
            if (a === "" && (t !== "a" || n !== "href")) {
                e.removeAttribute(n);
                break
            }
            if (a == null || typeof a == "function" || typeof a == "symbol" || typeof a == "boolean") {
                e.removeAttribute(n);
                break
            }
            a = fi("" + a),
            e.setAttribute(n, a);
            break;
        case "action":
        case "formAction":
            if (typeof a == "function") {
                e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
                break
            } else
                typeof o == "function" && (n === "formAction" ? (t !== "input" && Re(e, t, "name", i.name, i, null),
                Re(e, t, "formEncType", i.formEncType, i, null),
                Re(e, t, "formMethod", i.formMethod, i, null),
                Re(e, t, "formTarget", i.formTarget, i, null)) : (Re(e, t, "encType", i.encType, i, null),
                Re(e, t, "method", i.method, i, null),
                Re(e, t, "target", i.target, i, null)));
            if (a == null || typeof a == "symbol" || typeof a == "boolean") {
                e.removeAttribute(n);
                break
            }
            a = fi("" + a),
            e.setAttribute(n, a);
            break;
        case "onClick":
            a != null && (e.onclick = Xt);
            break;
        case "onScroll":
            a != null && me("scroll", e);
            break;
        case "onScrollEnd":
            a != null && me("scrollend", e);
            break;
        case "dangerouslySetInnerHTML":
            if (a != null) {
                if (typeof a != "object" || !("__html"in a))
                    throw Error(u(61));
                if (n = a.__html,
                n != null) {
                    if (i.children != null)
                        throw Error(u(60));
                    e.innerHTML = n
                }
            }
            break;
        case "multiple":
            e.multiple = a && typeof a != "function" && typeof a != "symbol";
            break;
        case "muted":
            e.muted = a && typeof a != "function" && typeof a != "symbol";
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
            break;
        case "autoFocus":
            break;
        case "xlinkHref":
            if (a == null || typeof a == "function" || typeof a == "boolean" || typeof a == "symbol") {
                e.removeAttribute("xlink:href");
                break
            }
            n = fi("" + a),
            e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
            break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
            a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(n, "" + a) : e.removeAttribute(n);
            break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
            a && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
            break;
        case "capture":
        case "download":
            a === !0 ? e.setAttribute(n, "") : a !== !1 && a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(n, a) : e.removeAttribute(n);
            break;
        case "cols":
        case "rows":
        case "size":
        case "span":
            a != null && typeof a != "function" && typeof a != "symbol" && !isNaN(a) && 1 <= a ? e.setAttribute(n, a) : e.removeAttribute(n);
            break;
        case "rowSpan":
        case "start":
            a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a) ? e.removeAttribute(n) : e.setAttribute(n, a);
            break;
        case "popover":
            me("beforetoggle", e),
            me("toggle", e),
            ui(e, "popover", a);
            break;
        case "xlinkActuate":
            Qt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", a);
            break;
        case "xlinkArcrole":
            Qt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", a);
            break;
        case "xlinkRole":
            Qt(e, "http://www.w3.org/1999/xlink", "xlink:role", a);
            break;
        case "xlinkShow":
            Qt(e, "http://www.w3.org/1999/xlink", "xlink:show", a);
            break;
        case "xlinkTitle":
            Qt(e, "http://www.w3.org/1999/xlink", "xlink:title", a);
            break;
        case "xlinkType":
            Qt(e, "http://www.w3.org/1999/xlink", "xlink:type", a);
            break;
        case "xmlBase":
            Qt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", a);
            break;
        case "xmlLang":
            Qt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", a);
            break;
        case "xmlSpace":
            Qt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", a);
            break;
        case "is":
            ui(e, "is", a);
            break;
        case "innerText":
        case "textContent":
            break;
        default:
            (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Lp.get(n) || n,
            ui(e, n, a))
        }
    }
    function qu(e, t, n, a, i, o) {
        switch (n) {
        case "style":
            bc(e, a, o);
            break;
        case "dangerouslySetInnerHTML":
            if (a != null) {
                if (typeof a != "object" || !("__html"in a))
                    throw Error(u(61));
                if (n = a.__html,
                n != null) {
                    if (i.children != null)
                        throw Error(u(60));
                    e.innerHTML = n
                }
            }
            break;
        case "children":
            typeof a == "string" ? ua(e, a) : (typeof a == "number" || typeof a == "bigint") && ua(e, "" + a);
            break;
        case "onScroll":
            a != null && me("scroll", e);
            break;
        case "onScrollEnd":
            a != null && me("scrollend", e);
            break;
        case "onClick":
            a != null && (e.onclick = Xt);
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
            break;
        case "innerText":
        case "textContent":
            break;
        default:
            if (!cc.hasOwnProperty(n))
                e: {
                    if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"),
                    t = n.slice(2, i ? n.length - 7 : void 0),
                    o = e[lt] || null,
                    o = o != null ? o[n] : null,
                    typeof o == "function" && e.removeEventListener(t, o, i),
                    typeof a == "function")) {
                        typeof o != "function" && o !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)),
                        e.addEventListener(t, a, i);
                        break e
                    }
                    n in e ? e[n] = a : a === !0 ? e.setAttribute(n, "") : ui(e, n, a)
                }
        }
    }
    function Pe(e, t, n) {
        switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
            break;
        case "img":
            me("error", e),
            me("load", e);
            var a = !1, i = !1, o;
            for (o in n)
                if (n.hasOwnProperty(o)) {
                    var h = n[o];
                    if (h != null)
                        switch (o) {
                        case "src":
                            a = !0;
                            break;
                        case "srcSet":
                            i = !0;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            throw Error(u(137, t));
                        default:
                            Re(e, t, o, h, n, null)
                        }
                }
            i && Re(e, t, "srcSet", n.srcSet, n, null),
            a && Re(e, t, "src", n.src, n, null);
            return;
        case "input":
            me("invalid", e);
            var y = o = h = i = null
              , _ = null
              , z = null;
            for (a in n)
                if (n.hasOwnProperty(a)) {
                    var B = n[a];
                    if (B != null)
                        switch (a) {
                        case "name":
                            i = B;
                            break;
                        case "type":
                            h = B;
                            break;
                        case "checked":
                            _ = B;
                            break;
                        case "defaultChecked":
                            z = B;
                            break;
                        case "value":
                            o = B;
                            break;
                        case "defaultValue":
                            y = B;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (B != null)
                                throw Error(u(137, t));
                            break;
                        default:
                            Re(e, t, a, B, n, null)
                        }
                }
            gc(e, o, y, _, z, h, i, !1);
            return;
        case "select":
            me("invalid", e),
            a = h = o = null;
            for (i in n)
                if (n.hasOwnProperty(i) && (y = n[i],
                y != null))
                    switch (i) {
                    case "value":
                        o = y;
                        break;
                    case "defaultValue":
                        h = y;
                        break;
                    case "multiple":
                        a = y;
                    default:
                        Re(e, t, i, y, n, null)
                    }
            t = o,
            n = h,
            e.multiple = !!a,
            t != null ? ra(e, !!a, t, !1) : n != null && ra(e, !!a, n, !0);
            return;
        case "textarea":
            me("invalid", e),
            o = i = a = null;
            for (h in n)
                if (n.hasOwnProperty(h) && (y = n[h],
                y != null))
                    switch (h) {
                    case "value":
                        a = y;
                        break;
                    case "defaultValue":
                        i = y;
                        break;
                    case "children":
                        o = y;
                        break;
                    case "dangerouslySetInnerHTML":
                        if (y != null)
                            throw Error(u(91));
                        break;
                    default:
                        Re(e, t, h, y, n, null)
                    }
            yc(e, a, i, o);
            return;
        case "option":
            for (_ in n)
                n.hasOwnProperty(_) && (a = n[_],
                a != null) && (_ === "selected" ? e.selected = a && typeof a != "function" && typeof a != "symbol" : Re(e, t, _, a, n, null));
            return;
        case "dialog":
            me("beforetoggle", e),
            me("toggle", e),
            me("cancel", e),
            me("close", e);
            break;
        case "iframe":
        case "object":
            me("load", e);
            break;
        case "video":
        case "audio":
            for (a = 0; a < zl.length; a++)
                me(zl[a], e);
            break;
        case "image":
            me("error", e),
            me("load", e);
            break;
        case "details":
            me("toggle", e);
            break;
        case "embed":
        case "source":
        case "link":
            me("error", e),
            me("load", e);
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
            for (z in n)
                if (n.hasOwnProperty(z) && (a = n[z],
                a != null))
                    switch (z) {
                    case "children":
                    case "dangerouslySetInnerHTML":
                        throw Error(u(137, t));
                    default:
                        Re(e, t, z, a, n, null)
                    }
            return;
        default:
            if (Ps(t)) {
                for (B in n)
                    n.hasOwnProperty(B) && (a = n[B],
                    a !== void 0 && qu(e, t, B, a, n, void 0));
                return
            }
        }
        for (y in n)
            n.hasOwnProperty(y) && (a = n[y],
            a != null && Re(e, t, y, a, n, null))
    }
    function i0(e, t, n, a) {
        switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
            break;
        case "input":
            var i = null
              , o = null
              , h = null
              , y = null
              , _ = null
              , z = null
              , B = null;
            for (D in n) {
                var Y = n[D];
                if (n.hasOwnProperty(D) && Y != null)
                    switch (D) {
                    case "checked":
                        break;
                    case "value":
                        break;
                    case "defaultValue":
                        _ = Y;
                    default:
                        a.hasOwnProperty(D) || Re(e, t, D, null, a, Y)
                    }
            }
            for (var L in a) {
                var D = a[L];
                if (Y = n[L],
                a.hasOwnProperty(L) && (D != null || Y != null))
                    switch (L) {
                    case "type":
                        o = D;
                        break;
                    case "name":
                        i = D;
                        break;
                    case "checked":
                        z = D;
                        break;
                    case "defaultChecked":
                        B = D;
                        break;
                    case "value":
                        h = D;
                        break;
                    case "defaultValue":
                        y = D;
                        break;
                    case "children":
                    case "dangerouslySetInnerHTML":
                        if (D != null)
                            throw Error(u(137, t));
                        break;
                    default:
                        D !== Y && Re(e, t, L, D, a, Y)
                    }
            }
            Ws(e, h, y, _, z, B, o, i);
            return;
        case "select":
            D = h = y = L = null;
            for (o in n)
                if (_ = n[o],
                n.hasOwnProperty(o) && _ != null)
                    switch (o) {
                    case "value":
                        break;
                    case "multiple":
                        D = _;
                    default:
                        a.hasOwnProperty(o) || Re(e, t, o, null, a, _)
                    }
            for (i in a)
                if (o = a[i],
                _ = n[i],
                a.hasOwnProperty(i) && (o != null || _ != null))
                    switch (i) {
                    case "value":
                        L = o;
                        break;
                    case "defaultValue":
                        y = o;
                        break;
                    case "multiple":
                        h = o;
                    default:
                        o !== _ && Re(e, t, i, o, a, _)
                    }
            t = y,
            n = h,
            a = D,
            L != null ? ra(e, !!n, L, !1) : !!a != !!n && (t != null ? ra(e, !!n, t, !0) : ra(e, !!n, n ? [] : "", !1));
            return;
        case "textarea":
            D = L = null;
            for (y in n)
                if (i = n[y],
                n.hasOwnProperty(y) && i != null && !a.hasOwnProperty(y))
                    switch (y) {
                    case "value":
                        break;
                    case "children":
                        break;
                    default:
                        Re(e, t, y, null, a, i)
                    }
            for (h in a)
                if (i = a[h],
                o = n[h],
                a.hasOwnProperty(h) && (i != null || o != null))
                    switch (h) {
                    case "value":
                        L = i;
                        break;
                    case "defaultValue":
                        D = i;
                        break;
                    case "children":
                        break;
                    case "dangerouslySetInnerHTML":
                        if (i != null)
                            throw Error(u(91));
                        break;
                    default:
                        i !== o && Re(e, t, h, i, a, o)
                    }
            pc(e, L, D);
            return;
        case "option":
            for (var $ in n)
                L = n[$],
                n.hasOwnProperty($) && L != null && !a.hasOwnProperty($) && ($ === "selected" ? e.selected = !1 : Re(e, t, $, null, a, L));
            for (_ in a)
                L = a[_],
                D = n[_],
                a.hasOwnProperty(_) && L !== D && (L != null || D != null) && (_ === "selected" ? e.selected = L && typeof L != "function" && typeof L != "symbol" : Re(e, t, _, L, a, D));
            return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
            for (var ae in n)
                L = n[ae],
                n.hasOwnProperty(ae) && L != null && !a.hasOwnProperty(ae) && Re(e, t, ae, null, a, L);
            for (z in a)
                if (L = a[z],
                D = n[z],
                a.hasOwnProperty(z) && L !== D && (L != null || D != null))
                    switch (z) {
                    case "children":
                    case "dangerouslySetInnerHTML":
                        if (L != null)
                            throw Error(u(137, t));
                        break;
                    default:
                        Re(e, t, z, L, a, D)
                    }
            return;
        default:
            if (Ps(t)) {
                for (var Ne in n)
                    L = n[Ne],
                    n.hasOwnProperty(Ne) && L !== void 0 && !a.hasOwnProperty(Ne) && qu(e, t, Ne, void 0, a, L);
                for (B in a)
                    L = a[B],
                    D = n[B],
                    !a.hasOwnProperty(B) || L === D || L === void 0 && D === void 0 || qu(e, t, B, L, a, D);
                return
            }
        }
        for (var R in n)
            L = n[R],
            n.hasOwnProperty(R) && L != null && !a.hasOwnProperty(R) && Re(e, t, R, null, a, L);
        for (Y in a)
            L = a[Y],
            D = n[Y],
            !a.hasOwnProperty(Y) || L === D || L == null && D == null || Re(e, t, Y, L, a, D)
    }
    function Sh(e) {
        switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
            return !0;
        default:
            return !1
        }
    }
    function s0() {
        if (typeof performance.getEntriesByType == "function") {
            for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), a = 0; a < n.length; a++) {
                var i = n[a]
                  , o = i.transferSize
                  , h = i.initiatorType
                  , y = i.duration;
                if (o && y && Sh(h)) {
                    for (h = 0,
                    y = i.responseEnd,
                    a += 1; a < n.length; a++) {
                        var _ = n[a]
                          , z = _.startTime;
                        if (z > y)
                            break;
                        var B = _.transferSize
                          , Y = _.initiatorType;
                        B && Sh(Y) && (_ = _.responseEnd,
                        h += B * (_ < y ? 1 : (y - z) / (_ - z)))
                    }
                    if (--a,
                    t += 8 * (o + h) / (i.duration / 1e3),
                    e++,
                    10 < e)
                        break
                }
            }
            if (0 < e)
                return t / e / 1e6
        }
        return navigator.connection && (e = navigator.connection.downlink,
        typeof e == "number") ? e : 5
    }
    var Gu = null
      , Yu = null;
    function ss(e) {
        return e.nodeType === 9 ? e : e.ownerDocument
    }
    function Eh(e) {
        switch (e) {
        case "http://www.w3.org/2000/svg":
            return 1;
        case "http://www.w3.org/1998/Math/MathML":
            return 2;
        default:
            return 0
        }
    }
    function wh(e, t) {
        if (e === 0)
            switch (t) {
            case "svg":
                return 1;
            case "math":
                return 2;
            default:
                return 0
            }
        return e === 1 && t === "foreignObject" ? 0 : e
    }
    function Vu(e, t) {
        return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null
    }
    var ku = null;
    function r0() {
        var e = window.event;
        return e && e.type === "popstate" ? e === ku ? !1 : (ku = e,
        !0) : (ku = null,
        !1)
    }
    var Ch = typeof setTimeout == "function" ? setTimeout : void 0
      , u0 = typeof clearTimeout == "function" ? clearTimeout : void 0
      , _h = typeof Promise == "function" ? Promise : void 0
      , o0 = typeof queueMicrotask == "function" ? queueMicrotask : typeof _h < "u" ? function(e) {
        return _h.resolve(null).then(e).catch(c0)
    }
    : Ch;
    function c0(e) {
        setTimeout(function() {
            throw e
        })
    }
    function zn(e) {
        return e === "head"
    }
    function Ah(e, t) {
        var n = t
          , a = 0;
        do {
            var i = n.nextSibling;
            if (e.removeChild(n),
            i && i.nodeType === 8)
                if (n = i.data,
                n === "/$" || n === "/&") {
                    if (a === 0) {
                        e.removeChild(i),
                        qa(t);
                        return
                    }
                    a--
                } else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&")
                    a++;
                else if (n === "html")
                    Ml(e.ownerDocument.documentElement);
                else if (n === "head") {
                    n = e.ownerDocument.head,
                    Ml(n);
                    for (var o = n.firstChild; o; ) {
                        var h = o.nextSibling
                          , y = o.nodeName;
                        o[Wa] || y === "SCRIPT" || y === "STYLE" || y === "LINK" && o.rel.toLowerCase() === "stylesheet" || n.removeChild(o),
                        o = h
                    }
                } else
                    n === "body" && Ml(e.ownerDocument.body);
            n = i
        } while (n);
        qa(t)
    }
    function Th(e, t) {
        var n = e;
        e = 0;
        do {
            var a = n.nextSibling;
            if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display,
            n.style.display = "none") : (n.style.display = n._stashedDisplay || "",
            n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue,
            n.nodeValue = "") : n.nodeValue = n._stashedText || ""),
            a && a.nodeType === 8)
                if (n = a.data,
                n === "/$") {
                    if (e === 0)
                        break;
                    e--
                } else
                    n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
            n = a
        } while (n)
    }
    function Qu(e) {
        var t = e.firstChild;
        for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
            var n = t;
            switch (t = t.nextSibling,
            n.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
                Qu(n),
                Js(n);
                continue;
            case "SCRIPT":
            case "STYLE":
                continue;
            case "LINK":
                if (n.rel.toLowerCase() === "stylesheet")
                    continue
            }
            e.removeChild(n)
        }
    }
    function f0(e, t, n, a) {
        for (; e.nodeType === 1; ) {
            var i = n;
            if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
                if (!a && (e.nodeName !== "INPUT" || e.type !== "hidden"))
                    break
            } else if (a) {
                if (!e[Wa])
                    switch (t) {
                    case "meta":
                        if (!e.hasAttribute("itemprop"))
                            break;
                        return e;
                    case "link":
                        if (o = e.getAttribute("rel"),
                        o === "stylesheet" && e.hasAttribute("data-precedence"))
                            break;
                        if (o !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title))
                            break;
                        return e;
                    case "style":
                        if (e.hasAttribute("data-precedence"))
                            break;
                        return e;
                    case "script":
                        if (o = e.getAttribute("src"),
                        (o !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && o && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                            break;
                        return e;
                    default:
                        return e
                    }
            } else if (t === "input" && e.type === "hidden") {
                var o = i.name == null ? null : "" + i.name;
                if (i.type === "hidden" && e.getAttribute("name") === o)
                    return e
            } else
                return e;
            if (e = Rt(e.nextSibling),
            e === null)
                break
        }
        return null
    }
    function d0(e, t, n) {
        if (t === "")
            return null;
        for (; e.nodeType !== 3; )
            if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = Rt(e.nextSibling),
            e === null))
                return null;
        return e
    }
    function Oh(e, t) {
        for (; e.nodeType !== 8; )
            if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Rt(e.nextSibling),
            e === null))
                return null;
        return e
    }
    function Xu(e) {
        return e.data === "$?" || e.data === "$~"
    }
    function Fu(e) {
        return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading"
    }
    function h0(e, t) {
        var n = e.ownerDocument;
        if (e.data === "$~")
            e._reactRetry = t;
        else if (e.data !== "$?" || n.readyState !== "loading")
            t();
        else {
            var a = function() {
                t(),
                n.removeEventListener("DOMContentLoaded", a)
            };
            n.addEventListener("DOMContentLoaded", a),
            e._reactRetry = a
        }
    }
    function Rt(e) {
        for (; e != null; e = e.nextSibling) {
            var t = e.nodeType;
            if (t === 1 || t === 3)
                break;
            if (t === 8) {
                if (t = e.data,
                t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
                    break;
                if (t === "/$" || t === "/&")
                    return null
            }
        }
        return e
    }
    var Zu = null;
    function Rh(e) {
        e = e.nextSibling;
        for (var t = 0; e; ) {
            if (e.nodeType === 8) {
                var n = e.data;
                if (n === "/$" || n === "/&") {
                    if (t === 0)
                        return Rt(e.nextSibling);
                    t--
                } else
                    n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++
            }
            e = e.nextSibling
        }
        return null
    }
    function Nh(e) {
        e = e.previousSibling;
        for (var t = 0; e; ) {
            if (e.nodeType === 8) {
                var n = e.data;
                if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
                    if (t === 0)
                        return e;
                    t--
                } else
                    n !== "/$" && n !== "/&" || t++
            }
            e = e.previousSibling
        }
        return null
    }
    function zh(e, t, n) {
        switch (t = ss(n),
        e) {
        case "html":
            if (e = t.documentElement,
            !e)
                throw Error(u(452));
            return e;
        case "head":
            if (e = t.head,
            !e)
                throw Error(u(453));
            return e;
        case "body":
            if (e = t.body,
            !e)
                throw Error(u(454));
            return e;
        default:
            throw Error(u(451))
        }
    }
    function Ml(e) {
        for (var t = e.attributes; t.length; )
            e.removeAttributeNode(t[0]);
        Js(e)
    }
    var Nt = new Map
      , Lh = new Set;
    function rs(e) {
        return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument
    }
    var un = Q.d;
    Q.d = {
        f: m0,
        r: g0,
        D: p0,
        C: y0,
        L: v0,
        m: b0,
        X: S0,
        S: x0,
        M: E0
    };
    function m0() {
        var e = un.f()
          , t = Ii();
        return e || t
    }
    function g0(e) {
        var t = la(e);
        t !== null && t.tag === 5 && t.type === "form" ? Jf(t) : un.r(e)
    }
    var Ua = typeof document > "u" ? null : document;
    function Mh(e, t, n) {
        var a = Ua;
        if (a && typeof t == "string" && t) {
            var i = Et(t);
            i = 'link[rel="' + e + '"][href="' + i + '"]',
            typeof n == "string" && (i += '[crossorigin="' + n + '"]'),
            Lh.has(i) || (Lh.add(i),
            e = {
                rel: e,
                crossOrigin: n,
                href: t
            },
            a.querySelector(i) === null && (t = a.createElement("link"),
            Pe(t, "link", e),
            Fe(t),
            a.head.appendChild(t)))
        }
    }
    function p0(e) {
        un.D(e),
        Mh("dns-prefetch", e, null)
    }
    function y0(e, t) {
        un.C(e, t),
        Mh("preconnect", e, t)
    }
    function v0(e, t, n) {
        un.L(e, t, n);
        var a = Ua;
        if (a && e && t) {
            var i = 'link[rel="preload"][as="' + Et(t) + '"]';
            t === "image" && n && n.imageSrcSet ? (i += '[imagesrcset="' + Et(n.imageSrcSet) + '"]',
            typeof n.imageSizes == "string" && (i += '[imagesizes="' + Et(n.imageSizes) + '"]')) : i += '[href="' + Et(e) + '"]';
            var o = i;
            switch (t) {
            case "style":
                o = Ba(e);
                break;
            case "script":
                o = Ha(e)
            }
            Nt.has(o) || (e = v({
                rel: "preload",
                href: t === "image" && n && n.imageSrcSet ? void 0 : e,
                as: t
            }, n),
            Nt.set(o, e),
            a.querySelector(i) !== null || t === "style" && a.querySelector(Dl(o)) || t === "script" && a.querySelector(jl(o)) || (t = a.createElement("link"),
            Pe(t, "link", e),
            Fe(t),
            a.head.appendChild(t)))
        }
    }
    function b0(e, t) {
        un.m(e, t);
        var n = Ua;
        if (n && e) {
            var a = t && typeof t.as == "string" ? t.as : "script"
              , i = 'link[rel="modulepreload"][as="' + Et(a) + '"][href="' + Et(e) + '"]'
              , o = i;
            switch (a) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
                o = Ha(e)
            }
            if (!Nt.has(o) && (e = v({
                rel: "modulepreload",
                href: e
            }, t),
            Nt.set(o, e),
            n.querySelector(i) === null)) {
                switch (a) {
                case "audioworklet":
                case "paintworklet":
                case "serviceworker":
                case "sharedworker":
                case "worker":
                case "script":
                    if (n.querySelector(jl(o)))
                        return
                }
                a = n.createElement("link"),
                Pe(a, "link", e),
                Fe(a),
                n.head.appendChild(a)
            }
        }
    }
    function x0(e, t, n) {
        un.S(e, t, n);
        var a = Ua;
        if (a && e) {
            var i = ia(a).hoistableStyles
              , o = Ba(e);
            t = t || "default";
            var h = i.get(o);
            if (!h) {
                var y = {
                    loading: 0,
                    preload: null
                };
                if (h = a.querySelector(Dl(o)))
                    y.loading = 5;
                else {
                    e = v({
                        rel: "stylesheet",
                        href: e,
                        "data-precedence": t
                    }, n),
                    (n = Nt.get(o)) && Ku(e, n);
                    var _ = h = a.createElement("link");
                    Fe(_),
                    Pe(_, "link", e),
                    _._p = new Promise(function(z, B) {
                        _.onload = z,
                        _.onerror = B
                    }
                    ),
                    _.addEventListener("load", function() {
                        y.loading |= 1
                    }),
                    _.addEventListener("error", function() {
                        y.loading |= 2
                    }),
                    y.loading |= 4,
                    us(h, t, a)
                }
                h = {
                    type: "stylesheet",
                    instance: h,
                    count: 1,
                    state: y
                },
                i.set(o, h)
            }
        }
    }
    function S0(e, t) {
        un.X(e, t);
        var n = Ua;
        if (n && e) {
            var a = ia(n).hoistableScripts
              , i = Ha(e)
              , o = a.get(i);
            o || (o = n.querySelector(jl(i)),
            o || (e = v({
                src: e,
                async: !0
            }, t),
            (t = Nt.get(i)) && Ju(e, t),
            o = n.createElement("script"),
            Fe(o),
            Pe(o, "link", e),
            n.head.appendChild(o)),
            o = {
                type: "script",
                instance: o,
                count: 1,
                state: null
            },
            a.set(i, o))
        }
    }
    function E0(e, t) {
        un.M(e, t);
        var n = Ua;
        if (n && e) {
            var a = ia(n).hoistableScripts
              , i = Ha(e)
              , o = a.get(i);
            o || (o = n.querySelector(jl(i)),
            o || (e = v({
                src: e,
                async: !0,
                type: "module"
            }, t),
            (t = Nt.get(i)) && Ju(e, t),
            o = n.createElement("script"),
            Fe(o),
            Pe(o, "link", e),
            n.head.appendChild(o)),
            o = {
                type: "script",
                instance: o,
                count: 1,
                state: null
            },
            a.set(i, o))
        }
    }
    function Dh(e, t, n, a) {
        var i = (i = de.current) ? rs(i) : null;
        if (!i)
            throw Error(u(446));
        switch (e) {
        case "meta":
        case "title":
            return null;
        case "style":
            return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Ba(n.href),
            n = ia(i).hoistableStyles,
            a = n.get(t),
            a || (a = {
                type: "style",
                instance: null,
                count: 0,
                state: null
            },
            n.set(t, a)),
            a) : {
                type: "void",
                instance: null,
                count: 0,
                state: null
            };
        case "link":
            if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
                e = Ba(n.href);
                var o = ia(i).hoistableStyles
                  , h = o.get(e);
                if (h || (i = i.ownerDocument || i,
                h = {
                    type: "stylesheet",
                    instance: null,
                    count: 0,
                    state: {
                        loading: 0,
                        preload: null
                    }
                },
                o.set(e, h),
                (o = i.querySelector(Dl(e))) && !o._p && (h.instance = o,
                h.state.loading = 5),
                Nt.has(e) || (n = {
                    rel: "preload",
                    as: "style",
                    href: n.href,
                    crossOrigin: n.crossOrigin,
                    integrity: n.integrity,
                    media: n.media,
                    hrefLang: n.hrefLang,
                    referrerPolicy: n.referrerPolicy
                },
                Nt.set(e, n),
                o || w0(i, e, n, h.state))),
                t && a === null)
                    throw Error(u(528, ""));
                return h
            }
            if (t && a !== null)
                throw Error(u(529, ""));
            return null;
        case "script":
            return t = n.async,
            n = n.src,
            typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ha(n),
            n = ia(i).hoistableScripts,
            a = n.get(t),
            a || (a = {
                type: "script",
                instance: null,
                count: 0,
                state: null
            },
            n.set(t, a)),
            a) : {
                type: "void",
                instance: null,
                count: 0,
                state: null
            };
        default:
            throw Error(u(444, e))
        }
    }
    function Ba(e) {
        return 'href="' + Et(e) + '"'
    }
    function Dl(e) {
        return 'link[rel="stylesheet"][' + e + "]"
    }
    function jh(e) {
        return v({}, e, {
            "data-precedence": e.precedence,
            precedence: null
        })
    }
    function w0(e, t, n, a) {
        e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? a.loading = 1 : (t = e.createElement("link"),
        a.preload = t,
        t.addEventListener("load", function() {
            return a.loading |= 1
        }),
        t.addEventListener("error", function() {
            return a.loading |= 2
        }),
        Pe(t, "link", n),
        Fe(t),
        e.head.appendChild(t))
    }
    function Ha(e) {
        return '[src="' + Et(e) + '"]'
    }
    function jl(e) {
        return "script[async]" + e
    }
    function Uh(e, t, n) {
        if (t.count++,
        t.instance === null)
            switch (t.type) {
            case "style":
                var a = e.querySelector('style[data-href~="' + Et(n.href) + '"]');
                if (a)
                    return t.instance = a,
                    Fe(a),
                    a;
                var i = v({}, n, {
                    "data-href": n.href,
                    "data-precedence": n.precedence,
                    href: null,
                    precedence: null
                });
                return a = (e.ownerDocument || e).createElement("style"),
                Fe(a),
                Pe(a, "style", i),
                us(a, n.precedence, e),
                t.instance = a;
            case "stylesheet":
                i = Ba(n.href);
                var o = e.querySelector(Dl(i));
                if (o)
                    return t.state.loading |= 4,
                    t.instance = o,
                    Fe(o),
                    o;
                a = jh(n),
                (i = Nt.get(i)) && Ku(a, i),
                o = (e.ownerDocument || e).createElement("link"),
                Fe(o);
                var h = o;
                return h._p = new Promise(function(y, _) {
                    h.onload = y,
                    h.onerror = _
                }
                ),
                Pe(o, "link", a),
                t.state.loading |= 4,
                us(o, n.precedence, e),
                t.instance = o;
            case "script":
                return o = Ha(n.src),
                (i = e.querySelector(jl(o))) ? (t.instance = i,
                Fe(i),
                i) : (a = n,
                (i = Nt.get(o)) && (a = v({}, n),
                Ju(a, i)),
                e = e.ownerDocument || e,
                i = e.createElement("script"),
                Fe(i),
                Pe(i, "link", a),
                e.head.appendChild(i),
                t.instance = i);
            case "void":
                return null;
            default:
                throw Error(u(443, t.type))
            }
        else
            t.type === "stylesheet" && (t.state.loading & 4) === 0 && (a = t.instance,
            t.state.loading |= 4,
            us(a, n.precedence, e));
        return t.instance
    }
    function us(e, t, n) {
        for (var a = n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), i = a.length ? a[a.length - 1] : null, o = i, h = 0; h < a.length; h++) {
            var y = a[h];
            if (y.dataset.precedence === t)
                o = y;
            else if (o !== i)
                break
        }
        o ? o.parentNode.insertBefore(e, o.nextSibling) : (t = n.nodeType === 9 ? n.head : n,
        t.insertBefore(e, t.firstChild))
    }
    function Ku(e, t) {
        e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
        e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
        e.title == null && (e.title = t.title)
    }
    function Ju(e, t) {
        e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
        e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
        e.integrity == null && (e.integrity = t.integrity)
    }
    var os = null;
    function Bh(e, t, n) {
        if (os === null) {
            var a = new Map
              , i = os = new Map;
            i.set(n, a)
        } else
            i = os,
            a = i.get(n),
            a || (a = new Map,
            i.set(n, a));
        if (a.has(e))
            return a;
        for (a.set(e, null),
        n = n.getElementsByTagName(e),
        i = 0; i < n.length; i++) {
            var o = n[i];
            if (!(o[Wa] || o[Je] || e === "link" && o.getAttribute("rel") === "stylesheet") && o.namespaceURI !== "http://www.w3.org/2000/svg") {
                var h = o.getAttribute(t) || "";
                h = e + h;
                var y = a.get(h);
                y ? y.push(o) : a.set(h, [o])
            }
        }
        return a
    }
    function Hh(e, t, n) {
        e = e.ownerDocument || e,
        e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null)
    }
    function C0(e, t, n) {
        if (n === 1 || t.itemProp != null)
            return !1;
        switch (e) {
        case "meta":
        case "title":
            return !0;
        case "style":
            if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
                break;
            return !0;
        case "link":
            if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
                break;
            return t.rel === "stylesheet" ? (e = t.disabled,
            typeof t.precedence == "string" && e == null) : !0;
        case "script":
            if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
                return !0
        }
        return !1
    }
    function qh(e) {
        return !(e.type === "stylesheet" && (e.state.loading & 3) === 0)
    }
    function _0(e, t, n, a) {
        if (n.type === "stylesheet" && (typeof a.media != "string" || matchMedia(a.media).matches !== !1) && (n.state.loading & 4) === 0) {
            if (n.instance === null) {
                var i = Ba(a.href)
                  , o = t.querySelector(Dl(i));
                if (o) {
                    t = o._p,
                    t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++,
                    e = cs.bind(e),
                    t.then(e, e)),
                    n.state.loading |= 4,
                    n.instance = o,
                    Fe(o);
                    return
                }
                o = t.ownerDocument || t,
                a = jh(a),
                (i = Nt.get(i)) && Ku(a, i),
                o = o.createElement("link"),
                Fe(o);
                var h = o;
                h._p = new Promise(function(y, _) {
                    h.onload = y,
                    h.onerror = _
                }
                ),
                Pe(o, "link", a),
                n.instance = o
            }
            e.stylesheets === null && (e.stylesheets = new Map),
            e.stylesheets.set(n, t),
            (t = n.state.preload) && (n.state.loading & 3) === 0 && (e.count++,
            n = cs.bind(e),
            t.addEventListener("load", n),
            t.addEventListener("error", n))
        }
    }
    var $u = 0;
    function A0(e, t) {
        return e.stylesheets && e.count === 0 && ds(e, e.stylesheets),
        0 < e.count || 0 < e.imgCount ? function(n) {
            var a = setTimeout(function() {
                if (e.stylesheets && ds(e, e.stylesheets),
                e.unsuspend) {
                    var o = e.unsuspend;
                    e.unsuspend = null,
                    o()
                }
            }, 6e4 + t);
            0 < e.imgBytes && $u === 0 && ($u = 62500 * s0());
            var i = setTimeout(function() {
                if (e.waitingForImages = !1,
                e.count === 0 && (e.stylesheets && ds(e, e.stylesheets),
                e.unsuspend)) {
                    var o = e.unsuspend;
                    e.unsuspend = null,
                    o()
                }
            }, (e.imgBytes > $u ? 50 : 800) + t);
            return e.unsuspend = n,
            function() {
                e.unsuspend = null,
                clearTimeout(a),
                clearTimeout(i)
            }
        }
        : null
    }
    function cs() {
        if (this.count--,
        this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
            if (this.stylesheets)
                ds(this, this.stylesheets);
            else if (this.unsuspend) {
                var e = this.unsuspend;
                this.unsuspend = null,
                e()
            }
        }
    }
    var fs = null;
    function ds(e, t) {
        e.stylesheets = null,
        e.unsuspend !== null && (e.count++,
        fs = new Map,
        t.forEach(T0, e),
        fs = null,
        cs.call(e))
    }
    function T0(e, t) {
        if (!(t.state.loading & 4)) {
            var n = fs.get(e);
            if (n)
                var a = n.get(null);
            else {
                n = new Map,
                fs.set(e, n);
                for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), o = 0; o < i.length; o++) {
                    var h = i[o];
                    (h.nodeName === "LINK" || h.getAttribute("media") !== "not all") && (n.set(h.dataset.precedence, h),
                    a = h)
                }
                a && n.set(null, a)
            }
            i = t.instance,
            h = i.getAttribute("data-precedence"),
            o = n.get(h) || a,
            o === a && n.set(null, i),
            n.set(h, i),
            this.count++,
            a = cs.bind(this),
            i.addEventListener("load", a),
            i.addEventListener("error", a),
            o ? o.parentNode.insertBefore(i, o.nextSibling) : (e = e.nodeType === 9 ? e.head : e,
            e.insertBefore(i, e.firstChild)),
            t.state.loading |= 4
        }
    }
    var Ul = {
        $$typeof: V,
        Provider: null,
        Consumer: null,
        _currentValue: te,
        _currentValue2: te,
        _threadCount: 0
    };
    function O0(e, t, n, a, i, o, h, y, _) {
        this.tag = 1,
        this.containerInfo = e,
        this.pingCache = this.current = this.pendingChildren = null,
        this.timeoutHandle = -1,
        this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null,
        this.callbackPriority = 0,
        this.expirationTimes = Xs(-1),
        this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0,
        this.entanglements = Xs(0),
        this.hiddenUpdates = Xs(null),
        this.identifierPrefix = a,
        this.onUncaughtError = i,
        this.onCaughtError = o,
        this.onRecoverableError = h,
        this.pooledCache = null,
        this.pooledCacheLanes = 0,
        this.formState = _,
        this.incompleteTransitions = new Map
    }
    function Gh(e, t, n, a, i, o, h, y, _, z, B, Y) {
        return e = new O0(e,t,n,h,_,z,B,Y,y),
        t = 1,
        o === !0 && (t |= 24),
        o = gt(3, null, null, t),
        e.current = o,
        o.stateNode = e,
        t = Rr(),
        t.refCount++,
        e.pooledCache = t,
        t.refCount++,
        o.memoizedState = {
            element: a,
            isDehydrated: n,
            cache: t
        },
        Mr(o),
        e
    }
    function Yh(e) {
        return e ? (e = ga,
        e) : ga
    }
    function Vh(e, t, n, a, i, o) {
        i = Yh(i),
        a.context === null ? a.context = i : a.pendingContext = i,
        a = xn(t),
        a.payload = {
            element: n
        },
        o = o === void 0 ? null : o,
        o !== null && (a.callback = o),
        n = Sn(e, a, t),
        n !== null && (ct(n, e, t),
        ml(n, e, t))
    }
    function kh(e, t) {
        if (e = e.memoizedState,
        e !== null && e.dehydrated !== null) {
            var n = e.retryLane;
            e.retryLane = n !== 0 && n < t ? n : t
        }
    }
    function Wu(e, t) {
        kh(e, t),
        (e = e.alternate) && kh(e, t)
    }
    function Qh(e) {
        if (e.tag === 13 || e.tag === 31) {
            var t = kn(e, 67108864);
            t !== null && ct(t, e, 67108864),
            Wu(e, 67108864)
        }
    }
    function Xh(e) {
        if (e.tag === 13 || e.tag === 31) {
            var t = xt();
            t = Fs(t);
            var n = kn(e, t);
            n !== null && ct(n, e, t),
            Wu(e, t)
        }
    }
    var hs = !0;
    function R0(e, t, n, a) {
        var i = U.T;
        U.T = null;
        var o = Q.p;
        try {
            Q.p = 2,
            Iu(e, t, n, a)
        } finally {
            Q.p = o,
            U.T = i
        }
    }
    function N0(e, t, n, a) {
        var i = U.T;
        U.T = null;
        var o = Q.p;
        try {
            Q.p = 8,
            Iu(e, t, n, a)
        } finally {
            Q.p = o,
            U.T = i
        }
    }
    function Iu(e, t, n, a) {
        if (hs) {
            var i = Pu(a);
            if (i === null)
                Hu(e, t, a, ms, n),
                Zh(e, a);
            else if (L0(i, e, t, n, a))
                a.stopPropagation();
            else if (Zh(e, a),
            t & 4 && -1 < z0.indexOf(e)) {
                for (; i !== null; ) {
                    var o = la(i);
                    if (o !== null)
                        switch (o.tag) {
                        case 3:
                            if (o = o.stateNode,
                            o.current.memoizedState.isDehydrated) {
                                var h = Hn(o.pendingLanes);
                                if (h !== 0) {
                                    var y = o;
                                    for (y.pendingLanes |= 2,
                                    y.entangledLanes |= 2; h; ) {
                                        var _ = 1 << 31 - ht(h);
                                        y.entanglements[1] |= _,
                                        h &= ~_
                                    }
                                    qt(o),
                                    (Ee & 6) === 0 && ($i = ft() + 500,
                                    Nl(0))
                                }
                            }
                            break;
                        case 31:
                        case 13:
                            y = kn(o, 2),
                            y !== null && ct(y, o, 2),
                            Ii(),
                            Wu(o, 2)
                        }
                    if (o = Pu(a),
                    o === null && Hu(e, t, a, ms, n),
                    o === i)
                        break;
                    i = o
                }
                i !== null && a.stopPropagation()
            } else
                Hu(e, t, a, null, n)
        }
    }
    function Pu(e) {
        return e = tr(e),
        eo(e)
    }
    var ms = null;
    function eo(e) {
        if (ms = null,
        e = aa(e),
        e !== null) {
            var t = f(e);
            if (t === null)
                e = null;
            else {
                var n = t.tag;
                if (n === 13) {
                    if (e = d(t),
                    e !== null)
                        return e;
                    e = null
                } else if (n === 31) {
                    if (e = m(t),
                    e !== null)
                        return e;
                    e = null
                } else if (n === 3) {
                    if (t.stateNode.current.memoizedState.isDehydrated)
                        return t.tag === 3 ? t.stateNode.containerInfo : null;
                    e = null
                } else
                    t !== e && (e = null)
            }
        }
        return ms = e,
        null
    }
    function Fh(e) {
        switch (e) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
            return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
            return 8;
        case "message":
            switch (pp()) {
            case Po:
                return 2;
            case ec:
                return 8;
            case ai:
            case yp:
                return 32;
            case tc:
                return 268435456;
            default:
                return 32
            }
        default:
            return 32
        }
    }
    var to = !1
      , Ln = null
      , Mn = null
      , Dn = null
      , Bl = new Map
      , Hl = new Map
      , jn = []
      , z0 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
    function Zh(e, t) {
        switch (e) {
        case "focusin":
        case "focusout":
            Ln = null;
            break;
        case "dragenter":
        case "dragleave":
            Mn = null;
            break;
        case "mouseover":
        case "mouseout":
            Dn = null;
            break;
        case "pointerover":
        case "pointerout":
            Bl.delete(t.pointerId);
            break;
        case "gotpointercapture":
        case "lostpointercapture":
            Hl.delete(t.pointerId)
        }
    }
    function ql(e, t, n, a, i, o) {
        return e === null || e.nativeEvent !== o ? (e = {
            blockedOn: t,
            domEventName: n,
            eventSystemFlags: a,
            nativeEvent: o,
            targetContainers: [i]
        },
        t !== null && (t = la(t),
        t !== null && Qh(t)),
        e) : (e.eventSystemFlags |= a,
        t = e.targetContainers,
        i !== null && t.indexOf(i) === -1 && t.push(i),
        e)
    }
    function L0(e, t, n, a, i) {
        switch (t) {
        case "focusin":
            return Ln = ql(Ln, e, t, n, a, i),
            !0;
        case "dragenter":
            return Mn = ql(Mn, e, t, n, a, i),
            !0;
        case "mouseover":
            return Dn = ql(Dn, e, t, n, a, i),
            !0;
        case "pointerover":
            var o = i.pointerId;
            return Bl.set(o, ql(Bl.get(o) || null, e, t, n, a, i)),
            !0;
        case "gotpointercapture":
            return o = i.pointerId,
            Hl.set(o, ql(Hl.get(o) || null, e, t, n, a, i)),
            !0
        }
        return !1
    }
    function Kh(e) {
        var t = aa(e.target);
        if (t !== null) {
            var n = f(t);
            if (n !== null) {
                if (t = n.tag,
                t === 13) {
                    if (t = d(n),
                    t !== null) {
                        e.blockedOn = t,
                        rc(e.priority, function() {
                            Xh(n)
                        });
                        return
                    }
                } else if (t === 31) {
                    if (t = m(n),
                    t !== null) {
                        e.blockedOn = t,
                        rc(e.priority, function() {
                            Xh(n)
                        });
                        return
                    }
                } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
                    e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
                    return
                }
            }
        }
        e.blockedOn = null
    }
    function gs(e) {
        if (e.blockedOn !== null)
            return !1;
        for (var t = e.targetContainers; 0 < t.length; ) {
            var n = Pu(e.nativeEvent);
            if (n === null) {
                n = e.nativeEvent;
                var a = new n.constructor(n.type,n);
                er = a,
                n.target.dispatchEvent(a),
                er = null
            } else
                return t = la(n),
                t !== null && Qh(t),
                e.blockedOn = n,
                !1;
            t.shift()
        }
        return !0
    }
    function Jh(e, t, n) {
        gs(e) && n.delete(t)
    }
    function M0() {
        to = !1,
        Ln !== null && gs(Ln) && (Ln = null),
        Mn !== null && gs(Mn) && (Mn = null),
        Dn !== null && gs(Dn) && (Dn = null),
        Bl.forEach(Jh),
        Hl.forEach(Jh)
    }
    function ps(e, t) {
        e.blockedOn === t && (e.blockedOn = null,
        to || (to = !0,
        s.unstable_scheduleCallback(s.unstable_NormalPriority, M0)))
    }
    var ys = null;
    function $h(e) {
        ys !== e && (ys = e,
        s.unstable_scheduleCallback(s.unstable_NormalPriority, function() {
            ys === e && (ys = null);
            for (var t = 0; t < e.length; t += 3) {
                var n = e[t]
                  , a = e[t + 1]
                  , i = e[t + 2];
                if (typeof a != "function") {
                    if (eo(a || n) === null)
                        continue;
                    break
                }
                var o = la(n);
                o !== null && (e.splice(t, 3),
                t -= 3,
                Pr(o, {
                    pending: !0,
                    data: i,
                    method: n.method,
                    action: a
                }, a, i))
            }
        }))
    }
    function qa(e) {
        function t(_) {
            return ps(_, e)
        }
        Ln !== null && ps(Ln, e),
        Mn !== null && ps(Mn, e),
        Dn !== null && ps(Dn, e),
        Bl.forEach(t),
        Hl.forEach(t);
        for (var n = 0; n < jn.length; n++) {
            var a = jn[n];
            a.blockedOn === e && (a.blockedOn = null)
        }
        for (; 0 < jn.length && (n = jn[0],
        n.blockedOn === null); )
            Kh(n),
            n.blockedOn === null && jn.shift();
        if (n = (e.ownerDocument || e).$$reactFormReplay,
        n != null)
            for (a = 0; a < n.length; a += 3) {
                var i = n[a]
                  , o = n[a + 1]
                  , h = i[lt] || null;
                if (typeof o == "function")
                    h || $h(n);
                else if (h) {
                    var y = null;
                    if (o && o.hasAttribute("formAction")) {
                        if (i = o,
                        h = o[lt] || null)
                            y = h.formAction;
                        else if (eo(i) !== null)
                            continue
                    } else
                        y = h.action;
                    typeof y == "function" ? n[a + 1] = y : (n.splice(a, 3),
                    a -= 3),
                    $h(n)
                }
            }
    }
    function Wh() {
        function e(o) {
            o.canIntercept && o.info === "react-transition" && o.intercept({
                handler: function() {
                    return new Promise(function(h) {
                        return i = h
                    }
                    )
                },
                focusReset: "manual",
                scroll: "manual"
            })
        }
        function t() {
            i !== null && (i(),
            i = null),
            a || setTimeout(n, 20)
        }
        function n() {
            if (!a && !navigation.transition) {
                var o = navigation.currentEntry;
                o && o.url != null && navigation.navigate(o.url, {
                    state: o.getState(),
                    info: "react-transition",
                    history: "replace"
                })
            }
        }
        if (typeof navigation == "object") {
            var a = !1
              , i = null;
            return navigation.addEventListener("navigate", e),
            navigation.addEventListener("navigatesuccess", t),
            navigation.addEventListener("navigateerror", t),
            setTimeout(n, 100),
            function() {
                a = !0,
                navigation.removeEventListener("navigate", e),
                navigation.removeEventListener("navigatesuccess", t),
                navigation.removeEventListener("navigateerror", t),
                i !== null && (i(),
                i = null)
            }
        }
    }
    function no(e) {
        this._internalRoot = e
    }
    vs.prototype.render = no.prototype.render = function(e) {
        var t = this._internalRoot;
        if (t === null)
            throw Error(u(409));
        var n = t.current
          , a = xt();
        Vh(n, a, e, t, null, null)
    }
    ,
    vs.prototype.unmount = no.prototype.unmount = function() {
        var e = this._internalRoot;
        if (e !== null) {
            this._internalRoot = null;
            var t = e.containerInfo;
            Vh(e.current, 2, null, e, null, null),
            Ii(),
            t[na] = null
        }
    }
    ;
    function vs(e) {
        this._internalRoot = e
    }
    vs.prototype.unstable_scheduleHydration = function(e) {
        if (e) {
            var t = sc();
            e = {
                blockedOn: null,
                target: e,
                priority: t
            };
            for (var n = 0; n < jn.length && t !== 0 && t < jn[n].priority; n++)
                ;
            jn.splice(n, 0, e),
            n === 0 && Kh(e)
        }
    }
    ;
    var Ih = l.version;
    if (Ih !== "19.2.4")
        throw Error(u(527, Ih, "19.2.4"));
    Q.findDOMNode = function(e) {
        var t = e._reactInternals;
        if (t === void 0)
            throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","),
            Error(u(268, e)));
        return e = p(t),
        e = e !== null ? b(e) : null,
        e = e === null ? null : e.stateNode,
        e
    }
    ;
    var D0 = {
        bundleType: 0,
        version: "19.2.4",
        rendererPackageName: "react-dom",
        currentDispatcherRef: U,
        reconcilerVersion: "19.2.4"
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var bs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!bs.isDisabled && bs.supportsFiber)
            try {
                Ka = bs.inject(D0),
                dt = bs
            } catch {}
    }
    return Ql.createRoot = function(e, t) {
        if (!c(e))
            throw Error(u(299));
        var n = !1
          , a = ""
          , i = id
          , o = sd
          , h = rd;
        return t != null && (t.unstable_strictMode === !0 && (n = !0),
        t.identifierPrefix !== void 0 && (a = t.identifierPrefix),
        t.onUncaughtError !== void 0 && (i = t.onUncaughtError),
        t.onCaughtError !== void 0 && (o = t.onCaughtError),
        t.onRecoverableError !== void 0 && (h = t.onRecoverableError)),
        t = Gh(e, 1, !1, null, null, n, a, null, i, o, h, Wh),
        e[na] = t.current,
        Bu(e),
        new no(t)
    }
    ,
    Ql.hydrateRoot = function(e, t, n) {
        if (!c(e))
            throw Error(u(299));
        var a = !1
          , i = ""
          , o = id
          , h = sd
          , y = rd
          , _ = null;
        return n != null && (n.unstable_strictMode === !0 && (a = !0),
        n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
        n.onUncaughtError !== void 0 && (o = n.onUncaughtError),
        n.onCaughtError !== void 0 && (h = n.onCaughtError),
        n.onRecoverableError !== void 0 && (y = n.onRecoverableError),
        n.formState !== void 0 && (_ = n.formState)),
        t = Gh(e, 1, !0, t, n ?? null, a, i, _, o, h, y, Wh),
        t.context = Yh(null),
        n = t.current,
        a = xt(),
        a = Fs(a),
        i = xn(a),
        i.callback = null,
        Sn(n, i, a),
        n = a,
        t.current.lanes = n,
        $a(t, n),
        qt(t),
        e[na] = t.current,
        Bu(e),
        new vs(t)
    }
    ,
    Ql.version = "19.2.4",
    Ql
}
var ag;
function Q1() {
    if (ag)
        return wo.exports;
    ag = 1;
    function s() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)
            } catch (l) {
                console.error(l)
            }
    }
    return s(),
    wo.exports = k1(),
    wo.exports
}
var X1 = Q1();
var lg = "popstate";
function ig(s) {
    return typeof s == "object" && s != null && "pathname"in s && "search"in s && "hash"in s && "state"in s && "key"in s
}
function F1(s={}) {
    function l(u, c) {
        let f = c.state?.masked
          , {pathname: d, search: m, hash: g} = f || u.location;
        return Do("", {
            pathname: d,
            search: m,
            hash: g
        }, c.state && c.state.usr || null, c.state && c.state.key || "default", f ? {
            pathname: u.location.pathname,
            search: u.location.search,
            hash: u.location.hash
        } : void 0)
    }
    function r(u, c) {
        return typeof c == "string" ? c : Il(c)
    }
    return K1(l, r, null, s)
}
function Xe(s, l) {
    if (s === !1 || s === null || typeof s > "u")
        throw new Error(l)
}
function kt(s, l) {
    if (!s) {
        typeof console < "u" && console.warn(l);
        try {
            throw new Error(l)
        } catch {}
    }
}
function Z1() {
    return Math.random().toString(36).substring(2, 10)
}
function sg(s, l) {
    return {
        usr: s.state,
        key: s.key,
        idx: l,
        masked: s.unstable_mask ? {
            pathname: s.pathname,
            search: s.search,
            hash: s.hash
        } : void 0
    }
}
function Do(s, l, r=null, u, c) {
    return {
        pathname: typeof s == "string" ? s : s.pathname,
        search: "",
        hash: "",
        ...typeof l == "string" ? Pl(l) : l,
        state: r,
        key: l && l.key || u || Z1(),
        unstable_mask: c
    }
}
function Il({pathname: s="/", search: l="", hash: r=""}) {
    return l && l !== "?" && (s += l.charAt(0) === "?" ? l : "?" + l),
    r && r !== "#" && (s += r.charAt(0) === "#" ? r : "#" + r),
    s
}
function Pl(s) {
    let l = {};
    if (s) {
        let r = s.indexOf("#");
        r >= 0 && (l.hash = s.substring(r),
        s = s.substring(0, r));
        let u = s.indexOf("?");
        u >= 0 && (l.search = s.substring(u),
        s = s.substring(0, u)),
        s && (l.pathname = s)
    }
    return l
}
function K1(s, l, r, u={}) {
    let {window: c=document.defaultView, v5Compat: f=!1} = u
      , d = c.history
      , m = "POP"
      , g = null
      , p = b();
    p == null && (p = 0,
    d.replaceState({
        ...d.state,
        idx: p
    }, ""));
    function b() {
        return (d.state || {
            idx: null
        }).idx
    }
    function v() {
        m = "POP";
        let C = b()
          , M = C == null ? null : C - p;
        p = C,
        g && g({
            action: m,
            location: O.location,
            delta: M
        })
    }
    function S(C, M) {
        m = "PUSH";
        let G = ig(C) ? C : Do(O.location, C, M);
        p = b() + 1;
        let V = sg(G, p)
          , K = O.createHref(G.unstable_mask || G);
        try {
            d.pushState(V, "", K)
        } catch (W) {
            if (W instanceof DOMException && W.name === "DataCloneError")
                throw W;
            c.location.assign(K)
        }
        f && g && g({
            action: m,
            location: O.location,
            delta: 1
        })
    }
    function x(C, M) {
        m = "REPLACE";
        let G = ig(C) ? C : Do(O.location, C, M);
        p = b();
        let V = sg(G, p)
          , K = O.createHref(G.unstable_mask || G);
        d.replaceState(V, "", K),
        f && g && g({
            action: m,
            location: O.location,
            delta: 0
        })
    }
    function E(C) {
        return J1(C)
    }
    let O = {
        get action() {
            return m
        },
        get location() {
            return s(c, d)
        },
        listen(C) {
            if (g)
                throw new Error("A history only accepts one active listener");
            return c.addEventListener(lg, v),
            g = C,
            () => {
                c.removeEventListener(lg, v),
                g = null
            }
        },
        createHref(C) {
            return l(c, C)
        },
        createURL: E,
        encodeLocation(C) {
            let M = E(C);
            return {
                pathname: M.pathname,
                search: M.search,
                hash: M.hash
            }
        },
        push: S,
        replace: x,
        go(C) {
            return d.go(C)
        }
    };
    return O
}
function J1(s, l=!1) {
    let r = "http://localhost";
    typeof window < "u" && (r = window.location.origin !== "null" ? window.location.origin : window.location.href),
    Xe(r, "No window.location.(origin|href) available to create URL");
    let u = typeof s == "string" ? s : Il(s);
    return u = u.replace(/ $/, "%20"),
    !l && u.startsWith("//") && (u = r + u),
    new URL(u,r)
}
function Qg(s, l, r="/") {
    return $1(s, l, r, !1)
}
function $1(s, l, r, u) {
    let c = typeof l == "string" ? Pl(l) : l
      , f = on(c.pathname || "/", r);
    if (f == null)
        return null;
    let d = Xg(s);
    W1(d);
    let m = null;
    for (let g = 0; m == null && g < d.length; ++g) {
        let p = ub(f);
        m = sb(d[g], p, u)
    }
    return m
}
function Xg(s, l=[], r=[], u="", c=!1) {
    let f = (d, m, g=c, p) => {
        let b = {
            relativePath: p === void 0 ? d.path || "" : p,
            caseSensitive: d.caseSensitive === !0,
            childrenIndex: m,
            route: d
        };
        if (b.relativePath.startsWith("/")) {
            if (!b.relativePath.startsWith(u) && g)
                return;
            Xe(b.relativePath.startsWith(u), `Absolute route path "${b.relativePath}" nested under path "${u}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),
            b.relativePath = b.relativePath.slice(u.length)
        }
        let v = Vt([u, b.relativePath])
          , S = r.concat(b);
        d.children && d.children.length > 0 && (Xe(d.index !== !0, `Index routes must not have child routes. Please remove all child routes from route path "${v}".`),
        Xg(d.children, l, S, v, g)),
        !(d.path == null && !d.index) && l.push({
            path: v,
            score: lb(v, d.index),
            routesMeta: S
        })
    }
    ;
    return s.forEach( (d, m) => {
        if (d.path === "" || !d.path?.includes("?"))
            f(d, m);
        else
            for (let g of Fg(d.path))
                f(d, m, !0, g)
    }
    ),
    l
}
function Fg(s) {
    let l = s.split("/");
    if (l.length === 0)
        return [];
    let[r,...u] = l
      , c = r.endsWith("?")
      , f = r.replace(/\?$/, "");
    if (u.length === 0)
        return c ? [f, ""] : [f];
    let d = Fg(u.join("/"))
      , m = [];
    return m.push(...d.map(g => g === "" ? f : [f, g].join("/"))),
    c && m.push(...d),
    m.map(g => s.startsWith("/") && g === "" ? "/" : g)
}
function W1(s) {
    s.sort( (l, r) => l.score !== r.score ? r.score - l.score : ib(l.routesMeta.map(u => u.childrenIndex), r.routesMeta.map(u => u.childrenIndex)))
}
var I1 = /^:[\w-]+$/
  , P1 = 3
  , eb = 2
  , tb = 1
  , nb = 10
  , ab = -2
  , rg = s => s === "*";
function lb(s, l) {
    let r = s.split("/")
      , u = r.length;
    return r.some(rg) && (u += ab),
    l && (u += eb),
    r.filter(c => !rg(c)).reduce( (c, f) => c + (I1.test(f) ? P1 : f === "" ? tb : nb), u)
}
function ib(s, l) {
    return s.length === l.length && s.slice(0, -1).every( (u, c) => u === l[c]) ? s[s.length - 1] - l[l.length - 1] : 0
}
function sb(s, l, r=!1) {
    let {routesMeta: u} = s
      , c = {}
      , f = "/"
      , d = [];
    for (let m = 0; m < u.length; ++m) {
        let g = u[m]
          , p = m === u.length - 1
          , b = f === "/" ? l : l.slice(f.length) || "/"
          , v = Ms({
            path: g.relativePath,
            caseSensitive: g.caseSensitive,
            end: p
        }, b)
          , S = g.route;
        if (!v && p && r && !u[u.length - 1].route.index && (v = Ms({
            path: g.relativePath,
            caseSensitive: g.caseSensitive,
            end: !1
        }, b)),
        !v)
            return null;
        Object.assign(c, v.params),
        d.push({
            params: c,
            pathname: Vt([f, v.pathname]),
            pathnameBase: db(Vt([f, v.pathnameBase])),
            route: S
        }),
        v.pathnameBase !== "/" && (f = Vt([f, v.pathnameBase]))
    }
    return d
}
function Ms(s, l) {
    typeof s == "string" && (s = {
        path: s,
        caseSensitive: !1,
        end: !0
    });
    let[r,u] = rb(s.path, s.caseSensitive, s.end)
      , c = l.match(r);
    if (!c)
        return null;
    let f = c[0]
      , d = f.replace(/(.)\/+$/, "$1")
      , m = c.slice(1);
    return {
        params: u.reduce( (p, {paramName: b, isOptional: v}, S) => {
            if (b === "*") {
                let E = m[S] || "";
                d = f.slice(0, f.length - E.length).replace(/(.)\/+$/, "$1")
            }
            const x = m[S];
            return v && !x ? p[b] = void 0 : p[b] = (x || "").replace(/%2F/g, "/"),
            p
        }
        , {}),
        pathname: f,
        pathnameBase: d,
        pattern: s
    }
}
function rb(s, l=!1, r=!0) {
    kt(s === "*" || !s.endsWith("*") || s.endsWith("/*"), `Route path "${s}" will be treated as if it were "${s.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${s.replace(/\*$/, "/*")}".`);
    let u = []
      , c = "^" + s.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (d, m, g, p, b) => {
        if (u.push({
            paramName: m,
            isOptional: g != null
        }),
        g) {
            let v = b.charAt(p + d.length);
            return v && v !== "/" ? "/([^\\/]*)" : "(?:/([^\\/]*))?"
        }
        return "/([^\\/]+)"
    }
    ).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
    return s.endsWith("*") ? (u.push({
        paramName: "*"
    }),
    c += s === "*" || s === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : r ? c += "\\/*$" : s !== "" && s !== "/" && (c += "(?:(?=\\/|$))"),
    [new RegExp(c,l ? void 0 : "i"), u]
}
function ub(s) {
    try {
        return s.split("/").map(l => decodeURIComponent(l).replace(/\//g, "%2F")).join("/")
    } catch (l) {
        return kt(!1, `The URL path "${s}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${l}).`),
        s
    }
}
function on(s, l) {
    if (l === "/")
        return s;
    if (!s.toLowerCase().startsWith(l.toLowerCase()))
        return null;
    let r = l.endsWith("/") ? l.length - 1 : l.length
      , u = s.charAt(r);
    return u && u !== "/" ? null : s.slice(r) || "/"
}
var ob = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
function cb(s, l="/") {
    let {pathname: r, search: u="", hash: c=""} = typeof s == "string" ? Pl(s) : s, f;
    return r ? (r = r.replace(/\/\/+/g, "/"),
    r.startsWith("/") ? f = ug(r.substring(1), "/") : f = ug(r, l)) : f = l,
    {
        pathname: f,
        search: hb(u),
        hash: mb(c)
    }
}
function ug(s, l) {
    let r = l.replace(/\/+$/, "").split("/");
    return s.split("/").forEach(c => {
        c === ".." ? r.length > 1 && r.pop() : c !== "." && r.push(c)
    }
    ),
    r.length > 1 ? r.join("/") : "/"
}
function To(s, l, r, u) {
    return `Cannot include a '${s}' character in a manually specified \`to.${l}\` field [${JSON.stringify(u)}].  Please separate it out to the \`to.${r}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`
}
function fb(s) {
    return s.filter( (l, r) => r === 0 || l.route.path && l.route.path.length > 0)
}
function Zg(s) {
    let l = fb(s);
    return l.map( (r, u) => u === l.length - 1 ? r.pathname : r.pathnameBase)
}
function Xo(s, l, r, u=!1) {
    let c;
    typeof s == "string" ? c = Pl(s) : (c = {
        ...s
    },
    Xe(!c.pathname || !c.pathname.includes("?"), To("?", "pathname", "search", c)),
    Xe(!c.pathname || !c.pathname.includes("#"), To("#", "pathname", "hash", c)),
    Xe(!c.search || !c.search.includes("#"), To("#", "search", "hash", c)));
    let f = s === "" || c.pathname === "", d = f ? "/" : c.pathname, m;
    if (d == null)
        m = r;
    else {
        let v = l.length - 1;
        if (!u && d.startsWith("..")) {
            let S = d.split("/");
            for (; S[0] === ".."; )
                S.shift(),
                v -= 1;
            c.pathname = S.join("/")
        }
        m = v >= 0 ? l[v] : "/"
    }
    let g = cb(c, m)
      , p = d && d !== "/" && d.endsWith("/")
      , b = (f || d === ".") && r.endsWith("/");
    return !g.pathname.endsWith("/") && (p || b) && (g.pathname += "/"),
    g
}
var Vt = s => s.join("/").replace(/\/\/+/g, "/")
  , db = s => s.replace(/\/+$/, "").replace(/^\/*/, "/")
  , hb = s => !s || s === "?" ? "" : s.startsWith("?") ? s : "?" + s
  , mb = s => !s || s === "#" ? "" : s.startsWith("#") ? s : "#" + s
  , gb = class {
    constructor(s, l, r, u=!1) {
        this.status = s,
        this.statusText = l || "",
        this.internal = u,
        r instanceof Error ? (this.data = r.toString(),
        this.error = r) : this.data = r
    }
}
;
function pb(s) {
    return s != null && typeof s.status == "number" && typeof s.statusText == "string" && typeof s.internal == "boolean" && "data"in s
}
function yb(s) {
    return s.map(l => l.route.path).filter(Boolean).join("/").replace(/\/\/*/g, "/") || "/"
}
var Kg = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
function Jg(s, l) {
    let r = s;
    if (typeof r != "string" || !ob.test(r))
        return {
            absoluteURL: void 0,
            isExternal: !1,
            to: r
        };
    let u = r
      , c = !1;
    if (Kg)
        try {
            let f = new URL(window.location.href)
              , d = r.startsWith("//") ? new URL(f.protocol + r) : new URL(r)
              , m = on(d.pathname, l);
            d.origin === f.origin && m != null ? r = m + d.search + d.hash : c = !0
        } catch {
            kt(!1, `<Link to="${r}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)
        }
    return {
        absoluteURL: u,
        isExternal: c,
        to: r
    }
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var $g = ["POST", "PUT", "PATCH", "DELETE"];
new Set($g);
var vb = ["GET", ...$g];
new Set(vb);
var Fa = j.createContext(null);
Fa.displayName = "DataRouter";
var Us = j.createContext(null);
Us.displayName = "DataRouterState";
var bb = j.createContext(!1)
  , Wg = j.createContext({
    isTransitioning: !1
});
Wg.displayName = "ViewTransition";
var xb = j.createContext(new Map);
xb.displayName = "Fetchers";
var Sb = j.createContext(null);
Sb.displayName = "Await";
var zt = j.createContext(null);
zt.displayName = "Navigation";
var Bs = j.createContext(null);
Bs.displayName = "Location";
var cn = j.createContext({
    outlet: null,
    matches: [],
    isDataRoute: !1
});
cn.displayName = "Route";
var Fo = j.createContext(null);
Fo.displayName = "RouteError";
var Ig = "REACT_ROUTER_ERROR"
  , Eb = "REDIRECT"
  , wb = "ROUTE_ERROR_RESPONSE";
function Cb(s) {
    if (s.startsWith(`${Ig}:${Eb}:{`))
        try {
            let l = JSON.parse(s.slice(28));
            if (typeof l == "object" && l && typeof l.status == "number" && typeof l.statusText == "string" && typeof l.location == "string" && typeof l.reloadDocument == "boolean" && typeof l.replace == "boolean")
                return l
        } catch {}
}
function _b(s) {
    if (s.startsWith(`${Ig}:${wb}:{`))
        try {
            let l = JSON.parse(s.slice(40));
            if (typeof l == "object" && l && typeof l.status == "number" && typeof l.statusText == "string")
                return new gb(l.status,l.statusText,l.data)
        } catch {}
}
function Ab(s, {relative: l}={}) {
    Xe(ei(), "useHref() may be used only in the context of a <Router> component.");
    let {basename: r, navigator: u} = j.useContext(zt)
      , {hash: c, pathname: f, search: d} = ti(s, {
        relative: l
    })
      , m = f;
    return r !== "/" && (m = f === "/" ? r : Vt([r, f])),
    u.createHref({
        pathname: m,
        search: d,
        hash: c
    })
}
function ei() {
    return j.useContext(Bs) != null
}
function fn() {
    return Xe(ei(), "useLocation() may be used only in the context of a <Router> component."),
    j.useContext(Bs).location
}
var Pg = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function ep(s) {
    j.useContext(zt).static || j.useLayoutEffect(s)
}
function tp() {
    let {isDataRoute: s} = j.useContext(cn);
    return s ? qb() : Tb()
}
function Tb() {
    Xe(ei(), "useNavigate() may be used only in the context of a <Router> component.");
    let s = j.useContext(Fa)
      , {basename: l, navigator: r} = j.useContext(zt)
      , {matches: u} = j.useContext(cn)
      , {pathname: c} = fn()
      , f = JSON.stringify(Zg(u))
      , d = j.useRef(!1);
    return ep( () => {
        d.current = !0
    }
    ),
    j.useCallback( (g, p={}) => {
        if (kt(d.current, Pg),
        !d.current)
            return;
        if (typeof g == "number") {
            r.go(g);
            return
        }
        let b = Xo(g, JSON.parse(f), c, p.relative === "path");
        s == null && l !== "/" && (b.pathname = b.pathname === "/" ? l : Vt([l, b.pathname])),
        (p.replace ? r.replace : r.push)(b, p.state, p)
    }
    , [l, r, f, c, s])
}
j.createContext(null);
function ti(s, {relative: l}={}) {
    let {matches: r} = j.useContext(cn)
      , {pathname: u} = fn()
      , c = JSON.stringify(Zg(r));
    return j.useMemo( () => Xo(s, JSON.parse(c), u, l === "path"), [s, c, u, l])
}
function Ob(s, l) {
    return np(s)
}
function np(s, l, r) {
    Xe(ei(), "useRoutes() may be used only in the context of a <Router> component.");
    let {navigator: u} = j.useContext(zt)
      , {matches: c} = j.useContext(cn)
      , f = c[c.length - 1]
      , d = f ? f.params : {}
      , m = f ? f.pathname : "/"
      , g = f ? f.pathnameBase : "/"
      , p = f && f.route;
    {
        let C = p && p.path || "";
        lp(m, !p || C.endsWith("*") || C.endsWith("*?"), `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${m}" (under <Route path="${C}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${C}"> to <Route path="${C === "/" ? "*" : `${C}/*`}">.`)
    }
    let b = fn(), v;
    v = b;
    let S = v.pathname || "/"
      , x = S;
    if (g !== "/") {
        let C = g.replace(/^\//, "").split("/");
        x = "/" + S.replace(/^\//, "").split("/").slice(C.length).join("/")
    }
    let E = Qg(s, {
        pathname: x
    });
    return kt(p || E != null, `No routes matched location "${v.pathname}${v.search}${v.hash}" `),
    kt(E == null || E[E.length - 1].route.element !== void 0 || E[E.length - 1].route.Component !== void 0 || E[E.length - 1].route.lazy !== void 0, `Matched leaf route at location "${v.pathname}${v.search}${v.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`),
    Mb(E && E.map(C => Object.assign({}, C, {
        params: Object.assign({}, d, C.params),
        pathname: Vt([g, u.encodeLocation ? u.encodeLocation(C.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : C.pathname]),
        pathnameBase: C.pathnameBase === "/" ? g : Vt([g, u.encodeLocation ? u.encodeLocation(C.pathnameBase.replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : C.pathnameBase])
    })), c, r)
}
function Rb() {
    let s = Hb()
      , l = pb(s) ? `${s.status} ${s.statusText}` : s instanceof Error ? s.message : JSON.stringify(s)
      , r = s instanceof Error ? s.stack : null
      , u = "rgba(200,200,200, 0.5)"
      , c = {
        padding: "0.5rem",
        backgroundColor: u
    }
      , f = {
        padding: "2px 4px",
        backgroundColor: u
    }
      , d = null;
    return console.error("Error handled by React Router default ErrorBoundary:", s),
    d = j.createElement(j.Fragment, null, j.createElement("p", null, "💿 Hey developer 👋"), j.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", j.createElement("code", {
        style: f
    }, "ErrorBoundary"), " or", " ", j.createElement("code", {
        style: f
    }, "errorElement"), " prop on your route.")),
    j.createElement(j.Fragment, null, j.createElement("h2", null, "Unexpected Application Error!"), j.createElement("h3", {
        style: {
            fontStyle: "italic"
        }
    }, l), r ? j.createElement("pre", {
        style: c
    }, r) : null, d)
}
var Nb = j.createElement(Rb, null)
  , ap = class extends j.Component {
    constructor(s) {
        super(s),
        this.state = {
            location: s.location,
            revalidation: s.revalidation,
            error: s.error
        }
    }
    static getDerivedStateFromError(s) {
        return {
            error: s
        }
    }
    static getDerivedStateFromProps(s, l) {
        return l.location !== s.location || l.revalidation !== "idle" && s.revalidation === "idle" ? {
            error: s.error,
            location: s.location,
            revalidation: s.revalidation
        } : {
            error: s.error !== void 0 ? s.error : l.error,
            location: l.location,
            revalidation: s.revalidation || l.revalidation
        }
    }
    componentDidCatch(s, l) {
        this.props.onError ? this.props.onError(s, l) : console.error("React Router caught the following error during render", s)
    }
    render() {
        let s = this.state.error;
        if (this.context && typeof s == "object" && s && "digest"in s && typeof s.digest == "string") {
            const r = _b(s.digest);
            r && (s = r)
        }
        let l = s !== void 0 ? j.createElement(cn.Provider, {
            value: this.props.routeContext
        }, j.createElement(Fo.Provider, {
            value: s,
            children: this.props.component
        })) : this.props.children;
        return this.context ? j.createElement(zb, {
            error: s
        }, l) : l
    }
}
;
ap.contextType = bb;
var Oo = new WeakMap;
function zb({children: s, error: l}) {
    let {basename: r} = j.useContext(zt);
    if (typeof l == "object" && l && "digest"in l && typeof l.digest == "string") {
        let u = Cb(l.digest);
        if (u) {
            let c = Oo.get(l);
            if (c)
                throw c;
            let f = Jg(u.location, r);
            if (Kg && !Oo.get(l))
                if (f.isExternal || u.reloadDocument)
                    window.location.href = f.absoluteURL || f.to;
                else {
                    const d = Promise.resolve().then( () => window.__reactRouterDataRouter.navigate(f.to, {
                        replace: u.replace
                    }));
                    throw Oo.set(l, d),
                    d
                }
            return j.createElement("meta", {
                httpEquiv: "refresh",
                content: `0;url=${f.absoluteURL || f.to}`
            })
        }
    }
    return s
}
function Lb({routeContext: s, match: l, children: r}) {
    let u = j.useContext(Fa);
    return u && u.static && u.staticContext && (l.route.errorElement || l.route.ErrorBoundary) && (u.staticContext._deepestRenderedBoundaryId = l.route.id),
    j.createElement(cn.Provider, {
        value: s
    }, r)
}
function Mb(s, l=[], r) {
    let u = r?.state;
    if (s == null) {
        if (!u)
            return null;
        if (u.errors)
            s = u.matches;
        else if (l.length === 0 && !u.initialized && u.matches.length > 0)
            s = u.matches;
        else
            return null
    }
    let c = s
      , f = u?.errors;
    if (f != null) {
        let b = c.findIndex(v => v.route.id && f?.[v.route.id] !== void 0);
        Xe(b >= 0, `Could not find a matching route for errors on route IDs: ${Object.keys(f).join(",")}`),
        c = c.slice(0, Math.min(c.length, b + 1))
    }
    let d = !1
      , m = -1;
    if (r && u) {
        d = u.renderFallback;
        for (let b = 0; b < c.length; b++) {
            let v = c[b];
            if ((v.route.HydrateFallback || v.route.hydrateFallbackElement) && (m = b),
            v.route.id) {
                let {loaderData: S, errors: x} = u
                  , E = v.route.loader && !S.hasOwnProperty(v.route.id) && (!x || x[v.route.id] === void 0);
                if (v.route.lazy || E) {
                    r.isStatic && (d = !0),
                    m >= 0 ? c = c.slice(0, m + 1) : c = [c[0]];
                    break
                }
            }
        }
    }
    let g = r?.onError
      , p = u && g ? (b, v) => {
        g(b, {
            location: u.location,
            params: u.matches?.[0]?.params ?? {},
            unstable_pattern: yb(u.matches),
            errorInfo: v
        })
    }
    : void 0;
    return c.reduceRight( (b, v, S) => {
        let x, E = !1, O = null, C = null;
        u && (x = f && v.route.id ? f[v.route.id] : void 0,
        O = v.route.errorElement || Nb,
        d && (m < 0 && S === 0 ? (lp("route-fallback", !1, "No `HydrateFallback` element provided to render during initial hydration"),
        E = !0,
        C = null) : m === S && (E = !0,
        C = v.route.hydrateFallbackElement || null)));
        let M = l.concat(c.slice(0, S + 1))
          , G = () => {
            let V;
            return x ? V = O : E ? V = C : v.route.Component ? V = j.createElement(v.route.Component, null) : v.route.element ? V = v.route.element : V = b,
            j.createElement(Lb, {
                match: v,
                routeContext: {
                    outlet: b,
                    matches: M,
                    isDataRoute: u != null
                },
                children: V
            })
        }
        ;
        return u && (v.route.ErrorBoundary || v.route.errorElement || S === 0) ? j.createElement(ap, {
            location: u.location,
            revalidation: u.revalidation,
            component: O,
            error: x,
            children: G(),
            routeContext: {
                outlet: null,
                matches: M,
                isDataRoute: !0
            },
            onError: p
        }) : G()
    }
    , null)
}
function Zo(s) {
    return `${s} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
}
function Db(s) {
    let l = j.useContext(Fa);
    return Xe(l, Zo(s)),
    l
}
function jb(s) {
    let l = j.useContext(Us);
    return Xe(l, Zo(s)),
    l
}
function Ub(s) {
    let l = j.useContext(cn);
    return Xe(l, Zo(s)),
    l
}
function Ko(s) {
    let l = Ub(s)
      , r = l.matches[l.matches.length - 1];
    return Xe(r.route.id, `${s} can only be used on routes that contain a unique "id"`),
    r.route.id
}
function Bb() {
    return Ko("useRouteId")
}
function Hb() {
    let s = j.useContext(Fo)
      , l = jb("useRouteError")
      , r = Ko("useRouteError");
    return s !== void 0 ? s : l.errors?.[r]
}
function qb() {
    let {router: s} = Db("useNavigate")
      , l = Ko("useNavigate")
      , r = j.useRef(!1);
    return ep( () => {
        r.current = !0
    }
    ),
    j.useCallback(async (c, f={}) => {
        kt(r.current, Pg),
        r.current && (typeof c == "number" ? await s.navigate(c) : await s.navigate(c, {
            fromRouteId: l,
            ...f
        }))
    }
    , [s, l])
}
var og = {};
function lp(s, l, r) {
    !l && !og[s] && (og[s] = !0,
    kt(!1, r))
}
j.memo(Gb);
function Gb({routes: s, future: l, state: r, isStatic: u, onError: c}) {
    return np(s, void 0, {
        state: r,
        isStatic: u,
        onError: c
    })
}
function Yb({basename: s="/", children: l=null, location: r, navigationType: u="POP", navigator: c, static: f=!1, unstable_useTransitions: d}) {
    Xe(!ei(), "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");
    let m = s.replace(/^\/*/, "/")
      , g = j.useMemo( () => ({
        basename: m,
        navigator: c,
        static: f,
        unstable_useTransitions: d,
        future: {}
    }), [m, c, f, d]);
    typeof r == "string" && (r = Pl(r));
    let {pathname: p="/", search: b="", hash: v="", state: S=null, key: x="default", unstable_mask: E} = r
      , O = j.useMemo( () => {
        let C = on(p, m);
        return C == null ? null : {
            location: {
                pathname: C,
                search: b,
                hash: v,
                state: S,
                key: x,
                unstable_mask: E
            },
            navigationType: u
        }
    }
    , [m, p, b, v, S, x, u, E]);
    return kt(O != null, `<Router basename="${m}"> is not able to match the URL "${p}${b}${v}" because it does not start with the basename, so the <Router> won't render anything.`),
    O == null ? null : j.createElement(zt.Provider, {
        value: g
    }, j.createElement(Bs.Provider, {
        children: l,
        value: O
    }))
}
var Ts = "get"
  , Os = "application/x-www-form-urlencoded";
function Hs(s) {
    return typeof HTMLElement < "u" && s instanceof HTMLElement
}
function Vb(s) {
    return Hs(s) && s.tagName.toLowerCase() === "button"
}
function kb(s) {
    return Hs(s) && s.tagName.toLowerCase() === "form"
}
function Qb(s) {
    return Hs(s) && s.tagName.toLowerCase() === "input"
}
function Xb(s) {
    return !!(s.metaKey || s.altKey || s.ctrlKey || s.shiftKey)
}
function Fb(s, l) {
    return s.button === 0 && (!l || l === "_self") && !Xb(s)
}
var As = null;
function Zb() {
    if (As === null)
        try {
            new FormData(document.createElement("form"),0),
            As = !1
        } catch {
            As = !0
        }
    return As
}
var Kb = new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function Ro(s) {
    return s != null && !Kb.has(s) ? (kt(!1, `"${s}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Os}"`),
    null) : s
}
function Jb(s, l) {
    let r, u, c, f, d;
    if (kb(s)) {
        let m = s.getAttribute("action");
        u = m ? on(m, l) : null,
        r = s.getAttribute("method") || Ts,
        c = Ro(s.getAttribute("enctype")) || Os,
        f = new FormData(s)
    } else if (Vb(s) || Qb(s) && (s.type === "submit" || s.type === "image")) {
        let m = s.form;
        if (m == null)
            throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
        let g = s.getAttribute("formaction") || m.getAttribute("action");
        if (u = g ? on(g, l) : null,
        r = s.getAttribute("formmethod") || m.getAttribute("method") || Ts,
        c = Ro(s.getAttribute("formenctype")) || Ro(m.getAttribute("enctype")) || Os,
        f = new FormData(m,s),
        !Zb()) {
            let {name: p, type: b, value: v} = s;
            if (b === "image") {
                let S = p ? `${p}.` : "";
                f.append(`${S}x`, "0"),
                f.append(`${S}y`, "0")
            } else
                p && f.append(p, v)
        }
    } else {
        if (Hs(s))
            throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
        r = Ts,
        u = null,
        c = Os,
        d = s
    }
    return f && c === "text/plain" && (d = f,
    f = void 0),
    {
        action: u,
        method: r.toLowerCase(),
        encType: c,
        formData: f,
        body: d
    }
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function Jo(s, l) {
    if (s === !1 || s === null || typeof s > "u")
        throw new Error(l)
}
function $b(s, l, r, u) {
    let c = typeof s == "string" ? new URL(s,typeof window > "u" ? "server://singlefetch/" : window.location.origin) : s;
    return r ? c.pathname.endsWith("/") ? c.pathname = `${c.pathname}_.${u}` : c.pathname = `${c.pathname}.${u}` : c.pathname === "/" ? c.pathname = `_root.${u}` : l && on(c.pathname, l) === "/" ? c.pathname = `${l.replace(/\/$/, "")}/_root.${u}` : c.pathname = `${c.pathname.replace(/\/$/, "")}.${u}`,
    c
}
async function Wb(s, l) {
    if (s.id in l)
        return l[s.id];
    try {
        let r = await import(s.module);
        return l[s.id] = r,
        r
    } catch (r) {
        return console.error(`Error loading route module \`${s.module}\`, reloading page...`),
        console.error(r),
        window.__reactRouterContext && window.__reactRouterContext.isSpaMode,
        window.location.reload(),
        new Promise( () => {}
        )
    }
}
function Ib(s) {
    return s == null ? !1 : s.href == null ? s.rel === "preload" && typeof s.imageSrcSet == "string" && typeof s.imageSizes == "string" : typeof s.rel == "string" && typeof s.href == "string"
}
async function Pb(s, l, r) {
    let u = await Promise.all(s.map(async c => {
        let f = l.routes[c.route.id];
        if (f) {
            let d = await Wb(f, r);
            return d.links ? d.links() : []
        }
        return []
    }
    ));
    return ax(u.flat(1).filter(Ib).filter(c => c.rel === "stylesheet" || c.rel === "preload").map(c => c.rel === "stylesheet" ? {
        ...c,
        rel: "prefetch",
        as: "style"
    } : {
        ...c,
        rel: "prefetch"
    }))
}
function cg(s, l, r, u, c, f) {
    let d = (g, p) => r[p] ? g.route.id !== r[p].route.id : !0
      , m = (g, p) => r[p].pathname !== g.pathname || r[p].route.path?.endsWith("*") && r[p].params["*"] !== g.params["*"];
    return f === "assets" ? l.filter( (g, p) => d(g, p) || m(g, p)) : f === "data" ? l.filter( (g, p) => {
        let b = u.routes[g.route.id];
        if (!b || !b.hasLoader)
            return !1;
        if (d(g, p) || m(g, p))
            return !0;
        if (g.route.shouldRevalidate) {
            let v = g.route.shouldRevalidate({
                currentUrl: new URL(c.pathname + c.search + c.hash,window.origin),
                currentParams: r[0]?.params || {},
                nextUrl: new URL(s,window.origin),
                nextParams: g.params,
                defaultShouldRevalidate: !0
            });
            if (typeof v == "boolean")
                return v
        }
        return !0
    }
    ) : []
}
function ex(s, l, {includeHydrateFallback: r}={}) {
    return tx(s.map(u => {
        let c = l.routes[u.route.id];
        if (!c)
            return [];
        let f = [c.module];
        return c.clientActionModule && (f = f.concat(c.clientActionModule)),
        c.clientLoaderModule && (f = f.concat(c.clientLoaderModule)),
        r && c.hydrateFallbackModule && (f = f.concat(c.hydrateFallbackModule)),
        c.imports && (f = f.concat(c.imports)),
        f
    }
    ).flat(1))
}
function tx(s) {
    return [...new Set(s)]
}
function nx(s) {
    let l = {}
      , r = Object.keys(s).sort();
    for (let u of r)
        l[u] = s[u];
    return l
}
function ax(s, l) {
    let r = new Set;
    return new Set(l),
    s.reduce( (u, c) => {
        let f = JSON.stringify(nx(c));
        return r.has(f) || (r.add(f),
        u.push({
            key: f,
            link: c
        })),
        u
    }
    , [])
}
function ip() {
    let s = j.useContext(Fa);
    return Jo(s, "You must render this element inside a <DataRouterContext.Provider> element"),
    s
}
function lx() {
    let s = j.useContext(Us);
    return Jo(s, "You must render this element inside a <DataRouterStateContext.Provider> element"),
    s
}
var $o = j.createContext(void 0);
$o.displayName = "FrameworkContext";
function sp() {
    let s = j.useContext($o);
    return Jo(s, "You must render this element inside a <HydratedRouter> element"),
    s
}
function ix(s, l) {
    let r = j.useContext($o)
      , [u,c] = j.useState(!1)
      , [f,d] = j.useState(!1)
      , {onFocus: m, onBlur: g, onMouseEnter: p, onMouseLeave: b, onTouchStart: v} = l
      , S = j.useRef(null);
    j.useEffect( () => {
        if (s === "render" && d(!0),
        s === "viewport") {
            let O = M => {
                M.forEach(G => {
                    d(G.isIntersecting)
                }
                )
            }
              , C = new IntersectionObserver(O,{
                threshold: .5
            });
            return S.current && C.observe(S.current),
            () => {
                C.disconnect()
            }
        }
    }
    , [s]),
    j.useEffect( () => {
        if (u) {
            let O = setTimeout( () => {
                d(!0)
            }
            , 100);
            return () => {
                clearTimeout(O)
            }
        }
    }
    , [u]);
    let x = () => {
        c(!0)
    }
      , E = () => {
        c(!1),
        d(!1)
    }
    ;
    return r ? s !== "intent" ? [f, S, {}] : [f, S, {
        onFocus: Xl(m, x),
        onBlur: Xl(g, E),
        onMouseEnter: Xl(p, x),
        onMouseLeave: Xl(b, E),
        onTouchStart: Xl(v, x)
    }] : [!1, S, {}]
}
function Xl(s, l) {
    return r => {
        s && s(r),
        r.defaultPrevented || l(r)
    }
}
function sx({page: s, ...l}) {
    let {router: r} = ip()
      , u = j.useMemo( () => Qg(r.routes, s, r.basename), [r.routes, s, r.basename]);
    return u ? j.createElement(ux, {
        page: s,
        matches: u,
        ...l
    }) : null
}
function rx(s) {
    let {manifest: l, routeModules: r} = sp()
      , [u,c] = j.useState([]);
    return j.useEffect( () => {
        let f = !1;
        return Pb(s, l, r).then(d => {
            f || c(d)
        }
        ),
        () => {
            f = !0
        }
    }
    , [s, l, r]),
    u
}
function ux({page: s, matches: l, ...r}) {
    let u = fn()
      , {future: c, manifest: f, routeModules: d} = sp()
      , {basename: m} = ip()
      , {loaderData: g, matches: p} = lx()
      , b = j.useMemo( () => cg(s, l, p, f, u, "data"), [s, l, p, f, u])
      , v = j.useMemo( () => cg(s, l, p, f, u, "assets"), [s, l, p, f, u])
      , S = j.useMemo( () => {
        if (s === u.pathname + u.search + u.hash)
            return [];
        let O = new Set
          , C = !1;
        if (l.forEach(G => {
            let V = f.routes[G.route.id];
            !V || !V.hasLoader || (!b.some(K => K.route.id === G.route.id) && G.route.id in g && d[G.route.id]?.shouldRevalidate || V.hasClientLoader ? C = !0 : O.add(G.route.id))
        }
        ),
        O.size === 0)
            return [];
        let M = $b(s, m, c.unstable_trailingSlashAwareDataRequests, "data");
        return C && O.size > 0 && M.searchParams.set("_routes", l.filter(G => O.has(G.route.id)).map(G => G.route.id).join(",")),
        [M.pathname + M.search]
    }
    , [m, c.unstable_trailingSlashAwareDataRequests, g, u, f, b, l, s, d])
      , x = j.useMemo( () => ex(v, f), [v, f])
      , E = rx(v);
    return j.createElement(j.Fragment, null, S.map(O => j.createElement("link", {
        key: O,
        rel: "prefetch",
        as: "fetch",
        href: O,
        ...r
    })), x.map(O => j.createElement("link", {
        key: O,
        rel: "modulepreload",
        href: O,
        ...r
    })), E.map( ({key: O, link: C}) => j.createElement("link", {
        key: O,
        nonce: r.nonce,
        ...C,
        crossOrigin: C.crossOrigin ?? r.crossOrigin
    })))
}
function ox(...s) {
    return l => {
        s.forEach(r => {
            typeof r == "function" ? r(l) : r != null && (r.current = l)
        }
        )
    }
}
var cx = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
try {
    cx && (window.__reactRouterVersion = "7.13.1")
} catch {}
function fx({basename: s, children: l, unstable_useTransitions: r, window: u}) {
    let c = j.useRef();
    c.current == null && (c.current = F1({
        window: u,
        v5Compat: !0
    }));
    let f = c.current
      , [d,m] = j.useState({
        action: f.action,
        location: f.location
    })
      , g = j.useCallback(p => {
        r === !1 ? m(p) : j.startTransition( () => m(p))
    }
    , [r]);
    return j.useLayoutEffect( () => f.listen(g), [f, g]),
    j.createElement(Yb, {
        basename: s,
        children: l,
        location: d.location,
        navigationType: d.action,
        navigator: f,
        unstable_useTransitions: r
    })
}
var rp = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i
  , up = j.forwardRef(function({onClick: l, discover: r="render", prefetch: u="none", relative: c, reloadDocument: f, replace: d, unstable_mask: m, state: g, target: p, to: b, preventScrollReset: v, viewTransition: S, unstable_defaultShouldRevalidate: x, ...E}, O) {
    let {basename: C, navigator: M, unstable_useTransitions: G} = j.useContext(zt)
      , V = typeof b == "string" && rp.test(b)
      , K = Jg(b, C);
    b = K.to;
    let W = Ab(b, {
        relative: c
    })
      , ue = fn()
      , I = null;
    if (m) {
        let fe = Xo(m, [], ue.unstable_mask ? ue.unstable_mask.pathname : "/", !0);
        C !== "/" && (fe.pathname = fe.pathname === "/" ? C : Vt([C, fe.pathname])),
        I = M.createHref(fe)
    }
    let[ye,_e,k] = ix(u, E)
      , X = gx(b, {
        replace: d,
        unstable_mask: m,
        state: g,
        target: p,
        preventScrollReset: v,
        relative: c,
        viewTransition: S,
        unstable_defaultShouldRevalidate: x,
        unstable_useTransitions: G
    });
    function Z(fe) {
        l && l(fe),
        fe.defaultPrevented || X(fe)
    }
    let ne = !(K.isExternal || f)
      , oe = j.createElement("a", {
        ...E,
        ...k,
        href: (ne ? I : void 0) || K.absoluteURL || W,
        onClick: ne ? Z : l,
        ref: ox(O, _e),
        target: p,
        "data-discover": !V && r === "render" ? "true" : void 0
    });
    return ye && !V ? j.createElement(j.Fragment, null, oe, j.createElement(sx, {
        page: W
    })) : oe
});
up.displayName = "Link";
var dx = j.forwardRef(function({"aria-current": l="page", caseSensitive: r=!1, className: u="", end: c=!1, style: f, to: d, viewTransition: m, children: g, ...p}, b) {
    let v = ti(d, {
        relative: p.relative
    })
      , S = fn()
      , x = j.useContext(Us)
      , {navigator: E, basename: O} = j.useContext(zt)
      , C = x != null && xx(v) && m === !0
      , M = E.encodeLocation ? E.encodeLocation(v).pathname : v.pathname
      , G = S.pathname
      , V = x && x.navigation && x.navigation.location ? x.navigation.location.pathname : null;
    r || (G = G.toLowerCase(),
    V = V ? V.toLowerCase() : null,
    M = M.toLowerCase()),
    V && O && (V = on(V, O) || V);
    const K = M !== "/" && M.endsWith("/") ? M.length - 1 : M.length;
    let W = G === M || !c && G.startsWith(M) && G.charAt(K) === "/", ue = V != null && (V === M || !c && V.startsWith(M) && V.charAt(M.length) === "/"), I = {
        isActive: W,
        isPending: ue,
        isTransitioning: C
    }, ye = W ? l : void 0, _e;
    typeof u == "function" ? _e = u(I) : _e = [u, W ? "active" : null, ue ? "pending" : null, C ? "transitioning" : null].filter(Boolean).join(" ");
    let k = typeof f == "function" ? f(I) : f;
    return j.createElement(up, {
        ...p,
        "aria-current": ye,
        className: _e,
        ref: b,
        style: k,
        to: d,
        viewTransition: m
    }, typeof g == "function" ? g(I) : g)
});
dx.displayName = "NavLink";
var hx = j.forwardRef( ({discover: s="render", fetcherKey: l, navigate: r, reloadDocument: u, replace: c, state: f, method: d=Ts, action: m, onSubmit: g, relative: p, preventScrollReset: b, viewTransition: v, unstable_defaultShouldRevalidate: S, ...x}, E) => {
    let {unstable_useTransitions: O} = j.useContext(zt)
      , C = vx()
      , M = bx(m, {
        relative: p
    })
      , G = d.toLowerCase() === "get" ? "get" : "post"
      , V = typeof m == "string" && rp.test(m)
      , K = W => {
        if (g && g(W),
        W.defaultPrevented)
            return;
        W.preventDefault();
        let ue = W.nativeEvent.submitter
          , I = ue?.getAttribute("formmethod") || d
          , ye = () => C(ue || W.currentTarget, {
            fetcherKey: l,
            method: I,
            navigate: r,
            replace: c,
            state: f,
            relative: p,
            preventScrollReset: b,
            viewTransition: v,
            unstable_defaultShouldRevalidate: S
        });
        O && r !== !1 ? j.startTransition( () => ye()) : ye()
    }
    ;
    return j.createElement("form", {
        ref: E,
        method: G,
        action: M,
        onSubmit: u ? g : K,
        ...x,
        "data-discover": !V && s === "render" ? "true" : void 0
    })
}
);
hx.displayName = "Form";
function mx(s) {
    return `${s} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
}
function op(s) {
    let l = j.useContext(Fa);
    return Xe(l, mx(s)),
    l
}
function gx(s, {target: l, replace: r, unstable_mask: u, state: c, preventScrollReset: f, relative: d, viewTransition: m, unstable_defaultShouldRevalidate: g, unstable_useTransitions: p}={}) {
    let b = tp()
      , v = fn()
      , S = ti(s, {
        relative: d
    });
    return j.useCallback(x => {
        if (Fb(x, l)) {
            x.preventDefault();
            let E = r !== void 0 ? r : Il(v) === Il(S)
              , O = () => b(s, {
                replace: E,
                unstable_mask: u,
                state: c,
                preventScrollReset: f,
                relative: d,
                viewTransition: m,
                unstable_defaultShouldRevalidate: g
            });
            p ? j.startTransition( () => O()) : O()
        }
    }
    , [v, b, S, r, u, c, l, s, f, d, m, g, p])
}
var px = 0
  , yx = () => `__${String(++px)}__`;
function vx() {
    let {router: s} = op("useSubmit")
      , {basename: l} = j.useContext(zt)
      , r = Bb()
      , u = s.fetch
      , c = s.navigate;
    return j.useCallback(async (f, d={}) => {
        let {action: m, method: g, encType: p, formData: b, body: v} = Jb(f, l);
        if (d.navigate === !1) {
            let S = d.fetcherKey || yx();
            await u(S, r, d.action || m, {
                unstable_defaultShouldRevalidate: d.unstable_defaultShouldRevalidate,
                preventScrollReset: d.preventScrollReset,
                formData: b,
                body: v,
                formMethod: d.method || g,
                formEncType: d.encType || p,
                flushSync: d.flushSync
            })
        } else
            await c(d.action || m, {
                unstable_defaultShouldRevalidate: d.unstable_defaultShouldRevalidate,
                preventScrollReset: d.preventScrollReset,
                formData: b,
                body: v,
                formMethod: d.method || g,
                formEncType: d.encType || p,
                replace: d.replace,
                state: d.state,
                fromRouteId: r,
                flushSync: d.flushSync,
                viewTransition: d.viewTransition
            })
    }
    , [u, c, l, r])
}
function bx(s, {relative: l}={}) {
    let {basename: r} = j.useContext(zt)
      , u = j.useContext(cn);
    Xe(u, "useFormAction must be used inside a RouteContext");
    let[c] = u.matches.slice(-1)
      , f = {
        ...ti(s || ".", {
            relative: l
        })
    }
      , d = fn();
    if (s == null) {
        f.search = d.search;
        let m = new URLSearchParams(f.search)
          , g = m.getAll("index");
        if (g.some(b => b === "")) {
            m.delete("index"),
            g.filter(v => v).forEach(v => m.append("index", v));
            let b = m.toString();
            f.search = b ? `?${b}` : ""
        }
    }
    return (!s || s === ".") && c.route.index && (f.search = f.search ? f.search.replace(/^\?/, "?index&") : "?index"),
    r !== "/" && (f.pathname = f.pathname === "/" ? r : Vt([r, f.pathname])),
    Il(f)
}
function xx(s, {relative: l}={}) {
    let r = j.useContext(Wg);
    Xe(r != null, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");
    let {basename: u} = op("useViewTransitionState")
      , c = ti(s, {
        relative: l
    });
    if (!r.isTransitioning)
        return !1;
    let f = on(r.currentLocation.pathname, u) || r.currentLocation.pathname
      , d = on(r.nextLocation.pathname, u) || r.nextLocation.pathname;
    return Ms(c.pathname, d) != null || Ms(c.pathname, f) != null
}
function Sx() {
    const s = fn();
    return w.jsxs("div", {
        className: "relative flex flex-col items-center justify-center h-screen text-center px-4",
        children: [w.jsx("h1", {
            className: "absolute bottom-0 text-9xl md:text-[12rem] font-black text-gray-50 select-none pointer-events-none z-0",
            children: "404"
        }), w.jsxs("div", {
            className: "relative z-10",
            children: [w.jsx("h1", {
                className: "text-xl md:text-2xl font-semibold mt-6",
                children: "This page has not been generated"
            }), w.jsx("p", {
                className: "mt-2 text-base text-gray-400 font-mono",
                children: s.pathname
            }), w.jsx("p", {
                className: "mt-4 text-lg md:text-xl text-gray-500",
                children: "Tell me more about this page, so I can generate it"
            })]
        })]
    })
}
const fg = [{
    label: "Home",
    href: "#home"
}, {
    label: "Products",
    href: "#products"
}, {
    label: "Craftsmanship",
    href: "#craftsmanship"
}, {
    label: "About",
    href: "#about"
}, {
    label: "Contact",
    href: "#contact"
}];
function Ex() {
    const [s,l] = j.useState(!1)
      , [r,u] = j.useState(!1);
    j.useEffect( () => {
        const f = () => l(window.scrollY > 60);
        return window.addEventListener("scroll", f, {
            passive: !0
        }),
        () => window.removeEventListener("scroll", f)
    }
    , []);
    const c = f => {
        u(!1);
        const d = document.querySelector(f);
        d && d.scrollIntoView({
            behavior: "smooth"
        })
    }
    ;
    return w.jsxs(w.Fragment, {
        children: [w.jsx("nav", {
            className: `fixed top-0 left-0 w-full z-50 transition-all duration-500 ${s ? "bg-[#0F2A44] shadow-lg" : "bg-transparent"}`,
            children: w.jsxs("div", {
                className: "max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20",
                children: [w.jsxs("a", {
                    href: "#home",
                    onClick: f => {
                        f.preventDefault(),
                        c("#home")
                    }
                    ,
                    className: "flex flex-col items-start cursor-pointer group",
                    children: [w.jsx("span", {
                        className: "text-white font-bold tracking-widest uppercase text-sm leading-tight",
                        style: {
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.2em"
                        },
                        children: "Palm Beach"
                    }), w.jsx("span", {
                        className: "text-[#C6A56B] font-light tracking-[0.15em] uppercase text-xs leading-tight",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: "Shutters & Shades"
                    })]
                }), w.jsxs("div", {
                    className: "hidden lg:flex items-center gap-8",
                    children: [fg.map(f => w.jsxs("a", {
                        href: f.href,
                        onClick: d => {
                            d.preventDefault(),
                            c(f.href)
                        }
                        ,
                        className: "relative text-white/90 text-[13px] uppercase tracking-widest font-medium cursor-pointer group transition-colors duration-300 hover:text-[#C6A56B] whitespace-nowrap",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: [f.label, w.jsx("span", {
                            className: "absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-[#C6A56B] transition-all duration-300 group-hover:w-full"
                        })]
                    }, f.label)), w.jsx("a", {
                        href: "#contact",
                        onClick: f => {
                            f.preventDefault(),
                            c("#contact")
                        }
                        ,
                        className: "ml-4 px-6 py-2.5 border border-[#C6A56B] text-[#C6A56B] text-[12px] uppercase tracking-widest font-medium rounded-full cursor-pointer transition-all duration-300 hover:bg-[#C6A56B] hover:text-white whitespace-nowrap",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: "Free Consultation"
                    })]
                }), w.jsxs("button", {
                    className: "lg:hidden flex flex-col gap-[5px] cursor-pointer p-2",
                    onClick: () => u(!r),
                    "aria-label": "Toggle menu",
                    children: [w.jsx("span", {
                        className: `block w-6 h-px bg-white transition-all duration-300 ${r ? "rotate-45 translate-y-[6px]" : ""}`
                    }), w.jsx("span", {
                        className: `block w-6 h-px bg-white transition-all duration-300 ${r ? "opacity-0" : ""}`
                    }), w.jsx("span", {
                        className: `block w-6 h-px bg-white transition-all duration-300 ${r ? "-rotate-45 -translate-y-[6px]" : ""}`
                    })]
                })]
            })
        }), w.jsx("div", {
            className: `fixed inset-0 bg-[#0F2A44] z-40 flex flex-col items-center justify-center transition-all duration-500 ${r ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`,
            children: w.jsxs("div", {
                className: "flex flex-col items-center gap-10",
                children: [fg.map( (f, d) => w.jsx("a", {
                    href: f.href,
                    onClick: m => {
                        m.preventDefault(),
                        c(f.href)
                    }
                    ,
                    className: "text-white cursor-pointer transition-colors duration-300 hover:text-[#C6A56B]",
                    style: {
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "2rem",
                        fontWeight: 400,
                        animationDelay: `${d * 80}ms`
                    },
                    children: f.label
                }, f.label)), w.jsx("a", {
                    href: "#contact",
                    onClick: f => {
                        f.preventDefault(),
                        c("#contact")
                    }
                    ,
                    className: "mt-4 px-10 py-3 border border-[#C6A56B] text-[#C6A56B] uppercase tracking-widest text-sm rounded-full cursor-pointer hover:bg-[#C6A56B] hover:text-white transition-all duration-300 whitespace-nowrap",
                    style: {
                        fontFamily: "'Inter', sans-serif"
                    },
                    children: "Free Consultation"
                })]
            })
        })]
    })
}
function wx() {
    const [s,l] = j.useState(!1);
    j.useEffect( () => {
        const u = setTimeout( () => l(!0), 100);
        return () => clearTimeout(u)
    }
    , []);
    const r = u => {
        const c = document.querySelector(u);
        c && c.scrollIntoView({
            behavior: "smooth"
        })
    }
    ;
    return w.jsxs("section", {
        id: "home",
        className: "relative w-full h-screen overflow-hidden",
        children: [w.jsx("div", {
            className: "absolute inset-0 pbss-kenburns",
            children: w.jsx("img", {
                
                className: "w-full h-full object-cover object-top",
                onLoad: () => l(!0)
            })
        }), w.jsx("div", {
            className: "absolute inset-0 bg-gradient-to-r from-[#0F2A44]/80 via-[#0F2A44]/50 to-[#0F2A44]/20"
        }), w.jsx("div", {
            className: "absolute inset-0 bg-gradient-to-t from-[#0F2A44]/60 via-transparent to-transparent"
        }), w.jsx("div", {
            className: `relative z-10 w-full h-full flex items-center transition-all duration-1000 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
            children: w.jsx("div", {
                className: "max-w-7xl mx-auto px-6 lg:px-10 w-full",
                children: w.jsxs("div", {
                    className: "max-w-2xl",
                    children: [w.jsxs("div", {
                        className: "flex items-center gap-3 mb-6",
                        children: [w.jsx("span", {
                            className: "block w-12 h-px bg-[#C6A56B]"
                        }), w.jsx("span", {
                            className: "text-[#C6A56B] text-xs uppercase tracking-[0.3em] font-medium",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Palm Beach's Premier Window Specialists"
                        })]
                    }), w.jsxs("h1", {
                        className: "text-white leading-[1.1] mb-6",
                        style: {
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                            fontWeight: 500
                        },
                        children: ["Experience", w.jsx("br", {}), w.jsx("em", {
                            className: "not-italic text-[#C6A56B]",
                            children: "Coastal"
                        }), w.jsx("br", {}), "Elegance"]
                    }), w.jsx("p", {
                        className: "text-[#F8F6F2]/80 leading-relaxed mb-10 max-w-lg",
                        style: {
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "1.1rem",
                            fontWeight: 300
                        },
                        children: "Custom shutters, shades, drapes, and blinds — crafted to perfection for the most discerning Palm Beach homes."
                    }), w.jsxs("div", {
                        className: "flex flex-wrap gap-4",
                        children: [w.jsx("button", {
                            onClick: () => r("#contact"),
                            className: "px-8 py-4 bg-[#C6A56B] text-white text-sm uppercase tracking-widest font-medium rounded-full cursor-pointer hover:bg-[#b8955c] transition-all duration-300 hover:scale-105 whitespace-nowrap",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Free Consultation"
                        }), w.jsx("button", {
                            onClick: () => r("#products"),
                            className: "px-8 py-4 border border-white/70 text-white text-sm uppercase tracking-widest font-medium rounded-full cursor-pointer hover:border-[#C6A56B] hover:text-[#C6A56B] transition-all duration-300 whitespace-nowrap",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "View Gallery"
                        })]
                    })]
                })
            })
        }), w.jsxs("div", {
            className: "absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-bounce",
            children: [w.jsx("span", {
                className: "text-[#C6A56B]/60 text-xs uppercase tracking-widest",
                style: {
                    fontFamily: "'Inter', sans-serif"
                },
                children: "Scroll"
            }), w.jsx("span", {
                className: "block w-px h-12 bg-gradient-to-b from-[#C6A56B]/60 to-transparent"
            })]
        })]
    })
}

function _x() {
    const [s,l] = j.useState(!1)
      , r = j.useRef(null);
    return j.useEffect( () => {
        const u = new IntersectionObserver( ([c]) => {
            c.isIntersecting && l(!0)
        }
        ,{
            threshold: .15
        });
        return r.current && u.observe(r.current),
        () => u.disconnect()
    }
    , []),
    w.jsx("section", {
        id: "products",
        className: "py-32 bg-[#F8F6F2]",
        ref: r,
        children: w.jsxs("div", {
            className: "max-w-7xl mx-auto px-6 lg:px-10",
            children: [w.jsxs("div", {
                className: `text-center mb-16 transition-all duration-700 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                children: [w.jsxs("div", {
                    className: "flex items-center justify-center gap-4 mb-5",
                    children: [w.jsx("span", {
                        className: "block w-14 h-px bg-[#C6A56B]"
                    }), w.jsx("span", {
                        className: "text-[#C6A56B] text-xs uppercase tracking-[0.3em]",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: "Our Collections"
                    }), w.jsx("span", {
                        className: "block w-14 h-px bg-[#C6A56B]"
                    })]
                }), w.jsxs("h2", {
                    className: "text-[#0F2A44] leading-tight",
                    style: {
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(2rem, 4vw, 3rem)",
                        fontWeight: 500
                    },
                    children: ["Crafted for Every Window,", w.jsx("br", {}), w.jsx("em", {
                        children: "Every Style"
                    })]
                })]
            }), w.jsx("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                children: Cx.map( (u, c) => w.jsxs("div", {
                    className: `group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`,
                    style: {
                        transitionDelay: `${c * 120}ms`,
                        aspectRatio: "1 / 1"
                    },
                    children: [w.jsx("img", {
                        src: u.image,
                        alt: `${u.label} window treatments`,
                        className: "w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    }), w.jsx("div", {
                        className: "absolute inset-0 bg-gradient-to-t from-[#0F2A44]/80 via-[#0F2A44]/20 to-transparent"
                    }), w.jsx("div", {
                        className: "absolute inset-0 bg-[#0F2A44]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    }), w.jsxs("div", {
                        className: "absolute bottom-0 left-0 right-0 p-7 transition-all duration-500",
                        children: [w.jsx("h3", {
                            className: "text-white mb-2 transition-transform duration-500 group-hover:-translate-y-2",
                            style: {
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "1.75rem",
                                fontWeight: 500
                            },
                            children: u.label
                        }), w.jsx("p", {
                            className: "text-[#F8F6F2]/80 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: u.description
                        })]
                    }), w.jsx("div", {
                        className: "absolute top-4 right-4 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        children: w.jsx("i", {
                            className: "ri-arrow-right-up-line text-[#C6A56B] text-xl"
                        })
                    })]
                }, u.id))
            }), w.jsx("div", {
                className: `text-center mt-14 transition-all duration-700 delay-500 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                children: w.jsxs("a", {
                    href: "#contact",
                    onClick: u => {
                        u.preventDefault(),
                        document.querySelector("#contact")?.scrollIntoView({
                            behavior: "smooth"
                        })
                    }
                    ,
                    className: "inline-flex items-center gap-2 text-[#C6A56B] text-sm uppercase tracking-widest font-medium cursor-pointer hover:gap-4 transition-all duration-300",
                    style: {
                        fontFamily: "'Inter', sans-serif"
                    },
                    children: ["Request Custom Quote", w.jsx("i", {
                        className: "ri-arrow-right-line"
                    })]
                })
            })]
        })
    })
}
const Ax = [{
    icon: "ri-award-line",
    value: "20+",
    label: "Years of Excellence",
    description: "Serving Palm Beach County with luxury window solutions"
}, {
    icon: "ri-home-heart-line",
    value: "3,500+",
    label: "Projects Completed",
    description: "From single rooms to full estate transformations"
}, {
    icon: "ri-time-line",
    value: "14 Days",
    label: "Avg. Turnaround",
    description: "Swift custom fabrication without compromising quality"
}, {
    icon: "ri-shield-check-line",
    value: "Lifetime",
    label: "Craftsmanship Warranty",
    description: "Our promise to stand behind every installation"
}]
  , Tx = [{
    icon: "ri-scissors-cut-line",
    title: "Custom Fabrication",
    text: "Every treatment is precision-cut and hand-finished in our Palm Beach workshop."
}, {
    icon: "ri-user-star-line",
    title: "Expert Consultation",
    text: "Our designers visit your home to help you find the perfect style and fabric."
}, {
    icon: "ri-tools-line",
    title: "White-Glove Installation",
    text: "Factory-trained installers ensure a flawless fit with zero damage to your home."
}];
function Ox() {
    const [s,l] = j.useState(!1)
      , r = j.useRef(null);
    return j.useEffect( () => {
        const u = new IntersectionObserver( ([c]) => {
            c.isIntersecting && l(!0)
        }
        ,{
            threshold: .1
        });
        return r.current && u.observe(r.current),
        () => u.disconnect()
    }
    , []),
    w.jsxs("section", {
        id: "craftsmanship",
        className: "bg-white",
        ref: r,
        children: [w.jsx("div", {
            className: "border-b border-[#E8E3DC]",
            children: w.jsx("div", {
                className: "max-w-7xl mx-auto px-6 lg:px-10",
                children: w.jsx("div", {
                    className: "grid grid-cols-2 lg:grid-cols-4",
                    children: Ax.map( (u, c) => w.jsxs("div", {
                        className: `py-14 px-8 flex flex-col items-center text-center relative transition-all duration-700 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${c < 3 ? "border-r border-[#E8E3DC]" : ""}`,
                        style: {
                            transitionDelay: `${c * 100}ms`
                        },
                        children: [w.jsx("div", {
                            className: "w-12 h-12 flex items-center justify-center mb-4",
                            children: w.jsx("i", {
                                className: `${u.icon} text-[#C6A56B] text-2xl`
                            })
                        }), w.jsx("div", {
                            className: "text-[#C6A56B] mb-1",
                            style: {
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "2.2rem",
                                fontWeight: 500
                            },
                            children: u.value
                        }), w.jsx("div", {
                            className: "text-[#1E1E1E] text-sm font-semibold uppercase tracking-wider mb-2",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: u.label
                        }), w.jsx("p", {
                            className: "text-[#1E1E1E]/50 text-xs leading-relaxed max-w-[160px]",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: u.description
                        })]
                    }, u.label))
                })
            })
        }), w.jsx("div", {
            className: "py-28 bg-[#0F2A44]",
            children: w.jsxs("div", {
                className: "max-w-7xl mx-auto px-6 lg:px-10",
                children: [w.jsxs("div", {
                    className: `text-center mb-16 transition-all duration-700 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                    children: [w.jsxs("div", {
                        className: "flex items-center justify-center gap-4 mb-5",
                        children: [w.jsx("span", {
                            className: "block w-14 h-px bg-[#C6A56B]"
                        }), w.jsx("span", {
                            className: "text-[#C6A56B] text-xs uppercase tracking-[0.3em]",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Why Choose Us"
                        }), w.jsx("span", {
                            className: "block w-14 h-px bg-[#C6A56B]"
                        })]
                    }), w.jsxs("h2", {
                        className: "text-white",
                        style: {
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                            fontWeight: 500
                        },
                        children: ["The Standard of ", w.jsx("em", {
                            className: "text-[#C6A56B]",
                            children: "Coastal Craftsmanship"
                        })]
                    })]
                }), w.jsx("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-8",
                    children: Tx.map( (u, c) => w.jsxs("div", {
                        className: `p-10 border border-white/10 rounded-2xl hover:border-[#C6A56B]/40 transition-all duration-500 cursor-default group ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`,
                        style: {
                            transitionDelay: `${200 + c * 120}ms`
                        },
                        children: [w.jsx("div", {
                            className: "w-12 h-12 flex items-center justify-center mb-6 border border-[#C6A56B]/40 rounded-xl group-hover:bg-[#C6A56B]/10 transition-colors duration-300",
                            children: w.jsx("i", {
                                className: `${u.icon} text-[#C6A56B] text-xl`
                            })
                        }), w.jsx("h3", {
                            className: "text-white mb-3",
                            style: {
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "1.35rem",
                                fontWeight: 500
                            },
                            children: u.title
                        }), w.jsx("p", {
                            className: "text-[#F8F6F2]/60 text-sm leading-relaxed",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: u.text
                        })]
                    }, u.title))
                })]
            })
        })]
    })
}
function Rx() {
    const [s,l] = j.useState(!1)
      , r = j.useRef(null);
    return j.useEffect( () => {
        const u = new IntersectionObserver( ([c]) => {
            c.isIntersecting && l(!0)
        }
        ,{
            threshold: .15
        });
        return r.current && u.observe(r.current),
        () => u.disconnect()
    }
    , []),
    w.jsx("section", {
        id: "about",
        className: "bg-[#F8F6F2]",
        ref: r,
        children: w.jsxs("div", {
            className: "max-w-7xl mx-auto px-6 lg:px-10 py-32",
            children: [w.jsxs("div", {
                className: `flex items-center gap-4 mb-16 transition-all duration-700 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                children: [w.jsx("span", {
                    className: "block w-14 h-px bg-[#C6A56B]"
                }), w.jsx("span", {
                    className: "text-[#C6A56B] text-xs uppercase tracking-[0.3em]",
                    style: {
                        fontFamily: "'Inter', sans-serif"
                    },
                    children: "Our Story"
                })]
            }), w.jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center",
                children: [w.jsxs("div", {
                    className: `transition-all duration-700 delay-150 ${s ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`,
                    children: [w.jsxs("h2", {
                        className: "text-[#0F2A44] leading-tight mb-8",
                        style: {
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2rem, 3.5vw, 3rem)",
                            fontWeight: 500
                        },
                        children: ["Rooted in Palm Beach,", w.jsx("br", {}), w.jsx("em", {
                            className: "text-[#C6A56B]",
                            children: "Built on Trust"
                        })]
                    }), w.jsxs("div", {
                        className: "space-y-5 text-[#1E1E1E]/70 leading-[1.9] max-w-lg",
                        style: {
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "1rem",
                            fontWeight: 300
                        },
                        children: [w.jsx("p", {
                            children: "For over two decades, Palm Beach Shutters and Shades has been the trusted choice for homeowners who demand nothing less than perfection. What started as a small family operation has grown into the region's most sought-after window treatment studio."
                        }), w.jsx("p", {
                            children: "Every consultation begins with listening — understanding how you live in your home, what light you love, and what aesthetic moves you. From there, our design team curates a selection of premium materials and styles tailored specifically to your space."
                        }), w.jsx("p", {
                            children: "Our artisans fabricate each piece locally, ensuring every seam, slat, and pleat meets our exacting standards. We don't just install window treatments — we craft the atmosphere of your home."
                        })]
                    }), w.jsxs("div", {
                        className: "mt-10 flex items-center gap-6",
                        children: [w.jsx("button", {
                            onClick: () => document.querySelector("#contact")?.scrollIntoView({
                                behavior: "smooth"
                            }),
                            className: "px-8 py-3.5 bg-[#0F2A44] text-white text-xs uppercase tracking-widest rounded-full cursor-pointer hover:bg-[#C6A56B] transition-all duration-300 whitespace-nowrap",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Meet Our Team"
                        }), w.jsxs("a", {
                            href: "#craftsmanship",
                            onClick: u => {
                                u.preventDefault(),
                                document.querySelector("#craftsmanship")?.scrollIntoView({
                                    behavior: "smooth"
                                })
                            }
                            ,
                            className: "inline-flex items-center gap-2 text-[#C6A56B] text-xs uppercase tracking-widest cursor-pointer hover:gap-4 transition-all duration-300 whitespace-nowrap",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: ["Our Process ", w.jsx("i", {
                                className: "ri-arrow-right-line"
                            })]
                        })]
                    }), w.jsx("div", {
                        className: "mt-14 pt-10 border-t border-[#1E1E1E]/10 flex items-center gap-6",
                        children: w.jsxs("div", {
                            children: [w.jsx("div", {
                                className: "text-[#0F2A44]",
                                style: {
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "1.5rem",
                                    fontStyle: "italic"
                                },
                                children: "James & Sarah Whitfield"
                            }), w.jsx("div", {
                                className: "text-[#1E1E1E]/40 text-xs uppercase tracking-wider mt-1",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                },
                                children: "Founders, Palm Beach Shutters & Shades"
                            })]
                        })
                    })]
                }), w.jsxs("div", {
                    className: `relative transition-all duration-700 delay-300 ${s ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`,
                    children: [w.jsxs("div", {
                        className: "relative rounded-2xl overflow-hidden",
                        style: {
                            height: "560px"
                        },
                        children: [w.jsx("img", {
                            
                            alt: "Palm Beach Shutters and Shades showroom and team",
                            className: "w-full h-full object-cover object-top"
                        }), w.jsx("div", {
                            className: "absolute inset-0 bg-gradient-to-t from-[#0F2A44]/30 to-transparent"
                        })]
                    }), w.jsxs("div", {
                        className: "absolute -bottom-8 -left-8 bg-white rounded-2xl p-7 border border-[#E8E3DC]",
                        style: {
                            minWidth: "200px"
                        },
                        children: [w.jsx("div", {
                            className: "text-[#C6A56B] mb-1",
                            style: {
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "2.5rem",
                                fontWeight: 500
                            },
                            children: "#1"
                        }), w.jsx("div", {
                            className: "text-[#1E1E1E] text-xs uppercase tracking-wider font-medium",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Rated Window Studio"
                        }), w.jsx("div", {
                            className: "text-[#1E1E1E]/40 text-xs mt-1",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Palm Beach County 2024"
                        })]
                    }), w.jsx("div", {
                        className: "absolute top-0 -right-4 w-1.5 h-40 bg-[#C6A56B] rounded-full"
                    })]
                })]
            })]
        })
    })
}
const Nx = "https://readdy.ai/api/form/d6sh6abvrivh3q8km0hg";
function zx() {
    const [s,l] = j.useState(!1)
      , [r,u] = j.useState(!1)
      , [c,f] = j.useState(!1)
      , [d,m] = j.useState("")
      , g = j.useRef(null);
    j.useEffect( () => {
        const b = new IntersectionObserver( ([v]) => {
            v.isIntersecting && l(!0)
        }
        ,{
            threshold: .1
        });
        return g.current && b.observe(g.current),
        () => b.disconnect()
    }
    , []);
    const p = async b => {
        b.preventDefault(),
        u(!0),
        m("");
        const v = b.currentTarget
          , S = new URLSearchParams;
        new FormData(v).forEach( (E, O) => {
            S.append(O, E.toString())
        }
        );
        try {
            (await fetch(Nx, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: S.toString()
            })).ok ? (f(!0),
            v.reset()) : m("Something went wrong. Please try again.")
        } catch {
            m("Network error. Please try again.")
        } finally {
            u(!1)
        }
    }
    ;
    return w.jsx("section", {
        id: "contact",
        className: "bg-white",
        ref: g,
        children: w.jsxs("div", {
            className: "max-w-7xl mx-auto px-6 lg:px-10 py-32",
            children: [w.jsxs("div", {
                className: `text-center mb-16 transition-all duration-700 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                children: [w.jsxs("div", {
                    className: "flex items-center justify-center gap-4 mb-5",
                    children: [w.jsx("span", {
                        className: "block w-14 h-px bg-[#C6A56B]"
                    }), w.jsx("span", {
                        className: "text-[#C6A56B] text-xs uppercase tracking-[0.3em]",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: "Get In Touch"
                    }), w.jsx("span", {
                        className: "block w-14 h-px bg-[#C6A56B]"
                    })]
                }), w.jsx("h2", {
                    className: "text-[#0F2A44]",
                    style: {
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(2rem, 4vw, 3rem)",
                        fontWeight: 500
                    },
                    children: "Let's Create Your Vision"
                }), w.jsx("p", {
                    className: "text-[#1E1E1E]/50 mt-4 max-w-md mx-auto leading-relaxed",
                    style: {
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.95rem"
                    },
                    children: "Book a complimentary in-home consultation with one of our design specialists."
                })]
            }), w.jsxs("div", {
                className: `grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-[#E8E3DC] transition-all duration-700 delay-200 ${s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`,
                children: [w.jsxs("div", {
                    className: "lg:col-span-2 bg-[#0F2A44] p-12 flex flex-col justify-between",
                    children: [w.jsxs("div", {
                        children: [w.jsxs("h3", {
                            className: "text-white mb-6 leading-tight",
                            style: {
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "1.7rem",
                                fontWeight: 500
                            },
                            children: ["Reach Out,", w.jsx("br", {}), "We're Here to Help"]
                        }), w.jsx("p", {
                            className: "text-[#F8F6F2]/60 text-sm leading-relaxed mb-10",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Whether you're renovating a single room or an entire estate, our team is ready to help you achieve the perfect look."
                        }), w.jsx("div", {
                            className: "space-y-6",
                            children: [{
                                icon: "ri-phone-line",
                                label: "Phone",
                                value: "(561) 123-4567"
                            }, {
                                icon: "ri-mail-line",
                                label: "Email",
                                value: "hello@palmbeachshutters.com"
                            }, {
                                icon: "ri-map-pin-line",
                                label: "Showroom",
                                value: "Palm Beach Gardens, FL 33410"
                            }, {
                                icon: "ri-time-line",
                                label: "Hours",
                                value: "Mon–Sat: 9am – 6pm"
                            }].map(b => w.jsxs("div", {
                                className: "flex items-start gap-4",
                                children: [w.jsx("div", {
                                    className: "w-8 h-8 flex items-center justify-center border border-[#C6A56B]/40 rounded-lg flex-shrink-0",
                                    children: w.jsx("i", {
                                        className: `${b.icon} text-[#C6A56B] text-base`
                                    })
                                }), w.jsxs("div", {
                                    children: [w.jsx("div", {
                                        className: "text-[#C6A56B] text-xs uppercase tracking-wider mb-0.5",
                                        style: {
                                            fontFamily: "'Inter', sans-serif"
                                        },
                                        children: b.label
                                    }), w.jsx("div", {
                                        className: "text-white/80 text-sm",
                                        style: {
                                            fontFamily: "'Inter', sans-serif"
                                        },
                                        children: b.value
                                    })]
                                })]
                            }, b.label))
                        })]
                    }), w.jsxs("div", {
                        className: "mt-12 pt-10 border-t border-white/10",
                        children: [w.jsx("div", {
                            className: "text-[#F8F6F2]/30 text-xs uppercase tracking-widest mb-4",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Follow Our Work"
                        }), w.jsx("div", {
                            className: "flex items-center gap-4",
                            children: ["ri-instagram-line", "ri-facebook-line", "ri-pinterest-line"].map(b => w.jsx("div", {
                                className: "w-9 h-9 flex items-center justify-center border border-white/20 rounded-full cursor-pointer hover:border-[#C6A56B] hover:text-[#C6A56B] text-white/60 transition-all duration-300",
                                children: w.jsx("i", {
                                    className: `${b} text-base`
                                })
                            }, b))
                        })]
                    })]
                }), w.jsx("div", {
                    className: "lg:col-span-3 bg-[#F8F6F2] p-12",
                    children: c ? w.jsxs("div", {
                        className: "h-full flex flex-col items-center justify-center text-center py-16",
                        children: [w.jsx("div", {
                            className: "w-16 h-16 flex items-center justify-center bg-[#C6A56B]/10 rounded-full mb-6",
                            children: w.jsx("i", {
                                className: "ri-check-line text-[#C6A56B] text-2xl"
                            })
                        }), w.jsx("h3", {
                            className: "text-[#0F2A44] mb-3",
                            style: {
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "1.5rem"
                            },
                            children: "Thank You!"
                        }), w.jsx("p", {
                            className: "text-[#1E1E1E]/50 text-sm max-w-xs",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "We've received your message and will be in touch within one business day."
                        }), w.jsx("button", {
                            onClick: () => f(!1),
                            className: "mt-8 px-8 py-3 border border-[#C6A56B] text-[#C6A56B] text-xs uppercase tracking-widest rounded-full cursor-pointer hover:bg-[#C6A56B] hover:text-white transition-all duration-300 whitespace-nowrap",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Send Another"
                        })]
                    }) : w.jsxs("form", {
                        onSubmit: p,
                        "data-readdy-form": !0,
                        id: "contact-form",
                        className: "space-y-6",
                        children: [w.jsxs("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 gap-5",
                            children: [w.jsxs("div", {
                                children: [w.jsxs("label", {
                                    className: "block text-[#1E1E1E] text-xs uppercase tracking-wider mb-2 font-medium",
                                    style: {
                                        fontFamily: "'Inter', sans-serif"
                                    },
                                    children: ["First Name ", w.jsx("span", {
                                        className: "text-[#C6A56B]",
                                        children: "*"
                                    })]
                                }), w.jsx("input", {
                                    type: "text",
                                    name: "first_name",
                                    required: !0,
                                    placeholder: "James",
                                    className: "w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm text-[#1E1E1E] placeholder-[#1E1E1E]/30 focus:outline-none focus:border-[#C6A56B] transition-colors duration-300",
                                    style: {
                                        fontFamily: "'Inter', sans-serif"
                                    }
                                })]
                            }), w.jsxs("div", {
                                children: [w.jsxs("label", {
                                    className: "block text-[#1E1E1E] text-xs uppercase tracking-wider mb-2 font-medium",
                                    style: {
                                        fontFamily: "'Inter', sans-serif"
                                    },
                                    children: ["Last Name ", w.jsx("span", {
                                        className: "text-[#C6A56B]",
                                        children: "*"
                                    })]
                                }), w.jsx("input", {
                                    type: "text",
                                    name: "last_name",
                                    required: !0,
                                    placeholder: "Whitfield",
                                    className: "w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm text-[#1E1E1E] placeholder-[#1E1E1E]/30 focus:outline-none focus:border-[#C6A56B] transition-colors duration-300",
                                    style: {
                                        fontFamily: "'Inter', sans-serif"
                                    }
                                })]
                            })]
                        }), w.jsxs("div", {
                            children: [w.jsxs("label", {
                                className: "block text-[#1E1E1E] text-xs uppercase tracking-wider mb-2 font-medium",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                },
                                children: ["Email Address ", w.jsx("span", {
                                    className: "text-[#C6A56B]",
                                    children: "*"
                                })]
                            }), w.jsx("input", {
                                type: "email",
                                name: "email",
                                required: !0,
                                placeholder: "james@example.com",
                                className: "w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm text-[#1E1E1E] placeholder-[#1E1E1E]/30 focus:outline-none focus:border-[#C6A56B] transition-colors duration-300",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                }
                            })]
                        }), w.jsxs("div", {
                            children: [w.jsx("label", {
                                className: "block text-[#1E1E1E] text-xs uppercase tracking-wider mb-2 font-medium",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                },
                                children: "Phone Number"
                            }), w.jsx("input", {
                                type: "tel",
                                name: "phone",
                                placeholder: "(561) 000-0000",
                                className: "w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm text-[#1E1E1E] placeholder-[#1E1E1E]/30 focus:outline-none focus:border-[#C6A56B] transition-colors duration-300",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                }
                            })]
                        }), w.jsxs("div", {
                            children: [w.jsx("label", {
                                className: "block text-[#1E1E1E] text-xs uppercase tracking-wider mb-2 font-medium",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                },
                                children: "Product Interest"
                            }), w.jsxs("select", {
                                name: "product_interest",
                                className: "w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm text-[#1E1E1E] focus:outline-none focus:border-[#C6A56B] transition-colors duration-300 cursor-pointer appearance-none",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                },
                                children: [w.jsx("option", {
                                    value: "",
                                    children: "Select a product category"
                                }), w.jsx("option", {
                                    value: "Shutters",
                                    children: "Plantation Shutters"
                                }), w.jsx("option", {
                                    value: "Shades",
                                    children: "Custom Shades"
                                }), w.jsx("option", {
                                    value: "Drapes",
                                    children: "Drapes & Curtains"
                                }), w.jsx("option", {
                                    value: "Blinds",
                                    children: "Blinds"
                                }), w.jsx("option", {
                                    value: "Multiple",
                                    children: "Multiple Products"
                                }), w.jsx("option", {
                                    value: "Unsure",
                                    children: "Not Sure — Need Consultation"
                                })]
                            })]
                        }), w.jsxs("div", {
                            children: [w.jsx("label", {
                                className: "block text-[#1E1E1E] text-xs uppercase tracking-wider mb-2 font-medium",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                },
                                children: "Message"
                            }), w.jsx("textarea", {
                                name: "message",
                                rows: 4,
                                placeholder: "Tell us about your project, the rooms you're working on, or any questions you have...",
                                maxLength: 500,
                                className: "w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-sm text-[#1E1E1E] placeholder-[#1E1E1E]/30 focus:outline-none focus:border-[#C6A56B] transition-colors duration-300 resize-none",
                                style: {
                                    fontFamily: "'Inter', sans-serif"
                                }
                            })]
                        }), d && w.jsx("p", {
                            className: "text-red-500 text-xs",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: d
                        }), w.jsx("button", {
                            type: "submit",
                            disabled: r,
                            className: "w-full py-4 bg-[#C6A56B] text-white text-sm uppercase tracking-widest font-medium rounded-full cursor-pointer hover:bg-[#b8955c] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] whitespace-nowrap",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: r ? "Sending..." : "Request Free Consultation"
                        }), w.jsx("p", {
                            className: "text-center text-[#1E1E1E]/30 text-xs",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "We respect your privacy. No spam, ever."
                        })]
                    })
                })]
            })]
        })
    })
}
const Lx = {
    Services: ["Plantation Shutters", "Custom Shades", "Drapes & Curtains", "Blinds", "Motorization"],
    Company: ["About Us", "Our Process", "Showroom", "Careers", "Press"],
    Support: ["Free Consultation", "Installation FAQ", "Warranty", "Care Guide", "Contact"]
};
function Mx() {
    const s = l => {
        document.querySelector(l)?.scrollIntoView({
            behavior: "smooth"
        })
    }
    ;
    return w.jsxs("footer", {
        id: "footer",
        className: "bg-[#0F2A44]",
        children: [w.jsx("div", {
            className: "border-b border-white/10",
            children: w.jsxs("div", {
                className: "max-w-7xl mx-auto px-6 lg:px-10 py-16 flex flex-col lg:flex-row items-center justify-between gap-8",
                children: [w.jsxs("div", {
                    children: [w.jsx("h3", {
                        className: "text-white mb-2",
                        style: {
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                            fontWeight: 500
                        },
                        children: "Ready to Transform Your Home?"
                    }), w.jsx("p", {
                        className: "text-[#F8F6F2]/50 text-sm",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: "Book your complimentary in-home design consultation today."
                    })]
                }), w.jsx("button", {
                    onClick: () => s("#contact"),
                    className: "flex-shrink-0 px-10 py-4 bg-[#C6A56B] text-white text-xs uppercase tracking-widest font-medium rounded-full cursor-pointer hover:bg-[#b8955c] transition-all duration-300 hover:scale-105 whitespace-nowrap",
                    style: {
                        fontFamily: "'Inter', sans-serif"
                    },
                    children: "Schedule Consultation"
                })]
            })
        }), w.jsxs("div", {
            className: "max-w-7xl mx-auto px-6 lg:px-10 py-20",
            children: [w.jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8",
                children: [w.jsxs("div", {
                    className: "lg:col-span-1",
                    children: [w.jsxs("div", {
                        className: "mb-6",
                        children: [w.jsx("div", {
                            className: "text-white font-bold tracking-widest uppercase text-sm leading-tight",
                            style: {
                                fontFamily: "'Inter', sans-serif",
                                letterSpacing: "0.2em"
                            },
                            children: "Palm Beach"
                        }), w.jsx("div", {
                            className: "text-[#C6A56B] font-light tracking-[0.15em] uppercase text-xs leading-tight",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Shutters & Shades"
                        })]
                    }), w.jsx("p", {
                        className: "text-[#F8F6F2]/40 text-sm leading-relaxed mb-8 max-w-[220px]",
                        style: {
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 300
                        },
                        children: w.jsx("em", {
                            style: {
                                fontFamily: "'Playfair Display', serif",
                                fontStyle: "italic"
                            },
                            children: "“Where coastal living meets artisan craftsmanship.”"
                        })
                    }), w.jsx("div", {
                        className: "flex items-center gap-3",
                        children: [{
                            icon: "ri-instagram-line",
                            label: "Instagram"
                        }, {
                            icon: "ri-facebook-line",
                            label: "Facebook"
                        }, {
                            icon: "ri-pinterest-line",
                            label: "Pinterest"
                        }, {
                            icon: "ri-hourglass-line",
                            label: "Houzz"
                        }].map(l => w.jsx("div", {
                            className: "w-9 h-9 flex items-center justify-center border border-white/15 rounded-full text-white/40 cursor-pointer hover:border-[#C6A56B] hover:text-[#C6A56B] transition-all duration-300",
                            title: l.label,
                            children: w.jsx("i", {
                                className: `${l.icon} text-sm`
                            })
                        }, l.label))
                    })]
                }), Object.entries(Lx).map( ([l,r]) => w.jsxs("div", {
                    children: [w.jsx("h4", {
                        className: "text-[#C6A56B] text-xs uppercase tracking-[0.25em] font-medium mb-6",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: l
                    }), w.jsx("ul", {
                        className: "space-y-3",
                        children: r.map(u => w.jsx("li", {
                            children: w.jsx("a", {
                                href: "#",
                                onClick: c => {
                                    c.preventDefault(),
                                    (u === "Free Consultation" || u === "Contact") && s("#contact")
                                }
                                ,
                                className: "text-[#F8F6F2]/40 text-sm cursor-pointer hover:text-[#C6A56B] hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-1",
                                style: {
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 300
                                },
                                children: u
                            })
                        }, u))
                    })]
                }, l))]
            }), w.jsx("div", {
                className: "mt-16 pt-10 border-t border-white/10",
                children: w.jsxs("div", {
                    className: "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8",
                    children: [w.jsxs("div", {
                        children: [w.jsx("div", {
                            className: "text-[#C6A56B] text-xs uppercase tracking-[0.25em] mb-2",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Stay Inspired"
                        }), w.jsx("p", {
                            className: "text-[#F8F6F2]/40 text-sm",
                            style: {
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 300
                            },
                            children: "Design tips, trend updates, and exclusive offers — delivered monthly."
                        })]
                    }), w.jsxs("div", {
                        className: "flex items-center gap-0 w-full lg:w-auto",
                        children: [w.jsx("input", {
                            type: "email",
                            placeholder: "Your email address",
                            className: "flex-1 lg:w-72 bg-white/5 border border-white/15 rounded-l-full px-5 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C6A56B] transition-colors duration-300",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            }
                        }), w.jsx("button", {
                            className: "px-6 py-3 bg-[#C6A56B] text-white text-xs uppercase tracking-widest rounded-r-full cursor-pointer hover:bg-[#b8955c] transition-colors duration-300 whitespace-nowrap",
                            style: {
                                fontFamily: "'Inter', sans-serif"
                            },
                            children: "Subscribe"
                        })]
                    })]
                })
            }), w.jsxs("div", {
                className: "mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4",
                children: [w.jsxs("p", {
                    className: "text-[#F8F6F2]/25 text-xs",
                    style: {
                        fontFamily: "'Inter', sans-serif"
                    },
                    children: ["© ", new Date().getFullYear(), " Palm Beach Shutters and Shades. All rights reserved."]
                }), w.jsx("div", {
                    className: "flex items-center gap-6",
                    children: ["Privacy Policy", "Terms of Service", "Sitemap"].map(l => w.jsx("a", {
                        href: "#",
                        className: "text-[#F8F6F2]/25 text-xs cursor-pointer hover:text-[#C6A56B] transition-colors duration-300",
                        style: {
                            fontFamily: "'Inter', sans-serif"
                        },
                        children: l
                    }, l))
                })]
            })]
        })]
    })
}
function Dx() {
    return w.jsxs("main", {
        className: "w-full overflow-x-hidden",
        children: [w.jsx(Ex, {}), w.jsx(wx, {}), w.jsx(_x, {}), w.jsx(Ox, {}), w.jsx(Rx, {}), w.jsx(zx, {}), w.jsx(Mx, {})]
    })
}
const cp = [{
    path: "/",
    element: w.jsx(Dx, {})
}, {
    path: "*",
    element: w.jsx(Sx, {})
}]
  , jx = Object.freeze(Object.defineProperty({
    __proto__: null,
    default: cp
}, Symbol.toStringTag, {
    value: "Module"
}));
let fp;
const Ux = new Promise(s => {
    fp = s
}
);
function dp() {
    const s = Ob(cp)
      , l = tp();
    return j.useEffect( () => {
        window.REACT_APP_NAVIGATE = l,
        fp(window.REACT_APP_NAVIGATE)
    }
    ),
    s
}
const Bx = Object.freeze(Object.defineProperty({
    __proto__: null,
    AppRoutes: dp,
    navigatePromise: Ux
}, Symbol.toStringTag, {
    value: "Module"
}));
function Hx() {
    return w.jsx(w1, {
        i18n: et,
        children: w.jsx(fx, {
            basename: "/preview/9b2e8b58-f57b-4d65-baad-9e44f3a9e6a7/7401061",
            children: w.jsx(dp, {})
        })
    })
}
X1.createRoot(document.getElementById("root")).render(w.jsx(j.StrictMode, {
    children: w.jsx(Hx, {})
}));
//# sourceMappingURL=index-BZfnTK-_.js.map

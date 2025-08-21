function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var react = { exports: {} };
var react_production = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReact_production;
function requireReact_production() {
  if (hasRequiredReact_production) return react_production;
  hasRequiredReact_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, assign = Object.assign, emptyObject = {};
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  function ComponentDummy() {
  }
  ComponentDummy.prototype = Component.prototype;
  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  var isArrayImpl = Array.isArray, ReactSharedInternals = { H: null, A: null, T: null, S: null }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function ReactElement(type, key, self, source, owner, props) {
    self = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== self ? self : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(
      oldElement.type,
      newKey,
      void 0,
      void 0,
      void 0,
      oldElement.props
    );
  }
  function isValidElement(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape2(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index2) {
    return "object" === typeof element && null !== element && null != element.key ? escape2("" + element.key) : index2.toString(36);
  }
  function noop$1() {
  }
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch ("string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(
          function(fulfilledValue) {
            "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          },
          function(error) {
            "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
          }
        )), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if ("undefined" === type || "boolean" === type) children = null;
    var invokeCallback = false;
    if (null === children) invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              );
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c2) {
        return c2;
      })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
        callback,
        escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
          userProvidedKeyEscapeRegex,
          "$&/"
        ) + "/") + invokeCallback
      )), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0; i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if (i = getIteratorFn(children), "function" === typeof i)
      for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        );
    else if ("object" === type) {
      if ("function" === typeof children.then)
        return mapIntoArray(
          resolveThenable(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      array = String(children);
      throw Error(
        "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (null == children) return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (-1 === payload._status) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(
        function(moduleObject) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 1, payload._result = moduleObject;
        },
        function(error) {
          if (0 === payload._status || -1 === payload._status)
            payload._status = 2, payload._result = error;
        }
      );
      -1 === payload._status && (payload._status = 0, payload._result = ctor);
    }
    if (1 === payload._status) return payload._result.default;
    throw payload._result;
  }
  var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event)) return;
    } else if ("object" === typeof process && "function" === typeof process.emit) {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  };
  function noop() {
  }
  react_production.Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function() {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function(children) {
      var n2 = 0;
      mapChildren(children, function() {
        n2++;
      });
      return n2;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return children;
    }
  };
  react_production.Component = Component;
  react_production.Fragment = REACT_FRAGMENT_TYPE;
  react_production.Profiler = REACT_PROFILER_TYPE;
  react_production.PureComponent = PureComponent;
  react_production.StrictMode = REACT_STRICT_MODE_TYPE;
  react_production.Suspense = REACT_SUSPENSE_TYPE;
  react_production.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  react_production.act = function() {
    throw Error("act(...) is not supported in production builds of React.");
  };
  react_production.cache = function(fn2) {
    return function() {
      return fn2.apply(null, arguments);
    };
  };
  react_production.cloneElement = function(element, config, children) {
    if (null === element || void 0 === element)
      throw Error(
        "The argument must be a React element, but you passed " + element + "."
      );
    var props = assign({}, element.props), key = element.key, owner = void 0;
    if (null != config)
      for (propName in void 0 !== config.ref && (owner = void 0), void 0 !== config.key && (key = "" + config.key), config)
        !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (1 === propName) props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0; i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, void 0, void 0, owner, props);
  };
  react_production.createContext = function(defaultValue) {
    defaultValue = {
      $$typeof: REACT_CONTEXT_TYPE,
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: defaultValue
    };
    return defaultValue;
  };
  react_production.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (null != config)
      for (propName in void 0 !== config.key && (key = "" + config.key), config)
        hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (1 === childrenLength) props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        void 0 === props[propName] && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, void 0, void 0, null, props);
  };
  react_production.createRef = function() {
    return { current: null };
  };
  react_production.forwardRef = function(render2) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render: render2 };
  };
  react_production.isValidElement = isValidElement;
  react_production.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  react_production.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: void 0 === compare ? null : compare
    };
  };
  react_production.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
      "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
    } catch (error) {
      reportGlobalError(error);
    } finally {
      ReactSharedInternals.T = prevTransition;
    }
  };
  react_production.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
  };
  react_production.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  react_production.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  react_production.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  react_production.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
  };
  react_production.useDebugValue = function() {
  };
  react_production.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
  };
  react_production.useEffect = function(create, deps) {
    return ReactSharedInternals.H.useEffect(create, deps);
  };
  react_production.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  react_production.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
  };
  react_production.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
  };
  react_production.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
  };
  react_production.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  react_production.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
  };
  react_production.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
  };
  react_production.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  react_production.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
  };
  react_production.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    );
  };
  react_production.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
  };
  react_production.version = "19.0.0";
  return react_production;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production();
  }
  return react.exports;
}
var reactExports = requireReact();
var on$1 = Object.defineProperty;
var un$1 = (t8) => {
  throw TypeError(t8);
};
var Ai = (t8, e2, r2) => e2 in t8 ? on$1(t8, e2, { enumerable: true, configurable: true, writable: true, value: r2 }) : t8[e2] = r2;
var ln$1 = (t8, e2) => {
  for (var r2 in e2) on$1(t8, r2, { get: e2[r2], enumerable: true });
};
var lr$1 = (t8, e2, r2) => Ai(t8, typeof e2 != "symbol" ? e2 + "" : e2, r2), cn$1 = (t8, e2, r2) => e2.has(t8) || un$1("Cannot " + r2);
var R$1 = (t8, e2, r2) => (cn$1(t8, e2, "read from private field"), r2 ? r2.call(t8) : e2.get(t8)), At$1 = (t8, e2, r2) => e2.has(t8) ? un$1("Cannot add the same private member more than once") : e2 instanceof WeakSet ? e2.add(t8) : e2.set(t8, r2), pn$1 = (t8, e2, r2, n2) => (cn$1(t8, e2, "write to private field"), e2.set(t8, r2), r2);
var rn$1 = {};
ln$1(rn$1, { languages: () => Hs, options: () => Us, parsers: () => tn$1, printers: () => uu$1 });
var Di = (t8, e2, r2, n2) => {
  if (!(t8 && e2 == null)) return e2.replaceAll ? e2.replaceAll(r2, n2) : r2.global ? e2.replace(r2, n2) : e2.split(r2).join(n2);
}, w$1 = Di;
var we$1 = "string", ze$1 = "array", Ye$1 = "cursor", be$1 = "indent", Te$1 = "align", je$1 = "trim", xe$1 = "group", ke$1 = "fill", ce$1 = "if-break", Be = "indent-if-break", Ke$1 = "line-suffix", Xe$1 = "line-suffix-boundary", j$1 = "line", Qe$1 = "label", Le$1 = "break-parent", Dt$1 = /* @__PURE__ */ new Set([Ye$1, be$1, Te$1, je$1, xe$1, ke$1, ce$1, Be, Ke$1, Xe$1, j$1, Qe$1, Le$1]);
var vi = (t8, e2, r2) => {
  if (!(t8 && e2 == null)) return Array.isArray(e2) || typeof e2 == "string" ? e2[r2 < 0 ? e2.length + r2 : r2] : e2.at(r2);
}, K = vi;
function yi(t8) {
  if (typeof t8 == "string") return we$1;
  if (Array.isArray(t8)) return ze$1;
  if (!t8) return;
  let { type: e2 } = t8;
  if (Dt$1.has(e2)) return e2;
}
var Fe$1 = yi;
var wi = (t8) => new Intl.ListFormat("en-US", { type: "disjunction" }).format(t8);
function bi(t8) {
  let e2 = t8 === null ? "null" : typeof t8;
  if (e2 !== "string" && e2 !== "object") return `Unexpected doc '${e2}', 
Expected it to be 'string' or 'object'.`;
  if (Fe$1(t8)) throw new Error("doc is valid.");
  let r2 = Object.prototype.toString.call(t8);
  if (r2 !== "[object Object]") return `Unexpected doc '${r2}'.`;
  let n2 = wi([...Dt$1].map((s2) => `'${s2}'`));
  return `Unexpected doc.type '${t8.type}'.
Expected it to be ${n2}.`;
}
var cr$1 = class cr extends Error {
  name = "InvalidDocError";
  constructor(e2) {
    super(bi(e2)), this.doc = e2;
  }
}, pr = cr$1;
function hr$1(t8, e2) {
  if (typeof t8 == "string") return e2(t8);
  let r2 = /* @__PURE__ */ new Map();
  return n2(t8);
  function n2(i) {
    if (r2.has(i)) return r2.get(i);
    let a = s2(i);
    return r2.set(i, a), a;
  }
  function s2(i) {
    switch (Fe$1(i)) {
      case ze$1:
        return e2(i.map(n2));
      case ke$1:
        return e2({ ...i, parts: i.parts.map(n2) });
      case ce$1:
        return e2({ ...i, breakContents: n2(i.breakContents), flatContents: n2(i.flatContents) });
      case xe$1: {
        let { expandedStates: a, contents: o2 } = i;
        return a ? (a = a.map(n2), o2 = a[0]) : o2 = n2(o2), e2({ ...i, contents: o2, expandedStates: a });
      }
      case Te$1:
      case be$1:
      case Be:
      case Qe$1:
      case Ke$1:
        return e2({ ...i, contents: n2(i.contents) });
      case we$1:
      case Ye$1:
      case je$1:
      case Xe$1:
      case j$1:
      case Le$1:
        return e2(i);
      default:
        throw new pr(i);
    }
  }
}
function B$1(t8, e2 = hn$1) {
  return hr$1(t8, (r2) => typeof r2 == "string" ? H$1(e2, r2.split(`
`)) : r2);
}
var mr$1 = () => {
}, fr$1 = mr$1;
function k$1(t8) {
  return { type: be$1, contents: t8 };
}
function fn$1(t8, e2) {
  return { type: Te$1, contents: e2, n: t8 };
}
function E(t8, e2 = {}) {
  return fr$1(e2.expandedStates), { type: xe$1, id: e2.id, contents: t8, break: !!e2.shouldBreak, expandedStates: e2.expandedStates };
}
function dn$1(t8) {
  return fn$1(Number.NEGATIVE_INFINITY, t8);
}
function gn$1(t8) {
  return fn$1({ type: "root" }, t8);
}
function vt$1(t8) {
  return { type: ke$1, parts: t8 };
}
function pe$1(t8, e2 = "", r2 = {}) {
  return { type: ce$1, breakContents: t8, flatContents: e2, groupId: r2.groupId };
}
function Cn$1(t8, e2) {
  return { type: Be, contents: t8, groupId: e2.groupId, negate: e2.negate };
}
var ne$1 = { type: Le$1 };
var xi = { type: j$1, hard: true }, ki = { type: j$1, hard: true, literal: true }, _$1 = { type: j$1 }, v$1 = { type: j$1, soft: true }, S$1 = [xi, ne$1], hn$1 = [ki, ne$1];
function H$1(t8, e2) {
  let r2 = [];
  for (let n2 = 0; n2 < e2.length; n2++) n2 !== 0 && r2.push(t8), r2.push(e2[n2]);
  return r2;
}
var yt$1 = "'", Sn$1 = '"';
function Bi(t8, e2) {
  let r2 = e2 === true || e2 === yt$1 ? yt$1 : Sn$1, n2 = r2 === yt$1 ? Sn$1 : yt$1, s2 = 0, i = 0;
  for (let a of t8) a === r2 ? s2++ : a === n2 && i++;
  return s2 > i ? n2 : r2;
}
var _n$1 = Bi;
function dr$1(t8) {
  if (typeof t8 != "string") throw new TypeError("Expected a string");
  return t8.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
var V$2, gr$1 = class gr {
  constructor(e2) {
    At$1(this, V$2);
    pn$1(this, V$2, new Set(e2));
  }
  getLeadingWhitespaceCount(e2) {
    let r2 = R$1(this, V$2), n2 = 0;
    for (let s2 = 0; s2 < e2.length && r2.has(e2.charAt(s2)); s2++) n2++;
    return n2;
  }
  getTrailingWhitespaceCount(e2) {
    let r2 = R$1(this, V$2), n2 = 0;
    for (let s2 = e2.length - 1; s2 >= 0 && r2.has(e2.charAt(s2)); s2--) n2++;
    return n2;
  }
  getLeadingWhitespace(e2) {
    let r2 = this.getLeadingWhitespaceCount(e2);
    return e2.slice(0, r2);
  }
  getTrailingWhitespace(e2) {
    let r2 = this.getTrailingWhitespaceCount(e2);
    return e2.slice(e2.length - r2);
  }
  hasLeadingWhitespace(e2) {
    return R$1(this, V$2).has(e2.charAt(0));
  }
  hasTrailingWhitespace(e2) {
    return R$1(this, V$2).has(K(false, e2, -1));
  }
  trimStart(e2) {
    let r2 = this.getLeadingWhitespaceCount(e2);
    return e2.slice(r2);
  }
  trimEnd(e2) {
    let r2 = this.getTrailingWhitespaceCount(e2);
    return e2.slice(0, e2.length - r2);
  }
  trim(e2) {
    return this.trimEnd(this.trimStart(e2));
  }
  split(e2, r2 = false) {
    let n2 = `[${dr$1([...R$1(this, V$2)].join(""))}]+`, s2 = new RegExp(r2 ? `(${n2})` : n2, "u");
    return e2.split(s2);
  }
  hasWhitespaceCharacter(e2) {
    let r2 = R$1(this, V$2);
    return Array.prototype.some.call(e2, (n2) => r2.has(n2));
  }
  hasNonWhitespaceCharacter(e2) {
    let r2 = R$1(this, V$2);
    return Array.prototype.some.call(e2, (n2) => !r2.has(n2));
  }
  isWhitespaceOnly(e2) {
    let r2 = R$1(this, V$2);
    return Array.prototype.every.call(e2, (n2) => r2.has(n2));
  }
};
V$2 = /* @__PURE__ */ new WeakMap();
var En$1 = gr$1;
var Li = ["	", `
`, "\f", "\r", " "], Fi = new En$1(Li), O$1 = Fi;
var Cr$1 = class Cr extends Error {
  name = "UnexpectedNodeError";
  constructor(e2, r2, n2 = "type") {
    super(`Unexpected ${r2} node ${n2}: ${JSON.stringify(e2[n2])}.`), this.node = e2;
  }
}, An$1 = Cr$1;
function Pi(t8) {
  return (t8 == null ? void 0 : t8.type) === "front-matter";
}
var Pe$1 = Pi;
var Ni = /* @__PURE__ */ new Set(["sourceSpan", "startSourceSpan", "endSourceSpan", "nameSpan", "valueSpan", "keySpan", "tagDefinition", "tokens", "valueTokens", "switchValueSourceSpan", "expSourceSpan", "valueSourceSpan"]), Ii = /* @__PURE__ */ new Set(["if", "else if", "for", "switch", "case"]);
function Dn$1(t8, e2) {
  var r2;
  if (t8.type === "text" || t8.type === "comment" || Pe$1(t8) || t8.type === "yaml" || t8.type === "toml") return null;
  if (t8.type === "attribute" && delete e2.value, t8.type === "docType" && delete e2.value, t8.type === "angularControlFlowBlock" && ((r2 = t8.parameters) != null && r2.children)) for (let n2 of e2.parameters.children) Ii.has(t8.name) ? delete n2.expression : n2.expression = n2.expression.trim();
  t8.type === "angularIcuExpression" && (e2.switchValue = t8.switchValue.trim()), t8.type === "angularLetDeclarationInitializer" && delete e2.value;
}
Dn$1.ignoredProperties = Ni;
var vn$1 = Dn$1;
async function Ri(t8, e2) {
  if (t8.language === "yaml") {
    let r2 = t8.value.trim(), n2 = r2 ? await e2(r2, { parser: "yaml" }) : "";
    return gn$1([t8.startDelimiter, t8.explicitLanguage, S$1, n2, n2 ? S$1 : "", t8.endDelimiter]);
  }
}
var yn$1 = Ri;
function he$1(t8, e2 = true) {
  return [k$1([v$1, t8]), e2 ? v$1 : ""];
}
function X$1(t8, e2) {
  let r2 = t8.type === "NGRoot" ? t8.node.type === "NGMicrosyntax" && t8.node.body.length === 1 && t8.node.body[0].type === "NGMicrosyntaxExpression" ? t8.node.body[0].expression : t8.node : t8.type === "JsExpressionRoot" ? t8.node : t8;
  return r2 && (r2.type === "ObjectExpression" || r2.type === "ArrayExpression" || (e2.parser === "__vue_expression" || e2.parser === "__vue_ts_expression") && (r2.type === "TemplateLiteral" || r2.type === "StringLiteral"));
}
async function T$1(t8, e2, r2, n2) {
  r2 = { __isInHtmlAttribute: true, __embeddedInHtml: true, ...r2 };
  let s2 = true;
  n2 && (r2.__onHtmlBindingRoot = (a, o2) => {
    s2 = n2(a, o2);
  });
  let i = await e2(t8, r2, e2);
  return s2 ? E(i) : he$1(i);
}
function $i(t8, e2, r2, n2) {
  let { node: s2 } = r2, i = n2.originalText.slice(s2.sourceSpan.start.offset, s2.sourceSpan.end.offset);
  return /^\s*$/u.test(i) ? "" : T$1(i, t8, { parser: "__ng_directive", __isInHtmlAttribute: false }, X$1);
}
var wn$1 = $i;
var Oi = (t8, e2) => {
  if (!(t8 && e2 == null)) return e2.toReversed || !Array.isArray(e2) ? e2.toReversed() : [...e2].reverse();
}, bn$1 = Oi;
function Mi(t8) {
  return Array.isArray(t8) && t8.length > 0;
}
var me$1 = Mi;
var Tn$1, xn$1, kn$1, Bn$1, Ln$1, qi = ((Tn$1 = globalThis.Deno) == null ? void 0 : Tn$1.build.os) === "windows" || ((kn$1 = (xn$1 = globalThis.navigator) == null ? void 0 : xn$1.platform) == null ? void 0 : kn$1.startsWith("Win")) || ((Ln$1 = (Bn$1 = globalThis.process) == null ? void 0 : Bn$1.platform) == null ? void 0 : Ln$1.startsWith("win")) || false;
function Fn$1(t8) {
  if (t8 = t8 instanceof URL ? t8 : new URL(t8), t8.protocol !== "file:") throw new TypeError(`URL must be a file URL: received "${t8.protocol}"`);
  return t8;
}
function Hi(t8) {
  return t8 = Fn$1(t8), decodeURIComponent(t8.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function Vi(t8) {
  t8 = Fn$1(t8);
  let e2 = decodeURIComponent(t8.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  return t8.hostname !== "" && (e2 = `\\\\${t8.hostname}${e2}`), e2;
}
function Pn$1(t8) {
  return qi ? Vi(t8) : Hi(t8);
}
var Nn$1 = Pn$1;
var Ui = (t8) => String(t8).split(/[/\\]/u).pop();
function In$1(t8, e2) {
  if (!e2) return;
  let r2 = Ui(e2).toLowerCase();
  return t8.find(({ filenames: n2 }) => n2 == null ? void 0 : n2.some((s2) => s2.toLowerCase() === r2)) ?? t8.find(({ extensions: n2 }) => n2 == null ? void 0 : n2.some((s2) => r2.endsWith(s2)));
}
function Wi(t8, e2) {
  if (e2) return t8.find(({ name: r2 }) => r2.toLowerCase() === e2) ?? t8.find(({ aliases: r2 }) => r2 == null ? void 0 : r2.includes(e2)) ?? t8.find(({ extensions: r2 }) => r2 == null ? void 0 : r2.includes(`.${e2}`));
}
function Rn$1(t8, e2) {
  if (e2) {
    if (String(e2).startsWith("file:")) try {
      e2 = Nn$1(e2);
    } catch {
      return;
    }
    if (typeof e2 == "string") return t8.find(({ isSupported: r2 }) => r2 == null ? void 0 : r2({ filepath: e2 }));
  }
}
function Gi(t8, e2) {
  let r2 = bn$1(false, t8.plugins).flatMap((s2) => s2.languages ?? []), n2 = Wi(r2, e2.language) ?? In$1(r2, e2.physicalFile) ?? In$1(r2, e2.file) ?? Rn$1(r2, e2.physicalFile) ?? Rn$1(r2, e2.file) ?? (e2.physicalFile, void 0);
  return n2 == null ? void 0 : n2.parsers[0];
}
var Ne$1 = Gi;
var $n$1 = "inline", Sr$1 = { area: "none", base: "none", basefont: "none", datalist: "none", head: "none", link: "none", meta: "none", noembed: "none", noframes: "none", param: "block", rp: "none", script: "block", style: "none", template: "inline", title: "none", html: "block", body: "block", address: "block", blockquote: "block", center: "block", dialog: "block", div: "block", figure: "block", figcaption: "block", footer: "block", form: "block", header: "block", hr: "block", legend: "block", listing: "block", main: "block", p: "block", plaintext: "block", pre: "block", search: "block", xmp: "block", slot: "contents", ruby: "ruby", rt: "ruby-text", article: "block", aside: "block", h1: "block", h2: "block", h3: "block", h4: "block", h5: "block", h6: "block", hgroup: "block", nav: "block", section: "block", dir: "block", dd: "block", dl: "block", dt: "block", menu: "block", ol: "block", ul: "block", li: "list-item", table: "table", caption: "table-caption", colgroup: "table-column-group", col: "table-column", thead: "table-header-group", tbody: "table-row-group", tfoot: "table-footer-group", tr: "table-row", td: "table-cell", th: "table-cell", input: "inline-block", button: "inline-block", fieldset: "block", details: "block", summary: "block", marquee: "inline-block", source: "block", track: "block", meter: "inline-block", progress: "inline-block", object: "inline-block", video: "inline-block", audio: "inline-block", select: "inline-block", option: "block", optgroup: "block" }, On = "normal", _r$1 = { listing: "pre", plaintext: "pre", pre: "pre", xmp: "pre", nobr: "nowrap", table: "initial", textarea: "pre-wrap" };
function zi(t8) {
  return t8.type === "element" && !t8.hasExplicitNamespace && !["html", "svg"].includes(t8.namespace);
}
var fe$1 = zi;
var Yi = (t8) => w$1(false, t8, /^[\t\f\r ]*\n/gu, ""), Er$1 = (t8) => Yi(O$1.trimEnd(t8)), Mn$1 = (t8) => {
  let e2 = t8, r2 = O$1.getLeadingWhitespace(e2);
  r2 && (e2 = e2.slice(r2.length));
  let n2 = O$1.getTrailingWhitespace(e2);
  return n2 && (e2 = e2.slice(0, -n2.length)), { leadingWhitespace: r2, trailingWhitespace: n2, text: e2 };
};
function wt$1(t8, e2) {
  return !!(t8.type === "ieConditionalComment" && t8.lastChild && !t8.lastChild.isSelfClosing && !t8.lastChild.endSourceSpan || t8.type === "ieConditionalComment" && !t8.complete || de$1(t8) && t8.children.some((r2) => r2.type !== "text" && r2.type !== "interpolation") || xt$1(t8, e2) && !W$1(t8, e2) && t8.type !== "interpolation");
}
function ge$1(t8) {
  return t8.type === "attribute" || !t8.parent || !t8.prev ? false : ji(t8.prev);
}
function ji(t8) {
  return t8.type === "comment" && t8.value.trim() === "prettier-ignore";
}
function $(t8) {
  return t8.type === "text" || t8.type === "comment";
}
function W$1(t8, e2) {
  return t8.type === "element" && (t8.fullName === "script" || t8.fullName === "style" || t8.fullName === "svg:style" || t8.fullName === "svg:script" || t8.fullName === "mj-style" && e2.parser === "mjml" || fe$1(t8) && (t8.name === "script" || t8.name === "style"));
}
function qn$1(t8, e2) {
  return t8.children && !W$1(t8, e2);
}
function Hn$1(t8, e2) {
  return W$1(t8, e2) || t8.type === "interpolation" || Ar$1(t8);
}
function Ar$1(t8) {
  return Jn$1(t8).startsWith("pre");
}
function Vn$1(t8, e2) {
  var s2, i;
  let r2 = n2();
  if (r2 && !t8.prev && ((i = (s2 = t8.parent) == null ? void 0 : s2.tagDefinition) != null && i.ignoreFirstLf)) return t8.type === "interpolation";
  return r2;
  function n2() {
    return Pe$1(t8) || t8.type === "angularControlFlowBlock" ? false : (t8.type === "text" || t8.type === "interpolation") && t8.prev && (t8.prev.type === "text" || t8.prev.type === "interpolation") ? true : !t8.parent || t8.parent.cssDisplay === "none" ? false : de$1(t8.parent) ? true : !(!t8.prev && (t8.parent.type === "root" || de$1(t8) && t8.parent || W$1(t8.parent, e2) || et$1(t8.parent, e2) || !ea(t8.parent.cssDisplay)) || t8.prev && !na(t8.prev.cssDisplay));
  }
}
function Un$1(t8, e2) {
  return Pe$1(t8) || t8.type === "angularControlFlowBlock" ? false : (t8.type === "text" || t8.type === "interpolation") && t8.next && (t8.next.type === "text" || t8.next.type === "interpolation") ? true : !t8.parent || t8.parent.cssDisplay === "none" ? false : de$1(t8.parent) ? true : !(!t8.next && (t8.parent.type === "root" || de$1(t8) && t8.parent || W$1(t8.parent, e2) || et$1(t8.parent, e2) || !ta(t8.parent.cssDisplay)) || t8.next && !ra(t8.next.cssDisplay));
}
function Wn$1(t8, e2) {
  return sa(t8.cssDisplay) && !W$1(t8, e2);
}
function Je$1(t8) {
  return Pe$1(t8) || t8.next && t8.sourceSpan.end && t8.sourceSpan.end.line + 1 < t8.next.sourceSpan.start.line;
}
function Gn$1(t8) {
  return Dr$1(t8) || t8.type === "element" && t8.children.length > 0 && (["body", "script", "style"].includes(t8.name) || t8.children.some((e2) => Xi(e2))) || t8.firstChild && t8.firstChild === t8.lastChild && t8.firstChild.type !== "text" && Yn$1(t8.firstChild) && (!t8.lastChild.isTrailingSpaceSensitive || jn$1(t8.lastChild));
}
function Dr$1(t8) {
  return t8.type === "element" && t8.children.length > 0 && (["html", "head", "ul", "ol", "select"].includes(t8.name) || t8.cssDisplay.startsWith("table") && t8.cssDisplay !== "table-cell");
}
function bt$1(t8) {
  return Kn$1(t8) || t8.prev && Ki(t8.prev) || zn$1(t8);
}
function Ki(t8) {
  return Kn$1(t8) || t8.type === "element" && t8.fullName === "br" || zn$1(t8);
}
function zn$1(t8) {
  return Yn$1(t8) && jn$1(t8);
}
function Yn$1(t8) {
  return t8.hasLeadingSpaces && (t8.prev ? t8.prev.sourceSpan.end.line < t8.sourceSpan.start.line : t8.parent.type === "root" || t8.parent.startSourceSpan.end.line < t8.sourceSpan.start.line);
}
function jn$1(t8) {
  return t8.hasTrailingSpaces && (t8.next ? t8.next.sourceSpan.start.line > t8.sourceSpan.end.line : t8.parent.type === "root" || t8.parent.endSourceSpan && t8.parent.endSourceSpan.start.line > t8.sourceSpan.end.line);
}
function Kn$1(t8) {
  switch (t8.type) {
    case "ieConditionalComment":
    case "comment":
    case "directive":
      return true;
    case "element":
      return ["script", "select"].includes(t8.name);
  }
  return false;
}
function Tt$1(t8) {
  return t8.lastChild ? Tt$1(t8.lastChild) : t8;
}
function Xi(t8) {
  var e2;
  return (e2 = t8.children) == null ? void 0 : e2.some((r2) => r2.type !== "text");
}
function Xn$1(t8) {
  if (t8) switch (t8) {
    case "module":
    case "text/javascript":
    case "text/babel":
    case "text/jsx":
    case "application/javascript":
      return "babel";
    case "application/x-typescript":
      return "typescript";
    case "text/markdown":
      return "markdown";
    case "text/html":
      return "html";
    case "text/x-handlebars-template":
      return "glimmer";
    default:
      if (t8.endsWith("json") || t8.endsWith("importmap") || t8 === "speculationrules") return "json";
  }
}
function Qi(t8, e2) {
  let { name: r2, attrMap: n2 } = t8;
  if (r2 !== "script" || Object.prototype.hasOwnProperty.call(n2, "src")) return;
  let { type: s2, lang: i } = t8.attrMap;
  return !i && !s2 ? "babel" : Ne$1(e2, { language: i }) ?? Xn$1(s2);
}
function Ji(t8, e2) {
  if (!xt$1(t8, e2)) return;
  let { attrMap: r2 } = t8;
  if (Object.prototype.hasOwnProperty.call(r2, "src")) return;
  let { type: n2, lang: s2 } = r2;
  return Ne$1(e2, { language: s2 }) ?? Xn$1(n2);
}
function Zi(t8, e2) {
  if (t8.name === "style") {
    let { lang: r2 } = t8.attrMap;
    return r2 ? Ne$1(e2, { language: r2 }) : "css";
  }
  if (t8.name === "mj-style" && e2.parser === "mjml") return "css";
}
function vr$1(t8, e2) {
  return Qi(t8, e2) ?? Zi(t8, e2) ?? Ji(t8, e2);
}
function Ze$1(t8) {
  return t8 === "block" || t8 === "list-item" || t8.startsWith("table");
}
function ea(t8) {
  return !Ze$1(t8) && t8 !== "inline-block";
}
function ta(t8) {
  return !Ze$1(t8) && t8 !== "inline-block";
}
function ra(t8) {
  return !Ze$1(t8);
}
function na(t8) {
  return !Ze$1(t8);
}
function sa(t8) {
  return !Ze$1(t8) && t8 !== "inline-block";
}
function de$1(t8) {
  return Jn$1(t8).startsWith("pre");
}
function ia(t8, e2) {
  let r2 = t8;
  for (; r2; ) {
    if (e2(r2)) return true;
    r2 = r2.parent;
  }
  return false;
}
function Qn$1(t8, e2) {
  var n2;
  if (Ce$1(t8, e2)) return "block";
  if (((n2 = t8.prev) == null ? void 0 : n2.type) === "comment") {
    let s2 = t8.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/u);
    if (s2) return s2[1];
  }
  let r2 = false;
  if (t8.type === "element" && t8.namespace === "svg") if (ia(t8, (s2) => s2.fullName === "svg:foreignObject")) r2 = true;
  else return t8.name === "svg" ? "inline-block" : "block";
  switch (e2.htmlWhitespaceSensitivity) {
    case "strict":
      return "inline";
    case "ignore":
      return "block";
    default:
      if (t8.type === "element" && (!t8.namespace || r2 || fe$1(t8)) && Object.prototype.hasOwnProperty.call(Sr$1, t8.name)) return Sr$1[t8.name];
  }
  return $n$1;
}
function Jn$1(t8) {
  return t8.type === "element" && (!t8.namespace || fe$1(t8)) && Object.prototype.hasOwnProperty.call(_r$1, t8.name) ? _r$1[t8.name] : On;
}
function aa(t8) {
  let e2 = Number.POSITIVE_INFINITY;
  for (let r2 of t8.split(`
`)) {
    if (r2.length === 0) continue;
    let n2 = O$1.getLeadingWhitespaceCount(r2);
    if (n2 === 0) return 0;
    r2.length !== n2 && n2 < e2 && (e2 = n2);
  }
  return e2 === Number.POSITIVE_INFINITY ? 0 : e2;
}
function yr$1(t8, e2 = aa(t8)) {
  return e2 === 0 ? t8 : t8.split(`
`).map((r2) => r2.slice(e2)).join(`
`);
}
function wr$1(t8) {
  return w$1(false, w$1(false, t8, "&apos;", "'"), "&quot;", '"');
}
function P$1(t8) {
  return wr$1(t8.value);
}
var oa = /* @__PURE__ */ new Set(["template", "style", "script"]);
function et$1(t8, e2) {
  return Ce$1(t8, e2) && !oa.has(t8.fullName);
}
function Ce$1(t8, e2) {
  return e2.parser === "vue" && t8.type === "element" && t8.parent.type === "root" && t8.fullName.toLowerCase() !== "html";
}
function xt$1(t8, e2) {
  return Ce$1(t8, e2) && (et$1(t8, e2) || t8.attrMap.lang && t8.attrMap.lang !== "html");
}
function Zn$1(t8) {
  let e2 = t8.fullName;
  return e2.charAt(0) === "#" || e2 === "slot-scope" || e2 === "v-slot" || e2.startsWith("v-slot:");
}
function es(t8, e2) {
  let r2 = t8.parent;
  if (!Ce$1(r2, e2)) return false;
  let n2 = r2.fullName, s2 = t8.fullName;
  return n2 === "script" && s2 === "setup" || n2 === "style" && s2 === "vars";
}
function kt$1(t8, e2 = t8.value) {
  return t8.parent.isWhitespaceSensitive ? t8.parent.isIndentationSensitive ? B$1(e2) : B$1(yr$1(Er$1(e2)), S$1) : H$1(_$1, O$1.split(e2));
}
function Bt$1(t8, e2) {
  return Ce$1(t8, e2) && t8.name === "script";
}
var br$1 = /\{\{(.+?)\}\}/su;
async function ts(t8, e2) {
  let r2 = [];
  for (let [n2, s2] of t8.split(br$1).entries()) if (n2 % 2 === 0) r2.push(B$1(s2));
  else try {
    r2.push(E(["{{", k$1([_$1, await T$1(s2, e2, { parser: "__ng_interpolation", __isInHtmlInterpolation: true })]), _$1, "}}"]));
  } catch {
    r2.push("{{", B$1(s2), "}}");
  }
  return r2;
}
function Tr$1({ parser: t8 }) {
  return (e2, r2, n2) => T$1(P$1(n2.node), e2, { parser: t8 }, X$1);
}
var ua = Tr$1({ parser: "__ng_action" }), la = Tr$1({ parser: "__ng_binding" }), ca = Tr$1({ parser: "__ng_directive" });
function pa(t8, e2) {
  if (e2.parser !== "angular") return;
  let { node: r2 } = t8, n2 = r2.fullName;
  if (n2.startsWith("(") && n2.endsWith(")") || n2.startsWith("on-")) return ua;
  if (n2.startsWith("[") && n2.endsWith("]") || /^bind(?:on)?-/u.test(n2) || /^ng-(?:if|show|hide|class|style)$/u.test(n2)) return la;
  if (n2.startsWith("*")) return ca;
  let s2 = P$1(r2);
  if (/^i18n(?:-.+)?$/u.test(n2)) return () => he$1(vt$1(kt$1(r2, s2.trim())), !s2.includes("@@"));
  if (br$1.test(s2)) return (i) => ts(s2, i);
}
var rs = pa;
function ha(t8, e2) {
  let { node: r2 } = t8, n2 = P$1(r2);
  if (r2.fullName === "class" && !e2.parentParser && !n2.includes("{{")) return () => n2.trim().split(/\s+/u).join(" ");
}
var ns = ha;
function ss(t8) {
  return t8 === "	" || t8 === `
` || t8 === "\f" || t8 === "\r" || t8 === " ";
}
var ma = /^[ \t\n\r\u000c]+/, fa = /^[, \t\n\r\u000c]+/, da = /^[^ \t\n\r\u000c]+/, ga = /[,]+$/, is = /^\d+$/, Ca = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;
function Sa(t8) {
  let e2 = t8.length, r2, n2, s2, i, a, o2 = 0, u;
  function p(C) {
    let A, D = C.exec(t8.substring(o2));
    if (D) return [A] = D, o2 += A.length, A;
  }
  let l2 = [];
  for (; ; ) {
    if (p(fa), o2 >= e2) {
      if (l2.length === 0) throw new Error("Must contain one or more image candidate strings.");
      return l2;
    }
    u = o2, r2 = p(da), n2 = [], r2.slice(-1) === "," ? (r2 = r2.replace(ga, ""), f()) : m();
  }
  function m() {
    for (p(ma), s2 = "", i = "in descriptor"; ; ) {
      if (a = t8.charAt(o2), i === "in descriptor") if (ss(a)) s2 && (n2.push(s2), s2 = "", i = "after descriptor");
      else if (a === ",") {
        o2 += 1, s2 && n2.push(s2), f();
        return;
      } else if (a === "(") s2 += a, i = "in parens";
      else if (a === "") {
        s2 && n2.push(s2), f();
        return;
      } else s2 += a;
      else if (i === "in parens") if (a === ")") s2 += a, i = "in descriptor";
      else if (a === "") {
        n2.push(s2), f();
        return;
      } else s2 += a;
      else if (i === "after descriptor" && !ss(a)) if (a === "") {
        f();
        return;
      } else i = "in descriptor", o2 -= 1;
      o2 += 1;
    }
  }
  function f() {
    let C = false, A, D, I2, F, c2 = {}, g2, y2, q2, x, U2;
    for (F = 0; F < n2.length; F++) g2 = n2[F], y2 = g2[g2.length - 1], q2 = g2.substring(0, g2.length - 1), x = parseInt(q2, 10), U2 = parseFloat(q2), is.test(q2) && y2 === "w" ? ((A || D) && (C = true), x === 0 ? C = true : A = x) : Ca.test(q2) && y2 === "x" ? ((A || D || I2) && (C = true), U2 < 0 ? C = true : D = U2) : is.test(q2) && y2 === "h" ? ((I2 || D) && (C = true), x === 0 ? C = true : I2 = x) : C = true;
    if (!C) c2.source = { value: r2, startOffset: u }, A && (c2.width = { value: A }), D && (c2.density = { value: D }), I2 && (c2.height = { value: I2 }), l2.push(c2);
    else throw new Error(`Invalid srcset descriptor found in "${t8}" at "${g2}".`);
  }
}
var as = Sa;
function _a$1(t8) {
  if (t8.node.fullName === "srcset" && (t8.parent.fullName === "img" || t8.parent.fullName === "source")) return () => Aa(P$1(t8.node));
}
var os = { width: "w", height: "h", density: "x" }, Ea = Object.keys(os);
function Aa(t8) {
  let e2 = as(t8), r2 = Ea.filter((l2) => e2.some((m) => Object.prototype.hasOwnProperty.call(m, l2)));
  if (r2.length > 1) throw new Error("Mixed descriptor in srcset is not supported");
  let [n2] = r2, s2 = os[n2], i = e2.map((l2) => l2.source.value), a = Math.max(...i.map((l2) => l2.length)), o2 = e2.map((l2) => l2[n2] ? String(l2[n2].value) : ""), u = o2.map((l2) => {
    let m = l2.indexOf(".");
    return m === -1 ? l2.length : m;
  }), p = Math.max(...u);
  return he$1(H$1([",", _$1], i.map((l2, m) => {
    let f = [l2], C = o2[m];
    if (C) {
      let A = a - l2.length + 1, D = p - u[m], I2 = " ".repeat(A + D);
      f.push(pe$1(I2, " "), C + s2);
    }
    return f;
  })));
}
var us = _a$1;
function ls(t8, e2) {
  let { node: r2 } = t8, n2 = P$1(t8.node).trim();
  if (r2.fullName === "style" && !e2.parentParser && !n2.includes("{{")) return async (s2) => he$1(await s2(n2, { parser: "css", __isHTMLStyleAttribute: true }));
}
var xr$1 = /* @__PURE__ */ new WeakMap();
function Da(t8, e2) {
  let { root: r2 } = t8;
  return xr$1.has(r2) || xr$1.set(r2, r2.children.some((n2) => Bt$1(n2, e2) && ["ts", "typescript"].includes(n2.attrMap.lang))), xr$1.get(r2);
}
var Ie$1 = Da;
function cs(t8, e2, r2) {
  let { node: n2 } = r2, s2 = P$1(n2);
  return T$1(`type T<${s2}> = any`, t8, { parser: "babel-ts", __isEmbeddedTypescriptGenericParameters: true }, X$1);
}
function ps(t8, e2, { parseWithTs: r2 }) {
  return T$1(`function _(${t8}) {}`, e2, { parser: r2 ? "babel-ts" : "babel", __isVueBindings: true });
}
async function hs(t8, e2, r2, n2) {
  let s2 = P$1(r2.node), { left: i, operator: a, right: o2 } = va(s2), u = Ie$1(r2, n2);
  return [E(await T$1(`function _(${i}) {}`, t8, { parser: u ? "babel-ts" : "babel", __isVueForBindingLeft: true })), " ", a, " ", await T$1(o2, t8, { parser: u ? "__ts_expression" : "__js_expression" })];
}
function va(t8) {
  let e2 = /(.*?)\s+(in|of)\s+(.*)/su, r2 = /,([^,\]}]*)(?:,([^,\]}]*))?$/u, n2 = /^\(|\)$/gu, s2 = t8.match(e2);
  if (!s2) return;
  let i = {};
  if (i.for = s2[3].trim(), !i.for) return;
  let a = w$1(false, s2[1].trim(), n2, ""), o2 = a.match(r2);
  o2 ? (i.alias = a.replace(r2, ""), i.iterator1 = o2[1].trim(), o2[2] && (i.iterator2 = o2[2].trim())) : i.alias = a;
  let u = [i.alias, i.iterator1, i.iterator2];
  if (!u.some((p, l2) => !p && (l2 === 0 || u.slice(l2 + 1).some(Boolean)))) return { left: u.filter(Boolean).join(","), operator: s2[2], right: i.for };
}
function ya(t8, e2) {
  if (e2.parser !== "vue") return;
  let { node: r2 } = t8, n2 = r2.fullName;
  if (n2 === "v-for") return hs;
  if (n2 === "generic" && Bt$1(r2.parent, e2)) return cs;
  let s2 = P$1(r2), i = Ie$1(t8, e2);
  if (Zn$1(r2) || es(r2, e2)) return (a) => ps(s2, a, { parseWithTs: i });
  if (n2.startsWith("@") || n2.startsWith("v-on:")) return (a) => wa(s2, a, { parseWithTs: i });
  if (n2.startsWith(":") || n2.startsWith(".") || n2.startsWith("v-bind:")) return (a) => ba(s2, a, { parseWithTs: i });
  if (n2.startsWith("v-")) return (a) => ms(s2, a, { parseWithTs: i });
}
async function wa(t8, e2, { parseWithTs: r2 }) {
  var n2;
  try {
    return await ms(t8, e2, { parseWithTs: r2 });
  } catch (s2) {
    if (((n2 = s2.cause) == null ? void 0 : n2.code) !== "BABEL_PARSER_SYNTAX_ERROR") throw s2;
  }
  return T$1(t8, e2, { parser: r2 ? "__vue_ts_event_binding" : "__vue_event_binding" }, X$1);
}
function ba(t8, e2, { parseWithTs: r2 }) {
  return T$1(t8, e2, { parser: r2 ? "__vue_ts_expression" : "__vue_expression" }, X$1);
}
function ms(t8, e2, { parseWithTs: r2 }) {
  return T$1(t8, e2, { parser: r2 ? "__ts_expression" : "__js_expression" }, X$1);
}
var fs = ya;
function Ta(t8, e2) {
  let { node: r2 } = t8;
  if (r2.value) {
    if (/^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/u.test(e2.originalText.slice(r2.valueSpan.start.offset, r2.valueSpan.end.offset)) || e2.parser === "lwc" && r2.value.startsWith("{") && r2.value.endsWith("}")) return [r2.rawName, "=", r2.value];
    for (let n2 of [us, ls, ns, fs, rs]) {
      let s2 = n2(t8, e2);
      if (s2) return xa(s2);
    }
  }
}
function xa(t8) {
  return async (e2, r2, n2, s2) => {
    let i = await t8(e2, r2, n2, s2);
    if (i) return i = hr$1(i, (a) => typeof a == "string" ? w$1(false, a, '"', "&quot;") : a), [n2.node.rawName, '="', E(i), '"'];
  };
}
var ds = Ta;
var ka = new Proxy(() => {
}, { get: () => ka });
function J$1(t8) {
  return t8.sourceSpan.start.offset;
}
function se$1(t8) {
  return t8.sourceSpan.end.offset;
}
function tt$1(t8, e2) {
  return [t8.isSelfClosing ? "" : Ba(t8, e2), Se$1(t8, e2)];
}
function Ba(t8, e2) {
  return t8.lastChild && Ae$1(t8.lastChild) ? "" : [La(t8, e2), Lt$1(t8, e2)];
}
function Se$1(t8, e2) {
  return (t8.next ? Q$1(t8.next) : Ee$1(t8.parent)) ? "" : [_e$1(t8, e2), G$1(t8, e2)];
}
function La(t8, e2) {
  return Ee$1(t8) ? _e$1(t8.lastChild, e2) : "";
}
function G$1(t8, e2) {
  return Ae$1(t8) ? Lt$1(t8.parent, e2) : rt$1(t8) ? Ft(t8.next, e2) : "";
}
function Lt$1(t8, e2) {
  if (Cs(t8, e2)) return "";
  switch (t8.type) {
    case "ieConditionalComment":
      return "<!";
    case "element":
      if (t8.hasHtmComponentClosingTag) return "<//";
    default:
      return `</${t8.rawName}`;
  }
}
function _e$1(t8, e2) {
  if (Cs(t8, e2)) return "";
  switch (t8.type) {
    case "ieConditionalComment":
    case "ieConditionalEndComment":
      return "[endif]-->";
    case "ieConditionalStartComment":
      return "]><!-->";
    case "interpolation":
      return "}}";
    case "angularIcuExpression":
      return "}";
    case "element":
      if (t8.isSelfClosing) return "/>";
    default:
      return ">";
  }
}
function Cs(t8, e2) {
  return !t8.isSelfClosing && !t8.endSourceSpan && (ge$1(t8) || wt$1(t8.parent, e2));
}
function Q$1(t8) {
  return t8.prev && t8.prev.type !== "docType" && t8.type !== "angularControlFlowBlock" && !$(t8.prev) && t8.isLeadingSpaceSensitive && !t8.hasLeadingSpaces;
}
function Ee$1(t8) {
  var e2;
  return ((e2 = t8.lastChild) == null ? void 0 : e2.isTrailingSpaceSensitive) && !t8.lastChild.hasTrailingSpaces && !$(Tt$1(t8.lastChild)) && !de$1(t8);
}
function Ae$1(t8) {
  return !t8.next && !t8.hasTrailingSpaces && t8.isTrailingSpaceSensitive && $(Tt$1(t8));
}
function rt$1(t8) {
  return t8.next && !$(t8.next) && $(t8) && t8.isTrailingSpaceSensitive && !t8.hasTrailingSpaces;
}
function Fa(t8) {
  let e2 = t8.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/su);
  return e2 ? e2[1] ? e2[1].split(/\s+/u) : true : false;
}
function nt$1(t8) {
  return !t8.prev && t8.isLeadingSpaceSensitive && !t8.hasLeadingSpaces;
}
function Pa(t8, e2, r2) {
  var m;
  let { node: n2 } = t8;
  if (!me$1(n2.attrs)) return n2.isSelfClosing ? " " : "";
  let s2 = ((m = n2.prev) == null ? void 0 : m.type) === "comment" && Fa(n2.prev.value), i = typeof s2 == "boolean" ? () => s2 : Array.isArray(s2) ? (f) => s2.includes(f.rawName) : () => false, a = t8.map(({ node: f }) => i(f) ? B$1(e2.originalText.slice(J$1(f), se$1(f))) : r2(), "attrs"), o2 = n2.type === "element" && n2.fullName === "script" && n2.attrs.length === 1 && n2.attrs[0].fullName === "src" && n2.children.length === 0, p = e2.singleAttributePerLine && n2.attrs.length > 1 && !Ce$1(n2, e2) ? S$1 : _$1, l2 = [k$1([o2 ? " " : _$1, H$1(p, a)])];
  return n2.firstChild && nt$1(n2.firstChild) || n2.isSelfClosing && Ee$1(n2.parent) || o2 ? l2.push(n2.isSelfClosing ? " " : "") : l2.push(e2.bracketSameLine ? n2.isSelfClosing ? " " : "" : n2.isSelfClosing ? _$1 : v$1), l2;
}
function Na(t8) {
  return t8.firstChild && nt$1(t8.firstChild) ? "" : Pt$1(t8);
}
function st$1(t8, e2, r2) {
  let { node: n2 } = t8;
  return [De$1(n2, e2), Pa(t8, e2, r2), n2.isSelfClosing ? "" : Na(n2)];
}
function De$1(t8, e2) {
  return t8.prev && rt$1(t8.prev) ? "" : [z$1(t8, e2), Ft(t8, e2)];
}
function z$1(t8, e2) {
  return nt$1(t8) ? Pt$1(t8.parent) : Q$1(t8) ? _e$1(t8.prev, e2) : "";
}
var gs = "<!doctype";
function Ft(t8, e2) {
  switch (t8.type) {
    case "ieConditionalComment":
    case "ieConditionalStartComment":
      return `<!--[if ${t8.condition}`;
    case "ieConditionalEndComment":
      return "<!--<!";
    case "interpolation":
      return "{{";
    case "docType": {
      if (t8.value === "html") {
        let { filepath: n2 } = e2;
        if (n2 && /\.html?$/u.test(n2)) return gs;
      }
      let r2 = J$1(t8);
      return e2.originalText.slice(r2, r2 + gs.length);
    }
    case "angularIcuExpression":
      return "{";
    case "element":
      if (t8.condition) return `<!--[if ${t8.condition}]><!--><${t8.rawName}`;
    default:
      return `<${t8.rawName}`;
  }
}
function Pt$1(t8) {
  switch (t8.type) {
    case "ieConditionalComment":
      return "]>";
    case "element":
      if (t8.condition) return "><!--<![endif]-->";
    default:
      return ">";
  }
}
function Ia(t8, e2) {
  if (!t8.endSourceSpan) return "";
  let r2 = t8.startSourceSpan.end.offset;
  t8.firstChild && nt$1(t8.firstChild) && (r2 -= Pt$1(t8).length);
  let n2 = t8.endSourceSpan.start.offset;
  return t8.lastChild && Ae$1(t8.lastChild) ? n2 += Lt$1(t8, e2).length : Ee$1(t8) && (n2 -= _e$1(t8.lastChild, e2).length), e2.originalText.slice(r2, n2);
}
var Nt$1 = Ia;
var Ra = /* @__PURE__ */ new Set(["if", "else if", "for", "switch", "case"]);
function $a(t8, e2) {
  let { node: r2 } = t8;
  switch (r2.type) {
    case "element":
      if (W$1(r2, e2) || r2.type === "interpolation") return;
      if (!r2.isSelfClosing && xt$1(r2, e2)) {
        let n2 = vr$1(r2, e2);
        return n2 ? async (s2, i) => {
          let a = Nt$1(r2, e2), o2 = /^\s*$/u.test(a), u = "";
          return o2 || (u = await s2(Er$1(a), { parser: n2, __embeddedInHtml: true }), o2 = u === ""), [z$1(r2, e2), E(st$1(t8, e2, i)), o2 ? "" : S$1, u, o2 ? "" : S$1, tt$1(r2, e2), G$1(r2, e2)];
        } : void 0;
      }
      break;
    case "text":
      if (W$1(r2.parent, e2)) {
        let n2 = vr$1(r2.parent, e2);
        if (n2) return async (s2) => {
          let i = n2 === "markdown" ? yr$1(r2.value.replace(/^[^\S\n]*\n/u, "")) : r2.value, a = { parser: n2, __embeddedInHtml: true };
          if (e2.parser === "html" && n2 === "babel") {
            let o2 = "script", { attrMap: u } = r2.parent;
            u && (u.type === "module" || (u.type === "text/babel" || u.type === "text/jsx") && u["data-type"] === "module") && (o2 = "module"), a.__babelSourceType = o2;
          }
          return [ne$1, z$1(r2, e2), await s2(i, a), G$1(r2, e2)];
        };
      } else if (r2.parent.type === "interpolation") return async (n2) => {
        let s2 = { __isInHtmlInterpolation: true, __embeddedInHtml: true };
        return e2.parser === "angular" ? s2.parser = "__ng_interpolation" : e2.parser === "vue" ? s2.parser = Ie$1(t8, e2) ? "__vue_ts_expression" : "__vue_expression" : s2.parser = "__js_expression", [k$1([_$1, await n2(r2.value, s2)]), r2.parent.next && Q$1(r2.parent.next) ? " " : _$1];
      };
      break;
    case "attribute":
      return ds(t8, e2);
    case "front-matter":
      return (n2) => yn$1(r2, n2);
    case "angularControlFlowBlockParameters":
      return Ra.has(t8.parent.name) ? wn$1 : void 0;
    case "angularLetDeclarationInitializer":
      return (n2) => T$1(r2.value, n2, { parser: "__ng_binding", __isInHtmlAttribute: false });
  }
}
var Ss = $a;
var it$1 = null;
function at$1(t8) {
  if (it$1 !== null && typeof it$1.property) {
    let e2 = it$1;
    return it$1 = at$1.prototype = null, e2;
  }
  return it$1 = at$1.prototype = t8 ?? /* @__PURE__ */ Object.create(null), new at$1();
}
var Oa = 10;
for (let t8 = 0; t8 <= Oa; t8++) at$1();
function kr$1(t8) {
  return at$1(t8);
}
function Ma(t8, e2 = "type") {
  kr$1(t8);
  function r2(n2) {
    let s2 = n2[e2], i = t8[s2];
    if (!Array.isArray(i)) throw Object.assign(new Error(`Missing visitor keys for '${s2}'.`), { node: n2 });
    return i;
  }
  return r2;
}
var _s = Ma;
var qa = { "front-matter": [], root: ["children"], element: ["attrs", "children"], ieConditionalComment: ["children"], ieConditionalStartComment: [], ieConditionalEndComment: [], interpolation: ["children"], text: ["children"], docType: [], comment: [], attribute: [], cdata: [], angularControlFlowBlock: ["children", "parameters"], angularControlFlowBlockParameters: ["children"], angularControlFlowBlockParameter: [], angularLetDeclaration: ["init"], angularLetDeclarationInitializer: [], angularIcuExpression: ["cases"], angularIcuCase: ["expression"] }, Es = qa;
var Ha = _s(Es), As = Ha;
var Ds = "format";
var vs = /^\s*<!--\s*@(?:noformat|noprettier)\s*-->/u, ys = /^\s*<!--\s*@(?:format|prettier)\s*-->/u;
function ws$1(t8) {
  return ys.test(t8);
}
function bs(t8) {
  return vs.test(t8);
}
function Ts(t8) {
  return `<!-- @${Ds} -->

${t8}`;
}
var xs = /* @__PURE__ */ new Map([["if", /* @__PURE__ */ new Set(["else if", "else"])], ["else if", /* @__PURE__ */ new Set(["else if", "else"])], ["for", /* @__PURE__ */ new Set(["empty"])], ["defer", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])], ["placeholder", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])], ["error", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])], ["loading", /* @__PURE__ */ new Set(["placeholder", "error", "loading"])]]);
function ks(t8) {
  let e2 = se$1(t8);
  return t8.type === "element" && !t8.endSourceSpan && me$1(t8.children) ? Math.max(e2, ks(K(false, t8.children, -1))) : e2;
}
function ot$1(t8, e2, r2) {
  let n2 = t8.node;
  if (ge$1(n2)) {
    let s2 = ks(n2);
    return [z$1(n2, e2), B$1(O$1.trimEnd(e2.originalText.slice(J$1(n2) + (n2.prev && rt$1(n2.prev) ? Ft(n2).length : 0), s2 - (n2.next && Q$1(n2.next) ? _e$1(n2, e2).length : 0)))), G$1(n2, e2)];
  }
  return r2();
}
function It$1(t8, e2) {
  return $(t8) && $(e2) ? t8.isTrailingSpaceSensitive ? t8.hasTrailingSpaces ? bt$1(e2) ? S$1 : _$1 : "" : bt$1(e2) ? S$1 : v$1 : rt$1(t8) && (ge$1(e2) || e2.firstChild || e2.isSelfClosing || e2.type === "element" && e2.attrs.length > 0) || t8.type === "element" && t8.isSelfClosing && Q$1(e2) ? "" : !e2.isLeadingSpaceSensitive || bt$1(e2) || Q$1(e2) && t8.lastChild && Ae$1(t8.lastChild) && t8.lastChild.lastChild && Ae$1(t8.lastChild.lastChild) ? S$1 : e2.hasLeadingSpaces ? _$1 : v$1;
}
function Re$1(t8, e2, r2) {
  let { node: n2 } = t8;
  if (Dr$1(n2)) return [ne$1, ...t8.map((i) => {
    let a = i.node, o2 = a.prev ? It$1(a.prev, a) : "";
    return [o2 ? [o2, Je$1(a.prev) ? S$1 : ""] : "", ot$1(i, e2, r2)];
  }, "children")];
  let s2 = n2.children.map(() => Symbol(""));
  return t8.map((i, a) => {
    let o2 = i.node;
    if ($(o2)) {
      if (o2.prev && $(o2.prev)) {
        let A = It$1(o2.prev, o2);
        if (A) return Je$1(o2.prev) ? [S$1, S$1, ot$1(i, e2, r2)] : [A, ot$1(i, e2, r2)];
      }
      return ot$1(i, e2, r2);
    }
    let u = [], p = [], l2 = [], m = [], f = o2.prev ? It$1(o2.prev, o2) : "", C = o2.next ? It$1(o2, o2.next) : "";
    return f && (Je$1(o2.prev) ? u.push(S$1, S$1) : f === S$1 ? u.push(S$1) : $(o2.prev) ? p.push(f) : p.push(pe$1("", v$1, { groupId: s2[a - 1] }))), C && (Je$1(o2) ? $(o2.next) && m.push(S$1, S$1) : C === S$1 ? $(o2.next) && m.push(S$1) : l2.push(C)), [...u, E([...p, E([ot$1(i, e2, r2), ...l2], { id: s2[a] })]), ...m];
  }, "children");
}
function Bs(t8, e2, r2) {
  let { node: n2 } = t8, s2 = [];
  Va(t8) && s2.push("} "), s2.push("@", n2.name), n2.parameters && s2.push(" (", E(r2("parameters")), ")"), s2.push(" {");
  let i = Ls(n2);
  return n2.children.length > 0 ? (n2.firstChild.hasLeadingSpaces = true, n2.lastChild.hasTrailingSpaces = true, s2.push(k$1([S$1, Re$1(t8, e2, r2)])), i && s2.push(S$1, "}")) : i && s2.push("}"), E(s2, { shouldBreak: true });
}
function Ls(t8) {
  var e2, r2;
  return !(((e2 = t8.next) == null ? void 0 : e2.type) === "angularControlFlowBlock" && ((r2 = xs.get(t8.name)) != null && r2.has(t8.next.name)));
}
function Va(t8) {
  let { previous: e2 } = t8;
  return (e2 == null ? void 0 : e2.type) === "angularControlFlowBlock" && !ge$1(e2) && !Ls(e2);
}
function Fs(t8, e2, r2) {
  return [k$1([v$1, H$1([";", _$1], t8.map(r2, "children"))]), v$1];
}
function Ps(t8, e2, r2) {
  let { node: n2 } = t8;
  return [De$1(n2, e2), E([n2.switchValue.trim(), ", ", n2.clause, n2.cases.length > 0 ? [",", k$1([_$1, H$1(_$1, t8.map(r2, "cases"))])] : "", v$1]), Se$1(n2, e2)];
}
function Ns(t8, e2, r2) {
  let { node: n2 } = t8;
  return [n2.value, " {", E([k$1([v$1, t8.map(({ node: s2, isLast: i }) => {
    let a = [r2()];
    return s2.type === "text" && (s2.hasLeadingSpaces && a.unshift(_$1), s2.hasTrailingSpaces && !i && a.push(_$1)), a;
  }, "expression")]), v$1]), "}"];
}
function Is(t8, e2, r2) {
  let { node: n2 } = t8;
  if (wt$1(n2, e2)) return [z$1(n2, e2), E(st$1(t8, e2, r2)), B$1(Nt$1(n2, e2)), ...tt$1(n2, e2), G$1(n2, e2)];
  let s2 = n2.children.length === 1 && (n2.firstChild.type === "interpolation" || n2.firstChild.type === "angularIcuExpression") && n2.firstChild.isLeadingSpaceSensitive && !n2.firstChild.hasLeadingSpaces && n2.lastChild.isTrailingSpaceSensitive && !n2.lastChild.hasTrailingSpaces, i = Symbol("element-attr-group-id"), a = (l2) => E([E(st$1(t8, e2, r2), { id: i }), l2, tt$1(n2, e2)]), o2 = (l2) => s2 ? Cn$1(l2, { groupId: i }) : (W$1(n2, e2) || et$1(n2, e2)) && n2.parent.type === "root" && e2.parser === "vue" && !e2.vueIndentScriptAndStyle ? l2 : k$1(l2), u = () => s2 ? pe$1(v$1, "", { groupId: i }) : n2.firstChild.hasLeadingSpaces && n2.firstChild.isLeadingSpaceSensitive ? _$1 : n2.firstChild.type === "text" && n2.isWhitespaceSensitive && n2.isIndentationSensitive ? dn$1(v$1) : v$1, p = () => (n2.next ? Q$1(n2.next) : Ee$1(n2.parent)) ? n2.lastChild.hasTrailingSpaces && n2.lastChild.isTrailingSpaceSensitive ? " " : "" : s2 ? pe$1(v$1, "", { groupId: i }) : n2.lastChild.hasTrailingSpaces && n2.lastChild.isTrailingSpaceSensitive ? _$1 : (n2.lastChild.type === "comment" || n2.lastChild.type === "text" && n2.isWhitespaceSensitive && n2.isIndentationSensitive) && new RegExp(`\\n[\\t ]{${e2.tabWidth * (t8.ancestors.length - 1)}}$`, "u").test(n2.lastChild.value) ? "" : v$1;
  return n2.children.length === 0 ? a(n2.hasDanglingSpaces && n2.isDanglingSpaceSensitive ? _$1 : "") : a([Gn$1(n2) ? ne$1 : "", o2([u(), Re$1(t8, e2, r2)]), p()]);
}
function ut$1(t8) {
  return t8 >= 9 && t8 <= 32 || t8 == 160;
}
function Rt$1(t8) {
  return 48 <= t8 && t8 <= 57;
}
function lt(t8) {
  return t8 >= 97 && t8 <= 122 || t8 >= 65 && t8 <= 90;
}
function Rs(t8) {
  return t8 >= 97 && t8 <= 102 || t8 >= 65 && t8 <= 70 || Rt$1(t8);
}
function $t$1(t8) {
  return t8 === 10 || t8 === 13;
}
function Br$1(t8) {
  return 48 <= t8 && t8 <= 55;
}
function Ot$1(t8) {
  return t8 === 39 || t8 === 34 || t8 === 96;
}
var Ua = /-+([a-z0-9])/g;
function Os(t8) {
  return t8.replace(Ua, (...e2) => e2[1].toUpperCase());
}
var ie$1 = class t {
  constructor(e2, r2, n2, s2) {
    this.file = e2, this.offset = r2, this.line = n2, this.col = s2;
  }
  toString() {
    return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
  }
  moveBy(e2) {
    let r2 = this.file.content, n2 = r2.length, s2 = this.offset, i = this.line, a = this.col;
    for (; s2 > 0 && e2 < 0; ) if (s2--, e2++, r2.charCodeAt(s2) == 10) {
      i--;
      let u = r2.substring(0, s2 - 1).lastIndexOf(String.fromCharCode(10));
      a = u > 0 ? s2 - u : s2;
    } else a--;
    for (; s2 < n2 && e2 > 0; ) {
      let o2 = r2.charCodeAt(s2);
      s2++, e2--, o2 == 10 ? (i++, a = 0) : a++;
    }
    return new t(this.file, s2, i, a);
  }
  getContext(e2, r2) {
    let n2 = this.file.content, s2 = this.offset;
    if (s2 != null) {
      s2 > n2.length - 1 && (s2 = n2.length - 1);
      let i = s2, a = 0, o2 = 0;
      for (; a < e2 && s2 > 0 && (s2--, a++, !(n2[s2] == `
` && ++o2 == r2)); ) ;
      for (a = 0, o2 = 0; a < e2 && i < n2.length - 1 && (i++, a++, !(n2[i] == `
` && ++o2 == r2)); ) ;
      return { before: n2.substring(s2, this.offset), after: n2.substring(this.offset, i + 1) };
    }
    return null;
  }
}, ve$1 = class ve {
  constructor(e2, r2) {
    this.content = e2, this.url = r2;
  }
}, h = class {
  constructor(e2, r2, n2 = e2, s2 = null) {
    this.start = e2, this.end = r2, this.fullStart = n2, this.details = s2;
  }
  toString() {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}, Mt;
(function(t8) {
  t8[t8.WARNING = 0] = "WARNING", t8[t8.ERROR = 1] = "ERROR";
})(Mt || (Mt = {}));
var Oe$1 = class Oe {
  constructor(e2, r2, n2 = Mt.ERROR, s2) {
    this.span = e2, this.msg = r2, this.level = n2, this.relatedError = s2;
  }
  contextualMessage() {
    let e2 = this.span.start.getContext(100, 3);
    return e2 ? `${this.msg} ("${e2.before}[${Mt[this.level]} ->]${e2.after}")` : this.msg;
  }
  toString() {
    let e2 = this.span.details ? `, ${this.span.details}` : "";
    return `${this.contextualMessage()}: ${this.span.start}${e2}`;
  }
};
var Wa = [za, Ya, Ka, Qa, Ja, to$1, Za, eo$1, ro$1, Xa];
function Ga(t8, e2) {
  for (let r2 of Wa) r2(t8, e2);
  return t8;
}
function za(t8) {
  t8.walk((e2) => {
    if (e2.type === "element" && e2.tagDefinition.ignoreFirstLf && e2.children.length > 0 && e2.children[0].type === "text" && e2.children[0].value[0] === `
`) {
      let r2 = e2.children[0];
      r2.value.length === 1 ? e2.removeChild(r2) : r2.value = r2.value.slice(1);
    }
  });
}
function Ya(t8) {
  let e2 = (r2) => {
    var n2, s2;
    return r2.type === "element" && ((n2 = r2.prev) == null ? void 0 : n2.type) === "ieConditionalStartComment" && r2.prev.sourceSpan.end.offset === r2.startSourceSpan.start.offset && ((s2 = r2.firstChild) == null ? void 0 : s2.type) === "ieConditionalEndComment" && r2.firstChild.sourceSpan.start.offset === r2.startSourceSpan.end.offset;
  };
  t8.walk((r2) => {
    if (r2.children) for (let n2 = 0; n2 < r2.children.length; n2++) {
      let s2 = r2.children[n2];
      if (!e2(s2)) continue;
      let i = s2.prev, a = s2.firstChild;
      r2.removeChild(i), n2--;
      let o2 = new h(i.sourceSpan.start, a.sourceSpan.end), u = new h(o2.start, s2.sourceSpan.end);
      s2.condition = i.condition, s2.sourceSpan = u, s2.startSourceSpan = o2, s2.removeChild(a);
    }
  });
}
function ja(t8, e2, r2) {
  t8.walk((n2) => {
    if (n2.children) for (let s2 = 0; s2 < n2.children.length; s2++) {
      let i = n2.children[s2];
      if (i.type !== "text" && !e2(i)) continue;
      i.type !== "text" && (i.type = "text", i.value = r2(i));
      let a = i.prev;
      !a || a.type !== "text" || (a.value += i.value, a.sourceSpan = new h(a.sourceSpan.start, i.sourceSpan.end), n2.removeChild(i), s2--);
    }
  });
}
function Ka(t8) {
  return ja(t8, (e2) => e2.type === "cdata", (e2) => `<![CDATA[${e2.value}]]>`);
}
function Xa(t8) {
  let e2 = (r2) => {
    var n2, s2;
    return r2.type === "element" && r2.attrs.length === 0 && r2.children.length === 1 && r2.firstChild.type === "text" && !O$1.hasWhitespaceCharacter(r2.children[0].value) && !r2.firstChild.hasLeadingSpaces && !r2.firstChild.hasTrailingSpaces && r2.isLeadingSpaceSensitive && !r2.hasLeadingSpaces && r2.isTrailingSpaceSensitive && !r2.hasTrailingSpaces && ((n2 = r2.prev) == null ? void 0 : n2.type) === "text" && ((s2 = r2.next) == null ? void 0 : s2.type) === "text";
  };
  t8.walk((r2) => {
    if (r2.children) for (let n2 = 0; n2 < r2.children.length; n2++) {
      let s2 = r2.children[n2];
      if (!e2(s2)) continue;
      let i = s2.prev, a = s2.next;
      i.value += `<${s2.rawName}>` + s2.firstChild.value + `</${s2.rawName}>` + a.value, i.sourceSpan = new h(i.sourceSpan.start, a.sourceSpan.end), i.isTrailingSpaceSensitive = a.isTrailingSpaceSensitive, i.hasTrailingSpaces = a.hasTrailingSpaces, r2.removeChild(s2), n2--, r2.removeChild(a);
    }
  });
}
function Qa(t8, e2) {
  if (e2.parser === "html") return;
  let r2 = /\{\{(.+?)\}\}/su;
  t8.walk((n2) => {
    if (qn$1(n2, e2)) for (let s2 of n2.children) {
      if (s2.type !== "text") continue;
      let i = s2.sourceSpan.start, a = null, o2 = s2.value.split(r2);
      for (let u = 0; u < o2.length; u++, i = a) {
        let p = o2[u];
        if (u % 2 === 0) {
          a = i.moveBy(p.length), p.length > 0 && n2.insertChildBefore(s2, { type: "text", value: p, sourceSpan: new h(i, a) });
          continue;
        }
        a = i.moveBy(p.length + 4), n2.insertChildBefore(s2, { type: "interpolation", sourceSpan: new h(i, a), children: p.length === 0 ? [] : [{ type: "text", value: p, sourceSpan: new h(i.moveBy(2), a.moveBy(-2)) }] });
      }
      n2.removeChild(s2);
    }
  });
}
function Ja(t8, e2) {
  t8.walk((r2) => {
    let n2 = r2.$children;
    if (!n2) return;
    if (n2.length === 0 || n2.length === 1 && n2[0].type === "text" && O$1.trim(n2[0].value).length === 0) {
      r2.hasDanglingSpaces = n2.length > 0, r2.$children = [];
      return;
    }
    let s2 = Hn$1(r2, e2), i = Ar$1(r2);
    if (!s2) for (let a = 0; a < n2.length; a++) {
      let o2 = n2[a];
      if (o2.type !== "text") continue;
      let { leadingWhitespace: u, text: p, trailingWhitespace: l2 } = Mn$1(o2.value), m = o2.prev, f = o2.next;
      p ? (o2.value = p, o2.sourceSpan = new h(o2.sourceSpan.start.moveBy(u.length), o2.sourceSpan.end.moveBy(-l2.length)), u && (m && (m.hasTrailingSpaces = true), o2.hasLeadingSpaces = true), l2 && (o2.hasTrailingSpaces = true, f && (f.hasLeadingSpaces = true))) : (r2.removeChild(o2), a--, (u || l2) && (m && (m.hasTrailingSpaces = true), f && (f.hasLeadingSpaces = true)));
    }
    r2.isWhitespaceSensitive = s2, r2.isIndentationSensitive = i;
  });
}
function Za(t8) {
  t8.walk((e2) => {
    e2.isSelfClosing = !e2.children || e2.type === "element" && (e2.tagDefinition.isVoid || e2.endSourceSpan && e2.startSourceSpan.start === e2.endSourceSpan.start && e2.startSourceSpan.end === e2.endSourceSpan.end);
  });
}
function eo$1(t8, e2) {
  t8.walk((r2) => {
    r2.type === "element" && (r2.hasHtmComponentClosingTag = r2.endSourceSpan && /^<\s*\/\s*\/\s*>$/u.test(e2.originalText.slice(r2.endSourceSpan.start.offset, r2.endSourceSpan.end.offset)));
  });
}
function to$1(t8, e2) {
  t8.walk((r2) => {
    r2.cssDisplay = Qn$1(r2, e2);
  });
}
function ro$1(t8, e2) {
  t8.walk((r2) => {
    let { children: n2 } = r2;
    if (n2) {
      if (n2.length === 0) {
        r2.isDanglingSpaceSensitive = Wn$1(r2, e2);
        return;
      }
      for (let s2 of n2) s2.isLeadingSpaceSensitive = Vn$1(s2, e2), s2.isTrailingSpaceSensitive = Un$1(s2, e2);
      for (let s2 = 0; s2 < n2.length; s2++) {
        let i = n2[s2];
        i.isLeadingSpaceSensitive = (s2 === 0 || i.prev.isTrailingSpaceSensitive) && i.isLeadingSpaceSensitive, i.isTrailingSpaceSensitive = (s2 === n2.length - 1 || i.next.isLeadingSpaceSensitive) && i.isTrailingSpaceSensitive;
      }
    }
  });
}
var Ms = Ga;
function no$1(t8, e2, r2) {
  let { node: n2 } = t8;
  switch (n2.type) {
    case "front-matter":
      return B$1(n2.raw);
    case "root":
      return e2.__onHtmlRoot && e2.__onHtmlRoot(n2), [E(Re$1(t8, e2, r2)), S$1];
    case "element":
    case "ieConditionalComment":
      return Is(t8, e2, r2);
    case "angularControlFlowBlock":
      return Bs(t8, e2, r2);
    case "angularControlFlowBlockParameters":
      return Fs(t8, e2, r2);
    case "angularControlFlowBlockParameter":
      return O$1.trim(n2.expression);
    case "angularLetDeclaration":
      return E(["@let ", E([n2.id, " =", E(k$1([_$1, r2("init")]))]), ";"]);
    case "angularLetDeclarationInitializer":
      return n2.value;
    case "angularIcuExpression":
      return Ps(t8, e2, r2);
    case "angularIcuCase":
      return Ns(t8, e2, r2);
    case "ieConditionalStartComment":
    case "ieConditionalEndComment":
      return [De$1(n2), Se$1(n2)];
    case "interpolation":
      return [De$1(n2, e2), ...t8.map(r2, "children"), Se$1(n2, e2)];
    case "text": {
      if (n2.parent.type === "interpolation") {
        let o2 = /\n[^\S\n]*$/u, u = o2.test(n2.value), p = u ? n2.value.replace(o2, "") : n2.value;
        return [B$1(p), u ? S$1 : ""];
      }
      let s2 = z$1(n2, e2), i = kt$1(n2), a = G$1(n2, e2);
      return i[0] = [s2, i[0]], i.push([i.pop(), a]), vt$1(i);
    }
    case "docType":
      return [E([De$1(n2, e2), " ", w$1(false, n2.value.replace(/^html\b/iu, "html"), /\s+/gu, " ")]), Se$1(n2, e2)];
    case "comment":
      return [z$1(n2, e2), B$1(e2.originalText.slice(J$1(n2), se$1(n2))), G$1(n2, e2)];
    case "attribute": {
      if (n2.value === null) return n2.rawName;
      let s2 = wr$1(n2.value), i = _n$1(s2, '"');
      return [n2.rawName, "=", i, B$1(i === '"' ? w$1(false, s2, '"', "&quot;") : w$1(false, s2, "'", "&apos;")), i];
    }
    case "cdata":
    default:
      throw new An$1(n2, "HTML");
  }
}
var so$1 = { preprocess: Ms, print: no$1, insertPragma: Ts, massageAstNode: vn$1, embed: Ss, getVisitorKeys: As }, qs = so$1;
var Hs = [{ name: "Angular", type: "markup", extensions: [".component.html"], tmScope: "text.html.basic", aceMode: "html", aliases: ["xhtml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["angular"], vscodeLanguageIds: ["html"], filenames: [], linguistLanguageId: 146 }, { name: "HTML", type: "markup", extensions: [".html", ".hta", ".htm", ".html.hl", ".inc", ".xht", ".xhtml"], tmScope: "text.html.basic", aceMode: "html", aliases: ["xhtml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["html"], vscodeLanguageIds: ["html"], linguistLanguageId: 146 }, { name: "Lightning Web Components", type: "markup", extensions: [], tmScope: "text.html.basic", aceMode: "html", aliases: ["xhtml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["lwc"], vscodeLanguageIds: ["html"], filenames: [], linguistLanguageId: 146 }, { name: "MJML", type: "markup", extensions: [".mjml"], tmScope: "text.mjml.basic", aceMode: "html", aliases: ["MJML", "mjml"], codemirrorMode: "htmlmixed", codemirrorMimeType: "text/html", parsers: ["mjml"], filenames: [], vscodeLanguageIds: ["mjml"], linguistLanguageId: 146 }, { name: "Vue", type: "markup", extensions: [".vue"], tmScope: "source.vue", aceMode: "html", parsers: ["vue"], vscodeLanguageIds: ["vue"], linguistLanguageId: 391 }];
var Lr$1 = { bracketSameLine: { category: "Common", type: "boolean", default: false, description: "Put > of opening tags on the last line instead of on a new line." }, singleAttributePerLine: { category: "Common", type: "boolean", default: false, description: "Enforce single attribute per line in HTML, Vue and JSX." } };
var Vs = "HTML", io$1 = { bracketSameLine: Lr$1.bracketSameLine, htmlWhitespaceSensitivity: { category: Vs, type: "choice", default: "css", description: "How to handle whitespaces in HTML.", choices: [{ value: "css", description: "Respect the default value of CSS display property." }, { value: "strict", description: "Whitespaces are considered sensitive." }, { value: "ignore", description: "Whitespaces are considered insensitive." }] }, singleAttributePerLine: Lr$1.singleAttributePerLine, vueIndentScriptAndStyle: { category: Vs, type: "boolean", default: false, description: "Indent script and style tags in Vue files." } }, Us = io$1;
var tn$1 = {};
ln$1(tn$1, { angular: () => iu$1, html: () => ru$1, lwc: () => ou$1, mjml: () => su$1, vue: () => au$1 });
var Ws;
(function(t8) {
  t8[t8.Emulated = 0] = "Emulated", t8[t8.None = 2] = "None", t8[t8.ShadowDom = 3] = "ShadowDom";
})(Ws || (Ws = {}));
var Gs;
(function(t8) {
  t8[t8.OnPush = 0] = "OnPush", t8[t8.Default = 1] = "Default";
})(Gs || (Gs = {}));
var zs;
(function(t8) {
  t8[t8.None = 0] = "None", t8[t8.SignalBased = 1] = "SignalBased", t8[t8.HasDecoratorInputTransform = 2] = "HasDecoratorInputTransform";
})(zs || (zs = {}));
var Fr$1 = { name: "custom-elements" }, Pr$1 = { name: "no-errors-schema" };
var Z$1;
(function(t8) {
  t8[t8.NONE = 0] = "NONE", t8[t8.HTML = 1] = "HTML", t8[t8.STYLE = 2] = "STYLE", t8[t8.SCRIPT = 3] = "SCRIPT", t8[t8.URL = 4] = "URL", t8[t8.RESOURCE_URL = 5] = "RESOURCE_URL";
})(Z$1 || (Z$1 = {}));
var Ys;
(function(t8) {
  t8[t8.Error = 0] = "Error", t8[t8.Warning = 1] = "Warning", t8[t8.Ignore = 2] = "Ignore";
})(Ys || (Ys = {}));
var N$1;
(function(t8) {
  t8[t8.RAW_TEXT = 0] = "RAW_TEXT", t8[t8.ESCAPABLE_RAW_TEXT = 1] = "ESCAPABLE_RAW_TEXT", t8[t8.PARSABLE_DATA = 2] = "PARSABLE_DATA";
})(N$1 || (N$1 = {}));
function ct$1(t8, e2 = true) {
  if (t8[0] != ":") return [null, t8];
  let r2 = t8.indexOf(":", 1);
  if (r2 === -1) {
    if (e2) throw new Error(`Unsupported format "${t8}" expecting ":namespace:name"`);
    return [null, t8];
  }
  return [t8.slice(1, r2), t8.slice(r2 + 1)];
}
function Nr$1(t8) {
  return ct$1(t8)[1] === "ng-container";
}
function Ir$1(t8) {
  return ct$1(t8)[1] === "ng-content";
}
function Me$1(t8) {
  return t8 === null ? null : ct$1(t8)[0];
}
function qe$1(t8, e2) {
  return t8 ? `:${t8}:${e2}` : e2;
}
var Ht$1;
function Rr$1() {
  return Ht$1 || (Ht$1 = {}, qt$1(Z$1.HTML, ["iframe|srcdoc", "*|innerHTML", "*|outerHTML"]), qt$1(Z$1.STYLE, ["*|style"]), qt$1(Z$1.URL, ["*|formAction", "area|href", "area|ping", "audio|src", "a|href", "a|ping", "blockquote|cite", "body|background", "del|cite", "form|action", "img|src", "input|src", "ins|cite", "q|cite", "source|src", "track|src", "video|poster", "video|src"]), qt$1(Z$1.RESOURCE_URL, ["applet|code", "applet|codebase", "base|href", "embed|src", "frame|src", "head|profile", "html|manifest", "iframe|src", "link|href", "media|src", "object|codebase", "object|data", "script|src"])), Ht$1;
}
function qt$1(t8, e2) {
  for (let r2 of e2) Ht$1[r2.toLowerCase()] = t8;
}
var Vt$1 = class Vt {
};
var ao$1 = "boolean", oo$1 = "number", uo$1 = "string", lo$1 = "object", co$1 = ["[Element]|textContent,%ariaAtomic,%ariaAutoComplete,%ariaBusy,%ariaChecked,%ariaColCount,%ariaColIndex,%ariaColSpan,%ariaCurrent,%ariaDescription,%ariaDisabled,%ariaExpanded,%ariaHasPopup,%ariaHidden,%ariaKeyShortcuts,%ariaLabel,%ariaLevel,%ariaLive,%ariaModal,%ariaMultiLine,%ariaMultiSelectable,%ariaOrientation,%ariaPlaceholder,%ariaPosInSet,%ariaPressed,%ariaReadOnly,%ariaRelevant,%ariaRequired,%ariaRoleDescription,%ariaRowCount,%ariaRowIndex,%ariaRowSpan,%ariaSelected,%ariaSetSize,%ariaSort,%ariaValueMax,%ariaValueMin,%ariaValueNow,%ariaValueText,%classList,className,elementTiming,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*fullscreenchange,*fullscreenerror,*search,*webkitfullscreenchange,*webkitfullscreenerror,outerHTML,%part,#scrollLeft,#scrollTop,slot,*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored", "[HTMLElement]^[Element]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,!inert,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy", "abbr,address,article,aside,b,bdi,bdo,cite,content,code,dd,dfn,dt,em,figcaption,figure,footer,header,hgroup,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy", "media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,!preservesPitch,src,%srcObject,#volume", ":svg:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex", ":svg:graphics^:svg:|", ":svg:animation^:svg:|*begin,*end,*repeat", ":svg:geometry^:svg:|", ":svg:componentTransferFunction^:svg:|", ":svg:gradient^:svg:|", ":svg:textContent^:svg:graphics|", ":svg:textPositioning^:svg:textContent|", "a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,rev,search,shape,target,text,type,username", "area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,search,shape,target,username", "audio^media|", "br^[HTMLElement]|clear", "base^[HTMLElement]|href,target", "body^[HTMLElement]|aLink,background,bgColor,link,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink", "button^[HTMLElement]|!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value", "canvas^[HTMLElement]|#height,#width", "content^[HTMLElement]|select", "dl^[HTMLElement]|!compact", "data^[HTMLElement]|value", "datalist^[HTMLElement]|", "details^[HTMLElement]|!open", "dialog^[HTMLElement]|!open,returnValue", "dir^[HTMLElement]|!compact", "div^[HTMLElement]|align", "embed^[HTMLElement]|align,height,name,src,type,width", "fieldset^[HTMLElement]|!disabled,name", "font^[HTMLElement]|color,face,size", "form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target", "frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src", "frameset^[HTMLElement]|cols,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows", "hr^[HTMLElement]|align,color,!noShade,size,width", "head^[HTMLElement]|", "h1,h2,h3,h4,h5,h6^[HTMLElement]|align", "html^[HTMLElement]|version", "iframe^[HTMLElement]|align,allow,!allowFullscreen,!allowPaymentRequest,csp,frameBorder,height,loading,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width", "img^[HTMLElement]|align,alt,border,%crossOrigin,decoding,#height,#hspace,!isMap,loading,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width", "input^[HTMLElement]|accept,align,alt,autocomplete,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width", "li^[HTMLElement]|type,#value", "label^[HTMLElement]|htmlFor", "legend^[HTMLElement]|align", "link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,imageSizes,imageSrcset,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type", "map^[HTMLElement]|name", "marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width", "menu^[HTMLElement]|!compact", "meta^[HTMLElement]|content,httpEquiv,media,name,scheme", "meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value", "ins,del^[HTMLElement]|cite,dateTime", "ol^[HTMLElement]|!compact,!reversed,#start,type", "object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width", "optgroup^[HTMLElement]|!disabled,label", "option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value", "output^[HTMLElement]|defaultValue,%htmlFor,name,value", "p^[HTMLElement]|align", "param^[HTMLElement]|name,type,value,valueType", "picture^[HTMLElement]|", "pre^[HTMLElement]|#width", "progress^[HTMLElement]|#max,#value", "q,blockquote,cite^[HTMLElement]|", "script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,!noModule,%referrerPolicy,src,text,type", "select^[HTMLElement]|autocomplete,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value", "slot^[HTMLElement]|name", "source^[HTMLElement]|#height,media,sizes,src,srcset,type,#width", "span^[HTMLElement]|", "style^[HTMLElement]|!disabled,media,type", "caption^[HTMLElement]|align", "th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width", "col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width", "table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width", "tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign", "tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign", "template^[HTMLElement]|", "textarea^[HTMLElement]|autocomplete,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap", "time^[HTMLElement]|dateTime", "title^[HTMLElement]|text", "track^[HTMLElement]|!default,kind,label,src,srclang", "ul^[HTMLElement]|!compact,type", "unknown^[HTMLElement]|", "video^media|!disablePictureInPicture,#height,*enterpictureinpicture,*leavepictureinpicture,!playsInline,poster,#width", ":svg:a^:svg:graphics|", ":svg:animate^:svg:animation|", ":svg:animateMotion^:svg:animation|", ":svg:animateTransform^:svg:animation|", ":svg:circle^:svg:geometry|", ":svg:clipPath^:svg:graphics|", ":svg:defs^:svg:graphics|", ":svg:desc^:svg:|", ":svg:discard^:svg:|", ":svg:ellipse^:svg:geometry|", ":svg:feBlend^:svg:|", ":svg:feColorMatrix^:svg:|", ":svg:feComponentTransfer^:svg:|", ":svg:feComposite^:svg:|", ":svg:feConvolveMatrix^:svg:|", ":svg:feDiffuseLighting^:svg:|", ":svg:feDisplacementMap^:svg:|", ":svg:feDistantLight^:svg:|", ":svg:feDropShadow^:svg:|", ":svg:feFlood^:svg:|", ":svg:feFuncA^:svg:componentTransferFunction|", ":svg:feFuncB^:svg:componentTransferFunction|", ":svg:feFuncG^:svg:componentTransferFunction|", ":svg:feFuncR^:svg:componentTransferFunction|", ":svg:feGaussianBlur^:svg:|", ":svg:feImage^:svg:|", ":svg:feMerge^:svg:|", ":svg:feMergeNode^:svg:|", ":svg:feMorphology^:svg:|", ":svg:feOffset^:svg:|", ":svg:fePointLight^:svg:|", ":svg:feSpecularLighting^:svg:|", ":svg:feSpotLight^:svg:|", ":svg:feTile^:svg:|", ":svg:feTurbulence^:svg:|", ":svg:filter^:svg:|", ":svg:foreignObject^:svg:graphics|", ":svg:g^:svg:graphics|", ":svg:image^:svg:graphics|decoding", ":svg:line^:svg:geometry|", ":svg:linearGradient^:svg:gradient|", ":svg:mpath^:svg:|", ":svg:marker^:svg:|", ":svg:mask^:svg:|", ":svg:metadata^:svg:|", ":svg:path^:svg:geometry|", ":svg:pattern^:svg:|", ":svg:polygon^:svg:geometry|", ":svg:polyline^:svg:geometry|", ":svg:radialGradient^:svg:gradient|", ":svg:rect^:svg:geometry|", ":svg:svg^:svg:graphics|#currentScale,#zoomAndPan", ":svg:script^:svg:|type", ":svg:set^:svg:animation|", ":svg:stop^:svg:|", ":svg:style^:svg:|!disabled,media,title,type", ":svg:switch^:svg:graphics|", ":svg:symbol^:svg:|", ":svg:tspan^:svg:textPositioning|", ":svg:text^:svg:textPositioning|", ":svg:textPath^:svg:textContent|", ":svg:title^:svg:|", ":svg:use^:svg:graphics|", ":svg:view^:svg:|#zoomAndPan", "data^[HTMLElement]|value", "keygen^[HTMLElement]|!autofocus,challenge,!disabled,form,keytype,name", "menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default", "summary^[HTMLElement]|", "time^[HTMLElement]|dateTime", ":svg:cursor^:svg:|", ":math:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforeinput,*beforematch,*beforetoggle,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contentvisibilityautostatechange,*contextlost,*contextmenu,*contextrestored,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*scrollend,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex", ":math:math^:math:|", ":math:maction^:math:|", ":math:menclose^:math:|", ":math:merror^:math:|", ":math:mfenced^:math:|", ":math:mfrac^:math:|", ":math:mi^:math:|", ":math:mmultiscripts^:math:|", ":math:mn^:math:|", ":math:mo^:math:|", ":math:mover^:math:|", ":math:mpadded^:math:|", ":math:mphantom^:math:|", ":math:mroot^:math:|", ":math:mrow^:math:|", ":math:ms^:math:|", ":math:mspace^:math:|", ":math:msqrt^:math:|", ":math:mstyle^:math:|", ":math:msub^:math:|", ":math:msubsup^:math:|", ":math:msup^:math:|", ":math:mtable^:math:|", ":math:mtd^:math:|", ":math:mtext^:math:|", ":math:mtr^:math:|", ":math:munder^:math:|", ":math:munderover^:math:|", ":math:semantics^:math:|"], js = new Map(Object.entries({ class: "className", for: "htmlFor", formaction: "formAction", innerHtml: "innerHTML", readonly: "readOnly", tabindex: "tabIndex" })), po$1 = Array.from(js).reduce((t8, [e2, r2]) => (t8.set(e2, r2), t8), /* @__PURE__ */ new Map()), Ut$1 = class Ut extends Vt$1 {
  constructor() {
    super(), this._schema = /* @__PURE__ */ new Map(), this._eventSchema = /* @__PURE__ */ new Map(), co$1.forEach((e2) => {
      let r2 = /* @__PURE__ */ new Map(), n2 = /* @__PURE__ */ new Set(), [s2, i] = e2.split("|"), a = i.split(","), [o2, u] = s2.split("^");
      o2.split(",").forEach((l2) => {
        this._schema.set(l2.toLowerCase(), r2), this._eventSchema.set(l2.toLowerCase(), n2);
      });
      let p = u && this._schema.get(u.toLowerCase());
      if (p) {
        for (let [l2, m] of p) r2.set(l2, m);
        for (let l2 of this._eventSchema.get(u.toLowerCase())) n2.add(l2);
      }
      a.forEach((l2) => {
        if (l2.length > 0) switch (l2[0]) {
          case "*":
            n2.add(l2.substring(1));
            break;
          case "!":
            r2.set(l2.substring(1), ao$1);
            break;
          case "#":
            r2.set(l2.substring(1), oo$1);
            break;
          case "%":
            r2.set(l2.substring(1), lo$1);
            break;
          default:
            r2.set(l2, uo$1);
        }
      });
    });
  }
  hasProperty(e2, r2, n2) {
    if (n2.some((i) => i.name === Pr$1.name)) return true;
    if (e2.indexOf("-") > -1) {
      if (Nr$1(e2) || Ir$1(e2)) return false;
      if (n2.some((i) => i.name === Fr$1.name)) return true;
    }
    return (this._schema.get(e2.toLowerCase()) || this._schema.get("unknown")).has(r2);
  }
  hasElement(e2, r2) {
    return r2.some((n2) => n2.name === Pr$1.name) || e2.indexOf("-") > -1 && (Nr$1(e2) || Ir$1(e2) || r2.some((n2) => n2.name === Fr$1.name)) ? true : this._schema.has(e2.toLowerCase());
  }
  securityContext(e2, r2, n2) {
    n2 && (r2 = this.getMappedPropName(r2)), e2 = e2.toLowerCase(), r2 = r2.toLowerCase();
    let s2 = Rr$1()[e2 + "|" + r2];
    return s2 || (s2 = Rr$1()["*|" + r2], s2 || Z$1.NONE);
  }
  getMappedPropName(e2) {
    return js.get(e2) ?? e2;
  }
  getDefaultComponentElementName() {
    return "ng-component";
  }
  validateProperty(e2) {
    return e2.toLowerCase().startsWith("on") ? { error: true, msg: `Binding to event property '${e2}' is disallowed for security reasons, please use (${e2.slice(2)})=...
If '${e2}' is a directive input, make sure the directive is imported by the current module.` } : { error: false };
  }
  validateAttribute(e2) {
    return e2.toLowerCase().startsWith("on") ? { error: true, msg: `Binding to event attribute '${e2}' is disallowed for security reasons, please use (${e2.slice(2)})=...` } : { error: false };
  }
  allKnownElementNames() {
    return Array.from(this._schema.keys());
  }
  allKnownAttributesOfElement(e2) {
    let r2 = this._schema.get(e2.toLowerCase()) || this._schema.get("unknown");
    return Array.from(r2.keys()).map((n2) => po$1.get(n2) ?? n2);
  }
  allKnownEventsOfElement(e2) {
    return Array.from(this._eventSchema.get(e2.toLowerCase()) ?? []);
  }
  normalizeAnimationStyleProperty(e2) {
    return Os(e2);
  }
  normalizeAnimationStyleValue(e2, r2, n2) {
    let s2 = "", i = n2.toString().trim(), a = null;
    if (ho(e2) && n2 !== 0 && n2 !== "0") if (typeof n2 == "number") s2 = "px";
    else {
      let o2 = n2.match(/^[+-]?[\d\.]+([a-z]*)$/);
      o2 && o2[1].length == 0 && (a = `Please provide a CSS unit value for ${r2}:${n2}`);
    }
    return { error: a, value: i + s2 };
  }
};
function ho(t8) {
  switch (t8) {
    case "width":
    case "height":
    case "minWidth":
    case "minHeight":
    case "maxWidth":
    case "maxHeight":
    case "left":
    case "top":
    case "bottom":
    case "right":
    case "fontSize":
    case "outlineWidth":
    case "outlineOffset":
    case "paddingTop":
    case "paddingLeft":
    case "paddingBottom":
    case "paddingRight":
    case "marginTop":
    case "marginLeft":
    case "marginBottom":
    case "marginRight":
    case "borderRadius":
    case "borderWidth":
    case "borderTopWidth":
    case "borderLeftWidth":
    case "borderRightWidth":
    case "borderBottomWidth":
    case "textIndent":
      return true;
    default:
      return false;
  }
}
var d = class {
  constructor({ closedByChildren: e2, implicitNamespacePrefix: r2, contentType: n2 = N$1.PARSABLE_DATA, closedByParent: s2 = false, isVoid: i = false, ignoreFirstLf: a = false, preventNamespaceInheritance: o2 = false, canSelfClose: u = false } = {}) {
    this.closedByChildren = {}, this.closedByParent = false, e2 && e2.length > 0 && e2.forEach((p) => this.closedByChildren[p] = true), this.isVoid = i, this.closedByParent = s2 || i, this.implicitNamespacePrefix = r2 || null, this.contentType = n2, this.ignoreFirstLf = a, this.preventNamespaceInheritance = o2, this.canSelfClose = u ?? i;
  }
  isClosedByChild(e2) {
    return this.isVoid || e2.toLowerCase() in this.closedByChildren;
  }
  getContentType(e2) {
    return typeof this.contentType == "object" ? (e2 === void 0 ? void 0 : this.contentType[e2]) ?? this.contentType.default : this.contentType;
  }
}, Ks, pt$1;
function He$1(t8) {
  return pt$1 || (Ks = new d({ canSelfClose: true }), pt$1 = Object.assign(/* @__PURE__ */ Object.create(null), { base: new d({ isVoid: true }), meta: new d({ isVoid: true }), area: new d({ isVoid: true }), embed: new d({ isVoid: true }), link: new d({ isVoid: true }), img: new d({ isVoid: true }), input: new d({ isVoid: true }), param: new d({ isVoid: true }), hr: new d({ isVoid: true }), br: new d({ isVoid: true }), source: new d({ isVoid: true }), track: new d({ isVoid: true }), wbr: new d({ isVoid: true }), p: new d({ closedByChildren: ["address", "article", "aside", "blockquote", "div", "dl", "fieldset", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "main", "nav", "ol", "p", "pre", "section", "table", "ul"], closedByParent: true }), thead: new d({ closedByChildren: ["tbody", "tfoot"] }), tbody: new d({ closedByChildren: ["tbody", "tfoot"], closedByParent: true }), tfoot: new d({ closedByChildren: ["tbody"], closedByParent: true }), tr: new d({ closedByChildren: ["tr"], closedByParent: true }), td: new d({ closedByChildren: ["td", "th"], closedByParent: true }), th: new d({ closedByChildren: ["td", "th"], closedByParent: true }), col: new d({ isVoid: true }), svg: new d({ implicitNamespacePrefix: "svg" }), foreignObject: new d({ implicitNamespacePrefix: "svg", preventNamespaceInheritance: true }), math: new d({ implicitNamespacePrefix: "math" }), li: new d({ closedByChildren: ["li"], closedByParent: true }), dt: new d({ closedByChildren: ["dt", "dd"] }), dd: new d({ closedByChildren: ["dt", "dd"], closedByParent: true }), rb: new d({ closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true }), rt: new d({ closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true }), rtc: new d({ closedByChildren: ["rb", "rtc", "rp"], closedByParent: true }), rp: new d({ closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true }), optgroup: new d({ closedByChildren: ["optgroup"], closedByParent: true }), option: new d({ closedByChildren: ["option", "optgroup"], closedByParent: true }), pre: new d({ ignoreFirstLf: true }), listing: new d({ ignoreFirstLf: true }), style: new d({ contentType: N$1.RAW_TEXT }), script: new d({ contentType: N$1.RAW_TEXT }), title: new d({ contentType: { default: N$1.ESCAPABLE_RAW_TEXT, svg: N$1.PARSABLE_DATA } }), textarea: new d({ contentType: N$1.ESCAPABLE_RAW_TEXT, ignoreFirstLf: true }) }), new Ut$1().allKnownElementNames().forEach((e2) => {
    !pt$1[e2] && Me$1(e2) === null && (pt$1[e2] = new d({ canSelfClose: false }));
  })), pt$1[t8] ?? Ks;
}
var ae$1 = class ae {
  constructor(e2, r2) {
    this.sourceSpan = e2, this.i18n = r2;
  }
}, Wt$1 = class Wt extends ae$1 {
  constructor(e2, r2, n2, s2) {
    super(r2, s2), this.value = e2, this.tokens = n2, this.type = "text";
  }
  visit(e2, r2) {
    return e2.visitText(this, r2);
  }
}, Gt$1 = class Gt extends ae$1 {
  constructor(e2, r2, n2, s2) {
    super(r2, s2), this.value = e2, this.tokens = n2, this.type = "cdata";
  }
  visit(e2, r2) {
    return e2.visitCdata(this, r2);
  }
}, zt$1 = class zt extends ae$1 {
  constructor(e2, r2, n2, s2, i, a) {
    super(s2, a), this.switchValue = e2, this.type = r2, this.cases = n2, this.switchValueSourceSpan = i;
  }
  visit(e2, r2) {
    return e2.visitExpansion(this, r2);
  }
}, Yt$1 = class Yt {
  constructor(e2, r2, n2, s2, i) {
    this.value = e2, this.expression = r2, this.sourceSpan = n2, this.valueSourceSpan = s2, this.expSourceSpan = i, this.type = "expansionCase";
  }
  visit(e2, r2) {
    return e2.visitExpansionCase(this, r2);
  }
}, jt$1 = class jt extends ae$1 {
  constructor(e2, r2, n2, s2, i, a, o2) {
    super(n2, o2), this.name = e2, this.value = r2, this.keySpan = s2, this.valueSpan = i, this.valueTokens = a, this.type = "attribute";
  }
  visit(e2, r2) {
    return e2.visitAttribute(this, r2);
  }
  get nameSpan() {
    return this.keySpan;
  }
}, Y$1 = class Y extends ae$1 {
  constructor(e2, r2, n2, s2, i, a = null, o2 = null, u) {
    super(s2, u), this.name = e2, this.attrs = r2, this.children = n2, this.startSourceSpan = i, this.endSourceSpan = a, this.nameSpan = o2, this.type = "element";
  }
  visit(e2, r2) {
    return e2.visitElement(this, r2);
  }
}, Kt$1 = class Kt {
  constructor(e2, r2) {
    this.value = e2, this.sourceSpan = r2, this.type = "comment";
  }
  visit(e2, r2) {
    return e2.visitComment(this, r2);
  }
}, Xt$1 = class Xt {
  constructor(e2, r2) {
    this.value = e2, this.sourceSpan = r2, this.type = "docType";
  }
  visit(e2, r2) {
    return e2.visitDocType(this, r2);
  }
}, ee$1 = class ee extends ae$1 {
  constructor(e2, r2, n2, s2, i, a, o2 = null, u) {
    super(s2, u), this.name = e2, this.parameters = r2, this.children = n2, this.nameSpan = i, this.startSourceSpan = a, this.endSourceSpan = o2, this.type = "block";
  }
  visit(e2, r2) {
    return e2.visitBlock(this, r2);
  }
}, ht$1 = class ht {
  constructor(e2, r2) {
    this.expression = e2, this.sourceSpan = r2, this.type = "blockParameter", this.startSourceSpan = null, this.endSourceSpan = null;
  }
  visit(e2, r2) {
    return e2.visitBlockParameter(this, r2);
  }
}, mt$1 = class mt {
  constructor(e2, r2, n2, s2, i) {
    this.name = e2, this.value = r2, this.sourceSpan = n2, this.nameSpan = s2, this.valueSpan = i, this.type = "letDeclaration", this.startSourceSpan = null, this.endSourceSpan = null;
  }
  visit(e2, r2) {
    return e2.visitLetDeclaration(this, r2);
  }
};
function Qt$1(t8, e2, r2 = null) {
  let n2 = [], s2 = t8.visit ? (i) => t8.visit(i, r2) || i.visit(t8, r2) : (i) => i.visit(t8, r2);
  return e2.forEach((i) => {
    let a = s2(i);
    a && n2.push(a);
  }), n2;
}
var ft$1 = class ft {
  constructor() {
  }
  visitElement(e2, r2) {
    this.visitChildren(r2, (n2) => {
      n2(e2.attrs), n2(e2.children);
    });
  }
  visitAttribute(e2, r2) {
  }
  visitText(e2, r2) {
  }
  visitCdata(e2, r2) {
  }
  visitComment(e2, r2) {
  }
  visitDocType(e2, r2) {
  }
  visitExpansion(e2, r2) {
    return this.visitChildren(r2, (n2) => {
      n2(e2.cases);
    });
  }
  visitExpansionCase(e2, r2) {
  }
  visitBlock(e2, r2) {
    this.visitChildren(r2, (n2) => {
      n2(e2.parameters), n2(e2.children);
    });
  }
  visitBlockParameter(e2, r2) {
  }
  visitLetDeclaration(e2, r2) {
  }
  visitChildren(e2, r2) {
    let n2 = [], s2 = this;
    function i(a) {
      a && n2.push(Qt$1(s2, a, e2));
    }
    return r2(i), Array.prototype.concat.apply([], n2);
  }
};
var Ve$1 = { AElig: "Æ", AMP: "&", amp: "&", Aacute: "Á", Abreve: "Ă", Acirc: "Â", Acy: "А", Afr: "𝔄", Agrave: "À", Alpha: "Α", Amacr: "Ā", And: "⩓", Aogon: "Ą", Aopf: "𝔸", ApplyFunction: "⁡", af: "⁡", Aring: "Å", angst: "Å", Ascr: "𝒜", Assign: "≔", colone: "≔", coloneq: "≔", Atilde: "Ã", Auml: "Ä", Backslash: "∖", setminus: "∖", setmn: "∖", smallsetminus: "∖", ssetmn: "∖", Barv: "⫧", Barwed: "⌆", doublebarwedge: "⌆", Bcy: "Б", Because: "∵", becaus: "∵", because: "∵", Bernoullis: "ℬ", Bscr: "ℬ", bernou: "ℬ", Beta: "Β", Bfr: "𝔅", Bopf: "𝔹", Breve: "˘", breve: "˘", Bumpeq: "≎", HumpDownHump: "≎", bump: "≎", CHcy: "Ч", COPY: "©", copy: "©", Cacute: "Ć", Cap: "⋒", CapitalDifferentialD: "ⅅ", DD: "ⅅ", Cayleys: "ℭ", Cfr: "ℭ", Ccaron: "Č", Ccedil: "Ç", Ccirc: "Ĉ", Cconint: "∰", Cdot: "Ċ", Cedilla: "¸", cedil: "¸", CenterDot: "·", centerdot: "·", middot: "·", Chi: "Χ", CircleDot: "⊙", odot: "⊙", CircleMinus: "⊖", ominus: "⊖", CirclePlus: "⊕", oplus: "⊕", CircleTimes: "⊗", otimes: "⊗", ClockwiseContourIntegral: "∲", cwconint: "∲", CloseCurlyDoubleQuote: "”", rdquo: "”", rdquor: "”", CloseCurlyQuote: "’", rsquo: "’", rsquor: "’", Colon: "∷", Proportion: "∷", Colone: "⩴", Congruent: "≡", equiv: "≡", Conint: "∯", DoubleContourIntegral: "∯", ContourIntegral: "∮", conint: "∮", oint: "∮", Copf: "ℂ", complexes: "ℂ", Coproduct: "∐", coprod: "∐", CounterClockwiseContourIntegral: "∳", awconint: "∳", Cross: "⨯", Cscr: "𝒞", Cup: "⋓", CupCap: "≍", asympeq: "≍", DDotrahd: "⤑", DJcy: "Ђ", DScy: "Ѕ", DZcy: "Џ", Dagger: "‡", ddagger: "‡", Darr: "↡", Dashv: "⫤", DoubleLeftTee: "⫤", Dcaron: "Ď", Dcy: "Д", Del: "∇", nabla: "∇", Delta: "Δ", Dfr: "𝔇", DiacriticalAcute: "´", acute: "´", DiacriticalDot: "˙", dot: "˙", DiacriticalDoubleAcute: "˝", dblac: "˝", DiacriticalGrave: "`", grave: "`", DiacriticalTilde: "˜", tilde: "˜", Diamond: "⋄", diam: "⋄", diamond: "⋄", DifferentialD: "ⅆ", dd: "ⅆ", Dopf: "𝔻", Dot: "¨", DoubleDot: "¨", die: "¨", uml: "¨", DotDot: "⃜", DotEqual: "≐", doteq: "≐", esdot: "≐", DoubleDownArrow: "⇓", Downarrow: "⇓", dArr: "⇓", DoubleLeftArrow: "⇐", Leftarrow: "⇐", lArr: "⇐", DoubleLeftRightArrow: "⇔", Leftrightarrow: "⇔", hArr: "⇔", iff: "⇔", DoubleLongLeftArrow: "⟸", Longleftarrow: "⟸", xlArr: "⟸", DoubleLongLeftRightArrow: "⟺", Longleftrightarrow: "⟺", xhArr: "⟺", DoubleLongRightArrow: "⟹", Longrightarrow: "⟹", xrArr: "⟹", DoubleRightArrow: "⇒", Implies: "⇒", Rightarrow: "⇒", rArr: "⇒", DoubleRightTee: "⊨", vDash: "⊨", DoubleUpArrow: "⇑", Uparrow: "⇑", uArr: "⇑", DoubleUpDownArrow: "⇕", Updownarrow: "⇕", vArr: "⇕", DoubleVerticalBar: "∥", par: "∥", parallel: "∥", shortparallel: "∥", spar: "∥", DownArrow: "↓", ShortDownArrow: "↓", darr: "↓", downarrow: "↓", DownArrowBar: "⤓", DownArrowUpArrow: "⇵", duarr: "⇵", DownBreve: "̑", DownLeftRightVector: "⥐", DownLeftTeeVector: "⥞", DownLeftVector: "↽", leftharpoondown: "↽", lhard: "↽", DownLeftVectorBar: "⥖", DownRightTeeVector: "⥟", DownRightVector: "⇁", rhard: "⇁", rightharpoondown: "⇁", DownRightVectorBar: "⥗", DownTee: "⊤", top: "⊤", DownTeeArrow: "↧", mapstodown: "↧", Dscr: "𝒟", Dstrok: "Đ", ENG: "Ŋ", ETH: "Ð", Eacute: "É", Ecaron: "Ě", Ecirc: "Ê", Ecy: "Э", Edot: "Ė", Efr: "𝔈", Egrave: "È", Element: "∈", in: "∈", isin: "∈", isinv: "∈", Emacr: "Ē", EmptySmallSquare: "◻", EmptyVerySmallSquare: "▫", Eogon: "Ę", Eopf: "𝔼", Epsilon: "Ε", Equal: "⩵", EqualTilde: "≂", eqsim: "≂", esim: "≂", Equilibrium: "⇌", rightleftharpoons: "⇌", rlhar: "⇌", Escr: "ℰ", expectation: "ℰ", Esim: "⩳", Eta: "Η", Euml: "Ë", Exists: "∃", exist: "∃", ExponentialE: "ⅇ", ee: "ⅇ", exponentiale: "ⅇ", Fcy: "Ф", Ffr: "𝔉", FilledSmallSquare: "◼", FilledVerySmallSquare: "▪", blacksquare: "▪", squarf: "▪", squf: "▪", Fopf: "𝔽", ForAll: "∀", forall: "∀", Fouriertrf: "ℱ", Fscr: "ℱ", GJcy: "Ѓ", GT: ">", gt: ">", Gamma: "Γ", Gammad: "Ϝ", Gbreve: "Ğ", Gcedil: "Ģ", Gcirc: "Ĝ", Gcy: "Г", Gdot: "Ġ", Gfr: "𝔊", Gg: "⋙", ggg: "⋙", Gopf: "𝔾", GreaterEqual: "≥", ge: "≥", geq: "≥", GreaterEqualLess: "⋛", gel: "⋛", gtreqless: "⋛", GreaterFullEqual: "≧", gE: "≧", geqq: "≧", GreaterGreater: "⪢", GreaterLess: "≷", gl: "≷", gtrless: "≷", GreaterSlantEqual: "⩾", geqslant: "⩾", ges: "⩾", GreaterTilde: "≳", gsim: "≳", gtrsim: "≳", Gscr: "𝒢", Gt: "≫", NestedGreaterGreater: "≫", gg: "≫", HARDcy: "Ъ", Hacek: "ˇ", caron: "ˇ", Hat: "^", Hcirc: "Ĥ", Hfr: "ℌ", Poincareplane: "ℌ", HilbertSpace: "ℋ", Hscr: "ℋ", hamilt: "ℋ", Hopf: "ℍ", quaternions: "ℍ", HorizontalLine: "─", boxh: "─", Hstrok: "Ħ", HumpEqual: "≏", bumpe: "≏", bumpeq: "≏", IEcy: "Е", IJlig: "Ĳ", IOcy: "Ё", Iacute: "Í", Icirc: "Î", Icy: "И", Idot: "İ", Ifr: "ℑ", Im: "ℑ", image: "ℑ", imagpart: "ℑ", Igrave: "Ì", Imacr: "Ī", ImaginaryI: "ⅈ", ii: "ⅈ", Int: "∬", Integral: "∫", int: "∫", Intersection: "⋂", bigcap: "⋂", xcap: "⋂", InvisibleComma: "⁣", ic: "⁣", InvisibleTimes: "⁢", it: "⁢", Iogon: "Į", Iopf: "𝕀", Iota: "Ι", Iscr: "ℐ", imagline: "ℐ", Itilde: "Ĩ", Iukcy: "І", Iuml: "Ï", Jcirc: "Ĵ", Jcy: "Й", Jfr: "𝔍", Jopf: "𝕁", Jscr: "𝒥", Jsercy: "Ј", Jukcy: "Є", KHcy: "Х", KJcy: "Ќ", Kappa: "Κ", Kcedil: "Ķ", Kcy: "К", Kfr: "𝔎", Kopf: "𝕂", Kscr: "𝒦", LJcy: "Љ", LT: "<", lt: "<", Lacute: "Ĺ", Lambda: "Λ", Lang: "⟪", Laplacetrf: "ℒ", Lscr: "ℒ", lagran: "ℒ", Larr: "↞", twoheadleftarrow: "↞", Lcaron: "Ľ", Lcedil: "Ļ", Lcy: "Л", LeftAngleBracket: "⟨", lang: "⟨", langle: "⟨", LeftArrow: "←", ShortLeftArrow: "←", larr: "←", leftarrow: "←", slarr: "←", LeftArrowBar: "⇤", larrb: "⇤", LeftArrowRightArrow: "⇆", leftrightarrows: "⇆", lrarr: "⇆", LeftCeiling: "⌈", lceil: "⌈", LeftDoubleBracket: "⟦", lobrk: "⟦", LeftDownTeeVector: "⥡", LeftDownVector: "⇃", dharl: "⇃", downharpoonleft: "⇃", LeftDownVectorBar: "⥙", LeftFloor: "⌊", lfloor: "⌊", LeftRightArrow: "↔", harr: "↔", leftrightarrow: "↔", LeftRightVector: "⥎", LeftTee: "⊣", dashv: "⊣", LeftTeeArrow: "↤", mapstoleft: "↤", LeftTeeVector: "⥚", LeftTriangle: "⊲", vartriangleleft: "⊲", vltri: "⊲", LeftTriangleBar: "⧏", LeftTriangleEqual: "⊴", ltrie: "⊴", trianglelefteq: "⊴", LeftUpDownVector: "⥑", LeftUpTeeVector: "⥠", LeftUpVector: "↿", uharl: "↿", upharpoonleft: "↿", LeftUpVectorBar: "⥘", LeftVector: "↼", leftharpoonup: "↼", lharu: "↼", LeftVectorBar: "⥒", LessEqualGreater: "⋚", leg: "⋚", lesseqgtr: "⋚", LessFullEqual: "≦", lE: "≦", leqq: "≦", LessGreater: "≶", lessgtr: "≶", lg: "≶", LessLess: "⪡", LessSlantEqual: "⩽", leqslant: "⩽", les: "⩽", LessTilde: "≲", lesssim: "≲", lsim: "≲", Lfr: "𝔏", Ll: "⋘", Lleftarrow: "⇚", lAarr: "⇚", Lmidot: "Ŀ", LongLeftArrow: "⟵", longleftarrow: "⟵", xlarr: "⟵", LongLeftRightArrow: "⟷", longleftrightarrow: "⟷", xharr: "⟷", LongRightArrow: "⟶", longrightarrow: "⟶", xrarr: "⟶", Lopf: "𝕃", LowerLeftArrow: "↙", swarr: "↙", swarrow: "↙", LowerRightArrow: "↘", searr: "↘", searrow: "↘", Lsh: "↰", lsh: "↰", Lstrok: "Ł", Lt: "≪", NestedLessLess: "≪", ll: "≪", Map: "⤅", Mcy: "М", MediumSpace: " ", Mellintrf: "ℳ", Mscr: "ℳ", phmmat: "ℳ", Mfr: "𝔐", MinusPlus: "∓", mnplus: "∓", mp: "∓", Mopf: "𝕄", Mu: "Μ", NJcy: "Њ", Nacute: "Ń", Ncaron: "Ň", Ncedil: "Ņ", Ncy: "Н", NegativeMediumSpace: "​", NegativeThickSpace: "​", NegativeThinSpace: "​", NegativeVeryThinSpace: "​", ZeroWidthSpace: "​", NewLine: `
`, Nfr: "𝔑", NoBreak: "⁠", NonBreakingSpace: " ", nbsp: " ", Nopf: "ℕ", naturals: "ℕ", Not: "⫬", NotCongruent: "≢", nequiv: "≢", NotCupCap: "≭", NotDoubleVerticalBar: "∦", npar: "∦", nparallel: "∦", nshortparallel: "∦", nspar: "∦", NotElement: "∉", notin: "∉", notinva: "∉", NotEqual: "≠", ne: "≠", NotEqualTilde: "≂̸", nesim: "≂̸", NotExists: "∄", nexist: "∄", nexists: "∄", NotGreater: "≯", ngt: "≯", ngtr: "≯", NotGreaterEqual: "≱", nge: "≱", ngeq: "≱", NotGreaterFullEqual: "≧̸", ngE: "≧̸", ngeqq: "≧̸", NotGreaterGreater: "≫̸", nGtv: "≫̸", NotGreaterLess: "≹", ntgl: "≹", NotGreaterSlantEqual: "⩾̸", ngeqslant: "⩾̸", nges: "⩾̸", NotGreaterTilde: "≵", ngsim: "≵", NotHumpDownHump: "≎̸", nbump: "≎̸", NotHumpEqual: "≏̸", nbumpe: "≏̸", NotLeftTriangle: "⋪", nltri: "⋪", ntriangleleft: "⋪", NotLeftTriangleBar: "⧏̸", NotLeftTriangleEqual: "⋬", nltrie: "⋬", ntrianglelefteq: "⋬", NotLess: "≮", nless: "≮", nlt: "≮", NotLessEqual: "≰", nle: "≰", nleq: "≰", NotLessGreater: "≸", ntlg: "≸", NotLessLess: "≪̸", nLtv: "≪̸", NotLessSlantEqual: "⩽̸", nleqslant: "⩽̸", nles: "⩽̸", NotLessTilde: "≴", nlsim: "≴", NotNestedGreaterGreater: "⪢̸", NotNestedLessLess: "⪡̸", NotPrecedes: "⊀", npr: "⊀", nprec: "⊀", NotPrecedesEqual: "⪯̸", npre: "⪯̸", npreceq: "⪯̸", NotPrecedesSlantEqual: "⋠", nprcue: "⋠", NotReverseElement: "∌", notni: "∌", notniva: "∌", NotRightTriangle: "⋫", nrtri: "⋫", ntriangleright: "⋫", NotRightTriangleBar: "⧐̸", NotRightTriangleEqual: "⋭", nrtrie: "⋭", ntrianglerighteq: "⋭", NotSquareSubset: "⊏̸", NotSquareSubsetEqual: "⋢", nsqsube: "⋢", NotSquareSuperset: "⊐̸", NotSquareSupersetEqual: "⋣", nsqsupe: "⋣", NotSubset: "⊂⃒", nsubset: "⊂⃒", vnsub: "⊂⃒", NotSubsetEqual: "⊈", nsube: "⊈", nsubseteq: "⊈", NotSucceeds: "⊁", nsc: "⊁", nsucc: "⊁", NotSucceedsEqual: "⪰̸", nsce: "⪰̸", nsucceq: "⪰̸", NotSucceedsSlantEqual: "⋡", nsccue: "⋡", NotSucceedsTilde: "≿̸", NotSuperset: "⊃⃒", nsupset: "⊃⃒", vnsup: "⊃⃒", NotSupersetEqual: "⊉", nsupe: "⊉", nsupseteq: "⊉", NotTilde: "≁", nsim: "≁", NotTildeEqual: "≄", nsime: "≄", nsimeq: "≄", NotTildeFullEqual: "≇", ncong: "≇", NotTildeTilde: "≉", nap: "≉", napprox: "≉", NotVerticalBar: "∤", nmid: "∤", nshortmid: "∤", nsmid: "∤", Nscr: "𝒩", Ntilde: "Ñ", Nu: "Ν", OElig: "Œ", Oacute: "Ó", Ocirc: "Ô", Ocy: "О", Odblac: "Ő", Ofr: "𝔒", Ograve: "Ò", Omacr: "Ō", Omega: "Ω", ohm: "Ω", Omicron: "Ο", Oopf: "𝕆", OpenCurlyDoubleQuote: "“", ldquo: "“", OpenCurlyQuote: "‘", lsquo: "‘", Or: "⩔", Oscr: "𝒪", Oslash: "Ø", Otilde: "Õ", Otimes: "⨷", Ouml: "Ö", OverBar: "‾", oline: "‾", OverBrace: "⏞", OverBracket: "⎴", tbrk: "⎴", OverParenthesis: "⏜", PartialD: "∂", part: "∂", Pcy: "П", Pfr: "𝔓", Phi: "Φ", Pi: "Π", PlusMinus: "±", plusmn: "±", pm: "±", Popf: "ℙ", primes: "ℙ", Pr: "⪻", Precedes: "≺", pr: "≺", prec: "≺", PrecedesEqual: "⪯", pre: "⪯", preceq: "⪯", PrecedesSlantEqual: "≼", prcue: "≼", preccurlyeq: "≼", PrecedesTilde: "≾", precsim: "≾", prsim: "≾", Prime: "″", Product: "∏", prod: "∏", Proportional: "∝", prop: "∝", propto: "∝", varpropto: "∝", vprop: "∝", Pscr: "𝒫", Psi: "Ψ", QUOT: '"', quot: '"', Qfr: "𝔔", Qopf: "ℚ", rationals: "ℚ", Qscr: "𝒬", RBarr: "⤐", drbkarow: "⤐", REG: "®", circledR: "®", reg: "®", Racute: "Ŕ", Rang: "⟫", Rarr: "↠", twoheadrightarrow: "↠", Rarrtl: "⤖", Rcaron: "Ř", Rcedil: "Ŗ", Rcy: "Р", Re: "ℜ", Rfr: "ℜ", real: "ℜ", realpart: "ℜ", ReverseElement: "∋", SuchThat: "∋", ni: "∋", niv: "∋", ReverseEquilibrium: "⇋", leftrightharpoons: "⇋", lrhar: "⇋", ReverseUpEquilibrium: "⥯", duhar: "⥯", Rho: "Ρ", RightAngleBracket: "⟩", rang: "⟩", rangle: "⟩", RightArrow: "→", ShortRightArrow: "→", rarr: "→", rightarrow: "→", srarr: "→", RightArrowBar: "⇥", rarrb: "⇥", RightArrowLeftArrow: "⇄", rightleftarrows: "⇄", rlarr: "⇄", RightCeiling: "⌉", rceil: "⌉", RightDoubleBracket: "⟧", robrk: "⟧", RightDownTeeVector: "⥝", RightDownVector: "⇂", dharr: "⇂", downharpoonright: "⇂", RightDownVectorBar: "⥕", RightFloor: "⌋", rfloor: "⌋", RightTee: "⊢", vdash: "⊢", RightTeeArrow: "↦", map: "↦", mapsto: "↦", RightTeeVector: "⥛", RightTriangle: "⊳", vartriangleright: "⊳", vrtri: "⊳", RightTriangleBar: "⧐", RightTriangleEqual: "⊵", rtrie: "⊵", trianglerighteq: "⊵", RightUpDownVector: "⥏", RightUpTeeVector: "⥜", RightUpVector: "↾", uharr: "↾", upharpoonright: "↾", RightUpVectorBar: "⥔", RightVector: "⇀", rharu: "⇀", rightharpoonup: "⇀", RightVectorBar: "⥓", Ropf: "ℝ", reals: "ℝ", RoundImplies: "⥰", Rrightarrow: "⇛", rAarr: "⇛", Rscr: "ℛ", realine: "ℛ", Rsh: "↱", rsh: "↱", RuleDelayed: "⧴", SHCHcy: "Щ", SHcy: "Ш", SOFTcy: "Ь", Sacute: "Ś", Sc: "⪼", Scaron: "Š", Scedil: "Ş", Scirc: "Ŝ", Scy: "С", Sfr: "𝔖", ShortUpArrow: "↑", UpArrow: "↑", uarr: "↑", uparrow: "↑", Sigma: "Σ", SmallCircle: "∘", compfn: "∘", Sopf: "𝕊", Sqrt: "√", radic: "√", Square: "□", squ: "□", square: "□", SquareIntersection: "⊓", sqcap: "⊓", SquareSubset: "⊏", sqsub: "⊏", sqsubset: "⊏", SquareSubsetEqual: "⊑", sqsube: "⊑", sqsubseteq: "⊑", SquareSuperset: "⊐", sqsup: "⊐", sqsupset: "⊐", SquareSupersetEqual: "⊒", sqsupe: "⊒", sqsupseteq: "⊒", SquareUnion: "⊔", sqcup: "⊔", Sscr: "𝒮", Star: "⋆", sstarf: "⋆", Sub: "⋐", Subset: "⋐", SubsetEqual: "⊆", sube: "⊆", subseteq: "⊆", Succeeds: "≻", sc: "≻", succ: "≻", SucceedsEqual: "⪰", sce: "⪰", succeq: "⪰", SucceedsSlantEqual: "≽", sccue: "≽", succcurlyeq: "≽", SucceedsTilde: "≿", scsim: "≿", succsim: "≿", Sum: "∑", sum: "∑", Sup: "⋑", Supset: "⋑", Superset: "⊃", sup: "⊃", supset: "⊃", SupersetEqual: "⊇", supe: "⊇", supseteq: "⊇", THORN: "Þ", TRADE: "™", trade: "™", TSHcy: "Ћ", TScy: "Ц", Tab: "	", Tau: "Τ", Tcaron: "Ť", Tcedil: "Ţ", Tcy: "Т", Tfr: "𝔗", Therefore: "∴", there4: "∴", therefore: "∴", Theta: "Θ", ThickSpace: "  ", ThinSpace: " ", thinsp: " ", Tilde: "∼", sim: "∼", thicksim: "∼", thksim: "∼", TildeEqual: "≃", sime: "≃", simeq: "≃", TildeFullEqual: "≅", cong: "≅", TildeTilde: "≈", ap: "≈", approx: "≈", asymp: "≈", thickapprox: "≈", thkap: "≈", Topf: "𝕋", TripleDot: "⃛", tdot: "⃛", Tscr: "𝒯", Tstrok: "Ŧ", Uacute: "Ú", Uarr: "↟", Uarrocir: "⥉", Ubrcy: "Ў", Ubreve: "Ŭ", Ucirc: "Û", Ucy: "У", Udblac: "Ű", Ufr: "𝔘", Ugrave: "Ù", Umacr: "Ū", UnderBar: "_", lowbar: "_", UnderBrace: "⏟", UnderBracket: "⎵", bbrk: "⎵", UnderParenthesis: "⏝", Union: "⋃", bigcup: "⋃", xcup: "⋃", UnionPlus: "⊎", uplus: "⊎", Uogon: "Ų", Uopf: "𝕌", UpArrowBar: "⤒", UpArrowDownArrow: "⇅", udarr: "⇅", UpDownArrow: "↕", updownarrow: "↕", varr: "↕", UpEquilibrium: "⥮", udhar: "⥮", UpTee: "⊥", bot: "⊥", bottom: "⊥", perp: "⊥", UpTeeArrow: "↥", mapstoup: "↥", UpperLeftArrow: "↖", nwarr: "↖", nwarrow: "↖", UpperRightArrow: "↗", nearr: "↗", nearrow: "↗", Upsi: "ϒ", upsih: "ϒ", Upsilon: "Υ", Uring: "Ů", Uscr: "𝒰", Utilde: "Ũ", Uuml: "Ü", VDash: "⊫", Vbar: "⫫", Vcy: "В", Vdash: "⊩", Vdashl: "⫦", Vee: "⋁", bigvee: "⋁", xvee: "⋁", Verbar: "‖", Vert: "‖", VerticalBar: "∣", mid: "∣", shortmid: "∣", smid: "∣", VerticalLine: "|", verbar: "|", vert: "|", VerticalSeparator: "❘", VerticalTilde: "≀", wr: "≀", wreath: "≀", VeryThinSpace: " ", hairsp: " ", Vfr: "𝔙", Vopf: "𝕍", Vscr: "𝒱", Vvdash: "⊪", Wcirc: "Ŵ", Wedge: "⋀", bigwedge: "⋀", xwedge: "⋀", Wfr: "𝔚", Wopf: "𝕎", Wscr: "𝒲", Xfr: "𝔛", Xi: "Ξ", Xopf: "𝕏", Xscr: "𝒳", YAcy: "Я", YIcy: "Ї", YUcy: "Ю", Yacute: "Ý", Ycirc: "Ŷ", Ycy: "Ы", Yfr: "𝔜", Yopf: "𝕐", Yscr: "𝒴", Yuml: "Ÿ", ZHcy: "Ж", Zacute: "Ź", Zcaron: "Ž", Zcy: "З", Zdot: "Ż", Zeta: "Ζ", Zfr: "ℨ", zeetrf: "ℨ", Zopf: "ℤ", integers: "ℤ", Zscr: "𝒵", aacute: "á", abreve: "ă", ac: "∾", mstpos: "∾", acE: "∾̳", acd: "∿", acirc: "â", acy: "а", aelig: "æ", afr: "𝔞", agrave: "à", alefsym: "ℵ", aleph: "ℵ", alpha: "α", amacr: "ā", amalg: "⨿", and: "∧", wedge: "∧", andand: "⩕", andd: "⩜", andslope: "⩘", andv: "⩚", ang: "∠", angle: "∠", ange: "⦤", angmsd: "∡", measuredangle: "∡", angmsdaa: "⦨", angmsdab: "⦩", angmsdac: "⦪", angmsdad: "⦫", angmsdae: "⦬", angmsdaf: "⦭", angmsdag: "⦮", angmsdah: "⦯", angrt: "∟", angrtvb: "⊾", angrtvbd: "⦝", angsph: "∢", angzarr: "⍼", aogon: "ą", aopf: "𝕒", apE: "⩰", apacir: "⩯", ape: "≊", approxeq: "≊", apid: "≋", apos: "'", aring: "å", ascr: "𝒶", ast: "*", midast: "*", atilde: "ã", auml: "ä", awint: "⨑", bNot: "⫭", backcong: "≌", bcong: "≌", backepsilon: "϶", bepsi: "϶", backprime: "‵", bprime: "‵", backsim: "∽", bsim: "∽", backsimeq: "⋍", bsime: "⋍", barvee: "⊽", barwed: "⌅", barwedge: "⌅", bbrktbrk: "⎶", bcy: "б", bdquo: "„", ldquor: "„", bemptyv: "⦰", beta: "β", beth: "ℶ", between: "≬", twixt: "≬", bfr: "𝔟", bigcirc: "◯", xcirc: "◯", bigodot: "⨀", xodot: "⨀", bigoplus: "⨁", xoplus: "⨁", bigotimes: "⨂", xotime: "⨂", bigsqcup: "⨆", xsqcup: "⨆", bigstar: "★", starf: "★", bigtriangledown: "▽", xdtri: "▽", bigtriangleup: "△", xutri: "△", biguplus: "⨄", xuplus: "⨄", bkarow: "⤍", rbarr: "⤍", blacklozenge: "⧫", lozf: "⧫", blacktriangle: "▴", utrif: "▴", blacktriangledown: "▾", dtrif: "▾", blacktriangleleft: "◂", ltrif: "◂", blacktriangleright: "▸", rtrif: "▸", blank: "␣", blk12: "▒", blk14: "░", blk34: "▓", block: "█", bne: "=⃥", bnequiv: "≡⃥", bnot: "⌐", bopf: "𝕓", bowtie: "⋈", boxDL: "╗", boxDR: "╔", boxDl: "╖", boxDr: "╓", boxH: "═", boxHD: "╦", boxHU: "╩", boxHd: "╤", boxHu: "╧", boxUL: "╝", boxUR: "╚", boxUl: "╜", boxUr: "╙", boxV: "║", boxVH: "╬", boxVL: "╣", boxVR: "╠", boxVh: "╫", boxVl: "╢", boxVr: "╟", boxbox: "⧉", boxdL: "╕", boxdR: "╒", boxdl: "┐", boxdr: "┌", boxhD: "╥", boxhU: "╨", boxhd: "┬", boxhu: "┴", boxminus: "⊟", minusb: "⊟", boxplus: "⊞", plusb: "⊞", boxtimes: "⊠", timesb: "⊠", boxuL: "╛", boxuR: "╘", boxul: "┘", boxur: "└", boxv: "│", boxvH: "╪", boxvL: "╡", boxvR: "╞", boxvh: "┼", boxvl: "┤", boxvr: "├", brvbar: "¦", bscr: "𝒷", bsemi: "⁏", bsol: "\\", bsolb: "⧅", bsolhsub: "⟈", bull: "•", bullet: "•", bumpE: "⪮", cacute: "ć", cap: "∩", capand: "⩄", capbrcup: "⩉", capcap: "⩋", capcup: "⩇", capdot: "⩀", caps: "∩︀", caret: "⁁", ccaps: "⩍", ccaron: "č", ccedil: "ç", ccirc: "ĉ", ccups: "⩌", ccupssm: "⩐", cdot: "ċ", cemptyv: "⦲", cent: "¢", cfr: "𝔠", chcy: "ч", check: "✓", checkmark: "✓", chi: "χ", cir: "○", cirE: "⧃", circ: "ˆ", circeq: "≗", cire: "≗", circlearrowleft: "↺", olarr: "↺", circlearrowright: "↻", orarr: "↻", circledS: "Ⓢ", oS: "Ⓢ", circledast: "⊛", oast: "⊛", circledcirc: "⊚", ocir: "⊚", circleddash: "⊝", odash: "⊝", cirfnint: "⨐", cirmid: "⫯", cirscir: "⧂", clubs: "♣", clubsuit: "♣", colon: ":", comma: ",", commat: "@", comp: "∁", complement: "∁", congdot: "⩭", copf: "𝕔", copysr: "℗", crarr: "↵", cross: "✗", cscr: "𝒸", csub: "⫏", csube: "⫑", csup: "⫐", csupe: "⫒", ctdot: "⋯", cudarrl: "⤸", cudarrr: "⤵", cuepr: "⋞", curlyeqprec: "⋞", cuesc: "⋟", curlyeqsucc: "⋟", cularr: "↶", curvearrowleft: "↶", cularrp: "⤽", cup: "∪", cupbrcap: "⩈", cupcap: "⩆", cupcup: "⩊", cupdot: "⊍", cupor: "⩅", cups: "∪︀", curarr: "↷", curvearrowright: "↷", curarrm: "⤼", curlyvee: "⋎", cuvee: "⋎", curlywedge: "⋏", cuwed: "⋏", curren: "¤", cwint: "∱", cylcty: "⌭", dHar: "⥥", dagger: "†", daleth: "ℸ", dash: "‐", hyphen: "‐", dbkarow: "⤏", rBarr: "⤏", dcaron: "ď", dcy: "д", ddarr: "⇊", downdownarrows: "⇊", ddotseq: "⩷", eDDot: "⩷", deg: "°", delta: "δ", demptyv: "⦱", dfisht: "⥿", dfr: "𝔡", diamondsuit: "♦", diams: "♦", digamma: "ϝ", gammad: "ϝ", disin: "⋲", div: "÷", divide: "÷", divideontimes: "⋇", divonx: "⋇", djcy: "ђ", dlcorn: "⌞", llcorner: "⌞", dlcrop: "⌍", dollar: "$", dopf: "𝕕", doteqdot: "≑", eDot: "≑", dotminus: "∸", minusd: "∸", dotplus: "∔", plusdo: "∔", dotsquare: "⊡", sdotb: "⊡", drcorn: "⌟", lrcorner: "⌟", drcrop: "⌌", dscr: "𝒹", dscy: "ѕ", dsol: "⧶", dstrok: "đ", dtdot: "⋱", dtri: "▿", triangledown: "▿", dwangle: "⦦", dzcy: "џ", dzigrarr: "⟿", eacute: "é", easter: "⩮", ecaron: "ě", ecir: "≖", eqcirc: "≖", ecirc: "ê", ecolon: "≕", eqcolon: "≕", ecy: "э", edot: "ė", efDot: "≒", fallingdotseq: "≒", efr: "𝔢", eg: "⪚", egrave: "è", egs: "⪖", eqslantgtr: "⪖", egsdot: "⪘", el: "⪙", elinters: "⏧", ell: "ℓ", els: "⪕", eqslantless: "⪕", elsdot: "⪗", emacr: "ē", empty: "∅", emptyset: "∅", emptyv: "∅", varnothing: "∅", emsp13: " ", emsp14: " ", emsp: " ", eng: "ŋ", ensp: " ", eogon: "ę", eopf: "𝕖", epar: "⋕", eparsl: "⧣", eplus: "⩱", epsi: "ε", epsilon: "ε", epsiv: "ϵ", straightepsilon: "ϵ", varepsilon: "ϵ", equals: "=", equest: "≟", questeq: "≟", equivDD: "⩸", eqvparsl: "⧥", erDot: "≓", risingdotseq: "≓", erarr: "⥱", escr: "ℯ", eta: "η", eth: "ð", euml: "ë", euro: "€", excl: "!", fcy: "ф", female: "♀", ffilig: "ﬃ", fflig: "ﬀ", ffllig: "ﬄ", ffr: "𝔣", filig: "ﬁ", fjlig: "fj", flat: "♭", fllig: "ﬂ", fltns: "▱", fnof: "ƒ", fopf: "𝕗", fork: "⋔", pitchfork: "⋔", forkv: "⫙", fpartint: "⨍", frac12: "½", half: "½", frac13: "⅓", frac14: "¼", frac15: "⅕", frac16: "⅙", frac18: "⅛", frac23: "⅔", frac25: "⅖", frac34: "¾", frac35: "⅗", frac38: "⅜", frac45: "⅘", frac56: "⅚", frac58: "⅝", frac78: "⅞", frasl: "⁄", frown: "⌢", sfrown: "⌢", fscr: "𝒻", gEl: "⪌", gtreqqless: "⪌", gacute: "ǵ", gamma: "γ", gap: "⪆", gtrapprox: "⪆", gbreve: "ğ", gcirc: "ĝ", gcy: "г", gdot: "ġ", gescc: "⪩", gesdot: "⪀", gesdoto: "⪂", gesdotol: "⪄", gesl: "⋛︀", gesles: "⪔", gfr: "𝔤", gimel: "ℷ", gjcy: "ѓ", glE: "⪒", gla: "⪥", glj: "⪤", gnE: "≩", gneqq: "≩", gnap: "⪊", gnapprox: "⪊", gne: "⪈", gneq: "⪈", gnsim: "⋧", gopf: "𝕘", gscr: "ℊ", gsime: "⪎", gsiml: "⪐", gtcc: "⪧", gtcir: "⩺", gtdot: "⋗", gtrdot: "⋗", gtlPar: "⦕", gtquest: "⩼", gtrarr: "⥸", gvertneqq: "≩︀", gvnE: "≩︀", hardcy: "ъ", harrcir: "⥈", harrw: "↭", leftrightsquigarrow: "↭", hbar: "ℏ", hslash: "ℏ", planck: "ℏ", plankv: "ℏ", hcirc: "ĥ", hearts: "♥", heartsuit: "♥", hellip: "…", mldr: "…", hercon: "⊹", hfr: "𝔥", hksearow: "⤥", searhk: "⤥", hkswarow: "⤦", swarhk: "⤦", hoarr: "⇿", homtht: "∻", hookleftarrow: "↩", larrhk: "↩", hookrightarrow: "↪", rarrhk: "↪", hopf: "𝕙", horbar: "―", hscr: "𝒽", hstrok: "ħ", hybull: "⁃", iacute: "í", icirc: "î", icy: "и", iecy: "е", iexcl: "¡", ifr: "𝔦", igrave: "ì", iiiint: "⨌", qint: "⨌", iiint: "∭", tint: "∭", iinfin: "⧜", iiota: "℩", ijlig: "ĳ", imacr: "ī", imath: "ı", inodot: "ı", imof: "⊷", imped: "Ƶ", incare: "℅", infin: "∞", infintie: "⧝", intcal: "⊺", intercal: "⊺", intlarhk: "⨗", intprod: "⨼", iprod: "⨼", iocy: "ё", iogon: "į", iopf: "𝕚", iota: "ι", iquest: "¿", iscr: "𝒾", isinE: "⋹", isindot: "⋵", isins: "⋴", isinsv: "⋳", itilde: "ĩ", iukcy: "і", iuml: "ï", jcirc: "ĵ", jcy: "й", jfr: "𝔧", jmath: "ȷ", jopf: "𝕛", jscr: "𝒿", jsercy: "ј", jukcy: "є", kappa: "κ", kappav: "ϰ", varkappa: "ϰ", kcedil: "ķ", kcy: "к", kfr: "𝔨", kgreen: "ĸ", khcy: "х", kjcy: "ќ", kopf: "𝕜", kscr: "𝓀", lAtail: "⤛", lBarr: "⤎", lEg: "⪋", lesseqqgtr: "⪋", lHar: "⥢", lacute: "ĺ", laemptyv: "⦴", lambda: "λ", langd: "⦑", lap: "⪅", lessapprox: "⪅", laquo: "«", larrbfs: "⤟", larrfs: "⤝", larrlp: "↫", looparrowleft: "↫", larrpl: "⤹", larrsim: "⥳", larrtl: "↢", leftarrowtail: "↢", lat: "⪫", latail: "⤙", late: "⪭", lates: "⪭︀", lbarr: "⤌", lbbrk: "❲", lbrace: "{", lcub: "{", lbrack: "[", lsqb: "[", lbrke: "⦋", lbrksld: "⦏", lbrkslu: "⦍", lcaron: "ľ", lcedil: "ļ", lcy: "л", ldca: "⤶", ldrdhar: "⥧", ldrushar: "⥋", ldsh: "↲", le: "≤", leq: "≤", leftleftarrows: "⇇", llarr: "⇇", leftthreetimes: "⋋", lthree: "⋋", lescc: "⪨", lesdot: "⩿", lesdoto: "⪁", lesdotor: "⪃", lesg: "⋚︀", lesges: "⪓", lessdot: "⋖", ltdot: "⋖", lfisht: "⥼", lfr: "𝔩", lgE: "⪑", lharul: "⥪", lhblk: "▄", ljcy: "љ", llhard: "⥫", lltri: "◺", lmidot: "ŀ", lmoust: "⎰", lmoustache: "⎰", lnE: "≨", lneqq: "≨", lnap: "⪉", lnapprox: "⪉", lne: "⪇", lneq: "⪇", lnsim: "⋦", loang: "⟬", loarr: "⇽", longmapsto: "⟼", xmap: "⟼", looparrowright: "↬", rarrlp: "↬", lopar: "⦅", lopf: "𝕝", loplus: "⨭", lotimes: "⨴", lowast: "∗", loz: "◊", lozenge: "◊", lpar: "(", lparlt: "⦓", lrhard: "⥭", lrm: "‎", lrtri: "⊿", lsaquo: "‹", lscr: "𝓁", lsime: "⪍", lsimg: "⪏", lsquor: "‚", sbquo: "‚", lstrok: "ł", ltcc: "⪦", ltcir: "⩹", ltimes: "⋉", ltlarr: "⥶", ltquest: "⩻", ltrPar: "⦖", ltri: "◃", triangleleft: "◃", lurdshar: "⥊", luruhar: "⥦", lvertneqq: "≨︀", lvnE: "≨︀", mDDot: "∺", macr: "¯", strns: "¯", male: "♂", malt: "✠", maltese: "✠", marker: "▮", mcomma: "⨩", mcy: "м", mdash: "—", mfr: "𝔪", mho: "℧", micro: "µ", midcir: "⫰", minus: "−", minusdu: "⨪", mlcp: "⫛", models: "⊧", mopf: "𝕞", mscr: "𝓂", mu: "μ", multimap: "⊸", mumap: "⊸", nGg: "⋙̸", nGt: "≫⃒", nLeftarrow: "⇍", nlArr: "⇍", nLeftrightarrow: "⇎", nhArr: "⇎", nLl: "⋘̸", nLt: "≪⃒", nRightarrow: "⇏", nrArr: "⇏", nVDash: "⊯", nVdash: "⊮", nacute: "ń", nang: "∠⃒", napE: "⩰̸", napid: "≋̸", napos: "ŉ", natur: "♮", natural: "♮", ncap: "⩃", ncaron: "ň", ncedil: "ņ", ncongdot: "⩭̸", ncup: "⩂", ncy: "н", ndash: "–", neArr: "⇗", nearhk: "⤤", nedot: "≐̸", nesear: "⤨", toea: "⤨", nfr: "𝔫", nharr: "↮", nleftrightarrow: "↮", nhpar: "⫲", nis: "⋼", nisd: "⋺", njcy: "њ", nlE: "≦̸", nleqq: "≦̸", nlarr: "↚", nleftarrow: "↚", nldr: "‥", nopf: "𝕟", not: "¬", notinE: "⋹̸", notindot: "⋵̸", notinvb: "⋷", notinvc: "⋶", notnivb: "⋾", notnivc: "⋽", nparsl: "⫽⃥", npart: "∂̸", npolint: "⨔", nrarr: "↛", nrightarrow: "↛", nrarrc: "⤳̸", nrarrw: "↝̸", nscr: "𝓃", nsub: "⊄", nsubE: "⫅̸", nsubseteqq: "⫅̸", nsup: "⊅", nsupE: "⫆̸", nsupseteqq: "⫆̸", ntilde: "ñ", nu: "ν", num: "#", numero: "№", numsp: " ", nvDash: "⊭", nvHarr: "⤄", nvap: "≍⃒", nvdash: "⊬", nvge: "≥⃒", nvgt: ">⃒", nvinfin: "⧞", nvlArr: "⤂", nvle: "≤⃒", nvlt: "<⃒", nvltrie: "⊴⃒", nvrArr: "⤃", nvrtrie: "⊵⃒", nvsim: "∼⃒", nwArr: "⇖", nwarhk: "⤣", nwnear: "⤧", oacute: "ó", ocirc: "ô", ocy: "о", odblac: "ő", odiv: "⨸", odsold: "⦼", oelig: "œ", ofcir: "⦿", ofr: "𝔬", ogon: "˛", ograve: "ò", ogt: "⧁", ohbar: "⦵", olcir: "⦾", olcross: "⦻", olt: "⧀", omacr: "ō", omega: "ω", omicron: "ο", omid: "⦶", oopf: "𝕠", opar: "⦷", operp: "⦹", or: "∨", vee: "∨", ord: "⩝", order: "ℴ", orderof: "ℴ", oscr: "ℴ", ordf: "ª", ordm: "º", origof: "⊶", oror: "⩖", orslope: "⩗", orv: "⩛", oslash: "ø", osol: "⊘", otilde: "õ", otimesas: "⨶", ouml: "ö", ovbar: "⌽", para: "¶", parsim: "⫳", parsl: "⫽", pcy: "п", percnt: "%", period: ".", permil: "‰", pertenk: "‱", pfr: "𝔭", phi: "φ", phiv: "ϕ", straightphi: "ϕ", varphi: "ϕ", phone: "☎", pi: "π", piv: "ϖ", varpi: "ϖ", planckh: "ℎ", plus: "+", plusacir: "⨣", pluscir: "⨢", plusdu: "⨥", pluse: "⩲", plussim: "⨦", plustwo: "⨧", pointint: "⨕", popf: "𝕡", pound: "£", prE: "⪳", prap: "⪷", precapprox: "⪷", precnapprox: "⪹", prnap: "⪹", precneqq: "⪵", prnE: "⪵", precnsim: "⋨", prnsim: "⋨", prime: "′", profalar: "⌮", profline: "⌒", profsurf: "⌓", prurel: "⊰", pscr: "𝓅", psi: "ψ", puncsp: " ", qfr: "𝔮", qopf: "𝕢", qprime: "⁗", qscr: "𝓆", quatint: "⨖", quest: "?", rAtail: "⤜", rHar: "⥤", race: "∽̱", racute: "ŕ", raemptyv: "⦳", rangd: "⦒", range: "⦥", raquo: "»", rarrap: "⥵", rarrbfs: "⤠", rarrc: "⤳", rarrfs: "⤞", rarrpl: "⥅", rarrsim: "⥴", rarrtl: "↣", rightarrowtail: "↣", rarrw: "↝", rightsquigarrow: "↝", ratail: "⤚", ratio: "∶", rbbrk: "❳", rbrace: "}", rcub: "}", rbrack: "]", rsqb: "]", rbrke: "⦌", rbrksld: "⦎", rbrkslu: "⦐", rcaron: "ř", rcedil: "ŗ", rcy: "р", rdca: "⤷", rdldhar: "⥩", rdsh: "↳", rect: "▭", rfisht: "⥽", rfr: "𝔯", rharul: "⥬", rho: "ρ", rhov: "ϱ", varrho: "ϱ", rightrightarrows: "⇉", rrarr: "⇉", rightthreetimes: "⋌", rthree: "⋌", ring: "˚", rlm: "‏", rmoust: "⎱", rmoustache: "⎱", rnmid: "⫮", roang: "⟭", roarr: "⇾", ropar: "⦆", ropf: "𝕣", roplus: "⨮", rotimes: "⨵", rpar: ")", rpargt: "⦔", rppolint: "⨒", rsaquo: "›", rscr: "𝓇", rtimes: "⋊", rtri: "▹", triangleright: "▹", rtriltri: "⧎", ruluhar: "⥨", rx: "℞", sacute: "ś", scE: "⪴", scap: "⪸", succapprox: "⪸", scaron: "š", scedil: "ş", scirc: "ŝ", scnE: "⪶", succneqq: "⪶", scnap: "⪺", succnapprox: "⪺", scnsim: "⋩", succnsim: "⋩", scpolint: "⨓", scy: "с", sdot: "⋅", sdote: "⩦", seArr: "⇘", sect: "§", semi: ";", seswar: "⤩", tosa: "⤩", sext: "✶", sfr: "𝔰", sharp: "♯", shchcy: "щ", shcy: "ш", shy: "­", sigma: "σ", sigmaf: "ς", sigmav: "ς", varsigma: "ς", simdot: "⩪", simg: "⪞", simgE: "⪠", siml: "⪝", simlE: "⪟", simne: "≆", simplus: "⨤", simrarr: "⥲", smashp: "⨳", smeparsl: "⧤", smile: "⌣", ssmile: "⌣", smt: "⪪", smte: "⪬", smtes: "⪬︀", softcy: "ь", sol: "/", solb: "⧄", solbar: "⌿", sopf: "𝕤", spades: "♠", spadesuit: "♠", sqcaps: "⊓︀", sqcups: "⊔︀", sscr: "𝓈", star: "☆", sub: "⊂", subset: "⊂", subE: "⫅", subseteqq: "⫅", subdot: "⪽", subedot: "⫃", submult: "⫁", subnE: "⫋", subsetneqq: "⫋", subne: "⊊", subsetneq: "⊊", subplus: "⪿", subrarr: "⥹", subsim: "⫇", subsub: "⫕", subsup: "⫓", sung: "♪", sup1: "¹", sup2: "²", sup3: "³", supE: "⫆", supseteqq: "⫆", supdot: "⪾", supdsub: "⫘", supedot: "⫄", suphsol: "⟉", suphsub: "⫗", suplarr: "⥻", supmult: "⫂", supnE: "⫌", supsetneqq: "⫌", supne: "⊋", supsetneq: "⊋", supplus: "⫀", supsim: "⫈", supsub: "⫔", supsup: "⫖", swArr: "⇙", swnwar: "⤪", szlig: "ß", target: "⌖", tau: "τ", tcaron: "ť", tcedil: "ţ", tcy: "т", telrec: "⌕", tfr: "𝔱", theta: "θ", thetasym: "ϑ", thetav: "ϑ", vartheta: "ϑ", thorn: "þ", times: "×", timesbar: "⨱", timesd: "⨰", topbot: "⌶", topcir: "⫱", topf: "𝕥", topfork: "⫚", tprime: "‴", triangle: "▵", utri: "▵", triangleq: "≜", trie: "≜", tridot: "◬", triminus: "⨺", triplus: "⨹", trisb: "⧍", tritime: "⨻", trpezium: "⏢", tscr: "𝓉", tscy: "ц", tshcy: "ћ", tstrok: "ŧ", uHar: "⥣", uacute: "ú", ubrcy: "ў", ubreve: "ŭ", ucirc: "û", ucy: "у", udblac: "ű", ufisht: "⥾", ufr: "𝔲", ugrave: "ù", uhblk: "▀", ulcorn: "⌜", ulcorner: "⌜", ulcrop: "⌏", ultri: "◸", umacr: "ū", uogon: "ų", uopf: "𝕦", upsi: "υ", upsilon: "υ", upuparrows: "⇈", uuarr: "⇈", urcorn: "⌝", urcorner: "⌝", urcrop: "⌎", uring: "ů", urtri: "◹", uscr: "𝓊", utdot: "⋰", utilde: "ũ", uuml: "ü", uwangle: "⦧", vBar: "⫨", vBarv: "⫩", vangrt: "⦜", varsubsetneq: "⊊︀", vsubne: "⊊︀", varsubsetneqq: "⫋︀", vsubnE: "⫋︀", varsupsetneq: "⊋︀", vsupne: "⊋︀", varsupsetneqq: "⫌︀", vsupnE: "⫌︀", vcy: "в", veebar: "⊻", veeeq: "≚", vellip: "⋮", vfr: "𝔳", vopf: "𝕧", vscr: "𝓋", vzigzag: "⦚", wcirc: "ŵ", wedbar: "⩟", wedgeq: "≙", weierp: "℘", wp: "℘", wfr: "𝔴", wopf: "𝕨", wscr: "𝓌", xfr: "𝔵", xi: "ξ", xnis: "⋻", xopf: "𝕩", xscr: "𝓍", yacute: "ý", yacy: "я", ycirc: "ŷ", ycy: "ы", yen: "¥", yfr: "𝔶", yicy: "ї", yopf: "𝕪", yscr: "𝓎", yucy: "ю", yuml: "ÿ", zacute: "ź", zcaron: "ž", zcy: "з", zdot: "ż", zeta: "ζ", zfr: "𝔷", zhcy: "ж", zigrarr: "⇝", zopf: "𝕫", zscr: "𝓏", zwj: "‍", zwnj: "‌" }, fo = "";
Ve$1.ngsp = fo;
var go = [/@/, /^\s*$/, /[<>]/, /^[{}]$/, /&(#|[a-z])/i, /^\/\//];
function Xs(t8, e2) {
  if (e2 != null && !(Array.isArray(e2) && e2.length == 2)) throw new Error(`Expected '${t8}' to be an array, [start, end].`);
  if (e2 != null) {
    let r2 = e2[0], n2 = e2[1];
    go.forEach((s2) => {
      if (s2.test(r2) || s2.test(n2)) throw new Error(`['${r2}', '${n2}'] contains unusable interpolation symbol.`);
    });
  }
}
var $r$1 = class t2 {
  static fromArray(e2) {
    return e2 ? (Xs("interpolation", e2), new t2(e2[0], e2[1])) : Or$1;
  }
  constructor(e2, r2) {
    this.start = e2, this.end = r2;
  }
}, Or$1 = new $r$1("{{", "}}");
var gt$1 = class gt extends Oe$1 {
  constructor(e2, r2, n2) {
    super(n2, e2), this.tokenType = r2;
  }
}, Ur$1 = class Ur {
  constructor(e2, r2, n2) {
    this.tokens = e2, this.errors = r2, this.nonNormalizedIcuExpressions = n2;
  }
};
function li(t8, e2, r2, n2 = {}) {
  let s2 = new Wr$1(new ve$1(t8, e2), r2, n2);
  return s2.tokenize(), new Ur$1(Vo$1(s2.tokens), s2.errors, s2.nonNormalizedIcuExpressions);
}
var Io$1 = /\r\n?/g;
function Ue$1(t8) {
  return `Unexpected character "${t8 === 0 ? "EOF" : String.fromCharCode(t8)}"`;
}
function ti$1(t8) {
  return `Unknown entity "${t8}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}
function Ro$1(t8, e2) {
  return `Unable to parse entity "${e2}" - ${t8} character reference entities must end with ";"`;
}
var rr$1;
(function(t8) {
  t8.HEX = "hexadecimal", t8.DEC = "decimal";
})(rr$1 || (rr$1 = {}));
var Ct$1 = class Ct {
  constructor(e2) {
    this.error = e2;
  }
}, Wr$1 = class Wr {
  constructor(e2, r2, n2) {
    this._getTagContentType = r2, this._currentTokenStart = null, this._currentTokenType = null, this._expansionCaseStack = [], this._inInterpolation = false, this._fullNameStack = [], this.tokens = [], this.errors = [], this.nonNormalizedIcuExpressions = [], this._tokenizeIcu = n2.tokenizeExpansionForms || false, this._interpolationConfig = n2.interpolationConfig || Or$1, this._leadingTriviaCodePoints = n2.leadingTriviaChars && n2.leadingTriviaChars.map((i) => i.codePointAt(0) || 0), this._canSelfClose = n2.canSelfClose || false, this._allowHtmComponentClosingTags = n2.allowHtmComponentClosingTags || false;
    let s2 = n2.range || { endPos: e2.content.length, startPos: 0, startLine: 0, startCol: 0 };
    this._cursor = n2.escapedString ? new Gr$1(e2, s2) : new nr$1(e2, s2), this._preserveLineEndings = n2.preserveLineEndings || false, this._i18nNormalizeLineEndingsInICUs = n2.i18nNormalizeLineEndingsInICUs || false, this._tokenizeBlocks = n2.tokenizeBlocks ?? true, this._tokenizeLet = n2.tokenizeLet ?? true;
    try {
      this._cursor.init();
    } catch (i) {
      this.handleError(i);
    }
  }
  _processCarriageReturns(e2) {
    return this._preserveLineEndings ? e2 : e2.replace(Io$1, `
`);
  }
  tokenize() {
    for (; this._cursor.peek() !== 0; ) {
      let e2 = this._cursor.clone();
      try {
        if (this._attemptCharCode(60)) if (this._attemptCharCode(33)) this._attemptStr("[CDATA[") ? this._consumeCdata(e2) : this._attemptStr("--") ? this._consumeComment(e2) : this._attemptStrCaseInsensitive("doctype") ? this._consumeDocType(e2) : this._consumeBogusComment(e2);
        else if (this._attemptCharCode(47)) this._consumeTagClose(e2);
        else {
          let r2 = this._cursor.clone();
          this._attemptCharCode(63) ? (this._cursor = r2, this._consumeBogusComment(e2)) : this._consumeTagOpen(e2);
        }
        else this._tokenizeLet && this._cursor.peek() === 64 && !this._inInterpolation && this._attemptStr("@let") ? this._consumeLetDeclaration(e2) : this._tokenizeBlocks && this._attemptCharCode(64) ? this._consumeBlockStart(e2) : this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansionCase() && !this._isInExpansionForm() && this._attemptCharCode(125) ? this._consumeBlockEnd(e2) : this._tokenizeIcu && this._tokenizeExpansionForm() || this._consumeWithInterpolation(5, 8, () => this._isTextEnd(), () => this._isTagStart());
      } catch (r2) {
        this.handleError(r2);
      }
    }
    this._beginToken(34), this._endToken([]);
  }
  _getBlockName() {
    let e2 = false, r2 = this._cursor.clone();
    return this._attemptCharCodeUntilFn((n2) => ut$1(n2) ? !e2 : si(n2) ? (e2 = true, false) : true), this._cursor.getChars(r2).trim();
  }
  _consumeBlockStart(e2) {
    this._beginToken(25, e2);
    let r2 = this._endToken([this._getBlockName()]);
    if (this._cursor.peek() === 40) if (this._cursor.advance(), this._consumeBlockParameters(), this._attemptCharCodeUntilFn(b$1), this._attemptCharCode(41)) this._attemptCharCodeUntilFn(b$1);
    else {
      r2.type = 29;
      return;
    }
    this._attemptCharCode(123) ? (this._beginToken(26), this._endToken([])) : r2.type = 29;
  }
  _consumeBlockEnd(e2) {
    this._beginToken(27, e2), this._endToken([]);
  }
  _consumeBlockParameters() {
    for (this._attemptCharCodeUntilFn(ii); this._cursor.peek() !== 41 && this._cursor.peek() !== 0; ) {
      this._beginToken(28);
      let e2 = this._cursor.clone(), r2 = null, n2 = 0;
      for (; this._cursor.peek() !== 59 && this._cursor.peek() !== 0 || r2 !== null; ) {
        let s2 = this._cursor.peek();
        if (s2 === 92) this._cursor.advance();
        else if (s2 === r2) r2 = null;
        else if (r2 === null && Ot$1(s2)) r2 = s2;
        else if (s2 === 40 && r2 === null) n2++;
        else if (s2 === 41 && r2 === null) {
          if (n2 === 0) break;
          n2 > 0 && n2--;
        }
        this._cursor.advance();
      }
      this._endToken([this._cursor.getChars(e2)]), this._attemptCharCodeUntilFn(ii);
    }
  }
  _consumeLetDeclaration(e2) {
    if (this._beginToken(30, e2), ut$1(this._cursor.peek())) this._attemptCharCodeUntilFn(b$1);
    else {
      let s2 = this._endToken([this._cursor.getChars(e2)]);
      s2.type = 33;
      return;
    }
    let r2 = this._endToken([this._getLetDeclarationName()]);
    if (this._attemptCharCodeUntilFn(b$1), !this._attemptCharCode(61)) {
      r2.type = 33;
      return;
    }
    this._attemptCharCodeUntilFn((s2) => b$1(s2) && !$t$1(s2)), this._consumeLetDeclarationValue(), this._cursor.peek() === 59 ? (this._beginToken(32), this._endToken([]), this._cursor.advance()) : (r2.type = 33, r2.sourceSpan = this._cursor.getSpan(e2));
  }
  _getLetDeclarationName() {
    let e2 = this._cursor.clone(), r2 = false;
    return this._attemptCharCodeUntilFn((n2) => lt(n2) || n2 === 36 || n2 === 95 || r2 && Rt$1(n2) ? (r2 = true, false) : true), this._cursor.getChars(e2).trim();
  }
  _consumeLetDeclarationValue() {
    let e2 = this._cursor.clone();
    for (this._beginToken(31, e2); this._cursor.peek() !== 0; ) {
      let r2 = this._cursor.peek();
      if (r2 === 59) break;
      Ot$1(r2) && (this._cursor.advance(), this._attemptCharCodeUntilFn((n2) => n2 === 92 ? (this._cursor.advance(), false) : n2 === r2)), this._cursor.advance();
    }
    this._endToken([this._cursor.getChars(e2)]);
  }
  _tokenizeExpansionForm() {
    if (this.isExpansionFormStart()) return this._consumeExpansionFormStart(), true;
    if (qo$1(this._cursor.peek()) && this._isInExpansionForm()) return this._consumeExpansionCaseStart(), true;
    if (this._cursor.peek() === 125) {
      if (this._isInExpansionCase()) return this._consumeExpansionCaseEnd(), true;
      if (this._isInExpansionForm()) return this._consumeExpansionFormEnd(), true;
    }
    return false;
  }
  _beginToken(e2, r2 = this._cursor.clone()) {
    this._currentTokenStart = r2, this._currentTokenType = e2;
  }
  _endToken(e2, r2) {
    if (this._currentTokenStart === null) throw new gt$1("Programming error - attempted to end a token when there was no start to the token", this._currentTokenType, this._cursor.getSpan(r2));
    if (this._currentTokenType === null) throw new gt$1("Programming error - attempted to end a token which has no token type", null, this._cursor.getSpan(this._currentTokenStart));
    let n2 = { type: this._currentTokenType, parts: e2, sourceSpan: (r2 ?? this._cursor).getSpan(this._currentTokenStart, this._leadingTriviaCodePoints) };
    return this.tokens.push(n2), this._currentTokenStart = null, this._currentTokenType = null, n2;
  }
  _createError(e2, r2) {
    this._isInExpansionForm() && (e2 += ` (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`);
    let n2 = new gt$1(e2, this._currentTokenType, r2);
    return this._currentTokenStart = null, this._currentTokenType = null, new Ct$1(n2);
  }
  handleError(e2) {
    if (e2 instanceof St$1 && (e2 = this._createError(e2.msg, this._cursor.getSpan(e2.cursor))), e2 instanceof Ct$1) this.errors.push(e2.error);
    else throw e2;
  }
  _attemptCharCode(e2) {
    return this._cursor.peek() === e2 ? (this._cursor.advance(), true) : false;
  }
  _attemptCharCodeCaseInsensitive(e2) {
    return Ho$1(this._cursor.peek(), e2) ? (this._cursor.advance(), true) : false;
  }
  _requireCharCode(e2) {
    let r2 = this._cursor.clone();
    if (!this._attemptCharCode(e2)) throw this._createError(Ue$1(this._cursor.peek()), this._cursor.getSpan(r2));
  }
  _attemptStr(e2) {
    let r2 = e2.length;
    if (this._cursor.charsLeft() < r2) return false;
    let n2 = this._cursor.clone();
    for (let s2 = 0; s2 < r2; s2++) if (!this._attemptCharCode(e2.charCodeAt(s2))) return this._cursor = n2, false;
    return true;
  }
  _attemptStrCaseInsensitive(e2) {
    for (let r2 = 0; r2 < e2.length; r2++) if (!this._attemptCharCodeCaseInsensitive(e2.charCodeAt(r2))) return false;
    return true;
  }
  _requireStr(e2) {
    let r2 = this._cursor.clone();
    if (!this._attemptStr(e2)) throw this._createError(Ue$1(this._cursor.peek()), this._cursor.getSpan(r2));
  }
  _requireStrCaseInsensitive(e2) {
    let r2 = this._cursor.clone();
    if (!this._attemptStrCaseInsensitive(e2)) throw this._createError(Ue$1(this._cursor.peek()), this._cursor.getSpan(r2));
  }
  _attemptCharCodeUntilFn(e2) {
    for (; !e2(this._cursor.peek()); ) this._cursor.advance();
  }
  _requireCharCodeUntilFn(e2, r2) {
    let n2 = this._cursor.clone();
    if (this._attemptCharCodeUntilFn(e2), this._cursor.diff(n2) < r2) throw this._createError(Ue$1(this._cursor.peek()), this._cursor.getSpan(n2));
  }
  _attemptUntilChar(e2) {
    for (; this._cursor.peek() !== e2; ) this._cursor.advance();
  }
  _readChar() {
    let e2 = String.fromCodePoint(this._cursor.peek());
    return this._cursor.advance(), e2;
  }
  _consumeEntity(e2) {
    this._beginToken(9);
    let r2 = this._cursor.clone();
    if (this._cursor.advance(), this._attemptCharCode(35)) {
      let n2 = this._attemptCharCode(120) || this._attemptCharCode(88), s2 = this._cursor.clone();
      if (this._attemptCharCodeUntilFn(Oo$1), this._cursor.peek() != 59) {
        this._cursor.advance();
        let a = n2 ? rr$1.HEX : rr$1.DEC;
        throw this._createError(Ro$1(a, this._cursor.getChars(r2)), this._cursor.getSpan());
      }
      let i = this._cursor.getChars(s2);
      this._cursor.advance();
      try {
        let a = parseInt(i, n2 ? 16 : 10);
        this._endToken([String.fromCharCode(a), this._cursor.getChars(r2)]);
      } catch {
        throw this._createError(ti$1(this._cursor.getChars(r2)), this._cursor.getSpan());
      }
    } else {
      let n2 = this._cursor.clone();
      if (this._attemptCharCodeUntilFn(Mo$1), this._cursor.peek() != 59) this._beginToken(e2, r2), this._cursor = n2, this._endToken(["&"]);
      else {
        let s2 = this._cursor.getChars(n2);
        this._cursor.advance();
        let i = Ve$1[s2];
        if (!i) throw this._createError(ti$1(s2), this._cursor.getSpan(r2));
        this._endToken([i, `&${s2};`]);
      }
    }
  }
  _consumeRawText(e2, r2) {
    this._beginToken(e2 ? 6 : 7);
    let n2 = [];
    for (; ; ) {
      let s2 = this._cursor.clone(), i = r2();
      if (this._cursor = s2, i) break;
      e2 && this._cursor.peek() === 38 ? (this._endToken([this._processCarriageReturns(n2.join(""))]), n2.length = 0, this._consumeEntity(6), this._beginToken(6)) : n2.push(this._readChar());
    }
    this._endToken([this._processCarriageReturns(n2.join(""))]);
  }
  _consumeComment(e2) {
    this._beginToken(10, e2), this._endToken([]), this._consumeRawText(false, () => this._attemptStr("-->")), this._beginToken(11), this._requireStr("-->"), this._endToken([]);
  }
  _consumeBogusComment(e2) {
    this._beginToken(10, e2), this._endToken([]), this._consumeRawText(false, () => this._cursor.peek() === 62), this._beginToken(11), this._cursor.advance(), this._endToken([]);
  }
  _consumeCdata(e2) {
    this._beginToken(12, e2), this._endToken([]), this._consumeRawText(false, () => this._attemptStr("]]>")), this._beginToken(13), this._requireStr("]]>"), this._endToken([]);
  }
  _consumeDocType(e2) {
    this._beginToken(18, e2), this._endToken([]), this._consumeRawText(false, () => this._cursor.peek() === 62), this._beginToken(19), this._cursor.advance(), this._endToken([]);
  }
  _consumePrefixAndName() {
    let e2 = this._cursor.clone(), r2 = "";
    for (; this._cursor.peek() !== 58 && !$o$1(this._cursor.peek()); ) this._cursor.advance();
    let n2;
    this._cursor.peek() === 58 ? (r2 = this._cursor.getChars(e2), this._cursor.advance(), n2 = this._cursor.clone()) : n2 = e2, this._requireCharCodeUntilFn(ri$1, r2 === "" ? 0 : 1);
    let s2 = this._cursor.getChars(n2);
    return [r2, s2];
  }
  _consumeTagOpen(e2) {
    let r2, n2, s2, i = [];
    try {
      if (!lt(this._cursor.peek())) throw this._createError(Ue$1(this._cursor.peek()), this._cursor.getSpan(e2));
      for (s2 = this._consumeTagOpenStart(e2), n2 = s2.parts[0], r2 = s2.parts[1], this._attemptCharCodeUntilFn(b$1); this._cursor.peek() !== 47 && this._cursor.peek() !== 62 && this._cursor.peek() !== 60 && this._cursor.peek() !== 0; ) {
        let [o2, u] = this._consumeAttributeName();
        if (this._attemptCharCodeUntilFn(b$1), this._attemptCharCode(61)) {
          this._attemptCharCodeUntilFn(b$1);
          let p = this._consumeAttributeValue();
          i.push({ prefix: o2, name: u, value: p });
        } else i.push({ prefix: o2, name: u });
        this._attemptCharCodeUntilFn(b$1);
      }
      this._consumeTagOpenEnd();
    } catch (o2) {
      if (o2 instanceof Ct$1) {
        s2 ? s2.type = 4 : (this._beginToken(5, e2), this._endToken(["<"]));
        return;
      }
      throw o2;
    }
    if (this._canSelfClose && this.tokens[this.tokens.length - 1].type === 2) return;
    let a = this._getTagContentType(r2, n2, this._fullNameStack.length > 0, i);
    this._handleFullNameStackForTagOpen(n2, r2), a === N$1.RAW_TEXT ? this._consumeRawTextWithTagClose(n2, r2, false) : a === N$1.ESCAPABLE_RAW_TEXT && this._consumeRawTextWithTagClose(n2, r2, true);
  }
  _consumeRawTextWithTagClose(e2, r2, n2) {
    this._consumeRawText(n2, () => !this._attemptCharCode(60) || !this._attemptCharCode(47) || (this._attemptCharCodeUntilFn(b$1), !this._attemptStrCaseInsensitive(e2 ? `${e2}:${r2}` : r2)) ? false : (this._attemptCharCodeUntilFn(b$1), this._attemptCharCode(62))), this._beginToken(3), this._requireCharCodeUntilFn((s2) => s2 === 62, 3), this._cursor.advance(), this._endToken([e2, r2]), this._handleFullNameStackForTagClose(e2, r2);
  }
  _consumeTagOpenStart(e2) {
    this._beginToken(0, e2);
    let r2 = this._consumePrefixAndName();
    return this._endToken(r2);
  }
  _consumeAttributeName() {
    let e2 = this._cursor.peek();
    if (e2 === 39 || e2 === 34) throw this._createError(Ue$1(e2), this._cursor.getSpan());
    this._beginToken(14);
    let r2 = this._consumePrefixAndName();
    return this._endToken(r2), r2;
  }
  _consumeAttributeValue() {
    let e2;
    if (this._cursor.peek() === 39 || this._cursor.peek() === 34) {
      let r2 = this._cursor.peek();
      this._consumeQuote(r2);
      let n2 = () => this._cursor.peek() === r2;
      e2 = this._consumeWithInterpolation(16, 17, n2, n2), this._consumeQuote(r2);
    } else {
      let r2 = () => ri$1(this._cursor.peek());
      e2 = this._consumeWithInterpolation(16, 17, r2, r2);
    }
    return e2;
  }
  _consumeQuote(e2) {
    this._beginToken(15), this._requireCharCode(e2), this._endToken([String.fromCodePoint(e2)]);
  }
  _consumeTagOpenEnd() {
    let e2 = this._attemptCharCode(47) ? 2 : 1;
    this._beginToken(e2), this._requireCharCode(62), this._endToken([]);
  }
  _consumeTagClose(e2) {
    if (this._beginToken(3, e2), this._attemptCharCodeUntilFn(b$1), this._allowHtmComponentClosingTags && this._attemptCharCode(47)) this._attemptCharCodeUntilFn(b$1), this._requireCharCode(62), this._endToken([]);
    else {
      let [r2, n2] = this._consumePrefixAndName();
      this._attemptCharCodeUntilFn(b$1), this._requireCharCode(62), this._endToken([r2, n2]), this._handleFullNameStackForTagClose(r2, n2);
    }
  }
  _consumeExpansionFormStart() {
    this._beginToken(20), this._requireCharCode(123), this._endToken([]), this._expansionCaseStack.push(20), this._beginToken(7);
    let e2 = this._readUntil(44), r2 = this._processCarriageReturns(e2);
    if (this._i18nNormalizeLineEndingsInICUs) this._endToken([r2]);
    else {
      let s2 = this._endToken([e2]);
      r2 !== e2 && this.nonNormalizedIcuExpressions.push(s2);
    }
    this._requireCharCode(44), this._attemptCharCodeUntilFn(b$1), this._beginToken(7);
    let n2 = this._readUntil(44);
    this._endToken([n2]), this._requireCharCode(44), this._attemptCharCodeUntilFn(b$1);
  }
  _consumeExpansionCaseStart() {
    this._beginToken(21);
    let e2 = this._readUntil(123).trim();
    this._endToken([e2]), this._attemptCharCodeUntilFn(b$1), this._beginToken(22), this._requireCharCode(123), this._endToken([]), this._attemptCharCodeUntilFn(b$1), this._expansionCaseStack.push(22);
  }
  _consumeExpansionCaseEnd() {
    this._beginToken(23), this._requireCharCode(125), this._endToken([]), this._attemptCharCodeUntilFn(b$1), this._expansionCaseStack.pop();
  }
  _consumeExpansionFormEnd() {
    this._beginToken(24), this._requireCharCode(125), this._endToken([]), this._expansionCaseStack.pop();
  }
  _consumeWithInterpolation(e2, r2, n2, s2) {
    this._beginToken(e2);
    let i = [];
    for (; !n2(); ) {
      let o2 = this._cursor.clone();
      this._interpolationConfig && this._attemptStr(this._interpolationConfig.start) ? (this._endToken([this._processCarriageReturns(i.join(""))], o2), i.length = 0, this._consumeInterpolation(r2, o2, s2), this._beginToken(e2)) : this._cursor.peek() === 38 ? (this._endToken([this._processCarriageReturns(i.join(""))]), i.length = 0, this._consumeEntity(e2), this._beginToken(e2)) : i.push(this._readChar());
    }
    this._inInterpolation = false;
    let a = this._processCarriageReturns(i.join(""));
    return this._endToken([a]), a;
  }
  _consumeInterpolation(e2, r2, n2) {
    let s2 = [];
    this._beginToken(e2, r2), s2.push(this._interpolationConfig.start);
    let i = this._cursor.clone(), a = null, o2 = false;
    for (; this._cursor.peek() !== 0 && (n2 === null || !n2()); ) {
      let u = this._cursor.clone();
      if (this._isTagStart()) {
        this._cursor = u, s2.push(this._getProcessedChars(i, u)), this._endToken(s2);
        return;
      }
      if (a === null) if (this._attemptStr(this._interpolationConfig.end)) {
        s2.push(this._getProcessedChars(i, u)), s2.push(this._interpolationConfig.end), this._endToken(s2);
        return;
      } else this._attemptStr("//") && (o2 = true);
      let p = this._cursor.peek();
      this._cursor.advance(), p === 92 ? this._cursor.advance() : p === a ? a = null : !o2 && a === null && Ot$1(p) && (a = p);
    }
    s2.push(this._getProcessedChars(i, this._cursor)), this._endToken(s2);
  }
  _getProcessedChars(e2, r2) {
    return this._processCarriageReturns(r2.getChars(e2));
  }
  _isTextEnd() {
    return !!(this._isTagStart() || this._cursor.peek() === 0 || this._tokenizeIcu && !this._inInterpolation && (this.isExpansionFormStart() || this._cursor.peek() === 125 && this._isInExpansionCase()) || this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansion() && (this._isBlockStart() || this._cursor.peek() === 64 || this._cursor.peek() === 125));
  }
  _isTagStart() {
    if (this._cursor.peek() === 60) {
      let e2 = this._cursor.clone();
      e2.advance();
      let r2 = e2.peek();
      if (97 <= r2 && r2 <= 122 || 65 <= r2 && r2 <= 90 || r2 === 47 || r2 === 33) return true;
    }
    return false;
  }
  _isBlockStart() {
    if (this._tokenizeBlocks && this._cursor.peek() === 64) {
      let e2 = this._cursor.clone();
      if (e2.advance(), si(e2.peek())) return true;
    }
    return false;
  }
  _readUntil(e2) {
    let r2 = this._cursor.clone();
    return this._attemptUntilChar(e2), this._cursor.getChars(r2);
  }
  _isInExpansion() {
    return this._isInExpansionCase() || this._isInExpansionForm();
  }
  _isInExpansionCase() {
    return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === 22;
  }
  _isInExpansionForm() {
    return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === 20;
  }
  isExpansionFormStart() {
    if (this._cursor.peek() !== 123) return false;
    if (this._interpolationConfig) {
      let e2 = this._cursor.clone(), r2 = this._attemptStr(this._interpolationConfig.start);
      return this._cursor = e2, !r2;
    }
    return true;
  }
  _handleFullNameStackForTagOpen(e2, r2) {
    let n2 = qe$1(e2, r2);
    (this._fullNameStack.length === 0 || this._fullNameStack[this._fullNameStack.length - 1] === n2) && this._fullNameStack.push(n2);
  }
  _handleFullNameStackForTagClose(e2, r2) {
    let n2 = qe$1(e2, r2);
    this._fullNameStack.length !== 0 && this._fullNameStack[this._fullNameStack.length - 1] === n2 && this._fullNameStack.pop();
  }
};
function b$1(t8) {
  return !ut$1(t8) || t8 === 0;
}
function ri$1(t8) {
  return ut$1(t8) || t8 === 62 || t8 === 60 || t8 === 47 || t8 === 39 || t8 === 34 || t8 === 61 || t8 === 0;
}
function $o$1(t8) {
  return (t8 < 97 || 122 < t8) && (t8 < 65 || 90 < t8) && (t8 < 48 || t8 > 57);
}
function Oo$1(t8) {
  return t8 === 59 || t8 === 0 || !Rs(t8);
}
function Mo$1(t8) {
  return t8 === 59 || t8 === 0 || !lt(t8);
}
function qo$1(t8) {
  return t8 !== 125;
}
function Ho$1(t8, e2) {
  return ni$1(t8) === ni$1(e2);
}
function ni$1(t8) {
  return t8 >= 97 && t8 <= 122 ? t8 - 97 + 65 : t8;
}
function si(t8) {
  return lt(t8) || Rt$1(t8) || t8 === 95;
}
function ii(t8) {
  return t8 !== 59 && b$1(t8);
}
function Vo$1(t8) {
  let e2 = [], r2;
  for (let n2 = 0; n2 < t8.length; n2++) {
    let s2 = t8[n2];
    r2 && r2.type === 5 && s2.type === 5 || r2 && r2.type === 16 && s2.type === 16 ? (r2.parts[0] += s2.parts[0], r2.sourceSpan.end = s2.sourceSpan.end) : (r2 = s2, e2.push(r2));
  }
  return e2;
}
var nr$1 = class t3 {
  constructor(e2, r2) {
    if (e2 instanceof t3) {
      this.file = e2.file, this.input = e2.input, this.end = e2.end;
      let n2 = e2.state;
      this.state = { peek: n2.peek, offset: n2.offset, line: n2.line, column: n2.column };
    } else {
      if (!r2) throw new Error("Programming error: the range argument must be provided with a file argument.");
      this.file = e2, this.input = e2.content, this.end = r2.endPos, this.state = { peek: -1, offset: r2.startPos, line: r2.startLine, column: r2.startCol };
    }
  }
  clone() {
    return new t3(this);
  }
  peek() {
    return this.state.peek;
  }
  charsLeft() {
    return this.end - this.state.offset;
  }
  diff(e2) {
    return this.state.offset - e2.state.offset;
  }
  advance() {
    this.advanceState(this.state);
  }
  init() {
    this.updatePeek(this.state);
  }
  getSpan(e2, r2) {
    e2 = e2 || this;
    let n2 = e2;
    if (r2) for (; this.diff(e2) > 0 && r2.indexOf(e2.peek()) !== -1; ) n2 === e2 && (e2 = e2.clone()), e2.advance();
    let s2 = this.locationFromCursor(e2), i = this.locationFromCursor(this), a = n2 !== e2 ? this.locationFromCursor(n2) : s2;
    return new h(s2, i, a);
  }
  getChars(e2) {
    return this.input.substring(e2.state.offset, this.state.offset);
  }
  charAt(e2) {
    return this.input.charCodeAt(e2);
  }
  advanceState(e2) {
    if (e2.offset >= this.end) throw this.state = e2, new St$1('Unexpected character "EOF"', this);
    let r2 = this.charAt(e2.offset);
    r2 === 10 ? (e2.line++, e2.column = 0) : $t$1(r2) || e2.column++, e2.offset++, this.updatePeek(e2);
  }
  updatePeek(e2) {
    e2.peek = e2.offset >= this.end ? 0 : this.charAt(e2.offset);
  }
  locationFromCursor(e2) {
    return new ie$1(e2.file, e2.state.offset, e2.state.line, e2.state.column);
  }
}, Gr$1 = class t4 extends nr$1 {
  constructor(e2, r2) {
    e2 instanceof t4 ? (super(e2), this.internalState = { ...e2.internalState }) : (super(e2, r2), this.internalState = this.state);
  }
  advance() {
    this.state = this.internalState, super.advance(), this.processEscapeSequence();
  }
  init() {
    super.init(), this.processEscapeSequence();
  }
  clone() {
    return new t4(this);
  }
  getChars(e2) {
    let r2 = e2.clone(), n2 = "";
    for (; r2.internalState.offset < this.internalState.offset; ) n2 += String.fromCodePoint(r2.peek()), r2.advance();
    return n2;
  }
  processEscapeSequence() {
    let e2 = () => this.internalState.peek;
    if (e2() === 92) if (this.internalState = { ...this.state }, this.advanceState(this.internalState), e2() === 110) this.state.peek = 10;
    else if (e2() === 114) this.state.peek = 13;
    else if (e2() === 118) this.state.peek = 11;
    else if (e2() === 116) this.state.peek = 9;
    else if (e2() === 98) this.state.peek = 8;
    else if (e2() === 102) this.state.peek = 12;
    else if (e2() === 117) if (this.advanceState(this.internalState), e2() === 123) {
      this.advanceState(this.internalState);
      let r2 = this.clone(), n2 = 0;
      for (; e2() !== 125; ) this.advanceState(this.internalState), n2++;
      this.state.peek = this.decodeHexDigits(r2, n2);
    } else {
      let r2 = this.clone();
      this.advanceState(this.internalState), this.advanceState(this.internalState), this.advanceState(this.internalState), this.state.peek = this.decodeHexDigits(r2, 4);
    }
    else if (e2() === 120) {
      this.advanceState(this.internalState);
      let r2 = this.clone();
      this.advanceState(this.internalState), this.state.peek = this.decodeHexDigits(r2, 2);
    } else if (Br$1(e2())) {
      let r2 = "", n2 = 0, s2 = this.clone();
      for (; Br$1(e2()) && n2 < 3; ) s2 = this.clone(), r2 += String.fromCodePoint(e2()), this.advanceState(this.internalState), n2++;
      this.state.peek = parseInt(r2, 8), this.internalState = s2.internalState;
    } else $t$1(this.internalState.peek) ? (this.advanceState(this.internalState), this.state = this.internalState) : this.state.peek = this.internalState.peek;
  }
  decodeHexDigits(e2, r2) {
    let n2 = this.input.slice(e2.internalState.offset, e2.internalState.offset + r2), s2 = parseInt(n2, 16);
    if (isNaN(s2)) throw e2.state = e2.internalState, new St$1("Invalid hexadecimal escape sequence", e2);
    return s2;
  }
}, St$1 = class St {
  constructor(e2, r2) {
    this.msg = e2, this.cursor = r2;
  }
};
var L$1 = class t5 extends Oe$1 {
  static create(e2, r2, n2) {
    return new t5(e2, r2, n2);
  }
  constructor(e2, r2, n2) {
    super(r2, n2), this.elementName = e2;
  }
}, jr$1 = class jr {
  constructor(e2, r2) {
    this.rootNodes = e2, this.errors = r2;
  }
}, sr$1 = class sr {
  constructor(e2) {
    this.getTagDefinition = e2;
  }
  parse(e2, r2, n2, s2 = false, i) {
    let a = (D) => (I2, ...F) => D(I2.toLowerCase(), ...F), o2 = s2 ? this.getTagDefinition : a(this.getTagDefinition), u = (D) => o2(D).getContentType(), p = s2 ? i : a(i), m = li(e2, r2, i ? (D, I2, F, c2) => {
      let g2 = p(D, I2, F, c2);
      return g2 !== void 0 ? g2 : u(D);
    } : u, n2), f = n2 && n2.canSelfClose || false, C = n2 && n2.allowHtmComponentClosingTags || false, A = new Kr(m.tokens, o2, f, C, s2);
    return A.build(), new jr$1(A.rootNodes, m.errors.concat(A.errors));
  }
}, Kr = class t6 {
  constructor(e2, r2, n2, s2, i) {
    this.tokens = e2, this.getTagDefinition = r2, this.canSelfClose = n2, this.allowHtmComponentClosingTags = s2, this.isTagNameCaseSensitive = i, this._index = -1, this._containerStack = [], this.rootNodes = [], this.errors = [], this._advance();
  }
  build() {
    for (; this._peek.type !== 34; ) this._peek.type === 0 || this._peek.type === 4 ? this._consumeStartTag(this._advance()) : this._peek.type === 3 ? (this._closeVoidElement(), this._consumeEndTag(this._advance())) : this._peek.type === 12 ? (this._closeVoidElement(), this._consumeCdata(this._advance())) : this._peek.type === 10 ? (this._closeVoidElement(), this._consumeComment(this._advance())) : this._peek.type === 5 || this._peek.type === 7 || this._peek.type === 6 ? (this._closeVoidElement(), this._consumeText(this._advance())) : this._peek.type === 20 ? this._consumeExpansion(this._advance()) : this._peek.type === 25 ? (this._closeVoidElement(), this._consumeBlockOpen(this._advance())) : this._peek.type === 27 ? (this._closeVoidElement(), this._consumeBlockClose(this._advance())) : this._peek.type === 29 ? (this._closeVoidElement(), this._consumeIncompleteBlock(this._advance())) : this._peek.type === 30 ? (this._closeVoidElement(), this._consumeLet(this._advance())) : this._peek.type === 18 ? this._consumeDocType(this._advance()) : this._peek.type === 33 ? (this._closeVoidElement(), this._consumeIncompleteLet(this._advance())) : this._advance();
    for (let e2 of this._containerStack) e2 instanceof ee$1 && this.errors.push(L$1.create(e2.name, e2.sourceSpan, `Unclosed block "${e2.name}"`));
  }
  _advance() {
    let e2 = this._peek;
    return this._index < this.tokens.length - 1 && this._index++, this._peek = this.tokens[this._index], e2;
  }
  _advanceIf(e2) {
    return this._peek.type === e2 ? this._advance() : null;
  }
  _consumeCdata(e2) {
    let r2 = this._advance(), n2 = this._getText(r2), s2 = this._advanceIf(13);
    this._addToParent(new Gt$1(n2, new h(e2.sourceSpan.start, (s2 || r2).sourceSpan.end), [r2]));
  }
  _consumeComment(e2) {
    let r2 = this._advanceIf(7), n2 = this._advanceIf(11), s2 = r2 != null ? r2.parts[0].trim() : null, i = n2 == null ? e2.sourceSpan : new h(e2.sourceSpan.start, n2.sourceSpan.end, e2.sourceSpan.fullStart);
    this._addToParent(new Kt$1(s2, i));
  }
  _consumeDocType(e2) {
    let r2 = this._advanceIf(7), n2 = this._advanceIf(19), s2 = r2 != null ? r2.parts[0].trim() : null, i = new h(e2.sourceSpan.start, (n2 || r2 || e2).sourceSpan.end);
    this._addToParent(new Xt$1(s2, i));
  }
  _consumeExpansion(e2) {
    let r2 = this._advance(), n2 = this._advance(), s2 = [];
    for (; this._peek.type === 21; ) {
      let a = this._parseExpansionCase();
      if (!a) return;
      s2.push(a);
    }
    if (this._peek.type !== 24) {
      this.errors.push(L$1.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '}'."));
      return;
    }
    let i = new h(e2.sourceSpan.start, this._peek.sourceSpan.end, e2.sourceSpan.fullStart);
    this._addToParent(new zt$1(r2.parts[0], n2.parts[0], s2, i, r2.sourceSpan)), this._advance();
  }
  _parseExpansionCase() {
    let e2 = this._advance();
    if (this._peek.type !== 22) return this.errors.push(L$1.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '{'.")), null;
    let r2 = this._advance(), n2 = this._collectExpansionExpTokens(r2);
    if (!n2) return null;
    let s2 = this._advance();
    n2.push({ type: 34, parts: [], sourceSpan: s2.sourceSpan });
    let i = new t6(n2, this.getTagDefinition, this.canSelfClose, this.allowHtmComponentClosingTags, this.isTagNameCaseSensitive);
    if (i.build(), i.errors.length > 0) return this.errors = this.errors.concat(i.errors), null;
    let a = new h(e2.sourceSpan.start, s2.sourceSpan.end, e2.sourceSpan.fullStart), o2 = new h(r2.sourceSpan.start, s2.sourceSpan.end, r2.sourceSpan.fullStart);
    return new Yt$1(e2.parts[0], i.rootNodes, a, e2.sourceSpan, o2);
  }
  _collectExpansionExpTokens(e2) {
    let r2 = [], n2 = [22];
    for (; ; ) {
      if ((this._peek.type === 20 || this._peek.type === 22) && n2.push(this._peek.type), this._peek.type === 23) if (ci(n2, 22)) {
        if (n2.pop(), n2.length === 0) return r2;
      } else return this.errors.push(L$1.create(null, e2.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
      if (this._peek.type === 24) if (ci(n2, 20)) n2.pop();
      else return this.errors.push(L$1.create(null, e2.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
      if (this._peek.type === 34) return this.errors.push(L$1.create(null, e2.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
      r2.push(this._advance());
    }
  }
  _getText(e2) {
    let r2 = e2.parts[0];
    if (r2.length > 0 && r2[0] == `
`) {
      let n2 = this._getClosestParentElement();
      n2 != null && n2.children.length == 0 && this.getTagDefinition(n2.name).ignoreFirstLf && (r2 = r2.substring(1));
    }
    return r2;
  }
  _consumeText(e2) {
    let r2 = [e2], n2 = e2.sourceSpan, s2 = e2.parts[0];
    if (s2.length > 0 && s2[0] === `
`) {
      let i = this._getContainer();
      i != null && i.children.length === 0 && this.getTagDefinition(i.name).ignoreFirstLf && (s2 = s2.substring(1), r2[0] = { type: e2.type, sourceSpan: e2.sourceSpan, parts: [s2] });
    }
    for (; this._peek.type === 8 || this._peek.type === 5 || this._peek.type === 9; ) e2 = this._advance(), r2.push(e2), e2.type === 8 ? s2 += e2.parts.join("").replace(/&([^;]+);/g, pi) : e2.type === 9 ? s2 += e2.parts[0] : s2 += e2.parts.join("");
    if (s2.length > 0) {
      let i = e2.sourceSpan;
      this._addToParent(new Wt$1(s2, new h(n2.start, i.end, n2.fullStart, n2.details), r2));
    }
  }
  _closeVoidElement() {
    let e2 = this._getContainer();
    e2 instanceof Y$1 && this.getTagDefinition(e2.name).isVoid && this._containerStack.pop();
  }
  _consumeStartTag(e2) {
    let [r2, n2] = e2.parts, s2 = [];
    for (; this._peek.type === 14; ) s2.push(this._consumeAttr(this._advance()));
    let i = this._getElementFullName(r2, n2, this._getClosestParentElement()), a = false;
    if (this._peek.type === 2) {
      this._advance(), a = true;
      let C = this.getTagDefinition(i);
      this.canSelfClose || C.canSelfClose || Me$1(i) !== null || C.isVoid || this.errors.push(L$1.create(i, e2.sourceSpan, `Only void, custom and foreign elements can be self closed "${e2.parts[1]}"`));
    } else this._peek.type === 1 && (this._advance(), a = false);
    let o2 = this._peek.sourceSpan.fullStart, u = new h(e2.sourceSpan.start, o2, e2.sourceSpan.fullStart), p = new h(e2.sourceSpan.start, o2, e2.sourceSpan.fullStart), l2 = new h(e2.sourceSpan.start.moveBy(1), e2.sourceSpan.end), m = new Y$1(i, s2, [], u, p, void 0, l2), f = this._getContainer();
    this._pushContainer(m, f instanceof Y$1 && this.getTagDefinition(f.name).isClosedByChild(m.name)), a ? this._popContainer(i, Y$1, u) : e2.type === 4 && (this._popContainer(i, Y$1, null), this.errors.push(L$1.create(i, u, `Opening tag "${i}" not terminated.`)));
  }
  _pushContainer(e2, r2) {
    r2 && this._containerStack.pop(), this._addToParent(e2), this._containerStack.push(e2);
  }
  _consumeEndTag(e2) {
    let r2 = this.allowHtmComponentClosingTags && e2.parts.length === 0 ? null : this._getElementFullName(e2.parts[0], e2.parts[1], this._getClosestParentElement());
    if (r2 && this.getTagDefinition(r2).isVoid) this.errors.push(L$1.create(r2, e2.sourceSpan, `Void elements do not have end tags "${e2.parts[1]}"`));
    else if (!this._popContainer(r2, Y$1, e2.sourceSpan)) {
      let n2 = `Unexpected closing tag "${r2}". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags`;
      this.errors.push(L$1.create(r2, e2.sourceSpan, n2));
    }
  }
  _popContainer(e2, r2, n2) {
    let s2 = false;
    for (let i = this._containerStack.length - 1; i >= 0; i--) {
      let a = this._containerStack[i];
      if (Me$1(a.name) ? a.name === e2 : (e2 == null || a.name.toLowerCase() === e2.toLowerCase()) && a instanceof r2) return a.endSourceSpan = n2, a.sourceSpan.end = n2 !== null ? n2.end : a.sourceSpan.end, this._containerStack.splice(i, this._containerStack.length - i), !s2;
      (a instanceof ee$1 || a instanceof Y$1 && !this.getTagDefinition(a.name).closedByParent) && (s2 = true);
    }
    return false;
  }
  _consumeAttr(e2) {
    let r2 = qe$1(e2.parts[0], e2.parts[1]), n2 = e2.sourceSpan.end, s2;
    this._peek.type === 15 && (s2 = this._advance());
    let i = "", a = [], o2, u;
    if (this._peek.type === 16) for (o2 = this._peek.sourceSpan, u = this._peek.sourceSpan.end; this._peek.type === 16 || this._peek.type === 17 || this._peek.type === 9; ) {
      let m = this._advance();
      a.push(m), m.type === 17 ? i += m.parts.join("").replace(/&([^;]+);/g, pi) : m.type === 9 ? i += m.parts[0] : i += m.parts.join(""), u = n2 = m.sourceSpan.end;
    }
    this._peek.type === 15 && (u = n2 = this._advance().sourceSpan.end);
    let l2 = o2 && u && new h((s2 == null ? void 0 : s2.sourceSpan.start) ?? o2.start, u, (s2 == null ? void 0 : s2.sourceSpan.fullStart) ?? o2.fullStart);
    return new jt$1(r2, i, new h(e2.sourceSpan.start, n2, e2.sourceSpan.fullStart), e2.sourceSpan, l2, a.length > 0 ? a : void 0, void 0);
  }
  _consumeBlockOpen(e2) {
    let r2 = [];
    for (; this._peek.type === 28; ) {
      let o2 = this._advance();
      r2.push(new ht$1(o2.parts[0], o2.sourceSpan));
    }
    this._peek.type === 26 && this._advance();
    let n2 = this._peek.sourceSpan.fullStart, s2 = new h(e2.sourceSpan.start, n2, e2.sourceSpan.fullStart), i = new h(e2.sourceSpan.start, n2, e2.sourceSpan.fullStart), a = new ee$1(e2.parts[0], r2, [], s2, e2.sourceSpan, i);
    this._pushContainer(a, false);
  }
  _consumeBlockClose(e2) {
    this._popContainer(null, ee$1, e2.sourceSpan) || this.errors.push(L$1.create(null, e2.sourceSpan, 'Unexpected closing block. The block may have been closed earlier. If you meant to write the } character, you should use the "&#125;" HTML entity instead.'));
  }
  _consumeIncompleteBlock(e2) {
    let r2 = [];
    for (; this._peek.type === 28; ) {
      let o2 = this._advance();
      r2.push(new ht$1(o2.parts[0], o2.sourceSpan));
    }
    let n2 = this._peek.sourceSpan.fullStart, s2 = new h(e2.sourceSpan.start, n2, e2.sourceSpan.fullStart), i = new h(e2.sourceSpan.start, n2, e2.sourceSpan.fullStart), a = new ee$1(e2.parts[0], r2, [], s2, e2.sourceSpan, i);
    this._pushContainer(a, false), this._popContainer(null, ee$1, null), this.errors.push(L$1.create(e2.parts[0], s2, `Incomplete block "${e2.parts[0]}". If you meant to write the @ character, you should use the "&#64;" HTML entity instead.`));
  }
  _consumeLet(e2) {
    let r2 = e2.parts[0], n2, s2;
    if (this._peek.type !== 31) {
      this.errors.push(L$1.create(e2.parts[0], e2.sourceSpan, `Invalid @let declaration "${r2}". Declaration must have a value.`));
      return;
    } else n2 = this._advance();
    if (this._peek.type !== 32) {
      this.errors.push(L$1.create(e2.parts[0], e2.sourceSpan, `Unterminated @let declaration "${r2}". Declaration must be terminated with a semicolon.`));
      return;
    } else s2 = this._advance();
    let i = s2.sourceSpan.fullStart, a = new h(e2.sourceSpan.start, i, e2.sourceSpan.fullStart), o2 = e2.sourceSpan.toString().lastIndexOf(r2), u = e2.sourceSpan.start.moveBy(o2), p = new h(u, e2.sourceSpan.end), l2 = new mt$1(r2, n2.parts[0], a, p, n2.sourceSpan);
    this._addToParent(l2);
  }
  _consumeIncompleteLet(e2) {
    let r2 = e2.parts[0] ?? "", n2 = r2 ? ` "${r2}"` : "";
    if (r2.length > 0) {
      let s2 = e2.sourceSpan.toString().lastIndexOf(r2), i = e2.sourceSpan.start.moveBy(s2), a = new h(i, e2.sourceSpan.end), o2 = new h(e2.sourceSpan.start, e2.sourceSpan.start.moveBy(0)), u = new mt$1(r2, "", e2.sourceSpan, a, o2);
      this._addToParent(u);
    }
    this.errors.push(L$1.create(e2.parts[0], e2.sourceSpan, `Incomplete @let declaration${n2}. @let declarations must be written as \`@let <name> = <value>;\``));
  }
  _getContainer() {
    return this._containerStack.length > 0 ? this._containerStack[this._containerStack.length - 1] : null;
  }
  _getClosestParentElement() {
    for (let e2 = this._containerStack.length - 1; e2 > -1; e2--) if (this._containerStack[e2] instanceof Y$1) return this._containerStack[e2];
    return null;
  }
  _addToParent(e2) {
    let r2 = this._getContainer();
    r2 === null ? this.rootNodes.push(e2) : r2.children.push(e2);
  }
  _getElementFullName(e2, r2, n2) {
    if (e2 === "" && (e2 = this.getTagDefinition(r2).implicitNamespacePrefix || "", e2 === "" && n2 != null)) {
      let s2 = ct$1(n2.name)[1];
      this.getTagDefinition(s2).preventNamespaceInheritance || (e2 = Me$1(n2.name));
    }
    return qe$1(e2, r2);
  }
};
function ci(t8, e2) {
  return t8.length > 0 && t8[t8.length - 1] === e2;
}
function pi(t8, e2) {
  return Ve$1[e2] !== void 0 ? Ve$1[e2] || t8 : /^#x[a-f0-9]+$/i.test(e2) ? String.fromCodePoint(parseInt(e2.slice(2), 16)) : /^#\d+$/.test(e2) ? String.fromCodePoint(parseInt(e2.slice(1), 10)) : t8;
}
var ir$1 = class ir extends sr$1 {
  constructor() {
    super(He$1);
  }
  parse(e2, r2, n2, s2 = false, i) {
    return super.parse(e2, r2, n2, s2, i);
  }
};
var Xr$1 = null, Uo$1 = () => (Xr$1 || (Xr$1 = new ir$1()), Xr$1);
function Qr$1(t8, e2 = {}) {
  let { canSelfClose: r2 = false, allowHtmComponentClosingTags: n2 = false, isTagNameCaseSensitive: s2 = false, getTagContentType: i, tokenizeAngularBlocks: a = false, tokenizeAngularLetDeclaration: o2 = false } = e2;
  return Uo$1().parse(t8, "angular-html-parser", { tokenizeExpansionForms: a, interpolationConfig: void 0, canSelfClose: r2, allowHtmComponentClosingTags: n2, tokenizeBlocks: a, tokenizeLet: o2 }, s2, i);
}
function Wo$1(t8, e2) {
  let r2 = new SyntaxError(t8 + " (" + e2.loc.start.line + ":" + e2.loc.start.column + ")");
  return Object.assign(r2, e2);
}
var hi = Wo$1;
var _t$1 = 3;
function Go$1(t8) {
  let e2 = t8.slice(0, _t$1);
  if (e2 !== "---" && e2 !== "+++") return;
  let r2 = t8.indexOf(`
`, _t$1);
  if (r2 === -1) return;
  let n2 = t8.slice(_t$1, r2).trim(), s2 = t8.indexOf(`
${e2}`, r2), i = n2;
  if (i || (i = e2 === "+++" ? "toml" : "yaml"), s2 === -1 && e2 === "---" && i === "yaml" && (s2 = t8.indexOf(`
...`, r2)), s2 === -1) return;
  let a = s2 + 1 + _t$1, o2 = t8.charAt(a + 1);
  if (!/\s?/u.test(o2)) return;
  let u = t8.slice(0, a);
  return { type: "front-matter", language: i, explicitLanguage: n2, value: t8.slice(r2 + 1, s2), startDelimiter: e2, endDelimiter: u.slice(-_t$1), raw: u };
}
function zo$1(t8) {
  let e2 = Go$1(t8);
  if (!e2) return { content: t8 };
  let { raw: r2 } = e2;
  return { frontMatter: e2, content: w$1(false, r2, /[^\n]/gu, " ") + t8.slice(r2.length) };
}
var mi = zo$1;
var ar$1 = { attrs: true, children: true, cases: true, expression: true }, fi = /* @__PURE__ */ new Set(["parent"]), le$1, Jr$1, Zr$1, Ge$1 = class Ge {
  constructor(e2 = {}) {
    At$1(this, le$1);
    lr$1(this, "type");
    lr$1(this, "parent");
    for (let r2 of /* @__PURE__ */ new Set([...fi, ...Object.keys(e2)])) this.setProperty(r2, e2[r2]);
  }
  setProperty(e2, r2) {
    if (this[e2] !== r2) {
      if (e2 in ar$1 && (r2 = r2.map((n2) => this.createChild(n2))), !fi.has(e2)) {
        this[e2] = r2;
        return;
      }
      Object.defineProperty(this, e2, { value: r2, enumerable: false, configurable: true });
    }
  }
  map(e2) {
    let r2;
    for (let n2 in ar$1) {
      let s2 = this[n2];
      if (s2) {
        let i = Yo$1(s2, (a) => a.map(e2));
        r2 !== s2 && (r2 || (r2 = new Ge({ parent: this.parent })), r2.setProperty(n2, i));
      }
    }
    if (r2) for (let n2 in this) n2 in ar$1 || (r2[n2] = this[n2]);
    return e2(r2 || this);
  }
  walk(e2) {
    for (let r2 in ar$1) {
      let n2 = this[r2];
      if (n2) for (let s2 = 0; s2 < n2.length; s2++) n2[s2].walk(e2);
    }
    e2(this);
  }
  createChild(e2) {
    let r2 = e2 instanceof Ge ? e2.clone() : new Ge(e2);
    return r2.setProperty("parent", this), r2;
  }
  insertChildBefore(e2, r2) {
    let n2 = this.$children;
    n2.splice(n2.indexOf(e2), 0, this.createChild(r2));
  }
  removeChild(e2) {
    let r2 = this.$children;
    r2.splice(r2.indexOf(e2), 1);
  }
  replaceChild(e2, r2) {
    let n2 = this.$children;
    n2[n2.indexOf(e2)] = this.createChild(r2);
  }
  clone() {
    return new Ge(this);
  }
  get $children() {
    return this[R$1(this, le$1, Jr$1)];
  }
  set $children(e2) {
    this[R$1(this, le$1, Jr$1)] = e2;
  }
  get firstChild() {
    var e2;
    return (e2 = this.$children) == null ? void 0 : e2[0];
  }
  get lastChild() {
    return K(true, this.$children, -1);
  }
  get prev() {
    let e2 = R$1(this, le$1, Zr$1);
    return e2[e2.indexOf(this) - 1];
  }
  get next() {
    let e2 = R$1(this, le$1, Zr$1);
    return e2[e2.indexOf(this) + 1];
  }
  get rawName() {
    return this.hasExplicitNamespace ? this.fullName : this.name;
  }
  get fullName() {
    return this.namespace ? this.namespace + ":" + this.name : this.name;
  }
  get attrMap() {
    return Object.fromEntries(this.attrs.map((e2) => [e2.fullName, e2.value]));
  }
};
le$1 = /* @__PURE__ */ new WeakSet(), Jr$1 = function() {
  return this.type === "angularIcuCase" ? "expression" : this.type === "angularIcuExpression" ? "cases" : "children";
}, Zr$1 = function() {
  var e2;
  return ((e2 = this.parent) == null ? void 0 : e2.$children) ?? [];
};
var or$1 = Ge$1;
function Yo$1(t8, e2) {
  let r2 = t8.map(e2);
  return r2.some((n2, s2) => n2 !== t8[s2]) ? r2 : t8;
}
var jo$1 = [{ regex: /^(\[if([^\]]*)\]>)(.*?)<!\s*\[endif\]$/su, parse: Ko$1 }, { regex: /^\[if([^\]]*)\]><!$/u, parse: Xo$1 }, { regex: /^<!\s*\[endif\]$/u, parse: Qo$1 }];
function di(t8, e2) {
  if (t8.value) for (let { regex: r2, parse: n2 } of jo$1) {
    let s2 = t8.value.match(r2);
    if (s2) return n2(t8, e2, s2);
  }
  return null;
}
function Ko$1(t8, e2, r2) {
  let [, n2, s2, i] = r2, a = 4 + n2.length, o2 = t8.sourceSpan.start.moveBy(a), u = o2.moveBy(i.length), [p, l2] = (() => {
    try {
      return [true, e2(i, o2).children];
    } catch {
      return [false, [{ type: "text", value: i, sourceSpan: new h(o2, u) }]];
    }
  })();
  return { type: "ieConditionalComment", complete: p, children: l2, condition: w$1(false, s2.trim(), /\s+/gu, " "), sourceSpan: t8.sourceSpan, startSourceSpan: new h(t8.sourceSpan.start, o2), endSourceSpan: new h(u, t8.sourceSpan.end) };
}
function Xo$1(t8, e2, r2) {
  let [, n2] = r2;
  return { type: "ieConditionalStartComment", condition: w$1(false, n2.trim(), /\s+/gu, " "), sourceSpan: t8.sourceSpan };
}
function Qo$1(t8) {
  return { type: "ieConditionalEndComment", sourceSpan: t8.sourceSpan };
}
var ur$1 = /* @__PURE__ */ new Map([["*", /* @__PURE__ */ new Set(["accesskey", "autocapitalize", "autofocus", "class", "contenteditable", "dir", "draggable", "enterkeyhint", "hidden", "id", "inert", "inputmode", "is", "itemid", "itemprop", "itemref", "itemscope", "itemtype", "lang", "nonce", "popover", "slot", "spellcheck", "style", "tabindex", "title", "translate", "writingsuggestions"])], ["a", /* @__PURE__ */ new Set(["charset", "coords", "download", "href", "hreflang", "name", "ping", "referrerpolicy", "rel", "rev", "shape", "target", "type"])], ["applet", /* @__PURE__ */ new Set(["align", "alt", "archive", "code", "codebase", "height", "hspace", "name", "object", "vspace", "width"])], ["area", /* @__PURE__ */ new Set(["alt", "coords", "download", "href", "hreflang", "nohref", "ping", "referrerpolicy", "rel", "shape", "target", "type"])], ["audio", /* @__PURE__ */ new Set(["autoplay", "controls", "crossorigin", "loop", "muted", "preload", "src"])], ["base", /* @__PURE__ */ new Set(["href", "target"])], ["basefont", /* @__PURE__ */ new Set(["color", "face", "size"])], ["blockquote", /* @__PURE__ */ new Set(["cite"])], ["body", /* @__PURE__ */ new Set(["alink", "background", "bgcolor", "link", "text", "vlink"])], ["br", /* @__PURE__ */ new Set(["clear"])], ["button", /* @__PURE__ */ new Set(["disabled", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "name", "popovertarget", "popovertargetaction", "type", "value"])], ["canvas", /* @__PURE__ */ new Set(["height", "width"])], ["caption", /* @__PURE__ */ new Set(["align"])], ["col", /* @__PURE__ */ new Set(["align", "char", "charoff", "span", "valign", "width"])], ["colgroup", /* @__PURE__ */ new Set(["align", "char", "charoff", "span", "valign", "width"])], ["data", /* @__PURE__ */ new Set(["value"])], ["del", /* @__PURE__ */ new Set(["cite", "datetime"])], ["details", /* @__PURE__ */ new Set(["name", "open"])], ["dialog", /* @__PURE__ */ new Set(["open"])], ["dir", /* @__PURE__ */ new Set(["compact"])], ["div", /* @__PURE__ */ new Set(["align"])], ["dl", /* @__PURE__ */ new Set(["compact"])], ["embed", /* @__PURE__ */ new Set(["height", "src", "type", "width"])], ["fieldset", /* @__PURE__ */ new Set(["disabled", "form", "name"])], ["font", /* @__PURE__ */ new Set(["color", "face", "size"])], ["form", /* @__PURE__ */ new Set(["accept", "accept-charset", "action", "autocomplete", "enctype", "method", "name", "novalidate", "target"])], ["frame", /* @__PURE__ */ new Set(["frameborder", "longdesc", "marginheight", "marginwidth", "name", "noresize", "scrolling", "src"])], ["frameset", /* @__PURE__ */ new Set(["cols", "rows"])], ["h1", /* @__PURE__ */ new Set(["align"])], ["h2", /* @__PURE__ */ new Set(["align"])], ["h3", /* @__PURE__ */ new Set(["align"])], ["h4", /* @__PURE__ */ new Set(["align"])], ["h5", /* @__PURE__ */ new Set(["align"])], ["h6", /* @__PURE__ */ new Set(["align"])], ["head", /* @__PURE__ */ new Set(["profile"])], ["hr", /* @__PURE__ */ new Set(["align", "noshade", "size", "width"])], ["html", /* @__PURE__ */ new Set(["manifest", "version"])], ["iframe", /* @__PURE__ */ new Set(["align", "allow", "allowfullscreen", "allowpaymentrequest", "allowusermedia", "frameborder", "height", "loading", "longdesc", "marginheight", "marginwidth", "name", "referrerpolicy", "sandbox", "scrolling", "src", "srcdoc", "width"])], ["img", /* @__PURE__ */ new Set(["align", "alt", "border", "crossorigin", "decoding", "fetchpriority", "height", "hspace", "ismap", "loading", "longdesc", "name", "referrerpolicy", "sizes", "src", "srcset", "usemap", "vspace", "width"])], ["input", /* @__PURE__ */ new Set(["accept", "align", "alt", "autocomplete", "checked", "dirname", "disabled", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "height", "ismap", "list", "max", "maxlength", "min", "minlength", "multiple", "name", "pattern", "placeholder", "popovertarget", "popovertargetaction", "readonly", "required", "size", "src", "step", "type", "usemap", "value", "width"])], ["ins", /* @__PURE__ */ new Set(["cite", "datetime"])], ["isindex", /* @__PURE__ */ new Set(["prompt"])], ["label", /* @__PURE__ */ new Set(["for", "form"])], ["legend", /* @__PURE__ */ new Set(["align"])], ["li", /* @__PURE__ */ new Set(["type", "value"])], ["link", /* @__PURE__ */ new Set(["as", "blocking", "charset", "color", "crossorigin", "disabled", "fetchpriority", "href", "hreflang", "imagesizes", "imagesrcset", "integrity", "media", "referrerpolicy", "rel", "rev", "sizes", "target", "type"])], ["map", /* @__PURE__ */ new Set(["name"])], ["menu", /* @__PURE__ */ new Set(["compact"])], ["meta", /* @__PURE__ */ new Set(["charset", "content", "http-equiv", "media", "name", "scheme"])], ["meter", /* @__PURE__ */ new Set(["high", "low", "max", "min", "optimum", "value"])], ["object", /* @__PURE__ */ new Set(["align", "archive", "border", "classid", "codebase", "codetype", "data", "declare", "form", "height", "hspace", "name", "standby", "type", "typemustmatch", "usemap", "vspace", "width"])], ["ol", /* @__PURE__ */ new Set(["compact", "reversed", "start", "type"])], ["optgroup", /* @__PURE__ */ new Set(["disabled", "label"])], ["option", /* @__PURE__ */ new Set(["disabled", "label", "selected", "value"])], ["output", /* @__PURE__ */ new Set(["for", "form", "name"])], ["p", /* @__PURE__ */ new Set(["align"])], ["param", /* @__PURE__ */ new Set(["name", "type", "value", "valuetype"])], ["pre", /* @__PURE__ */ new Set(["width"])], ["progress", /* @__PURE__ */ new Set(["max", "value"])], ["q", /* @__PURE__ */ new Set(["cite"])], ["script", /* @__PURE__ */ new Set(["async", "blocking", "charset", "crossorigin", "defer", "fetchpriority", "integrity", "language", "nomodule", "referrerpolicy", "src", "type"])], ["select", /* @__PURE__ */ new Set(["autocomplete", "disabled", "form", "multiple", "name", "required", "size"])], ["slot", /* @__PURE__ */ new Set(["name"])], ["source", /* @__PURE__ */ new Set(["height", "media", "sizes", "src", "srcset", "type", "width"])], ["style", /* @__PURE__ */ new Set(["blocking", "media", "type"])], ["table", /* @__PURE__ */ new Set(["align", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "rules", "summary", "width"])], ["tbody", /* @__PURE__ */ new Set(["align", "char", "charoff", "valign"])], ["td", /* @__PURE__ */ new Set(["abbr", "align", "axis", "bgcolor", "char", "charoff", "colspan", "headers", "height", "nowrap", "rowspan", "scope", "valign", "width"])], ["template", /* @__PURE__ */ new Set(["shadowrootclonable", "shadowrootdelegatesfocus", "shadowrootmode"])], ["textarea", /* @__PURE__ */ new Set(["autocomplete", "cols", "dirname", "disabled", "form", "maxlength", "minlength", "name", "placeholder", "readonly", "required", "rows", "wrap"])], ["tfoot", /* @__PURE__ */ new Set(["align", "char", "charoff", "valign"])], ["th", /* @__PURE__ */ new Set(["abbr", "align", "axis", "bgcolor", "char", "charoff", "colspan", "headers", "height", "nowrap", "rowspan", "scope", "valign", "width"])], ["thead", /* @__PURE__ */ new Set(["align", "char", "charoff", "valign"])], ["time", /* @__PURE__ */ new Set(["datetime"])], ["tr", /* @__PURE__ */ new Set(["align", "bgcolor", "char", "charoff", "valign"])], ["track", /* @__PURE__ */ new Set(["default", "kind", "label", "src", "srclang"])], ["ul", /* @__PURE__ */ new Set(["compact", "type"])], ["video", /* @__PURE__ */ new Set(["autoplay", "controls", "crossorigin", "height", "loop", "muted", "playsinline", "poster", "preload", "src", "width"])]]);
var gi = /* @__PURE__ */ new Set(["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "content", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "image", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "math", "menu", "menuitem", "meta", "meter", "multicol", "nav", "nextid", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rbc", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp"]);
function Jo$1(t8) {
  if (t8.type === "block") {
    if (t8.name = w$1(false, t8.name.toLowerCase(), /\s+/gu, " ").trim(), t8.type = "angularControlFlowBlock", !me$1(t8.parameters)) {
      delete t8.parameters;
      return;
    }
    for (let e2 of t8.parameters) e2.type = "angularControlFlowBlockParameter";
    t8.parameters = { type: "angularControlFlowBlockParameters", children: t8.parameters, sourceSpan: new h(t8.parameters[0].sourceSpan.start, K(false, t8.parameters, -1).sourceSpan.end) };
  }
}
function Zo$1(t8) {
  t8.type === "letDeclaration" && (t8.type = "angularLetDeclaration", t8.id = t8.name, t8.init = { type: "angularLetDeclarationInitializer", sourceSpan: new h(t8.valueSpan.start, t8.valueSpan.end), value: t8.value }, delete t8.name, delete t8.value);
}
function eu$1(t8) {
  (t8.type === "plural" || t8.type === "select") && (t8.clause = t8.type, t8.type = "angularIcuExpression"), t8.type === "expansionCase" && (t8.type = "angularIcuCase");
}
function Si(t8, e2, r2) {
  let { name: n2, canSelfClose: s2 = true, normalizeTagName: i = false, normalizeAttributeName: a = false, allowHtmComponentClosingTags: o2 = false, isTagNameCaseSensitive: u = false, shouldParseAsRawText: p } = e2, { rootNodes: l2, errors: m } = Qr$1(t8, { canSelfClose: s2, allowHtmComponentClosingTags: o2, isTagNameCaseSensitive: u, getTagContentType: p ? (...c2) => p(...c2) ? N$1.RAW_TEXT : void 0 : void 0, tokenizeAngularBlocks: n2 === "angular" ? true : void 0, tokenizeAngularLetDeclaration: n2 === "angular" ? true : void 0 });
  if (n2 === "vue") {
    if (l2.some((x) => x.type === "docType" && x.value === "html" || x.type === "element" && x.name.toLowerCase() === "html")) return Si(t8, en$1, r2);
    let g2, y2 = () => g2 ?? (g2 = Qr$1(t8, { canSelfClose: s2, allowHtmComponentClosingTags: o2, isTagNameCaseSensitive: u })), q2 = (x) => y2().rootNodes.find(({ startSourceSpan: U2 }) => U2 && U2.start.offset === x.startSourceSpan.start.offset) ?? x;
    for (let [x, U2] of l2.entries()) {
      let { endSourceSpan: nn2, startSourceSpan: Ei } = U2;
      if (nn2 === null) m = y2().errors, l2[x] = q2(U2);
      else if (tu$1(U2, r2)) {
        let sn2 = y2().errors.find((an2) => an2.span.start.offset > Ei.start.offset && an2.span.start.offset < nn2.end.offset);
        sn2 && Ci(sn2), l2[x] = q2(U2);
      }
    }
  }
  m.length > 0 && Ci(m[0]);
  let f = (c2) => {
    let g2 = c2.name.startsWith(":") ? c2.name.slice(1).split(":")[0] : null, y2 = c2.nameSpan.toString(), q2 = g2 !== null && y2.startsWith(`${g2}:`), x = q2 ? y2.slice(g2.length + 1) : y2;
    c2.name = x, c2.namespace = g2, c2.hasExplicitNamespace = q2;
  }, C = (c2) => {
    switch (c2.type) {
      case "element":
        f(c2);
        for (let g2 of c2.attrs) f(g2), g2.valueSpan ? (g2.value = g2.valueSpan.toString(), /["']/u.test(g2.value[0]) && (g2.value = g2.value.slice(1, -1))) : g2.value = null;
        break;
      case "comment":
        c2.value = c2.sourceSpan.toString().slice(4, -3);
        break;
      case "text":
        c2.value = c2.sourceSpan.toString();
        break;
    }
  }, A = (c2, g2) => {
    let y2 = c2.toLowerCase();
    return g2(y2) ? y2 : c2;
  }, D = (c2) => {
    if (c2.type === "element" && (i && (!c2.namespace || c2.namespace === c2.tagDefinition.implicitNamespacePrefix || fe$1(c2)) && (c2.name = A(c2.name, (g2) => gi.has(g2))), a)) for (let g2 of c2.attrs) g2.namespace || (g2.name = A(g2.name, (y2) => ur$1.has(c2.name) && (ur$1.get("*").has(y2) || ur$1.get(c2.name).has(y2))));
  }, I2 = (c2) => {
    c2.sourceSpan && c2.endSourceSpan && (c2.sourceSpan = new h(c2.sourceSpan.start, c2.endSourceSpan.end));
  }, F = (c2) => {
    if (c2.type === "element") {
      let g2 = He$1(u ? c2.name : c2.name.toLowerCase());
      !c2.namespace || c2.namespace === g2.implicitNamespacePrefix || fe$1(c2) ? c2.tagDefinition = g2 : c2.tagDefinition = He$1("");
    }
  };
  return Qt$1(new class extends ft$1 {
    visitExpansionCase(c2, g2) {
      n2 === "angular" && this.visitChildren(g2, (y2) => {
        y2(c2.expression);
      });
    }
    visit(c2) {
      C(c2), F(c2), D(c2), I2(c2);
    }
  }(), l2), l2;
}
function tu$1(t8, e2) {
  var n2;
  if (t8.type !== "element" || t8.name !== "template") return false;
  let r2 = (n2 = t8.attrs.find((s2) => s2.name === "lang")) == null ? void 0 : n2.value;
  return !r2 || Ne$1(e2, { language: r2 }) === "html";
}
function Ci(t8) {
  let { msg: e2, span: { start: r2, end: n2 } } = t8;
  throw hi(e2, { loc: { start: { line: r2.line + 1, column: r2.col + 1 }, end: { line: n2.line + 1, column: n2.col + 1 } }, cause: t8 });
}
function _i(t8, e2, r2 = {}, n2 = true) {
  let { frontMatter: s2, content: i } = n2 ? mi(t8) : { frontMatter: null, content: t8 }, a = new ve$1(t8, r2.filepath), o2 = new ie$1(a, 0, 0, 0), u = o2.moveBy(t8.length), p = { type: "root", sourceSpan: new h(o2, u), children: Si(i, e2, r2) };
  if (s2) {
    let f = new ie$1(a, 0, 0, 0), C = f.moveBy(s2.raw.length);
    s2.sourceSpan = new h(f, C), p.children.unshift(s2);
  }
  let l2 = new or$1(p), m = (f, C) => {
    let { offset: A } = C, D = w$1(false, t8.slice(0, A), /[^\n\r]/gu, " "), F = _i(D + f, e2, r2, false);
    F.sourceSpan = new h(C, K(false, F.children, -1).sourceSpan.end);
    let c2 = F.children[0];
    return c2.length === A ? F.children.shift() : (c2.sourceSpan = new h(c2.sourceSpan.start.moveBy(A), c2.sourceSpan.end), c2.value = c2.value.slice(A)), F;
  };
  return l2.walk((f) => {
    if (f.type === "comment") {
      let C = di(f, m);
      C && f.parent.replaceChild(f, C);
    }
    Jo$1(f), Zo$1(f), eu$1(f);
  }), l2;
}
function Et$1(t8) {
  return { parse: (e2, r2) => _i(e2, t8, r2), hasPragma: ws$1, hasIgnorePragma: bs, astFormat: "html", locStart: J$1, locEnd: se$1 };
}
var en$1 = { name: "html", normalizeTagName: true, normalizeAttributeName: true, allowHtmComponentClosingTags: true }, ru$1 = Et$1(en$1), nu$1 = /* @__PURE__ */ new Set(["mj-style", "mj-raw"]), su$1 = Et$1({ ...en$1, name: "mjml", shouldParseAsRawText: (t8) => nu$1.has(t8) }), iu$1 = Et$1({ name: "angular" }), au$1 = Et$1({ name: "vue", isTagNameCaseSensitive: true, shouldParseAsRawText(t8, e2, r2, n2) {
  return t8.toLowerCase() !== "html" && !r2 && (t8 !== "template" || n2.some(({ name: s2, value: i }) => s2 === "lang" && i !== "html" && i !== "" && i !== void 0));
} }), ou$1 = Et$1({ name: "lwc", canSelfClose: false });
var uu$1 = { html: qs };
var ym = rn$1;
const html = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ym,
  languages: Hs,
  options: Us,
  parsers: tn$1,
  printers: uu$1
}, Symbol.toStringTag, { value: "Module" }));
var Fu = Object.create;
var pt = Object.defineProperty;
var pu = Object.getOwnPropertyDescriptor;
var du = Object.getOwnPropertyNames;
var mu = Object.getPrototypeOf, Eu = Object.prototype.hasOwnProperty;
var er = (e2) => {
  throw TypeError(e2);
};
var Cu = (e2, t8) => () => (t8 || e2((t8 = { exports: {} }).exports, t8), t8.exports), dt = (e2, t8) => {
  for (var r2 in t8) pt(e2, r2, { get: t8[r2], enumerable: true });
}, hu = (e2, t8, r2, n2) => {
  if (t8 && typeof t8 == "object" || typeof t8 == "function") for (let u of du(t8)) !Eu.call(e2, u) && u !== r2 && pt(e2, u, { get: () => t8[u], enumerable: !(n2 = pu(t8, u)) || n2.enumerable });
  return e2;
};
var gu = (e2, t8, r2) => (r2 = e2 != null ? Fu(mu(e2)) : {}, hu(pt(r2, "default", { value: e2, enumerable: true }), e2));
var yu = (e2, t8, r2) => t8.has(e2) || er("Cannot " + r2);
var tr = (e2, t8, r2) => t8.has(e2) ? er("Cannot add the same private member more than once") : t8 instanceof WeakSet ? t8.add(e2) : t8.set(e2, r2);
var fe = (e2, t8, r2) => (yu(e2, t8, "access private method"), r2);
var Pn = Cu((Mt2) => {
  Object.defineProperty(Mt2, "__esModule", { value: true });
  function Co() {
    return new Proxy({}, { get: () => (e2) => e2 });
  }
  var On2 = /\r\n|[\n\r\u2028\u2029]/;
  function ho2(e2, t8, r2) {
    let n2 = Object.assign({ column: 0, line: -1 }, e2.start), u = Object.assign({}, n2, e2.end), { linesAbove: o2 = 2, linesBelow: i = 3 } = r2 || {}, s2 = n2.line, a = n2.column, c2 = u.line, D = u.column, p = Math.max(s2 - (o2 + 1), 0), l2 = Math.min(t8.length, c2 + i);
    s2 === -1 && (p = 0), c2 === -1 && (l2 = t8.length);
    let F = c2 - s2, f = {};
    if (F) for (let d2 = 0; d2 <= F; d2++) {
      let m = d2 + s2;
      if (!a) f[m] = true;
      else if (d2 === 0) {
        let C = t8[m - 1].length;
        f[m] = [a, C - a + 1];
      } else if (d2 === F) f[m] = [0, D];
      else {
        let C = t8[m - d2].length;
        f[m] = [0, C];
      }
    }
    else a === D ? a ? f[s2] = [a, 0] : f[s2] = true : f[s2] = [a, D - a];
    return { start: p, end: l2, markerLines: f };
  }
  function go2(e2, t8, r2 = {}) {
    let u = Co(), o2 = e2.split(On2), { start: i, end: s2, markerLines: a } = ho2(t8, o2, r2), c2 = t8.start && typeof t8.start.column == "number", D = String(s2).length, l2 = e2.split(On2, s2).slice(i, s2).map((F, f) => {
      let d2 = i + 1 + f, C = ` ${` ${d2}`.slice(-D)} |`, E2 = a[d2], h2 = !a[d2 + 1];
      if (E2) {
        let x = "";
        if (Array.isArray(E2)) {
          let A = F.slice(0, Math.max(E2[0] - 1, 0)).replace(/[^\t]/g, " "), $2 = E2[1] || 1;
          x = [`
 `, u.gutter(C.replace(/\d/g, " ")), " ", A, u.marker("^").repeat($2)].join(""), h2 && r2.message && (x += " " + u.message(r2.message));
        }
        return [u.marker(">"), u.gutter(C), F.length > 0 ? ` ${F}` : "", x].join("");
      } else return ` ${u.gutter(C)}${F.length > 0 ? ` ${F}` : ""}`;
    }).join(`
`);
    return r2.message && !c2 && (l2 = `${" ".repeat(D + 1)}${r2.message}
${l2}`), l2;
  }
  Mt2.codeFrameColumns = go2;
});
var Zt = {};
dt(Zt, { __debug: () => ui, check: () => ri, doc: () => qt, format: () => fu, formatWithCursor: () => cu, getSupportInfo: () => ni, util: () => Qt, version: () => tu });
var Au = (e2, t8, r2, n2) => {
  if (!(e2 && t8 == null)) return t8.replaceAll ? t8.replaceAll(r2, n2) : r2.global ? t8.replace(r2, n2) : t8.split(r2).join(n2);
}, te = Au;
var _e = class {
  diff(t8, r2, n2 = {}) {
    let u;
    typeof n2 == "function" ? (u = n2, n2 = {}) : "callback" in n2 && (u = n2.callback);
    let o2 = this.castInput(t8, n2), i = this.castInput(r2, n2), s2 = this.removeEmpty(this.tokenize(o2, n2)), a = this.removeEmpty(this.tokenize(i, n2));
    return this.diffWithOptionsObj(s2, a, n2, u);
  }
  diffWithOptionsObj(t8, r2, n2, u) {
    var o2;
    let i = (E2) => {
      if (E2 = this.postProcess(E2, n2), u) {
        setTimeout(function() {
          u(E2);
        }, 0);
        return;
      } else return E2;
    }, s2 = r2.length, a = t8.length, c2 = 1, D = s2 + a;
    n2.maxEditLength != null && (D = Math.min(D, n2.maxEditLength));
    let p = (o2 = n2.timeout) !== null && o2 !== void 0 ? o2 : 1 / 0, l2 = Date.now() + p, F = [{ oldPos: -1, lastComponent: void 0 }], f = this.extractCommon(F[0], r2, t8, 0, n2);
    if (F[0].oldPos + 1 >= a && f + 1 >= s2) return i(this.buildValues(F[0].lastComponent, r2, t8));
    let d2 = -1 / 0, m = 1 / 0, C = () => {
      for (let E2 = Math.max(d2, -c2); E2 <= Math.min(m, c2); E2 += 2) {
        let h2, x = F[E2 - 1], A = F[E2 + 1];
        x && (F[E2 - 1] = void 0);
        let $2 = false;
        if (A) {
          let Be2 = A.oldPos - E2;
          $2 = A && 0 <= Be2 && Be2 < s2;
        }
        let ue = x && x.oldPos + 1 < a;
        if (!$2 && !ue) {
          F[E2] = void 0;
          continue;
        }
        if (!ue || $2 && x.oldPos < A.oldPos ? h2 = this.addToPath(A, true, false, 0, n2) : h2 = this.addToPath(x, false, true, 1, n2), f = this.extractCommon(h2, r2, t8, E2, n2), h2.oldPos + 1 >= a && f + 1 >= s2) return i(this.buildValues(h2.lastComponent, r2, t8)) || true;
        F[E2] = h2, h2.oldPos + 1 >= a && (m = Math.min(m, E2 - 1)), f + 1 >= s2 && (d2 = Math.max(d2, E2 + 1));
      }
      c2++;
    };
    if (u) (function E2() {
      setTimeout(function() {
        if (c2 > D || Date.now() > l2) return u(void 0);
        C() || E2();
      }, 0);
    })();
    else for (; c2 <= D && Date.now() <= l2; ) {
      let E2 = C();
      if (E2) return E2;
    }
  }
  addToPath(t8, r2, n2, u, o2) {
    let i = t8.lastComponent;
    return i && !o2.oneChangePerToken && i.added === r2 && i.removed === n2 ? { oldPos: t8.oldPos + u, lastComponent: { count: i.count + 1, added: r2, removed: n2, previousComponent: i.previousComponent } } : { oldPos: t8.oldPos + u, lastComponent: { count: 1, added: r2, removed: n2, previousComponent: i } };
  }
  extractCommon(t8, r2, n2, u, o2) {
    let i = r2.length, s2 = n2.length, a = t8.oldPos, c2 = a - u, D = 0;
    for (; c2 + 1 < i && a + 1 < s2 && this.equals(n2[a + 1], r2[c2 + 1], o2); ) c2++, a++, D++, o2.oneChangePerToken && (t8.lastComponent = { count: 1, previousComponent: t8.lastComponent, added: false, removed: false });
    return D && !o2.oneChangePerToken && (t8.lastComponent = { count: D, previousComponent: t8.lastComponent, added: false, removed: false }), t8.oldPos = a, c2;
  }
  equals(t8, r2, n2) {
    return n2.comparator ? n2.comparator(t8, r2) : t8 === r2 || !!n2.ignoreCase && t8.toLowerCase() === r2.toLowerCase();
  }
  removeEmpty(t8) {
    let r2 = [];
    for (let n2 = 0; n2 < t8.length; n2++) t8[n2] && r2.push(t8[n2]);
    return r2;
  }
  castInput(t8, r2) {
    return t8;
  }
  tokenize(t8, r2) {
    return Array.from(t8);
  }
  join(t8) {
    return t8.join("");
  }
  postProcess(t8, r2) {
    return t8;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(t8, r2, n2) {
    let u = [], o2;
    for (; t8; ) u.push(t8), o2 = t8.previousComponent, delete t8.previousComponent, t8 = o2;
    u.reverse();
    let i = u.length, s2 = 0, a = 0, c2 = 0;
    for (; s2 < i; s2++) {
      let D = u[s2];
      if (D.removed) D.value = this.join(n2.slice(c2, c2 + D.count)), c2 += D.count;
      else {
        if (!D.added && this.useLongestToken) {
          let p = r2.slice(a, a + D.count);
          p = p.map(function(l2, F) {
            let f = n2[c2 + F];
            return f.length > l2.length ? f : l2;
          }), D.value = this.join(p);
        } else D.value = this.join(r2.slice(a, a + D.count));
        a += D.count, D.added || (c2 += D.count);
      }
    }
    return u;
  }
};
var mt2 = class extends _e {
  tokenize(t8) {
    return t8.slice();
  }
  join(t8) {
    return t8;
  }
  removeEmpty(t8) {
    return t8;
  }
}, rr = new mt2();
function Et(e2, t8, r2) {
  return rr.diff(e2, t8, r2);
}
function nr(e2) {
  let t8 = e2.indexOf("\r");
  return t8 !== -1 ? e2.charAt(t8 + 1) === `
` ? "crlf" : "cr" : "lf";
}
function xe(e2) {
  switch (e2) {
    case "cr":
      return "\r";
    case "crlf":
      return `\r
`;
    default:
      return `
`;
  }
}
function Ct2(e2, t8) {
  let r2;
  switch (t8) {
    case `
`:
      r2 = /\n/gu;
      break;
    case "\r":
      r2 = /\r/gu;
      break;
    case `\r
`:
      r2 = /\r\n/gu;
      break;
    default:
      throw new Error(`Unexpected "eol" ${JSON.stringify(t8)}.`);
  }
  let n2 = e2.match(r2);
  return n2 ? n2.length : 0;
}
function ur(e2) {
  return te(false, e2, /\r\n?/gu, `
`);
}
var W = "string", Y2 = "array", j = "cursor", N = "indent", O = "align", P = "trim", B = "group", k = "fill", _ = "if-break", v = "indent-if-break", L = "line-suffix", I$1 = "line-suffix-boundary", g = "line", S = "label", w = "break-parent", Ue = /* @__PURE__ */ new Set([j, N, O, P, B, k, _, v, L, I$1, g, S, w]);
var Bu = (e2, t8, r2) => {
  if (!(e2 && t8 == null)) return Array.isArray(t8) || typeof t8 == "string" ? t8[r2 < 0 ? t8.length + r2 : r2] : t8.at(r2);
}, y = Bu;
function or(e2) {
  let t8 = e2.length;
  for (; t8 > 0 && (e2[t8 - 1] === "\r" || e2[t8 - 1] === `
`); ) t8--;
  return t8 < e2.length ? e2.slice(0, t8) : e2;
}
function _u(e2) {
  if (typeof e2 == "string") return W;
  if (Array.isArray(e2)) return Y2;
  if (!e2) return;
  let { type: t8 } = e2;
  if (Ue.has(t8)) return t8;
}
var M = _u;
var xu = (e2) => new Intl.ListFormat("en-US", { type: "disjunction" }).format(e2);
function wu(e2) {
  let t8 = e2 === null ? "null" : typeof e2;
  if (t8 !== "string" && t8 !== "object") return `Unexpected doc '${t8}', 
Expected it to be 'string' or 'object'.`;
  if (M(e2)) throw new Error("doc is valid.");
  let r2 = Object.prototype.toString.call(e2);
  if (r2 !== "[object Object]") return `Unexpected doc '${r2}'.`;
  let n2 = xu([...Ue].map((u) => `'${u}'`));
  return `Unexpected doc.type '${e2.type}'.
Expected it to be ${n2}.`;
}
var ht2 = class extends Error {
  name = "InvalidDocError";
  constructor(t8) {
    super(wu(t8)), this.doc = t8;
  }
}, q = ht2;
var ir2 = {};
function bu(e2, t8, r2, n2) {
  let u = [e2];
  for (; u.length > 0; ) {
    let o2 = u.pop();
    if (o2 === ir2) {
      r2(u.pop());
      continue;
    }
    r2 && u.push(o2, ir2);
    let i = M(o2);
    if (!i) throw new q(o2);
    if ((t8 == null ? void 0 : t8(o2)) !== false) switch (i) {
      case Y2:
      case k: {
        let s2 = i === Y2 ? o2 : o2.parts;
        for (let a = s2.length, c2 = a - 1; c2 >= 0; --c2) u.push(s2[c2]);
        break;
      }
      case _:
        u.push(o2.flatContents, o2.breakContents);
        break;
      case B:
        if (n2 && o2.expandedStates) for (let s2 = o2.expandedStates.length, a = s2 - 1; a >= 0; --a) u.push(o2.expandedStates[a]);
        else u.push(o2.contents);
        break;
      case O:
      case N:
      case v:
      case S:
      case L:
        u.push(o2.contents);
        break;
      case W:
      case j:
      case P:
      case I$1:
      case g:
      case w:
        break;
      default:
        throw new q(o2);
    }
  }
}
var le = bu;
function be(e2, t8) {
  if (typeof e2 == "string") return t8(e2);
  let r2 = /* @__PURE__ */ new Map();
  return n2(e2);
  function n2(o2) {
    if (r2.has(o2)) return r2.get(o2);
    let i = u(o2);
    return r2.set(o2, i), i;
  }
  function u(o2) {
    switch (M(o2)) {
      case Y2:
        return t8(o2.map(n2));
      case k:
        return t8({ ...o2, parts: o2.parts.map(n2) });
      case _:
        return t8({ ...o2, breakContents: n2(o2.breakContents), flatContents: n2(o2.flatContents) });
      case B: {
        let { expandedStates: i, contents: s2 } = o2;
        return i ? (i = i.map(n2), s2 = i[0]) : s2 = n2(s2), t8({ ...o2, contents: s2, expandedStates: i });
      }
      case O:
      case N:
      case v:
      case S:
      case L:
        return t8({ ...o2, contents: n2(o2.contents) });
      case W:
      case j:
      case P:
      case I$1:
      case g:
      case w:
        return t8(o2);
      default:
        throw new q(o2);
    }
  }
}
function Ve(e2, t8, r2) {
  let n2 = r2, u = false;
  function o2(i) {
    if (u) return false;
    let s2 = t8(i);
    s2 !== void 0 && (u = true, n2 = s2);
  }
  return le(e2, o2), n2;
}
function ku(e2) {
  if (e2.type === B && e2.break || e2.type === g && e2.hard || e2.type === w) return true;
}
function Dr(e2) {
  return Ve(e2, ku, false);
}
function sr2(e2) {
  if (e2.length > 0) {
    let t8 = y(false, e2, -1);
    !t8.expandedStates && !t8.break && (t8.break = "propagated");
  }
  return null;
}
function cr2(e2) {
  let t8 = /* @__PURE__ */ new Set(), r2 = [];
  function n2(o2) {
    if (o2.type === w && sr2(r2), o2.type === B) {
      if (r2.push(o2), t8.has(o2)) return false;
      t8.add(o2);
    }
  }
  function u(o2) {
    o2.type === B && r2.pop().break && sr2(r2);
  }
  le(e2, n2, u, true);
}
function Su(e2) {
  return e2.type === g && !e2.hard ? e2.soft ? "" : " " : e2.type === _ ? e2.flatContents : e2;
}
function fr(e2) {
  return be(e2, Su);
}
function ar(e2) {
  for (e2 = [...e2]; e2.length >= 2 && y(false, e2, -2).type === g && y(false, e2, -1).type === w; ) e2.length -= 2;
  if (e2.length > 0) {
    let t8 = we(y(false, e2, -1));
    e2[e2.length - 1] = t8;
  }
  return e2;
}
function we(e2) {
  switch (M(e2)) {
    case N:
    case v:
    case B:
    case L:
    case S: {
      let t8 = we(e2.contents);
      return { ...e2, contents: t8 };
    }
    case _:
      return { ...e2, breakContents: we(e2.breakContents), flatContents: we(e2.flatContents) };
    case k:
      return { ...e2, parts: ar(e2.parts) };
    case Y2:
      return ar(e2);
    case W:
      return or(e2);
    case O:
    case j:
    case P:
    case I$1:
    case g:
    case w:
      break;
    default:
      throw new q(e2);
  }
  return e2;
}
function $e(e2) {
  return we(Nu(e2));
}
function Tu(e2) {
  switch (M(e2)) {
    case k:
      if (e2.parts.every((t8) => t8 === "")) return "";
      break;
    case B:
      if (!e2.contents && !e2.id && !e2.break && !e2.expandedStates) return "";
      if (e2.contents.type === B && e2.contents.id === e2.id && e2.contents.break === e2.break && e2.contents.expandedStates === e2.expandedStates) return e2.contents;
      break;
    case O:
    case N:
    case v:
    case L:
      if (!e2.contents) return "";
      break;
    case _:
      if (!e2.flatContents && !e2.breakContents) return "";
      break;
    case Y2: {
      let t8 = [];
      for (let r2 of e2) {
        if (!r2) continue;
        let [n2, ...u] = Array.isArray(r2) ? r2 : [r2];
        typeof n2 == "string" && typeof y(false, t8, -1) == "string" ? t8[t8.length - 1] += n2 : t8.push(n2), t8.push(...u);
      }
      return t8.length === 0 ? "" : t8.length === 1 ? t8[0] : t8;
    }
    case W:
    case j:
    case P:
    case I$1:
    case g:
    case S:
    case w:
      break;
    default:
      throw new q(e2);
  }
  return e2;
}
function Nu(e2) {
  return be(e2, (t8) => Tu(t8));
}
function lr(e2, t8 = We) {
  return be(e2, (r2) => typeof r2 == "string" ? ke(t8, r2.split(`
`)) : r2);
}
function Ou(e2) {
  if (e2.type === g) return true;
}
function Fr(e2) {
  return Ve(e2, Ou, false);
}
function Fe(e2, t8) {
  return e2.type === S ? { ...e2, contents: t8(e2.contents) } : t8(e2);
}
var gt2 = () => {
}, yt = gt2;
function ie(e2) {
  return { type: N, contents: e2 };
}
function oe(e2, t8) {
  return { type: O, contents: t8, n: e2 };
}
function At(e2, t8 = {}) {
  return yt(t8.expandedStates), { type: B, id: t8.id, contents: e2, break: !!t8.shouldBreak, expandedStates: t8.expandedStates };
}
function dr(e2) {
  return oe(Number.NEGATIVE_INFINITY, e2);
}
function mr(e2) {
  return oe({ type: "root" }, e2);
}
function Er(e2) {
  return oe(-1, e2);
}
function Cr2(e2, t8) {
  return At(e2[0], { ...t8, expandedStates: e2 });
}
function hr(e2) {
  return { type: k, parts: e2 };
}
function gr2(e2, t8 = "", r2 = {}) {
  return { type: _, breakContents: e2, flatContents: t8, groupId: r2.groupId };
}
function yr(e2, t8) {
  return { type: v, contents: e2, groupId: t8.groupId, negate: t8.negate };
}
function Se(e2) {
  return { type: L, contents: e2 };
}
var Ar = { type: I$1 }, pe = { type: w }, Br = { type: P }, Te = { type: g, hard: true }, Bt = { type: g, hard: true, literal: true }, Me = { type: g }, _r = { type: g, soft: true }, z = [Te, pe], We = [Bt, pe], X = { type: j };
function ke(e2, t8) {
  let r2 = [];
  for (let n2 = 0; n2 < t8.length; n2++) n2 !== 0 && r2.push(e2), r2.push(t8[n2]);
  return r2;
}
function Ge2(e2, t8, r2) {
  let n2 = e2;
  if (t8 > 0) {
    for (let u = 0; u < Math.floor(t8 / r2); ++u) n2 = ie(n2);
    n2 = oe(t8 % r2, n2), n2 = oe(Number.NEGATIVE_INFINITY, n2);
  }
  return n2;
}
function xr(e2, t8) {
  return e2 ? { type: S, label: e2, contents: t8 } : t8;
}
function Q(e2) {
  var t8;
  if (!e2) return "";
  if (Array.isArray(e2)) {
    let r2 = [];
    for (let n2 of e2) if (Array.isArray(n2)) r2.push(...Q(n2));
    else {
      let u = Q(n2);
      u !== "" && r2.push(u);
    }
    return r2;
  }
  return e2.type === _ ? { ...e2, breakContents: Q(e2.breakContents), flatContents: Q(e2.flatContents) } : e2.type === B ? { ...e2, contents: Q(e2.contents), expandedStates: (t8 = e2.expandedStates) == null ? void 0 : t8.map(Q) } : e2.type === k ? { type: "fill", parts: e2.parts.map(Q) } : e2.contents ? { ...e2, contents: Q(e2.contents) } : e2;
}
function wr(e2) {
  let t8 = /* @__PURE__ */ Object.create(null), r2 = /* @__PURE__ */ new Set();
  return n2(Q(e2));
  function n2(o2, i, s2) {
    var a, c2;
    if (typeof o2 == "string") return JSON.stringify(o2);
    if (Array.isArray(o2)) {
      let D = o2.map(n2).filter(Boolean);
      return D.length === 1 ? D[0] : `[${D.join(", ")}]`;
    }
    if (o2.type === g) {
      let D = ((a = s2 == null ? void 0 : s2[i + 1]) == null ? void 0 : a.type) === w;
      return o2.literal ? D ? "literalline" : "literallineWithoutBreakParent" : o2.hard ? D ? "hardline" : "hardlineWithoutBreakParent" : o2.soft ? "softline" : "line";
    }
    if (o2.type === w) return ((c2 = s2 == null ? void 0 : s2[i - 1]) == null ? void 0 : c2.type) === g && s2[i - 1].hard ? void 0 : "breakParent";
    if (o2.type === P) return "trim";
    if (o2.type === N) return "indent(" + n2(o2.contents) + ")";
    if (o2.type === O) return o2.n === Number.NEGATIVE_INFINITY ? "dedentToRoot(" + n2(o2.contents) + ")" : o2.n < 0 ? "dedent(" + n2(o2.contents) + ")" : o2.n.type === "root" ? "markAsRoot(" + n2(o2.contents) + ")" : "align(" + JSON.stringify(o2.n) + ", " + n2(o2.contents) + ")";
    if (o2.type === _) return "ifBreak(" + n2(o2.breakContents) + (o2.flatContents ? ", " + n2(o2.flatContents) : "") + (o2.groupId ? (o2.flatContents ? "" : ', ""') + `, { groupId: ${u(o2.groupId)} }` : "") + ")";
    if (o2.type === v) {
      let D = [];
      o2.negate && D.push("negate: true"), o2.groupId && D.push(`groupId: ${u(o2.groupId)}`);
      let p = D.length > 0 ? `, { ${D.join(", ")} }` : "";
      return `indentIfBreak(${n2(o2.contents)}${p})`;
    }
    if (o2.type === B) {
      let D = [];
      o2.break && o2.break !== "propagated" && D.push("shouldBreak: true"), o2.id && D.push(`id: ${u(o2.id)}`);
      let p = D.length > 0 ? `, { ${D.join(", ")} }` : "";
      return o2.expandedStates ? `conditionalGroup([${o2.expandedStates.map((l2) => n2(l2)).join(",")}]${p})` : `group(${n2(o2.contents)}${p})`;
    }
    if (o2.type === k) return `fill([${o2.parts.map((D) => n2(D)).join(", ")}])`;
    if (o2.type === L) return "lineSuffix(" + n2(o2.contents) + ")";
    if (o2.type === I$1) return "lineSuffixBoundary";
    if (o2.type === S) return `label(${JSON.stringify(o2.label)}, ${n2(o2.contents)})`;
    if (o2.type === j) return "cursor";
    throw new Error("Unknown doc type " + o2.type);
  }
  function u(o2) {
    if (typeof o2 != "symbol") return JSON.stringify(String(o2));
    if (o2 in t8) return t8[o2];
    let i = o2.description || "symbol";
    for (let s2 = 0; ; s2++) {
      let a = i + (s2 > 0 ? ` #${s2}` : "");
      if (!r2.has(a)) return r2.add(a), t8[o2] = `Symbol.for(${JSON.stringify(a)})`;
    }
  }
}
var br = () => /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE89\uDE8F-\uDEC2\uDEC6\uDECE-\uDEDC\uDEDF-\uDEE9]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
function kr(e2) {
  return e2 === 12288 || e2 >= 65281 && e2 <= 65376 || e2 >= 65504 && e2 <= 65510;
}
function Sr(e2) {
  return e2 >= 4352 && e2 <= 4447 || e2 === 8986 || e2 === 8987 || e2 === 9001 || e2 === 9002 || e2 >= 9193 && e2 <= 9196 || e2 === 9200 || e2 === 9203 || e2 === 9725 || e2 === 9726 || e2 === 9748 || e2 === 9749 || e2 >= 9776 && e2 <= 9783 || e2 >= 9800 && e2 <= 9811 || e2 === 9855 || e2 >= 9866 && e2 <= 9871 || e2 === 9875 || e2 === 9889 || e2 === 9898 || e2 === 9899 || e2 === 9917 || e2 === 9918 || e2 === 9924 || e2 === 9925 || e2 === 9934 || e2 === 9940 || e2 === 9962 || e2 === 9970 || e2 === 9971 || e2 === 9973 || e2 === 9978 || e2 === 9981 || e2 === 9989 || e2 === 9994 || e2 === 9995 || e2 === 10024 || e2 === 10060 || e2 === 10062 || e2 >= 10067 && e2 <= 10069 || e2 === 10071 || e2 >= 10133 && e2 <= 10135 || e2 === 10160 || e2 === 10175 || e2 === 11035 || e2 === 11036 || e2 === 11088 || e2 === 11093 || e2 >= 11904 && e2 <= 11929 || e2 >= 11931 && e2 <= 12019 || e2 >= 12032 && e2 <= 12245 || e2 >= 12272 && e2 <= 12287 || e2 >= 12289 && e2 <= 12350 || e2 >= 12353 && e2 <= 12438 || e2 >= 12441 && e2 <= 12543 || e2 >= 12549 && e2 <= 12591 || e2 >= 12593 && e2 <= 12686 || e2 >= 12688 && e2 <= 12773 || e2 >= 12783 && e2 <= 12830 || e2 >= 12832 && e2 <= 12871 || e2 >= 12880 && e2 <= 42124 || e2 >= 42128 && e2 <= 42182 || e2 >= 43360 && e2 <= 43388 || e2 >= 44032 && e2 <= 55203 || e2 >= 63744 && e2 <= 64255 || e2 >= 65040 && e2 <= 65049 || e2 >= 65072 && e2 <= 65106 || e2 >= 65108 && e2 <= 65126 || e2 >= 65128 && e2 <= 65131 || e2 >= 94176 && e2 <= 94180 || e2 === 94192 || e2 === 94193 || e2 >= 94208 && e2 <= 100343 || e2 >= 100352 && e2 <= 101589 || e2 >= 101631 && e2 <= 101640 || e2 >= 110576 && e2 <= 110579 || e2 >= 110581 && e2 <= 110587 || e2 === 110589 || e2 === 110590 || e2 >= 110592 && e2 <= 110882 || e2 === 110898 || e2 >= 110928 && e2 <= 110930 || e2 === 110933 || e2 >= 110948 && e2 <= 110951 || e2 >= 110960 && e2 <= 111355 || e2 >= 119552 && e2 <= 119638 || e2 >= 119648 && e2 <= 119670 || e2 === 126980 || e2 === 127183 || e2 === 127374 || e2 >= 127377 && e2 <= 127386 || e2 >= 127488 && e2 <= 127490 || e2 >= 127504 && e2 <= 127547 || e2 >= 127552 && e2 <= 127560 || e2 === 127568 || e2 === 127569 || e2 >= 127584 && e2 <= 127589 || e2 >= 127744 && e2 <= 127776 || e2 >= 127789 && e2 <= 127797 || e2 >= 127799 && e2 <= 127868 || e2 >= 127870 && e2 <= 127891 || e2 >= 127904 && e2 <= 127946 || e2 >= 127951 && e2 <= 127955 || e2 >= 127968 && e2 <= 127984 || e2 === 127988 || e2 >= 127992 && e2 <= 128062 || e2 === 128064 || e2 >= 128066 && e2 <= 128252 || e2 >= 128255 && e2 <= 128317 || e2 >= 128331 && e2 <= 128334 || e2 >= 128336 && e2 <= 128359 || e2 === 128378 || e2 === 128405 || e2 === 128406 || e2 === 128420 || e2 >= 128507 && e2 <= 128591 || e2 >= 128640 && e2 <= 128709 || e2 === 128716 || e2 >= 128720 && e2 <= 128722 || e2 >= 128725 && e2 <= 128727 || e2 >= 128732 && e2 <= 128735 || e2 === 128747 || e2 === 128748 || e2 >= 128756 && e2 <= 128764 || e2 >= 128992 && e2 <= 129003 || e2 === 129008 || e2 >= 129292 && e2 <= 129338 || e2 >= 129340 && e2 <= 129349 || e2 >= 129351 && e2 <= 129535 || e2 >= 129648 && e2 <= 129660 || e2 >= 129664 && e2 <= 129673 || e2 >= 129679 && e2 <= 129734 || e2 >= 129742 && e2 <= 129756 || e2 >= 129759 && e2 <= 129769 || e2 >= 129776 && e2 <= 129784 || e2 >= 131072 && e2 <= 196605 || e2 >= 196608 && e2 <= 262141;
}
var Tr = (e2) => !(kr(e2) || Sr(e2));
var Pu = /[^\x20-\x7F]/u;
function vu(e2) {
  if (!e2) return 0;
  if (!Pu.test(e2)) return e2.length;
  e2 = e2.replace(br(), "  ");
  let t8 = 0;
  for (let r2 of e2) {
    let n2 = r2.codePointAt(0);
    n2 <= 31 || n2 >= 127 && n2 <= 159 || n2 >= 768 && n2 <= 879 || (t8 += Tr(n2) ? 1 : 2);
  }
  return t8;
}
var Ne = vu;
var R = Symbol("MODE_BREAK"), H = Symbol("MODE_FLAT"), de = Symbol("cursor"), _t = Symbol("DOC_FILL_PRINTED_LENGTH");
function Nr() {
  return { value: "", length: 0, queue: [] };
}
function Lu(e2, t8) {
  return xt(e2, { type: "indent" }, t8);
}
function Iu(e2, t8, r2) {
  return t8 === Number.NEGATIVE_INFINITY ? e2.root || Nr() : t8 < 0 ? xt(e2, { type: "dedent" }, r2) : t8 ? t8.type === "root" ? { ...e2, root: e2 } : xt(e2, { type: typeof t8 == "string" ? "stringAlign" : "numberAlign", n: t8 }, r2) : e2;
}
function xt(e2, t8, r2) {
  let n2 = t8.type === "dedent" ? e2.queue.slice(0, -1) : [...e2.queue, t8], u = "", o2 = 0, i = 0, s2 = 0;
  for (let f of n2) switch (f.type) {
    case "indent":
      D(), r2.useTabs ? a(1) : c2(r2.tabWidth);
      break;
    case "stringAlign":
      D(), u += f.n, o2 += f.n.length;
      break;
    case "numberAlign":
      i += 1, s2 += f.n;
      break;
    default:
      throw new Error(`Unexpected type '${f.type}'`);
  }
  return l2(), { ...e2, value: u, length: o2, queue: n2 };
  function a(f) {
    u += "	".repeat(f), o2 += r2.tabWidth * f;
  }
  function c2(f) {
    u += " ".repeat(f), o2 += f;
  }
  function D() {
    r2.useTabs ? p() : l2();
  }
  function p() {
    i > 0 && a(i), F();
  }
  function l2() {
    s2 > 0 && c2(s2), F();
  }
  function F() {
    i = 0, s2 = 0;
  }
}
function wt(e2) {
  let t8 = 0, r2 = 0, n2 = e2.length;
  e: for (; n2--; ) {
    let u = e2[n2];
    if (u === de) {
      r2++;
      continue;
    }
    for (let o2 = u.length - 1; o2 >= 0; o2--) {
      let i = u[o2];
      if (i === " " || i === "	") t8++;
      else {
        e2[n2] = u.slice(0, o2 + 1);
        break e;
      }
    }
  }
  if (t8 > 0 || r2 > 0) for (e2.length = n2 + 1; r2-- > 0; ) e2.push(de);
  return t8;
}
function Ke(e2, t8, r2, n2, u, o2) {
  if (r2 === Number.POSITIVE_INFINITY) return true;
  let i = t8.length, s2 = [e2], a = [];
  for (; r2 >= 0; ) {
    if (s2.length === 0) {
      if (i === 0) return true;
      s2.push(t8[--i]);
      continue;
    }
    let { mode: c2, doc: D } = s2.pop(), p = M(D);
    switch (p) {
      case W:
        a.push(D), r2 -= Ne(D);
        break;
      case Y2:
      case k: {
        let l2 = p === Y2 ? D : D.parts, F = D[_t] ?? 0;
        for (let f = l2.length - 1; f >= F; f--) s2.push({ mode: c2, doc: l2[f] });
        break;
      }
      case N:
      case O:
      case v:
      case S:
        s2.push({ mode: c2, doc: D.contents });
        break;
      case P:
        r2 += wt(a);
        break;
      case B: {
        if (o2 && D.break) return false;
        let l2 = D.break ? R : c2, F = D.expandedStates && l2 === R ? y(false, D.expandedStates, -1) : D.contents;
        s2.push({ mode: l2, doc: F });
        break;
      }
      case _: {
        let F = (D.groupId ? u[D.groupId] || H : c2) === R ? D.breakContents : D.flatContents;
        F && s2.push({ mode: c2, doc: F });
        break;
      }
      case g:
        if (c2 === R || D.hard) return true;
        D.soft || (a.push(" "), r2--);
        break;
      case L:
        n2 = true;
        break;
      case I$1:
        if (n2) return false;
        break;
    }
  }
  return false;
}
function me(e2, t8) {
  let r2 = {}, n2 = t8.printWidth, u = xe(t8.endOfLine), o2 = 0, i = [{ ind: Nr(), mode: R, doc: e2 }], s2 = [], a = false, c2 = [], D = 0;
  for (cr2(e2); i.length > 0; ) {
    let { ind: l2, mode: F, doc: f } = i.pop();
    switch (M(f)) {
      case W: {
        let d2 = u !== `
` ? te(false, f, `
`, u) : f;
        s2.push(d2), i.length > 0 && (o2 += Ne(d2));
        break;
      }
      case Y2:
        for (let d2 = f.length - 1; d2 >= 0; d2--) i.push({ ind: l2, mode: F, doc: f[d2] });
        break;
      case j:
        if (D >= 2) throw new Error("There are too many 'cursor' in doc.");
        s2.push(de), D++;
        break;
      case N:
        i.push({ ind: Lu(l2, t8), mode: F, doc: f.contents });
        break;
      case O:
        i.push({ ind: Iu(l2, f.n, t8), mode: F, doc: f.contents });
        break;
      case P:
        o2 -= wt(s2);
        break;
      case B:
        switch (F) {
          case H:
            if (!a) {
              i.push({ ind: l2, mode: f.break ? R : H, doc: f.contents });
              break;
            }
          case R: {
            a = false;
            let d2 = { ind: l2, mode: H, doc: f.contents }, m = n2 - o2, C = c2.length > 0;
            if (!f.break && Ke(d2, i, m, C, r2)) i.push(d2);
            else if (f.expandedStates) {
              let E2 = y(false, f.expandedStates, -1);
              if (f.break) {
                i.push({ ind: l2, mode: R, doc: E2 });
                break;
              } else for (let h2 = 1; h2 < f.expandedStates.length + 1; h2++) if (h2 >= f.expandedStates.length) {
                i.push({ ind: l2, mode: R, doc: E2 });
                break;
              } else {
                let x = f.expandedStates[h2], A = { ind: l2, mode: H, doc: x };
                if (Ke(A, i, m, C, r2)) {
                  i.push(A);
                  break;
                }
              }
            } else i.push({ ind: l2, mode: R, doc: f.contents });
            break;
          }
        }
        f.id && (r2[f.id] = y(false, i, -1).mode);
        break;
      case k: {
        let d2 = n2 - o2, m = f[_t] ?? 0, { parts: C } = f, E2 = C.length - m;
        if (E2 === 0) break;
        let h2 = C[m + 0], x = C[m + 1], A = { ind: l2, mode: H, doc: h2 }, $2 = { ind: l2, mode: R, doc: h2 }, ue = Ke(A, [], d2, c2.length > 0, r2, true);
        if (E2 === 1) {
          ue ? i.push(A) : i.push($2);
          break;
        }
        let Be2 = { ind: l2, mode: H, doc: x }, lt2 = { ind: l2, mode: R, doc: x };
        if (E2 === 2) {
          ue ? i.push(Be2, A) : i.push(lt2, $2);
          break;
        }
        let lu = C[m + 2], Ft2 = { ind: l2, mode: F, doc: { ...f, [_t]: m + 2 } };
        Ke({ ind: l2, mode: H, doc: [h2, x, lu] }, [], d2, c2.length > 0, r2, true) ? i.push(Ft2, Be2, A) : ue ? i.push(Ft2, lt2, A) : i.push(Ft2, lt2, $2);
        break;
      }
      case _:
      case v: {
        let d2 = f.groupId ? r2[f.groupId] : F;
        if (d2 === R) {
          let m = f.type === _ ? f.breakContents : f.negate ? f.contents : ie(f.contents);
          m && i.push({ ind: l2, mode: F, doc: m });
        }
        if (d2 === H) {
          let m = f.type === _ ? f.flatContents : f.negate ? ie(f.contents) : f.contents;
          m && i.push({ ind: l2, mode: F, doc: m });
        }
        break;
      }
      case L:
        c2.push({ ind: l2, mode: F, doc: f.contents });
        break;
      case I$1:
        c2.length > 0 && i.push({ ind: l2, mode: F, doc: Te });
        break;
      case g:
        switch (F) {
          case H:
            if (f.hard) a = true;
            else {
              f.soft || (s2.push(" "), o2 += 1);
              break;
            }
          case R:
            if (c2.length > 0) {
              i.push({ ind: l2, mode: F, doc: f }, ...c2.reverse()), c2.length = 0;
              break;
            }
            f.literal ? l2.root ? (s2.push(u, l2.root.value), o2 = l2.root.length) : (s2.push(u), o2 = 0) : (o2 -= wt(s2), s2.push(u + l2.value), o2 = l2.length);
            break;
        }
        break;
      case S:
        i.push({ ind: l2, mode: F, doc: f.contents });
        break;
      case w:
        break;
      default:
        throw new q(f);
    }
    i.length === 0 && c2.length > 0 && (i.push(...c2.reverse()), c2.length = 0);
  }
  let p = s2.indexOf(de);
  if (p !== -1) {
    let l2 = s2.indexOf(de, p + 1);
    if (l2 === -1) return { formatted: s2.filter((m) => m !== de).join("") };
    let F = s2.slice(0, p).join(""), f = s2.slice(p + 1, l2).join(""), d2 = s2.slice(l2 + 1).join("");
    return { formatted: F + f + d2, cursorNodeStart: F.length, cursorNodeText: f };
  }
  return { formatted: s2.join("") };
}
function Ru(e2, t8, r2 = 0) {
  let n2 = 0;
  for (let u = r2; u < e2.length; ++u) e2[u] === "	" ? n2 = n2 + t8 - n2 % t8 : n2++;
  return n2;
}
var Ee = Ru;
var Z, kt, ze, bt = class {
  constructor(t8) {
    tr(this, Z);
    this.stack = [t8];
  }
  get key() {
    let { stack: t8, siblings: r2 } = this;
    return y(false, t8, r2 === null ? -2 : -4) ?? null;
  }
  get index() {
    return this.siblings === null ? null : y(false, this.stack, -2);
  }
  get node() {
    return y(false, this.stack, -1);
  }
  get parent() {
    return this.getNode(1);
  }
  get grandparent() {
    return this.getNode(2);
  }
  get isInArray() {
    return this.siblings !== null;
  }
  get siblings() {
    let { stack: t8 } = this, r2 = y(false, t8, -3);
    return Array.isArray(r2) ? r2 : null;
  }
  get next() {
    let { siblings: t8 } = this;
    return t8 === null ? null : t8[this.index + 1];
  }
  get previous() {
    let { siblings: t8 } = this;
    return t8 === null ? null : t8[this.index - 1];
  }
  get isFirst() {
    return this.index === 0;
  }
  get isLast() {
    let { siblings: t8, index: r2 } = this;
    return t8 !== null && r2 === t8.length - 1;
  }
  get isRoot() {
    return this.stack.length === 1;
  }
  get root() {
    return this.stack[0];
  }
  get ancestors() {
    return [...fe(this, Z, ze).call(this)];
  }
  getName() {
    let { stack: t8 } = this, { length: r2 } = t8;
    return r2 > 1 ? y(false, t8, -2) : null;
  }
  getValue() {
    return y(false, this.stack, -1);
  }
  getNode(t8 = 0) {
    let r2 = fe(this, Z, kt).call(this, t8);
    return r2 === -1 ? null : this.stack[r2];
  }
  getParentNode(t8 = 0) {
    return this.getNode(t8 + 1);
  }
  call(t8, ...r2) {
    let { stack: n2 } = this, { length: u } = n2, o2 = y(false, n2, -1);
    for (let i of r2) o2 = o2[i], n2.push(i, o2);
    try {
      return t8(this);
    } finally {
      n2.length = u;
    }
  }
  callParent(t8, r2 = 0) {
    let n2 = fe(this, Z, kt).call(this, r2 + 1), u = this.stack.splice(n2 + 1);
    try {
      return t8(this);
    } finally {
      this.stack.push(...u);
    }
  }
  each(t8, ...r2) {
    let { stack: n2 } = this, { length: u } = n2, o2 = y(false, n2, -1);
    for (let i of r2) o2 = o2[i], n2.push(i, o2);
    try {
      for (let i = 0; i < o2.length; ++i) n2.push(i, o2[i]), t8(this, i, o2), n2.length -= 2;
    } finally {
      n2.length = u;
    }
  }
  map(t8, ...r2) {
    let n2 = [];
    return this.each((u, o2, i) => {
      n2[o2] = t8(u, o2, i);
    }, ...r2), n2;
  }
  match(...t8) {
    let r2 = this.stack.length - 1, n2 = null, u = this.stack[r2--];
    for (let o2 of t8) {
      if (u === void 0) return false;
      let i = null;
      if (typeof n2 == "number" && (i = n2, n2 = this.stack[r2--], u = this.stack[r2--]), o2 && !o2(u, n2, i)) return false;
      n2 = this.stack[r2--], u = this.stack[r2--];
    }
    return true;
  }
  findAncestor(t8) {
    for (let r2 of fe(this, Z, ze).call(this)) if (t8(r2)) return r2;
  }
  hasAncestor(t8) {
    for (let r2 of fe(this, Z, ze).call(this)) if (t8(r2)) return true;
    return false;
  }
};
Z = /* @__PURE__ */ new WeakSet(), kt = function(t8) {
  let { stack: r2 } = this;
  for (let n2 = r2.length - 1; n2 >= 0; n2 -= 2) if (!Array.isArray(r2[n2]) && --t8 < 0) return n2;
  return -1;
}, ze = function* () {
  let { stack: t8 } = this;
  for (let r2 = t8.length - 3; r2 >= 0; r2 -= 2) {
    let n2 = t8[r2];
    Array.isArray(n2) || (yield n2);
  }
};
var Or = bt;
var Pr = new Proxy(() => {
}, { get: () => Pr }), Oe2 = Pr;
function Yu(e2) {
  return e2 !== null && typeof e2 == "object";
}
var vr = Yu;
function* Ce(e2, t8) {
  let { getVisitorKeys: r2, filter: n2 = () => true } = t8, u = (o2) => vr(o2) && n2(o2);
  for (let o2 of r2(e2)) {
    let i = e2[o2];
    if (Array.isArray(i)) for (let s2 of i) u(s2) && (yield s2);
    else u(i) && (yield i);
  }
}
function* Lr(e2, t8) {
  let r2 = [e2];
  for (let n2 = 0; n2 < r2.length; n2++) {
    let u = r2[n2];
    for (let o2 of Ce(u, t8)) yield o2, r2.push(o2);
  }
}
function Ir(e2, t8) {
  return Ce(e2, t8).next().done;
}
function he(e2) {
  return (t8, r2, n2) => {
    let u = !!(n2 != null && n2.backwards);
    if (r2 === false) return false;
    let { length: o2 } = t8, i = r2;
    for (; i >= 0 && i < o2; ) {
      let s2 = t8.charAt(i);
      if (e2 instanceof RegExp) {
        if (!e2.test(s2)) return i;
      } else if (!e2.includes(s2)) return i;
      u ? i-- : i++;
    }
    return i === -1 || i === o2 ? i : false;
  };
}
var Rr = he(/\s/u), T = he(" 	"), He = he(",; 	"), Je = he(/[^\n\r]/u);
function ju(e2, t8, r2) {
  let n2 = !!(r2 != null && r2.backwards);
  if (t8 === false) return false;
  let u = e2.charAt(t8);
  if (n2) {
    if (e2.charAt(t8 - 1) === "\r" && u === `
`) return t8 - 2;
    if (u === `
` || u === "\r" || u === "\u2028" || u === "\u2029") return t8 - 1;
  } else {
    if (u === "\r" && e2.charAt(t8 + 1) === `
`) return t8 + 2;
    if (u === `
` || u === "\r" || u === "\u2028" || u === "\u2029") return t8 + 1;
  }
  return t8;
}
var U = ju;
function Uu(e2, t8, r2 = {}) {
  let n2 = T(e2, r2.backwards ? t8 - 1 : t8, r2), u = U(e2, n2, r2);
  return n2 !== u;
}
var G = Uu;
function Vu(e2) {
  return Array.isArray(e2) && e2.length > 0;
}
var qe = Vu;
var Yr = /* @__PURE__ */ new Set(["tokens", "comments", "parent", "enclosingNode", "precedingNode", "followingNode"]), $u = (e2) => Object.keys(e2).filter((t8) => !Yr.has(t8));
function Wu(e2) {
  return e2 ? (t8) => e2(t8, Yr) : $u;
}
var J = Wu;
function Mu(e2) {
  let t8 = e2.type || e2.kind || "(unknown type)", r2 = String(e2.name || e2.id && (typeof e2.id == "object" ? e2.id.name : e2.id) || e2.key && (typeof e2.key == "object" ? e2.key.name : e2.key) || e2.value && (typeof e2.value == "object" ? "" : String(e2.value)) || e2.operator || "");
  return r2.length > 20 && (r2 = r2.slice(0, 19) + "…"), t8 + (r2 ? " " + r2 : "");
}
function St2(e2, t8) {
  (e2.comments ?? (e2.comments = [])).push(t8), t8.printed = false, t8.nodeDescription = Mu(e2);
}
function se(e2, t8) {
  t8.leading = true, t8.trailing = false, St2(e2, t8);
}
function ee2(e2, t8, r2) {
  t8.leading = false, t8.trailing = false, r2 && (t8.marker = r2), St2(e2, t8);
}
function ae2(e2, t8) {
  t8.leading = false, t8.trailing = true, St2(e2, t8);
}
var Tt = /* @__PURE__ */ new WeakMap();
function Xe(e2, t8) {
  if (Tt.has(e2)) return Tt.get(e2);
  let { printer: { getCommentChildNodes: r2, canAttachComment: n2, getVisitorKeys: u }, locStart: o2, locEnd: i } = t8;
  if (!n2) return [];
  let s2 = ((r2 == null ? void 0 : r2(e2, t8)) ?? [...Ce(e2, { getVisitorKeys: J(u) })]).flatMap((a) => n2(a) ? [a] : Xe(a, t8));
  return s2.sort((a, c2) => o2(a) - o2(c2) || i(a) - i(c2)), Tt.set(e2, s2), s2;
}
function Ur2(e2, t8, r2, n2) {
  let { locStart: u, locEnd: o2 } = r2, i = u(t8), s2 = o2(t8), a = Xe(e2, r2), c2, D, p = 0, l2 = a.length;
  for (; p < l2; ) {
    let F = p + l2 >> 1, f = a[F], d2 = u(f), m = o2(f);
    if (d2 <= i && s2 <= m) return Ur2(f, t8, r2, f);
    if (m <= i) {
      c2 = f, p = F + 1;
      continue;
    }
    if (s2 <= d2) {
      D = f, l2 = F;
      continue;
    }
    throw new Error("Comment location overlaps with node location");
  }
  if ((n2 == null ? void 0 : n2.type) === "TemplateLiteral") {
    let { quasis: F } = n2, f = Ot(F, t8, r2);
    c2 && Ot(F, c2, r2) !== f && (c2 = null), D && Ot(F, D, r2) !== f && (D = null);
  }
  return { enclosingNode: n2, precedingNode: c2, followingNode: D };
}
var Nt = () => false;
function Vr(e2, t8) {
  let { comments: r2 } = e2;
  if (delete e2.comments, !qe(r2) || !t8.printer.canAttachComment) return;
  let n2 = [], { printer: { experimentalFeatures: { avoidAstMutation: u = false } = {}, handleComments: o2 = {} }, originalText: i } = t8, { ownLine: s2 = Nt, endOfLine: a = Nt, remaining: c2 = Nt } = o2, D = r2.map((p, l2) => ({ ...Ur2(e2, p, t8), comment: p, text: i, options: t8, ast: e2, isLastComment: r2.length - 1 === l2 }));
  for (let [p, l2] of D.entries()) {
    let { comment: F, precedingNode: f, enclosingNode: d2, followingNode: m, text: C, options: E2, ast: h2, isLastComment: x } = l2, A;
    if (u ? A = [l2] : (F.enclosingNode = d2, F.precedingNode = f, F.followingNode = m, A = [F, C, E2, h2, x]), Gu(C, E2, D, p)) F.placement = "ownLine", s2(...A) || (m ? se(m, F) : f ? ae2(f, F) : d2 ? ee2(d2, F) : ee2(h2, F));
    else if (Ku(C, E2, D, p)) F.placement = "endOfLine", a(...A) || (f ? ae2(f, F) : m ? se(m, F) : d2 ? ee2(d2, F) : ee2(h2, F));
    else if (F.placement = "remaining", !c2(...A)) if (f && m) {
      let $2 = n2.length;
      $2 > 0 && n2[$2 - 1].followingNode !== m && jr2(n2, E2), n2.push(l2);
    } else f ? ae2(f, F) : m ? se(m, F) : d2 ? ee2(d2, F) : ee2(h2, F);
  }
  if (jr2(n2, t8), !u) for (let p of r2) delete p.precedingNode, delete p.enclosingNode, delete p.followingNode;
}
var $r = (e2) => !/[\S\n\u2028\u2029]/u.test(e2);
function Gu(e2, t8, r2, n2) {
  let { comment: u, precedingNode: o2 } = r2[n2], { locStart: i, locEnd: s2 } = t8, a = i(u);
  if (o2) for (let c2 = n2 - 1; c2 >= 0; c2--) {
    let { comment: D, precedingNode: p } = r2[c2];
    if (p !== o2 || !$r(e2.slice(s2(D), a))) break;
    a = i(D);
  }
  return G(e2, a, { backwards: true });
}
function Ku(e2, t8, r2, n2) {
  let { comment: u, followingNode: o2 } = r2[n2], { locStart: i, locEnd: s2 } = t8, a = s2(u);
  if (o2) for (let c2 = n2 + 1; c2 < r2.length; c2++) {
    let { comment: D, followingNode: p } = r2[c2];
    if (p !== o2 || !$r(e2.slice(a, i(D)))) break;
    a = s2(D);
  }
  return G(e2, a);
}
function jr2(e2, t8) {
  var s2, a;
  let r2 = e2.length;
  if (r2 === 0) return;
  let { precedingNode: n2, followingNode: u } = e2[0], o2 = t8.locStart(u), i;
  for (i = r2; i > 0; --i) {
    let { comment: c2, precedingNode: D, followingNode: p } = e2[i - 1];
    Oe2.strictEqual(D, n2), Oe2.strictEqual(p, u);
    let l2 = t8.originalText.slice(t8.locEnd(c2), o2);
    if (((a = (s2 = t8.printer).isGap) == null ? void 0 : a.call(s2, l2, t8)) ?? /^[\s(]*$/u.test(l2)) o2 = t8.locStart(c2);
    else break;
  }
  for (let [c2, { comment: D }] of e2.entries()) c2 < i ? ae2(n2, D) : se(u, D);
  for (let c2 of [n2, u]) c2.comments && c2.comments.length > 1 && c2.comments.sort((D, p) => t8.locStart(D) - t8.locStart(p));
  e2.length = 0;
}
function Ot(e2, t8, r2) {
  let n2 = r2.locStart(t8) - 1;
  for (let u = 1; u < e2.length; ++u) if (n2 < r2.locStart(e2[u])) return u - 1;
  return 0;
}
function zu(e2, t8) {
  let r2 = t8 - 1;
  r2 = T(e2, r2, { backwards: true }), r2 = U(e2, r2, { backwards: true }), r2 = T(e2, r2, { backwards: true });
  let n2 = U(e2, r2, { backwards: true });
  return r2 !== n2;
}
var Pe = zu;
function Wr2(e2, t8) {
  let r2 = e2.node;
  return r2.printed = true, t8.printer.printComment(e2, t8);
}
function Hu(e2, t8) {
  var D;
  let r2 = e2.node, n2 = [Wr2(e2, t8)], { printer: u, originalText: o2, locStart: i, locEnd: s2 } = t8;
  if ((D = u.isBlockComment) == null ? void 0 : D.call(u, r2)) {
    let p = G(o2, s2(r2)) ? G(o2, i(r2), { backwards: true }) ? z : Me : " ";
    n2.push(p);
  } else n2.push(z);
  let c2 = U(o2, T(o2, s2(r2)));
  return c2 !== false && G(o2, c2) && n2.push(z), n2;
}
function Ju(e2, t8, r2) {
  var c2;
  let n2 = e2.node, u = Wr2(e2, t8), { printer: o2, originalText: i, locStart: s2 } = t8, a = (c2 = o2.isBlockComment) == null ? void 0 : c2.call(o2, n2);
  if (r2 != null && r2.hasLineSuffix && !(r2 != null && r2.isBlock) || G(i, s2(n2), { backwards: true })) {
    let D = Pe(i, s2(n2));
    return { doc: Se([z, D ? z : "", u]), isBlock: a, hasLineSuffix: true };
  }
  return !a || r2 != null && r2.hasLineSuffix ? { doc: [Se([" ", u]), pe], isBlock: a, hasLineSuffix: true } : { doc: [" ", u], isBlock: a, hasLineSuffix: false };
}
function qu(e2, t8) {
  let r2 = e2.node;
  if (!r2) return {};
  let n2 = t8[Symbol.for("printedComments")];
  if ((r2.comments || []).filter((a) => !n2.has(a)).length === 0) return { leading: "", trailing: "" };
  let o2 = [], i = [], s2;
  return e2.each(() => {
    let a = e2.node;
    if (n2 != null && n2.has(a)) return;
    let { leading: c2, trailing: D } = a;
    c2 ? o2.push(Hu(e2, t8)) : D && (s2 = Ju(e2, t8, s2), i.push(s2.doc));
  }, "comments"), { leading: o2, trailing: i };
}
function Mr(e2, t8, r2) {
  let { leading: n2, trailing: u } = qu(e2, r2);
  return !n2 && !u ? t8 : Fe(t8, (o2) => [n2, o2, u]);
}
function Gr(e2) {
  let { [Symbol.for("comments")]: t8, [Symbol.for("printedComments")]: r2 } = e2;
  for (let n2 of t8) {
    if (!n2.printed && !r2.has(n2)) throw new Error('Comment "' + n2.value.trim() + '" was not printed. Please report this error!');
    delete n2.printed;
  }
}
var ve2 = class extends Error {
  name = "ConfigError";
}, Le = class extends Error {
  name = "UndefinedParserError";
};
var zr = { checkIgnorePragma: { category: "Special", type: "boolean", default: false, description: "Check whether the file's first docblock comment contains '@noprettier' or '@noformat' to determine if it should be formatted.", cliCategory: "Other" }, cursorOffset: { category: "Special", type: "int", default: -1, range: { start: -1, end: 1 / 0, step: 1 }, description: "Print (to stderr) where a cursor at the given position would move to after formatting.", cliCategory: "Editor" }, endOfLine: { category: "Global", type: "choice", default: "lf", description: "Which end of line characters to apply.", choices: [{ value: "lf", description: "Line Feed only (\\n), common on Linux and macOS as well as inside git repos" }, { value: "crlf", description: "Carriage Return + Line Feed characters (\\r\\n), common on Windows" }, { value: "cr", description: "Carriage Return character only (\\r), used very rarely" }, { value: "auto", description: `Maintain existing
(mixed values within one file are normalised by looking at what's used after the first line)` }] }, filepath: { category: "Special", type: "path", description: "Specify the input filepath. This will be used to do parser inference.", cliName: "stdin-filepath", cliCategory: "Other", cliDescription: "Path to the file to pretend that stdin comes from." }, insertPragma: { category: "Special", type: "boolean", default: false, description: "Insert @format pragma into file's first docblock comment.", cliCategory: "Other" }, parser: { category: "Global", type: "choice", default: void 0, description: "Which parser to use.", exception: (e2) => typeof e2 == "string" || typeof e2 == "function", choices: [{ value: "flow", description: "Flow" }, { value: "babel", description: "JavaScript" }, { value: "babel-flow", description: "Flow" }, { value: "babel-ts", description: "TypeScript" }, { value: "typescript", description: "TypeScript" }, { value: "acorn", description: "JavaScript" }, { value: "espree", description: "JavaScript" }, { value: "meriyah", description: "JavaScript" }, { value: "css", description: "CSS" }, { value: "less", description: "Less" }, { value: "scss", description: "SCSS" }, { value: "json", description: "JSON" }, { value: "json5", description: "JSON5" }, { value: "jsonc", description: "JSON with Comments" }, { value: "json-stringify", description: "JSON.stringify" }, { value: "graphql", description: "GraphQL" }, { value: "markdown", description: "Markdown" }, { value: "mdx", description: "MDX" }, { value: "vue", description: "Vue" }, { value: "yaml", description: "YAML" }, { value: "glimmer", description: "Ember / Handlebars" }, { value: "html", description: "HTML" }, { value: "angular", description: "Angular" }, { value: "lwc", description: "Lightning Web Components" }, { value: "mjml", description: "MJML" }] }, plugins: { type: "path", array: true, default: [{ value: [] }], category: "Global", description: "Add a plugin. Multiple plugins can be passed as separate `--plugin`s.", exception: (e2) => typeof e2 == "string" || typeof e2 == "object", cliName: "plugin", cliCategory: "Config" }, printWidth: { category: "Global", type: "int", default: 80, description: "The line length where Prettier will try wrap.", range: { start: 0, end: 1 / 0, step: 1 } }, rangeEnd: { category: "Special", type: "int", default: 1 / 0, range: { start: 0, end: 1 / 0, step: 1 }, description: `Format code ending at a given character offset (exclusive).
The range will extend forwards to the end of the selected statement.`, cliCategory: "Editor" }, rangeStart: { category: "Special", type: "int", default: 0, range: { start: 0, end: 1 / 0, step: 1 }, description: `Format code starting at a given character offset.
The range will extend backwards to the start of the first line containing the selected statement.`, cliCategory: "Editor" }, requirePragma: { category: "Special", type: "boolean", default: false, description: "Require either '@prettier' or '@format' to be present in the file's first docblock comment in order for it to be formatted.", cliCategory: "Other" }, tabWidth: { type: "int", category: "Global", default: 2, description: "Number of spaces per indentation level.", range: { start: 0, end: 1 / 0, step: 1 } }, useTabs: { category: "Global", type: "boolean", default: false, description: "Indent with tabs instead of spaces." }, embeddedLanguageFormatting: { category: "Global", type: "choice", default: "auto", description: "Control how Prettier formats quoted code embedded in the file.", choices: [{ value: "auto", description: "Format embedded code if Prettier can automatically identify it." }, { value: "off", description: "Never automatically format embedded code." }] } };
function Qe({ plugins: e2 = [], showDeprecated: t8 = false } = {}) {
  let r2 = e2.flatMap((u) => u.languages ?? []), n2 = [];
  for (let u of Zu(Object.assign({}, ...e2.map(({ options: o2 }) => o2), zr))) !t8 && u.deprecated || (Array.isArray(u.choices) && (t8 || (u.choices = u.choices.filter((o2) => !o2.deprecated)), u.name === "parser" && (u.choices = [...u.choices, ...Qu(u.choices, r2, e2)])), u.pluginDefaults = Object.fromEntries(e2.filter((o2) => {
    var i;
    return ((i = o2.defaultOptions) == null ? void 0 : i[u.name]) !== void 0;
  }).map((o2) => [o2.name, o2.defaultOptions[u.name]])), n2.push(u));
  return { languages: r2, options: n2 };
}
function* Qu(e2, t8, r2) {
  let n2 = new Set(e2.map((u) => u.value));
  for (let u of t8) if (u.parsers) {
    for (let o2 of u.parsers) if (!n2.has(o2)) {
      n2.add(o2);
      let i = r2.find((a) => a.parsers && Object.prototype.hasOwnProperty.call(a.parsers, o2)), s2 = u.name;
      i != null && i.name && (s2 += ` (plugin: ${i.name})`), yield { value: o2, description: s2 };
    }
  }
}
function Zu(e2) {
  let t8 = [];
  for (let [r2, n2] of Object.entries(e2)) {
    let u = { name: r2, ...n2 };
    Array.isArray(u.default) && (u.default = y(false, u.default, -1).value), t8.push(u);
  }
  return t8;
}
var eo = (e2, t8) => {
  if (!(e2 && t8 == null)) return t8.toReversed || !Array.isArray(t8) ? t8.toReversed() : [...t8].reverse();
}, Hr = eo;
var Jr, qr, Xr, Qr, Zr, to = ((Jr = globalThis.Deno) == null ? void 0 : Jr.build.os) === "windows" || ((Xr = (qr = globalThis.navigator) == null ? void 0 : qr.platform) == null ? void 0 : Xr.startsWith("Win")) || ((Zr = (Qr = globalThis.process) == null ? void 0 : Qr.platform) == null ? void 0 : Zr.startsWith("win")) || false;
function en(e2) {
  if (e2 = e2 instanceof URL ? e2 : new URL(e2), e2.protocol !== "file:") throw new TypeError(`URL must be a file URL: received "${e2.protocol}"`);
  return e2;
}
function ro(e2) {
  return e2 = en(e2), decodeURIComponent(e2.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function no(e2) {
  e2 = en(e2);
  let t8 = decodeURIComponent(e2.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  return e2.hostname !== "" && (t8 = `\\\\${e2.hostname}${t8}`), t8;
}
function tn(e2) {
  return to ? no(e2) : ro(e2);
}
var rn = tn;
var uo = (e2) => String(e2).split(/[/\\]/u).pop();
function nn(e2, t8) {
  if (!t8) return;
  let r2 = uo(t8).toLowerCase();
  return e2.find(({ filenames: n2 }) => n2 == null ? void 0 : n2.some((u) => u.toLowerCase() === r2)) ?? e2.find(({ extensions: n2 }) => n2 == null ? void 0 : n2.some((u) => r2.endsWith(u)));
}
function oo(e2, t8) {
  if (t8) return e2.find(({ name: r2 }) => r2.toLowerCase() === t8) ?? e2.find(({ aliases: r2 }) => r2 == null ? void 0 : r2.includes(t8)) ?? e2.find(({ extensions: r2 }) => r2 == null ? void 0 : r2.includes(`.${t8}`));
}
function un(e2, t8) {
  if (t8) {
    if (String(t8).startsWith("file:")) try {
      t8 = rn(t8);
    } catch {
      return;
    }
    if (typeof t8 == "string") return e2.find(({ isSupported: r2 }) => r2 == null ? void 0 : r2({ filepath: t8 }));
  }
}
function io(e2, t8) {
  let r2 = Hr(false, e2.plugins).flatMap((u) => u.languages ?? []), n2 = oo(r2, t8.language) ?? nn(r2, t8.physicalFile) ?? nn(r2, t8.file) ?? un(r2, t8.physicalFile) ?? un(r2, t8.file) ?? (t8.physicalFile, void 0);
  return n2 == null ? void 0 : n2.parsers[0];
}
var on = io;
var re = { key: (e2) => /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(e2) ? e2 : JSON.stringify(e2), value(e2) {
  if (e2 === null || typeof e2 != "object") return JSON.stringify(e2);
  if (Array.isArray(e2)) return `[${e2.map((r2) => re.value(r2)).join(", ")}]`;
  let t8 = Object.keys(e2);
  return t8.length === 0 ? "{}" : `{ ${t8.map((r2) => `${re.key(r2)}: ${re.value(e2[r2])}`).join(", ")} }`;
}, pair: ({ key: e2, value: t8 }) => re.value({ [e2]: t8 }) };
var sn = new Proxy(String, { get: () => sn }), V$1 = sn;
var an = (e2, t8, { descriptor: r2 }) => {
  let n2 = [`${V$1.yellow(typeof e2 == "string" ? r2.key(e2) : r2.pair(e2))} is deprecated`];
  return t8 && n2.push(`we now treat it as ${V$1.blue(typeof t8 == "string" ? r2.key(t8) : r2.pair(t8))}`), n2.join("; ") + ".";
};
var Ze = Symbol.for("vnopts.VALUE_NOT_EXIST"), ge = Symbol.for("vnopts.VALUE_UNCHANGED");
var Dn = " ".repeat(2), fn = (e2, t8, r2) => {
  let { text: n2, list: u } = r2.normalizeExpectedResult(r2.schemas[e2].expected(r2)), o2 = [];
  return n2 && o2.push(cn(e2, t8, n2, r2.descriptor)), u && o2.push([cn(e2, t8, u.title, r2.descriptor)].concat(u.values.map((i) => ln(i, r2.loggerPrintWidth))).join(`
`)), Fn(o2, r2.loggerPrintWidth);
};
function cn(e2, t8, r2, n2) {
  return [`Invalid ${V$1.red(n2.key(e2))} value.`, `Expected ${V$1.blue(r2)},`, `but received ${t8 === Ze ? V$1.gray("nothing") : V$1.red(n2.value(t8))}.`].join(" ");
}
function ln({ text: e2, list: t8 }, r2) {
  let n2 = [];
  return e2 && n2.push(`- ${V$1.blue(e2)}`), t8 && n2.push([`- ${V$1.blue(t8.title)}:`].concat(t8.values.map((u) => ln(u, r2 - Dn.length).replace(/^|\n/g, `$&${Dn}`))).join(`
`)), Fn(n2, r2);
}
function Fn(e2, t8) {
  if (e2.length === 1) return e2[0];
  let [r2, n2] = e2, [u, o2] = e2.map((i) => i.split(`
`, 1)[0].length);
  return u > t8 && u > o2 ? n2 : r2;
}
var Pt = [], pn = [];
function vt(e2, t8) {
  if (e2 === t8) return 0;
  let r2 = e2;
  e2.length > t8.length && (e2 = t8, t8 = r2);
  let n2 = e2.length, u = t8.length;
  for (; n2 > 0 && e2.charCodeAt(~-n2) === t8.charCodeAt(~-u); ) n2--, u--;
  let o2 = 0;
  for (; o2 < n2 && e2.charCodeAt(o2) === t8.charCodeAt(o2); ) o2++;
  if (n2 -= o2, u -= o2, n2 === 0) return u;
  let i, s2, a, c2, D = 0, p = 0;
  for (; D < n2; ) pn[D] = e2.charCodeAt(o2 + D), Pt[D] = ++D;
  for (; p < u; ) for (i = t8.charCodeAt(o2 + p), a = p++, s2 = p, D = 0; D < n2; D++) c2 = i === pn[D] ? a : a + 1, a = Pt[D], s2 = Pt[D] = a > s2 ? c2 > s2 ? s2 + 1 : c2 : c2 > a ? a + 1 : c2;
  return s2;
}
var et = (e2, t8, { descriptor: r2, logger: n2, schemas: u }) => {
  let o2 = [`Ignored unknown option ${V$1.yellow(r2.pair({ key: e2, value: t8 }))}.`], i = Object.keys(u).sort().find((s2) => vt(e2, s2) < 3);
  i && o2.push(`Did you mean ${V$1.blue(r2.key(i))}?`), n2.warn(o2.join(" "));
};
var so = ["default", "expected", "validate", "deprecated", "forward", "redirect", "overlap", "preprocess", "postprocess"];
function ao(e2, t8) {
  let r2 = new e2(t8), n2 = Object.create(r2);
  for (let u of so) u in t8 && (n2[u] = Do(t8[u], r2, b.prototype[u].length));
  return n2;
}
var b = class {
  static create(t8) {
    return ao(this, t8);
  }
  constructor(t8) {
    this.name = t8.name;
  }
  default(t8) {
  }
  expected(t8) {
    return "nothing";
  }
  validate(t8, r2) {
    return false;
  }
  deprecated(t8, r2) {
    return false;
  }
  forward(t8, r2) {
  }
  redirect(t8, r2) {
  }
  overlap(t8, r2, n2) {
    return t8;
  }
  preprocess(t8, r2) {
    return t8;
  }
  postprocess(t8, r2) {
    return ge;
  }
};
function Do(e2, t8, r2) {
  return typeof e2 == "function" ? (...n2) => e2(...n2.slice(0, r2 - 1), t8, ...n2.slice(r2 - 1)) : () => e2;
}
var tt = class extends b {
  constructor(t8) {
    super(t8), this._sourceName = t8.sourceName;
  }
  expected(t8) {
    return t8.schemas[this._sourceName].expected(t8);
  }
  validate(t8, r2) {
    return r2.schemas[this._sourceName].validate(t8, r2);
  }
  redirect(t8, r2) {
    return this._sourceName;
  }
};
var rt = class extends b {
  expected() {
    return "anything";
  }
  validate() {
    return true;
  }
};
var nt = class extends b {
  constructor({ valueSchema: t8, name: r2 = t8.name, ...n2 }) {
    super({ ...n2, name: r2 }), this._valueSchema = t8;
  }
  expected(t8) {
    let { text: r2, list: n2 } = t8.normalizeExpectedResult(this._valueSchema.expected(t8));
    return { text: r2 && `an array of ${r2}`, list: n2 && { title: "an array of the following values", values: [{ list: n2 }] } };
  }
  validate(t8, r2) {
    if (!Array.isArray(t8)) return false;
    let n2 = [];
    for (let u of t8) {
      let o2 = r2.normalizeValidateResult(this._valueSchema.validate(u, r2), u);
      o2 !== true && n2.push(o2.value);
    }
    return n2.length === 0 ? true : { value: n2 };
  }
  deprecated(t8, r2) {
    let n2 = [];
    for (let u of t8) {
      let o2 = r2.normalizeDeprecatedResult(this._valueSchema.deprecated(u, r2), u);
      o2 !== false && n2.push(...o2.map(({ value: i }) => ({ value: [i] })));
    }
    return n2;
  }
  forward(t8, r2) {
    let n2 = [];
    for (let u of t8) {
      let o2 = r2.normalizeForwardResult(this._valueSchema.forward(u, r2), u);
      n2.push(...o2.map(dn));
    }
    return n2;
  }
  redirect(t8, r2) {
    let n2 = [], u = [];
    for (let o2 of t8) {
      let i = r2.normalizeRedirectResult(this._valueSchema.redirect(o2, r2), o2);
      "remain" in i && n2.push(i.remain), u.push(...i.redirect.map(dn));
    }
    return n2.length === 0 ? { redirect: u } : { redirect: u, remain: n2 };
  }
  overlap(t8, r2) {
    return t8.concat(r2);
  }
};
function dn({ from: e2, to: t8 }) {
  return { from: [e2], to: t8 };
}
var ut = class extends b {
  expected() {
    return "true or false";
  }
  validate(t8) {
    return typeof t8 == "boolean";
  }
};
function En(e2, t8) {
  let r2 = /* @__PURE__ */ Object.create(null);
  for (let n2 of e2) {
    let u = n2[t8];
    if (r2[u]) throw new Error(`Duplicate ${t8} ${JSON.stringify(u)}`);
    r2[u] = n2;
  }
  return r2;
}
function Cn(e2, t8) {
  let r2 = /* @__PURE__ */ new Map();
  for (let n2 of e2) {
    let u = n2[t8];
    if (r2.has(u)) throw new Error(`Duplicate ${t8} ${JSON.stringify(u)}`);
    r2.set(u, n2);
  }
  return r2;
}
function hn() {
  let e2 = /* @__PURE__ */ Object.create(null);
  return (t8) => {
    let r2 = JSON.stringify(t8);
    return e2[r2] ? true : (e2[r2] = true, false);
  };
}
function gn(e2, t8) {
  let r2 = [], n2 = [];
  for (let u of e2) t8(u) ? r2.push(u) : n2.push(u);
  return [r2, n2];
}
function yn(e2) {
  return e2 === Math.floor(e2);
}
function An(e2, t8) {
  if (e2 === t8) return 0;
  let r2 = typeof e2, n2 = typeof t8, u = ["undefined", "object", "boolean", "number", "string"];
  return r2 !== n2 ? u.indexOf(r2) - u.indexOf(n2) : r2 !== "string" ? Number(e2) - Number(t8) : e2.localeCompare(t8);
}
function Bn(e2) {
  return (...t8) => {
    let r2 = e2(...t8);
    return typeof r2 == "string" ? new Error(r2) : r2;
  };
}
function Lt(e2) {
  return e2 === void 0 ? {} : e2;
}
function It(e2) {
  if (typeof e2 == "string") return { text: e2 };
  let { text: t8, list: r2 } = e2;
  return co((t8 || r2) !== void 0, "Unexpected `expected` result, there should be at least one field."), r2 ? { text: t8, list: { title: r2.title, values: r2.values.map(It) } } : { text: t8 };
}
function Rt(e2, t8) {
  return e2 === true ? true : e2 === false ? { value: t8 } : e2;
}
function Yt2(e2, t8, r2 = false) {
  return e2 === false ? false : e2 === true ? r2 ? true : [{ value: t8 }] : "value" in e2 ? [e2] : e2.length === 0 ? false : e2;
}
function mn(e2, t8) {
  return typeof e2 == "string" || "key" in e2 ? { from: t8, to: e2 } : "from" in e2 ? { from: e2.from, to: e2.to } : { from: t8, to: e2.to };
}
function ot(e2, t8) {
  return e2 === void 0 ? [] : Array.isArray(e2) ? e2.map((r2) => mn(r2, t8)) : [mn(e2, t8)];
}
function jt2(e2, t8) {
  let r2 = ot(typeof e2 == "object" && "redirect" in e2 ? e2.redirect : e2, t8);
  return r2.length === 0 ? { remain: t8, redirect: r2 } : typeof e2 == "object" && "remain" in e2 ? { remain: e2.remain, redirect: r2 } : { redirect: r2 };
}
function co(e2, t8) {
  if (!e2) throw new Error(t8);
}
var it = class extends b {
  constructor(t8) {
    super(t8), this._choices = Cn(t8.choices.map((r2) => r2 && typeof r2 == "object" ? r2 : { value: r2 }), "value");
  }
  expected({ descriptor: t8 }) {
    let r2 = Array.from(this._choices.keys()).map((i) => this._choices.get(i)).filter(({ hidden: i }) => !i).map((i) => i.value).sort(An).map(t8.value), n2 = r2.slice(0, -2), u = r2.slice(-2);
    return { text: n2.concat(u.join(" or ")).join(", "), list: { title: "one of the following values", values: r2 } };
  }
  validate(t8) {
    return this._choices.has(t8);
  }
  deprecated(t8) {
    let r2 = this._choices.get(t8);
    return r2 && r2.deprecated ? { value: t8 } : false;
  }
  forward(t8) {
    let r2 = this._choices.get(t8);
    return r2 ? r2.forward : void 0;
  }
  redirect(t8) {
    let r2 = this._choices.get(t8);
    return r2 ? r2.redirect : void 0;
  }
};
var st = class extends b {
  expected() {
    return "a number";
  }
  validate(t8, r2) {
    return typeof t8 == "number";
  }
};
var at = class extends st {
  expected() {
    return "an integer";
  }
  validate(t8, r2) {
    return r2.normalizeValidateResult(super.validate(t8, r2), t8) === true && yn(t8);
  }
};
var Ie = class extends b {
  expected() {
    return "a string";
  }
  validate(t8) {
    return typeof t8 == "string";
  }
};
var _n = re, xn = et, wn = fn, bn = an;
var Dt = class {
  constructor(t8, r2) {
    let { logger: n2 = console, loggerPrintWidth: u = 80, descriptor: o2 = _n, unknown: i = xn, invalid: s2 = wn, deprecated: a = bn, missing: c2 = () => false, required: D = () => false, preprocess: p = (F) => F, postprocess: l2 = () => ge } = r2 || {};
    this._utils = { descriptor: o2, logger: n2 || { warn: () => {
    } }, loggerPrintWidth: u, schemas: En(t8, "name"), normalizeDefaultResult: Lt, normalizeExpectedResult: It, normalizeDeprecatedResult: Yt2, normalizeForwardResult: ot, normalizeRedirectResult: jt2, normalizeValidateResult: Rt }, this._unknownHandler = i, this._invalidHandler = Bn(s2), this._deprecatedHandler = a, this._identifyMissing = (F, f) => !(F in f) || c2(F, f), this._identifyRequired = D, this._preprocess = p, this._postprocess = l2, this.cleanHistory();
  }
  cleanHistory() {
    this._hasDeprecationWarned = hn();
  }
  normalize(t8) {
    let r2 = {}, u = [this._preprocess(t8, this._utils)], o2 = () => {
      for (; u.length !== 0; ) {
        let i = u.shift(), s2 = this._applyNormalization(i, r2);
        u.push(...s2);
      }
    };
    o2();
    for (let i of Object.keys(this._utils.schemas)) {
      let s2 = this._utils.schemas[i];
      if (!(i in r2)) {
        let a = Lt(s2.default(this._utils));
        "value" in a && u.push({ [i]: a.value });
      }
    }
    o2();
    for (let i of Object.keys(this._utils.schemas)) {
      if (!(i in r2)) continue;
      let s2 = this._utils.schemas[i], a = r2[i], c2 = s2.postprocess(a, this._utils);
      c2 !== ge && (this._applyValidation(c2, i, s2), r2[i] = c2);
    }
    return this._applyPostprocess(r2), this._applyRequiredCheck(r2), r2;
  }
  _applyNormalization(t8, r2) {
    let n2 = [], { knownKeys: u, unknownKeys: o2 } = this._partitionOptionKeys(t8);
    for (let i of u) {
      let s2 = this._utils.schemas[i], a = s2.preprocess(t8[i], this._utils);
      this._applyValidation(a, i, s2);
      let c2 = ({ from: F, to: f }) => {
        n2.push(typeof f == "string" ? { [f]: F } : { [f.key]: f.value });
      }, D = ({ value: F, redirectTo: f }) => {
        let d2 = Yt2(s2.deprecated(F, this._utils), a, true);
        if (d2 !== false) if (d2 === true) this._hasDeprecationWarned(i) || this._utils.logger.warn(this._deprecatedHandler(i, f, this._utils));
        else for (let { value: m } of d2) {
          let C = { key: i, value: m };
          if (!this._hasDeprecationWarned(C)) {
            let E2 = typeof f == "string" ? { key: f, value: m } : f;
            this._utils.logger.warn(this._deprecatedHandler(C, E2, this._utils));
          }
        }
      };
      ot(s2.forward(a, this._utils), a).forEach(c2);
      let l2 = jt2(s2.redirect(a, this._utils), a);
      if (l2.redirect.forEach(c2), "remain" in l2) {
        let F = l2.remain;
        r2[i] = i in r2 ? s2.overlap(r2[i], F, this._utils) : F, D({ value: F });
      }
      for (let { from: F, to: f } of l2.redirect) D({ value: F, redirectTo: f });
    }
    for (let i of o2) {
      let s2 = t8[i];
      this._applyUnknownHandler(i, s2, r2, (a, c2) => {
        n2.push({ [a]: c2 });
      });
    }
    return n2;
  }
  _applyRequiredCheck(t8) {
    for (let r2 of Object.keys(this._utils.schemas)) if (this._identifyMissing(r2, t8) && this._identifyRequired(r2)) throw this._invalidHandler(r2, Ze, this._utils);
  }
  _partitionOptionKeys(t8) {
    let [r2, n2] = gn(Object.keys(t8).filter((u) => !this._identifyMissing(u, t8)), (u) => u in this._utils.schemas);
    return { knownKeys: r2, unknownKeys: n2 };
  }
  _applyValidation(t8, r2, n2) {
    let u = Rt(n2.validate(t8, this._utils), t8);
    if (u !== true) throw this._invalidHandler(r2, u.value, this._utils);
  }
  _applyUnknownHandler(t8, r2, n2, u) {
    let o2 = this._unknownHandler(t8, r2, this._utils);
    if (o2) for (let i of Object.keys(o2)) {
      if (this._identifyMissing(i, o2)) continue;
      let s2 = o2[i];
      i in this._utils.schemas ? u(i, s2) : n2[i] = s2;
    }
  }
  _applyPostprocess(t8) {
    let r2 = this._postprocess(t8, this._utils);
    if (r2 !== ge) {
      if (r2.delete) for (let n2 of r2.delete) delete t8[n2];
      if (r2.override) {
        let { knownKeys: n2, unknownKeys: u } = this._partitionOptionKeys(r2.override);
        for (let o2 of n2) {
          let i = r2.override[o2];
          this._applyValidation(i, o2, this._utils.schemas[o2]), t8[o2] = i;
        }
        for (let o2 of u) {
          let i = r2.override[o2];
          this._applyUnknownHandler(o2, i, t8, (s2, a) => {
            let c2 = this._utils.schemas[s2];
            this._applyValidation(a, s2, c2), t8[s2] = a;
          });
        }
      }
    }
  }
};
var Ut2;
function lo(e2, t8, { logger: r2 = false, isCLI: n2 = false, passThrough: u = false, FlagSchema: o2, descriptor: i } = {}) {
  if (n2) {
    if (!o2) throw new Error("'FlagSchema' option is required.");
    if (!i) throw new Error("'descriptor' option is required.");
  } else i = re;
  let s2 = u ? Array.isArray(u) ? (l2, F) => u.includes(l2) ? { [l2]: F } : void 0 : (l2, F) => ({ [l2]: F }) : (l2, F, f) => {
    let { _: d2, ...m } = f.schemas;
    return et(l2, F, { ...f, schemas: m });
  }, a = Fo(t8, { isCLI: n2, FlagSchema: o2 }), c2 = new Dt(a, { logger: r2, unknown: s2, descriptor: i }), D = r2 !== false;
  D && Ut2 && (c2._hasDeprecationWarned = Ut2);
  let p = c2.normalize(e2);
  return D && (Ut2 = c2._hasDeprecationWarned), p;
}
function Fo(e2, { isCLI: t8, FlagSchema: r2 }) {
  let n2 = [];
  t8 && n2.push(rt.create({ name: "_" }));
  for (let u of e2) n2.push(po(u, { isCLI: t8, optionInfos: e2, FlagSchema: r2 })), u.alias && t8 && n2.push(tt.create({ name: u.alias, sourceName: u.name }));
  return n2;
}
function po(e2, { isCLI: t8, optionInfos: r2, FlagSchema: n2 }) {
  let { name: u } = e2, o2 = { name: u }, i, s2 = {};
  switch (e2.type) {
    case "int":
      i = at, t8 && (o2.preprocess = Number);
      break;
    case "string":
      i = Ie;
      break;
    case "choice":
      i = it, o2.choices = e2.choices.map((a) => a != null && a.redirect ? { ...a, redirect: { to: { key: e2.name, value: a.redirect } } } : a);
      break;
    case "boolean":
      i = ut;
      break;
    case "flag":
      i = n2, o2.flags = r2.flatMap((a) => [a.alias, a.description && a.name, a.oppositeDescription && `no-${a.name}`].filter(Boolean));
      break;
    case "path":
      i = Ie;
      break;
    default:
      throw new Error(`Unexpected type ${e2.type}`);
  }
  if (e2.exception ? o2.validate = (a, c2, D) => e2.exception(a) || c2.validate(a, D) : o2.validate = (a, c2, D) => a === void 0 || c2.validate(a, D), e2.redirect && (s2.redirect = (a) => a ? { to: typeof e2.redirect == "string" ? e2.redirect : { key: e2.redirect.option, value: e2.redirect.value } } : void 0), e2.deprecated && (s2.deprecated = true), t8 && !e2.array) {
    let a = o2.preprocess || ((c2) => c2);
    o2.preprocess = (c2, D, p) => D.preprocess(a(Array.isArray(c2) ? y(false, c2, -1) : c2), p);
  }
  return e2.array ? nt.create({ ...t8 ? { preprocess: (a) => Array.isArray(a) ? a : [a] } : {}, ...s2, valueSchema: i.create(o2) }) : i.create({ ...o2, ...s2 });
}
var kn = lo;
var mo = (e2, t8, r2) => {
  if (!(e2 && t8 == null)) {
    if (t8.findLast) return t8.findLast(r2);
    for (let n2 = t8.length - 1; n2 >= 0; n2--) {
      let u = t8[n2];
      if (r2(u, n2, t8)) return u;
    }
  }
}, Vt2 = mo;
function $t(e2, t8) {
  if (!t8) throw new Error("parserName is required.");
  let r2 = Vt2(false, e2, (u) => u.parsers && Object.prototype.hasOwnProperty.call(u.parsers, t8));
  if (r2) return r2;
  let n2 = `Couldn't resolve parser "${t8}".`;
  throw n2 += " Plugins must be explicitly added to the standalone bundle.", new ve2(n2);
}
function Sn(e2, t8) {
  if (!t8) throw new Error("astFormat is required.");
  let r2 = Vt2(false, e2, (u) => u.printers && Object.prototype.hasOwnProperty.call(u.printers, t8));
  if (r2) return r2;
  let n2 = `Couldn't find plugin for AST format "${t8}".`;
  throw n2 += " Plugins must be explicitly added to the standalone bundle.", new ve2(n2);
}
function Re({ plugins: e2, parser: t8 }) {
  let r2 = $t(e2, t8);
  return Wt2(r2, t8);
}
function Wt2(e2, t8) {
  let r2 = e2.parsers[t8];
  return typeof r2 == "function" ? r2() : r2;
}
function Tn(e2, t8) {
  let r2 = e2.printers[t8];
  return typeof r2 == "function" ? r2() : r2;
}
var Nn = { astFormat: "estree", printer: {}, originalText: void 0, locStart: null, locEnd: null };
async function Eo(e2, t8 = {}) {
  var p;
  let r2 = { ...e2 };
  if (!r2.parser) if (r2.filepath) {
    if (r2.parser = on(r2, { physicalFile: r2.filepath }), !r2.parser) throw new Le(`No parser could be inferred for file "${r2.filepath}".`);
  } else throw new Le("No parser and no file path given, couldn't infer a parser.");
  let n2 = Qe({ plugins: e2.plugins, showDeprecated: true }).options, u = { ...Nn, ...Object.fromEntries(n2.filter((l2) => l2.default !== void 0).map((l2) => [l2.name, l2.default])) }, o2 = $t(r2.plugins, r2.parser), i = await Wt2(o2, r2.parser);
  r2.astFormat = i.astFormat, r2.locEnd = i.locEnd, r2.locStart = i.locStart;
  let s2 = (p = o2.printers) != null && p[i.astFormat] ? o2 : Sn(r2.plugins, i.astFormat), a = await Tn(s2, i.astFormat);
  r2.printer = a;
  let c2 = s2.defaultOptions ? Object.fromEntries(Object.entries(s2.defaultOptions).filter(([, l2]) => l2 !== void 0)) : {}, D = { ...u, ...c2 };
  for (let [l2, F] of Object.entries(D)) (r2[l2] === null || r2[l2] === void 0) && (r2[l2] = F);
  return r2.parser === "json" && (r2.trailingComma = "none"), kn(r2, n2, { passThrough: Object.keys(Nn), ...t8 });
}
var ne = Eo;
var vn = gu(Pn());
async function yo(e2, t8) {
  let r2 = await Re(t8), n2 = r2.preprocess ? r2.preprocess(e2, t8) : e2;
  t8.originalText = n2;
  let u;
  try {
    u = await r2.parse(n2, t8, t8);
  } catch (o2) {
    Ao(o2, e2);
  }
  return { text: n2, ast: u };
}
function Ao(e2, t8) {
  let { loc: r2 } = e2;
  if (r2) {
    let n2 = (0, vn.codeFrameColumns)(t8, r2, { highlightCode: true });
    throw e2.message += `
` + n2, e2.codeFrame = n2, e2;
  }
  throw e2;
}
var De = yo;
async function Ln(e2, t8, r2, n2, u) {
  let { embeddedLanguageFormatting: o2, printer: { embed: i, hasPrettierIgnore: s2 = () => false, getVisitorKeys: a } } = r2;
  if (!i || o2 !== "auto") return;
  if (i.length > 2) throw new Error("printer.embed has too many parameters. The API changed in Prettier v3. Please update your plugin. See https://prettier.io/docs/plugins#optional-embed");
  let c2 = J(i.getVisitorKeys ?? a), D = [];
  F();
  let p = e2.stack;
  for (let { print: f, node: d2, pathStack: m } of D) try {
    e2.stack = m;
    let C = await f(l2, t8, e2, r2);
    C && u.set(d2, C);
  } catch (C) {
    if (globalThis.PRETTIER_DEBUG) throw C;
  }
  e2.stack = p;
  function l2(f, d2) {
    return Bo(f, d2, r2, n2);
  }
  function F() {
    let { node: f } = e2;
    if (f === null || typeof f != "object" || s2(e2)) return;
    for (let m of c2(f)) Array.isArray(f[m]) ? e2.each(F, m) : e2.call(F, m);
    let d2 = i(e2, r2);
    if (d2) {
      if (typeof d2 == "function") {
        D.push({ print: d2, node: f, pathStack: [...e2.stack] });
        return;
      }
      u.set(f, d2);
    }
  }
}
async function Bo(e2, t8, r2, n2) {
  let u = await ne({ ...r2, ...t8, parentParser: r2.parser, originalText: e2, cursorOffset: void 0, rangeStart: void 0, rangeEnd: void 0 }, { passThrough: true }), { ast: o2 } = await De(e2, u), i = await n2(o2, u);
  return $e(i);
}
function _o(e2, t8) {
  let { originalText: r2, [Symbol.for("comments")]: n2, locStart: u, locEnd: o2, [Symbol.for("printedComments")]: i } = t8, { node: s2 } = e2, a = u(s2), c2 = o2(s2);
  for (let D of n2) u(D) >= a && o2(D) <= c2 && i.add(D);
  return r2.slice(a, c2);
}
var In = _o;
async function Ye(e2, t8) {
  ({ ast: e2 } = await Gt2(e2, t8));
  let r2 = /* @__PURE__ */ new Map(), n2 = new Or(e2), o2 = /* @__PURE__ */ new Map();
  await Ln(n2, s2, t8, Ye, o2);
  let i = await Rn(n2, t8, s2, void 0, o2);
  if (Gr(t8), t8.cursorOffset >= 0) {
    if (t8.nodeAfterCursor && !t8.nodeBeforeCursor) return [X, i];
    if (t8.nodeBeforeCursor && !t8.nodeAfterCursor) return [i, X];
  }
  return i;
  function s2(c2, D) {
    return c2 === void 0 || c2 === n2 ? a(D) : Array.isArray(c2) ? n2.call(() => a(D), ...c2) : n2.call(() => a(D), c2);
  }
  function a(c2) {
    let D = n2.node;
    if (D == null) return "";
    let p = D && typeof D == "object" && c2 === void 0;
    if (p && r2.has(D)) return r2.get(D);
    let l2 = Rn(n2, t8, s2, c2, o2);
    return p && r2.set(D, l2), l2;
  }
}
function Rn(e2, t8, r2, n2, u) {
  var a;
  let { node: o2 } = e2, { printer: i } = t8, s2;
  switch ((a = i.hasPrettierIgnore) != null && a.call(i, e2) ? s2 = In(e2, t8) : u.has(o2) ? s2 = u.get(o2) : s2 = i.print(e2, t8, r2, n2), o2) {
    case t8.cursorNode:
      s2 = Fe(s2, (c2) => [X, c2, X]);
      break;
    case t8.nodeBeforeCursor:
      s2 = Fe(s2, (c2) => [c2, X]);
      break;
    case t8.nodeAfterCursor:
      s2 = Fe(s2, (c2) => [X, c2]);
      break;
  }
  return i.printComment && (!i.willPrintOwnComments || !i.willPrintOwnComments(e2, t8)) && (s2 = Mr(e2, s2, t8)), s2;
}
async function Gt2(e2, t8) {
  let r2 = e2.comments ?? [];
  t8[Symbol.for("comments")] = r2, t8[Symbol.for("printedComments")] = /* @__PURE__ */ new Set(), Vr(e2, t8);
  let { printer: { preprocess: n2 } } = t8;
  return e2 = n2 ? await n2(e2, t8) : e2, { ast: e2, comments: r2 };
}
function xo(e2, t8) {
  let { cursorOffset: r2, locStart: n2, locEnd: u } = t8, o2 = J(t8.printer.getVisitorKeys), i = (F) => n2(F) <= r2 && u(F) >= r2, s2 = e2, a = [e2];
  for (let F of Lr(e2, { getVisitorKeys: o2, filter: i })) a.push(F), s2 = F;
  if (Ir(s2, { getVisitorKeys: o2 })) return { cursorNode: s2 };
  let c2, D, p = -1, l2 = Number.POSITIVE_INFINITY;
  for (; a.length > 0 && (c2 === void 0 || D === void 0); ) {
    s2 = a.pop();
    let F = c2 !== void 0, f = D !== void 0;
    for (let d2 of Ce(s2, { getVisitorKeys: o2 })) {
      if (!F) {
        let m = u(d2);
        m <= r2 && m > p && (c2 = d2, p = m);
      }
      if (!f) {
        let m = n2(d2);
        m >= r2 && m < l2 && (D = d2, l2 = m);
      }
    }
  }
  return { nodeBeforeCursor: c2, nodeAfterCursor: D };
}
var Kt2 = xo;
function wo(e2, t8) {
  let { printer: { massageAstNode: r2, getVisitorKeys: n2 } } = t8;
  if (!r2) return e2;
  let u = J(n2), o2 = r2.ignoredProperties ?? /* @__PURE__ */ new Set();
  return i(e2);
  function i(s2, a) {
    if (!(s2 !== null && typeof s2 == "object")) return s2;
    if (Array.isArray(s2)) return s2.map((l2) => i(l2, a)).filter(Boolean);
    let c2 = {}, D = new Set(u(s2));
    for (let l2 in s2) !Object.prototype.hasOwnProperty.call(s2, l2) || o2.has(l2) || (D.has(l2) ? c2[l2] = i(s2[l2], s2) : c2[l2] = s2[l2]);
    let p = r2(s2, c2, a);
    if (p !== null) return p ?? c2;
  }
}
var Yn = wo;
var bo = (e2, t8, r2) => {
  if (!(e2 && t8 == null)) {
    if (t8.findLastIndex) return t8.findLastIndex(r2);
    for (let n2 = t8.length - 1; n2 >= 0; n2--) {
      let u = t8[n2];
      if (r2(u, n2, t8)) return n2;
    }
    return -1;
  }
}, jn = bo;
var ko = ({ parser: e2 }) => e2 === "json" || e2 === "json5" || e2 === "jsonc" || e2 === "json-stringify";
function So(e2, t8) {
  let r2 = [e2.node, ...e2.parentNodes], n2 = /* @__PURE__ */ new Set([t8.node, ...t8.parentNodes]);
  return r2.find((u) => $n.has(u.type) && n2.has(u));
}
function Un(e2) {
  let t8 = jn(false, e2, (r2) => r2.type !== "Program" && r2.type !== "File");
  return t8 === -1 ? e2 : e2.slice(0, t8 + 1);
}
function To(e2, t8, { locStart: r2, locEnd: n2 }) {
  let u = e2.node, o2 = t8.node;
  if (u === o2) return { startNode: u, endNode: o2 };
  let i = r2(e2.node);
  for (let a of Un(t8.parentNodes)) if (r2(a) >= i) o2 = a;
  else break;
  let s2 = n2(t8.node);
  for (let a of Un(e2.parentNodes)) {
    if (n2(a) <= s2) u = a;
    else break;
    if (u === o2) break;
  }
  return { startNode: u, endNode: o2 };
}
function zt2(e2, t8, r2, n2, u = [], o2) {
  let { locStart: i, locEnd: s2 } = r2, a = i(e2), c2 = s2(e2);
  if (!(t8 > c2 || t8 < a || o2 === "rangeEnd" && t8 === a || o2 === "rangeStart" && t8 === c2)) {
    for (let D of Xe(e2, r2)) {
      let p = zt2(D, t8, r2, n2, [e2, ...u], o2);
      if (p) return p;
    }
    if (!n2 || n2(e2, u[0])) return { node: e2, parentNodes: u };
  }
}
function No(e2, t8) {
  return t8 !== "DeclareExportDeclaration" && e2 !== "TypeParameterDeclaration" && (e2 === "Directive" || e2 === "TypeAlias" || e2 === "TSExportAssignment" || e2.startsWith("Declare") || e2.startsWith("TSDeclare") || e2.endsWith("Statement") || e2.endsWith("Declaration"));
}
var $n = /* @__PURE__ */ new Set(["JsonRoot", "ObjectExpression", "ArrayExpression", "StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral", "UnaryExpression", "TemplateLiteral"]), Oo = /* @__PURE__ */ new Set(["OperationDefinition", "FragmentDefinition", "VariableDefinition", "TypeExtensionDefinition", "ObjectTypeDefinition", "FieldDefinition", "DirectiveDefinition", "EnumTypeDefinition", "EnumValueDefinition", "InputValueDefinition", "InputObjectTypeDefinition", "SchemaDefinition", "OperationTypeDefinition", "InterfaceTypeDefinition", "UnionTypeDefinition", "ScalarTypeDefinition"]);
function Vn(e2, t8, r2) {
  if (!t8) return false;
  switch (e2.parser) {
    case "flow":
    case "hermes":
    case "babel":
    case "babel-flow":
    case "babel-ts":
    case "typescript":
    case "acorn":
    case "espree":
    case "meriyah":
    case "oxc":
    case "oxc-ts":
    case "__babel_estree":
      return No(t8.type, r2 == null ? void 0 : r2.type);
    case "json":
    case "json5":
    case "jsonc":
    case "json-stringify":
      return $n.has(t8.type);
    case "graphql":
      return Oo.has(t8.kind);
    case "vue":
      return t8.tag !== "root";
  }
  return false;
}
function Wn(e2, t8, r2) {
  let { rangeStart: n2, rangeEnd: u, locStart: o2, locEnd: i } = t8;
  Oe2.ok(u > n2);
  let s2 = e2.slice(n2, u).search(/\S/u), a = s2 === -1;
  if (!a) for (n2 += s2; u > n2 && !/\S/u.test(e2[u - 1]); --u) ;
  let c2 = zt2(r2, n2, t8, (F, f) => Vn(t8, F, f), [], "rangeStart"), D = a ? c2 : zt2(r2, u, t8, (F) => Vn(t8, F), [], "rangeEnd");
  if (!c2 || !D) return { rangeStart: 0, rangeEnd: 0 };
  let p, l2;
  if (ko(t8)) {
    let F = So(c2, D);
    p = F, l2 = F;
  } else ({ startNode: p, endNode: l2 } = To(c2, D, t8));
  return { rangeStart: Math.min(o2(p), o2(l2)), rangeEnd: Math.max(i(p), i(l2)) };
}
var zn = "\uFEFF", Mn = Symbol("cursor");
async function Hn(e2, t8, r2 = 0) {
  if (!e2 || e2.trim().length === 0) return { formatted: "", cursorOffset: -1, comments: [] };
  let { ast: n2, text: u } = await De(e2, t8);
  t8.cursorOffset >= 0 && (t8 = { ...t8, ...Kt2(n2, t8) });
  let o2 = await Ye(n2, t8);
  r2 > 0 && (o2 = Ge2([z, o2], r2, t8.tabWidth));
  let i = me(o2, t8);
  if (r2 > 0) {
    let a = i.formatted.trim();
    i.cursorNodeStart !== void 0 && (i.cursorNodeStart -= i.formatted.indexOf(a), i.cursorNodeStart < 0 && (i.cursorNodeStart = 0, i.cursorNodeText = i.cursorNodeText.trimStart()), i.cursorNodeStart + i.cursorNodeText.length > a.length && (i.cursorNodeText = i.cursorNodeText.trimEnd())), i.formatted = a + xe(t8.endOfLine);
  }
  let s2 = t8[Symbol.for("comments")];
  if (t8.cursorOffset >= 0) {
    let a, c2, D, p;
    if ((t8.cursorNode || t8.nodeBeforeCursor || t8.nodeAfterCursor) && i.cursorNodeText) if (D = i.cursorNodeStart, p = i.cursorNodeText, t8.cursorNode) a = t8.locStart(t8.cursorNode), c2 = u.slice(a, t8.locEnd(t8.cursorNode));
    else {
      if (!t8.nodeBeforeCursor && !t8.nodeAfterCursor) throw new Error("Cursor location must contain at least one of cursorNode, nodeBeforeCursor, nodeAfterCursor");
      a = t8.nodeBeforeCursor ? t8.locEnd(t8.nodeBeforeCursor) : 0;
      let C = t8.nodeAfterCursor ? t8.locStart(t8.nodeAfterCursor) : u.length;
      c2 = u.slice(a, C);
    }
    else a = 0, c2 = u, D = 0, p = i.formatted;
    let l2 = t8.cursorOffset - a;
    if (c2 === p) return { formatted: i.formatted, cursorOffset: D + l2, comments: s2 };
    let F = c2.split("");
    F.splice(l2, 0, Mn);
    let f = p.split(""), d2 = Et(F, f), m = D;
    for (let C of d2) if (C.removed) {
      if (C.value.includes(Mn)) break;
    } else m += C.count;
    return { formatted: i.formatted, cursorOffset: m, comments: s2 };
  }
  return { formatted: i.formatted, cursorOffset: -1, comments: s2 };
}
async function Po(e2, t8) {
  let { ast: r2, text: n2 } = await De(e2, t8), { rangeStart: u, rangeEnd: o2 } = Wn(n2, t8, r2), i = n2.slice(u, o2), s2 = Math.min(u, n2.lastIndexOf(`
`, u) + 1), a = n2.slice(s2, u).match(/^\s*/u)[0], c2 = Ee(a, t8.tabWidth), D = await Hn(i, { ...t8, rangeStart: 0, rangeEnd: Number.POSITIVE_INFINITY, cursorOffset: t8.cursorOffset > u && t8.cursorOffset <= o2 ? t8.cursorOffset - u : -1, endOfLine: "lf" }, c2), p = D.formatted.trimEnd(), { cursorOffset: l2 } = t8;
  l2 > o2 ? l2 += p.length - i.length : D.cursorOffset >= 0 && (l2 = D.cursorOffset + u);
  let F = n2.slice(0, u) + p + n2.slice(o2);
  if (t8.endOfLine !== "lf") {
    let f = xe(t8.endOfLine);
    l2 >= 0 && f === `\r
` && (l2 += Ct2(F.slice(0, l2), `
`)), F = te(false, F, `
`, f);
  }
  return { formatted: F, cursorOffset: l2, comments: D.comments };
}
function Ht(e2, t8, r2) {
  return typeof t8 != "number" || Number.isNaN(t8) || t8 < 0 || t8 > e2.length ? r2 : t8;
}
function Gn(e2, t8) {
  let { cursorOffset: r2, rangeStart: n2, rangeEnd: u } = t8;
  return r2 = Ht(e2, r2, -1), n2 = Ht(e2, n2, 0), u = Ht(e2, u, e2.length), { ...t8, cursorOffset: r2, rangeStart: n2, rangeEnd: u };
}
function Jn(e2, t8) {
  let { cursorOffset: r2, rangeStart: n2, rangeEnd: u, endOfLine: o2 } = Gn(e2, t8), i = e2.charAt(0) === zn;
  if (i && (e2 = e2.slice(1), r2--, n2--, u--), o2 === "auto" && (o2 = nr(e2)), e2.includes("\r")) {
    let s2 = (a) => Ct2(e2.slice(0, Math.max(a, 0)), `\r
`);
    r2 -= s2(r2), n2 -= s2(n2), u -= s2(u), e2 = ur(e2);
  }
  return { hasBOM: i, text: e2, options: Gn(e2, { ...t8, cursorOffset: r2, rangeStart: n2, rangeEnd: u, endOfLine: o2 }) };
}
async function Kn(e2, t8) {
  let r2 = await Re(t8);
  return !r2.hasPragma || r2.hasPragma(e2);
}
async function vo(e2, t8) {
  var n2;
  let r2 = await Re(t8);
  return (n2 = r2.hasIgnorePragma) == null ? void 0 : n2.call(r2, e2);
}
async function Jt(e2, t8) {
  let { hasBOM: r2, text: n2, options: u } = Jn(e2, await ne(t8));
  if (u.rangeStart >= u.rangeEnd && n2 !== "" || u.requirePragma && !await Kn(n2, u) || u.checkIgnorePragma && await vo(n2, u)) return { formatted: e2, cursorOffset: t8.cursorOffset, comments: [] };
  let o2;
  return u.rangeStart > 0 || u.rangeEnd < n2.length ? o2 = await Po(n2, u) : (!u.requirePragma && u.insertPragma && u.printer.insertPragma && !await Kn(n2, u) && (n2 = u.printer.insertPragma(n2)), o2 = await Hn(n2, u)), r2 && (o2.formatted = zn + o2.formatted, o2.cursorOffset >= 0 && o2.cursorOffset++), o2;
}
async function qn(e2, t8, r2) {
  let { text: n2, options: u } = Jn(e2, await ne(t8)), o2 = await De(n2, u);
  return r2 && (r2.preprocessForPrint && (o2.ast = await Gt2(o2.ast, u)), r2.massage && (o2.ast = Yn(o2.ast, u))), o2;
}
async function Xn(e2, t8) {
  t8 = await ne(t8);
  let r2 = await Ye(e2, t8);
  return me(r2, t8);
}
async function Qn(e2, t8) {
  let r2 = wr(e2), { formatted: n2 } = await Jt(r2, { ...t8, parser: "__js_expression" });
  return n2;
}
async function Zn(e2, t8) {
  t8 = await ne(t8);
  let { ast: r2 } = await De(e2, t8);
  return t8.cursorOffset >= 0 && (t8 = { ...t8, ...Kt2(r2, t8) }), Ye(r2, t8);
}
async function eu(e2, t8) {
  return me(e2, await ne(t8));
}
var qt = {};
dt(qt, { builders: () => Io, printer: () => Ro, utils: () => Yo });
var Io = { join: ke, line: Me, softline: _r, hardline: z, literalline: We, group: At, conditionalGroup: Cr2, fill: hr, lineSuffix: Se, lineSuffixBoundary: Ar, cursor: X, breakParent: pe, ifBreak: gr2, trim: Br, indent: ie, indentIfBreak: yr, align: oe, addAlignmentToDoc: Ge2, markAsRoot: mr, dedentToRoot: dr, dedent: Er, hardlineWithoutBreakParent: Te, literallineWithoutBreakParent: Bt, label: xr, concat: (e2) => e2 }, Ro = { printDocToString: me }, Yo = { willBreak: Dr, traverseDoc: le, findInDoc: Ve, mapDoc: be, removeLines: fr, stripTrailingHardline: $e, replaceEndOfLine: lr, canBreak: Fr };
var tu = "3.6.2";
var Qt = {};
dt(Qt, { addDanglingComment: () => ee2, addLeadingComment: () => se, addTrailingComment: () => ae2, getAlignmentSize: () => Ee, getIndentSize: () => ru, getMaxContinuousCount: () => nu, getNextNonSpaceNonCommentCharacter: () => uu, getNextNonSpaceNonCommentCharacterIndex: () => Xo, getPreferredQuote: () => iu, getStringWidth: () => Ne, hasNewline: () => G, hasNewlineInRange: () => su, hasSpaces: () => au, isNextLineEmpty: () => ti, isNextLineEmptyAfterIndex: () => ct, isPreviousLineEmpty: () => Zo, makeString: () => Du, skip: () => he, skipEverythingButNewLine: () => Je, skipInlineComment: () => ye, skipNewline: () => U, skipSpaces: () => T, skipToLineEnd: () => He, skipTrailingComment: () => Ae, skipWhitespace: () => Rr });
function jo(e2, t8) {
  if (t8 === false) return false;
  if (e2.charAt(t8) === "/" && e2.charAt(t8 + 1) === "*") {
    for (let r2 = t8 + 2; r2 < e2.length; ++r2) if (e2.charAt(r2) === "*" && e2.charAt(r2 + 1) === "/") return r2 + 2;
  }
  return t8;
}
var ye = jo;
function Uo(e2, t8) {
  return t8 === false ? false : e2.charAt(t8) === "/" && e2.charAt(t8 + 1) === "/" ? Je(e2, t8) : t8;
}
var Ae = Uo;
function Vo(e2, t8) {
  let r2 = null, n2 = t8;
  for (; n2 !== r2; ) r2 = n2, n2 = T(e2, n2), n2 = ye(e2, n2), n2 = Ae(e2, n2), n2 = U(e2, n2);
  return n2;
}
var je = Vo;
function $o(e2, t8) {
  let r2 = null, n2 = t8;
  for (; n2 !== r2; ) r2 = n2, n2 = He(e2, n2), n2 = ye(e2, n2), n2 = T(e2, n2);
  return n2 = Ae(e2, n2), n2 = U(e2, n2), n2 !== false && G(e2, n2);
}
var ct = $o;
function Wo(e2, t8) {
  let r2 = e2.lastIndexOf(`
`);
  return r2 === -1 ? 0 : Ee(e2.slice(r2 + 1).match(/^[\t ]*/u)[0], t8);
}
var ru = Wo;
function Xt2(e2) {
  if (typeof e2 != "string") throw new TypeError("Expected a string");
  return e2.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function Mo(e2, t8) {
  let r2 = e2.match(new RegExp(`(${Xt2(t8)})+`, "gu"));
  return r2 === null ? 0 : r2.reduce((n2, u) => Math.max(n2, u.length / t8.length), 0);
}
var nu = Mo;
function Go(e2, t8) {
  let r2 = je(e2, t8);
  return r2 === false ? "" : e2.charAt(r2);
}
var uu = Go;
var ft2 = "'", ou = '"';
function Ko(e2, t8) {
  let r2 = t8 === true || t8 === ft2 ? ft2 : ou, n2 = r2 === ft2 ? ou : ft2, u = 0, o2 = 0;
  for (let i of e2) i === r2 ? u++ : i === n2 && o2++;
  return u > o2 ? n2 : r2;
}
var iu = Ko;
function zo(e2, t8, r2) {
  for (let n2 = t8; n2 < r2; ++n2) if (e2.charAt(n2) === `
`) return true;
  return false;
}
var su = zo;
function Ho(e2, t8, r2 = {}) {
  return T(e2, r2.backwards ? t8 - 1 : t8, r2) !== t8;
}
var au = Ho;
function Jo(e2, t8, r2) {
  let n2 = t8 === '"' ? "'" : '"', o2 = te(false, e2, /\\(.)|(["'])/gsu, (i, s2, a) => s2 === n2 ? s2 : a === t8 ? "\\" + a : a || (r2 && /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/u.test(s2) ? s2 : "\\" + s2));
  return t8 + o2 + t8;
}
var Du = Jo;
function qo(e2, t8, r2) {
  return je(e2, r2(t8));
}
function Xo(e2, t8) {
  return arguments.length === 2 || typeof t8 == "number" ? je(e2, t8) : qo(...arguments);
}
function Qo(e2, t8, r2) {
  return Pe(e2, r2(t8));
}
function Zo(e2, t8) {
  return arguments.length === 2 || typeof t8 == "number" ? Pe(e2, t8) : Qo(...arguments);
}
function ei(e2, t8, r2) {
  return ct(e2, r2(t8));
}
function ti(e2, t8) {
  return arguments.length === 2 || typeof t8 == "number" ? ct(e2, t8) : ei(...arguments);
}
function ce(e2, t8 = 1) {
  return async (...r2) => {
    let n2 = r2[t8] ?? {}, u = n2.plugins ?? [];
    return r2[t8] = { ...n2, plugins: Array.isArray(u) ? u : Object.values(u) }, e2(...r2);
  };
}
var cu = ce(Jt);
async function fu(e2, t8) {
  let { formatted: r2 } = await cu(e2, { ...t8, cursorOffset: -1 });
  return r2;
}
async function ri(e2, t8) {
  return await fu(e2, t8) === e2;
}
var ni = ce(Qe, 0), ui = { parse: ce(qn), formatAST: ce(Xn), formatDoc: ce(Qn), printToDoc: ce(Zn), printDocToString: ce(eu) };
var ElementType;
(function(ElementType2) {
  ElementType2["Root"] = "root";
  ElementType2["Text"] = "text";
  ElementType2["Directive"] = "directive";
  ElementType2["Comment"] = "comment";
  ElementType2["Script"] = "script";
  ElementType2["Style"] = "style";
  ElementType2["Tag"] = "tag";
  ElementType2["CDATA"] = "cdata";
  ElementType2["Doctype"] = "doctype";
})(ElementType || (ElementType = {}));
function isTag$1(elem) {
  return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
}
const Root = ElementType.Root;
const Text$1 = ElementType.Text;
const Directive = ElementType.Directive;
const Comment$1 = ElementType.Comment;
const Script = ElementType.Script;
const Style = ElementType.Style;
const Tag = ElementType.Tag;
const CDATA$1 = ElementType.CDATA;
const Doctype = ElementType.Doctype;
class Node {
  constructor() {
    this.parent = null;
    this.prev = null;
    this.next = null;
    this.startIndex = null;
    this.endIndex = null;
  }
  // Read-write aliases for properties
  /**
   * Same as {@link parent}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get parentNode() {
    return this.parent;
  }
  set parentNode(parent) {
    this.parent = parent;
  }
  /**
   * Same as {@link prev}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get previousSibling() {
    return this.prev;
  }
  set previousSibling(prev) {
    this.prev = prev;
  }
  /**
   * Same as {@link next}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get nextSibling() {
    return this.next;
  }
  set nextSibling(next) {
    this.next = next;
  }
  /**
   * Clone this node, and optionally its children.
   *
   * @param recursive Clone child nodes as well.
   * @returns A clone of the node.
   */
  cloneNode(recursive = false) {
    return cloneNode(this, recursive);
  }
}
class DataNode extends Node {
  /**
   * @param data The content of the data node
   */
  constructor(data) {
    super();
    this.data = data;
  }
  /**
   * Same as {@link data}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get nodeValue() {
    return this.data;
  }
  set nodeValue(data) {
    this.data = data;
  }
}
class Text extends DataNode {
  constructor() {
    super(...arguments);
    this.type = ElementType.Text;
  }
  get nodeType() {
    return 3;
  }
}
class Comment extends DataNode {
  constructor() {
    super(...arguments);
    this.type = ElementType.Comment;
  }
  get nodeType() {
    return 8;
  }
}
class ProcessingInstruction extends DataNode {
  constructor(name2, data) {
    super(data);
    this.name = name2;
    this.type = ElementType.Directive;
  }
  get nodeType() {
    return 1;
  }
}
class NodeWithChildren extends Node {
  /**
   * @param children Children of the node. Only certain node types can have children.
   */
  constructor(children) {
    super();
    this.children = children;
  }
  // Aliases
  /** First child of the node. */
  get firstChild() {
    var _a2;
    return (_a2 = this.children[0]) !== null && _a2 !== void 0 ? _a2 : null;
  }
  /** Last child of the node. */
  get lastChild() {
    return this.children.length > 0 ? this.children[this.children.length - 1] : null;
  }
  /**
   * Same as {@link children}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get childNodes() {
    return this.children;
  }
  set childNodes(children) {
    this.children = children;
  }
}
class CDATA extends NodeWithChildren {
  constructor() {
    super(...arguments);
    this.type = ElementType.CDATA;
  }
  get nodeType() {
    return 4;
  }
}
class Document extends NodeWithChildren {
  constructor() {
    super(...arguments);
    this.type = ElementType.Root;
  }
  get nodeType() {
    return 9;
  }
}
class Element extends NodeWithChildren {
  /**
   * @param name Name of the tag, eg. `div`, `span`.
   * @param attribs Object mapping attribute names to attribute values.
   * @param children Children of the node.
   */
  constructor(name2, attribs, children = [], type = name2 === "script" ? ElementType.Script : name2 === "style" ? ElementType.Style : ElementType.Tag) {
    super(children);
    this.name = name2;
    this.attribs = attribs;
    this.type = type;
  }
  get nodeType() {
    return 1;
  }
  // DOM Level 1 aliases
  /**
   * Same as {@link name}.
   * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
   */
  get tagName() {
    return this.name;
  }
  set tagName(name2) {
    this.name = name2;
  }
  get attributes() {
    return Object.keys(this.attribs).map((name2) => {
      var _a2, _b;
      return {
        name: name2,
        value: this.attribs[name2],
        namespace: (_a2 = this["x-attribsNamespace"]) === null || _a2 === void 0 ? void 0 : _a2[name2],
        prefix: (_b = this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name2]
      };
    });
  }
}
function isTag(node) {
  return isTag$1(node);
}
function isCDATA(node) {
  return node.type === ElementType.CDATA;
}
function isText(node) {
  return node.type === ElementType.Text;
}
function isComment(node) {
  return node.type === ElementType.Comment;
}
function isDirective(node) {
  return node.type === ElementType.Directive;
}
function isDocument(node) {
  return node.type === ElementType.Root;
}
function cloneNode(node, recursive = false) {
  let result;
  if (isText(node)) {
    result = new Text(node.data);
  } else if (isComment(node)) {
    result = new Comment(node.data);
  } else if (isTag(node)) {
    const children = recursive ? cloneChildren(node.children) : [];
    const clone = new Element(node.name, { ...node.attribs }, children);
    children.forEach((child) => child.parent = clone);
    if (node.namespace != null) {
      clone.namespace = node.namespace;
    }
    if (node["x-attribsNamespace"]) {
      clone["x-attribsNamespace"] = { ...node["x-attribsNamespace"] };
    }
    if (node["x-attribsPrefix"]) {
      clone["x-attribsPrefix"] = { ...node["x-attribsPrefix"] };
    }
    result = clone;
  } else if (isCDATA(node)) {
    const children = recursive ? cloneChildren(node.children) : [];
    const clone = new CDATA(children);
    children.forEach((child) => child.parent = clone);
    result = clone;
  } else if (isDocument(node)) {
    const children = recursive ? cloneChildren(node.children) : [];
    const clone = new Document(children);
    children.forEach((child) => child.parent = clone);
    if (node["x-mode"]) {
      clone["x-mode"] = node["x-mode"];
    }
    result = clone;
  } else if (isDirective(node)) {
    const instruction = new ProcessingInstruction(node.name, node.data);
    if (node["x-name"] != null) {
      instruction["x-name"] = node["x-name"];
      instruction["x-publicId"] = node["x-publicId"];
      instruction["x-systemId"] = node["x-systemId"];
    }
    result = instruction;
  } else {
    throw new Error(`Not implemented yet: ${node.type}`);
  }
  result.startIndex = node.startIndex;
  result.endIndex = node.endIndex;
  if (node.sourceCodeLocation != null) {
    result.sourceCodeLocation = node.sourceCodeLocation;
  }
  return result;
}
function cloneChildren(childs) {
  const children = childs.map((child) => cloneNode(child, true));
  for (let i = 1; i < children.length; i++) {
    children[i].prev = children[i - 1];
    children[i - 1].next = children[i];
  }
  return children;
}
const defaultOpts = {
  withStartIndices: false,
  withEndIndices: false,
  xmlMode: false
};
class DomHandler {
  /**
   * @param callback Called once parsing has completed.
   * @param options Settings for the handler.
   * @param elementCB Callback whenever a tag is closed.
   */
  constructor(callback, options, elementCB) {
    this.dom = [];
    this.root = new Document(this.dom);
    this.done = false;
    this.tagStack = [this.root];
    this.lastNode = null;
    this.parser = null;
    if (typeof options === "function") {
      elementCB = options;
      options = defaultOpts;
    }
    if (typeof callback === "object") {
      options = callback;
      callback = void 0;
    }
    this.callback = callback !== null && callback !== void 0 ? callback : null;
    this.options = options !== null && options !== void 0 ? options : defaultOpts;
    this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
  }
  onparserinit(parser) {
    this.parser = parser;
  }
  // Resets the handler back to starting state
  onreset() {
    this.dom = [];
    this.root = new Document(this.dom);
    this.done = false;
    this.tagStack = [this.root];
    this.lastNode = null;
    this.parser = null;
  }
  // Signals the handler that parsing is done
  onend() {
    if (this.done)
      return;
    this.done = true;
    this.parser = null;
    this.handleCallback(null);
  }
  onerror(error) {
    this.handleCallback(error);
  }
  onclosetag() {
    this.lastNode = null;
    const elem = this.tagStack.pop();
    if (this.options.withEndIndices) {
      elem.endIndex = this.parser.endIndex;
    }
    if (this.elementCB)
      this.elementCB(elem);
  }
  onopentag(name2, attribs) {
    const type = this.options.xmlMode ? ElementType.Tag : void 0;
    const element = new Element(name2, attribs, void 0, type);
    this.addNode(element);
    this.tagStack.push(element);
  }
  ontext(data) {
    const { lastNode } = this;
    if (lastNode && lastNode.type === ElementType.Text) {
      lastNode.data += data;
      if (this.options.withEndIndices) {
        lastNode.endIndex = this.parser.endIndex;
      }
    } else {
      const node = new Text(data);
      this.addNode(node);
      this.lastNode = node;
    }
  }
  oncomment(data) {
    if (this.lastNode && this.lastNode.type === ElementType.Comment) {
      this.lastNode.data += data;
      return;
    }
    const node = new Comment(data);
    this.addNode(node);
    this.lastNode = node;
  }
  oncommentend() {
    this.lastNode = null;
  }
  oncdatastart() {
    const text = new Text("");
    const node = new CDATA([text]);
    this.addNode(node);
    text.parent = node;
    this.lastNode = text;
  }
  oncdataend() {
    this.lastNode = null;
  }
  onprocessinginstruction(name2, data) {
    const node = new ProcessingInstruction(name2, data);
    this.addNode(node);
  }
  handleCallback(error) {
    if (typeof this.callback === "function") {
      this.callback(error, this.dom);
    } else if (error) {
      throw error;
    }
  }
  addNode(node) {
    const parent = this.tagStack[this.tagStack.length - 1];
    const previousSibling = parent.children[parent.children.length - 1];
    if (this.options.withStartIndices) {
      node.startIndex = this.parser.startIndex;
    }
    if (this.options.withEndIndices) {
      node.endIndex = this.parser.endIndex;
    }
    parent.children.push(node);
    if (previousSibling) {
      node.prev = previousSibling;
      previousSibling.next = node;
    }
    node.parent = parent;
    this.lastNode = null;
  }
}
const e = /\n/g;
function n(n2) {
  const o2 = [...n2.matchAll(e)].map((e2) => e2.index || 0);
  o2.unshift(-1);
  const s2 = t7(o2, 0, o2.length);
  return (e2) => r(s2, e2);
}
function t7(e2, n2, r2) {
  if (r2 - n2 == 1) return { offset: e2[n2], index: n2 + 1 };
  const o2 = Math.ceil((n2 + r2) / 2), s2 = t7(e2, n2, o2), l2 = t7(e2, o2, r2);
  return { offset: s2.offset, low: s2, high: l2 };
}
function r(e2, n2) {
  return function(e3) {
    return Object.prototype.hasOwnProperty.call(e3, "index");
  }(e2) ? { line: e2.index, column: n2 - e2.offset } : r(e2.high.offset < n2 ? e2.high : e2.low, n2);
}
function o(e2, t8 = "", r2 = {}) {
  const o2 = "string" != typeof t8 ? t8 : r2, l2 = "string" == typeof t8 ? t8 : "", c2 = e2.map(s), f = !!o2.lineNumbers;
  return function(e3, t9 = 0) {
    const r3 = f ? n(e3) : () => ({ line: 0, column: 0 });
    let o3 = t9;
    const s2 = [];
    e: for (; o3 < e3.length; ) {
      let n2 = false;
      for (const t10 of c2) {
        t10.regex.lastIndex = o3;
        const c3 = t10.regex.exec(e3);
        if (c3 && c3[0].length > 0) {
          if (!t10.discard) {
            const e4 = r3(o3), n3 = "string" == typeof t10.replace ? c3[0].replace(new RegExp(t10.regex.source, t10.regex.flags), t10.replace) : c3[0];
            s2.push({ state: l2, name: t10.name, text: n3, offset: o3, len: c3[0].length, line: e4.line, column: e4.column });
          }
          if (o3 = t10.regex.lastIndex, n2 = true, t10.push) {
            const n3 = t10.push(e3, o3);
            s2.push(...n3.tokens), o3 = n3.offset;
          }
          if (t10.pop) break e;
          break;
        }
      }
      if (!n2) break;
    }
    return { tokens: s2, offset: o3, complete: e3.length <= o3 };
  };
}
function s(e2, n2) {
  return { ...e2, regex: l(e2, n2) };
}
function l(e2, n2) {
  if (0 === e2.name.length) throw new Error(`Rule #${n2} has empty name, which is not allowed.`);
  if (function(e3) {
    return Object.prototype.hasOwnProperty.call(e3, "regex");
  }(e2)) return function(e3) {
    if (e3.global) throw new Error(`Regular expression /${e3.source}/${e3.flags} contains the global flag, which is not allowed.`);
    return e3.sticky ? e3 : new RegExp(e3.source, e3.flags + "y");
  }(e2.regex);
  if (function(e3) {
    return Object.prototype.hasOwnProperty.call(e3, "str");
  }(e2)) {
    if (0 === e2.str.length) throw new Error(`Rule #${n2} ("${e2.name}") has empty "str" property, which is not allowed.`);
    return new RegExp(c(e2.str), "y");
  }
  return new RegExp(c(e2.name), "y");
}
function c(e2) {
  return e2.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, "\\$&");
}
function token(onToken, onEnd) {
  return (data, i) => {
    let position = i;
    let value = void 0;
    if (i < data.tokens.length) {
      value = onToken(data.tokens[i], data, i);
      if (value !== void 0) {
        position++;
      }
    }
    return value === void 0 ? { matched: false } : {
      matched: true,
      position,
      value
    };
  };
}
function mapInner(r2, f) {
  return r2.matched ? {
    matched: true,
    position: r2.position,
    value: f(r2.value, r2.position)
  } : r2;
}
function mapOuter(r2, f) {
  return r2.matched ? f(r2) : r2;
}
function map(p, mapper) {
  return (data, i) => mapInner(p(data, i), (v2, j2) => mapper(v2, data, i, j2));
}
function option(p, def) {
  return (data, i) => {
    const r2 = p(data, i);
    return r2.matched ? r2 : {
      matched: true,
      position: i,
      value: def
    };
  };
}
function choice(...ps2) {
  return (data, i) => {
    for (const p of ps2) {
      const result = p(data, i);
      if (result.matched) {
        return result;
      }
    }
    return { matched: false };
  };
}
function otherwise(pa2, pb) {
  return (data, i) => {
    const r1 = pa2(data, i);
    return r1.matched ? r1 : pb(data, i);
  };
}
function takeWhile(p, test) {
  return (data, i) => {
    const values = [];
    let success = true;
    do {
      const r2 = p(data, i);
      if (r2.matched && test(r2.value, values.length + 1, data, i, r2.position)) {
        values.push(r2.value);
        i = r2.position;
      } else {
        success = false;
      }
    } while (success);
    return {
      matched: true,
      position: i,
      value: values
    };
  };
}
function many(p) {
  return takeWhile(p, () => true);
}
function many1(p) {
  return ab(p, many(p), (head, tail) => [head, ...tail]);
}
function ab(pa2, pb, join) {
  return (data, i) => mapOuter(pa2(data, i), (ma2) => mapInner(pb(data, ma2.position), (vb, j2) => join(ma2.value, vb, data, i, j2)));
}
function left(pa2, pb) {
  return ab(pa2, pb, (va2) => va2);
}
function right(pa2, pb) {
  return ab(pa2, pb, (va2, vb) => vb);
}
function abc(pa2, pb, pc, join) {
  return (data, i) => mapOuter(pa2(data, i), (ma2) => mapOuter(pb(data, ma2.position), (mb) => mapInner(pc(data, mb.position), (vc, j2) => join(ma2.value, mb.value, vc, data, i, j2))));
}
function middle(pa2, pb, pc) {
  return abc(pa2, pb, pc, (ra2, rb) => rb);
}
function all(...ps2) {
  return (data, i) => {
    const result = [];
    let position = i;
    for (const p of ps2) {
      const r1 = p(data, position);
      if (r1.matched) {
        result.push(r1.value);
        position = r1.position;
      } else {
        return { matched: false };
      }
    }
    return {
      matched: true,
      position,
      value: result
    };
  };
}
function flatten(...ps2) {
  return flatten1(all(...ps2));
}
function flatten1(p) {
  return map(p, (vs2) => vs2.flatMap((v2) => v2));
}
function chainReduce(acc, f) {
  return (data, i) => {
    let loop = true;
    let acc1 = acc;
    let pos = i;
    do {
      const r2 = f(acc1, data, pos)(data, pos);
      if (r2.matched) {
        acc1 = r2.value;
        pos = r2.position;
      } else {
        loop = false;
      }
    } while (loop);
    return {
      matched: true,
      position: pos,
      value: acc1
    };
  };
}
function reduceLeft(acc, p, reducer) {
  return chainReduce(acc, (acc2) => map(p, (v2, data, i, j2) => reducer(acc2, v2, data, i, j2)));
}
function leftAssoc2(pLeft, pOper, pRight) {
  return chain(pLeft, (v0) => reduceLeft(v0, ab(pOper, pRight, (f, y2) => [f, y2]), (acc, [f, y2]) => f(acc, y2)));
}
function chain(p, f) {
  return (data, i) => mapOuter(p(data, i), (m1) => f(m1.value, data, i, m1.position)(data, m1.position));
}
const ws = `(?:[ \\t\\r\\n\\f]*)`;
const nl = `(?:\\n|\\r\\n|\\r|\\f)`;
const nonascii = `[^\\x00-\\x7F]`;
const unicode = `(?:\\\\[0-9a-f]{1,6}(?:\\r\\n|[ \\n\\r\\t\\f])?)`;
const escape = `(?:\\\\[^\\n\\r\\f0-9a-f])`;
const nmstart = `(?:[_a-z]|${nonascii}|${unicode}|${escape})`;
const nmchar = `(?:[_a-z0-9-]|${nonascii}|${unicode}|${escape})`;
const name = `(?:${nmchar}+)`;
const ident = `(?:[-]?${nmstart}${nmchar}*)`;
const string1 = `'([^\\n\\r\\f\\\\']|\\\\${nl}|${nonascii}|${unicode}|${escape})*'`;
const string2 = `"([^\\n\\r\\f\\\\"]|\\\\${nl}|${nonascii}|${unicode}|${escape})*"`;
const lexSelector = o([
  { name: "ws", regex: new RegExp(ws) },
  { name: "hash", regex: new RegExp(`#${name}`, "i") },
  { name: "ident", regex: new RegExp(ident, "i") },
  { name: "str1", regex: new RegExp(string1, "i") },
  { name: "str2", regex: new RegExp(string2, "i") },
  { name: "*" },
  { name: "." },
  { name: "," },
  { name: "[" },
  { name: "]" },
  { name: "=" },
  { name: ">" },
  { name: "|" },
  { name: "+" },
  { name: "~" },
  { name: "^" },
  { name: "$" }
]);
const lexEscapedString = o([
  { name: "unicode", regex: new RegExp(unicode, "i") },
  { name: "escape", regex: new RegExp(escape, "i") },
  { name: "any", regex: new RegExp("[\\s\\S]", "i") }
]);
function sumSpec([a0, a1, a2], [b0, b1, b2]) {
  return [a0 + b0, a1 + b1, a2 + b2];
}
function sumAllSpec(ss2) {
  return ss2.reduce(sumSpec, [0, 0, 0]);
}
const unicodeEscapedSequence_ = token((t8) => t8.name === "unicode" ? String.fromCodePoint(parseInt(t8.text.slice(1), 16)) : void 0);
const escapedSequence_ = token((t8) => t8.name === "escape" ? t8.text.slice(1) : void 0);
const anyChar_ = token((t8) => t8.name === "any" ? t8.text : void 0);
const escapedString_ = map(many(choice(unicodeEscapedSequence_, escapedSequence_, anyChar_)), (cs2) => cs2.join(""));
function unescape(escapedString) {
  const lexerResult = lexEscapedString(escapedString);
  const result = escapedString_({ tokens: lexerResult.tokens, options: void 0 }, 0);
  return result.value;
}
function literal(name2) {
  return token((t8) => t8.name === name2 ? true : void 0);
}
const whitespace_ = token((t8) => t8.name === "ws" ? null : void 0);
const optionalWhitespace_ = option(whitespace_, null);
function optionallySpaced(parser) {
  return middle(optionalWhitespace_, parser, optionalWhitespace_);
}
const identifier_ = token((t8) => t8.name === "ident" ? unescape(t8.text) : void 0);
const hashId_ = token((t8) => t8.name === "hash" ? unescape(t8.text.slice(1)) : void 0);
const string_ = token((t8) => t8.name.startsWith("str") ? unescape(t8.text.slice(1, -1)) : void 0);
const namespace_ = left(option(identifier_, ""), literal("|"));
const qualifiedName_ = otherwise(ab(namespace_, identifier_, (ns2, name2) => ({ name: name2, namespace: ns2 })), map(identifier_, (name2) => ({ name: name2, namespace: null })));
const uniSelector_ = otherwise(ab(namespace_, literal("*"), (ns2) => ({ type: "universal", namespace: ns2, specificity: [0, 0, 0] })), map(literal("*"), () => ({ type: "universal", namespace: null, specificity: [0, 0, 0] })));
const tagSelector_ = map(qualifiedName_, ({ name: name2, namespace }) => ({
  type: "tag",
  name: name2,
  namespace,
  specificity: [0, 0, 1]
}));
const classSelector_ = ab(literal("."), identifier_, (fullstop, name2) => ({
  type: "class",
  name: name2,
  specificity: [0, 1, 0]
}));
const idSelector_ = map(hashId_, (name2) => ({
  type: "id",
  name: name2,
  specificity: [1, 0, 0]
}));
const attrModifier_ = token((t8) => {
  if (t8.name === "ident") {
    if (t8.text === "i" || t8.text === "I") {
      return "i";
    }
    if (t8.text === "s" || t8.text === "S") {
      return "s";
    }
  }
  return void 0;
});
const attrValue_ = otherwise(ab(string_, option(right(optionalWhitespace_, attrModifier_), null), (v2, mod) => ({ value: v2, modifier: mod })), ab(identifier_, option(right(whitespace_, attrModifier_), null), (v2, mod) => ({ value: v2, modifier: mod })));
const attrMatcher_ = choice(map(literal("="), () => "="), ab(literal("~"), literal("="), () => "~="), ab(literal("|"), literal("="), () => "|="), ab(literal("^"), literal("="), () => "^="), ab(literal("$"), literal("="), () => "$="), ab(literal("*"), literal("="), () => "*="));
const attrPresenceSelector_ = abc(literal("["), optionallySpaced(qualifiedName_), literal("]"), (lbr, { name: name2, namespace }) => ({
  type: "attrPresence",
  name: name2,
  namespace,
  specificity: [0, 1, 0]
}));
const attrValueSelector_ = middle(literal("["), abc(optionallySpaced(qualifiedName_), attrMatcher_, optionallySpaced(attrValue_), ({ name: name2, namespace }, matcher, { value, modifier }) => ({
  type: "attrValue",
  name: name2,
  namespace,
  matcher,
  value,
  modifier,
  specificity: [0, 1, 0]
})), literal("]"));
const attrSelector_ = otherwise(attrPresenceSelector_, attrValueSelector_);
const typeSelector_ = otherwise(uniSelector_, tagSelector_);
const subclassSelector_ = choice(idSelector_, classSelector_, attrSelector_);
const compoundSelector_ = map(otherwise(flatten(typeSelector_, many(subclassSelector_)), many1(subclassSelector_)), (ss2) => {
  return {
    type: "compound",
    list: ss2,
    specificity: sumAllSpec(ss2.map((s2) => s2.specificity))
  };
});
const combinator_ = choice(map(literal(">"), () => ">"), map(literal("+"), () => "+"), map(literal("~"), () => "~"), ab(literal("|"), literal("|"), () => "||"));
const combinatorSeparator_ = otherwise(optionallySpaced(combinator_), map(whitespace_, () => " "));
const complexSelector_ = leftAssoc2(compoundSelector_, map(combinatorSeparator_, (c2) => (left2, right2) => ({
  type: "compound",
  list: [...right2.list, { type: "combinator", combinator: c2, left: left2, specificity: left2.specificity }],
  specificity: sumSpec(left2.specificity, right2.specificity)
})), compoundSelector_);
function parse_(parser, str) {
  if (!(typeof str === "string" || str instanceof String)) {
    throw new Error("Expected a selector string. Actual input is not a string!");
  }
  const lexerResult = lexSelector(str);
  if (!lexerResult.complete) {
    throw new Error(`The input "${str}" was only partially tokenized, stopped at offset ${lexerResult.offset}!
` + prettyPrintPosition(str, lexerResult.offset));
  }
  const result = optionallySpaced(parser)({ tokens: lexerResult.tokens, options: void 0 }, 0);
  if (!result.matched) {
    throw new Error(`No match for "${str}" input!`);
  }
  if (result.position < lexerResult.tokens.length) {
    const token2 = lexerResult.tokens[result.position];
    throw new Error(`The input "${str}" was only partially parsed, stopped at offset ${token2.offset}!
` + prettyPrintPosition(str, token2.offset, token2.len));
  }
  return result.value;
}
function prettyPrintPosition(str, offset, len = 1) {
  return `${str.replace(/(\t)|(\r)|(\n)/g, (m, t8, r2) => t8 ? "␉" : r2 ? "␍" : "␊")}
${"".padEnd(offset)}${"^".repeat(len)}`;
}
function parse1(str) {
  return parse_(complexSelector_, str);
}
function serialize(selector) {
  if (!selector.type) {
    throw new Error("This is not an AST node.");
  }
  switch (selector.type) {
    case "universal":
      return _serNs(selector.namespace) + "*";
    case "tag":
      return _serNs(selector.namespace) + _serIdent(selector.name);
    case "class":
      return "." + _serIdent(selector.name);
    case "id":
      return "#" + _serIdent(selector.name);
    case "attrPresence":
      return `[${_serNs(selector.namespace)}${_serIdent(selector.name)}]`;
    case "attrValue":
      return `[${_serNs(selector.namespace)}${_serIdent(selector.name)}${selector.matcher}"${_serStr(selector.value)}"${selector.modifier ? selector.modifier : ""}]`;
    case "combinator":
      return serialize(selector.left) + selector.combinator;
    case "compound":
      return selector.list.reduce((acc, node) => {
        if (node.type === "combinator") {
          return serialize(node) + acc;
        } else {
          return acc + serialize(node);
        }
      }, "");
    case "list":
      return selector.list.map(serialize).join(",");
  }
}
function _serNs(ns2) {
  return ns2 || ns2 === "" ? _serIdent(ns2) + "|" : "";
}
function _codePoint(char) {
  return `\\${char.codePointAt(0).toString(16)} `;
}
function _serIdent(str) {
  return str.replace(
    /(^[0-9])|(^-[0-9])|(^-$)|([-0-9a-zA-Z_]|[^\x00-\x7F])|(\x00)|([\x01-\x1f]|\x7f)|([\s\S])/g,
    (m, d1, d2, hy, safe, nl2, ctrl, other) => d1 ? _codePoint(d1) : d2 ? "-" + _codePoint(d2.slice(1)) : hy ? "\\-" : safe ? safe : nl2 ? "�" : ctrl ? _codePoint(ctrl) : "\\" + other
  );
}
function _serStr(str) {
  return str.replace(
    /(")|(\\)|(\x00)|([\x01-\x1f]|\x7f)/g,
    (m, dq, bs2, nl2, ctrl) => dq ? '\\"' : bs2 ? "\\\\" : nl2 ? "�" : _codePoint(ctrl)
  );
}
function normalize(selector) {
  if (!selector.type) {
    throw new Error("This is not an AST node.");
  }
  switch (selector.type) {
    case "compound": {
      selector.list.forEach(normalize);
      selector.list.sort((a, b2) => _compareArrays(_getSelectorPriority(a), _getSelectorPriority(b2)));
      break;
    }
    case "combinator": {
      normalize(selector.left);
      break;
    }
    case "list": {
      selector.list.forEach(normalize);
      selector.list.sort((a, b2) => serialize(a) < serialize(b2) ? -1 : 1);
      break;
    }
  }
  return selector;
}
function _getSelectorPriority(selector) {
  switch (selector.type) {
    case "universal":
      return [1];
    case "tag":
      return [1];
    case "id":
      return [2];
    case "class":
      return [3, selector.name];
    case "attrPresence":
      return [4, serialize(selector)];
    case "attrValue":
      return [5, serialize(selector)];
    case "combinator":
      return [15, serialize(selector)];
  }
}
function compareSpecificity(a, b2) {
  return _compareArrays(a, b2);
}
function _compareArrays(a, b2) {
  if (!Array.isArray(a) || !Array.isArray(b2)) {
    throw new Error("Arguments must be arrays.");
  }
  const shorter = a.length < b2.length ? a.length : b2.length;
  for (let i = 0; i < shorter; i++) {
    if (a[i] === b2[i]) {
      continue;
    }
    return a[i] < b2[i] ? -1 : 1;
  }
  return a.length - b2.length;
}
class DecisionTree {
  constructor(input) {
    this.branches = weave(toAstTerminalPairs(input));
  }
  build(builder) {
    return builder(this.branches);
  }
}
function toAstTerminalPairs(array) {
  const len = array.length;
  const results = new Array(len);
  for (let i = 0; i < len; i++) {
    const [selectorString, val] = array[i];
    const ast = preprocess(parse1(selectorString));
    results[i] = {
      ast,
      terminal: {
        type: "terminal",
        valueContainer: { index: i, value: val, specificity: ast.specificity }
      }
    };
  }
  return results;
}
function preprocess(ast) {
  reduceSelectorVariants(ast);
  normalize(ast);
  return ast;
}
function reduceSelectorVariants(ast) {
  const newList = [];
  ast.list.forEach((sel) => {
    switch (sel.type) {
      case "class":
        newList.push({
          matcher: "~=",
          modifier: null,
          name: "class",
          namespace: null,
          specificity: sel.specificity,
          type: "attrValue",
          value: sel.name
        });
        break;
      case "id":
        newList.push({
          matcher: "=",
          modifier: null,
          name: "id",
          namespace: null,
          specificity: sel.specificity,
          type: "attrValue",
          value: sel.name
        });
        break;
      case "combinator":
        reduceSelectorVariants(sel.left);
        newList.push(sel);
        break;
      case "universal":
        break;
      default:
        newList.push(sel);
        break;
    }
  });
  ast.list = newList;
}
function weave(items) {
  const branches = [];
  while (items.length) {
    const topKind = findTopKey(items, (sel) => true, getSelectorKind);
    const { matches, nonmatches, empty } = breakByKind(items, topKind);
    items = nonmatches;
    if (matches.length) {
      branches.push(branchOfKind(topKind, matches));
    }
    if (empty.length) {
      branches.push(...terminate(empty));
    }
  }
  return branches;
}
function terminate(items) {
  const results = [];
  for (const item of items) {
    const terminal = item.terminal;
    if (terminal.type === "terminal") {
      results.push(terminal);
    } else {
      const { matches, rest } = partition(terminal.cont, (node) => node.type === "terminal");
      matches.forEach((node) => results.push(node));
      if (rest.length) {
        terminal.cont = rest;
        results.push(terminal);
      }
    }
  }
  return results;
}
function breakByKind(items, selectedKind) {
  const matches = [];
  const nonmatches = [];
  const empty = [];
  for (const item of items) {
    const simpsels = item.ast.list;
    if (simpsels.length) {
      const isMatch = simpsels.some((node) => getSelectorKind(node) === selectedKind);
      (isMatch ? matches : nonmatches).push(item);
    } else {
      empty.push(item);
    }
  }
  return { matches, nonmatches, empty };
}
function getSelectorKind(sel) {
  switch (sel.type) {
    case "attrPresence":
      return `attrPresence ${sel.name}`;
    case "attrValue":
      return `attrValue ${sel.name}`;
    case "combinator":
      return `combinator ${sel.combinator}`;
    default:
      return sel.type;
  }
}
function branchOfKind(kind, items) {
  if (kind === "tag") {
    return tagNameBranch(items);
  }
  if (kind.startsWith("attrValue ")) {
    return attrValueBranch(kind.substring(10), items);
  }
  if (kind.startsWith("attrPresence ")) {
    return attrPresenceBranch(kind.substring(13), items);
  }
  if (kind === "combinator >") {
    return combinatorBranch(">", items);
  }
  if (kind === "combinator +") {
    return combinatorBranch("+", items);
  }
  throw new Error(`Unsupported selector kind: ${kind}`);
}
function tagNameBranch(items) {
  const groups = spliceAndGroup(items, (x) => x.type === "tag", (x) => x.name);
  const variants = Object.entries(groups).map(([name2, group]) => ({
    type: "variant",
    value: name2,
    cont: weave(group.items)
  }));
  return {
    type: "tagName",
    variants
  };
}
function attrPresenceBranch(name2, items) {
  for (const item of items) {
    spliceSimpleSelector(item, (x) => x.type === "attrPresence" && x.name === name2);
  }
  return {
    type: "attrPresence",
    name: name2,
    cont: weave(items)
  };
}
function attrValueBranch(name2, items) {
  const groups = spliceAndGroup(items, (x) => x.type === "attrValue" && x.name === name2, (x) => `${x.matcher} ${x.modifier || ""} ${x.value}`);
  const matchers = [];
  for (const group of Object.values(groups)) {
    const sel = group.oneSimpleSelector;
    const predicate = getAttrPredicate(sel);
    const continuation = weave(group.items);
    matchers.push({
      type: "matcher",
      matcher: sel.matcher,
      modifier: sel.modifier,
      value: sel.value,
      predicate,
      cont: continuation
    });
  }
  return {
    type: "attrValue",
    name: name2,
    matchers
  };
}
function getAttrPredicate(sel) {
  if (sel.modifier === "i") {
    const expected = sel.value.toLowerCase();
    switch (sel.matcher) {
      case "=":
        return (actual) => expected === actual.toLowerCase();
      case "~=":
        return (actual) => actual.toLowerCase().split(/[ \t]+/).includes(expected);
      case "^=":
        return (actual) => actual.toLowerCase().startsWith(expected);
      case "$=":
        return (actual) => actual.toLowerCase().endsWith(expected);
      case "*=":
        return (actual) => actual.toLowerCase().includes(expected);
      case "|=":
        return (actual) => {
          const lower = actual.toLowerCase();
          return expected === lower || lower.startsWith(expected) && lower[expected.length] === "-";
        };
    }
  } else {
    const expected = sel.value;
    switch (sel.matcher) {
      case "=":
        return (actual) => expected === actual;
      case "~=":
        return (actual) => actual.split(/[ \t]+/).includes(expected);
      case "^=":
        return (actual) => actual.startsWith(expected);
      case "$=":
        return (actual) => actual.endsWith(expected);
      case "*=":
        return (actual) => actual.includes(expected);
      case "|=":
        return (actual) => expected === actual || actual.startsWith(expected) && actual[expected.length] === "-";
    }
  }
}
function combinatorBranch(combinator, items) {
  const groups = spliceAndGroup(items, (x) => x.type === "combinator" && x.combinator === combinator, (x) => serialize(x.left));
  const leftItems = [];
  for (const group of Object.values(groups)) {
    const rightCont = weave(group.items);
    const leftAst = group.oneSimpleSelector.left;
    leftItems.push({
      ast: leftAst,
      terminal: { type: "popElement", cont: rightCont }
    });
  }
  return {
    type: "pushElement",
    combinator,
    cont: weave(leftItems)
  };
}
function spliceAndGroup(items, predicate, keyCallback) {
  const groups = {};
  while (items.length) {
    const bestKey = findTopKey(items, predicate, keyCallback);
    const bestKeyPredicate = (sel) => predicate(sel) && keyCallback(sel) === bestKey;
    const hasBestKeyPredicate = (item) => item.ast.list.some(bestKeyPredicate);
    const { matches, rest } = partition1(items, hasBestKeyPredicate);
    let oneSimpleSelector = null;
    for (const item of matches) {
      const splicedNode = spliceSimpleSelector(item, bestKeyPredicate);
      if (!oneSimpleSelector) {
        oneSimpleSelector = splicedNode;
      }
    }
    if (oneSimpleSelector == null) {
      throw new Error("No simple selector is found.");
    }
    groups[bestKey] = { oneSimpleSelector, items: matches };
    items = rest;
  }
  return groups;
}
function spliceSimpleSelector(item, predicate) {
  const simpsels = item.ast.list;
  const matches = new Array(simpsels.length);
  let firstIndex = -1;
  for (let i = simpsels.length; i-- > 0; ) {
    if (predicate(simpsels[i])) {
      matches[i] = true;
      firstIndex = i;
    }
  }
  if (firstIndex == -1) {
    throw new Error(`Couldn't find the required simple selector.`);
  }
  const result = simpsels[firstIndex];
  item.ast.list = simpsels.filter((sel, i) => !matches[i]);
  return result;
}
function findTopKey(items, predicate, keyCallback) {
  const candidates = {};
  for (const item of items) {
    const candidates1 = {};
    for (const node of item.ast.list.filter(predicate)) {
      candidates1[keyCallback(node)] = true;
    }
    for (const key of Object.keys(candidates1)) {
      if (candidates[key]) {
        candidates[key]++;
      } else {
        candidates[key] = 1;
      }
    }
  }
  let topKind = "";
  let topCounter = 0;
  for (const entry of Object.entries(candidates)) {
    if (entry[1] > topCounter) {
      topKind = entry[0];
      topCounter = entry[1];
    }
  }
  return topKind;
}
function partition(src, predicate) {
  const matches = [];
  const rest = [];
  for (const x of src) {
    if (predicate(x)) {
      matches.push(x);
    } else {
      rest.push(x);
    }
  }
  return { matches, rest };
}
function partition1(src, predicate) {
  const matches = [];
  const rest = [];
  for (const x of src) {
    if (predicate(x)) {
      matches.push(x);
    } else {
      rest.push(x);
    }
  }
  return { matches, rest };
}
class Picker {
  constructor(f) {
    this.f = f;
  }
  pickAll(el) {
    return this.f(el);
  }
  pick1(el, preferFirst = false) {
    const results = this.f(el);
    const len = results.length;
    if (len === 0) {
      return null;
    }
    if (len === 1) {
      return results[0].value;
    }
    const comparator = preferFirst ? comparatorPreferFirst : comparatorPreferLast;
    let result = results[0];
    for (let i = 1; i < len; i++) {
      const next = results[i];
      if (comparator(result, next)) {
        result = next;
      }
    }
    return result.value;
  }
}
function comparatorPreferFirst(acc, next) {
  const diff = compareSpecificity(next.specificity, acc.specificity);
  return diff > 0 || diff === 0 && next.index < acc.index;
}
function comparatorPreferLast(acc, next) {
  const diff = compareSpecificity(next.specificity, acc.specificity);
  return diff > 0 || diff === 0 && next.index > acc.index;
}
function hp2Builder(nodes) {
  return new Picker(handleArray(nodes));
}
function handleArray(nodes) {
  const matchers = nodes.map(handleNode);
  return (el, ...tail) => matchers.flatMap((m) => m(el, ...tail));
}
function handleNode(node) {
  switch (node.type) {
    case "terminal": {
      const result = [node.valueContainer];
      return (el, ...tail) => result;
    }
    case "tagName":
      return handleTagName(node);
    case "attrValue":
      return handleAttrValueName(node);
    case "attrPresence":
      return handleAttrPresenceName(node);
    case "pushElement":
      return handlePushElementNode(node);
    case "popElement":
      return handlePopElementNode(node);
  }
}
function handleTagName(node) {
  const variants = {};
  for (const variant of node.variants) {
    variants[variant.value] = handleArray(variant.cont);
  }
  return (el, ...tail) => {
    const continuation = variants[el.name];
    return continuation ? continuation(el, ...tail) : [];
  };
}
function handleAttrPresenceName(node) {
  const attrName = node.name;
  const continuation = handleArray(node.cont);
  return (el, ...tail) => Object.prototype.hasOwnProperty.call(el.attribs, attrName) ? continuation(el, ...tail) : [];
}
function handleAttrValueName(node) {
  const callbacks = [];
  for (const matcher of node.matchers) {
    const predicate = matcher.predicate;
    const continuation = handleArray(matcher.cont);
    callbacks.push((attr, el, ...tail) => predicate(attr) ? continuation(el, ...tail) : []);
  }
  const attrName = node.name;
  return (el, ...tail) => {
    const attr = el.attribs[attrName];
    return attr || attr === "" ? callbacks.flatMap((cb) => cb(attr, el, ...tail)) : [];
  };
}
function handlePushElementNode(node) {
  const continuation = handleArray(node.cont);
  const leftElementGetter = node.combinator === "+" ? getPrecedingElement : getParentElement;
  return (el, ...tail) => {
    const next = leftElementGetter(el);
    if (next === null) {
      return [];
    }
    return continuation(next, el, ...tail);
  };
}
const getPrecedingElement = (el) => {
  const prev = el.prev;
  if (prev === null) {
    return null;
  }
  return isTag(prev) ? prev : getPrecedingElement(prev);
};
const getParentElement = (el) => {
  const parent = el.parent;
  return parent && isTag(parent) ? parent : null;
};
function handlePopElementNode(node) {
  const continuation = handleArray(node.cont);
  return (el, next, ...tail) => continuation(next, ...tail);
}
const htmlDecodeTree = new Uint16Array(
  // prettier-ignore
  'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map((c2) => c2.charCodeAt(0))
);
const xmlDecodeTree = new Uint16Array(
  // prettier-ignore
  "Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((c2) => c2.charCodeAt(0))
);
var _a;
const decodeMap = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]);
const fromCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
    let output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  }
);
function replaceCodePoint(codePoint) {
  var _a2;
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return (_a2 = decodeMap.get(codePoint)) !== null && _a2 !== void 0 ? _a2 : codePoint;
}
var CharCodes$1;
(function(CharCodes2) {
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
  CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
  CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
  CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes$1 || (CharCodes$1 = {}));
const TO_LOWER_BIT = 32;
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));
function isNumber$1(code) {
  return code >= CharCodes$1.ZERO && code <= CharCodes$1.NINE;
}
function isHexadecimalCharacter(code) {
  return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_F || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_F;
}
function isAsciiAlphaNumeric(code) {
  return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_Z || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_Z || isNumber$1(code);
}
function isEntityInAttributeInvalidEnd(code) {
  return code === CharCodes$1.EQUALS || isAsciiAlphaNumeric(code);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
class EntityDecoder {
  constructor(decodeTree, emitCodePoint, errors) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors;
    this.state = EntityDecoderState.EntityStart;
    this.consumed = 1;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.decodeMode = DecodingMode.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(decodeMode) {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(str, offset) {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (str.charCodeAt(offset) === CharCodes$1.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(str, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(str, offset);
      }
      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(str, offset);
      }
      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(str, offset);
      }
      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(str, offset);
      }
      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(str, offset);
      }
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(str, offset) {
    if (offset >= str.length) {
      return -1;
    }
    if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes$1.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(str, offset + 1);
    }
    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(str, offset);
  }
  addToNumericResult(str, start, end, base) {
    if (start !== end) {
      const digitCount = end - start;
      this.result = this.result * Math.pow(base, digitCount) + parseInt(str.substr(start, digitCount), base);
      this.consumed += digitCount;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(str, offset) {
    const startIdx = offset;
    while (offset < str.length) {
      const char = str.charCodeAt(offset);
      if (isNumber$1(char) || isHexadecimalCharacter(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str, startIdx, offset, 16);
        return this.emitNumericEntity(char, 3);
      }
    }
    this.addToNumericResult(str, startIdx, offset, 16);
    return -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(str, offset) {
    const startIdx = offset;
    while (offset < str.length) {
      const char = str.charCodeAt(offset);
      if (isNumber$1(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str, startIdx, offset, 10);
        return this.emitNumericEntity(char, 2);
      }
    }
    this.addToNumericResult(str, startIdx, offset, 10);
    return -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(lastCp, expectedLength) {
    var _a2;
    if (this.consumed <= expectedLength) {
      (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
      return 0;
    }
    if (lastCp === CharCodes$1.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }
    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
    if (this.errors) {
      if (lastCp !== CharCodes$1.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }
      this.errors.validateNumericCharacterReference(this.result);
    }
    return this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(str, offset) {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
    for (; offset < str.length; offset++, this.excess++) {
      const char = str.charCodeAt(offset);
      this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
      if (this.treeIndex < 0) {
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
        (valueLength === 0 || // And there should be no invalid characters.
        isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
      }
      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      if (valueLength !== 0) {
        if (char === CharCodes$1.SEMI) {
          return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
        }
        if (this.decodeMode !== DecodingMode.Strict) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var _a2;
    const { result, decodeTree } = this;
    const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
    this.emitNamedEntityData(result, valueLength, this.consumed);
    (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
    return this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(result, valueLength, consumed) {
    const { decodeTree } = this;
    this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }
    return consumed;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var _a2;
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      }
      // Otherwise, emit a numeric entity if we have one.
      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
}
function getDecoder(decodeTree) {
  let ret = "";
  const decoder2 = new EntityDecoder(decodeTree, (str) => ret += fromCodePoint(str));
  return function decodeWithTrie(str, decodeMode) {
    let lastIndex = 0;
    let offset = 0;
    while ((offset = str.indexOf("&", offset)) >= 0) {
      ret += str.slice(lastIndex, offset);
      decoder2.startEntity(decodeMode);
      const len = decoder2.write(
        str,
        // Skip the "&"
        offset + 1
      );
      if (len < 0) {
        lastIndex = offset + decoder2.end();
        break;
      }
      lastIndex = offset + len;
      offset = len === 0 ? lastIndex + 1 : lastIndex;
    }
    const result = ret + str.slice(lastIndex);
    ret = "";
    return result;
  };
}
function determineBranch(decodeTree, current, nodeIdx, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
  }
  let lo2 = nodeIdx;
  let hi2 = lo2 + branchCount - 1;
  while (lo2 <= hi2) {
    const mid = lo2 + hi2 >>> 1;
    const midVal = decodeTree[mid];
    if (midVal < char) {
      lo2 = mid + 1;
    } else if (midVal > char) {
      hi2 = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }
  return -1;
}
getDecoder(htmlDecodeTree);
getDecoder(xmlDecodeTree);
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["Tab"] = 9] = "Tab";
  CharCodes2[CharCodes2["NewLine"] = 10] = "NewLine";
  CharCodes2[CharCodes2["FormFeed"] = 12] = "FormFeed";
  CharCodes2[CharCodes2["CarriageReturn"] = 13] = "CarriageReturn";
  CharCodes2[CharCodes2["Space"] = 32] = "Space";
  CharCodes2[CharCodes2["ExclamationMark"] = 33] = "ExclamationMark";
  CharCodes2[CharCodes2["Number"] = 35] = "Number";
  CharCodes2[CharCodes2["Amp"] = 38] = "Amp";
  CharCodes2[CharCodes2["SingleQuote"] = 39] = "SingleQuote";
  CharCodes2[CharCodes2["DoubleQuote"] = 34] = "DoubleQuote";
  CharCodes2[CharCodes2["Dash"] = 45] = "Dash";
  CharCodes2[CharCodes2["Slash"] = 47] = "Slash";
  CharCodes2[CharCodes2["Zero"] = 48] = "Zero";
  CharCodes2[CharCodes2["Nine"] = 57] = "Nine";
  CharCodes2[CharCodes2["Semi"] = 59] = "Semi";
  CharCodes2[CharCodes2["Lt"] = 60] = "Lt";
  CharCodes2[CharCodes2["Eq"] = 61] = "Eq";
  CharCodes2[CharCodes2["Gt"] = 62] = "Gt";
  CharCodes2[CharCodes2["Questionmark"] = 63] = "Questionmark";
  CharCodes2[CharCodes2["UpperA"] = 65] = "UpperA";
  CharCodes2[CharCodes2["LowerA"] = 97] = "LowerA";
  CharCodes2[CharCodes2["UpperF"] = 70] = "UpperF";
  CharCodes2[CharCodes2["LowerF"] = 102] = "LowerF";
  CharCodes2[CharCodes2["UpperZ"] = 90] = "UpperZ";
  CharCodes2[CharCodes2["LowerZ"] = 122] = "LowerZ";
  CharCodes2[CharCodes2["LowerX"] = 120] = "LowerX";
  CharCodes2[CharCodes2["OpeningSquareBracket"] = 91] = "OpeningSquareBracket";
})(CharCodes || (CharCodes = {}));
var State;
(function(State2) {
  State2[State2["Text"] = 1] = "Text";
  State2[State2["BeforeTagName"] = 2] = "BeforeTagName";
  State2[State2["InTagName"] = 3] = "InTagName";
  State2[State2["InSelfClosingTag"] = 4] = "InSelfClosingTag";
  State2[State2["BeforeClosingTagName"] = 5] = "BeforeClosingTagName";
  State2[State2["InClosingTagName"] = 6] = "InClosingTagName";
  State2[State2["AfterClosingTagName"] = 7] = "AfterClosingTagName";
  State2[State2["BeforeAttributeName"] = 8] = "BeforeAttributeName";
  State2[State2["InAttributeName"] = 9] = "InAttributeName";
  State2[State2["AfterAttributeName"] = 10] = "AfterAttributeName";
  State2[State2["BeforeAttributeValue"] = 11] = "BeforeAttributeValue";
  State2[State2["InAttributeValueDq"] = 12] = "InAttributeValueDq";
  State2[State2["InAttributeValueSq"] = 13] = "InAttributeValueSq";
  State2[State2["InAttributeValueNq"] = 14] = "InAttributeValueNq";
  State2[State2["BeforeDeclaration"] = 15] = "BeforeDeclaration";
  State2[State2["InDeclaration"] = 16] = "InDeclaration";
  State2[State2["InProcessingInstruction"] = 17] = "InProcessingInstruction";
  State2[State2["BeforeComment"] = 18] = "BeforeComment";
  State2[State2["CDATASequence"] = 19] = "CDATASequence";
  State2[State2["InSpecialComment"] = 20] = "InSpecialComment";
  State2[State2["InCommentLike"] = 21] = "InCommentLike";
  State2[State2["BeforeSpecialS"] = 22] = "BeforeSpecialS";
  State2[State2["SpecialStartSequence"] = 23] = "SpecialStartSequence";
  State2[State2["InSpecialTag"] = 24] = "InSpecialTag";
  State2[State2["BeforeEntity"] = 25] = "BeforeEntity";
  State2[State2["BeforeNumericEntity"] = 26] = "BeforeNumericEntity";
  State2[State2["InNamedEntity"] = 27] = "InNamedEntity";
  State2[State2["InNumericEntity"] = 28] = "InNumericEntity";
  State2[State2["InHexEntity"] = 29] = "InHexEntity";
})(State || (State = {}));
function isWhitespace(c2) {
  return c2 === CharCodes.Space || c2 === CharCodes.NewLine || c2 === CharCodes.Tab || c2 === CharCodes.FormFeed || c2 === CharCodes.CarriageReturn;
}
function isEndOfTagSection(c2) {
  return c2 === CharCodes.Slash || c2 === CharCodes.Gt || isWhitespace(c2);
}
function isNumber(c2) {
  return c2 >= CharCodes.Zero && c2 <= CharCodes.Nine;
}
function isASCIIAlpha(c2) {
  return c2 >= CharCodes.LowerA && c2 <= CharCodes.LowerZ || c2 >= CharCodes.UpperA && c2 <= CharCodes.UpperZ;
}
function isHexDigit(c2) {
  return c2 >= CharCodes.UpperA && c2 <= CharCodes.UpperF || c2 >= CharCodes.LowerA && c2 <= CharCodes.LowerF;
}
var QuoteType;
(function(QuoteType2) {
  QuoteType2[QuoteType2["NoValue"] = 0] = "NoValue";
  QuoteType2[QuoteType2["Unquoted"] = 1] = "Unquoted";
  QuoteType2[QuoteType2["Single"] = 2] = "Single";
  QuoteType2[QuoteType2["Double"] = 3] = "Double";
})(QuoteType || (QuoteType = {}));
const Sequences = {
  Cdata: new Uint8Array([67, 68, 65, 84, 65, 91]),
  CdataEnd: new Uint8Array([93, 93, 62]),
  CommentEnd: new Uint8Array([45, 45, 62]),
  ScriptEnd: new Uint8Array([60, 47, 115, 99, 114, 105, 112, 116]),
  StyleEnd: new Uint8Array([60, 47, 115, 116, 121, 108, 101]),
  TitleEnd: new Uint8Array([60, 47, 116, 105, 116, 108, 101])
  // `</title`
};
class Tokenizer {
  constructor({ xmlMode = false, decodeEntities = true }, cbs) {
    this.cbs = cbs;
    this.state = State.Text;
    this.buffer = "";
    this.sectionStart = 0;
    this.index = 0;
    this.baseState = State.Text;
    this.isSpecial = false;
    this.running = true;
    this.offset = 0;
    this.currentSequence = void 0;
    this.sequenceIndex = 0;
    this.trieIndex = 0;
    this.trieCurrent = 0;
    this.entityResult = 0;
    this.entityExcess = 0;
    this.xmlMode = xmlMode;
    this.decodeEntities = decodeEntities;
    this.entityTrie = xmlMode ? xmlDecodeTree : htmlDecodeTree;
  }
  reset() {
    this.state = State.Text;
    this.buffer = "";
    this.sectionStart = 0;
    this.index = 0;
    this.baseState = State.Text;
    this.currentSequence = void 0;
    this.running = true;
    this.offset = 0;
  }
  write(chunk) {
    this.offset += this.buffer.length;
    this.buffer = chunk;
    this.parse();
  }
  end() {
    if (this.running)
      this.finish();
  }
  pause() {
    this.running = false;
  }
  resume() {
    this.running = true;
    if (this.index < this.buffer.length + this.offset) {
      this.parse();
    }
  }
  /**
   * The current index within all of the written data.
   */
  getIndex() {
    return this.index;
  }
  /**
   * The start of the current section.
   */
  getSectionStart() {
    return this.sectionStart;
  }
  stateText(c2) {
    if (c2 === CharCodes.Lt || !this.decodeEntities && this.fastForwardTo(CharCodes.Lt)) {
      if (this.index > this.sectionStart) {
        this.cbs.ontext(this.sectionStart, this.index);
      }
      this.state = State.BeforeTagName;
      this.sectionStart = this.index;
    } else if (this.decodeEntities && c2 === CharCodes.Amp) {
      this.state = State.BeforeEntity;
    }
  }
  stateSpecialStartSequence(c2) {
    const isEnd = this.sequenceIndex === this.currentSequence.length;
    const isMatch = isEnd ? (
      // If we are at the end of the sequence, make sure the tag name has ended
      isEndOfTagSection(c2)
    ) : (
      // Otherwise, do a case-insensitive comparison
      (c2 | 32) === this.currentSequence[this.sequenceIndex]
    );
    if (!isMatch) {
      this.isSpecial = false;
    } else if (!isEnd) {
      this.sequenceIndex++;
      return;
    }
    this.sequenceIndex = 0;
    this.state = State.InTagName;
    this.stateInTagName(c2);
  }
  /** Look for an end tag. For <title> tags, also decode entities. */
  stateInSpecialTag(c2) {
    if (this.sequenceIndex === this.currentSequence.length) {
      if (c2 === CharCodes.Gt || isWhitespace(c2)) {
        const endOfText = this.index - this.currentSequence.length;
        if (this.sectionStart < endOfText) {
          const actualIndex = this.index;
          this.index = endOfText;
          this.cbs.ontext(this.sectionStart, endOfText);
          this.index = actualIndex;
        }
        this.isSpecial = false;
        this.sectionStart = endOfText + 2;
        this.stateInClosingTagName(c2);
        return;
      }
      this.sequenceIndex = 0;
    }
    if ((c2 | 32) === this.currentSequence[this.sequenceIndex]) {
      this.sequenceIndex += 1;
    } else if (this.sequenceIndex === 0) {
      if (this.currentSequence === Sequences.TitleEnd) {
        if (this.decodeEntities && c2 === CharCodes.Amp) {
          this.state = State.BeforeEntity;
        }
      } else if (this.fastForwardTo(CharCodes.Lt)) {
        this.sequenceIndex = 1;
      }
    } else {
      this.sequenceIndex = Number(c2 === CharCodes.Lt);
    }
  }
  stateCDATASequence(c2) {
    if (c2 === Sequences.Cdata[this.sequenceIndex]) {
      if (++this.sequenceIndex === Sequences.Cdata.length) {
        this.state = State.InCommentLike;
        this.currentSequence = Sequences.CdataEnd;
        this.sequenceIndex = 0;
        this.sectionStart = this.index + 1;
      }
    } else {
      this.sequenceIndex = 0;
      this.state = State.InDeclaration;
      this.stateInDeclaration(c2);
    }
  }
  /**
   * When we wait for one specific character, we can speed things up
   * by skipping through the buffer until we find it.
   *
   * @returns Whether the character was found.
   */
  fastForwardTo(c2) {
    while (++this.index < this.buffer.length + this.offset) {
      if (this.buffer.charCodeAt(this.index - this.offset) === c2) {
        return true;
      }
    }
    this.index = this.buffer.length + this.offset - 1;
    return false;
  }
  /**
   * Comments and CDATA end with `-->` and `]]>`.
   *
   * Their common qualities are:
   * - Their end sequences have a distinct character they start with.
   * - That character is then repeated, so we have to check multiple repeats.
   * - All characters but the start character of the sequence can be skipped.
   */
  stateInCommentLike(c2) {
    if (c2 === this.currentSequence[this.sequenceIndex]) {
      if (++this.sequenceIndex === this.currentSequence.length) {
        if (this.currentSequence === Sequences.CdataEnd) {
          this.cbs.oncdata(this.sectionStart, this.index, 2);
        } else {
          this.cbs.oncomment(this.sectionStart, this.index, 2);
        }
        this.sequenceIndex = 0;
        this.sectionStart = this.index + 1;
        this.state = State.Text;
      }
    } else if (this.sequenceIndex === 0) {
      if (this.fastForwardTo(this.currentSequence[0])) {
        this.sequenceIndex = 1;
      }
    } else if (c2 !== this.currentSequence[this.sequenceIndex - 1]) {
      this.sequenceIndex = 0;
    }
  }
  /**
   * HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
   *
   * XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
   * We allow anything that wouldn't end the tag.
   */
  isTagStartChar(c2) {
    return this.xmlMode ? !isEndOfTagSection(c2) : isASCIIAlpha(c2);
  }
  startSpecial(sequence, offset) {
    this.isSpecial = true;
    this.currentSequence = sequence;
    this.sequenceIndex = offset;
    this.state = State.SpecialStartSequence;
  }
  stateBeforeTagName(c2) {
    if (c2 === CharCodes.ExclamationMark) {
      this.state = State.BeforeDeclaration;
      this.sectionStart = this.index + 1;
    } else if (c2 === CharCodes.Questionmark) {
      this.state = State.InProcessingInstruction;
      this.sectionStart = this.index + 1;
    } else if (this.isTagStartChar(c2)) {
      const lower = c2 | 32;
      this.sectionStart = this.index;
      if (!this.xmlMode && lower === Sequences.TitleEnd[2]) {
        this.startSpecial(Sequences.TitleEnd, 3);
      } else {
        this.state = !this.xmlMode && lower === Sequences.ScriptEnd[2] ? State.BeforeSpecialS : State.InTagName;
      }
    } else if (c2 === CharCodes.Slash) {
      this.state = State.BeforeClosingTagName;
    } else {
      this.state = State.Text;
      this.stateText(c2);
    }
  }
  stateInTagName(c2) {
    if (isEndOfTagSection(c2)) {
      this.cbs.onopentagname(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.state = State.BeforeAttributeName;
      this.stateBeforeAttributeName(c2);
    }
  }
  stateBeforeClosingTagName(c2) {
    if (isWhitespace(c2)) ;
    else if (c2 === CharCodes.Gt) {
      this.state = State.Text;
    } else {
      this.state = this.isTagStartChar(c2) ? State.InClosingTagName : State.InSpecialComment;
      this.sectionStart = this.index;
    }
  }
  stateInClosingTagName(c2) {
    if (c2 === CharCodes.Gt || isWhitespace(c2)) {
      this.cbs.onclosetag(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.state = State.AfterClosingTagName;
      this.stateAfterClosingTagName(c2);
    }
  }
  stateAfterClosingTagName(c2) {
    if (c2 === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
      this.state = State.Text;
      this.baseState = State.Text;
      this.sectionStart = this.index + 1;
    }
  }
  stateBeforeAttributeName(c2) {
    if (c2 === CharCodes.Gt) {
      this.cbs.onopentagend(this.index);
      if (this.isSpecial) {
        this.state = State.InSpecialTag;
        this.sequenceIndex = 0;
      } else {
        this.state = State.Text;
      }
      this.baseState = this.state;
      this.sectionStart = this.index + 1;
    } else if (c2 === CharCodes.Slash) {
      this.state = State.InSelfClosingTag;
    } else if (!isWhitespace(c2)) {
      this.state = State.InAttributeName;
      this.sectionStart = this.index;
    }
  }
  stateInSelfClosingTag(c2) {
    if (c2 === CharCodes.Gt) {
      this.cbs.onselfclosingtag(this.index);
      this.state = State.Text;
      this.baseState = State.Text;
      this.sectionStart = this.index + 1;
      this.isSpecial = false;
    } else if (!isWhitespace(c2)) {
      this.state = State.BeforeAttributeName;
      this.stateBeforeAttributeName(c2);
    }
  }
  stateInAttributeName(c2) {
    if (c2 === CharCodes.Eq || isEndOfTagSection(c2)) {
      this.cbs.onattribname(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.state = State.AfterAttributeName;
      this.stateAfterAttributeName(c2);
    }
  }
  stateAfterAttributeName(c2) {
    if (c2 === CharCodes.Eq) {
      this.state = State.BeforeAttributeValue;
    } else if (c2 === CharCodes.Slash || c2 === CharCodes.Gt) {
      this.cbs.onattribend(QuoteType.NoValue, this.index);
      this.state = State.BeforeAttributeName;
      this.stateBeforeAttributeName(c2);
    } else if (!isWhitespace(c2)) {
      this.cbs.onattribend(QuoteType.NoValue, this.index);
      this.state = State.InAttributeName;
      this.sectionStart = this.index;
    }
  }
  stateBeforeAttributeValue(c2) {
    if (c2 === CharCodes.DoubleQuote) {
      this.state = State.InAttributeValueDq;
      this.sectionStart = this.index + 1;
    } else if (c2 === CharCodes.SingleQuote) {
      this.state = State.InAttributeValueSq;
      this.sectionStart = this.index + 1;
    } else if (!isWhitespace(c2)) {
      this.sectionStart = this.index;
      this.state = State.InAttributeValueNq;
      this.stateInAttributeValueNoQuotes(c2);
    }
  }
  handleInAttributeValue(c2, quote) {
    if (c2 === quote || !this.decodeEntities && this.fastForwardTo(quote)) {
      this.cbs.onattribdata(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.cbs.onattribend(quote === CharCodes.DoubleQuote ? QuoteType.Double : QuoteType.Single, this.index);
      this.state = State.BeforeAttributeName;
    } else if (this.decodeEntities && c2 === CharCodes.Amp) {
      this.baseState = this.state;
      this.state = State.BeforeEntity;
    }
  }
  stateInAttributeValueDoubleQuotes(c2) {
    this.handleInAttributeValue(c2, CharCodes.DoubleQuote);
  }
  stateInAttributeValueSingleQuotes(c2) {
    this.handleInAttributeValue(c2, CharCodes.SingleQuote);
  }
  stateInAttributeValueNoQuotes(c2) {
    if (isWhitespace(c2) || c2 === CharCodes.Gt) {
      this.cbs.onattribdata(this.sectionStart, this.index);
      this.sectionStart = -1;
      this.cbs.onattribend(QuoteType.Unquoted, this.index);
      this.state = State.BeforeAttributeName;
      this.stateBeforeAttributeName(c2);
    } else if (this.decodeEntities && c2 === CharCodes.Amp) {
      this.baseState = this.state;
      this.state = State.BeforeEntity;
    }
  }
  stateBeforeDeclaration(c2) {
    if (c2 === CharCodes.OpeningSquareBracket) {
      this.state = State.CDATASequence;
      this.sequenceIndex = 0;
    } else {
      this.state = c2 === CharCodes.Dash ? State.BeforeComment : State.InDeclaration;
    }
  }
  stateInDeclaration(c2) {
    if (c2 === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
      this.cbs.ondeclaration(this.sectionStart, this.index);
      this.state = State.Text;
      this.sectionStart = this.index + 1;
    }
  }
  stateInProcessingInstruction(c2) {
    if (c2 === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
      this.cbs.onprocessinginstruction(this.sectionStart, this.index);
      this.state = State.Text;
      this.sectionStart = this.index + 1;
    }
  }
  stateBeforeComment(c2) {
    if (c2 === CharCodes.Dash) {
      this.state = State.InCommentLike;
      this.currentSequence = Sequences.CommentEnd;
      this.sequenceIndex = 2;
      this.sectionStart = this.index + 1;
    } else {
      this.state = State.InDeclaration;
    }
  }
  stateInSpecialComment(c2) {
    if (c2 === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
      this.cbs.oncomment(this.sectionStart, this.index, 0);
      this.state = State.Text;
      this.sectionStart = this.index + 1;
    }
  }
  stateBeforeSpecialS(c2) {
    const lower = c2 | 32;
    if (lower === Sequences.ScriptEnd[3]) {
      this.startSpecial(Sequences.ScriptEnd, 4);
    } else if (lower === Sequences.StyleEnd[3]) {
      this.startSpecial(Sequences.StyleEnd, 4);
    } else {
      this.state = State.InTagName;
      this.stateInTagName(c2);
    }
  }
  stateBeforeEntity(c2) {
    this.entityExcess = 1;
    this.entityResult = 0;
    if (c2 === CharCodes.Number) {
      this.state = State.BeforeNumericEntity;
    } else if (c2 === CharCodes.Amp) ;
    else {
      this.trieIndex = 0;
      this.trieCurrent = this.entityTrie[0];
      this.state = State.InNamedEntity;
      this.stateInNamedEntity(c2);
    }
  }
  stateInNamedEntity(c2) {
    this.entityExcess += 1;
    this.trieIndex = determineBranch(this.entityTrie, this.trieCurrent, this.trieIndex + 1, c2);
    if (this.trieIndex < 0) {
      this.emitNamedEntity();
      this.index--;
      return;
    }
    this.trieCurrent = this.entityTrie[this.trieIndex];
    const masked = this.trieCurrent & BinTrieFlags.VALUE_LENGTH;
    if (masked) {
      const valueLength = (masked >> 14) - 1;
      if (!this.allowLegacyEntity() && c2 !== CharCodes.Semi) {
        this.trieIndex += valueLength;
      } else {
        const entityStart = this.index - this.entityExcess + 1;
        if (entityStart > this.sectionStart) {
          this.emitPartial(this.sectionStart, entityStart);
        }
        this.entityResult = this.trieIndex;
        this.trieIndex += valueLength;
        this.entityExcess = 0;
        this.sectionStart = this.index + 1;
        if (valueLength === 0) {
          this.emitNamedEntity();
        }
      }
    }
  }
  emitNamedEntity() {
    this.state = this.baseState;
    if (this.entityResult === 0) {
      return;
    }
    const valueLength = (this.entityTrie[this.entityResult] & BinTrieFlags.VALUE_LENGTH) >> 14;
    switch (valueLength) {
      case 1: {
        this.emitCodePoint(this.entityTrie[this.entityResult] & ~BinTrieFlags.VALUE_LENGTH);
        break;
      }
      case 2: {
        this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
        break;
      }
      case 3: {
        this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
        this.emitCodePoint(this.entityTrie[this.entityResult + 2]);
      }
    }
  }
  stateBeforeNumericEntity(c2) {
    if ((c2 | 32) === CharCodes.LowerX) {
      this.entityExcess++;
      this.state = State.InHexEntity;
    } else {
      this.state = State.InNumericEntity;
      this.stateInNumericEntity(c2);
    }
  }
  emitNumericEntity(strict) {
    const entityStart = this.index - this.entityExcess - 1;
    const numberStart = entityStart + 2 + Number(this.state === State.InHexEntity);
    if (numberStart !== this.index) {
      if (entityStart > this.sectionStart) {
        this.emitPartial(this.sectionStart, entityStart);
      }
      this.sectionStart = this.index + Number(strict);
      this.emitCodePoint(replaceCodePoint(this.entityResult));
    }
    this.state = this.baseState;
  }
  stateInNumericEntity(c2) {
    if (c2 === CharCodes.Semi) {
      this.emitNumericEntity(true);
    } else if (isNumber(c2)) {
      this.entityResult = this.entityResult * 10 + (c2 - CharCodes.Zero);
      this.entityExcess++;
    } else {
      if (this.allowLegacyEntity()) {
        this.emitNumericEntity(false);
      } else {
        this.state = this.baseState;
      }
      this.index--;
    }
  }
  stateInHexEntity(c2) {
    if (c2 === CharCodes.Semi) {
      this.emitNumericEntity(true);
    } else if (isNumber(c2)) {
      this.entityResult = this.entityResult * 16 + (c2 - CharCodes.Zero);
      this.entityExcess++;
    } else if (isHexDigit(c2)) {
      this.entityResult = this.entityResult * 16 + ((c2 | 32) - CharCodes.LowerA + 10);
      this.entityExcess++;
    } else {
      if (this.allowLegacyEntity()) {
        this.emitNumericEntity(false);
      } else {
        this.state = this.baseState;
      }
      this.index--;
    }
  }
  allowLegacyEntity() {
    return !this.xmlMode && (this.baseState === State.Text || this.baseState === State.InSpecialTag);
  }
  /**
   * Remove data that has already been consumed from the buffer.
   */
  cleanup() {
    if (this.running && this.sectionStart !== this.index) {
      if (this.state === State.Text || this.state === State.InSpecialTag && this.sequenceIndex === 0) {
        this.cbs.ontext(this.sectionStart, this.index);
        this.sectionStart = this.index;
      } else if (this.state === State.InAttributeValueDq || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueNq) {
        this.cbs.onattribdata(this.sectionStart, this.index);
        this.sectionStart = this.index;
      }
    }
  }
  shouldContinue() {
    return this.index < this.buffer.length + this.offset && this.running;
  }
  /**
   * Iterates through the buffer, calling the function corresponding to the current state.
   *
   * States that are more likely to be hit are higher up, as a performance improvement.
   */
  parse() {
    while (this.shouldContinue()) {
      const c2 = this.buffer.charCodeAt(this.index - this.offset);
      switch (this.state) {
        case State.Text: {
          this.stateText(c2);
          break;
        }
        case State.SpecialStartSequence: {
          this.stateSpecialStartSequence(c2);
          break;
        }
        case State.InSpecialTag: {
          this.stateInSpecialTag(c2);
          break;
        }
        case State.CDATASequence: {
          this.stateCDATASequence(c2);
          break;
        }
        case State.InAttributeValueDq: {
          this.stateInAttributeValueDoubleQuotes(c2);
          break;
        }
        case State.InAttributeName: {
          this.stateInAttributeName(c2);
          break;
        }
        case State.InCommentLike: {
          this.stateInCommentLike(c2);
          break;
        }
        case State.InSpecialComment: {
          this.stateInSpecialComment(c2);
          break;
        }
        case State.BeforeAttributeName: {
          this.stateBeforeAttributeName(c2);
          break;
        }
        case State.InTagName: {
          this.stateInTagName(c2);
          break;
        }
        case State.InClosingTagName: {
          this.stateInClosingTagName(c2);
          break;
        }
        case State.BeforeTagName: {
          this.stateBeforeTagName(c2);
          break;
        }
        case State.AfterAttributeName: {
          this.stateAfterAttributeName(c2);
          break;
        }
        case State.InAttributeValueSq: {
          this.stateInAttributeValueSingleQuotes(c2);
          break;
        }
        case State.BeforeAttributeValue: {
          this.stateBeforeAttributeValue(c2);
          break;
        }
        case State.BeforeClosingTagName: {
          this.stateBeforeClosingTagName(c2);
          break;
        }
        case State.AfterClosingTagName: {
          this.stateAfterClosingTagName(c2);
          break;
        }
        case State.BeforeSpecialS: {
          this.stateBeforeSpecialS(c2);
          break;
        }
        case State.InAttributeValueNq: {
          this.stateInAttributeValueNoQuotes(c2);
          break;
        }
        case State.InSelfClosingTag: {
          this.stateInSelfClosingTag(c2);
          break;
        }
        case State.InDeclaration: {
          this.stateInDeclaration(c2);
          break;
        }
        case State.BeforeDeclaration: {
          this.stateBeforeDeclaration(c2);
          break;
        }
        case State.BeforeComment: {
          this.stateBeforeComment(c2);
          break;
        }
        case State.InProcessingInstruction: {
          this.stateInProcessingInstruction(c2);
          break;
        }
        case State.InNamedEntity: {
          this.stateInNamedEntity(c2);
          break;
        }
        case State.BeforeEntity: {
          this.stateBeforeEntity(c2);
          break;
        }
        case State.InHexEntity: {
          this.stateInHexEntity(c2);
          break;
        }
        case State.InNumericEntity: {
          this.stateInNumericEntity(c2);
          break;
        }
        default: {
          this.stateBeforeNumericEntity(c2);
        }
      }
      this.index++;
    }
    this.cleanup();
  }
  finish() {
    if (this.state === State.InNamedEntity) {
      this.emitNamedEntity();
    }
    if (this.sectionStart < this.index) {
      this.handleTrailingData();
    }
    this.cbs.onend();
  }
  /** Handle any trailing data. */
  handleTrailingData() {
    const endIndex = this.buffer.length + this.offset;
    if (this.state === State.InCommentLike) {
      if (this.currentSequence === Sequences.CdataEnd) {
        this.cbs.oncdata(this.sectionStart, endIndex, 0);
      } else {
        this.cbs.oncomment(this.sectionStart, endIndex, 0);
      }
    } else if (this.state === State.InNumericEntity && this.allowLegacyEntity()) {
      this.emitNumericEntity(false);
    } else if (this.state === State.InHexEntity && this.allowLegacyEntity()) {
      this.emitNumericEntity(false);
    } else if (this.state === State.InTagName || this.state === State.BeforeAttributeName || this.state === State.BeforeAttributeValue || this.state === State.AfterAttributeName || this.state === State.InAttributeName || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueDq || this.state === State.InAttributeValueNq || this.state === State.InClosingTagName) ;
    else {
      this.cbs.ontext(this.sectionStart, endIndex);
    }
  }
  emitPartial(start, endIndex) {
    if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
      this.cbs.onattribdata(start, endIndex);
    } else {
      this.cbs.ontext(start, endIndex);
    }
  }
  emitCodePoint(cp) {
    if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
      this.cbs.onattribentity(cp);
    } else {
      this.cbs.ontextentity(cp);
    }
  }
}
const formTags = /* @__PURE__ */ new Set([
  "input",
  "option",
  "optgroup",
  "select",
  "button",
  "datalist",
  "textarea"
]);
const pTag = /* @__PURE__ */ new Set(["p"]);
const tableSectionTags = /* @__PURE__ */ new Set(["thead", "tbody"]);
const ddtTags = /* @__PURE__ */ new Set(["dd", "dt"]);
const rtpTags = /* @__PURE__ */ new Set(["rt", "rp"]);
const openImpliesClose = /* @__PURE__ */ new Map([
  ["tr", /* @__PURE__ */ new Set(["tr", "th", "td"])],
  ["th", /* @__PURE__ */ new Set(["th"])],
  ["td", /* @__PURE__ */ new Set(["thead", "th", "td"])],
  ["body", /* @__PURE__ */ new Set(["head", "link", "script"])],
  ["li", /* @__PURE__ */ new Set(["li"])],
  ["p", pTag],
  ["h1", pTag],
  ["h2", pTag],
  ["h3", pTag],
  ["h4", pTag],
  ["h5", pTag],
  ["h6", pTag],
  ["select", formTags],
  ["input", formTags],
  ["output", formTags],
  ["button", formTags],
  ["datalist", formTags],
  ["textarea", formTags],
  ["option", /* @__PURE__ */ new Set(["option"])],
  ["optgroup", /* @__PURE__ */ new Set(["optgroup", "option"])],
  ["dd", ddtTags],
  ["dt", ddtTags],
  ["address", pTag],
  ["article", pTag],
  ["aside", pTag],
  ["blockquote", pTag],
  ["details", pTag],
  ["div", pTag],
  ["dl", pTag],
  ["fieldset", pTag],
  ["figcaption", pTag],
  ["figure", pTag],
  ["footer", pTag],
  ["form", pTag],
  ["header", pTag],
  ["hr", pTag],
  ["main", pTag],
  ["nav", pTag],
  ["ol", pTag],
  ["pre", pTag],
  ["section", pTag],
  ["table", pTag],
  ["ul", pTag],
  ["rt", rtpTags],
  ["rp", rtpTags],
  ["tbody", tableSectionTags],
  ["tfoot", tableSectionTags]
]);
const voidElements = /* @__PURE__ */ new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
const foreignContextElements = /* @__PURE__ */ new Set(["math", "svg"]);
const htmlIntegrationElements = /* @__PURE__ */ new Set([
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "annotation-xml",
  "foreignobject",
  "desc",
  "title"
]);
const reNameEnd = /\s|\//;
class Parser {
  constructor(cbs, options = {}) {
    var _a2, _b, _c, _d, _e2;
    this.options = options;
    this.startIndex = 0;
    this.endIndex = 0;
    this.openTagStart = 0;
    this.tagname = "";
    this.attribname = "";
    this.attribvalue = "";
    this.attribs = null;
    this.stack = [];
    this.foreignContext = [];
    this.buffers = [];
    this.bufferOffset = 0;
    this.writeIndex = 0;
    this.ended = false;
    this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
    this.lowerCaseTagNames = (_a2 = options.lowerCaseTags) !== null && _a2 !== void 0 ? _a2 : !options.xmlMode;
    this.lowerCaseAttributeNames = (_b = options.lowerCaseAttributeNames) !== null && _b !== void 0 ? _b : !options.xmlMode;
    this.tokenizer = new ((_c = options.Tokenizer) !== null && _c !== void 0 ? _c : Tokenizer)(this.options, this);
    (_e2 = (_d = this.cbs).onparserinit) === null || _e2 === void 0 ? void 0 : _e2.call(_d, this);
  }
  // Tokenizer event handlers
  /** @internal */
  ontext(start, endIndex) {
    var _a2, _b;
    const data = this.getSlice(start, endIndex);
    this.endIndex = endIndex - 1;
    (_b = (_a2 = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a2, data);
    this.startIndex = endIndex;
  }
  /** @internal */
  ontextentity(cp) {
    var _a2, _b;
    const index2 = this.tokenizer.getSectionStart();
    this.endIndex = index2 - 1;
    (_b = (_a2 = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a2, fromCodePoint(cp));
    this.startIndex = index2;
  }
  isVoidElement(name2) {
    return !this.options.xmlMode && voidElements.has(name2);
  }
  /** @internal */
  onopentagname(start, endIndex) {
    this.endIndex = endIndex;
    let name2 = this.getSlice(start, endIndex);
    if (this.lowerCaseTagNames) {
      name2 = name2.toLowerCase();
    }
    this.emitOpenTag(name2);
  }
  emitOpenTag(name2) {
    var _a2, _b, _c, _d;
    this.openTagStart = this.startIndex;
    this.tagname = name2;
    const impliesClose = !this.options.xmlMode && openImpliesClose.get(name2);
    if (impliesClose) {
      while (this.stack.length > 0 && impliesClose.has(this.stack[this.stack.length - 1])) {
        const element = this.stack.pop();
        (_b = (_a2 = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a2, element, true);
      }
    }
    if (!this.isVoidElement(name2)) {
      this.stack.push(name2);
      if (foreignContextElements.has(name2)) {
        this.foreignContext.push(true);
      } else if (htmlIntegrationElements.has(name2)) {
        this.foreignContext.push(false);
      }
    }
    (_d = (_c = this.cbs).onopentagname) === null || _d === void 0 ? void 0 : _d.call(_c, name2);
    if (this.cbs.onopentag)
      this.attribs = {};
  }
  endOpenTag(isImplied) {
    var _a2, _b;
    this.startIndex = this.openTagStart;
    if (this.attribs) {
      (_b = (_a2 = this.cbs).onopentag) === null || _b === void 0 ? void 0 : _b.call(_a2, this.tagname, this.attribs, isImplied);
      this.attribs = null;
    }
    if (this.cbs.onclosetag && this.isVoidElement(this.tagname)) {
      this.cbs.onclosetag(this.tagname, true);
    }
    this.tagname = "";
  }
  /** @internal */
  onopentagend(endIndex) {
    this.endIndex = endIndex;
    this.endOpenTag(false);
    this.startIndex = endIndex + 1;
  }
  /** @internal */
  onclosetag(start, endIndex) {
    var _a2, _b, _c, _d, _e2, _f;
    this.endIndex = endIndex;
    let name2 = this.getSlice(start, endIndex);
    if (this.lowerCaseTagNames) {
      name2 = name2.toLowerCase();
    }
    if (foreignContextElements.has(name2) || htmlIntegrationElements.has(name2)) {
      this.foreignContext.pop();
    }
    if (!this.isVoidElement(name2)) {
      const pos = this.stack.lastIndexOf(name2);
      if (pos !== -1) {
        if (this.cbs.onclosetag) {
          let count = this.stack.length - pos;
          while (count--) {
            this.cbs.onclosetag(this.stack.pop(), count !== 0);
          }
        } else
          this.stack.length = pos;
      } else if (!this.options.xmlMode && name2 === "p") {
        this.emitOpenTag("p");
        this.closeCurrentTag(true);
      }
    } else if (!this.options.xmlMode && name2 === "br") {
      (_b = (_a2 = this.cbs).onopentagname) === null || _b === void 0 ? void 0 : _b.call(_a2, "br");
      (_d = (_c = this.cbs).onopentag) === null || _d === void 0 ? void 0 : _d.call(_c, "br", {}, true);
      (_f = (_e2 = this.cbs).onclosetag) === null || _f === void 0 ? void 0 : _f.call(_e2, "br", false);
    }
    this.startIndex = endIndex + 1;
  }
  /** @internal */
  onselfclosingtag(endIndex) {
    this.endIndex = endIndex;
    if (this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1]) {
      this.closeCurrentTag(false);
      this.startIndex = endIndex + 1;
    } else {
      this.onopentagend(endIndex);
    }
  }
  closeCurrentTag(isOpenImplied) {
    var _a2, _b;
    const name2 = this.tagname;
    this.endOpenTag(isOpenImplied);
    if (this.stack[this.stack.length - 1] === name2) {
      (_b = (_a2 = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a2, name2, !isOpenImplied);
      this.stack.pop();
    }
  }
  /** @internal */
  onattribname(start, endIndex) {
    this.startIndex = start;
    const name2 = this.getSlice(start, endIndex);
    this.attribname = this.lowerCaseAttributeNames ? name2.toLowerCase() : name2;
  }
  /** @internal */
  onattribdata(start, endIndex) {
    this.attribvalue += this.getSlice(start, endIndex);
  }
  /** @internal */
  onattribentity(cp) {
    this.attribvalue += fromCodePoint(cp);
  }
  /** @internal */
  onattribend(quote, endIndex) {
    var _a2, _b;
    this.endIndex = endIndex;
    (_b = (_a2 = this.cbs).onattribute) === null || _b === void 0 ? void 0 : _b.call(_a2, this.attribname, this.attribvalue, quote === QuoteType.Double ? '"' : quote === QuoteType.Single ? "'" : quote === QuoteType.NoValue ? void 0 : null);
    if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) {
      this.attribs[this.attribname] = this.attribvalue;
    }
    this.attribvalue = "";
  }
  getInstructionName(value) {
    const index2 = value.search(reNameEnd);
    let name2 = index2 < 0 ? value : value.substr(0, index2);
    if (this.lowerCaseTagNames) {
      name2 = name2.toLowerCase();
    }
    return name2;
  }
  /** @internal */
  ondeclaration(start, endIndex) {
    this.endIndex = endIndex;
    const value = this.getSlice(start, endIndex);
    if (this.cbs.onprocessinginstruction) {
      const name2 = this.getInstructionName(value);
      this.cbs.onprocessinginstruction(`!${name2}`, `!${value}`);
    }
    this.startIndex = endIndex + 1;
  }
  /** @internal */
  onprocessinginstruction(start, endIndex) {
    this.endIndex = endIndex;
    const value = this.getSlice(start, endIndex);
    if (this.cbs.onprocessinginstruction) {
      const name2 = this.getInstructionName(value);
      this.cbs.onprocessinginstruction(`?${name2}`, `?${value}`);
    }
    this.startIndex = endIndex + 1;
  }
  /** @internal */
  oncomment(start, endIndex, offset) {
    var _a2, _b, _c, _d;
    this.endIndex = endIndex;
    (_b = (_a2 = this.cbs).oncomment) === null || _b === void 0 ? void 0 : _b.call(_a2, this.getSlice(start, endIndex - offset));
    (_d = (_c = this.cbs).oncommentend) === null || _d === void 0 ? void 0 : _d.call(_c);
    this.startIndex = endIndex + 1;
  }
  /** @internal */
  oncdata(start, endIndex, offset) {
    var _a2, _b, _c, _d, _e2, _f, _g, _h, _j, _k;
    this.endIndex = endIndex;
    const value = this.getSlice(start, endIndex - offset);
    if (this.options.xmlMode || this.options.recognizeCDATA) {
      (_b = (_a2 = this.cbs).oncdatastart) === null || _b === void 0 ? void 0 : _b.call(_a2);
      (_d = (_c = this.cbs).ontext) === null || _d === void 0 ? void 0 : _d.call(_c, value);
      (_f = (_e2 = this.cbs).oncdataend) === null || _f === void 0 ? void 0 : _f.call(_e2);
    } else {
      (_h = (_g = this.cbs).oncomment) === null || _h === void 0 ? void 0 : _h.call(_g, `[CDATA[${value}]]`);
      (_k = (_j = this.cbs).oncommentend) === null || _k === void 0 ? void 0 : _k.call(_j);
    }
    this.startIndex = endIndex + 1;
  }
  /** @internal */
  onend() {
    var _a2, _b;
    if (this.cbs.onclosetag) {
      this.endIndex = this.startIndex;
      for (let index2 = this.stack.length; index2 > 0; this.cbs.onclosetag(this.stack[--index2], true))
        ;
    }
    (_b = (_a2 = this.cbs).onend) === null || _b === void 0 ? void 0 : _b.call(_a2);
  }
  /**
   * Resets the parser to a blank state, ready to parse a new HTML document
   */
  reset() {
    var _a2, _b, _c, _d;
    (_b = (_a2 = this.cbs).onreset) === null || _b === void 0 ? void 0 : _b.call(_a2);
    this.tokenizer.reset();
    this.tagname = "";
    this.attribname = "";
    this.attribs = null;
    this.stack.length = 0;
    this.startIndex = 0;
    this.endIndex = 0;
    (_d = (_c = this.cbs).onparserinit) === null || _d === void 0 ? void 0 : _d.call(_c, this);
    this.buffers.length = 0;
    this.bufferOffset = 0;
    this.writeIndex = 0;
    this.ended = false;
  }
  /**
   * Resets the parser, then parses a complete document and
   * pushes it to the handler.
   *
   * @param data Document to parse.
   */
  parseComplete(data) {
    this.reset();
    this.end(data);
  }
  getSlice(start, end) {
    while (start - this.bufferOffset >= this.buffers[0].length) {
      this.shiftBuffer();
    }
    let slice = this.buffers[0].slice(start - this.bufferOffset, end - this.bufferOffset);
    while (end - this.bufferOffset > this.buffers[0].length) {
      this.shiftBuffer();
      slice += this.buffers[0].slice(0, end - this.bufferOffset);
    }
    return slice;
  }
  shiftBuffer() {
    this.bufferOffset += this.buffers[0].length;
    this.writeIndex--;
    this.buffers.shift();
  }
  /**
   * Parses a chunk of data and calls the corresponding callbacks.
   *
   * @param chunk Chunk to parse.
   */
  write(chunk) {
    var _a2, _b;
    if (this.ended) {
      (_b = (_a2 = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a2, new Error(".write() after done!"));
      return;
    }
    this.buffers.push(chunk);
    if (this.tokenizer.running) {
      this.tokenizer.write(chunk);
      this.writeIndex++;
    }
  }
  /**
   * Parses the end of the buffer and clears the stack, calls onend.
   *
   * @param chunk Optional final chunk to parse.
   */
  end(chunk) {
    var _a2, _b;
    if (this.ended) {
      (_b = (_a2 = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a2, new Error(".end() after done!"));
      return;
    }
    if (chunk)
      this.write(chunk);
    this.ended = true;
    this.tokenizer.end();
  }
  /**
   * Pauses parsing. The parser won't emit events until `resume` is called.
   */
  pause() {
    this.tokenizer.pause();
  }
  /**
   * Resumes parsing after `pause` was called.
   */
  resume() {
    this.tokenizer.resume();
    while (this.tokenizer.running && this.writeIndex < this.buffers.length) {
      this.tokenizer.write(this.buffers[this.writeIndex++]);
    }
    if (this.ended)
      this.tokenizer.end();
  }
  /**
   * Alias of `write`, for backwards compatibility.
   *
   * @param chunk Chunk to parse.
   * @deprecated
   */
  parseChunk(chunk) {
    this.write(chunk);
  }
  /**
   * Alias of `end`, for backwards compatibility.
   *
   * @param chunk Optional final chunk to parse.
   * @deprecated
   */
  done(chunk) {
    this.end(chunk);
  }
}
const xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
const xmlCodeMap = /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [39, "&apos;"],
  [60, "&lt;"],
  [62, "&gt;"]
]);
const getCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.prototype.codePointAt != null ? (str, index2) => str.codePointAt(index2) : (
    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    (c2, index2) => (c2.charCodeAt(index2) & 64512) === 55296 ? (c2.charCodeAt(index2) - 55296) * 1024 + c2.charCodeAt(index2 + 1) - 56320 + 65536 : c2.charCodeAt(index2)
  )
);
function encodeXML(str) {
  let ret = "";
  let lastIdx = 0;
  let match;
  while ((match = xmlReplacer.exec(str)) !== null) {
    const i = match.index;
    const char = str.charCodeAt(i);
    const next = xmlCodeMap.get(char);
    if (next !== void 0) {
      ret += str.substring(lastIdx, i) + next;
      lastIdx = i + 1;
    } else {
      ret += `${str.substring(lastIdx, i)}&#x${getCodePoint(str, i).toString(16)};`;
      lastIdx = xmlReplacer.lastIndex += Number((char & 64512) === 55296);
    }
  }
  return ret + str.substr(lastIdx);
}
function getEscaper(regex, map2) {
  return function escape2(data) {
    let match;
    let lastIdx = 0;
    let result = "";
    while (match = regex.exec(data)) {
      if (lastIdx !== match.index) {
        result += data.substring(lastIdx, match.index);
      }
      result += map2.get(match[0].charCodeAt(0));
      lastIdx = match.index + 1;
    }
    return result + data.substring(lastIdx);
  };
}
const escapeAttribute = getEscaper(/["&\u00A0]/g, /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [160, "&nbsp;"]
]));
const escapeText = getEscaper(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
  [38, "&amp;"],
  [60, "&lt;"],
  [62, "&gt;"],
  [160, "&nbsp;"]
]));
const elementNames = new Map([
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "clipPath",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "foreignObject",
  "glyphRef",
  "linearGradient",
  "radialGradient",
  "textPath"
].map((val) => [val.toLowerCase(), val]));
const attributeNames = new Map([
  "definitionURL",
  "attributeName",
  "attributeType",
  "baseFrequency",
  "baseProfile",
  "calcMode",
  "clipPathUnits",
  "diffuseConstant",
  "edgeMode",
  "filterUnits",
  "glyphRef",
  "gradientTransform",
  "gradientUnits",
  "kernelMatrix",
  "kernelUnitLength",
  "keyPoints",
  "keySplines",
  "keyTimes",
  "lengthAdjust",
  "limitingConeAngle",
  "markerHeight",
  "markerUnits",
  "markerWidth",
  "maskContentUnits",
  "maskUnits",
  "numOctaves",
  "pathLength",
  "patternContentUnits",
  "patternTransform",
  "patternUnits",
  "pointsAtX",
  "pointsAtY",
  "pointsAtZ",
  "preserveAlpha",
  "preserveAspectRatio",
  "primitiveUnits",
  "refX",
  "refY",
  "repeatCount",
  "repeatDur",
  "requiredExtensions",
  "requiredFeatures",
  "specularConstant",
  "specularExponent",
  "spreadMethod",
  "startOffset",
  "stdDeviation",
  "stitchTiles",
  "surfaceScale",
  "systemLanguage",
  "tableValues",
  "targetX",
  "targetY",
  "textLength",
  "viewBox",
  "viewTarget",
  "xChannelSelector",
  "yChannelSelector",
  "zoomAndPan"
].map((val) => [val.toLowerCase(), val]));
const unencodedElements = /* @__PURE__ */ new Set([
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript"
]);
function replaceQuotes(value) {
  return value.replace(/"/g, "&quot;");
}
function formatAttributes(attributes, opts) {
  var _a2;
  if (!attributes)
    return;
  const encode = ((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) === false ? replaceQuotes : opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML : escapeAttribute;
  return Object.keys(attributes).map((key) => {
    var _a3, _b;
    const value = (_a3 = attributes[key]) !== null && _a3 !== void 0 ? _a3 : "";
    if (opts.xmlMode === "foreign") {
      key = (_b = attributeNames.get(key)) !== null && _b !== void 0 ? _b : key;
    }
    if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
      return key;
    }
    return `${key}="${encode(value)}"`;
  }).join(" ");
}
const singleTag = /* @__PURE__ */ new Set([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function render$1(node, options = {}) {
  const nodes = "length" in node ? node : [node];
  let output = "";
  for (let i = 0; i < nodes.length; i++) {
    output += renderNode(nodes[i], options);
  }
  return output;
}
function renderNode(node, options) {
  switch (node.type) {
    case Root:
      return render$1(node.children, options);
    // @ts-expect-error We don't use `Doctype` yet
    case Doctype:
    case Directive:
      return renderDirective(node);
    case Comment$1:
      return renderComment(node);
    case CDATA$1:
      return renderCdata(node);
    case Script:
    case Style:
    case Tag:
      return renderTag(node, options);
    case Text$1:
      return renderText(node, options);
  }
}
const foreignModeIntegrationPoints = /* @__PURE__ */ new Set([
  "mi",
  "mo",
  "mn",
  "ms",
  "mtext",
  "annotation-xml",
  "foreignObject",
  "desc",
  "title"
]);
const foreignElements = /* @__PURE__ */ new Set(["svg", "math"]);
function renderTag(elem, opts) {
  var _a2;
  if (opts.xmlMode === "foreign") {
    elem.name = (_a2 = elementNames.get(elem.name)) !== null && _a2 !== void 0 ? _a2 : elem.name;
    if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
      opts = { ...opts, xmlMode: false };
    }
  }
  if (!opts.xmlMode && foreignElements.has(elem.name)) {
    opts = { ...opts, xmlMode: "foreign" };
  }
  let tag = `<${elem.name}`;
  const attribs = formatAttributes(elem.attribs, opts);
  if (attribs) {
    tag += ` ${attribs}`;
  }
  if (elem.children.length === 0 && (opts.xmlMode ? (
    // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
    opts.selfClosingTags !== false
  ) : (
    // User explicitly asked for self-closing tags, even in HTML mode
    opts.selfClosingTags && singleTag.has(elem.name)
  ))) {
    if (!opts.xmlMode)
      tag += " ";
    tag += "/>";
  } else {
    tag += ">";
    if (elem.children.length > 0) {
      tag += render$1(elem.children, opts);
    }
    if (opts.xmlMode || !singleTag.has(elem.name)) {
      tag += `</${elem.name}>`;
    }
  }
  return tag;
}
function renderDirective(elem) {
  return `<${elem.data}>`;
}
function renderText(elem, opts) {
  var _a2;
  let data = elem.data || "";
  if (((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) {
    data = opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML(data) : escapeText(data);
  }
  return data;
}
function renderCdata(elem) {
  return `<![CDATA[${elem.children[0].data}]]>`;
}
function renderComment(elem) {
  return `<!--${elem.data}-->`;
}
function parseDocument(data, options) {
  const handler = new DomHandler(void 0, options);
  new Parser(handler, options).end(data);
  return handler.root;
}
var cjs;
var hasRequiredCjs;
function requireCjs() {
  if (hasRequiredCjs) return cjs;
  hasRequiredCjs = 1;
  var isMergeableObject = function isMergeableObject2(value) {
    return isNonNullObject(value) && !isSpecial(value);
  };
  function isNonNullObject(value) {
    return !!value && typeof value === "object";
  }
  function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
  }
  var canUseSymbol = typeof Symbol === "function" && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
  function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
  }
  function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
  }
  function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
  }
  function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function(element) {
      return cloneUnlessOtherwiseSpecified(element, options);
    });
  }
  function getMergeFunction(key, options) {
    if (!options.customMerge) {
      return deepmerge;
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === "function" ? customMerge : deepmerge;
  }
  function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
      return Object.propertyIsEnumerable.call(target, symbol);
    }) : [];
  }
  function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
  }
  function propertyIsOnObject(object, property) {
    try {
      return property in object;
    } catch (_2) {
      return false;
    }
  }
  function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
  }
  function mergeObject(target, source, options) {
    var destination = {};
    if (options.isMergeableObject(target)) {
      getKeys(target).forEach(function(key) {
        destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
      });
    }
    getKeys(source).forEach(function(key) {
      if (propertyIsUnsafe(target, key)) {
        return;
      }
      if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
        destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
      } else {
        destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
      }
    });
    return destination;
  }
  function deepmerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
      return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
      return options.arrayMerge(target, source, options);
    } else {
      return mergeObject(target, source, options);
    }
  }
  deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
      throw new Error("first argument should be an array");
    }
    return array.reduce(function(prev, next) {
      return deepmerge(prev, next, options);
    }, {});
  };
  var deepmerge_1 = deepmerge;
  cjs = deepmerge_1;
  return cjs;
}
var cjsExports = requireCjs();
const merge = /* @__PURE__ */ getDefaultExportFromCjs(cjsExports);
function limitedDepthRecursive(n2, f, g2 = () => void 0) {
  if (n2 === void 0) {
    const f1 = function(...args) {
      return f(f1, ...args);
    };
    return f1;
  }
  if (n2 >= 0) {
    return function(...args) {
      return f(limitedDepthRecursive(n2 - 1, f, g2), ...args);
    };
  }
  return g2;
}
function trimCharacter(str, char) {
  let start = 0;
  let end = str.length;
  while (start < end && str[start] === char) {
    ++start;
  }
  while (end > start && str[end - 1] === char) {
    --end;
  }
  return start > 0 || end < str.length ? str.substring(start, end) : str;
}
function trimCharacterEnd(str, char) {
  let end = str.length;
  while (end > 0 && str[end - 1] === char) {
    --end;
  }
  return end < str.length ? str.substring(0, end) : str;
}
function unicodeEscape(str) {
  return str.replace(/[\s\S]/g, (c2) => "\\u" + c2.charCodeAt().toString(16).padStart(4, "0"));
}
function mergeDuplicatesPreferLast(items, getKey) {
  const map2 = /* @__PURE__ */ new Map();
  for (let i = items.length; i-- > 0; ) {
    const item = items[i];
    const key = getKey(item);
    map2.set(
      key,
      map2.has(key) ? merge(item, map2.get(key), { arrayMerge: overwriteMerge$1 }) : item
    );
  }
  return [...map2.values()].reverse();
}
const overwriteMerge$1 = (acc, src, options) => [...src];
function get(obj, path) {
  for (const key of path) {
    if (!obj) {
      return void 0;
    }
    obj = obj[key];
  }
  return obj;
}
function numberToLetterSequence(num, baseChar = "a", base = 26) {
  const digits = [];
  do {
    num -= 1;
    digits.push(num % base);
    num = num / base >> 0;
  } while (num > 0);
  const baseCode = baseChar.charCodeAt(0);
  return digits.reverse().map((n2) => String.fromCharCode(baseCode + n2)).join("");
}
const I = ["I", "X", "C", "M"];
const V = ["V", "L", "D"];
function numberToRoman(num) {
  return [...num + ""].map((n2) => +n2).reverse().map((v2, i) => v2 % 5 < 4 ? (v2 < 5 ? "" : V[i]) + I[i].repeat(v2 % 5) : I[i] + (v2 < 5 ? V[i] : I[i + 1])).reverse().join("");
}
class InlineTextBuilder {
  /**
   * Creates an instance of InlineTextBuilder.
   *
   * If `maxLineLength` is not provided then it is either `options.wordwrap` or unlimited.
   *
   * @param { Options } options           HtmlToText options.
   * @param { number }  [ maxLineLength ] This builder will try to wrap text to fit this line length.
   */
  constructor(options, maxLineLength = void 0) {
    this.lines = [];
    this.nextLineWords = [];
    this.maxLineLength = maxLineLength || options.wordwrap || Number.MAX_VALUE;
    this.nextLineAvailableChars = this.maxLineLength;
    this.wrapCharacters = get(options, ["longWordSplit", "wrapCharacters"]) || [];
    this.forceWrapOnLimit = get(options, ["longWordSplit", "forceWrapOnLimit"]) || false;
    this.stashedSpace = false;
    this.wordBreakOpportunity = false;
  }
  /**
   * Add a new word.
   *
   * @param { string } word A word to add.
   * @param { boolean } [noWrap] Don't wrap text even if the line is too long.
   */
  pushWord(word, noWrap = false) {
    if (this.nextLineAvailableChars <= 0 && !noWrap) {
      this.startNewLine();
    }
    const isLineStart = this.nextLineWords.length === 0;
    const cost = word.length + (isLineStart ? 0 : 1);
    if (cost <= this.nextLineAvailableChars || noWrap) {
      this.nextLineWords.push(word);
      this.nextLineAvailableChars -= cost;
    } else {
      const [first, ...rest] = this.splitLongWord(word);
      if (!isLineStart) {
        this.startNewLine();
      }
      this.nextLineWords.push(first);
      this.nextLineAvailableChars -= first.length;
      for (const part of rest) {
        this.startNewLine();
        this.nextLineWords.push(part);
        this.nextLineAvailableChars -= part.length;
      }
    }
  }
  /**
   * Pop a word from the currently built line.
   * This doesn't affect completed lines.
   *
   * @returns { string }
   */
  popWord() {
    const lastWord = this.nextLineWords.pop();
    if (lastWord !== void 0) {
      const isLineStart = this.nextLineWords.length === 0;
      const cost = lastWord.length + (isLineStart ? 0 : 1);
      this.nextLineAvailableChars += cost;
    }
    return lastWord;
  }
  /**
   * Concat a word to the last word already in the builder.
   * Adds a new word in case there are no words yet in the last line.
   *
   * @param { string } word A word to be concatenated.
   * @param { boolean } [noWrap] Don't wrap text even if the line is too long.
   */
  concatWord(word, noWrap = false) {
    if (this.wordBreakOpportunity && word.length > this.nextLineAvailableChars) {
      this.pushWord(word, noWrap);
      this.wordBreakOpportunity = false;
    } else {
      const lastWord = this.popWord();
      this.pushWord(lastWord ? lastWord.concat(word) : word, noWrap);
    }
  }
  /**
   * Add current line (and more empty lines if provided argument > 1) to the list of complete lines and start a new one.
   *
   * @param { number } n Number of line breaks that will be added to the resulting string.
   */
  startNewLine(n2 = 1) {
    this.lines.push(this.nextLineWords);
    if (n2 > 1) {
      this.lines.push(...Array.from({ length: n2 - 1 }, () => []));
    }
    this.nextLineWords = [];
    this.nextLineAvailableChars = this.maxLineLength;
  }
  /**
   * No words in this builder.
   *
   * @returns { boolean }
   */
  isEmpty() {
    return this.lines.length === 0 && this.nextLineWords.length === 0;
  }
  clear() {
    this.lines.length = 0;
    this.nextLineWords.length = 0;
    this.nextLineAvailableChars = this.maxLineLength;
  }
  /**
   * Join all lines of words inside the InlineTextBuilder into a complete string.
   *
   * @returns { string }
   */
  toString() {
    return [...this.lines, this.nextLineWords].map((words) => words.join(" ")).join("\n");
  }
  /**
   * Split a long word up to fit within the word wrap limit.
   * Use either a character to split looking back from the word wrap limit,
   * or truncate to the word wrap limit.
   *
   * @param   { string }   word Input word.
   * @returns { string[] }      Parts of the word.
   */
  splitLongWord(word) {
    const parts = [];
    let idx = 0;
    while (word.length > this.maxLineLength) {
      const firstLine = word.substring(0, this.maxLineLength);
      const remainingChars = word.substring(this.maxLineLength);
      const splitIndex = firstLine.lastIndexOf(this.wrapCharacters[idx]);
      if (splitIndex > -1) {
        word = firstLine.substring(splitIndex + 1) + remainingChars;
        parts.push(firstLine.substring(0, splitIndex + 1));
      } else {
        idx++;
        if (idx < this.wrapCharacters.length) {
          word = firstLine + remainingChars;
        } else {
          if (this.forceWrapOnLimit) {
            parts.push(firstLine);
            word = remainingChars;
            if (word.length > this.maxLineLength) {
              continue;
            }
          } else {
            word = firstLine + remainingChars;
          }
          break;
        }
      }
    }
    parts.push(word);
    return parts;
  }
}
class StackItem {
  constructor(next = null) {
    this.next = next;
  }
  getRoot() {
    return this.next ? this.next : this;
  }
}
class BlockStackItem extends StackItem {
  constructor(options, next = null, leadingLineBreaks = 1, maxLineLength = void 0) {
    super(next);
    this.leadingLineBreaks = leadingLineBreaks;
    this.inlineTextBuilder = new InlineTextBuilder(options, maxLineLength);
    this.rawText = "";
    this.stashedLineBreaks = 0;
    this.isPre = next && next.isPre;
    this.isNoWrap = next && next.isNoWrap;
  }
}
class ListStackItem extends BlockStackItem {
  constructor(options, next = null, {
    interRowLineBreaks = 1,
    leadingLineBreaks = 2,
    maxLineLength = void 0,
    maxPrefixLength = 0,
    prefixAlign = "left"
  } = {}) {
    super(options, next, leadingLineBreaks, maxLineLength);
    this.maxPrefixLength = maxPrefixLength;
    this.prefixAlign = prefixAlign;
    this.interRowLineBreaks = interRowLineBreaks;
  }
}
class ListItemStackItem extends BlockStackItem {
  constructor(options, next = null, {
    leadingLineBreaks = 1,
    maxLineLength = void 0,
    prefix = ""
  } = {}) {
    super(options, next, leadingLineBreaks, maxLineLength);
    this.prefix = prefix;
  }
}
class TableStackItem extends StackItem {
  constructor(next = null) {
    super(next);
    this.rows = [];
    this.isPre = next && next.isPre;
    this.isNoWrap = next && next.isNoWrap;
  }
}
class TableRowStackItem extends StackItem {
  constructor(next = null) {
    super(next);
    this.cells = [];
    this.isPre = next && next.isPre;
    this.isNoWrap = next && next.isNoWrap;
  }
}
class TableCellStackItem extends StackItem {
  constructor(options, next = null, maxColumnWidth = void 0) {
    super(next);
    this.inlineTextBuilder = new InlineTextBuilder(options, maxColumnWidth);
    this.rawText = "";
    this.stashedLineBreaks = 0;
    this.isPre = next && next.isPre;
    this.isNoWrap = next && next.isNoWrap;
  }
}
class TransformerStackItem extends StackItem {
  constructor(next = null, transform) {
    super(next);
    this.transform = transform;
  }
}
function charactersToCodes(str) {
  return [...str].map((c2) => "\\u" + c2.charCodeAt(0).toString(16).padStart(4, "0")).join("");
}
class WhitespaceProcessor {
  /**
   * Creates an instance of WhitespaceProcessor.
   *
   * @param { Options } options    HtmlToText options.
   * @memberof WhitespaceProcessor
   */
  constructor(options) {
    this.whitespaceChars = options.preserveNewlines ? options.whitespaceCharacters.replace(/\n/g, "") : options.whitespaceCharacters;
    const whitespaceCodes = charactersToCodes(this.whitespaceChars);
    this.leadingWhitespaceRe = new RegExp(`^[${whitespaceCodes}]`);
    this.trailingWhitespaceRe = new RegExp(`[${whitespaceCodes}]$`);
    this.allWhitespaceOrEmptyRe = new RegExp(`^[${whitespaceCodes}]*$`);
    this.newlineOrNonWhitespaceRe = new RegExp(`(\\n|[^\\n${whitespaceCodes}])`, "g");
    this.newlineOrNonNewlineStringRe = new RegExp(`(\\n|[^\\n]+)`, "g");
    if (options.preserveNewlines) {
      const wordOrNewlineRe = new RegExp(`\\n|[^\\n${whitespaceCodes}]+`, "gm");
      this.shrinkWrapAdd = function(text, inlineTextBuilder, transform = (str) => str, noWrap = false) {
        if (!text) {
          return;
        }
        const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
        let anyMatch = false;
        let m = wordOrNewlineRe.exec(text);
        if (m) {
          anyMatch = true;
          if (m[0] === "\n") {
            inlineTextBuilder.startNewLine();
          } else if (previouslyStashedSpace || this.testLeadingWhitespace(text)) {
            inlineTextBuilder.pushWord(transform(m[0]), noWrap);
          } else {
            inlineTextBuilder.concatWord(transform(m[0]), noWrap);
          }
          while ((m = wordOrNewlineRe.exec(text)) !== null) {
            if (m[0] === "\n") {
              inlineTextBuilder.startNewLine();
            } else {
              inlineTextBuilder.pushWord(transform(m[0]), noWrap);
            }
          }
        }
        inlineTextBuilder.stashedSpace = previouslyStashedSpace && !anyMatch || this.testTrailingWhitespace(text);
      };
    } else {
      const wordRe = new RegExp(`[^${whitespaceCodes}]+`, "g");
      this.shrinkWrapAdd = function(text, inlineTextBuilder, transform = (str) => str, noWrap = false) {
        if (!text) {
          return;
        }
        const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
        let anyMatch = false;
        let m = wordRe.exec(text);
        if (m) {
          anyMatch = true;
          if (previouslyStashedSpace || this.testLeadingWhitespace(text)) {
            inlineTextBuilder.pushWord(transform(m[0]), noWrap);
          } else {
            inlineTextBuilder.concatWord(transform(m[0]), noWrap);
          }
          while ((m = wordRe.exec(text)) !== null) {
            inlineTextBuilder.pushWord(transform(m[0]), noWrap);
          }
        }
        inlineTextBuilder.stashedSpace = previouslyStashedSpace && !anyMatch || this.testTrailingWhitespace(text);
      };
    }
  }
  /**
   * Add text with only minimal processing.
   * Everything between newlines considered a single word.
   * No whitespace is trimmed.
   * Not affected by preserveNewlines option - `\n` always starts a new line.
   *
   * `noWrap` argument is `true` by default - this won't start a new line
   * even if there is not enough space left in the current line.
   *
   * @param { string }            text              Input text.
   * @param { InlineTextBuilder } inlineTextBuilder A builder to receive processed text.
   * @param { boolean }           [noWrap] Don't wrap text even if the line is too long.
   */
  addLiteral(text, inlineTextBuilder, noWrap = true) {
    if (!text) {
      return;
    }
    const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
    let anyMatch = false;
    let m = this.newlineOrNonNewlineStringRe.exec(text);
    if (m) {
      anyMatch = true;
      if (m[0] === "\n") {
        inlineTextBuilder.startNewLine();
      } else if (previouslyStashedSpace) {
        inlineTextBuilder.pushWord(m[0], noWrap);
      } else {
        inlineTextBuilder.concatWord(m[0], noWrap);
      }
      while ((m = this.newlineOrNonNewlineStringRe.exec(text)) !== null) {
        if (m[0] === "\n") {
          inlineTextBuilder.startNewLine();
        } else {
          inlineTextBuilder.pushWord(m[0], noWrap);
        }
      }
    }
    inlineTextBuilder.stashedSpace = previouslyStashedSpace && !anyMatch;
  }
  /**
   * Test whether the given text starts with HTML whitespace character.
   *
   * @param   { string }  text  The string to test.
   * @returns { boolean }
   */
  testLeadingWhitespace(text) {
    return this.leadingWhitespaceRe.test(text);
  }
  /**
   * Test whether the given text ends with HTML whitespace character.
   *
   * @param   { string }  text  The string to test.
   * @returns { boolean }
   */
  testTrailingWhitespace(text) {
    return this.trailingWhitespaceRe.test(text);
  }
  /**
   * Test whether the given text contains any non-whitespace characters.
   *
   * @param   { string }  text  The string to test.
   * @returns { boolean }
   */
  testContainsWords(text) {
    return !this.allWhitespaceOrEmptyRe.test(text);
  }
  /**
   * Return the number of newlines if there are no words.
   *
   * If any word is found then return zero regardless of the actual number of newlines.
   *
   * @param   { string }  text  Input string.
   * @returns { number }
   */
  countNewlinesNoWords(text) {
    this.newlineOrNonWhitespaceRe.lastIndex = 0;
    let counter = 0;
    let match;
    while ((match = this.newlineOrNonWhitespaceRe.exec(text)) !== null) {
      if (match[0] === "\n") {
        counter++;
      } else {
        return 0;
      }
    }
    return counter;
  }
}
class BlockTextBuilder {
  /**
   * Creates an instance of BlockTextBuilder.
   *
   * @param { Options } options HtmlToText options.
   * @param { import('selderee').Picker<DomNode, TagDefinition> } picker Selectors decision tree picker.
   * @param { any} [metadata] Optional metadata for HTML document, for use in formatters.
   */
  constructor(options, picker, metadata = void 0) {
    this.options = options;
    this.picker = picker;
    this.metadata = metadata;
    this.whitespaceProcessor = new WhitespaceProcessor(options);
    this._stackItem = new BlockStackItem(options);
    this._wordTransformer = void 0;
  }
  /**
   * Put a word-by-word transform function onto the transformations stack.
   *
   * Mainly used for uppercasing. Can be bypassed to add unformatted text such as URLs.
   *
   * Word transformations applied before wrapping.
   *
   * @param { (str: string) => string } wordTransform Word transformation function.
   */
  pushWordTransform(wordTransform) {
    this._wordTransformer = new TransformerStackItem(this._wordTransformer, wordTransform);
  }
  /**
   * Remove a function from the word transformations stack.
   *
   * @returns { (str: string) => string } A function that was removed.
   */
  popWordTransform() {
    if (!this._wordTransformer) {
      return void 0;
    }
    const transform = this._wordTransformer.transform;
    this._wordTransformer = this._wordTransformer.next;
    return transform;
  }
  /**
   * Ignore wordwrap option in followup inline additions and disable automatic wrapping.
   */
  startNoWrap() {
    this._stackItem.isNoWrap = true;
  }
  /**
   * Return automatic wrapping to behavior defined by options.
   */
  stopNoWrap() {
    this._stackItem.isNoWrap = false;
  }
  /** @returns { (str: string) => string } */
  _getCombinedWordTransformer() {
    const wt2 = this._wordTransformer ? (str) => applyTransformer(str, this._wordTransformer) : void 0;
    const ce2 = this.options.encodeCharacters;
    return wt2 ? ce2 ? (str) => ce2(wt2(str)) : wt2 : ce2;
  }
  _popStackItem() {
    const item = this._stackItem;
    this._stackItem = item.next;
    return item;
  }
  /**
   * Add a line break into currently built block.
   */
  addLineBreak() {
    if (!(this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem)) {
      return;
    }
    if (this._stackItem.isPre) {
      this._stackItem.rawText += "\n";
    } else {
      this._stackItem.inlineTextBuilder.startNewLine();
    }
  }
  /**
   * Allow to break line in case directly following text will not fit.
   */
  addWordBreakOpportunity() {
    if (this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem) {
      this._stackItem.inlineTextBuilder.wordBreakOpportunity = true;
    }
  }
  /**
   * Add a node inline into the currently built block.
   *
   * @param { string } str
   * Text content of a node to add.
   *
   * @param { object } [param1]
   * Object holding the parameters of the operation.
   *
   * @param { boolean } [param1.noWordTransform]
   * Ignore word transformers if there are any.
   * Don't encode characters as well.
   * (Use this for things like URL addresses).
   */
  addInline(str, { noWordTransform = false } = {}) {
    if (!(this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem)) {
      return;
    }
    if (this._stackItem.isPre) {
      this._stackItem.rawText += str;
      return;
    }
    if (str.length === 0 || // empty string
    this._stackItem.stashedLineBreaks && // stashed linebreaks make whitespace irrelevant
    !this.whitespaceProcessor.testContainsWords(str)) {
      return;
    }
    if (this.options.preserveNewlines) {
      const newlinesNumber = this.whitespaceProcessor.countNewlinesNoWords(str);
      if (newlinesNumber > 0) {
        this._stackItem.inlineTextBuilder.startNewLine(newlinesNumber);
        return;
      }
    }
    if (this._stackItem.stashedLineBreaks) {
      this._stackItem.inlineTextBuilder.startNewLine(this._stackItem.stashedLineBreaks);
    }
    this.whitespaceProcessor.shrinkWrapAdd(
      str,
      this._stackItem.inlineTextBuilder,
      noWordTransform ? void 0 : this._getCombinedWordTransformer(),
      this._stackItem.isNoWrap
    );
    this._stackItem.stashedLineBreaks = 0;
  }
  /**
   * Add a string inline into the currently built block.
   *
   * Use this for markup elements that don't have to adhere
   * to text layout rules.
   *
   * @param { string } str Text to add.
   */
  addLiteral(str) {
    if (!(this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem)) {
      return;
    }
    if (str.length === 0) {
      return;
    }
    if (this._stackItem.isPre) {
      this._stackItem.rawText += str;
      return;
    }
    if (this._stackItem.stashedLineBreaks) {
      this._stackItem.inlineTextBuilder.startNewLine(this._stackItem.stashedLineBreaks);
    }
    this.whitespaceProcessor.addLiteral(
      str,
      this._stackItem.inlineTextBuilder,
      this._stackItem.isNoWrap
    );
    this._stackItem.stashedLineBreaks = 0;
  }
  /**
   * Start building a new block.
   *
   * @param { object } [param0]
   * Object holding the parameters of the block.
   *
   * @param { number } [param0.leadingLineBreaks]
   * This block should have at least this number of line breaks to separate it from any preceding block.
   *
   * @param { number }  [param0.reservedLineLength]
   * Reserve this number of characters on each line for block markup.
   *
   * @param { boolean } [param0.isPre]
   * Should HTML whitespace be preserved inside this block.
   */
  openBlock({ leadingLineBreaks = 1, reservedLineLength = 0, isPre = false } = {}) {
    const maxLineLength = Math.max(20, this._stackItem.inlineTextBuilder.maxLineLength - reservedLineLength);
    this._stackItem = new BlockStackItem(
      this.options,
      this._stackItem,
      leadingLineBreaks,
      maxLineLength
    );
    if (isPre) {
      this._stackItem.isPre = true;
    }
  }
  /**
   * Finalize currently built block, add it's content to the parent block.
   *
   * @param { object } [param0]
   * Object holding the parameters of the block.
   *
   * @param { number } [param0.trailingLineBreaks]
   * This block should have at least this number of line breaks to separate it from any following block.
   *
   * @param { (str: string) => string } [param0.blockTransform]
   * A function to transform the block text before adding to the parent block.
   * This happens after word wrap and should be used in combination with reserved line length
   * in order to keep line lengths correct.
   * Used for whole block markup.
   */
  closeBlock({ trailingLineBreaks = 1, blockTransform = void 0 } = {}) {
    const block = this._popStackItem();
    const blockText = blockTransform ? blockTransform(getText(block)) : getText(block);
    addText(this._stackItem, blockText, block.leadingLineBreaks, Math.max(block.stashedLineBreaks, trailingLineBreaks));
  }
  /**
   * Start building a new list.
   *
   * @param { object } [param0]
   * Object holding the parameters of the list.
   *
   * @param { number } [param0.maxPrefixLength]
   * Length of the longest list item prefix.
   * If not supplied or too small then list items won't be aligned properly.
   *
   * @param { 'left' | 'right' } [param0.prefixAlign]
   * Specify how prefixes of different lengths have to be aligned
   * within a column.
   *
   * @param { number } [param0.interRowLineBreaks]
   * Minimum number of line breaks between list items.
   *
   * @param { number } [param0.leadingLineBreaks]
   * This list should have at least this number of line breaks to separate it from any preceding block.
   */
  openList({ maxPrefixLength = 0, prefixAlign = "left", interRowLineBreaks = 1, leadingLineBreaks = 2 } = {}) {
    this._stackItem = new ListStackItem(this.options, this._stackItem, {
      interRowLineBreaks,
      leadingLineBreaks,
      maxLineLength: this._stackItem.inlineTextBuilder.maxLineLength,
      maxPrefixLength,
      prefixAlign
    });
  }
  /**
   * Start building a new list item.
   *
   * @param {object} param0
   * Object holding the parameters of the list item.
   *
   * @param { string } [param0.prefix]
   * Prefix for this list item (item number, bullet point, etc).
   */
  openListItem({ prefix = "" } = {}) {
    if (!(this._stackItem instanceof ListStackItem)) {
      throw new Error("Can't add a list item to something that is not a list! Check the formatter.");
    }
    const list = this._stackItem;
    const prefixLength = Math.max(prefix.length, list.maxPrefixLength);
    const maxLineLength = Math.max(20, list.inlineTextBuilder.maxLineLength - prefixLength);
    this._stackItem = new ListItemStackItem(this.options, list, {
      prefix,
      maxLineLength,
      leadingLineBreaks: list.interRowLineBreaks
    });
  }
  /**
   * Finalize currently built list item, add it's content to the parent list.
   */
  closeListItem() {
    const listItem = this._popStackItem();
    const list = listItem.next;
    const prefixLength = Math.max(listItem.prefix.length, list.maxPrefixLength);
    const spacing = "\n" + " ".repeat(prefixLength);
    const prefix = list.prefixAlign === "right" ? listItem.prefix.padStart(prefixLength) : listItem.prefix.padEnd(prefixLength);
    const text = prefix + getText(listItem).replace(/\n/g, spacing);
    addText(
      list,
      text,
      listItem.leadingLineBreaks,
      Math.max(listItem.stashedLineBreaks, list.interRowLineBreaks)
    );
  }
  /**
   * Finalize currently built list, add it's content to the parent block.
   *
   * @param { object } param0
   * Object holding the parameters of the list.
   *
   * @param { number } [param0.trailingLineBreaks]
   * This list should have at least this number of line breaks to separate it from any following block.
   */
  closeList({ trailingLineBreaks = 2 } = {}) {
    const list = this._popStackItem();
    const text = getText(list);
    if (text) {
      addText(this._stackItem, text, list.leadingLineBreaks, trailingLineBreaks);
    }
  }
  /**
   * Start building a table.
   */
  openTable() {
    this._stackItem = new TableStackItem(this._stackItem);
  }
  /**
   * Start building a table row.
   */
  openTableRow() {
    if (!(this._stackItem instanceof TableStackItem)) {
      throw new Error("Can't add a table row to something that is not a table! Check the formatter.");
    }
    this._stackItem = new TableRowStackItem(this._stackItem);
  }
  /**
   * Start building a table cell.
   *
   * @param { object } [param0]
   * Object holding the parameters of the cell.
   *
   * @param { number } [param0.maxColumnWidth]
   * Wrap cell content to this width. Fall back to global wordwrap value if undefined.
   */
  openTableCell({ maxColumnWidth = void 0 } = {}) {
    if (!(this._stackItem instanceof TableRowStackItem)) {
      throw new Error("Can't add a table cell to something that is not a table row! Check the formatter.");
    }
    this._stackItem = new TableCellStackItem(this.options, this._stackItem, maxColumnWidth);
  }
  /**
   * Finalize currently built table cell and add it to parent table row's cells.
   *
   * @param { object } [param0]
   * Object holding the parameters of the cell.
   *
   * @param { number } [param0.colspan] How many columns this cell should occupy.
   * @param { number } [param0.rowspan] How many rows this cell should occupy.
   */
  closeTableCell({ colspan = 1, rowspan = 1 } = {}) {
    const cell = this._popStackItem();
    const text = trimCharacter(getText(cell), "\n");
    cell.next.cells.push({ colspan, rowspan, text });
  }
  /**
   * Finalize currently built table row and add it to parent table's rows.
   */
  closeTableRow() {
    const row = this._popStackItem();
    row.next.rows.push(row.cells);
  }
  /**
   * Finalize currently built table and add the rendered text to the parent block.
   *
   * @param { object } param0
   * Object holding the parameters of the table.
   *
   * @param { TablePrinter } param0.tableToString
   * A function to convert a table of stringified cells into a complete table.
   *
   * @param { number } [param0.leadingLineBreaks]
   * This table should have at least this number of line breaks to separate if from any preceding block.
   *
   * @param { number } [param0.trailingLineBreaks]
   * This table should have at least this number of line breaks to separate it from any following block.
   */
  closeTable({ tableToString: tableToString2, leadingLineBreaks = 2, trailingLineBreaks = 2 }) {
    const table = this._popStackItem();
    const output = tableToString2(table.rows);
    if (output) {
      addText(this._stackItem, output, leadingLineBreaks, trailingLineBreaks);
    }
  }
  /**
   * Return the rendered text content of this builder.
   *
   * @returns { string }
   */
  toString() {
    return getText(this._stackItem.getRoot());
  }
}
function getText(stackItem) {
  if (!(stackItem instanceof BlockStackItem || stackItem instanceof ListItemStackItem || stackItem instanceof TableCellStackItem)) {
    throw new Error("Only blocks, list items and table cells can be requested for text contents.");
  }
  return stackItem.inlineTextBuilder.isEmpty() ? stackItem.rawText : stackItem.rawText + stackItem.inlineTextBuilder.toString();
}
function addText(stackItem, text, leadingLineBreaks, trailingLineBreaks) {
  if (!(stackItem instanceof BlockStackItem || stackItem instanceof ListItemStackItem || stackItem instanceof TableCellStackItem)) {
    throw new Error("Only blocks, list items and table cells can contain text.");
  }
  const parentText = getText(stackItem);
  const lineBreaks = Math.max(stackItem.stashedLineBreaks, leadingLineBreaks);
  stackItem.inlineTextBuilder.clear();
  if (parentText) {
    stackItem.rawText = parentText + "\n".repeat(lineBreaks) + text;
  } else {
    stackItem.rawText = text;
    stackItem.leadingLineBreaks = lineBreaks;
  }
  stackItem.stashedLineBreaks = trailingLineBreaks;
}
function applyTransformer(str, transformer) {
  return transformer ? applyTransformer(transformer.transform(str), transformer.next) : str;
}
function compile$1(options = {}) {
  const selectorsWithoutFormat = options.selectors.filter((s2) => !s2.format);
  if (selectorsWithoutFormat.length) {
    throw new Error(
      "Following selectors have no specified format: " + selectorsWithoutFormat.map((s2) => `\`${s2.selector}\``).join(", ")
    );
  }
  const picker = new DecisionTree(
    options.selectors.map((s2) => [s2.selector, s2])
  ).build(hp2Builder);
  if (typeof options.encodeCharacters !== "function") {
    options.encodeCharacters = makeReplacerFromDict(options.encodeCharacters);
  }
  const baseSelectorsPicker = new DecisionTree(
    options.baseElements.selectors.map((s2, i) => [s2, i + 1])
  ).build(hp2Builder);
  function findBaseElements(dom) {
    return findBases(dom, options, baseSelectorsPicker);
  }
  const limitedWalk = limitedDepthRecursive(
    options.limits.maxDepth,
    recursiveWalk,
    function(dom, builder) {
      builder.addInline(options.limits.ellipsis || "");
    }
  );
  return function(html2, metadata = void 0) {
    return process$1(html2, metadata, options, picker, findBaseElements, limitedWalk);
  };
}
function process$1(html2, metadata, options, picker, findBaseElements, walk) {
  const maxInputLength = options.limits.maxInputLength;
  if (maxInputLength && html2 && html2.length > maxInputLength) {
    console.warn(
      `Input length ${html2.length} is above allowed limit of ${maxInputLength}. Truncating without ellipsis.`
    );
    html2 = html2.substring(0, maxInputLength);
  }
  const document = parseDocument(html2, { decodeEntities: options.decodeEntities });
  const bases = findBaseElements(document.children);
  const builder = new BlockTextBuilder(options, picker, metadata);
  walk(bases, builder);
  return builder.toString();
}
function findBases(dom, options, baseSelectorsPicker) {
  const results = [];
  function recursiveWalk2(walk, dom2) {
    dom2 = dom2.slice(0, options.limits.maxChildNodes);
    for (const elem of dom2) {
      if (elem.type !== "tag") {
        continue;
      }
      const pickedSelectorIndex = baseSelectorsPicker.pick1(elem);
      if (pickedSelectorIndex > 0) {
        results.push({ selectorIndex: pickedSelectorIndex, element: elem });
      } else if (elem.children) {
        walk(elem.children);
      }
      if (results.length >= options.limits.maxBaseElements) {
        return;
      }
    }
  }
  const limitedWalk = limitedDepthRecursive(
    options.limits.maxDepth,
    recursiveWalk2
  );
  limitedWalk(dom);
  if (options.baseElements.orderBy !== "occurrence") {
    results.sort((a, b2) => a.selectorIndex - b2.selectorIndex);
  }
  return options.baseElements.returnDomByDefault && results.length === 0 ? dom : results.map((x) => x.element);
}
function recursiveWalk(walk, dom, builder) {
  if (!dom) {
    return;
  }
  const options = builder.options;
  const tooManyChildNodes = dom.length > options.limits.maxChildNodes;
  if (tooManyChildNodes) {
    dom = dom.slice(0, options.limits.maxChildNodes);
    dom.push({
      data: options.limits.ellipsis,
      type: "text"
    });
  }
  for (const elem of dom) {
    switch (elem.type) {
      case "text": {
        builder.addInline(elem.data);
        break;
      }
      case "tag": {
        const tagDefinition = builder.picker.pick1(elem);
        const format = options.formatters[tagDefinition.format];
        format(elem, walk, builder, tagDefinition.options || {});
        break;
      }
    }
  }
  return;
}
function makeReplacerFromDict(dict) {
  if (!dict || Object.keys(dict).length === 0) {
    return void 0;
  }
  const entries = Object.entries(dict).filter(([, v2]) => v2 !== false);
  const regex = new RegExp(
    entries.map(([c2]) => `(${unicodeEscape([...c2][0])})`).join("|"),
    "g"
  );
  const values = entries.map(([, v2]) => v2);
  const replacer = (m, ...cgs) => values[cgs.findIndex((cg) => cg)];
  return (str) => str.replace(regex, replacer);
}
function formatSkip(elem, walk, builder, formatOptions) {
}
function formatInlineString(elem, walk, builder, formatOptions) {
  builder.addLiteral(formatOptions.string || "");
}
function formatBlockString(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
  builder.addLiteral(formatOptions.string || "");
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function formatInline(elem, walk, builder, formatOptions) {
  walk(elem.children, builder);
}
function formatBlock$1(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
  walk(elem.children, builder);
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function renderOpenTag(elem) {
  const attrs = elem.attribs && elem.attribs.length ? " " + Object.entries(elem.attribs).map(([k2, v2]) => v2 === "" ? k2 : `${k2}=${v2.replace(/"/g, "&quot;")}`).join(" ") : "";
  return `<${elem.name}${attrs}>`;
}
function renderCloseTag(elem) {
  return `</${elem.name}>`;
}
function formatInlineTag(elem, walk, builder, formatOptions) {
  builder.startNoWrap();
  builder.addLiteral(renderOpenTag(elem));
  builder.stopNoWrap();
  walk(elem.children, builder);
  builder.startNoWrap();
  builder.addLiteral(renderCloseTag(elem));
  builder.stopNoWrap();
}
function formatBlockTag(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
  builder.startNoWrap();
  builder.addLiteral(renderOpenTag(elem));
  builder.stopNoWrap();
  walk(elem.children, builder);
  builder.startNoWrap();
  builder.addLiteral(renderCloseTag(elem));
  builder.stopNoWrap();
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function formatInlineHtml(elem, walk, builder, formatOptions) {
  builder.startNoWrap();
  builder.addLiteral(
    render$1(elem, { decodeEntities: builder.options.decodeEntities })
  );
  builder.stopNoWrap();
}
function formatBlockHtml(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
  builder.startNoWrap();
  builder.addLiteral(
    render$1(elem, { decodeEntities: builder.options.decodeEntities })
  );
  builder.stopNoWrap();
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function formatInlineSurround(elem, walk, builder, formatOptions) {
  builder.addLiteral(formatOptions.prefix || "");
  walk(elem.children, builder);
  builder.addLiteral(formatOptions.suffix || "");
}
var genericFormatters = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  block: formatBlock$1,
  blockHtml: formatBlockHtml,
  blockString: formatBlockString,
  blockTag: formatBlockTag,
  inline: formatInline,
  inlineHtml: formatInlineHtml,
  inlineString: formatInlineString,
  inlineSurround: formatInlineSurround,
  inlineTag: formatInlineTag,
  skip: formatSkip
});
function getRow(matrix, j2) {
  if (!matrix[j2]) {
    matrix[j2] = [];
  }
  return matrix[j2];
}
function findFirstVacantIndex(row, x = 0) {
  while (row[x]) {
    x++;
  }
  return x;
}
function transposeInPlace(matrix, maxSize) {
  for (let i = 0; i < maxSize; i++) {
    const rowI = getRow(matrix, i);
    for (let j2 = 0; j2 < i; j2++) {
      const rowJ = getRow(matrix, j2);
      if (rowI[j2] || rowJ[i]) {
        const temp = rowI[j2];
        rowI[j2] = rowJ[i];
        rowJ[i] = temp;
      }
    }
  }
}
function putCellIntoLayout(cell, layout, baseRow, baseCol) {
  for (let r2 = 0; r2 < cell.rowspan; r2++) {
    const layoutRow = getRow(layout, baseRow + r2);
    for (let c2 = 0; c2 < cell.colspan; c2++) {
      layoutRow[baseCol + c2] = cell;
    }
  }
}
function getOrInitOffset(offsets, index2) {
  if (offsets[index2] === void 0) {
    offsets[index2] = index2 === 0 ? 0 : 1 + getOrInitOffset(offsets, index2 - 1);
  }
  return offsets[index2];
}
function updateOffset(offsets, base, span, value) {
  offsets[base + span] = Math.max(
    getOrInitOffset(offsets, base + span),
    getOrInitOffset(offsets, base) + value
  );
}
function tableToString(tableRows, rowSpacing, colSpacing) {
  const layout = [];
  let colNumber = 0;
  const rowNumber = tableRows.length;
  const rowOffsets = [0];
  for (let j2 = 0; j2 < rowNumber; j2++) {
    const layoutRow = getRow(layout, j2);
    const cells = tableRows[j2];
    let x = 0;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      x = findFirstVacantIndex(layoutRow, x);
      putCellIntoLayout(cell, layout, j2, x);
      x += cell.colspan;
      cell.lines = cell.text.split("\n");
      const cellHeight = cell.lines.length;
      updateOffset(rowOffsets, j2, cell.rowspan, cellHeight + rowSpacing);
    }
    colNumber = layoutRow.length > colNumber ? layoutRow.length : colNumber;
  }
  transposeInPlace(layout, rowNumber > colNumber ? rowNumber : colNumber);
  const outputLines = [];
  const colOffsets = [0];
  for (let x = 0; x < colNumber; x++) {
    let y2 = 0;
    let cell;
    const rowsInThisColumn = Math.min(rowNumber, layout[x].length);
    while (y2 < rowsInThisColumn) {
      cell = layout[x][y2];
      if (cell) {
        if (!cell.rendered) {
          let cellWidth = 0;
          for (let j2 = 0; j2 < cell.lines.length; j2++) {
            const line = cell.lines[j2];
            const lineOffset = rowOffsets[y2] + j2;
            outputLines[lineOffset] = (outputLines[lineOffset] || "").padEnd(colOffsets[x]) + line;
            cellWidth = line.length > cellWidth ? line.length : cellWidth;
          }
          updateOffset(colOffsets, x, cell.colspan, cellWidth + colSpacing);
          cell.rendered = true;
        }
        y2 += cell.rowspan;
      } else {
        const lineOffset = rowOffsets[y2];
        outputLines[lineOffset] = outputLines[lineOffset] || "";
        y2++;
      }
    }
  }
  return outputLines.join("\n");
}
function formatLineBreak(elem, walk, builder, formatOptions) {
  builder.addLineBreak();
}
function formatWbr(elem, walk, builder, formatOptions) {
  builder.addWordBreakOpportunity();
}
function formatHorizontalLine(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
  builder.addInline("-".repeat(formatOptions.length || builder.options.wordwrap || 40));
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function formatParagraph(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
  walk(elem.children, builder);
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function formatPre(elem, walk, builder, formatOptions) {
  builder.openBlock({
    isPre: true,
    leadingLineBreaks: formatOptions.leadingLineBreaks || 2
  });
  walk(elem.children, builder);
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function formatHeading(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
  if (formatOptions.uppercase !== false) {
    builder.pushWordTransform((str) => str.toUpperCase());
    walk(elem.children, builder);
    builder.popWordTransform();
  } else {
    walk(elem.children, builder);
  }
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function formatBlockquote(elem, walk, builder, formatOptions) {
  builder.openBlock({
    leadingLineBreaks: formatOptions.leadingLineBreaks || 2,
    reservedLineLength: 2
  });
  walk(elem.children, builder);
  builder.closeBlock({
    trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
    blockTransform: (str) => (formatOptions.trimEmptyLines !== false ? trimCharacter(str, "\n") : str).split("\n").map((line) => "> " + line).join("\n")
  });
}
function withBrackets(str, brackets) {
  if (!brackets) {
    return str;
  }
  const lbr = typeof brackets[0] === "string" ? brackets[0] : "[";
  const rbr = typeof brackets[1] === "string" ? brackets[1] : "]";
  return lbr + str + rbr;
}
function pathRewrite(path, rewriter, baseUrl, metadata, elem) {
  const modifiedPath = typeof rewriter === "function" ? rewriter(path, metadata, elem) : path;
  return modifiedPath[0] === "/" && baseUrl ? trimCharacterEnd(baseUrl, "/") + modifiedPath : modifiedPath;
}
function formatImage(elem, walk, builder, formatOptions) {
  const attribs = elem.attribs || {};
  const alt = attribs.alt ? attribs.alt : "";
  const src = !attribs.src ? "" : pathRewrite(attribs.src, formatOptions.pathRewrite, formatOptions.baseUrl, builder.metadata, elem);
  const text = !src ? alt : !alt ? withBrackets(src, formatOptions.linkBrackets) : alt + " " + withBrackets(src, formatOptions.linkBrackets);
  builder.addInline(text, { noWordTransform: true });
}
function formatAnchor(elem, walk, builder, formatOptions) {
  function getHref() {
    if (formatOptions.ignoreHref) {
      return "";
    }
    if (!elem.attribs || !elem.attribs.href) {
      return "";
    }
    let href2 = elem.attribs.href.replace(/^mailto:/, "");
    if (formatOptions.noAnchorUrl && href2[0] === "#") {
      return "";
    }
    href2 = pathRewrite(href2, formatOptions.pathRewrite, formatOptions.baseUrl, builder.metadata, elem);
    return href2;
  }
  const href = getHref();
  if (!href) {
    walk(elem.children, builder);
  } else {
    let text = "";
    builder.pushWordTransform(
      (str) => {
        if (str) {
          text += str;
        }
        return str;
      }
    );
    walk(elem.children, builder);
    builder.popWordTransform();
    const hideSameLink = formatOptions.hideLinkHrefIfSameAsText && href === text;
    if (!hideSameLink) {
      builder.addInline(
        !text ? href : " " + withBrackets(href, formatOptions.linkBrackets),
        { noWordTransform: true }
      );
    }
  }
}
function formatList(elem, walk, builder, formatOptions, nextPrefixCallback) {
  const isNestedList = get(elem, ["parent", "name"]) === "li";
  let maxPrefixLength = 0;
  const listItems = (elem.children || []).filter((child) => child.type !== "text" || !/^\s*$/.test(child.data)).map(function(child) {
    if (child.name !== "li") {
      return { node: child, prefix: "" };
    }
    const prefix = isNestedList ? nextPrefixCallback().trimStart() : nextPrefixCallback();
    if (prefix.length > maxPrefixLength) {
      maxPrefixLength = prefix.length;
    }
    return { node: child, prefix };
  });
  if (!listItems.length) {
    return;
  }
  builder.openList({
    interRowLineBreaks: 1,
    leadingLineBreaks: isNestedList ? 1 : formatOptions.leadingLineBreaks || 2,
    maxPrefixLength,
    prefixAlign: "left"
  });
  for (const { node, prefix } of listItems) {
    builder.openListItem({ prefix });
    walk([node], builder);
    builder.closeListItem();
  }
  builder.closeList({ trailingLineBreaks: isNestedList ? 1 : formatOptions.trailingLineBreaks || 2 });
}
function formatUnorderedList(elem, walk, builder, formatOptions) {
  const prefix = formatOptions.itemPrefix || " * ";
  return formatList(elem, walk, builder, formatOptions, () => prefix);
}
function formatOrderedList(elem, walk, builder, formatOptions) {
  let nextIndex = Number(elem.attribs.start || "1");
  const indexFunction = getOrderedListIndexFunction(elem.attribs.type);
  const nextPrefixCallback = () => " " + indexFunction(nextIndex++) + ". ";
  return formatList(elem, walk, builder, formatOptions, nextPrefixCallback);
}
function getOrderedListIndexFunction(olType = "1") {
  switch (olType) {
    case "a":
      return (i) => numberToLetterSequence(i, "a");
    case "A":
      return (i) => numberToLetterSequence(i, "A");
    case "i":
      return (i) => numberToRoman(i).toLowerCase();
    case "I":
      return (i) => numberToRoman(i);
    case "1":
    default:
      return (i) => i.toString();
  }
}
function splitClassesAndIds(selectors) {
  const classes = [];
  const ids = [];
  for (const selector of selectors) {
    if (selector.startsWith(".")) {
      classes.push(selector.substring(1));
    } else if (selector.startsWith("#")) {
      ids.push(selector.substring(1));
    }
  }
  return { classes, ids };
}
function isDataTable(attr, tables) {
  if (tables === true) {
    return true;
  }
  if (!attr) {
    return false;
  }
  const { classes, ids } = splitClassesAndIds(tables);
  const attrClasses = (attr["class"] || "").split(" ");
  const attrIds = (attr["id"] || "").split(" ");
  return attrClasses.some((x) => classes.includes(x)) || attrIds.some((x) => ids.includes(x));
}
function formatTable(elem, walk, builder, formatOptions) {
  return isDataTable(elem.attribs, builder.options.tables) ? formatDataTable(elem, walk, builder, formatOptions) : formatBlock(elem, walk, builder, formatOptions);
}
function formatBlock(elem, walk, builder, formatOptions) {
  builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks });
  walk(elem.children, builder);
  builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks });
}
function formatDataTable(elem, walk, builder, formatOptions) {
  builder.openTable();
  elem.children.forEach(walkTable);
  builder.closeTable({
    tableToString: (rows) => tableToString(rows, formatOptions.rowSpacing ?? 0, formatOptions.colSpacing ?? 3),
    leadingLineBreaks: formatOptions.leadingLineBreaks,
    trailingLineBreaks: formatOptions.trailingLineBreaks
  });
  function formatCell(cellNode) {
    const colspan = +get(cellNode, ["attribs", "colspan"]) || 1;
    const rowspan = +get(cellNode, ["attribs", "rowspan"]) || 1;
    builder.openTableCell({ maxColumnWidth: formatOptions.maxColumnWidth });
    walk(cellNode.children, builder);
    builder.closeTableCell({ colspan, rowspan });
  }
  function walkTable(elem2) {
    if (elem2.type !== "tag") {
      return;
    }
    const formatHeaderCell = formatOptions.uppercaseHeaderCells !== false ? (cellNode) => {
      builder.pushWordTransform((str) => str.toUpperCase());
      formatCell(cellNode);
      builder.popWordTransform();
    } : formatCell;
    switch (elem2.name) {
      case "thead":
      case "tbody":
      case "tfoot":
      case "center":
        elem2.children.forEach(walkTable);
        return;
      case "tr": {
        builder.openTableRow();
        for (const childOfTr of elem2.children) {
          if (childOfTr.type !== "tag") {
            continue;
          }
          switch (childOfTr.name) {
            case "th": {
              formatHeaderCell(childOfTr);
              break;
            }
            case "td": {
              formatCell(childOfTr);
              break;
            }
          }
        }
        builder.closeTableRow();
        break;
      }
    }
  }
}
var textFormatters = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  anchor: formatAnchor,
  blockquote: formatBlockquote,
  dataTable: formatDataTable,
  heading: formatHeading,
  horizontalLine: formatHorizontalLine,
  image: formatImage,
  lineBreak: formatLineBreak,
  orderedList: formatOrderedList,
  paragraph: formatParagraph,
  pre: formatPre,
  table: formatTable,
  unorderedList: formatUnorderedList,
  wbr: formatWbr
});
const DEFAULT_OPTIONS = {
  baseElements: {
    selectors: ["body"],
    orderBy: "selectors",
    // 'selectors' | 'occurrence'
    returnDomByDefault: true
  },
  decodeEntities: true,
  encodeCharacters: {},
  formatters: {},
  limits: {
    ellipsis: "...",
    maxBaseElements: void 0,
    maxChildNodes: void 0,
    maxDepth: void 0,
    maxInputLength: 1 << 24
    // 16_777_216
  },
  longWordSplit: {
    forceWrapOnLimit: false,
    wrapCharacters: []
  },
  preserveNewlines: false,
  selectors: [
    { selector: "*", format: "inline" },
    {
      selector: "a",
      format: "anchor",
      options: {
        baseUrl: null,
        hideLinkHrefIfSameAsText: false,
        ignoreHref: false,
        linkBrackets: ["[", "]"],
        noAnchorUrl: true
      }
    },
    { selector: "article", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    { selector: "aside", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    {
      selector: "blockquote",
      format: "blockquote",
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2, trimEmptyLines: true }
    },
    { selector: "br", format: "lineBreak" },
    { selector: "div", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    { selector: "footer", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    { selector: "form", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    { selector: "h1", format: "heading", options: { leadingLineBreaks: 3, trailingLineBreaks: 2, uppercase: true } },
    { selector: "h2", format: "heading", options: { leadingLineBreaks: 3, trailingLineBreaks: 2, uppercase: true } },
    { selector: "h3", format: "heading", options: { leadingLineBreaks: 3, trailingLineBreaks: 2, uppercase: true } },
    { selector: "h4", format: "heading", options: { leadingLineBreaks: 2, trailingLineBreaks: 2, uppercase: true } },
    { selector: "h5", format: "heading", options: { leadingLineBreaks: 2, trailingLineBreaks: 2, uppercase: true } },
    { selector: "h6", format: "heading", options: { leadingLineBreaks: 2, trailingLineBreaks: 2, uppercase: true } },
    { selector: "header", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    {
      selector: "hr",
      format: "horizontalLine",
      options: { leadingLineBreaks: 2, length: void 0, trailingLineBreaks: 2 }
    },
    {
      selector: "img",
      format: "image",
      options: { baseUrl: null, linkBrackets: ["[", "]"] }
    },
    { selector: "main", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    { selector: "nav", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    {
      selector: "ol",
      format: "orderedList",
      options: { leadingLineBreaks: 2, trailingLineBreaks: 2 }
    },
    { selector: "p", format: "paragraph", options: { leadingLineBreaks: 2, trailingLineBreaks: 2 } },
    { selector: "pre", format: "pre", options: { leadingLineBreaks: 2, trailingLineBreaks: 2 } },
    { selector: "section", format: "block", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
    {
      selector: "table",
      format: "table",
      options: {
        colSpacing: 3,
        leadingLineBreaks: 2,
        maxColumnWidth: 60,
        rowSpacing: 0,
        trailingLineBreaks: 2,
        uppercaseHeaderCells: true
      }
    },
    {
      selector: "ul",
      format: "unorderedList",
      options: { itemPrefix: " * ", leadingLineBreaks: 2, trailingLineBreaks: 2 }
    },
    { selector: "wbr", format: "wbr" }
  ],
  tables: [],
  // deprecated
  whitespaceCharacters: " 	\r\n\f​",
  wordwrap: 80
};
const concatMerge = (acc, src, options) => [...acc, ...src];
const overwriteMerge = (acc, src, options) => [...src];
const selectorsMerge = (acc, src, options) => acc.some((s2) => typeof s2 === "object") ? concatMerge(acc, src) : overwriteMerge(acc, src);
function compile(options = {}) {
  options = merge(
    DEFAULT_OPTIONS,
    options,
    {
      arrayMerge: overwriteMerge,
      customMerge: (key) => key === "selectors" ? selectorsMerge : void 0
    }
  );
  options.formatters = Object.assign({}, genericFormatters, textFormatters, options.formatters);
  options.selectors = mergeDuplicatesPreferLast(options.selectors, (s2) => s2.selector);
  handleDeprecatedOptions(options);
  return compile$1(options);
}
function convert(html2, options = {}, metadata = void 0) {
  return compile(options)(html2, metadata);
}
function handleDeprecatedOptions(options) {
  if (options.tags) {
    const tagDefinitions = Object.entries(options.tags).map(
      ([selector, definition]) => ({ ...definition, selector: selector || "*" })
    );
    options.selectors.push(...tagDefinitions);
    options.selectors = mergeDuplicatesPreferLast(options.selectors, (s2) => s2.selector);
  }
  function set(obj, path, value) {
    const valueKey = path.pop();
    for (const key of path) {
      let nested = obj[key];
      if (!nested) {
        nested = {};
        obj[key] = nested;
      }
      obj = nested;
    }
    obj[valueKey] = value;
  }
  if (options["baseElement"]) {
    const baseElement = options["baseElement"];
    set(
      options,
      ["baseElements", "selectors"],
      Array.isArray(baseElement) ? baseElement : [baseElement]
    );
  }
  if (options["returnDomByDefault"] !== void 0) {
    set(options, ["baseElements", "returnDomByDefault"], options["returnDomByDefault"]);
  }
  for (const definition of options.selectors) {
    if (definition.format === "anchor" && get(definition, ["options", "noLinkBrackets"])) {
      set(definition, ["options", "linkBrackets"], false);
    }
  }
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production;
function requireReactJsxRuntime_production() {
  if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
  hasRequiredReactJsxRuntime_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        "key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config ? config : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_production.jsx = jsxProd;
  reactJsxRuntime_production.jsxs = jsxProd;
  return reactJsxRuntime_production;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b2) => {
  for (var prop in b2 || (b2 = {}))
    if (__hasOwnProp.call(b2, prop))
      __defNormalProp(a, prop, b2[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b2)) {
      if (__propIsEnum.call(b2, prop))
        __defNormalProp(a, prop, b2[prop]);
    }
  return a;
};
var __spreadProps = (a, b2) => __defProps(a, __getOwnPropDescs(b2));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e2) {
        reject(e2);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function recursivelyMapDoc(doc, callback) {
  if (Array.isArray(doc)) {
    return doc.map((innerDoc) => recursivelyMapDoc(innerDoc, callback));
  }
  if (typeof doc === "object") {
    if (doc.type === "group") {
      return __spreadProps(__spreadValues({}, doc), {
        contents: recursivelyMapDoc(doc.contents, callback),
        expandedStates: recursivelyMapDoc(
          doc.expandedStates,
          callback
        )
      });
    }
    if ("contents" in doc) {
      return __spreadProps(__spreadValues({}, doc), {
        contents: recursivelyMapDoc(doc.contents, callback)
      });
    }
    if ("parts" in doc) {
      return __spreadProps(__spreadValues({}, doc), {
        parts: recursivelyMapDoc(doc.parts, callback)
      });
    }
    if (doc.type === "if-break") {
      return __spreadProps(__spreadValues({}, doc), {
        breakContents: recursivelyMapDoc(doc.breakContents, callback),
        flatContents: recursivelyMapDoc(doc.flatContents, callback)
      });
    }
  }
  return callback(doc);
}
var modifiedHtml = __spreadValues({}, html);
if (modifiedHtml.printers) {
  const previousPrint = modifiedHtml.printers.html.print;
  modifiedHtml.printers.html.print = (path, options, print, args) => {
    const node = path.getNode();
    const rawPrintingResult = previousPrint(path, options, print, args);
    if (node.type === "ieConditionalComment") {
      const printingResult = recursivelyMapDoc(rawPrintingResult, (doc) => {
        if (typeof doc === "object" && doc.type === "line") {
          return doc.soft ? "" : " ";
        }
        return doc;
      });
      return printingResult;
    }
    return rawPrintingResult;
  };
}
var defaults = {
  endOfLine: "lf",
  tabWidth: 2,
  plugins: [modifiedHtml],
  bracketSameLine: true,
  parser: "html"
};
var pretty = (str, options = {}) => {
  return fu(str.replaceAll("\0", ""), __spreadValues(__spreadValues({}, defaults), options));
};
var plainTextSelectors = [
  { selector: "img", format: "skip" },
  { selector: "[data-skip-in-text=true]", format: "skip" },
  {
    selector: "a",
    options: { linkBrackets: false }
  }
];
function toPlainText(html2, options) {
  return convert(html2, __spreadValues({
    selectors: plainTextSelectors
  }, options));
}
var decoder = new TextDecoder("utf-8");
var readStream = (stream) => __async(void 0, null, function* () {
  const chunks = [];
  const writableStream = new WritableStream({
    write(chunk) {
      chunks.push(chunk);
    },
    abort(reason) {
      throw new Error("Stream aborted", {
        cause: {
          reason
        }
      });
    }
  });
  yield stream.pipeTo(writableStream);
  let length = 0;
  chunks.forEach((item) => {
    length += item.length;
  });
  const mergedChunks = new Uint8Array(length);
  let offset = 0;
  chunks.forEach((item) => {
    mergedChunks.set(item, offset);
    offset += item.length;
  });
  return decoder.decode(mergedChunks);
});
var importReactDOM = () => __async(void 0, null, function* () {
  try {
    return yield import("./server.edge-BO1qx7u-.js").then((n2) => n2.s);
  } catch (_exception) {
    return yield import("./server.edge-BO1qx7u-.js").then((n2) => n2.s);
  }
});
var render = (element, options) => __async(void 0, null, function* () {
  const suspendedElement = /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { children: element });
  const reactDOMServer = yield importReactDOM().then(
    // This is beacuse react-dom/server is CJS
    (m) => m.default
  );
  const html2 = yield new Promise((resolve, reject) => {
    reactDOMServer.renderToReadableStream(suspendedElement, {
      onError(error) {
        reject(error);
      },
      progressiveChunkSize: Number.POSITIVE_INFINITY
    }).then(readStream).then(resolve).catch(reject);
  });
  if (options == null ? void 0 : options.plainText) {
    return toPlainText(html2, options.htmlToTextOptions);
  }
  const doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
  const document = `${doctype}${html2.replace(/<!DOCTYPE.*?>/, "")}`;
  if (options == null ? void 0 : options.pretty) {
    return pretty(document);
  }
  return document;
});
var renderAsync = (element, options) => {
  return render(element, options);
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  plainTextSelectors,
  pretty,
  render,
  renderAsync,
  toPlainText
}, Symbol.toStringTag, { value: "Module" }));
export {
  getDefaultExportFromCjs as g,
  index as i,
  requireReact as r
};

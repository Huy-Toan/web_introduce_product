import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = () => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
const _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
const _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
const nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
class PerformanceEntry {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
}
const PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
class PerformanceMeasure extends PerformanceEntry {
  entryType = "measure";
}
class PerformanceResourceTiming extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
}
class PerformanceObserverEntryList {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
}
class Performance {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
}
class PerformanceObserver {
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
}
const performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
const hrtime$1 = /* @__PURE__ */ Object.assign(function hrtime(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, { bigint: function bigint() {
  return BigInt(Date.now() * 1e6);
} });
class WriteStream {
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
}
class ReadStream {
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
}
const NODE_VERSION = "22.14.0";
class Process extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
}
const globalProcess = globalThis["process"];
const getBuiltinModule = globalProcess.getBuiltinModule;
const { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
const unenvProcess = new Process({
  env: globalProcess.env,
  hrtime: hrtime$1,
  nextTick
});
const {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime2,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
const _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime2,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
globalThis.process = _process;
const noop = Object.assign(() => {
}, { __unenv__: true });
const _console = globalThis.console;
const _ignoreErrors = true;
const _stderr = new Writable();
const _stdout = new Writable();
const Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
const _times = /* @__PURE__ */ new Map();
const _stdoutErrorHandler = noop;
const _stderrErrorHandler = noop;
const workerdConsole = globalThis["console"];
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
globalThis.console = workerdConsole;
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index2 = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index2) {
        throw new Error("next() called multiple times");
      }
      index2 = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};
var GET_MATCH_RESULT = Symbol();
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index2) => {
    if (index2 === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index2) => {
    const mark = `@${index2}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder2) => {
  try {
    return decoder2(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder2(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf(
    "/",
    url.charCodeAt(9) === 58 ? 13 : 8
  );
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw[key]();
  };
  json() {
    return this.#cachedBody("json");
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};
var HtmlEscapedCallbackPhase = {
  Stringify: 1
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  {
    return resStr;
  }
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    this.header("Location", String(location));
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono$1 = class Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono$1({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node$1 = class Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index2, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index2;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node$1();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node$1();
      }
    }
    node.insert(restTokens, index2, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node$1();
  insert(path, index2, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index2, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index2 = match.indexOf("", 1);
      return [matcher[1][index2], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          if (!part) {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};
var Hono2 = class extends Hono$1 {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
function uuidv4$1() {
  return ("10000000-1000-4000-8000" + -1e11).replace(
    /[018]/g,
    (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
const uploadImageRouter = new Hono2();
uploadImageRouter.post("/", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("image");
    if (!file || typeof file === "string") {
      return c.json({ error: "Không có file nào được upload" }, 400);
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)" }, 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: "Kích thước ảnh không được vượt quá 5MB!" }, 400);
    }
    const ext = file.name.split(".").pop();
    const fileName = `books/${uuidv4$1()}.${ext}`;
    const r2 = c.env.IMAGES;
    await r2.put(fileName, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    });
    if (!c.env.PUBLIC_R2_URL) {
      return c.json({ error: "Thiếu PUBLIC_R2_URL trong cấu hình môi trường" }, 500);
    }
    const baseUrl = c.env.PUBLIC_R2_URL.replace(/\/+$/, "");
    const publicUrl = `${baseUrl}/${fileName}`;
    return c.json({
      success: true,
      url: publicUrl,
      fileName
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({
      error: "Có lỗi xảy ra khi upload ảnh",
      details: error.message
    }, 500);
  }
});
function uuidv4() {
  return ("10000000-1000-4000-8000" + -1e11).replace(
    /[018]/g,
    (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
const editorUploadRouter = new Hono2();
editorUploadRouter.post("/", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("editormd-image-file");
    if (!file || typeof file === "string") {
      return c.json({ success: 0, message: "Không có file nào được upload" }, 400);
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: 0, message: "Chỉ chấp nhận JPEG, PNG, GIF, WebP" }, 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ success: 0, message: "Ảnh vượt quá 5MB!" }, 400);
    }
    const ext = file.name.split(".").pop();
    const fileName = `books/${uuidv4()}.${ext}`;
    const r2 = c.env.IMAGES;
    await r2.put(fileName, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    });
    const baseUrl = c.env.PUBLIC_R2_URL.replace(/\/+$/, "");
    const publicUrl = `${baseUrl}/${fileName}`;
    return c.json({
      success: 1,
      message: "OK",
      url: publicUrl,
      fileName
      // giữ lại cho bạn dùng khi cần
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ success: 0, message: error.message }, 500);
  }
});
const DEFAULT_LOCALE$7 = "vi";
const getLocale$7 = (c) => (c.req.query("locale") || DEFAULT_LOCALE$7).toLowerCase();
const hasDB$7 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const aboutRouter = new Hono2();
const fallbackAbout = [
  {
    id: 1,
    title: "About Our Library",
    content: "We are a community-driven library offering a wide range of books to readers of all ages.",
    image_url: "/images/about/library.jpg"
  }
];
async function getMergedAboutById(db, id, locale) {
  const sql = `
    SELECT
      a.id,
      COALESCE(at.title,   a.title)   AS title,
      COALESCE(at.content, a.content) AS content,
      a.image_url,
      a.created_at
    FROM about_us a
    LEFT JOIN about_us_translations at
      ON at.about_id = a.id AND at.locale = ?
    WHERE a.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}
aboutRouter.get("/", async (c) => {
  try {
    if (!hasDB$7(c.env)) {
      return c.json({ about: fallbackAbout, source: "fallback" });
    }
    const locale = getLocale$7(c);
    const sql = `
      SELECT
        a.id,
        COALESCE(at.title,   a.title)   AS title,
        COALESCE(at.content, a.content) AS content,
        a.image_url,
        a.created_at
      FROM about_us a
      LEFT JOIN about_us_translations at
        ON at.about_id = a.id AND at.locale = ?
      ORDER BY a.id ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();
    return c.json({ about: results, source: "database", locale });
  } catch (e) {
    console.error("Error fetching about list:", e);
    return c.json({ error: "Failed to fetch about us" }, 500);
  }
});
aboutRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$7(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale$7(c);
    const item = await getMergedAboutById(c.env.DB, id, locale);
    if (!item) return c.json({ error: "Not found" }, 404);
    return c.json({ about: item, source: "database", locale });
  } catch (e) {
    console.error("Error fetching about detail:", e);
    return c.json({ error: "Failed to fetch about" }, 500);
  }
});
aboutRouter.post("/", async (c) => {
  try {
    if (!hasDB$7(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const { title: title2, content, image_url, translations } = body || {};
    if (!title2 || !content) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }
    const sql = `
      INSERT INTO about_us (title, content, image_url)
      VALUES (?, ?, ?)
    `;
    const res = await c.env.DB.prepare(sql).bind(title2, content, image_url || null).run();
    if (!res.success) throw new Error("Insert failed");
    const newId = res.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO about_us_translations(about_id, locale, title, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(about_id, locale) DO UPDATE SET
          title=excluded.title,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(newId, String(lc).toLowerCase(), tr?.title ?? "", tr?.content ?? "").run();
      }
    }
    const locale = getLocale$7(c);
    const item = await getMergedAboutById(c.env.DB, newId, locale);
    return c.json({ about: item, source: "database", locale }, 201);
  } catch (e) {
    console.error("Error creating about:", e);
    return c.json({ error: "Failed to create about" }, 500);
  }
});
aboutRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$7(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const { title: title2, content, image_url, translations } = body || {};
    const sets = [];
    const params = [];
    if (title2 !== void 0) {
      sets.push("title = ?");
      params.push(title2);
    }
    if (content !== void 0) {
      sets.push("content = ?");
      params.push(content);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (sets.length) {
      const sql = `UPDATE about_us SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Not found" }, 404);
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO about_us_translations(about_id, locale, title, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(about_id, locale) DO UPDATE SET
          title=excluded.title,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.title ?? "", tr?.content ?? "").run();
      }
    }
    const locale = getLocale$7(c);
    const item = await getMergedAboutById(c.env.DB, id, locale);
    return c.json({ about: item, source: "database", locale });
  } catch (e) {
    console.error("Error updating about:", e);
    return c.json({ error: "Failed to update about" }, 500);
  }
});
aboutRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$7(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }
    const upsertT = `
      INSERT INTO about_us_translations(about_id, locale, title, content)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(about_id, locale) DO UPDATE SET
        title=excluded.title,
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.title ?? "", tr?.content ?? "").run();
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error("Error upserting about translations:", e);
    return c.json({ error: "Failed to upsert translations" }, 500);
  }
});
aboutRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$7(c.env)) return c.json({ error: "Database not available" }, 503);
    const existing = await c.env.DB.prepare("SELECT id FROM about_us WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ error: "Not found" }, 404);
    await c.env.DB.prepare("DELETE FROM about_us WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e) {
    console.error("Error deleting about:", e);
    return c.json({ error: "Failed to delete about" }, 500);
  }
});
aboutRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const sql = `
      SELECT locale, title, content
      FROM about_us_translations
      WHERE about_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = { title: r.title || "", content: r.content || "" };
    }
    return c.json({ translations });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});
const DEFAULT_LOCALE$6 = "vi";
const getLocale$6 = (c) => (c.req.query("locale") || DEFAULT_LOCALE$6).toLowerCase();
const hasDB$6 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const slugify$4 = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
async function resolveNewsIdBySlug(db, slug, locale) {
  const sql = `
    SELECT n.id
    FROM news_translations nt
    JOIN news n ON n.id = nt.news_id
    WHERE nt.locale = ? AND nt.slug = ?
    UNION
    SELECT n2.id
    FROM news n2
    WHERE n2.slug = ?
    LIMIT 1
  `;
  const row = await db.prepare(sql).bind(locale, slug, slug).first();
  return row?.id || null;
}
async function getMergedNewsById(db, id, locale) {
  const sql = `
    SELECT
      n.id,
      COALESCE(nt.title, n.title)                 AS title,
      COALESCE(nt.slug, n.slug)                   AS slug,
      COALESCE(nt.content, n.content)             AS content,
      COALESCE(nt.meta_description, n.meta_description) AS meta_description,
      COALESCE(nt.keywords, n.keywords)           AS keywords,
      n.image_url,
      n.published_at,
      n.created_at,
      n.updated_at
    FROM news n
    LEFT JOIN news_translations nt
      ON nt.news_id = n.id AND nt.locale = ?
    WHERE n.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}
async function getAllTranslations(db, newsId) {
  const trRes = await db.prepare(
    `SELECT locale, title, slug, content, meta_description, keywords FROM news_translations WHERE news_id = ?`
  ).bind(newsId).all();
  const translationsObj = {};
  for (const r of trRes.results || []) {
    translationsObj[r.locale] = {
      title: r.title || "",
      slug: r.slug || "",
      content: r.content || "",
      meta_description: r.meta_description ?? null,
      keywords: r.keywords ?? null
    };
  }
  return translationsObj;
}
const newsRouter = new Hono2();
newsRouter.get("/", async (c) => {
  try {
    if (!hasDB$6(c.env)) return c.json({ error: "No database" }, 500);
    const locale = getLocale$6(c);
    const sql = `
      SELECT
        n.id,
        COALESCE(nt.title, n.title)                 AS title,
        COALESCE(nt.slug, n.slug)                   AS slug,
        COALESCE(nt.content, n.content)             AS content,
        COALESCE(nt.meta_description, n.meta_description) AS meta_description,
        COALESCE(nt.keywords, n.keywords)           AS keywords,
        n.image_url,
        n.published_at,
        n.created_at,
        n.updated_at
      FROM news n
      LEFT JOIN news_translations nt
        ON nt.news_id = n.id AND nt.locale = ?
      ORDER BY COALESCE(n.published_at, n.created_at) DESC
    `;
    const params = [locale];
    const { results = [] } = await c.env.DB.prepare(sql).bind(...params).all();
    return c.json({
      news: results,
      count: results.length,
      source: "database",
      locale,
      debug: { sql, params }
    });
  } catch (err) {
    console.error("Error fetching news:", err);
    return c.json({ error: "Failed to fetch news", source: "error_fallback" }, 500);
  }
});
newsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB$6(c.env)) return c.json({ error: "No database" }, 500);
    const locale = getLocale$6(c);
    let newsId = null;
    if (/^\d+$/.test(idOrSlug)) {
      newsId = Number(idOrSlug);
    } else {
      newsId = await resolveNewsIdBySlug(c.env.DB, idOrSlug, locale);
    }
    if (!newsId) return c.json({ error: "Not found" }, 404);
    const item = await getMergedNewsById(c.env.DB, newsId, locale);
    if (!item) return c.json({ error: "Not found" }, 404);
    const translations = await getAllTranslations(c.env.DB, newsId);
    return c.json({ news: { ...item, translations }, source: "database", locale });
  } catch (err) {
    console.error("Error fetching news by id/slug:", err);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});
newsRouter.post("/", async (c) => {
  try {
    if (!hasDB$6(c.env)) return c.json({ error: "No database" }, 500);
    const body = await c.req.json();
    const {
      title: title2,
      slug: rawSlug,
      content,
      image_url,
      meta_description,
      keywords,
      published_at,
      translations
    } = body || {};
    if (!title2 || !content) return c.json({ error: "Missing title/content" }, 400);
    const baseSlug = rawSlug?.trim() || slugify$4(title2);
    const sql = `
      INSERT INTO news (title, slug, content, meta_description, keywords, image_url, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB.prepare(sql).bind(
      title2,
      baseSlug,
      content,
      meta_description || null,
      keywords || null,
      image_url || null,
      published_at ?? null
    ).run();
    if (!runRes.success) return c.json({ error: "Insert failed" }, 500);
    const newId = runRes.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO news_translations(news_id, locale, title, slug, content, meta_description, keywords)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(news_id, locale) DO UPDATE SET
          title=excluded.title,
          slug=excluded.slug,
          content=excluded.content,
          meta_description=excluded.meta_description,
          keywords=excluded.keywords,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          newId,
          lc,
          tr.title || null,
          tr.slug || null,
          tr.content || null,
          tr.meta_description || null,
          tr.keywords || null
        ).run();
      }
    }
    const locale = getLocale$6(c);
    const item = await getMergedNewsById(c.env.DB, newId, locale);
    const translationsObj = await getAllTranslations(c.env.DB, newId);
    return c.json({ news: { ...item, translations: translationsObj }, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error adding news:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") ? "Slug already exists" : "Failed to add news";
    return c.json({ error: msg }, 500);
  }
});
newsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$6(c.env)) return c.json({ error: "No database" }, 500);
    const body = await c.req.json();
    const {
      title: title2,
      slug,
      content,
      image_url,
      meta_description,
      keywords,
      published_at,
      translations
    } = body || {};
    const sets = [];
    const params = [];
    if (title2 !== void 0) {
      sets.push("title = ?");
      params.push(title2);
    }
    if (slug !== void 0) {
      sets.push("slug = ?");
      params.push(slug);
    }
    if (content !== void 0) {
      sets.push("content = ?");
      params.push(content);
    }
    if (meta_description !== void 0) {
      sets.push("meta_description = ?");
      params.push(meta_description);
    }
    if (keywords !== void 0) {
      sets.push("keywords = ?");
      params.push(keywords);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (published_at !== void 0) {
      sets.push("published_at = ?");
      params.push(published_at);
    }
    if (sets.length > 0) {
      const sql = `UPDATE news SET ${sets.join(", ")}, updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = ?`;
      params.push(id);
      await c.env.DB.prepare(sql).bind(...params).run();
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO news_translations(news_id, locale, title, slug, content, meta_description, keywords)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(news_id, locale) DO UPDATE SET
          title=excluded.title,
          slug=excluded.slug,
          content=excluded.content,
          meta_description=excluded.meta_description,
          keywords=excluded.keywords,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          id,
          lc,
          tr.title || null,
          tr.slug || null,
          tr.content || null,
          tr.meta_description || null,
          tr.keywords || null
        ).run();
      }
    }
    const locale = getLocale$6(c);
    const item = await getMergedNewsById(c.env.DB, id, locale);
    const translationsObj = await getAllTranslations(c.env.DB, id);
    return c.json({ news: { ...item, translations: translationsObj }, source: "database", locale });
  } catch (err) {
    console.error("Error updating news:", err);
    return c.json({ error: "Failed to update news" }, 500);
  }
});
newsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$6(c.env)) return c.json({ error: "No database" }, 500);
    const body = await c.req.json();
    const { translations } = body || {};
    if (!translations || typeof translations !== "object") return c.json({ error: "Missing translations" }, 400);
    const upsertT = `
      INSERT INTO news_translations(news_id, locale, title, slug, content, meta_description, keywords)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(news_id, locale) DO UPDATE SET
        title=excluded.title,
        slug=excluded.slug,
        content=excluded.content,
        meta_description=excluded.meta_description,
        keywords=excluded.keywords,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(
        id,
        lc,
        tr.title || null,
        tr.slug || null,
        tr.content || null,
        tr.meta_description || null,
        tr.keywords || null
      ).run();
    }
    const translationsObj = await getAllTranslations(c.env.DB, id);
    return c.json({ translations: translationsObj, news_id: id });
  } catch (err) {
    console.error("Error updating translations:", err);
    return c.json({ error: "Failed to update translations" }, 500);
  }
});
newsRouter.get("/:id/translation", async (c) => {
  const id = c.req.param("id");
  const locale = (c.req.query("locale") || "vi").toLowerCase();
  try {
    const row = await c.env.DB.prepare(
      `SELECT 
        n.id,
        nt.locale,
        nt.title,
        nt.slug,
        nt.content,
        nt.meta_description,
        nt.keywords,
        nt.updated_at
       FROM news n
       JOIN news_translations nt ON nt.news_id = n.id
       WHERE n.id = ? AND nt.locale = ?`
    ).bind(id, locale).first();
    if (!row) {
      return c.json({ error: "Translation not found" }, 404);
    }
    return c.json(row);
  } catch (err) {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
newsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$6(c.env)) return c.json({ error: "No database" }, 500);
    await c.env.DB.prepare(`DELETE FROM news WHERE id = ?`).bind(id).run();
    return c.json({ success: true, id });
  } catch (err) {
    console.error("Error deleting news:", err);
    return c.json({ error: "Failed to delete news" }, 500);
  }
});
function cleanText(text) {
  if (!text) return "";
  return text.replace(/^\s*[-*•]\s*/gm, "").replace(/^\s*\d+\.\s*/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}
const seoApp = new Hono2();
const slugify$3 = (str = "") => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const safeJSONParse = (raw) => {
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: e?.message || "JSON parse error" };
  }
};
const tryExtractPlanningFromText = (txt = "") => {
  const title2 = (txt.match(/TIÊU ĐỀ\s*:?\s*(.+)/i)?.[1] || "").trim();
  const meta = (txt.match(/META DESCRIPTION\s*:?\s*([\s\S]*?)(?:\n|$)/i)?.[1] || "").trim();
  const keywordsBlock = txt.match(/TỪ KHÓA[^\n]*\s*:\s*([\s\S]*?)(?:OUTLINE|$)/i)?.[1] || "";
  const keywords = keywordsBlock.split("\n").map((l) => l.replace(/^\s*\d+\.\s*/, "").trim()).filter(Boolean);
  const outlineBlock = txt.match(/OUTLINE\s*:\s*([\s\S]*)$/i)?.[1] || "";
  const outline = outlineBlock.split("\n").map((l) => l.replace(/^\s*[-*•]\s*/, "").trim()).filter(Boolean);
  return { title: title2, meta_description: meta, keywords, outline };
};
seoApp.post("/generate-content", async (c) => {
  try {
    const { keyword } = await c.req.json();
    const ai = c.env.AI;
    if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
      return c.json({ success: false, error: "Thiếu keyword" }, 400);
    }
    const planningMessages = [
      { role: "system", content: "Bạn là content creator chuyên nghiệp, trả lời đúng định dạng yêu cầu." },
      {
        role: "user",
        content: `Tôi cần viết bài về "${keyword}".

Hãy trả lời CHỈ DẠNG JSON HỢP LỆ (không thêm chữ nào ngoài JSON):
{
  "title": "tiêu đề <= 60 ký tự, tự nhiên, không nhồi nhét",
  "meta_description": "mô tả <= 160 ký tự, hấp dẫn, tự nhiên",
  "keywords": ["5 từ khóa phụ, ngắn gọn", "..." ],
  "outline": ["Danh sách mục chính để viết bài 1000+ từ"]
}`
      }
    ];
    const planResult = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: planningMessages,
      max_tokens: 1400,
      temperature: 0.6
    });
    let planningJSON;
    {
      const parsed = safeJSONParse(planResult.response);
      if (parsed.ok) {
        planningJSON = parsed.data;
      } else {
        const fallback = tryExtractPlanningFromText(planResult.response || "");
        planningJSON = fallback;
      }
    }
    const title2 = (planningJSON?.title || "").trim();
    const metaRaw = (planningJSON?.meta_description || "").trim();
    const meta = metaRaw.length > 160 ? metaRaw.slice(0, 159) : metaRaw;
    const keywordsArr = Array.isArray(planningJSON?.keywords) ? planningJSON.keywords : [];
    const outline = Array.isArray(planningJSON?.outline) ? planningJSON.outline : [];
    const part1Messages = [
      ...planningMessages,
      { role: "assistant", content: JSON.stringify(planningJSON) },
      {
        role: "user",
        content: `Dựa vào JSON planning ở trên, hãy viết phần mở đầu hấp dẫn và 2-3 section đầu theo outline (~500-600 từ).
Yêu cầu:
- Dùng từ khóa "${keyword}" tự nhiên
- Giọng văn rõ ràng, hữu ích
- Trả về CHỈ DẠNG MARKDOWN (không JSON, không tiêu đề trùng lặp với title).`
      }
    ];
    const part1Result = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: part1Messages,
      max_tokens: 2400,
      temperature: 0.7
    });
    const part2Messages = [
      ...part1Messages,
      { role: "assistant", content: part1Result.response },
      {
        role: "user",
        content: `Viết tiếp các section còn lại theo outline và phần kết luận có call-to-action (~400-500 từ).
Yêu cầu:
- Kết nối mượt với phần trước
- Giữ cùng tone/style
- Trả về CHỈ DẠNG MARKDOWN.`
      }
    ];
    const part2Result = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: part2Messages,
      max_tokens: 2400,
      temperature: 0.7
    });
    const clean = (s) => cleanText(s || "");
    const contentMarkdown = [clean(part1Result.response), clean(part2Result.response)].filter(Boolean).join("\n\n");
    const response = {
      success: true,
      data: {
        title: title2 || keyword,
        meta,
        keywords: keywordsArr.join(", "),
        slug: slugify$3(title2 || keyword),
        content: contentMarkdown,
        outline
      },
      raw_responses: {
        planning: planningJSON,
        part1: clean(part1Result.response),
        part2: clean(part2Result.response)
      },
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    return c.json(response);
  } catch (err) {
    console.error("Content generation error:", err);
    return c.json({
      success: false,
      error: "Content generation failed",
      details: err?.message || String(err)
    }, 500);
  }
});
seoApp.post("/generate-seo", async (c) => {
  try {
    const { content } = await c.req.json();
    const ai = c.env.AI;
    if (!content || typeof content !== "string" || !content.trim()) {
      return c.json({ success: false, error: "Thiếu content" }, 400);
    }
    const truncated = content.length > 8e3 ? content.slice(0, 8e3) : content;
    const prompt = [
      { role: "system", content: "Bạn là chuyên gia SEO. Luôn trả lời đúng JSON schema khi được yêu cầu." },
      {
        role: "user",
        content: `Phân tích nội dung sau và trả lời CHỈ DẠNG JSON HỢP LỆ (không thêm chữ nào ngoài JSON).
---CONTENT---
${truncated}
---YÊU CẦU---
{
  "title": "tiêu đề <= 60 ký tự, súc tích, tự nhiên",
  "meta_description": "mô tả <= 160 ký tự, hấp dẫn, không nhồi nhét",
  "keywords": ["5-8 keyword ngắn gọn"],
  "focus_keyword": "từ khóa trọng tâm",
  "score": 7,
  "tips": ["3-5 gợi ý cải thiện cụ thể, ngắn gọn"],
  "distribution": ["các kênh phân phối nội dung gợi ý, 2-4 mục"]
}`
      }
    ];
    const aiRes = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: prompt,
      max_tokens: 1200,
      temperature: 0.5
    });
    let extracted;
    {
      const parsed = safeJSONParse(aiRes.response);
      if (parsed.ok) {
        extracted = parsed.data;
      } else {
        const txt = aiRes.response || "";
        const title3 = (txt.match(/TIÊU ĐỀ[^\n]*:\s*(.+)/i)?.[1] || "").trim();
        const meta2 = (txt.match(/META DESCRIPTION[^\n]*:\s*([\s\S]*?)(?:\n|$)/i)?.[1] || "").trim();
        const kwBlock = txt.match(/TỪ KHÓA[^\n]*:\s*([\s\S]*?)(?:\n\n|URL|$)/i)?.[1] || "";
        const keywords = kwBlock.split("\n").map((l) => l.replace(/^\s*\d+\.\s*/, "").trim()).filter(Boolean);
        extracted = {
          title: title3,
          meta_description: meta2,
          keywords,
          focus_keyword: keywords?.[0] || "",
          score: 7,
          tips: [],
          distribution: []
        };
      }
    }
    const title2 = (extracted?.title || "").trim();
    const metaRaw = (extracted?.meta_description || "").trim();
    const meta = metaRaw.length > 160 ? metaRaw.slice(0, 159) : metaRaw;
    const keywordsArr = Array.isArray(extracted?.keywords) ? extracted.keywords : [];
    const focus_keyword = (extracted?.focus_keyword || keywordsArr[0] || "").trim();
    const score = Number.isFinite(extracted?.score) ? Math.max(1, Math.min(10, Math.round(extracted.score))) : 7;
    const tips = Array.isArray(extracted?.tips) ? extracted.tips : [];
    const distribution = Array.isArray(extracted?.distribution) ? extracted.distribution : [];
    const response = {
      success: true,
      data: {
        title: title2,
        meta,
        keywords: keywordsArr.join(", "),
        slug: slugify$3(title2),
        focus_keyword,
        score,
        tips,
        distribution
      },
      raw_responses: {
        model_raw: cleanText(aiRes.response)
      },
      content_length: content.length,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    return c.json(response);
  } catch (err) {
    console.error("SEO analysis error:", err);
    return c.json({
      success: false,
      error: "SEO analysis failed",
      details: err?.message || String(err)
    }, 500);
  }
});
seoApp.get("/test", (c) => {
  return c.json({
    message: "SEO API working",
    endpoints: [
      "POST /generate-content - keyword → full content (title/meta/keywords/slug/content)",
      "POST /generate-seo - content → SEO (title/meta/keywords/slug + score/tips)"
    ],
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
const DEFAULT_LOCALE$5 = "vi";
const getLocale$5 = (c) => (c.req.query("locale") || DEFAULT_LOCALE$5).toLowerCase();
const hasDB$5 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const slugify$2 = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const parentsRouter = new Hono2();
parentsRouter.get("/", async (c) => {
  const { limit, offset, q, with_counts, with_subs } = c.req.query();
  try {
    if (!hasDB$5(c.env)) {
      return c.json({ parents: [], source: "fallback", count: 0 });
    }
    const locale = getLocale$5(c);
    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";
    const where = [];
    const params = [locale];
    if (q && q.trim()) {
      where.push(`(
        (pct.name IS NOT NULL AND pct.name LIKE ?)
        OR (pct.description IS NOT NULL AND pct.description LIKE ?)
        OR (pct.name IS NULL AND pc.name LIKE ?)
        OR (pct.description IS NULL AND pc.description LIKE ?)
      )`);
      const kw = `%${q.trim()}%`;
      params.push(kw, kw, kw, kw);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const baseSql = `
      SELECT
        pc.id,
        COALESCE(pct.name, pc.name)          AS name,
        pc.slug,
        COALESCE(pct.description, pc.description) AS description,
        pc.image_url,
        pc.created_at
      FROM parent_categories pc
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      ${whereSql}
      ORDER BY pc.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;
    if (hasLimit) params.push(Number(limit));
    if (hasOffset) params.push(Number(offset));
    const result = await c.env.DB.prepare(baseSql).bind(...params).all();
    let parents = result?.results ?? [];
    if (String(with_counts) === "1") {
      const ids = parents.map((p) => p.id);
      if (ids.length) {
        const placeholders = ids.map(() => "?").join(",");
        const countsSql = `
          WITH subs AS (
            SELECT parent_id, COUNT(*) AS sub_count
            FROM subcategories
            WHERE parent_id IN (${placeholders})
            GROUP BY parent_id
          ),
          prods AS (
            SELECT sc.parent_id, COUNT(p.id) AS product_count
            FROM subcategories sc
            LEFT JOIN products p ON p.subcategory_id = sc.id
            WHERE sc.parent_id IN (${placeholders})
            GROUP BY sc.parent_id
          )
          SELECT
            pc.id AS parent_id,
            COALESCE(s.sub_count, 0) AS sub_count,
            COALESCE(pr.product_count, 0) AS product_count
          FROM parent_categories pc
          LEFT JOIN subs s  ON s.parent_id  = pc.id
          LEFT JOIN prods pr ON pr.parent_id = pc.id
          WHERE pc.id IN (${placeholders})
        `;
        const countsRes = await c.env.DB.prepare(countsSql).bind(...ids, ...ids, ...ids).all();
        const counts = (countsRes?.results ?? []).reduce((acc, r) => {
          acc[r.parent_id] = { sub_count: r.sub_count, product_count: r.product_count };
          return acc;
        }, {});
        parents = parents.map((p) => ({
          ...p,
          ...counts[p.id] || { sub_count: 0, product_count: 0 }
        }));
      }
    }
    if (String(with_subs) === "1" && parents.length) {
      const ids = parents.map((p) => p.id);
      const placeholders = ids.map(() => "?").join(",");
      const subsSql = `
        SELECT
          sc.id,
          sc.parent_id,
          COALESCE(sct.name, sc.name) AS name,
          sc.slug,
          COALESCE(sct.description, sc.description) AS description,
          sc.image_url,
          sc.created_at
        FROM subcategories sc
        LEFT JOIN subcategories_translations sct
          ON sct.sub_id = sc.id AND sct.locale = ?
        WHERE sc.parent_id IN (${placeholders})
        ORDER BY sc.created_at DESC
      `;
      const subsRes = await c.env.DB.prepare(subsSql).bind(locale, ...ids).all();
      const subs = subsRes?.results ?? [];
      const grouped = subs.reduce((acc, s) => {
        (acc[s.parent_id] ||= []).push(s);
        return acc;
      }, {});
      parents = parents.map((p) => ({ ...p, subcategories: grouped[p.id] || [] }));
    }
    return c.json({
      parents,
      count: parents.length,
      source: "database",
      locale
    });
  } catch (err) {
    console.error("Error fetching parent categories:", err);
    return c.json({ error: "Failed to fetch parent categories" }, 500);
  }
});
parentsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  const { with_subs } = c.req.query();
  try {
    if (!hasDB$5(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale$5(c);
    const isNumeric = /^\d+$/.test(idOrSlug);
    const sql = `
      SELECT
        pc.id,
        COALESCE(pct.name, pc.name)          AS name,
        pc.slug,
        COALESCE(pct.description, pc.description) AS description,
        pc.image_url,
        pc.created_at
      FROM parent_categories pc
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      WHERE ${isNumeric ? "pc.id = ?" : "pc.slug = ?"}
      LIMIT 1
    `;
    const parent = await c.env.DB.prepare(sql).bind(locale, isNumeric ? Number(idOrSlug) : idOrSlug).first();
    if (!parent) return c.json({ error: "Parent category not found" }, 404);
    if (String(with_subs) === "1") {
      const subsSql = `
        SELECT
          sc.id,
          sc.parent_id,
          COALESCE(sct.name, sc.name) AS name,
          sc.slug,
          COALESCE(sct.description, sc.description) AS description,
          sc.image_url,
          sc.created_at
        FROM subcategories sc
        LEFT JOIN subcategories_translations sct
          ON sct.sub_id = sc.id AND sct.locale = ?
        WHERE sc.parent_id = ?
        ORDER BY sc.created_at DESC
      `;
      const subs = await c.env.DB.prepare(subsSql).bind(locale, parent.id).all();
      parent.subcategories = subs?.results ?? [];
    }
    return c.json({ parent, source: "database", locale });
  } catch (err) {
    console.error("Error fetching parent category:", err);
    return c.json({ error: "Failed to fetch parent category" }, 500);
  }
});
parentsRouter.post("/", async (c) => {
  try {
    if (!hasDB$5(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const { name, slug: rawSlug, description, image_url, translations } = body || {};
    if (!name?.trim()) return c.json({ error: "Missing required field: name" }, 400);
    const slug = (rawSlug?.trim() || slugify$2(name)).toLowerCase();
    const insSql = `
      INSERT INTO parent_categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const res = await c.env.DB.prepare(insSql).bind(name.trim(), slug, description || null, image_url || null).run();
    if (!res.success) throw new Error("Insert failed");
    const newId = res.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO parent_categories_translations(parent_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(parent_id, locale) DO UPDATE SET
          name=COALESCE(excluded.name, name),
          description=COALESCE(excluded.description, description),
          updated_at=CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(newId, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null).run();
      }
    }
    const parent = await c.env.DB.prepare(
      `SELECT id, name, slug, description, image_url, created_at
         FROM parent_categories WHERE id = ?`
    ).bind(newId).first();
    return c.json({ parent, source: "database" }, 201);
  } catch (err) {
    console.error("Error creating parent category:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug or Name already exists" : "Failed to create parent category";
    return c.json({ error: msg }, 500);
  }
});
parentsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$5(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const { name, slug, description, image_url, translations } = body || {};
    const sets = [];
    const params = [];
    if (name !== void 0) {
      sets.push("name = ?");
      params.push(name);
    }
    if (slug !== void 0) {
      sets.push("slug = ?");
      params.push(slug);
    }
    if (description !== void 0) {
      sets.push("description = ?");
      params.push(description);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (sets.length) {
      const sql = `UPDATE parent_categories SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Parent category not found" }, 404);
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO parent_categories_translations(parent_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(parent_id, locale) DO UPDATE SET
          name=COALESCE(excluded.name, name),
          description=COALESCE(excluded.description, description),
          updated_at=CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null).run();
      }
    }
    const locale = getLocale$5(c);
    const parent = await c.env.DB.prepare(
      `SELECT
           pc.id,
           COALESCE(pct.name, pc.name)          AS name,
           pc.slug,
           COALESCE(pct.description, pc.description) AS description,
           pc.image_url,
           pc.created_at
         FROM parent_categories pc
         LEFT JOIN parent_categories_translations pct
           ON pct.parent_id = pc.id AND pct.locale = ?
         WHERE pc.id = ?`
    ).bind(locale, id).first();
    return c.json({ parent, source: "database", locale });
  } catch (err) {
    console.error("Error updating parent category:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug or Name already exists" : "Failed to update parent category";
    return c.json({ error: msg }, 500);
  }
});
parentsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$5(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }
    const upsertT = `
      INSERT INTO parent_categories_translations(parent_id, locale, name, description)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(parent_id, locale) DO UPDATE SET
        name=COALESCE(excluded.name, name),
        description=COALESCE(excluded.description, description),
        updated_at=CURRENT_TIMESTAMP
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null).run();
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting parent translations:", err);
    const msg = "Failed to upsert translations";
    return c.json({ error: msg }, 500);
  }
});
parentsRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$5(c.env)) return c.json({ error: "Database not available" }, 503);
    const sql = `
      SELECT locale, name, description
      FROM parent_categories_translations
      WHERE parent_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        name: row.name || "",
        description: row.description || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching parent translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});
parentsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$5(c.env)) return c.json({ error: "Database not available" }, 503);
    const existing = await c.env.DB.prepare("SELECT id FROM parent_categories WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ error: "Parent category not found" }, 404);
    const res = await c.env.DB.prepare("DELETE FROM parent_categories WHERE id = ?").bind(id).run();
    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Parent category deleted successfully" });
    }
    return c.json({ error: "Parent category not found" }, 404);
  } catch (err) {
    console.error("Error deleting parent category:", err);
    return c.json({ error: "Failed to delete parent category" }, 500);
  }
});
parentsRouter.get("/:slug/products", async (c) => {
  const slug = c.req.param("slug");
  try {
    if (!hasDB$5(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const sql = `
      SELECT
        p.*,
        s.id   AS subcategory_id,
        s.name AS subcategory_name,
        s.slug AS subcategory_slug,
        pc.id  AS parent_id,
        pc.name AS parent_name,
        pc.slug AS parent_slug
      FROM products p
      JOIN subcategories s      ON s.id = p.subcategory_id
      JOIN parent_categories pc ON pc.id = s.parent_id
      WHERE pc.slug = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(slug).all();
    const products = res?.results ?? [];
    return c.json({ products, count: products.length, source: "database" });
  } catch (err) {
    console.error("Error fetching products by parent category:", err);
    return c.json({ error: "Failed to fetch products by parent category" }, 500);
  }
});
parentsRouter.get("/:idOrSlug/subcategories", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB$5(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale$5(c);
    const isNumeric = /^\d+$/.test(idOrSlug);
    const findSql = `
      SELECT id FROM parent_categories
      WHERE ${isNumeric ? "id = ?" : "slug = ?"}
      LIMIT 1
    `;
    const row = await c.env.DB.prepare(findSql).bind(isNumeric ? Number(idOrSlug) : idOrSlug).first();
    if (!row?.id) return c.json({ subcategories: [], count: 0, locale });
    const subsSql = `
      SELECT
        sc.id,
        sc.parent_id,
        COALESCE(sct.name, sc.name) AS name,
        sc.slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at
      FROM subcategories sc
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = sc.id AND sct.locale = ?
      WHERE sc.parent_id = ?
      ORDER BY sc.created_at DESC
    `;
    const res = await c.env.DB.prepare(subsSql).bind(locale, row.id).all();
    const subcategories = res?.results ?? [];
    return c.json({ subcategories, count: subcategories.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching subcategories of parent:", err);
    return c.json({ error: "Failed to fetch subcategories" }, 500);
  }
});
const DEFAULT_LOCALE$4 = "vi";
const getLocale$4 = (c) => (c.req.query("locale") || DEFAULT_LOCALE$4).toLowerCase();
const hasDB$4 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const slugify$1 = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const subCategoriesRouter = new Hono2();
subCategoriesRouter.get("/", async (c) => {
  const { parent_id, parent_slug, limit, offset, q, with_counts } = c.req.query();
  try {
    if (!hasDB$4(c.env)) {
      return c.json({ subcategories: [], source: "fallback", count: 0 });
    }
    const locale = getLocale$4(c);
    const conds = [];
    const params = [locale, locale];
    if (parent_id) {
      conds.push("sc.parent_id = ?");
      params.push(Number(parent_id));
    }
    if (parent_slug) {
      conds.push("pc.slug = ?");
      params.push(String(parent_slug));
    }
    if (q && q.trim()) {
      const kw = `%${q.trim()}%`;
      conds.push(`(
        (sct.name IS NOT NULL AND sct.name LIKE ?)
        OR (sct.description IS NOT NULL AND sct.description LIKE ?)
        OR (sct.name IS NULL AND sc.name LIKE ?)
        OR (sct.description IS NULL AND sc.description LIKE ?)
      )`);
      params.push(kw, kw, kw, kw);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";
    if (hasLimit) params.push(Number(limit));
    if (hasOffset) params.push(Number(offset));
    const sql = `
      SELECT
        sc.id,
        sc.parent_id,
        COALESCE(sct.name, sc.name) AS name,
        sc.slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at,
        COALESCE(pct.name, pc.name) AS parent_name,
        pc.slug AS parent_slug
      FROM subcategories sc
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = sc.id AND sct.locale = ?
      JOIN parent_categories pc ON pc.id = sc.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      ${where}
      ORDER BY sc.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;
    const result = await c.env.DB.prepare(sql).bind(...params).all();
    let subcategories = result?.results ?? [];
    if (String(with_counts) === "1" && subcategories.length) {
      const ids = subcategories.map((s) => s.id);
      const placeholders = ids.map(() => "?").join(",");
      const cntSql = `
        SELECT sc.id AS sub_id, COUNT(p.id) AS product_count
        FROM subcategories sc
        LEFT JOIN products p ON p.subcategory_id = sc.id
        WHERE sc.id IN (${placeholders})
        GROUP BY sc.id
      `;
      const cntRes = await c.env.DB.prepare(cntSql).bind(...ids).all();
      const counts = (cntRes?.results ?? []).reduce((acc, r) => {
        acc[r.sub_id] = r.product_count || 0;
        return acc;
      }, {});
      subcategories = subcategories.map((s) => ({ ...s, product_count: counts[s.id] || 0 }));
    }
    return c.json({
      subcategories,
      count: subcategories.length,
      source: "database",
      locale
    });
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    return c.json({ error: "Failed to fetch subcategories" }, 500);
  }
});
subCategoriesRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  const { with_counts } = c.req.query();
  try {
    if (!hasDB$4(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale$4(c);
    const isNumeric = /^\d+$/.test(idOrSlug);
    const sql = `
      SELECT
        sc.id,
        sc.parent_id,
        COALESCE(sct.name, sc.name) AS name,
        sc.slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at,
        COALESCE(pct.name, pc.name) AS parent_name,
        pc.slug AS parent_slug
      FROM subcategories sc
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = sc.id AND sct.locale = ?
      JOIN parent_categories pc ON pc.id = sc.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      WHERE ${isNumeric ? "sc.id = ?" : "sc.slug = ?"}
      LIMIT 1
    `;
    const subcat = await c.env.DB.prepare(sql).bind(locale, locale, isNumeric ? Number(idOrSlug) : idOrSlug).first();
    if (!subcat) return c.json({ error: "Subcategory not found" }, 404);
    if (String(with_counts) === "1") {
      const cnt = await c.env.DB.prepare(`SELECT COUNT(*) AS product_count FROM products WHERE subcategory_id = ?`).bind(subcat.id).first();
      subcat.product_count = Number(cnt?.product_count || 0);
    }
    return c.json({ subcategory: subcat, source: "database", locale });
  } catch (err) {
    console.error("Error fetching subcategory:", err);
    return c.json({ error: "Failed to fetch subcategory" }, 500);
  }
});
subCategoriesRouter.post("/", async (c) => {
  try {
    if (!hasDB$4(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const { parent_id, name, slug: rawSlug, description, image_url, translations } = body || {};
    if (!parent_id) return c.json({ error: "Missing required field: parent_id" }, 400);
    if (!name?.trim()) return c.json({ error: "Missing required field: name" }, 400);
    const parent = await c.env.DB.prepare("SELECT id FROM parent_categories WHERE id = ?").bind(Number(parent_id)).first();
    if (!parent) return c.json({ error: "parent_id not found" }, 400);
    const slug = (rawSlug?.trim() || slugify$1(name)).toLowerCase();
    const sql = `
      INSERT INTO subcategories (parent_id, name, slug, description, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    const res = await c.env.DB.prepare(sql).bind(
      Number(parent_id),
      name.trim(),
      slug,
      description || null,
      image_url || null
    ).run();
    if (!res.success) throw new Error("Insert failed");
    const newId = res.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO subcategories_translations(sub_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(sub_id, locale) DO UPDATE SET
          name=COALESCE(excluded.name, name),
          description=COALESCE(excluded.description, description),
          updated_at=CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(newId, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null).run();
      }
    }
    const locale = getLocale$4(c);
    const subcat = await c.env.DB.prepare(
      `SELECT
           sc.id,
           sc.parent_id,
           COALESCE(sct.name, sc.name) AS name,
           sc.slug,
           COALESCE(sct.description, sc.description) AS description,
           sc.image_url,
           sc.created_at,
           COALESCE(pct.name, pc.name) AS parent_name,
           pc.slug AS parent_slug
         FROM subcategories sc
         LEFT JOIN subcategories_translations sct
           ON sct.sub_id = sc.id AND sct.locale = ?
         JOIN parent_categories pc ON pc.id = sc.parent_id
         LEFT JOIN parent_categories_translations pct
           ON pct.parent_id = pc.id AND pct.locale = ?
         WHERE sc.id = ?`
    ).bind(locale, locale, newId).first();
    return c.json({ subcategory: subcat, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error creating subcategory:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Name or Slug already exists in this parent" : "Failed to create subcategory";
    return c.json({ error: msg }, 500);
  }
});
subCategoriesRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$4(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const { parent_id, name, slug, description, image_url, translations } = body || {};
    if (parent_id !== void 0 && parent_id !== null) {
      const parent = await c.env.DB.prepare("SELECT id FROM parent_categories WHERE id = ?").bind(Number(parent_id)).first();
      if (!parent) return c.json({ error: "parent_id not found" }, 400);
    }
    const sets = [];
    const params = [];
    if (parent_id !== void 0) {
      sets.push("parent_id = ?");
      params.push(parent_id === null ? null : Number(parent_id));
    }
    if (name !== void 0) {
      sets.push("name = ?");
      params.push(name);
    }
    if (slug !== void 0) {
      sets.push("slug = ?");
      params.push(slug);
    }
    if (description !== void 0) {
      sets.push("description = ?");
      params.push(description);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (sets.length) {
      const sql = `UPDATE subcategories SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Subcategory not found" }, 404);
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO subcategories_translations(sub_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(sub_id, locale) DO UPDATE SET
          name=COALESCE(excluded.name, name),
          description=COALESCE(excluded.description, description),
          updated_at=CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null).run();
      }
    }
    const locale = getLocale$4(c);
    const subcat = await c.env.DB.prepare(
      `SELECT
           sc.id,
           sc.parent_id,
           COALESCE(sct.name, sc.name) AS name,
           sc.slug,
           COALESCE(sct.description, sc.description) AS description,
           sc.image_url,
           sc.created_at,
           COALESCE(pct.name, pc.name) AS parent_name,
           pc.slug AS parent_slug
         FROM subcategories sc
         LEFT JOIN subcategories_translations sct
           ON sct.sub_id = sc.id AND sct.locale = ?
         JOIN parent_categories pc ON pc.id = sc.parent_id
         LEFT JOIN parent_categories_translations pct
           ON pct.parent_id = pc.id AND pct.locale = ?
         WHERE sc.id = ?`
    ).bind(locale, locale, id).first();
    return c.json({ subcategory: subcat, source: "database", locale });
  } catch (err) {
    console.error("Error updating subcategory:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Name or Slug already exists in this parent" : "Failed to update subcategory";
    return c.json({ error: msg }, 500);
  }
});
subCategoriesRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$4(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }
    const upsertT = `
      INSERT INTO subcategories_translations(sub_id, locale, name, description)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(sub_id, locale) DO UPDATE SET
        name=COALESCE(excluded.name, name),
        description=COALESCE(excluded.description, description),
        updated_at=CURRENT_TIMESTAMP
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null).run();
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting subcategory translations:", err);
    return c.json({ error: "Failed to upsert translations" }, 500);
  }
});
subCategoriesRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$4(c.env)) return c.json({ error: "Database not available" }, 503);
    const sql = `
      SELECT locale, name, description
      FROM subcategories_translations
      WHERE sub_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        name: row.name || "",
        description: row.description || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching subcategory translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});
subCategoriesRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$4(c.env)) return c.json({ error: "Database not available" }, 503);
    const existing = await c.env.DB.prepare("SELECT id FROM subcategories WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ error: "Subcategory not found" }, 404);
    const res = await c.env.DB.prepare("DELETE FROM subcategories WHERE id = ?").bind(id).run();
    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Subcategory deleted successfully" });
    }
    return c.json({ error: "Subcategory not found" }, 404);
  } catch (err) {
    console.error("Error deleting subcategory:", err);
    return c.json({ error: "Failed to delete subcategory" }, 500);
  }
});
subCategoriesRouter.get("/:slug/products", async (c) => {
  const slug = c.req.param("slug");
  try {
    if (!hasDB$4(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const locale = getLocale$4(c);
    const sql = `
      SELECT
        p.id,
        COALESCE(pt.title, p.title)               AS title,
        p.slug                                    AS product_slug,
        COALESCE(pt.description, p.description)   AS description,
        COALESCE(pt.content, p.content)           AS content,
        p.image_url,
        p.created_at,
        p.updated_at,
        s.id      AS subcategory_id,
        COALESCE(sct.name, s.name) AS subcategory_name,
        s.slug    AS subcategory_slug,
        pc.id     AS parent_id,
        COALESCE(pct.name, pc.name) AS parent_name,
        pc.slug   AS parent_slug
      FROM products p
      LEFT JOIN products_translations pt
        ON pt.product_id = p.id AND pt.locale = ?
      JOIN subcategories s
        ON s.id = p.subcategory_id
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = s.id AND sct.locale = ?
      JOIN parent_categories pc
        ON pc.id = s.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      WHERE s.slug = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(locale, locale, locale, slug).all();
    const products = res?.results ?? [];
    return c.json({ products, count: products.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching products by subcategory:", err);
    return c.json({ error: "Failed to fetch products by subcategory" }, 500);
  }
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
function encodeBase64(input) {
  if (Uint8Array.prototype.toBase64) {
    return input.toBase64();
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}
function decodeBase64(encoded) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(encoded);
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function decode(input) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), {
      alphabet: "base64url"
    });
  }
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}
function encode(input) {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  if (Uint8Array.prototype.toBase64) {
    return unencoded.toBase64({ alphabet: "base64url", omitPadding: true });
  }
  return encodeBase64(unencoded).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
class JOSEError extends Error {
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
class JWTClaimValidationFailed extends JOSEError {
  static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
}
class JWTExpired extends JOSEError {
  static code = "ERR_JWT_EXPIRED";
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
}
class JOSENotSupported extends JOSEError {
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
}
class JWSInvalid extends JOSEError {
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
}
class JWTInvalid extends JOSEError {
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
}
class JWSSignatureVerificationFailed extends JOSEError {
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
}
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage)) {
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
  }
}
function checkSigCryptoKey(key, alg, usage) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "Ed25519":
    case "EdDSA": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usage);
}
function message(msg, actual, ...types) {
  types = types.filter(Boolean);
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else if (types.length === 2) {
    msg += `one of type ${types[0]} or ${types[1]}.`;
  } else {
    msg += `of type ${types[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
const invalidKeyInput = (actual, ...types) => {
  return message("Key must be ", actual, ...types);
};
function withAlg(alg, actual, ...types) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types);
}
function isCryptoKey(key) {
  return key?.[Symbol.toStringTag] === "CryptoKey";
}
function isKeyObject(key) {
  return key?.[Symbol.toStringTag] === "KeyObject";
}
const isKeyLike = (key) => {
  return isCryptoKey(key) || isKeyObject(key);
};
const isDisjoint = (...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
};
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
const isObject = (input) => {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
};
const checkKeyLength = (alg, key) => {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
};
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
        case "EdDSA":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
const importJWK = async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return crypto.subtle.importKey("jwk", keyData, algorithm, jwk.ext ?? (jwk.d ? false : true), jwk.key_ops ?? keyUsages);
};
const validateCrit = (Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) => {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
};
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
function isSecretJWK(key) {
  return key.kty === "oct" && typeof key.k === "string";
}
let cache;
const handleJWK = async (key, jwk, alg, freeze = false) => {
  cache ||= /* @__PURE__ */ new WeakMap();
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await importJWK({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
};
const handleKeyObject = (keyObject, alg) => {
  cache ||= /* @__PURE__ */ new WeakMap();
  let cached = cache.get(keyObject);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const isPublic = keyObject.type === "public";
  const extractable = isPublic ? true : false;
  let cryptoKey;
  if (keyObject.asymmetricKeyType === "x25519") {
    switch (alg) {
      case "ECDH-ES":
      case "ECDH-ES+A128KW":
      case "ECDH-ES+A192KW":
      case "ECDH-ES+A256KW":
        break;
      default:
        throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : ["deriveBits"]);
  }
  if (keyObject.asymmetricKeyType === "ed25519") {
    if (alg !== "EdDSA" && alg !== "Ed25519") {
      throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
      isPublic ? "verify" : "sign"
    ]);
  }
  if (keyObject.asymmetricKeyType === "rsa") {
    let hash;
    switch (alg) {
      case "RSA-OAEP":
        hash = "SHA-1";
        break;
      case "RS256":
      case "PS256":
      case "RSA-OAEP-256":
        hash = "SHA-256";
        break;
      case "RS384":
      case "PS384":
      case "RSA-OAEP-384":
        hash = "SHA-384";
        break;
      case "RS512":
      case "PS512":
      case "RSA-OAEP-512":
        hash = "SHA-512";
        break;
      default:
        throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    if (alg.startsWith("RSA-OAEP")) {
      return keyObject.toCryptoKey({
        name: "RSA-OAEP",
        hash
      }, extractable, isPublic ? ["encrypt"] : ["decrypt"]);
    }
    cryptoKey = keyObject.toCryptoKey({
      name: alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5",
      hash
    }, extractable, [isPublic ? "verify" : "sign"]);
  }
  if (keyObject.asymmetricKeyType === "ec") {
    const nist = /* @__PURE__ */ new Map([
      ["prime256v1", "P-256"],
      ["secp384r1", "P-384"],
      ["secp521r1", "P-521"]
    ]);
    const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
    if (!namedCurve) {
      throw new TypeError("given KeyObject instance cannot be used for this algorithm");
    }
    if (alg === "ES256" && namedCurve === "P-256") {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDSA",
        namedCurve
      }, extractable, [isPublic ? "verify" : "sign"]);
    }
    if (alg === "ES384" && namedCurve === "P-384") {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDSA",
        namedCurve
      }, extractable, [isPublic ? "verify" : "sign"]);
    }
    if (alg === "ES512" && namedCurve === "P-521") {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDSA",
        namedCurve
      }, extractable, [isPublic ? "verify" : "sign"]);
    }
    if (alg.startsWith("ECDH-ES")) {
      cryptoKey = keyObject.toCryptoKey({
        name: "ECDH",
        namedCurve
      }, extractable, isPublic ? [] : ["deriveBits"]);
    }
  }
  if (!cryptoKey) {
    throw new TypeError("given KeyObject instance cannot be used for this algorithm");
  }
  if (!cached) {
    cache.set(keyObject, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
};
const normalizeKey = async (key, alg) => {
  if (key instanceof Uint8Array) {
    return key;
  }
  if (isCryptoKey(key)) {
    return key;
  }
  if (isKeyObject(key)) {
    if (key.type === "secret") {
      return key.export();
    }
    if ("toCryptoKey" in key && typeof key.toCryptoKey === "function") {
      try {
        return handleKeyObject(key, alg);
      } catch (err) {
        if (err instanceof TypeError) {
          throw err;
        }
      }
    }
    let jwk = key.export({ format: "jwk" });
    return handleJWK(key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k) {
      return decode(key.k);
    }
    return handleJWK(key, key, alg, true);
  }
  throw new Error("unreachable");
};
const tag = (key) => key?.[Symbol.toStringTag];
const jwkMatchesOp = (alg, key, usage) => {
  if (key.use !== void 0) {
    let expected;
    switch (usage) {
      case "sign":
      case "verify":
        expected = "sig";
        break;
      case "encrypt":
      case "decrypt":
        expected = "enc";
        break;
    }
    if (key.use !== expected) {
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
    }
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  }
  if (Array.isArray(key.key_ops)) {
    let expectedKeyOp;
    switch (true) {
      case (usage === "sign" || usage === "verify"):
      case alg === "dir":
      case alg.includes("CBC-HS"):
        expectedKeyOp = usage;
        break;
      case alg.startsWith("PBES2"):
        expectedKeyOp = "deriveBits";
        break;
      case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
        if (!alg.includes("GCM") && alg.endsWith("KW")) {
          expectedKeyOp = usage === "encrypt" ? "wrapKey" : "unwrapKey";
        } else {
          expectedKeyOp = usage;
        }
        break;
      case (usage === "encrypt" && alg.startsWith("RSA")):
        expectedKeyOp = "wrapKey";
        break;
      case usage === "decrypt":
        expectedKeyOp = alg.startsWith("RSA") ? "unwrapKey" : "deriveBits";
        break;
    }
    if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
    }
  }
  return true;
};
const symmetricTypeCheck = (alg, key, usage) => {
  if (key instanceof Uint8Array)
    return;
  if (isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!isKeyLike(key)) {
    throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
};
const asymmetricTypeCheck = (alg, key, usage) => {
  if (isJWK(key)) {
    switch (usage) {
      case "decrypt":
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "encrypt":
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!isKeyLike(key)) {
    throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key"));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (key.type === "public") {
    switch (usage) {
      case "sign":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
      case "decrypt":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
    }
  }
  if (key.type === "private") {
    switch (usage) {
      case "verify":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
      case "encrypt":
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
    }
  }
};
const checkKeyType = (alg, key, usage) => {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A(?:128|192|256)(?:GCM)?(?:KW)?$/.test(alg) || /^A(?:128|192|256)CBC-HS(?:256|384|512)$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage);
  } else {
    asymmetricTypeCheck(alg, key, usage);
  }
};
const subtleAlgorithm = (alg, algorithm) => {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: parseInt(alg.slice(-3), 10) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
    case "EdDSA":
      return { name: "Ed25519" };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
};
const getSignKey = async (alg, key, usage) => {
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "JSON Web Key"));
    }
    return crypto.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  checkSigCryptoKey(key, alg, usage);
  return key;
};
const verify = async (alg, key, signature, data) => {
  const cryptoKey = await getSignKey(alg, key, "verify");
  checkKeyLength(alg, cryptoKey);
  const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm);
  try {
    return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
};
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!isDisjoint(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
  }
  checkKeyType(alg, key, "verify");
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const k = await normalizeKey(key, alg);
  const verified = await verify(alg, k, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key: k };
  }
  return result;
}
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
const epoch = (date) => Math.floor(date.getTime() / 1e3);
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
const secs = (str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
};
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
const normalizeTyp = (value) => {
  if (value.includes("/")) {
    return value.toLowerCase();
  }
  return `application/${value.toLowerCase()}`;
};
const checkAudiencePresence = (audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
};
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}
class JWTClaimsBuilder {
  #payload;
  constructor(payload) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this.#payload = structuredClone(payload);
  }
  data() {
    return encoder.encode(JSON.stringify(this.#payload));
  }
  get iss() {
    return this.#payload.iss;
  }
  set iss(value) {
    this.#payload.iss = value;
  }
  get sub() {
    return this.#payload.sub;
  }
  set sub(value) {
    this.#payload.sub = value;
  }
  get aud() {
    return this.#payload.aud;
  }
  set aud(value) {
    this.#payload.aud = value;
  }
  set jti(value) {
    this.#payload.jti = value;
  }
  set nbf(value) {
    if (typeof value === "number") {
      this.#payload.nbf = validateInput("setNotBefore", value);
    } else if (value instanceof Date) {
      this.#payload.nbf = validateInput("setNotBefore", epoch(value));
    } else {
      this.#payload.nbf = epoch(/* @__PURE__ */ new Date()) + secs(value);
    }
  }
  set exp(value) {
    if (typeof value === "number") {
      this.#payload.exp = validateInput("setExpirationTime", value);
    } else if (value instanceof Date) {
      this.#payload.exp = validateInput("setExpirationTime", epoch(value));
    } else {
      this.#payload.exp = epoch(/* @__PURE__ */ new Date()) + secs(value);
    }
  }
  set iat(value) {
    if (typeof value === "undefined") {
      this.#payload.iat = epoch(/* @__PURE__ */ new Date());
    } else if (value instanceof Date) {
      this.#payload.iat = validateInput("setIssuedAt", epoch(value));
    } else if (typeof value === "string") {
      this.#payload.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value));
    } else {
      this.#payload.iat = validateInput("setIssuedAt", value);
    }
  }
}
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
const sign = async (alg, key, data) => {
  const cryptoKey = await getSignKey(alg, key, "sign");
  checkKeyLength(alg, cryptoKey);
  const signature = await crypto.subtle.sign(subtleAlgorithm(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
};
class FlattenedSign {
  #payload;
  #protectedHeader;
  #unprotectedHeader;
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this.#payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    if (this.#protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this.#protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this.#unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this.#unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this.#protectedHeader && !this.#unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!isDisjoint(this.#protectedHeader, this.#unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this.#protectedHeader,
      ...this.#unprotectedHeader
    };
    const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this.#protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this.#protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    checkKeyType(alg, key, "sign");
    let payload = this.#payload;
    if (b64) {
      payload = encoder.encode(encode(payload));
    }
    let protectedHeader;
    if (this.#protectedHeader) {
      protectedHeader = encoder.encode(encode(JSON.stringify(this.#protectedHeader)));
    } else {
      protectedHeader = encoder.encode("");
    }
    const data = concat(protectedHeader, encoder.encode("."), payload);
    const k = await normalizeKey(key, alg);
    const signature = await sign(alg, k, data);
    const jws = {
      signature: encode(signature),
      payload: ""
    };
    if (b64) {
      jws.payload = decoder.decode(payload);
    }
    if (this.#unprotectedHeader) {
      jws.header = this.#unprotectedHeader;
    }
    if (this.#protectedHeader) {
      jws.protected = decoder.decode(protectedHeader);
    }
    return jws;
  }
}
class CompactSign {
  #flattened;
  constructor(payload) {
    this.#flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this.#flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this.#flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
}
class SignJWT {
  #protectedHeader;
  #jwt;
  constructor(payload = {}) {
    this.#jwt = new JWTClaimsBuilder(payload);
  }
  setIssuer(issuer) {
    this.#jwt.iss = issuer;
    return this;
  }
  setSubject(subject) {
    this.#jwt.sub = subject;
    return this;
  }
  setAudience(audience) {
    this.#jwt.aud = audience;
    return this;
  }
  setJti(jwtId) {
    this.#jwt.jti = jwtId;
    return this;
  }
  setNotBefore(input) {
    this.#jwt.nbf = input;
    return this;
  }
  setExpirationTime(input) {
    this.#jwt.exp = input;
    return this;
  }
  setIssuedAt(input) {
    this.#jwt.iat = input;
    return this;
  }
  setProtectedHeader(protectedHeader) {
    this.#protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(this.#jwt.data());
    sig.setProtectedHeader(this.#protectedHeader);
    if (Array.isArray(this.#protectedHeader?.crit) && this.#protectedHeader.crit.includes("b64") && this.#protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
}
const enc$1 = new TextEncoder();
const getKey$1 = (secret) => enc$1.encode(secret);
const nowSec$1 = () => Math.floor(Date.now() / 1e3);
const bearer = (h) => h?.startsWith("Bearer ") ? h.slice(7) : null;
const auth = async (c, next) => {
  try {
    const token = bearer(c.req.header("Authorization"));
    if (!token) return c.json({ error: "Unauthorized" }, 401);
    if (!c.env.DB_AVAILABLE) return c.json({ error: "Database not available" }, 503);
    const { payload } = await jwtVerify(token, getKey$1(c.env.JWT_SECRET));
    const { jti } = payload;
    const row = await c.env.DB.prepare(
      "SELECT revoked, expires_at FROM sessions WHERE jti = ?"
    ).bind(jti).first();
    if (!row) return c.json({ error: "Invalid session. Please log in again." }, 401);
    if (row.revoked) return c.json({ error: "Token revoked. Please log in again." }, 401);
    if (!row.expires_at || row.expires_at < nowSec$1()) return c.json({ error: "Token expired. Please log in again." }, 401);
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
const enc = new TextEncoder();
const getKey = (secret) => enc.encode(secret);
const nowSec = () => Math.floor(Date.now() / 1e3);
const authRouter = new Hono2();
authRouter.post("/login", async (c) => {
  try {
    console.log("Login attempt started");
    if (!c.env.DB_AVAILABLE) {
      console.error("Database not available");
      return c.json({ error: "Database not available" }, 503);
    }
    if (!c.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return c.json({ error: "Server configuration error" }, 500);
    }
    const { email, password } = await c.req.json();
    console.log("Login data received:", { email, hasPassword: !!password });
    if (!email || !password) {
      console.log("Missing email or password");
      return c.json({ error: "Missing email/password" }, 400);
    }
    console.log("Querying user from database...");
    const user = await c.env.DB.prepare(
      "SELECT id, name, email, password, role FROM users WHERE email = ?"
    ).bind(email).first();
    console.log("User query result:", user ? { id: user.id, email: user.email, role: user.role } : "No user found");
    if (!user) {
      console.log("User not found for email:", email);
      return c.json({ error: "Invalid credentials" }, 401);
    }
    console.log("Comparing passwords...");
    console.log("Input password:", password);
    console.log("Stored password:", user.password);
    if (password !== user.password) {
      console.log("Password mismatch");
      return c.json({ error: "Invalid credentials" }, 401);
    }
    console.log("Password match successful, generating JWT...");
    const maxAgeSec = Number(c.env.JWT_EXPIRES_IN ?? 900);
    const jti = crypto.randomUUID();
    const iat = nowSec();
    const exp = iat + maxAgeSec;
    console.log("JWT config:", { maxAgeSec, jti, iat, exp });
    console.log("Ensuring sessions table exists...");
    await c.env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                jti TEXT NOT NULL UNIQUE,
                expires_at INTEGER NOT NULL,
                revoked INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s','now'))
            )
        `).run();
    console.log("Inserting session...");
    const sessionResult = await c.env.DB.prepare(
      "INSERT INTO sessions (user_id, jti, expires_at, revoked) VALUES (?, ?, ?, 0)"
    ).bind(user.id, jti, exp).run();
    console.log("Session insert result:", sessionResult);
    console.log("Creating JWT token...");
    const token = await new SignJWT({
      sub: String(user.id),
      email: user.email,
      role: user.role,
      // ← role lấy từ DB
      name: user.name,
      jti
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt(iat).setExpirationTime(exp).sign(getKey(c.env.JWT_SECRET));
    console.log("Login successful for user:", user.email);
    return c.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: maxAgeSec,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    console.error("Login error:", e);
    console.error("Error name:", e.name);
    console.error("Error message:", e.message);
    console.error("Error stack:", e.stack);
    return c.json({
      error: "Login failed",
      details: e.message,
      type: e.name
    }, 500);
  }
});
authRouter.post("/admin/login", async (c) => {
  try {
    const url = new URL("/api/auth/login", c.req.url);
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await c.req.text()
      // giữ nguyên body FE gửi lên
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return c.json({ message: data?.error || data?.message || "Login failed" }, res.status);
    }
    return c.json({ token: data.access_token }, 200);
  } catch (err) {
    console.error("Alias /admin/login error:", err);
    return c.json({ message: "Internal server error" }, 500);
  }
});
authRouter.get("/me", auth, (c) => {
  return c.json({ authenticated: true, user: c.get("user") });
});
authRouter.post("/logout", auth, async (c) => {
  try {
    const { jti } = c.get("user");
    await c.env.DB.prepare("UPDATE sessions SET revoked = 1 WHERE jti = ?").bind(jti).run();
    return c.json({ success: true });
  } catch (e) {
    console.error("Logout error:", e);
    return c.json({ error: "Logout failed" }, 500);
  }
});
const DEFAULT_LOCALE$3 = "vi";
const getLocale$3 = (c) => (c.req.query("locale") || DEFAULT_LOCALE$3).toLowerCase();
const hasDB$3 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const slugify = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const findProductByIdOrSlug = async (db, idOrSlug, locale) => {
  const isNumericId = /^\d+$/.test(idOrSlug);
  const sql = `
    SELECT
      p.id,
      COALESCE(pt.title, p.title)             AS title,
      p.slug                                  AS slug,
      COALESCE(pt.description, p.description) AS description,
      COALESCE(pt.content, p.content)         AS content,
      p.image_url,
      p.created_at,
      p.updated_at,

      s.id                                    AS subcategory_id,
      COALESCE(sct.name, s.name)              AS subcategory_name,
      s.slug                                  AS subcategory_slug,

      pc.id                                   AS parent_id,
      COALESCE(pct.name, pc.name)             AS parent_name,
      pc.slug                                 AS parent_slug
    FROM products p
    LEFT JOIN products_translations pt
      ON pt.product_id = p.id AND pt.locale = ?
    LEFT JOIN subcategories s
      ON s.id = p.subcategory_id
    LEFT JOIN subcategories_translations sct
      ON sct.sub_id = s.id AND sct.locale = ?
    LEFT JOIN parent_categories pc
      ON pc.id = s.parent_id
    LEFT JOIN parent_categories_translations pct
      ON pct.parent_id = pc.id AND pct.locale = ?
    WHERE ${isNumericId ? "p.id = ?" : "p.slug = ?"}
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, locale, locale, isNumericId ? Number(idOrSlug) : idOrSlug).first();
};
const productsRouter = new Hono2();
productsRouter.get("/", async (c) => {
  const { parent_id, parent_slug, subcategory_id, sub_slug, limit, offset, q } = c.req.query();
  try {
    if (!hasDB$3(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const locale = getLocale$3(c);
    const params = [locale, locale, locale];
    const conds = [];
    if (subcategory_id) {
      conds.push("p.subcategory_id = ?");
      params.push(Number(subcategory_id));
    }
    if (sub_slug) {
      conds.push("s.slug = ?");
      params.push(String(sub_slug));
    }
    if (parent_id) {
      conds.push("pc.id = ?");
      params.push(Number(parent_id));
    }
    if (parent_slug) {
      conds.push("pc.slug = ?");
      params.push(String(parent_slug));
    }
    if (q && q.trim()) {
      const kw = `%${q.trim()}%`;
      conds.push(`(
        (pt.title IS NOT NULL AND pt.title LIKE ?)
        OR (pt.description IS NOT NULL AND pt.description LIKE ?)
        OR (pt.content IS NOT NULL AND pt.content LIKE ?)
        OR (pt.title IS NULL AND p.title LIKE ?)
        OR (pt.description IS NULL AND p.description LIKE ?)
        OR (pt.content IS NULL AND p.content LIKE ?)
      )`);
      params.push(kw, kw, kw, kw, kw, kw);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";
    if (hasLimit) params.push(Number(limit));
    if (hasOffset) params.push(Number(offset));
    const sql = `
      SELECT
        p.id,
        COALESCE(pt.title, p.title)             AS title,
        p.slug                                  AS slug,
        COALESCE(pt.description, p.description) AS description,
        COALESCE(pt.content, p.content)         AS content,
        p.image_url,
        p.created_at,
        p.updated_at,

        s.id                                    AS subcategory_id,
        COALESCE(sct.name, s.name)              AS subcategory_name,
        s.slug                                  AS subcategory_slug,

        pc.id                                   AS parent_id,
        COALESCE(pct.name, pc.name)             AS parent_name,
        pc.slug                                 AS parent_slug
      FROM products p
      LEFT JOIN products_translations pt
        ON pt.product_id = p.id AND pt.locale = ?
      LEFT JOIN subcategories s
        ON s.id = p.subcategory_id
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = s.id AND sct.locale = ?
      LEFT JOIN parent_categories pc
        ON pc.id = s.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      ${where}
      ORDER BY p.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;
    const result = await c.env.DB.prepare(sql).bind(...params).all();
    const products = result?.results ?? [];
    return c.json({
      products,
      count: products.length,
      source: "database",
      locale
      // debug: { sql, params }
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});
productsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB$3(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale$3(c);
    const product = await findProductByIdOrSlug(c.env.DB, idOrSlug, locale);
    if (!product) return c.json({ error: "Product not found" }, 404);
    return c.json({ product, source: "database", locale });
  } catch (err) {
    console.error("Error fetching product:", err);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});
productsRouter.post("/", async (c) => {
  try {
    if (!hasDB$3(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const {
      title: title2,
      slug: rawSlug,
      description,
      content,
      image_url,
      subcategory_id,
      translations
    } = body || {};
    if (!title2?.trim() || !content?.trim()) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }
    const slug = (rawSlug?.trim() || slugify(title2)).toLowerCase();
    if (subcategory_id !== void 0 && subcategory_id !== null) {
      const sub = await c.env.DB.prepare("SELECT id FROM subcategories WHERE id = ?").bind(Number(subcategory_id)).first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }
    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, subcategory_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB.prepare(sql).bind(
      title2.trim(),
      slug,
      description || null,
      content,
      image_url || null,
      subcategory_id == null ? null : Number(subcategory_id)
    ).run();
    if (!runRes.success) throw new Error("Insert failed");
    const newId = runRes.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO products_translations(product_id, locale, title, description, content)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title       = COALESCE(excluded.title, title),
          description = COALESCE(excluded.description, description),
          content     = COALESCE(excluded.content, content),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          newId,
          String(lc).toLowerCase(),
          tr?.title ?? null,
          tr?.description ?? null,
          tr?.content ?? null
        ).run();
      }
    }
    const locale = getLocale$3(c);
    const product = await findProductByIdOrSlug(c.env.DB, String(newId), locale);
    return c.json({ product, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error adding product:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug already exists" : "Failed to add product";
    return c.json({ error: msg }, 500);
  }
});
productsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$3(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const {
      title: title2,
      slug,
      description,
      content,
      image_url,
      subcategory_id,
      translations
    } = body || {};
    if (subcategory_id !== void 0 && subcategory_id !== null) {
      const sub = await c.env.DB.prepare("SELECT id FROM subcategories WHERE id = ?").bind(Number(subcategory_id)).first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }
    const sets = [];
    const params = [];
    if (title2 !== void 0) {
      sets.push("title = ?");
      params.push(title2);
    }
    if (slug !== void 0) {
      sets.push("slug = ?");
      params.push(slug);
    }
    if (description !== void 0) {
      sets.push("description = ?");
      params.push(description);
    }
    if (content !== void 0) {
      sets.push("content = ?");
      params.push(content);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (subcategory_id !== void 0) {
      sets.push("subcategory_id = ?");
      params.push(subcategory_id == null ? null : Number(subcategory_id));
    }
    if (sets.length) {
      const sql = `
        UPDATE products
        SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Product not found" }, 404);
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO products_translations(product_id, locale, title, description, content)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title       = COALESCE(excluded.title, title),
          description = COALESCE(excluded.description, description),
          content     = COALESCE(excluded.content, content),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          id,
          String(lc).toLowerCase(),
          tr?.title ?? null,
          tr?.description ?? null,
          tr?.content ?? null
        ).run();
      }
    }
    const locale = getLocale$3(c);
    const product = await findProductByIdOrSlug(c.env.DB, String(id), locale);
    return c.json({ product, source: "database", locale });
  } catch (err) {
    console.error("Error updating product:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug already exists" : "Failed to update product";
    return c.json({ error: msg }, 500);
  }
});
productsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$3(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }
    const upsertT = `
      INSERT INTO products_translations(product_id, locale, title, description, content)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(product_id, locale) DO UPDATE SET
        title       = COALESCE(excluded.title, title),
        description = COALESCE(excluded.description, description),
        content     = COALESCE(excluded.content, content),
        updated_at  = CURRENT_TIMESTAMP
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(
        id,
        String(lc).toLowerCase(),
        tr?.title ?? null,
        tr?.description ?? null,
        tr?.content ?? null
      ).run();
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting product translations:", err);
    return c.json({ error: "Failed to upsert translations" }, 500);
  }
});
productsRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$3(c.env)) return c.json({ error: "Database not available" }, 503);
    const sql = `
      SELECT locale, title, description, content
      FROM products_translations
      WHERE product_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        title: row.title || "",
        description: row.description || "",
        content: row.content || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching product translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});
productsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$3(c.env)) return c.json({ error: "Database not available" }, 503);
    const existing = await c.env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ error: "Product not found" }, 404);
    const res = await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Product deleted successfully" });
    }
    return c.json({ error: "Product not found" }, 404);
  } catch (err) {
    console.error("Error deleting product:", err);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});
const contactRouter = new Hono2();
const bad$1 = (c, msg = "Bad Request", code = 400) => c.json({ ok: false, error: msg }, code);
const ok$1 = (c, data = {}, code = 200) => c.json({ ok: true, ...data }, code);
const isEmail$1 = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const validStatus = (s = "") => ["new", "reviewed", "closed"].includes(s);
contactRouter.get("/", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    ).all();
    return ok$1(c, { items: result.results });
  } catch (e) {
    console.error(e);
    return bad$1(c, "Failed to fetch contacts", 500);
  }
});
contactRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const fullName = (body.full_name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const address = (body.address || "").trim();
    const message2 = (body.message || "").trim();
    if (!fullName || !email || !message2)
      return bad$1(c, "fullName, email, message are required");
    if (!isEmail$1(email)) return bad$1(c, "Invalid email");
    const result = await c.env.DB.prepare(
      `INSERT INTO contact_messages (full_name, email, phone, address, message)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(fullName, email, phone, address, message2).run();
    const newItem = await c.env.DB.prepare(
      "SELECT * FROM contact_messages WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
    return ok$1(c, { item: newItem }, 201);
  } catch (e) {
    console.error(e);
    return bad$1(c, "Failed to create contact", 500);
  }
});
contactRouter.patch("/:id/status", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const { status } = await c.req.json();
    if (!validStatus(status))
      return bad$1(c, "Invalid status (new|reviewed|closed)");
    const res = await c.env.DB.prepare(
      "UPDATE contact_messages SET status = ? WHERE id = ?"
    ).bind(status, id).run();
    if ((res.meta?.changes || 0) === 0) return bad$1(c, "Not found", 404);
    const updated = await c.env.DB.prepare(
      "SELECT * FROM contact_messages WHERE id = ?"
    ).bind(id).first();
    return ok$1(c, { item: updated });
  } catch (e) {
    console.error(e);
    return bad$1(c, "Failed to update status", 500);
  }
});
contactRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const res = await c.env.DB.prepare(
      "DELETE FROM contact_messages WHERE id = ?"
    ).bind(id).run();
    if ((res.meta?.changes || 0) === 0) return bad$1(c, "Not found", 404);
    return ok$1(c, { deleted: true });
  } catch (e) {
    console.error(e);
    return bad$1(c, "Failed to delete contact", 500);
  }
});
const userRouter = new Hono2();
const bad = (c, msg = "Bad Request", code = 400) => c.json({ ok: false, error: msg }, code);
const ok = (c, data = {}, code = 200) => c.json({ ok: true, ...data }, code);
const isEmail = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
userRouter.get("/", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    ).all();
    return ok(c, { items: results });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to fetch users", 500);
  }
});
userRouter.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const user = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
    ).bind(id).first();
    if (!user) return bad(c, "Not found", 404);
    return ok(c, { item: user });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to fetch user", 500);
  }
});
userRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const password = (body.password || "").trim();
    const role = (body.role || "user").trim();
    if (!name || !email || !password)
      return bad(c, "name, email, password are required");
    if (!isEmail(email)) return bad(c, "Invalid email");
    const result = await c.env.DB.prepare(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`
    ).bind(name, email, password, role).run();
    const newUser = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
    return ok(c, { item: newUser }, 201);
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to create user", 500);
  }
});
userRouter.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const body = await c.req.json();
    const fields = [];
    const binds = [];
    if (body.name) {
      fields.push("name = ?");
      binds.push(body.name.trim());
    }
    if (body.email) {
      if (!isEmail(body.email.trim())) return bad(c, "Invalid email");
      fields.push("email = ?");
      binds.push(body.email.trim());
    }
    if (body.password) {
      fields.push("password = ?");
      binds.push(body.password.trim());
    }
    if (body.role) {
      fields.push("role = ?");
      binds.push(body.role.trim());
    }
    if (!fields.length) return bad(c, "No fields to update");
    const res = await c.env.DB.prepare(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`
    ).bind(...binds, id).run();
    if ((res.meta?.changes || 0) === 0) return bad(c, "Not found", 404);
    const updated = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
    ).bind(id).first();
    return ok(c, { item: updated });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to update user", 500);
  }
});
userRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const res = await c.env.DB.prepare(
      "DELETE FROM users WHERE id = ?"
    ).bind(id).run();
    if ((res.meta?.changes || 0) === 0) return bad(c, "Not found", 404);
    return ok(c, { deleted: true });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to delete user", 500);
  }
});
const DEFAULT_LOCALE$2 = "vi";
const getLocale$2 = (c) => (c.req.query("locale") || DEFAULT_LOCALE$2).toLowerCase();
const hasDB$2 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const bannerRouter = new Hono2();
async function getMergedBannerById(db, id, locale) {
  const sql = `
    SELECT
      b.id,
      COALESCE(bt.content, b.content) AS content,
      b.image_url,
      b.created_at,
      b.updated_at
    FROM banners b
    LEFT JOIN banners_translations bt
      ON bt.banner_id = b.id AND bt.locale = ?
    WHERE b.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}
bannerRouter.get("/", async (c) => {
  try {
    if (!hasDB$2(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const locale = getLocale$2(c);
    const sql = `
      SELECT
        b.id,
        COALESCE(bt.content, b.content) AS content,
        b.image_url,
        b.created_at,
        b.updated_at
      FROM banners b
      LEFT JOIN banners_translations bt
        ON bt.banner_id = b.id AND bt.locale = ?
      ORDER BY b.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();
    return c.json({
      ok: true,
      items: results,
      count: results.length,
      source: "database",
      locale
    });
  } catch (err) {
    console.error("Error fetching banners:", err);
    return c.json({ ok: false, error: "Failed to fetch banners" }, 500);
  }
});
bannerRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$2(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const locale = getLocale$2(c);
    const item = await getMergedBannerById(c.env.DB, id, locale);
    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item, source: "database", locale });
  } catch {
    return c.json({ ok: false, error: "Failed to fetch banner" }, 500);
  }
});
bannerRouter.post("/", async (c) => {
  try {
    if (!hasDB$2(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const { content, image_url, translations } = body || {};
    if (!content || typeof content !== "string") {
      return c.json({ ok: false, error: "content is required" }, 400);
    }
    const ins = await c.env.DB.prepare(`INSERT INTO banners (content, image_url) VALUES (?, ?)`).bind(content, image_url || null).run();
    if (!ins.success) throw new Error("Insert failed");
    const newId = ins.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO banners_translations(banner_id, locale, content)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(banner_id, locale) DO UPDATE SET
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(newId, String(lc).toLowerCase(), tr?.content ?? "").run();
      }
    }
    const locale = getLocale$2(c);
    const item = await getMergedBannerById(c.env.DB, newId, locale);
    return c.json({ ok: true, item, source: "database", locale }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create banner" }, 500);
  }
});
bannerRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$2(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const { content, image_url, translations } = body || {};
    const sets = [];
    const params = [];
    if (content !== void 0) {
      sets.push("content = ?");
      params.push(content);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (sets.length) {
      const sql = `UPDATE banners SET ${sets.join(", ")}, updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ ok: false, error: "Not found" }, 404);
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO banners_translations(banner_id, locale, content)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(banner_id, locale) DO UPDATE SET
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.content ?? "").run();
      }
    }
    const locale = getLocale$2(c);
    const item = await getMergedBannerById(c.env.DB, id, locale);
    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to update banner" }, 500);
  }
});
bannerRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$2(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const { translations } = await c.req.json() || {};
    if (!translations || typeof translations !== "object") {
      return c.json({ ok: false, error: "Missing translations" }, 400);
    }
    const upsertT = `
      INSERT INTO banners_translations(banner_id, locale, content)
      VALUES (?1, ?2, ?3)
      ON CONFLICT(banner_id, locale) DO UPDATE SET
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.content ?? "").run();
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to upsert translations" }, 500);
  }
});
bannerRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$2(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const sql = `
      SELECT locale, content
      FROM banners_translations
      WHERE banner_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = { content: r.content || "" };
    }
    return c.json({ ok: true, translations });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch translations" }, 500);
  }
});
bannerRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$2(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM banners WHERE id = ?").bind(id).run();
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to delete banner" }, 500);
  }
});
const DEFAULT_LOCALE$1 = "vi";
const getLocale$1 = (c) => (c.req.query("locale") || DEFAULT_LOCALE$1).toLowerCase();
const hasDB$1 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const fieldRouter = new Hono2();
async function getMergedFieldById(db, id, locale) {
  const sql = `
    SELECT
      f.id,
      COALESCE(ft.name,    f.name)    AS name,
      COALESCE(ft.content, f.content) AS content,
      f.image_url,
      f.created_at
    FROM fields f
    LEFT JOIN fields_translations ft
      ON ft.field_id = f.id AND ft.locale = ?
    WHERE f.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}
fieldRouter.get("/", async (c) => {
  try {
    if (!hasDB$1(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const locale = getLocale$1(c);
    const sql = `
      SELECT
        f.id,
        COALESCE(ft.name,    f.name)    AS name,
        COALESCE(ft.content, f.content) AS content,
        f.image_url,
        f.created_at
      FROM fields f
      LEFT JOIN fields_translations ft
        ON ft.field_id = f.id AND ft.locale = ?
      ORDER BY f.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();
    return c.json({
      ok: true,
      items: results,
      count: results.length,
      source: "database",
      locale
    });
  } catch (err) {
    console.error("Error fetching fields:", err);
    return c.json({ ok: false, error: "Failed to fetch fields" }, 500);
  }
});
fieldRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$1(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const locale = getLocale$1(c);
    const item = await getMergedFieldById(c.env.DB, id, locale);
    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch field" }, 500);
  }
});
fieldRouter.post("/", async (c) => {
  try {
    if (!hasDB$1(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const { name, content, image_url, translations } = body || {};
    if (!name || typeof name !== "string") {
      return c.json({ ok: false, error: "name is required" }, 400);
    }
    const ins = await c.env.DB.prepare("INSERT INTO fields (name, content, image_url) VALUES (?, ?, ?)").bind(name, content ?? null, image_url ?? null).run();
    if (!ins.success) throw new Error("Insert failed");
    const newId = ins.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO fields_translations(field_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(field_id, locale) DO UPDATE SET
          name=excluded.name,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(newId, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "").run();
      }
    }
    const locale = getLocale$1(c);
    const item = await getMergedFieldById(c.env.DB, newId, locale);
    return c.json({ ok: true, item, source: "database", locale }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create field" }, 500);
  }
});
fieldRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$1(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const { name, content, image_url, translations } = body || {};
    if (name !== void 0 && typeof name !== "string") {
      return c.json({ ok: false, error: "name must be string" }, 400);
    }
    const sets = [];
    const params = [];
    if (name !== void 0) {
      sets.push("name = ?");
      params.push(name);
    }
    if (content !== void 0) {
      sets.push("content = ?");
      params.push(content);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (sets.length) {
      const sql = `UPDATE fields SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ ok: false, error: "Not found" }, 404);
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO fields_translations(field_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(field_id, locale) DO UPDATE SET
          name=excluded.name,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "").run();
      }
    }
    const locale = getLocale$1(c);
    const item = await getMergedFieldById(c.env.DB, id, locale);
    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to update field" }, 500);
  }
});
fieldRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$1(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ ok: false, error: "Missing translations" }, 400);
    }
    const upsertT = `
      INSERT INTO fields_translations(field_id, locale, name, content)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(field_id, locale) DO UPDATE SET
        name=excluded.name,
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "").run();
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to upsert translations" }, 500);
  }
});
fieldRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$1(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const sql = `
      SELECT locale, name, content
      FROM fields_translations
      WHERE field_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = { name: r.name || "", content: r.content || "" };
    }
    return c.json({ ok: true, translations });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch translations" }, 500);
  }
});
fieldRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB$1(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM fields WHERE id = ?").bind(id).run();
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to delete field" }, 500);
  }
});
const DEFAULT_LOCALE = "vi";
const getLocale = (c) => (c.req.query("locale") || DEFAULT_LOCALE).toLowerCase();
const hasDB = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const normalizeType = (t) => (t || "").toString().trim().toLowerCase();
const cerPartnerRouter = new Hono2();
async function getMergedById(db, id, locale) {
  const sql = `
    SELECT
      c.id,
      COALESCE(ct.name,    c.name)    AS name,
      c.type,
      COALESCE(ct.content, c.content) AS content,
      c.image_url,
      c.created_at
    FROM certifications_partners c
    LEFT JOIN certifications_partners_translations ct
      ON ct.cp_id = c.id AND ct.locale = ?
    WHERE c.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}
cerPartnerRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const locale = getLocale(c);
    const sql = `
      SELECT
        c.id,
        COALESCE(ct.name,    c.name)    AS name,
        c.type,
        COALESCE(ct.content, c.content) AS content,
        c.image_url,
        c.created_at
      FROM certifications_partners c
      LEFT JOIN certifications_partners_translations ct
        ON ct.cp_id = c.id AND ct.locale = ?
      ORDER BY c.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();
    return c.json({ ok: true, items: results, count: results.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching certifications_partners:", err);
    return c.json({ ok: false, error: "Failed to fetch items" }, 500);
  }
});
cerPartnerRouter.get("/type/:type", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const t = normalizeType(c.req.param("type"));
    const locale = getLocale(c);
    const sql = `
      SELECT
        c.id,
        COALESCE(ct.name,    c.name)    AS name,
        c.type,
        COALESCE(ct.content, c.content) AS content,
        c.image_url,
        c.created_at
      FROM certifications_partners c
      LEFT JOIN certifications_partners_translations ct
        ON ct.cp_id = c.id AND ct.locale = ?
      WHERE c.type = ?
      ORDER BY c.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale, t).all();
    return c.json({ ok: true, items: results, count: results.length, type: t, locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch by type" }, 500);
  }
});
cerPartnerRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const locale = getLocale(c);
    const item = await getMergedById(c.env.DB, id, locale);
    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch item" }, 500);
  }
});
cerPartnerRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const { name, type, content, image_url, translations } = body || {};
    const t = normalizeType(type);
    if (!name || typeof name !== "string") return c.json({ ok: false, error: "name is required" }, 400);
    if (!t) return c.json({ ok: false, error: "type is required" }, 400);
    if (!content || typeof content !== "string")
      return c.json({ ok: false, error: "content is required" }, 400);
    const ins = await c.env.DB.prepare("INSERT INTO certifications_partners (name, type, content, image_url) VALUES (?, ?, ?, ?)").bind(name, t, content, image_url ?? null).run();
    if (!ins.success) throw new Error("Insert failed");
    const newId = ins.meta?.last_row_id;
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO certifications_partners_translations(cp_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(cp_id, locale) DO UPDATE SET
          name=excluded.name,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(newId, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "").run();
      }
    }
    const locale = getLocale(c);
    const item = await getMergedById(c.env.DB, newId, locale);
    return c.json({ ok: true, item, locale }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create item" }, 500);
  }
});
cerPartnerRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const name = Object.prototype.hasOwnProperty.call(body, "name") ? body.name : void 0;
    const type = Object.prototype.hasOwnProperty.call(body, "type") ? normalizeType(body.type) : void 0;
    const content = Object.prototype.hasOwnProperty.call(body, "content") ? body.content : void 0;
    const image_url = Object.prototype.hasOwnProperty.call(body, "image_url") ? body.image_url : void 0;
    const translations = body?.translations;
    if (name !== void 0 && typeof name !== "string") return c.json({ ok: false, error: "name must be string" }, 400);
    if (type !== void 0 && !type) return c.json({ ok: false, error: "type cannot be empty" }, 400);
    if (content !== void 0 && typeof content !== "string")
      return c.json({ ok: false, error: "content must be string" }, 400);
    const sets = [];
    const params = [];
    if (name !== void 0) {
      sets.push("name = ?");
      params.push(name);
    }
    if (type !== void 0) {
      sets.push("type = ?");
      params.push(type);
    }
    if (content !== void 0) {
      sets.push("content = ?");
      params.push(content);
    }
    if (image_url !== void 0) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
    if (sets.length) {
      const sql = `UPDATE certifications_partners SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ ok: false, error: "Not found" }, 404);
    }
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO certifications_partners_translations(cp_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(cp_id, locale) DO UPDATE SET
          name=excluded.name,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "").run();
      }
    }
    const locale = getLocale(c);
    const item = await getMergedById(c.env.DB, id, locale);
    return c.json({ ok: true, item, locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to update item" }, 500);
  }
});
cerPartnerRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ ok: false, error: "Missing translations" }, 400);
    }
    const upsertT = `
      INSERT INTO certifications_partners_translations(cp_id, locale, name, content)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(cp_id, locale) DO UPDATE SET
        name=excluded.name,
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "").run();
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to upsert translations" }, 500);
  }
});
cerPartnerRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const sql = `
      SELECT locale, name, content
      FROM certifications_partners_translations
      WHERE cp_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = { name: r.name || "", content: r.content || "" };
    }
    return c.json({ ok: true, translations });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch translations" }, 500);
  }
});
cerPartnerRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM certifications_partners WHERE id = ?").bind(id).run();
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to delete item" }, 500);
  }
});
const translateRouter = new Hono2();
translateRouter.post("/", async (c) => {
  try {
    if (!c.env?.AI) {
      return c.json({ error: "AI binding not available" }, 500);
    }
    const body = await c.req.json().catch(() => ({}));
    const { text, source = "vi", target = "en" } = body || {};
    if (!text || !target) {
      return c.json({ error: 'Missing "text" or "target"' }, 400);
    }
    const model = "@cf/meta/m2m100-1.2b";
    const out = await c.env.AI.run(model, {
      text,
      source_lang: source,
      target_lang: target
    });
    const translated = out?.translated_text || out?.translation || out?.text || "";
    return c.json({ ok: true, translated });
  } catch (e) {
    console.error("translate error:", e);
    return c.json({ error: "Translate failed" }, 500);
  }
});
const GRAPH = "https://graph.facebook.com/v20.0";
const app = new Hono2();
app.use("*", async (c, next) => {
  try {
    if (c.env.DB) {
      await c.env.DB.prepare("SELECT 1").first();
      c.env.DB_AVAILABLE = true;
    } else {
      c.env.DB_AVAILABLE = false;
    }
  } catch (e) {
    console.error("D1 connection error:", e);
    c.env.DB_AVAILABLE = false;
  }
  await next();
});
const addCORS = (res) => new Response(res.body, {
  ...res,
  headers: new Headers({
    ...Object.fromEntries(res.headers || []),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  })
});
app.options("/wa/*", () => addCORS(new Response(null, { status: 204 })));
app.get("/webhook", (c) => {
  const url = new URL(c.req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === c.env.VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" }
    });
  }
  return c.text("Forbidden", 403);
});
app.post("/webhook", async (c) => {
  const env2 = c.env;
  const payload = await c.req.json().catch(() => ({}));
  try {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];
    if (msg) {
      const from = (msg.from || "").replace(/\D/g, "");
      const to = value?.metadata?.display_phone_number?.replace(/\D/g, "") || env2.BUSINESS_WA_E164 || "";
      const type = msg.type;
      const body = type === "text" ? msg.text?.body || "" : `[${type}]`;
      const ts = parseInt(msg.timestamp || Date.now() / 1e3, 10) * 1e3;
      if (env2.DB) {
        await env2.DB.prepare(
          "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
        ).bind(from, "in", from, to, type, body, ts).run();
      }
    }
  } catch (e) {
    console.error("Webhook inbound error:", e);
  }
  return c.text("OK", 200);
});
app.post("/wa/send", async (c) => {
  const env2 = c.env;
  const { to, body, template } = await c.req.json().catch(() => ({}));
  const dest = (to || "").replace(/\D/g, "");
  const hasTemplate = !!template;
  const text = (body || "").toString();
  if (!env2.PHONE_NUMBER_ID || !env2.WHATSAPP_TOKEN) {
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: "Missing PHONE_NUMBER_ID or WHATSAPP_TOKEN" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
  if (!dest || !text && !hasTemplate) {
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: "Missing to/body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
  let payload;
  let dbType;
  let dbBody;
  if (hasTemplate) {
    payload = { messaging_product: "whatsapp", to: dest, type: "template", template };
    dbType = "template";
    dbBody = `[template:${template?.name || ""}]`;
  } else {
    payload = { messaging_product: "whatsapp", to: dest, type: "text", text: { body: text } };
    dbType = "text";
    dbBody = text;
  }
  const res = await fetch(`${GRAPH}/${env2.PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env2.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Cloud API error:", data);
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: data?.error || data }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
  let dbInserted = false;
  try {
    if (env2.DB) {
      await env2.DB.prepare(
        "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
      ).bind(dest, "out", env2.BUSINESS_WA_E164 || "", dest, dbType, dbBody, Date.now()).run();
      dbInserted = true;
    }
  } catch (e) {
    console.error("D1 insert outgoing error:", e);
  }
  return addCORS(
    new Response(JSON.stringify({ ok: true, data, dbInserted }), {
      headers: { "Content-Type": "application/json" }
    })
  );
});
app.get("/wa/history", async (c) => {
  const env2 = c.env;
  const { searchParams } = new URL(c.req.url);
  const chat = (searchParams.get("chat") || "").replace(/\D/g, "");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  if (!chat) {
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: "Missing chat" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
  let rows = [];
  try {
    if (env2.DB) {
      const rs = await env2.DB.prepare(
        "SELECT id, chat_id, direction, wa_from, wa_to, type, body, ts FROM messages WHERE chat_id = ? ORDER BY ts DESC LIMIT ?"
      ).bind(chat, limit).all();
      rows = (rs?.results || []).reverse();
    }
  } catch (e) {
    console.error("D1 history error:", e);
  }
  return addCORS(
    new Response(JSON.stringify({ ok: true, messages: rows }), {
      headers: { "Content-Type": "application/json" }
    })
  );
});
app.route("/api/seo", seoApp);
app.route("/api/auth", authRouter);
app.route("/api/users", userRouter);
app.route("/api/banners", bannerRouter);
app.route("/api/about", aboutRouter);
app.route("/api/news", newsRouter);
app.route("/api/fields", fieldRouter);
app.route("/api/contacts", contactRouter);
app.route("/api/products", productsRouter);
app.route("/api/parent_categories", parentsRouter);
app.route("/api/sub_categories", subCategoriesRouter);
app.route("/api/cer-partners", cerPartnerRouter);
app.route("/api/upload-image", uploadImageRouter);
app.route("/api/editor-upload", editorUploadRouter);
app.route("/api/translate", translateRouter);
app.get(
  "/api/health",
  (c) => c.json({
    status: "ok",
    database: c.env.DB_AVAILABLE ? "connected" : "disconnected",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  })
);
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));
const index = { fetch: app.fetch };
export {
  index as default
};

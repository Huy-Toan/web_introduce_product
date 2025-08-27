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
const booksRouter = new Hono2();
const fallbackBooks = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    description: "A classic American novel about racial injustice and moral growth.",
    image_url: "/images/books/mockingbird.jpg",
    // Changed to image_url
    published_year: 1960
  }
];
booksRouter.get("/", async (c) => {
  const { genre, sort } = c.req.query();
  try {
    if (c.env.DB_AVAILABLE) {
      let query = "SELECT * FROM books";
      let params = [];
      if (genre) {
        query += " WHERE genre = ?";
        params.push(genre);
      }
      if (sort) {
        switch (sort) {
          case "title_asc":
            query += " ORDER BY title ASC";
            break;
          case "title_desc":
            query += " ORDER BY title DESC";
            break;
          case "author_asc":
            query += " ORDER BY author ASC";
            break;
          case "author_desc":
            query += " ORDER BY author DESC";
            break;
          case "year_asc":
            query += " ORDER BY published_year ASC";
            break;
          case "year_desc":
            query += " ORDER BY published_year DESC";
            break;
          default:
            query += " ORDER BY id ASC";
            break;
        }
      }
      let stmt = c.env.DB.prepare(query);
      if (params.length > 0) {
        stmt = stmt.bind(...params);
      }
      const result = await stmt.all();
      const books = result.results || [];
      return c.json({
        books,
        source: "database",
        count: books.length,
        debug: { query, params }
      });
    } else {
      console.log("Using fallback data");
      let books = [...fallbackBooks];
      if (genre) {
        console.log("Filtering by genre:", genre);
        books = books.filter(
          (book) => book.genre.toLowerCase() === genre.toLowerCase()
        );
      }
      if (sort) {
        switch (sort) {
          case "title_asc":
            books.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "title_desc":
            books.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case "author_asc":
            books.sort((a, b) => a.author.localeCompare(b.author));
            break;
          case "author_desc":
            books.sort((a, b) => b.author.localeCompare(a.author));
            break;
          case "year_asc":
            books.sort((a, b) => a.published_year - b.published_year);
            break;
          case "year_desc":
            books.sort((a, b) => b.published_year - a.published_year);
            break;
        }
      }
      return c.json({
        books,
        source: "fallback",
        count: books.length,
        debug: { genre, sort, originalCount: fallbackBooks.length }
      });
    }
  } catch (error2) {
    console.error("Error fetching books:", error2);
    return c.json({
      error: "Failed to fetch books",
      books: fallbackBooks,
      source: "error_fallback"
    }, 500);
  }
});
booksRouter.get("/:id", async (c) => {
  const bookId = parseInt(c.req.param("id"));
  try {
    if (c.env.DB_AVAILABLE) {
      const result = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(bookId).first();
      if (!result) {
        return c.json({ error: "Book not found" }, 404);
      }
      return c.json({
        book: result,
        source: "database"
      });
    } else {
      const book = fallbackBooks.find((b) => b.id === bookId);
      if (!book) {
        return c.json({ error: "Book not found" }, 404);
      }
      return c.json({
        book,
        source: "fallback"
      });
    }
  } catch (error2) {
    console.error("Error fetching book:", error2);
    return c.json({ error: "Failed to fetch book" }, 500);
  }
});
booksRouter.post("/", async (c) => {
  try {
    if (!c.env.DB_AVAILABLE) {
      return c.json({ error: "Database not available" }, 503);
    }
    const { title: title2, author, genre, description, image_url } = await c.req.json();
    if (!title2 || !author || !genre) {
      return c.json({ error: "Missing required fields: title, author, genre" }, 400);
    }
    const result = await c.env.DB.prepare(`
      INSERT INTO books (title, author, genre, description, image_url)
      VALUES (?, ?, ?, ?, ?)
    `).bind(title2, author, genre, description || null, image_url || null).run();
    if (result.success) {
      const newBook = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(result.meta.last_row_id).first();
      return c.json({
        book: newBook,
        source: "database"
      }, 201);
    } else {
      throw new Error("Failed to insert book");
    }
  } catch (error2) {
    console.error("Error adding book:", error2);
    return c.json({ error: "Failed to add book" }, 500);
  }
});
booksRouter.put("/:id", async (c) => {
  const bookId = parseInt(c.req.param("id"));
  try {
    if (!c.env.DB_AVAILABLE) {
      return c.json({ error: "Database not available" }, 503);
    }
    const updates = await c.req.json();
    const { title: title2, author, genre, description, image_url } = updates;
    const result = await c.env.DB.prepare(`
      UPDATE books 
      SET title = ?, author = ?, genre = ?, description = ?, image_url = ?
      WHERE id = ?
    `).bind(title2, author, genre, description, image_url, bookId).run();
    if (result.meta.changes > 0) {
      const updatedBook = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(bookId).first();
      return c.json({
        book: updatedBook,
        source: "database"
      });
    } else {
      return c.json({ error: "Book not found" }, 404);
    }
  } catch (error2) {
    console.error("Error updating book:", error2);
    return c.json({ error: "Failed to update book" }, 500);
  }
});
booksRouter.delete("/:id", async (c) => {
  const bookId = c.req.param("id");
  console.log("Có yêu cầu xóa với ID:", bookId, "Type:", typeof bookId);
  try {
    if (!c.env.DB_AVAILABLE) {
      return c.json({ error: "Database not available" }, 503);
    }
    const existingBook = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(parseInt(bookId)).first();
    console.log("Book tìm thấy:", existingBook);
    const result = await c.env.DB.prepare("DELETE FROM books WHERE id = ?").bind(parseInt(bookId)).run();
    console.log("Delete result:", result);
    if (result.meta.changes > 0) {
      return c.json({ success: true, message: "Book deleted successfully" }, 200);
    } else {
      return c.json({ error: "Book not found" }, 404);
    }
  } catch (error2) {
    console.error("Lỗi khi xoá:", error2);
    return c.json({ error: "Failed to delete book" }, 500);
  }
});
const bookRelatedRouter = new Hono2();
const fallbackRelatedData = {
  relatedBooks: [
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      genre: "Dystopian",
      image_url: "https://example.com/1984.jpg"
    },
    {
      id: 3,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      genre: "Romance",
      image_url: "https://example.com/pride.jpg"
    }
  ],
  recentRecommendations: [
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      genre: "Fiction",
      image_url: "https://example.com/mockingbird.jpg"
    }
  ],
  genreStats: [
    { genre: "Fiction", count: 5 },
    { genre: "Romance", count: 3 },
    { genre: "Dystopian", count: 2 }
  ]
};
bookRelatedRouter.get("/", async (c) => {
  const bookId = parseInt(c.req.param("id"));
  console.log("Fetching related books for ID:", bookId);
  try {
    if (c.env.DB_AVAILABLE) {
      const book = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?").bind(bookId).first();
      if (!book) {
        return c.json({ error: "Book not found" }, 404);
      }
      const bookGenre = book.genre;
      let relatedBooks = [];
      let recentBooks = [];
      let genreCounts = [];
      const relatedResult = await c.env.DB.prepare(`
        SELECT * FROM books 
        WHERE genre = ? AND id != ? 
        LIMIT 5
      `).bind(bookGenre, bookId).all();
      relatedBooks = relatedResult.results || [];
      const genreStatsResult = await c.env.DB.prepare(`
        SELECT genre, COUNT(*) as count 
        FROM books 
        GROUP BY genre 
        ORDER BY count DESC
      `).all();
      genreCounts = genreStatsResult.results || [];
      const recentResult = await c.env.DB.prepare(`
        SELECT * FROM books 
        WHERE id != ? 
        ORDER BY created_at DESC 
        LIMIT 3
      `).bind(bookId).all();
      recentBooks = recentResult.results || [];
      return c.json({
        bookId,
        bookGenre,
        relatedBooks,
        recentRecommendations: recentBooks,
        genreStats: genreCounts,
        source: "database"
      });
    } else {
      const book = { id: bookId, genre: "Fiction" };
      return c.json({
        bookId,
        bookGenre: book.genre,
        relatedBooks: fallbackRelatedData.relatedBooks.filter((b) => b.id !== bookId),
        recentRecommendations: fallbackRelatedData.recentRecommendations.filter((b) => b.id !== bookId),
        genreStats: fallbackRelatedData.genreStats,
        source: "fallback"
      });
    }
  } catch (error2) {
    console.error("Error fetching related book data:", error2);
    return c.json({
      error: "Failed to fetch related books",
      bookId,
      relatedBooks: [],
      recentRecommendations: [],
      genreStats: [],
      source: "error_fallback"
    }, 500);
  }
});
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
  } catch (error2) {
    console.error("Upload error:", error2);
    return c.json({
      error: "Có lỗi xảy ra khi upload ảnh",
      details: error2.message
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
  } catch (error2) {
    console.error("Upload error:", error2);
    return c.json({ success: 0, message: error2.message }, 500);
  }
});
const aboutRouter = new Hono2();
const fallbackAbout = [
  {
    id: 1,
    title: "About Our Library",
    content: "We are a community-driven library offering a wide range of books to readers of all ages.",
    image_url: "/images/about/library.jpg"
  }
];
aboutRouter.get("/", async (c) => {
  try {
    if (c.env.DB_AVAILABLE) {
      const result = await c.env.DB.prepare("SELECT * FROM about_us").all();
      return c.json({ about: result.results, source: "database" });
    } else {
      return c.json({ about: fallbackAbout, source: "fallback" });
    }
  } catch (error2) {
    return c.json({ error: "Failed to fetch about us" }, 500);
  }
});
aboutRouter.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    const item = await c.env.DB.prepare("SELECT * FROM about_us WHERE id = ?").bind(id).first();
    if (!item) return c.json({ error: "Not found" }, 404);
    return c.json({ about: item });
  } catch (e) {
    return c.json({ error: "Failed to fetch about" }, 500);
  }
});
aboutRouter.post("/", async (c) => {
  try {
    const { title: title2, content, image_url } = await c.req.json();
    const result = await c.env.DB.prepare(`
      INSERT INTO about_us (title, content, image_url)
      VALUES (?, ?, ?)
    `).bind(title2, content, image_url || null).run();
    const newItem = await c.env.DB.prepare("SELECT * FROM about_us WHERE id = ?").bind(result.meta.last_row_id).first();
    return c.json({ about: newItem }, 201);
  } catch (e) {
    return c.json({ error: "Failed to create about" }, 500);
  }
});
aboutRouter.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { title: title2, content, image_url } = await c.req.json();
  try {
    await c.env.DB.prepare(`
      UPDATE about_us SET title = ?, content = ?, image_url = ? WHERE id = ?
    `).bind(title2, content, image_url, id).run();
    const updated = await c.env.DB.prepare("SELECT * FROM about_us WHERE id = ?").bind(id).first();
    return c.json({ about: updated });
  } catch (e) {
    return c.json({ error: "Failed to update about" }, 500);
  }
});
aboutRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    await c.env.DB.prepare("DELETE FROM about_us WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: "Failed to delete about" }, 500);
  }
});
const newsRouter = new Hono2();
const fallbackNews = [
  {
    id: 1,
    title: "Website Launch",
    slug: "website-launch",
    content: "We are excited to announce the launch of our new website!",
    meta_description: "Announcement of our new website",
    keywords: "launch,website",
    image_url: "/images/news/launch.jpg",
    published_at: "2025-08-01"
  }
];
newsRouter.get("/", async (c) => {
  try {
    if (c.env.DB_AVAILABLE) {
      const result = await c.env.DB.prepare("SELECT * FROM news ORDER BY published_at DESC").all();
      return c.json({ news: result.results, source: "database" });
    } else {
      return c.json({ news: fallbackNews, source: "fallback" });
    }
  } catch (error2) {
    console.error(error2);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});
newsRouter.get("/:slug", async (c) => {
  const id = c.req.param("slug");
  try {
    const news = await c.env.DB.prepare("SELECT * FROM news WHERE slug = ?").bind(id).first();
    if (!news) return c.json({ error: "News not found" }, 404);
    return c.json({ news });
  } catch (e) {
    console.error(error);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});
newsRouter.post("/", async (c) => {
  try {
    const {
      title: title2,
      slug,
      content,
      meta,
      keywords,
      image_url,
      published_at
    } = await c.req.json();
    const result = await c.env.DB.prepare(`
       INSERT INTO news (title, slug, content, meta_description, keywords, image_url, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title2,
      slug,
      content,
      meta || null,
      keywords || null,
      image_url || null,
      published_at || null
    ).run();
    const newItem = await c.env.DB.prepare("SELECT * FROM news WHERE id = ?").bind(result.meta.last_row_id).first();
    return c.json({ news: newItem }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to create news" }, 500);
  }
});
newsRouter.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const {
    title: title2,
    slug,
    content,
    meta,
    keywords,
    image_url,
    published_at
  } = await c.req.json();
  try {
    await c.env.DB.prepare(`
      UPDATE news
      SET title = ?, slug = ?, content = ?, meta_description = ?, keywords = ?, image_url = ?, published_at = ?
      WHERE id = ?
    `).bind(
      title2,
      slug,
      content,
      meta || null,
      keywords || null,
      image_url || null,
      published_at || null,
      id
    ).run();
    const updated = await c.env.DB.prepare("SELECT * FROM news WHERE id = ?").bind(id).first();
    return c.json({ news: updated });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to update news" }, 500);
  }
});
newsRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    await c.env.DB.prepare("DELETE FROM news WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to delete news" }, 500);
  }
});
function cleanText(text) {
  if (!text) return "";
  return text.replace(/^\s*[-*•]\s*/gm, "").replace(/^\s*\d+\.\s*/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}
const seoApp = new Hono2();
const slugify$2 = (str = "") => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
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
        slug: slugify$2(title2 || keyword),
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
        slug: slugify$2(title2),
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
const hasDB$1 = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const slugify$1 = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const categoriesRouter = new Hono2();
categoriesRouter.get("/", async (c) => {
  try {
    if (!hasDB$1(c.env)) {
      return c.json({ categories: [], source: "fallback", count: 0 });
    }
    const sql = `
      SELECT id, name, slug, description, image_url, created_at
      FROM categories
      ORDER BY created_at DESC
    `;
    const result = await c.env.DB.prepare(sql).all();
    const categories = result?.results ?? [];
    return c.json({ categories, count: categories.length, source: "database" });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});
categoriesRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB$1(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const isNumeric = /^\d+$/.test(idOrSlug);
    const sql = `
      SELECT id, name, slug, description, image_url, created_at
      FROM categories
      WHERE ${isNumeric ? "id = ?" : "slug = ?"}
      LIMIT 1
    `;
    const cat = await c.env.DB.prepare(sql).bind(isNumeric ? Number(idOrSlug) : idOrSlug).first();
    if (!cat) return c.json({ error: "Category not found" }, 404);
    return c.json({ category: cat, source: "database" });
  } catch (err) {
    console.error("Error fetching category:", err);
    return c.json({ error: "Failed to fetch category" }, 500);
  }
});
categoriesRouter.post("/", async (c) => {
  try {
    if (!hasDB$1(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const body = await c.req.json();
    const { name, slug: rawSlug, description, image_url } = body || {};
    if (!name?.trim()) {
      return c.json({ error: "Missing required field: name" }, 400);
    }
    const slug = rawSlug?.trim() || slugify$1(name);
    const sql = `
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const res = await c.env.DB.prepare(sql).bind(name.trim(), slug, description || null, image_url || null).run();
    if (!res.success) throw new Error("Insert failed");
    const newId = res.meta?.last_row_id;
    const cat = await c.env.DB.prepare(
      `SELECT id, name, slug, description, image_url, created_at
         FROM categories WHERE id = ?`
    ).bind(newId).first();
    return c.json({ category: cat, source: "database" }, 201);
  } catch (err) {
    console.error("Error creating category:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug already exists" : "Failed to create category";
    return c.json({ error: msg }, 500);
  }
});
categoriesRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$1(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const body = await c.req.json();
    const { name, slug, description, image_url } = body || {};
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
    if (!sets.length) return c.json({ error: "No fields to update" }, 400);
    const sql = `UPDATE categories SET ${sets.join(", ")} WHERE id = ?`;
    params.push(id);
    const res = await c.env.DB.prepare(sql).bind(...params).run();
    if ((res.meta?.changes || 0) === 0) {
      return c.json({ error: "Category not found" }, 404);
    }
    const cat = await c.env.DB.prepare(
      `SELECT id, name, slug, description, image_url, created_at
         FROM categories WHERE id = ?`
    ).bind(id).first();
    return c.json({ category: cat, source: "database" });
  } catch (err) {
    console.error("Error updating category:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug already exists" : "Failed to update category";
    return c.json({ error: msg }, 500);
  }
});
categoriesRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB$1(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const existing = await c.env.DB.prepare("SELECT id FROM categories WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ error: "Category not found" }, 404);
    const res = await c.env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Category deleted successfully" });
    }
    return c.json({ error: "Category not found" }, 404);
  } catch (err) {
    console.error("Error deleting category:", err);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});
categoriesRouter.get("/:slug/products", async (c) => {
  const slug = c.req.param("slug");
  try {
    if (!hasDB$1(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE c.slug = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(slug).all();
    const products = res?.results ?? [];
    return c.json({ products, count: products.length, source: "database" });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return c.json({ error: "Failed to fetch products by category" }, 500);
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
const hasDB = (env2) => Boolean(env2?.DB) || Boolean(env2?.DB_AVAILABLE);
const findProductByIdOrSlug = async (db, idOrSlug) => {
  const isNumericId = /^\d+$/.test(idOrSlug);
  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${isNumericId ? "p.id = ?" : "p.slug = ?"}
    LIMIT 1
  `;
  return db.prepare(sql).bind(isNumericId ? Number(idOrSlug) : idOrSlug).first();
};
const slugify = (s = "") => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const productsRouter = new Hono2();
productsRouter.get("/", async (c) => {
  const { category_id, category_slug } = c.req.query();
  try {
    if (!hasDB(c.env)) {
      const products2 = [];
      return c.json({ products: products2, source: "fallback", count: products2.length });
    }
    const conds = [];
    const params = [];
    let joinCat = "";
    if (category_id) {
      conds.push("p.category_id = ?");
      params.push(Number(category_id));
    }
    if (category_slug) {
      joinCat = "LEFT JOIN categories c ON c.id = p.category_id";
      conds.push("c.slug = ?");
      params.push(category_slug);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ORDER BY p.created_at DESC
    `;
    const stmt = c.env.DB.prepare(sql).bind(...params);
    const result = await stmt.all();
    const products = result?.results ?? [];
    return c.json({
      products,
      count: products.length,
      source: "database",
      debug: { sql, params }
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.json(
      { error: "Failed to fetch products", source: "error_fallback" },
      500
    );
  }
});
productsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const product = await findProductByIdOrSlug(c.env.DB, idOrSlug);
    if (!product) return c.json({ error: "Product not found" }, 404);
    return c.json({ product, source: "database" });
  } catch (err) {
    console.error("Error fetching product:", err);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});
productsRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const body = await c.req.json();
    const {
      title: title2,
      slug: rawSlug,
      description,
      content,
      image_url,
      category_id
    } = body || {};
    console.log("Adding product:", body);
    if (!title2 || !content) {
      return c.json(
        { error: "Missing required fields: title, content" },
        400
      );
    }
    const slug = rawSlug?.trim() || slugify(title2);
    console.log("Generated slug:", slug);
    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB.prepare(sql).bind(
      title2,
      slug,
      description || null,
      content,
      image_url || null,
      typeof category_id === "number" ? category_id : null
    ).run();
    const newId = runRes.meta?.last_row_id;
    const product = await c.env.DB.prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.id = ?`
    ).bind(newId).first();
    return c.json({ product, source: "database" }, 201);
  } catch (err) {
    console.error("Error adding product:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug already exists" : "Failed to add product";
    console.error("Error details:", err);
    return c.json({ error: msg }, 500);
  }
});
productsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const body = await c.req.json();
    const {
      title: title2,
      slug,
      description,
      content,
      image_url,
      category_id
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
    if (category_id !== void 0) {
      sets.push("category_id = ?");
      params.push(
        category_id === null ? null : typeof category_id === "number" ? category_id : null
      );
    }
    if (!sets.length) {
      return c.json({ error: "No fields to update" }, 400);
    }
    const sql = `
      UPDATE products
      SET ${sets.join(", ")}
      WHERE id = ?
    `;
    params.push(id);
    const res = await c.env.DB.prepare(sql).bind(...params).run();
    if ((res.meta?.changes || 0) === 0) {
      return c.json({ error: "Product not found" }, 404);
    }
    const product = await c.env.DB.prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.id = ?`
    ).bind(id).first();
    return c.json({ product, source: "database" });
  } catch (err) {
    console.error("Error updating product:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique") || String(err).toLowerCase().includes("unique") ? "Slug already exists" : "Failed to update product";
    return c.json({ error: msg }, 500);
  }
});
productsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
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
const app = new Hono2();
app.use("*", async (c, next) => {
  if (c.env.DB) {
    try {
      const testQuery = await c.env.DB.prepare("SELECT 1").first();
      c.env.DB_AVAILABLE = true;
      console.log("D1 Database connected successfully");
    } catch (error2) {
      console.error("D1 Database connection error:", error2);
      c.env.DB_AVAILABLE = false;
    }
  } else {
    console.log("No D1 database binding available");
    c.env.DB_AVAILABLE = false;
  }
  await next();
});
app.route("/api/auth", authRouter);
app.route("/api/users", userRouter);
app.route("/api/contacts", contactRouter);
app.route("/api/books", booksRouter);
app.route("/api/about", aboutRouter);
app.route("/api/news", newsRouter);
app.route("/api/seo", seoApp);
app.route("/api/products", productsRouter);
app.route("/api/categories", categoriesRouter);
app.route("/api/books/:id/related", bookRelatedRouter);
app.route("/api/upload-image", uploadImageRouter);
app.route("/api/editor-upload", editorUploadRouter);
app.get("/api/health", async (c) => {
  return c.json({
    status: "ok",
    database: c.env.DB_AVAILABLE ? "connected" : "disconnected",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.all("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});
const index = {
  fetch: app.fetch
};
export {
  index as default
};

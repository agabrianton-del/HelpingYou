/**
 * Jest Setup Global
 * Configuración global para todos los tests en HelpingYou
 */

// Extend Jest matchers
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
    };
  },
  toBeValidUUID(received: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
    };
  },
});

// Mock de console.log en tests
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});

// Configurar timeouts globales
jest.setTimeout(10000);

// Mock de variables de entorno
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Suprimir advertencias de deprecación innecesarias
const suppressedWarnings = [
  'Warning: ReactDOM.render',
  'Warning: useLayoutEffect does nothing on the server',
];

const originalWarnImpl = console.warn;
console.warn = jest.fn((...args) => {
  const message = args[0]?.toString() || '';
  if (suppressedWarnings.some((warning) => message.includes(warning))) {
    return;
  }
  originalWarnImpl.call(console, ...args);
});

// Limpiar todos los mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Configuración global para tests de privacidad
global.testPrivacyMode = true;

export {};
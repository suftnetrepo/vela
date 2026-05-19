#!/usr/bin/env node
const tsc = require('typescript').tsc;

// Run TypeScript compiler with all errors
const result = tsc.run({
  sourceFiles: ['**/*.ts', '**/*.tsx'],
  options: {
    noEmit: false,
    noImplicitReturns: true,
    noImplicitThis: true,
    noFallthroughCasesInSwitch: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strict: true,
    allowSyntheticDefaultImports: true,
    allowJs: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
    skipLibCheck: false,
    resolveJsonModule: true,
    module: 'CommonJS',
    moduleResolution: 'bundler',
    target: 'ES2020',
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    noEmitOnError: true,
  },
  onDiagnostic: (diagnostic) => {
    if (diagnostic.category === 1) {
      console.error('TypeScript error:', diagnostic.messageText);
    }
  }
});

if (result === 0) {
  console.log('TypeScript compilation succeeded with no errors.');
} else {
  console.log('TypeScript compilation FAILED with errors.');
}

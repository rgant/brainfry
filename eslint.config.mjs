// @ts-check
import eslint from '@eslint/js';
import rxjs from '@smarttools/eslint-plugin-rxjs';
import stylistic from '@stylistic/eslint-plugin';
import angular from 'angular-eslint';
import { importX } from 'eslint-plugin-import-x';
import jasmine from 'eslint-plugin-jasmine';
import perfectionist from 'eslint-plugin-perfectionist';
import preferArrow from 'eslint-plugin-prefer-arrow-functions';
import pluginPromise from 'eslint-plugin-promise';
import tsdoc from 'eslint-plugin-tsdoc';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint, { configs as tseslintConfigs } from 'typescript-eslint';

export default tseslint.config(
  {
    files: [ '**/*.ts' ],
    ignores: [ 'cypress/**/*.ts' ],
    extends: [
      eslint.configs.all,
      stylistic.configs['all'],
      tseslintConfigs.all,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      perfectionist.configs['recommended-natural'],
      pluginPromise.configs['flat/recommended'],
      rxjs.configs.recommended,
      eslintPluginUnicorn.configs.all,
      angular.configs.tsAll,
    ],
    languageOptions: {
      parserOptions: {
        // Fixes: You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://typescript-eslint.io/getting-started/typed-linting for enabling linting with type information.
        projectService: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    processor: angular.processInlineTemplates,
    plugins: {
      preferArrow,
      rxjs,
      tsdoc,
    },
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/require-localize-metadata': [
        'error',
        {
          'requireDescription': true,
          'requireMeaning': true,
        }
      ],
      '@angular-eslint/sort-lifecycle-methods': 'off', // Conflicts with other sorting rules.
      '@stylistic/array-bracket-newline': [
        'error',
        { multiline: true },
      ],
      '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
      '@stylistic/array-element-newline': [ 'error', 'consistent' ],
      '@stylistic/arrow-parens': [ 'error', 'always' ],
      '@stylistic/block-spacing': [ 'error', 'always' ],
      '@stylistic/brace-style': [
        'error',
        '1tbs',
        { allowSingleLine: true },
      ],
      '@stylistic/comma-dangle': [ 'error', 'always-multiline' ],
      '@stylistic/dot-location': [ 'error', 'property' ], // Put the dot at the start of the property
      '@stylistic/function-call-argument-newline': [ 'error', 'consistent' ],
      '@stylistic/function-paren-newline': [ 'error', 'multiline-arguments' ],
      '@stylistic/generator-star-spacing': [
        'error',
        { before: false, after: true },
      ],
      '@stylistic/implicit-arrow-linebreak': 'off',
      '@stylistic/indent': [
        'error',
        2,
        {
          SwitchCase: 1,
          ignoredNodes: [
            'ConditionalExpression',
          ],
        },
      ],
      '@stylistic/indent-binary-ops': [ 'error', 2 ],
      '@stylistic/lines-around-comment': 'off',
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      '@stylistic/multiline-comment-style': 'off', // All comment styles are acceptable
      '@stylistic/max-len': [
        'error',
        {
          ignorePattern: '^\\s*(// |\\* )?\\S+$',
          code: 140,
        },
      ],
      '@stylistic/multiline-ternary': [ 'error', 'always-multiline' ],
      '@stylistic/newline-per-chained-call': [
        'error',
        { ignoreChainWithDepth: 3 },
      ],
      '@stylistic/no-confusing-arrow': 'off', // I think TypeScript makes this unlikely
      '@stylistic/no-extra-parens': [
        'error',
        'all',
        { nestedBinaryExpressions: false },
      ],
      '@stylistic/no-floating-decimal': 'off', // Not configurable to allow .75, and what monster would write 75.?
      '@stylistic/no-multi-spaces': [
        'error',
        { ignoreEOLComments: true },
      ],
      '@stylistic/no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 1,
        }
      ],
      '@stylistic/nonblock-statement-body-position': 'off', // Other rules make this moot
      '@stylistic/object-curly-newline': [
        'error',
        {
          ExportDeclaration: { consistent: true },
          ImportDeclaration: {
            minProperties: 4,
            multiline: true,
          },
          ObjectExpression: {
            consistent: true,
            minProperties: 4,
            multiline: true,
          },
          ObjectPattern: { consistent: true },
        },
      ],
      '@stylistic/object-curly-spacing': [ 'error', 'always' ],
      '@stylistic/object-property-newline': [
        'error',
        { allowAllPropertiesOnSameLine: true },
      ],
      '@stylistic/one-var-declaration-per-line': 'off',
      // https://github.com/airbnb/javascript/blob/d8cb404da74c302506f91e5928f30cc75109e74d/packages/eslint-config-airbnb-base/rules/style.js#L421
      '@stylistic/operator-linebreak': [
        'error',
        'before',
        { overrides: { '=': 'none' } },
      ],
      '@stylistic/padded-blocks': [ 'error', 'never' ],
      '@stylistic/padding-line-between-statements': 'off',
      '@stylistic/quote-props': [ 'error', 'as-needed' ],
      '@stylistic/quotes': [
        'error',
        'single',
        { avoidEscape: true },
      ],
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'never',
          asyncArrow: 'always',
          named: 'never',
        }
      ],
      '@stylistic/spaced-comment': [
        'error',
        'always',
        {
          line: {
            markers: [ '/' ],
          },
          block: {
            markers: [ '!' ],
            exceptions: [ '*' ],
            balanced: true,
          },
        },
      ],
      '@stylistic/wrap-iife': 'off',
      '@stylistic/wrap-regex': 'off',
      '@stylistic/yield-star-spacing': 'error',
      '@typescript-eslint/array-type': [
        'error',
        { default: 'array-simple' },
      ],
      // Sometimes it is clearer to use an index-signature interface, sometimes Record.
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          // For some reason false means 'require function return type'
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { overrides: { constructors: 'no-public' } },
      ],
      // TSLint had a rule to prevent initalizing let/var to undefined, but eslint doesn't have that.
      // https://palantir.github.io/tslint/rules/no-unnecessary-initializer/
      '@typescript-eslint/init-declarations': 'off',
      // Implement https://palantir.github.io/tslint/rules/member-ordering/ with alphabetize
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            // Copied from the default rule sorting, but:
            // > If you want to sort them alphabetically, you have to provide a custom configuration
            'memberTypes': [
              // Index signature
              'signature',
              'call-signature',

              // Fields
              'public-static-field',
              'protected-static-field',
              'private-static-field',
              '#private-static-field',

              'public-decorated-field',
              'protected-decorated-field',
              'private-decorated-field',

              'public-instance-field',
              'protected-instance-field',
              'private-instance-field',
              '#private-instance-field',

              'public-abstract-field',
              'protected-abstract-field',

              'public-field',
              'protected-field',
              'private-field',
              '#private-field',

              'static-field',
              'instance-field',
              'abstract-field',

              'decorated-field',

              'field',

              // Static initialization
              'static-initialization',

              // Constructors
              'public-constructor',
              'protected-constructor',
              'private-constructor',

              'constructor',

              // Getters
              'public-static-get',
              'protected-static-get',
              'private-static-get',
              '#private-static-get',

              'public-decorated-get',
              'protected-decorated-get',
              'private-decorated-get',

              'public-instance-get',
              'protected-instance-get',
              'private-instance-get',
              '#private-instance-get',

              'public-abstract-get',
              'protected-abstract-get',

              'public-get',
              'protected-get',
              'private-get',
              '#private-get',

              'static-get',
              'instance-get',
              'abstract-get',

              'decorated-get',

              'get',

              // Setters
              'public-static-set',
              'protected-static-set',
              'private-static-set',
              '#private-static-set',

              'public-decorated-set',
              'protected-decorated-set',
              'private-decorated-set',

              'public-instance-set',
              'protected-instance-set',
              'private-instance-set',
              '#private-instance-set',

              'public-abstract-set',
              'protected-abstract-set',

              'public-set',
              'protected-set',
              'private-set',
              '#private-set',

              'static-set',
              'instance-set',
              'abstract-set',

              'decorated-set',

              'set',

              // Methods
              'public-static-method',
              'protected-static-method',
              'private-static-method',
              '#private-static-method',

              'public-decorated-method',
              'protected-decorated-method',
              'private-decorated-method',

              'public-instance-method',
              'protected-instance-method',
              'private-instance-method',
              '#private-instance-method',

              'public-abstract-method',
              'protected-abstract-method',

              'public-method',
              'protected-method',
              'private-method',
              '#private-method',

              'static-method',
              'instance-method',
              'abstract-method',

              'decorated-method',

              'method',
            ],
            order: 'alphabetically-case-insensitive',
          },
          interfaces: 'never',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: [ 'camelCase' ],
        },
        {
          selector: 'variable',
          format: [ 'camelCase', 'UPPER_CASE' ],
        },
        {
          selector: 'variable',
          modifiers: [ 'unused' ],
          format: [ 'camelCase' ],
          leadingUnderscore: 'require',
        },
        {
          selector: 'parameter',
          format: [ 'camelCase' ],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'memberLike',
          format: [ 'camelCase' ],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'memberLike',
          modifiers: [ 'private' ],
          format: [ 'camelCase' ],
          leadingUnderscore: 'require',
        },
        {
          selector: 'parameterProperty',
          modifiers: [ 'private' ],
          format: [ 'camelCase' ],
          leadingUnderscore: 'forbid',
        },
        {
          selector: 'typeLike',
          format: [ 'PascalCase' ],
        },
        {
          selector: 'enum',
          format: [ 'UPPER_CASE' ],
        },
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowWithDecorator: true }, // Angular uses empty decorated classes (@NgModule) all the time
      ],
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            // Angular Router handles navigation failures.
            { from: 'package', name: 'navigate', package: '@angular/router' },
            { from: 'package', name: 'navigateByUrl', package: '@angular/router' },
          ],
        },
      ],
      '@typescript-eslint/no-implicit-any-catch': 'off', // Already covered by tsconfig strict
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          enforceConst: true,
          ignore: [ 0, 1 ],
          ignoreEnums: true,
        },
      ],
      // I think this was done to match https://palantir.github.io/tslint/rules/no-shadowed-variable/
      '@typescript-eslint/no-shadow': [
        'error',
        { hoist: 'all' },
      ],
      // Since we require a lot of typedefs having this rule would make things difficult
      '@typescript-eslint/no-type-alias': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off', // I prefer explicit types.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off', // We are not using var so this is not needed
      '@typescript-eslint/non-nullable-type-assertion-style': 'off', // I think using `!` is bad
      '@typescript-eslint/parameter-properties': [
        'error',
        { prefer: 'parameter-property' },
      ],
      '@typescript-eslint/prefer-namespace-keyword': 'off', // conflicts with no-namespace
      // I cannot figure out a nice way of having this. `advisors: Readonly<AdvisorMap>` doesn't work well.
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/require-array-sort-compare': [
        'error',
        { ignoreStringArrays: true },
      ],
      // Sometimes conflicts with @typescript-eslint/promise-function-async and I prefer that one
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableBoolean: true,
          allowNullableString: true,
        }
      ],
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: false,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
      '@typescript-eslint/unbound-method': [
        'error',
        { ignoreStatic: true },
      ],
      'accessor-pairs': 'off',
      // Sometimes it is nicer to return complicate/longer returns from a block. Try to use the shortest method.
      'arrow-body-style': 'off',
      'block-scoped-var': 'off',
      'camelcase': 'off', // Replaced with @typescript-eslint/naming-convention
      'capitalized-comments': 'off',
      'class-methods-use-this': 'off',
      'complexity': 'off',
      'consistent-this': 'off',
      'default-case': 'off',
      'eqeqeq': [ 'off', 'always', { null: 'ignore' } ], // eslint refuses to support undefined
      'func-name-matching': 'off',
      'func-style': [
        'error',
        'declaration',
        { allowArrowFunctions: true },
      ],
      'id-denylist': [
          'error', // This is the Rule Severity!
          'any',
          'Number',
          'number',
          'String',
          'string',
          'Boolean',
          'boolean',
          'Undefined',
          'undefined',
      ],
      'id-length': 'off', // Don't use short names that are confusing, but the rule is too inexact.
      'id-match': 'off',
      // eslint-plugin-import-x doesn't have an all config so this is just modifications to recommended
      'import-x/consistent-type-specifier-style': [ 'error', 'prefer-top-level' ],
      'import-x/exports-last': 'off', // conflicts with perfectionist/sort-modules
      'import-x/extensions': [ 'error', 'never', { json: 'always' } ],
      'import-x/first': 'error',
      'import-x/max-dependencies': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/no-amd': 'error',
      'import-x/no-anonymous-default-export': 'error',
      'import-x/no-commonjs': 'error',
      'import-x/no-cycle': [ 'error', { ignoreExternal: true } ],
      'import-x/no-default-export': 'error',
      'import-x/no-deprecated': 'off', // Use @typescript-eslint/no-deprecated instead
      'import-x/no-duplicates': 'error', // Change from warning to error
      'import-x/no-dynamic-require': 'warn',
      'import-x/no-empty-named-blocks': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.spec.ts',
            '**/testing/**/*.ts',
            'cypress.config.ts',
            'cypress/**/*.ts',
          ],
        },
      ],
      'import-x/no-import-module-exports': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-named-default': 'error',
      'import-x/no-namespace': 'error',
      'import-x/no-nodejs-modules': 'error',
      'import-x/no-relative-parent-imports': 'off', // tsconfig.paths make this less necessary, and angular style is incompatible
      'import-x/no-rename-default': 'warn',
      'import-x/no-self-import': 'error',
      'import-x/no-unassigned-import': 'error',
      'import-x/no-unused-modules': [ // Might be deprecated https://github.com/un-ts/eslint-plugin-import-x/issues/90#issuecomment-2213222134
        'off', // Doesn't with or without src option: 'No ESLint configuration found in src.'
        {
          missingExports: true,
          src: [ './src' ],
          unusedExports: true,
        },
      ],
      'import-x/no-useless-path-segments': 'error',
      'import-x/order': 'off', // Use perfectionist/sort-imports instead
      'line-comment-position': 'off',
      'max-classes-per-file': [ 'error', 1 ],
      // Ideally we would consider this, but in practice it is just annoying, esp with spec files.
      'max-lines-per-function': 'off',
      'max-params': 'off', // Angular and Rob both use a lot of parameters
      // Could probably turn this on as a warning again, but not sure what number to give, default 10 is too few
      'max-statements': 'off',
      'new-cap': [
        'error',
        { capIsNew: false },
      ],
      'no-class-assign': 'off', // tsc already checks for this
      'no-console': [
        'error',
        {
          allow: [
            'error',
            'warn',
          ],
        },
      ],
      'no-duplicate-imports': 'off', // Doesn't understand the difference between import and import type
      'no-eq-null': 'off', // I don't want === null || === undefined
      'no-extend-native': 'off', // Code review will catch this and it seems unlikey I will accidentally do it.
      'no-extra-label': 'off', // I doubt I will actually use labels ever
      'no-global-assign': 'off', // Seems likely tsc will catch this, and rare to have happen.
      'no-implicit-coercion': [
        'error',
        { allow: [ '!!' ] },
      ],
      'no-implicit-globals': 'off', // TypeScript, NodeJS, and Angular all make this unnecessary I believe
      'no-inline-comments': 'off',
      'no-invalid-this': 'off', // Seems likely tsc will catch this, and rare to have happen.
      'no-iterator': 'off',
      'no-label-var': 'off',
      'no-labels': 'off',
      'no-lone-blocks': 'off',
      'no-loss-of-precision': 'off', // Match TS rule
      'no-magic-numbers': [ // Match TS rule
        'off', // replaced with TS version
        { enforceConst: true },
      ],
      'no-multi-str': 'off', // Unlikely we will do this
      'no-new': 'off',
      'no-new-func': 'off',
      'no-new-native-nonconstructor': 'off', // tsc already checks for this
      'no-new-object': 'off',
      'no-octal-escape': 'off',
      'no-plusplus': 'off', // Developers should know how to use this
      'no-promise-executor-return': 'off',
      'no-proto': 'off',
      'no-script-url': 'off',
      'no-self-compare': 'off',
      'no-sequences': 'off',
      'no-shadow': [ // Match TS rule
        'off',
        { hoist: 'all' },
      ],
      'no-ternary': 'off',
      'no-undef-init': 'error',
      'no-undefined': 'off', // TypeScript uses undefined
      'no-underscore-dangle': 'off',
      'no-unmodified-loop-condition': 'off',
      'no-unneeded-ternary': [
        'error',
        { defaultAssignment: false },
      ],
      'no-unreachable-loop': 'off',
      'no-unsafe-optional-chaining': 'off', // tsc already checks for this
      'no-unused-labels': 'off',
      'no-unused-private-class-members': 'off', // tsc already checks for this
      'no-unused-vars': [ // Match TS rule
        'off',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      'no-useless-call': 'off',
      'no-useless-computed-key': 'off',
      'no-useless-concat': 'off',
      'no-useless-rename': 'off',
      'no-useless-return': 'off',
      'no-warning-comments': 'off',
      'one-var': 'off',
      'operator-assignment': 'off',
      // Modifications to the perfectionist/recommended-alphabetical config
      'perfectionist/sort-classes': 'off', // Use @typescript-eslint/member-ordering instead
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            [
              'builtin',
              'external',
              'type',
            ],
            [
              'internal',
              'internal-type',
            ],
            [
              'parent',
              'parent-type',
              'sibling',
              'sibling-type',
            ],
            [
              'index',
              'index-type',
            ],
            'object',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-interfaces': [
        'error',
        {
          customGroups: [
            {
               groupName: 'top',
               selector: 'property',
               elementNamePattern: '^id$',
            },
          ],
          ignoreCase: false,
          groups: [
            'index-signature',
            'top',
            'unknown',
          ],
          partitionByNewLine: true,
        }
      ],
      'perfectionist/sort-intersection-types': 'off', // use @typescript-eslint/sort-type-constituents instead
      'perfectionist/sort-objects': [
        'error',
        // Configuration for decorator objects - don't sort them (handled by angular-eslint)
        {
          type: 'unsorted',
          useConfigurationIf: {
            callingFunctionNamePattern: '^(?:Component|Injectable|Directive|Pipe|NgModule|Input|Output|ViewChild|ViewChildren|ContentChild|ContentChildren|HostBinding|HostListener)$',
          }
        },
        // Configuration specifically for Angular Routes
        {
          customGroups: [
            {
              groupName: 'route-path',
              elementNamePattern: '^path(Match)?$'
            },
            {
              groupName: 'route-children',
              elementNamePattern: '^children$'
            }
          ],
          groups: [
            'route-path',     // path, pathMatch first
            'unknown',        // All other route properties
            'route-children'  // children last
          ],
          partitionByComment: true,
          useConfigurationIf: {
            allNamesMatchPattern: '^(path|pathMatch|redirectTo|component|loadComponent|loadChildren|children|canActivate|canActivateChild|canDeactivate|canMatch|resolve|data|title|matcher)$',
          },
        },
        // Configuration specifically for Angular Providers
        {
          customGroups: [
            {
              groupName: 'provider-deps',
              elementNamePattern: '^deps$',
            }
          ],
          groups: [
            'unknown',       // All provider properties
            'provider-deps'  // deps last
          ],
          useConfigurationIf: {
            allNamesMatchPattern: '^(provide|useClass|useFactory|useValue|useExisting|deps|multi)$',
          },
        },
        // Fallback configuration for all other objects
        {
          customGroups: [
            {
              groupName: 'id',
              elementNamePattern: '^id$',
            },
          ],
          groups: [
            'id',      // Always first if present
            'unknown', // Everything else alphabetically
          ],
          partitionByComment: true,
        }
      ],
      'perfectionist/sort-union-types': 'off', // Use @typescript-eslint/sort-type-constituents instead
      'prefer-arrow-callback': 'off',
      'preferArrow/prefer-arrow-functions': [
        'warn',
        {
          returnStyle: 'implicit',
        },
      ],
      'prefer-destructuring': [
        'error',
        {
          array: true,
          object: true,
        },
        { enforceForRenamedProperties: false },
      ],
      'prefer-exponentiation-operator': 'off',
      'prefer-numeric-literals': 'off',
      'prefer-regex-literals': [
        'error',
        { disallowRedundantWrapping: true },
      ],
      // eslint-plugin-promise doesn't have an all so this is just modifications to recommended
      'promise/prefer-await-to-callbacks': 'error', // This can be triggered by rxjs catchError((err) => {}) :-(
      'promise/prefer-await-to-then': 'error',
      'require-await': 'off', // Match TS rule
      // @smarttools/eslint-plugin-rxjs doesn't have an all so this is all the non-recommended rules at the time
      'rxjs/ban-observables': 'off',
      'rxjs/ban-operators': 'off',
      'rxjs/finnish': [
        'warn',
        {
          functions: false,
          methods: false,
          parameters: false,
        },
      ],
      'rxjs/just': 'off',
      'rxjs/macro': 'off',
      'rxjs/no-compat': 'error',
      'rxjs/no-connectable': 'error',
      'rxjs/no-cyclic-action': 'off', // Seems like an NgRx thing I don't need
      'rxjs/no-explicit-generics': 'off', // I prefer explicit types.
      'rxjs/no-exposed-subjects': 'error',
      'rxjs/no-finnish': 'off', // I prefer finnish sometimes
      'rxjs/no-ignored-error': 'error',
      'rxjs/no-ignored-observable': 'error',
      'rxjs/no-ignored-subscribe': 'error',
      'rxjs/no-ignored-subscription': 'off', // I use takeUntil to unsubscribe
      'rxjs/no-subclass': 'error',
      'rxjs/no-subject-value': 'error',
      'rxjs/no-subscribe-handlers': 'error',
      'rxjs/no-topromise': 'error',
      'rxjs/no-unsafe-catch': 'error',
      'rxjs/no-unsafe-first': 'error',
      'rxjs/no-unsafe-switchmap': 'error',
      'rxjs/prefer-observer': 'error',
      'rxjs/suffix-subjects': 'error',
      'rxjs/throw-error': 'error',
      'sort-imports': 'off', // Using perfectionist/sort-imports instead
      'sort-keys': 'off', // Use perfectionist/sort-objects instead
      'sort-vars': 'off', // This doesn't sort multiple let or consts so it's not useful
      'strict': [ 'error', 'never' ], // NodeJS and TypeScript are always strict
      'tsdoc/syntax': 'warn',
      'unicode-bom': 'off',
      'unicorn/catch-error-name': [
        'error',
        { name: 'err' },
      ],
      // Also applies to callbacks defined within the same file which make this rule silly IMPO
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-keyword-prefix': 'off', // Not actually all that confusing IMPO
      'unicorn/no-unused-properties': 'off', // tsconfig already covers this
      'unicorn/no-useless-undefined': [
        'error',
        { 'checkArguments': false }, // Sometimes manually passing undefined to a function makes typescript happier
      ],
      'unicorn/prefer-export-from': [
        'error',
        { ignoreUsedVariables: true },
      ],
      // This rule seems like a legacy thing and may actually be worse. TypeScript can import JSON files directly so we don't need it.
      'unicorn/prefer-json-parse-buffer': 'off',
      'unicorn/prefer-top-level-await': 'off', // The “module” option in “tsconfig.json” has to be set to esnext or system for this
      // I think some of these are silly. `e` is bad, but `err` and `exc` are decent. `user of users` is confusing, `usr of users` is safer.
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/string-content': 'off', // Doesn't actually work on HTML where this would be most useful.
      'vars-on-top': 'off',
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
      ],
    },
  },
  {
    files: [ '**/*.html' ],
    ignores: [
      'cypress/**/*.html',
      'docs/**/*.html',
      'dist/**/*.html',
      'src/index.html',
    ],
    extends: [ angular.configs.templateAll ],
    rules: {
      '@angular-eslint/template/attributes-order': [
        'error',
        {
          'alphabetical': false,
          'order': [
            'TEMPLATE_REFERENCE',
            'STRUCTURAL_DIRECTIVE',
            'OUTPUT_BINDING',
            'TWO_WAY_BINDING',
            'INPUT_BINDING',
            'ATTRIBUTE_BINDING',
          ]
        }
      ],
      '@angular-eslint/template/cyclomatic-complexity': 'off',
      '@angular-eslint/template/eqeqeq': [
        'error',
        { allowNullOrUndefined: true },
      ],
      '@angular-eslint/template/no-autofocus': 'off',
      '@angular-eslint/template/no-call-expression': [
        'error',
        { allowPrefix: '$' },
      ],
      '@angular-eslint/template/i18n': [
        'error',
        {
          requireDescription: true,
          requireMeaning: true,
          ignoreAttributes: [
            'accept', // File input accept attribute
            'aria-controls',
            'aria-describedby',
            'aria-labelledby',
            'ngSrc',
          ],
        },
      ],
      '@angular-eslint/template/no-inline-styles': [
        'error',
        {
          allowNgStyle: true,
          allowBindToStyle: true,
        }
      ],
      '@angular-eslint/template/no-interpolation-in-attributes': 'off', // Interpolation is fine
    },
  },
  {
    // Disable rules for inline templates in spec & testing files
    // https://github.com/angular-eslint/angular-eslint/issues/1023#issuecomment-2607207815
    files: [ '**/*.spec.ts*.html', 'src/testing/**/*.html' ],
    rules: { '@angular-eslint/template/i18n': 'off' }
  },
  {
    files: [
      '**/*.spec.ts',
      'src/testing/**/*.ts',
    ],
    extends: [ jasmine.configs.recommended ],
    plugins: { jasmine },
    'rules': {
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/use-component-selector': 'off',
      '@angular-eslint/use-injectable-provided-in': 'off',
      '@typescript-eslint/unbound-method': 'off', // Jasmine expect(spy) triggers this a bunch
      'import-x/max-dependencies': 'off', // So many imports needed for testing
      // eslint-plugin-jasmine doesn't have an all config, so this is just cusomizations on the recommendations
      'jasmine/named-spy': 'error',
      'jasmine/no-spec-dupes': [ 'warn', 'branch' ],
      'jasmine/no-focused-tests': 'off', // jasmine already warns us about this.
      'jasmine/prefer-toBeUndefined': 'error',
      'max-classes-per-file': 'off',
      'max-lines': 'off',
      'rxjs/no-subscribe-handlers': 'off', // Useful shorthand for testing
    },
  },
);

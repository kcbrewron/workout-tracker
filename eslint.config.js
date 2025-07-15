import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
	js.configs.recommended,
	{
		files: ['**/*.{js,ts,svelte}'],
		plugins: {
			'@typescript-eslint': tseslint,
			svelte: sveltePlugin
		},
		languageOptions: {
			parser: tsparser,
			globals: {
				console: 'readonly',
				process: 'readonly',
				window: 'readonly',
				document: 'readonly',
				localStorage: 'readonly',
				navigator: 'readonly',
				fetch: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				confirm: 'readonly',
				self: 'readonly',
				global: 'readonly'
			}
		},
		rules: {
			...tseslint.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-self-assign': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		plugins: {
			svelte: sveltePlugin
		},
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsparser
			}
		},
		rules: {
			...sveltePlugin.configs.recommended.rules,
			'svelte/no-at-html-tags': 'warn'
		}
	},
	{
		files: ['**/*.test.js', '**/test/**/*.js', '**/tests/**/*.js'],
		languageOptions: {
			globals: {
				beforeEach: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				vi: 'readonly',
				test: 'readonly'
			}
		}
	},
	{
		ignores: ['.svelte-kit/**', 'build/**', 'dist/**', 'node_modules/**']
	}
];
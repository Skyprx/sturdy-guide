import { defineTest } from 'jscodeshift/dist/testUtils';

const testNames = [
  'basic',
  'decorators',
  'parameters',
  'story-parameters',
  'exclude-stories',
  'story-function',
];

testNames.forEach(testName => {
  defineTest(__dirname, `convert-module-to-mdx`, null, `convert-module-to-mdx/${testName}`);
});

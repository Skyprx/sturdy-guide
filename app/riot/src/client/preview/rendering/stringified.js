import { mount, unregister, tag2 as tag } from 'riot';
import * as riot from 'riot';
import compiler from 'riot-compiler';
import { document } from 'global';
import { alreadyCompiledMarker, getRidOfRiotNoise, setConstructor } from '../compileStageFunctions';

function guessRootName(stringified) {
  const whiteSpaceLocation = stringified.indexOf(' ', stringified.indexOf('<') + 1);
  const firstWhitespace = whiteSpaceLocation === -1 ? stringified.length : whiteSpaceLocation;
  const supposedName = stringified.trim().match(/^<[^ >]+\/>$/)
    ? stringified.trim().replace(/[<>/]/g, '')
    : stringified.substring(
        stringified.indexOf('<') + 1,
        Math.min(firstWhitespace, stringified.indexOf('>'))
      );
  const matchingBuiltInTag = document.createElement(supposedName).constructor.name;
  return matchingBuiltInTag === 'HTMLUnknownElement' ? supposedName : 'storybook-root';
}

function compileText(code, rootName) {
  const sourceCodeEndOfHtml =
    (Math.min(code.indexOf('<style') + 1, code.indexOf('<script') + 1) || code.length + 1) - 1;
  const sourceCodeReformatted =
    code.substring(0, sourceCodeEndOfHtml).replace(/[\n\r\s]+/g, ' ') +
    code.substring(sourceCodeEndOfHtml);
  const sourceCode =
    rootName === 'storybook-root'
      ? `<storybook-root>${sourceCodeReformatted}</storybook-root>`
      : sourceCodeReformatted;
  return compiler.compile(sourceCode, {}).replace(alreadyCompiledMarker, '').trim();
}

export default function renderStringified({
  tags,
  template = `<${(tags[0] || []).boundAs || guessRootName(tags[0] || '')}/>`,
  tagConstructor,
}) {
  const tag2 = tag;
  tags.forEach((input) => {
    const oneTag = input || {};
    const rootName = oneTag.boundAs || guessRootName(oneTag);
    const { content } = oneTag;
    const code = content ? content.trim() : input || '';
    const compiled = code.includes(alreadyCompiledMarker) ? code : compileText(code, rootName);
    unregister(rootName);
    eval(getRidOfRiotNoise(`${compiled}`)); // eslint-disable-line no-eval
  });
  const sourceCode = compiler.compile(`<storybook-root>${template}</storybook-root>`, {});

  let final;
  if (tagConstructor) {
    final = setConstructor(sourceCode, tagConstructor);
  } else {
    final = sourceCode;
  }

  if (template !== '<storybook-root/>') {
    eval(getRidOfRiotNoise(final)); // eslint-disable-line no-eval
  }

  mount('*');
}

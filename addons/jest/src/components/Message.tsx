import React, { Fragment } from 'react';
import { styled } from '@storybook/theming';

const positiveConsoleRegex = /\[32m(.*?)\[39m/;
const negativeConsoleRegex = /\[31m(.*?)\[39m/;
const positiveType = 'positive';
const negativeType = 'negative';
const endToken = '[39m';
const failStartToken = '[31m';
const passStartToken = '[32m';
const stackTraceStartToken = 'at';
const titleEndToken = ':';

type MsgElement = string | JSX.Element;

class TestDetail {
  description: MsgElement[];

  result: MsgElement[];

  stackTrace: string;
}
const StackTrace = styled.pre<{}>(({ theme }) => ({
  background: theme.color.lighter,
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: '6px',
  borderRadius: '2px',
  overflow: 'auto',
  margin: '10px 30px 10px 30px',
  whiteSpace: 'pre',
}));

const Results = styled.div({
  paddingTop: '10px',
  marginLeft: '31px',
  marginRight: '30px',
});

const Description = styled.div<{}>(({ theme }) => ({
  paddingBottom: '10px',
  paddingTop: '10px',
  borderBottom: theme.appBorderColor,
  marginLeft: '31px',
  marginRight: '30px',
  overflowWrap: 'break-word',
}));

const StatusColor = styled.strong<{ status: string }>(({ status, theme }) => ({
  color: status === positiveType ? theme.color.positive : theme.color.negative,
  fontWeight: 500,
}));

const Main = styled(({ msg, className }) => <section className={className}>{msg}</section>)({
  padding: 5,
});

const colorizeText: (msg: string, type: string) => MsgElement[] = (msg: string, type: string) => {
  if (type) {
    return msg
      .split(type === positiveType ? positiveConsoleRegex : negativeConsoleRegex)
      .map((i, index) =>
        index % 2 ? (
          <StatusColor key={`${type}_${i}`} status={type}>
            {i}
          </StatusColor>
        ) : (
          i
        )
      );
  }
  return [msg];
};

const getConvertedText: (msg: string) => MsgElement[] = (msg: string) => {
  let elementArray: MsgElement[] = [];

  if (!msg) return elementArray;

  const splitText = msg
    .split(/\[2m/)
    .join('')
    .split(/\[22m/);

  splitText.forEach(element => {
    if (element && element.trim()) {
      if (
        element.indexOf(failStartToken) > -1 &&
        element.indexOf(failStartToken) < element.indexOf(endToken)
      ) {
        elementArray = elementArray.concat(colorizeText(element, negativeType));
      } else if (
        element.indexOf(passStartToken) > -1 &&
        element.indexOf(passStartToken) < element.indexOf(endToken)
      ) {
        elementArray = elementArray.concat(colorizeText(element, positiveType));
      } else {
        elementArray = elementArray.concat(element);
      }
    }
  });
  return elementArray;
};

const getTestDetail: (msg: string) => TestDetail = (msg: string) => {
  const lines = msg.split('\n').filter(Boolean);

  const testDetail: TestDetail = new TestDetail();
  testDetail.description = getConvertedText(lines[0]);
  testDetail.stackTrace = '';
  testDetail.result = [];

  for (let index = 1; index < lines.length; index += 1) {
    const current = lines[index];
    const next = lines[index + 1];

    if (
      current
        .trim()
        .toLowerCase()
        .indexOf(stackTraceStartToken) === 0
    ) {
      testDetail.stackTrace += `${current.trim()}\n`;
    } else if (current.trim().indexOf(titleEndToken) > -1) {
      let title;
      let value = null;
      if (current.trim().indexOf(titleEndToken) === current.length - 1) {
        // there are breaks in the middle of result
        title = current.trim();
        value = getConvertedText(next);
        index += 1;
      } else {
        // results come in a single line
        title = current.substring(0, current.indexOf(titleEndToken)).trim();
        value = getConvertedText(current.substring(current.indexOf(titleEndToken), current.length));
      }
      testDetail.result = [...testDetail.result, title, ' ', ...value, <br key={index} />];
    } else {
      // results come in an unexpected format
      testDetail.result = [...testDetail.result, ' ', ...getConvertedText(current)];
    }
  }

  return testDetail;
};

interface MessageProps {
  msg: string;
}

export const Message = (props: any) => {
  const { msg } = props;

  const detail: TestDetail = getTestDetail(msg);
  return (
    <Fragment>
      {detail.description ? <Description>{detail.description}</Description> : null}
      {detail.result ? <Results>{detail.result}</Results> : null}
      {detail.stackTrace ? <StackTrace>{detail.stackTrace}</StackTrace> : null}
    </Fragment>
  );
};

export default Message;

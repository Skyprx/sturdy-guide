/* eslint-disable no-case-declarations */
import { PTType } from './types';
import { SBType } from '../types';

export const convert = (type: PTType): SBType | any => {
  const { name, raw, computed, value } = type;
  const base: any = {};
  if (typeof raw !== 'undefined') base.raw = raw;
  switch (name) {
    case 'enum': {
      const values = computed ? value : value.map((v: PTType) => v.value);
      return { ...base, name, value: values };
    }
    case 'string':
    case 'number':
    case 'symbol':
      return { ...base, name };
    case 'func':
      return { ...base, name: 'function' };
    case 'bool':
      return { ...base, name: 'boolean' };
    case 'arrayOf':
      return { ...base, name: 'array', value: convert(value as PTType) };
    case 'object':
      return { ...base, name };
    case 'objectOf':
      return { ...base, name, value: convert(value as PTType) };
    case 'shape':
    case 'exact':
      const values = Object.keys(value).reduce((acc: any, key) => {
        acc[key] = convert(value[key]);
        return acc;
      }, {});
      return { ...base, name: 'object', value: values };
    case 'union':
      return { ...base, name: 'union', value: value.map((v: PTType) => convert(v)) };
    case 'instanceOf':
    case 'element':
    case 'elementType':
    default:
      const otherVal = value ? `${name}(${value})` : name;
      return { ...base, name: 'other', value: otherVal };
  }
};

/* eslint-disable no-underscore-dangle */
/* global window */

import { PropDef } from '@storybook/components';
import { ArgType, ArgTypes } from '@storybook/api';
import { Argument, CompodocJson, Component, Method, Property, Directive } from './types';

type Sections = Record<string, PropDef[]>;

export const isMethod = (methodOrProp: Method | Property): methodOrProp is Method => {
  return (methodOrProp as Method).args !== undefined;
};

export const setCompodocJson = (compodocJson: CompodocJson) => {
  // @ts-ignore
  window.__STORYBOOK_COMPODOC_JSON__ = compodocJson;
};

// @ts-ignore
export const getCompdocJson = (): CompodocJson => window.__STORYBOOK_COMPODOC_JSON__;

export const checkValidComponentOrDirective = (component: Component | Directive) => {
  if (!component.name) {
    throw new Error(`Invalid component ${JSON.stringify(component)}`);
  }
};

export const checkValidCompodocJson = (compodocJson: CompodocJson) => {
  if (!compodocJson || !compodocJson.components) {
    throw new Error('Invalid compodoc JSON');
  }
};

const hasDecorator = (item: Property, decoratorName: string) =>
  item.decorators && item.decorators.find((x: any) => x.name === decoratorName);

const mapPropertyToSection = (key: string, item: Property) => {
  if (hasDecorator(item, 'ViewChild')) {
    return 'view child';
  }
  if (hasDecorator(item, 'ViewChildren')) {
    return 'view children';
  }
  if (hasDecorator(item, 'ContentChild')) {
    return 'content child';
  }
  if (hasDecorator(item, 'ContentChildren')) {
    return 'content children';
  }
  return 'properties';
};

const mapItemToSection = (key: string, item: Method | Property): string => {
  switch (key) {
    case 'methodsClass':
      return 'methods';
    case 'inputsClass':
      return 'inputs';
    case 'outputsClass':
      return 'outputs';
    case 'propertiesClass':
      if (isMethod(item)) {
        throw new Error("Cannot be of type Method if key === 'propertiesClass'");
      }
      return mapPropertyToSection(key, item);
    default:
      throw new Error(`Unknown key: ${key}`);
  }
};

export const findComponentByName = (name: string, compodocJson: CompodocJson) =>
  compodocJson.components.find((c: Component) => c.name === name) ||
  compodocJson.directives.find((c: Directive) => c.name === name);

const getComponentData = (component: Component | Directive) => {
  if (!component) {
    return null;
  }
  checkValidComponentOrDirective(component);
  const compodocJson = getCompdocJson();
  checkValidCompodocJson(compodocJson);
  const { name } = component;
  return findComponentByName(name, compodocJson);
};

const displaySignature = (item: Method): string => {
  const args = item.args.map(
    (arg: Argument) => `${arg.name}${arg.optional ? '?' : ''}: ${arg.type}`
  );
  return `(${args.join(', ')}) => ${item.returnType}`;
};

export const extractArgTypesFromData = (componentData: Directive) => {
  const sectionToItems: Record<string, ArgType[]> = {};
  const compodocClasses = ['propertiesClass', 'methodsClass', 'inputsClass', 'outputsClass'];
  type COMPODOC_CLASS = 'propertiesClass' | 'methodsClass' | 'inputsClass' | 'outputsClass';

  compodocClasses.forEach((key: COMPODOC_CLASS) => {
    const data = componentData[key] || [];
    data.forEach((item: Method | Property) => {
      const section = mapItemToSection(key, item);
      const argType = {
        name: item.name,
        description: item.description,
        defaultValue: { summary: isMethod(item) ? '' : item.defaultValue },
        table: {
          category: section,
          type: {
            summary: isMethod(item) ? displaySignature(item) : item.type,
            required: isMethod(item) ? false : !item.optional,
          },
        },
      };

      if (!sectionToItems[section]) {
        sectionToItems[section] = [];
      }
      sectionToItems[section].push(argType);
    });
  });

  const SECTIONS = [
    'inputs',
    'outputs',
    'properties',
    'methods',
    'view child',
    'view children',
    'content child',
    'content children',
  ];
  const argTypes: ArgTypes = {};
  SECTIONS.forEach((section) => {
    const items = sectionToItems[section];
    if (items) {
      items.forEach((argType) => {
        argTypes[argType.name] = argType;
      });
    }
  });

  return argTypes;
};

export const extractArgTypes = (component: Component | Directive) => {
  const componentData = getComponentData(component);
  return componentData && extractArgTypesFromData(componentData);
};

export const extractComponentDescription = (component: Component | Directive) => {
  const componentData = getComponentData(component);
  if (!componentData) {
    return null;
  }
  return componentData.rawdescription;
};

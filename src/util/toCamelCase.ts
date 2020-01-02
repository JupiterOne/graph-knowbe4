import camelCase from "lodash.camelcase";

export default function toCamelCase(data: { [key: string]: any }): any {
  const e: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const propertyName = camelCase(key);
      e[propertyName] = sanitizeValue(propertyName, value);
    } else if (Array.isArray(value)) {
      e[camelCase(key)] = value.filter(
        item =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean",
      );
    }
  }
  return e;
}

const DATE_PROPERTY_NAME = /(On|Date|SignIn)$/;

function sanitizeValue(name: string, value: any): any {
  if (DATE_PROPERTY_NAME.exec(name) && typeof value === "string") {
    return Date.parse(value);
  }
  return value;
}

import camelCase from "lodash.camelcase";

export default function toCamelCase(data: { [key: string]: any }): any {
  const e: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      e[camelCase(key)] = value;
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

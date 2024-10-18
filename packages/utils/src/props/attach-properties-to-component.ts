export function attachPropertiesToComponent<
  C,
  P extends Record<string, unknown>,
>(component: C, properties: P): C & P {
  const ret = component as Record<string, unknown>;
  for (const key in properties) {
    // eslint-disable-next-line no-prototype-builtins
    if (properties.hasOwnProperty(key)) {
      ret[key] = properties[key];
    }
  }
  return ret as C & P;
}

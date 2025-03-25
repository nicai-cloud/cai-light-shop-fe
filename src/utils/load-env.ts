export function getBooleanEnv(envVar: string | undefined, defaultValue: boolean = false): boolean {
    if (envVar === undefined) {
      return defaultValue;
    }
    return envVar.toLowerCase() === 'true';
}

export function getNumberEnv(envVar: string | undefined, defaultValue: number = 0): number {
  if (envVar === undefined) {
    return defaultValue;
  }
  return Number(envVar);
}

// Minimal GSAP module shim — silences TS, runtime is the real package.
declare module "gsap" {
  const gsap: any;
  export default gsap;
  export { gsap };
  export function registerPlugin(...plugins: any[]): void;
  export function timeline(vars?: any): any;
  export function from(targets: any, vars: any): any;
  export function to(targets: any, vars: any): any;
  export function fromTo(targets: any, fromVars: any, toVars: any): any;
  export function set(targets: any, vars: any): any;
  export function killTweensOf(targets: any): void;
  export const utils: { toArray: <T>(input: any) => T[] };
  export interface ContextReturn {
    revert: () => void;
  }
  export function context(fn: () => void, scope?: any): ContextReturn;
}

declare module "gsap/ScrollTrigger" {
  export const ScrollTrigger: any;
}

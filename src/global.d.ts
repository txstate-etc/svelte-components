import '@sveltejs/kit'

declare module '$app/paths' {
  export function resolve (route: string): string
}

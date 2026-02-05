/// <reference types="vite/client" />

declare module '*.glsl' {
  const value: string
  export default value
}

declare module '*.vert' {
  const value: string
  export default value
}

declare module '*.frag' {
  const value: string
  export default value
}

declare module '*.css' {
  const classes: { [key: string]: string }
  export default classes
}

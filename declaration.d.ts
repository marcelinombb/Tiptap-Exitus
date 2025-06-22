declare module '*.jpg'
declare module '*.png'
declare module '*.svg'

declare module 'dictionary-pt-br' {
  import { Buffer } from 'buffer';

  interface Dictionary {
    aff: Buffer
    dic: Buffer
  }

  type DictionaryCallback = (error: Error | null, dictionary?: Dictionary) => void

  const load: (callback: DictionaryCallback) => void

  export = load
}

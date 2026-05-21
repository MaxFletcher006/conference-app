/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PRICE_PER_DAY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

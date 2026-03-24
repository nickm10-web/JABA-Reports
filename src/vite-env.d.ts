/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AVAILABLE_REPORTS?: string;
  readonly VITE_SCRAPECREATORS_API_KEY?: string;
  readonly VITE_SCRAPECREATORS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

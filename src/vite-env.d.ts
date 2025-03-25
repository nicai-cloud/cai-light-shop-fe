/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GIFT_SHOP_API: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

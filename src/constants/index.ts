export * from './webrtc_constants'
export * from './websockets_constants'
export * from './jwt_constants'
export * from './permissions'

export const DATABASE_PATH = process.env.DATABASE_URL ?? './data/auth.sqlite'
export const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`
export const TRUSTED_ORIGINS = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://cam.local']

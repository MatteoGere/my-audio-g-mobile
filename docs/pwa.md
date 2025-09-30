# Progressive Web App setup

This project now ships with a basic Progressive Web App configuration so users can install it and launch it fullscreen.

## What's included

- **Manifest** at `/manifest.webmanifest` with `display_override` requesting fullscreen mode and references to the existing brand icons.
- **Service worker** at `/service-worker.js` that precaches the app shell, serves static assets offline, and keeps runtime assets fresh.
- **Client registration** via `ServiceWorkerRegister` (rendered from `src/app/layout.tsx`) that registers the worker and keeps it up to date in the background.
- **Apple Web App metadata** in the root layout enabling standalone fullscreen launch on iOS.
- **Install CTA**: a banner in the main layout and an action in the header using the design system buttons to trigger the native install prompt when disponibile.

## Installare l'app

Quando il browser segnala che l'app può essere installata, gli utenti vedranno:

- Un banner nella parte alta della UI principale con il pulsante **“Installa ora”** e l'opzione **“Più tardi”**.
- Un pulsante con l'icona del dispositivo nella barra superiore (Header) per ripetere l'azione in qualsiasi momento finché l'installazione è disponibile.

Entrambe le azioni sfruttano l'evento `beforeinstallprompt`. Se l'utente rimanda l'installazione il banner scompare, ma il pulsante nell'Header resta visibile fino a quando l'installazione viene completata o non risulta più supportata.

## Local development tips

- Service workers only control pages that are loaded after `navigator.serviceWorker.register(...)` runs. Reload the app after changes or unregister the previous worker from the browser devtools.
- In development the registration runs on `localhost` and logs to the console; during production builds it stays silent.
- When iterating on the worker, run `npm run build` once so the worker file in `public/` is served without caching issues.

## Updating the worker

- Bump the `CACHE_VERSION` string inside `public/service-worker.js` whenever you change the caching strategy so stale caches are cleared on the next install.
- Optionally, send `{ type: 'SKIP_WAITING' }` messages to the worker if you introduce an in-app update flow; the worker already listens for that event.

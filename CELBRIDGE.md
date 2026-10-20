# Pitch Circles in Celbridge (Deno)

A TypeScript app (an HTML canvas, no libraries), built with Deno. Not using Celbridge? See `README_deno_tooling.md`.

## Running it in Celbridge

Open `Pitch Circles.celbridge` in Celbridge. The console at the bottom starts by itself and runs `deno task dev`:

1. **builds** `src/` (TypeScript) into `dist/app.js`, and copies `public/` (the page and its
   CSS) into `dist/`. Only files that have changed are copied
2. **tests** everything in `tests/`, printing the results in the console and writing a readable report to
   `test_output/index.html`. The report also lists TypeScript errors and lint warnings
3. **watches**: every time you save a file in `src/`, `public/` or `tests/`, it does it all again

`dist/index.html` opens beside the console. After a rebuild, press its preview's **refresh** button to see
your changes. The clipboard icon opens the test report.

The console's buttons: rebuild-and-watch, build once, test once, and lint. To use them while the watcher is
running, press **Ctrl+C** first to stop it.

## Where things go

| Folder | What goes in it |
|---|---|
| `src/` | the app's TypeScript code. `src/main.ts` is where it starts (see `README.md` for the classes) |
| `public/` | `index.html`, `style.css` and `favicon.svg` |
| `tests/` | tests, in files ending `.test.ts` |

## Files for the Deno build

You never need to edit these:

- `Pitch Circles.celbridge`: the Celbridge project, with its shortcuts
- `terminal.console`: the console and its buttons
- `deno.json`: the Deno tasks and settings
- `build.ts`, `tools/test_report.ts`: the build and the test report
- `README_deno_tooling.md`: how to do all this without Celbridge
- `README_deno_install.md`: how to install Deno on Linux, macOS and Windows

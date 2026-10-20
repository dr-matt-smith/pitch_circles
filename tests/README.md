Tests go in this folder, in files ending `.test.ts`. Run them with `deno task test` (or the
clipboard button in the console). They test the model (`src/model/`) and the circle geometry,
which don't use Phaser, so they run without a browser.

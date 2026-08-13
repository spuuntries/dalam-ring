import { defineConfig } from "tsup";

export default defineConfig([
  // Widget: single IIFE bundle, minified, all deps inlined
  {
    entry: ["src/widget/index.ts"],
    format: ["iife"],
    globalName: "DaRing",
    outDir: "dist",
    minify: true,
    bundle: true,
    noExternal: [/.*/],
    platform: "browser",
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".gif": "dataurl" },
    outExtension: () => ({ js: ".widget.html" }),
    banner: {
      js: `/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>dalam(an)</title>
  <meta name="description" content="degenerate ahh group of ppl" />
  <link rel="canonical" href="https://spuun.art" />
  <meta property="og:title" content="dalam(an)" />
  <meta property="og:description" content="degenerate ahh group of ppl" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://spuun.art" />
  <meta property="og:image" content="/dontwaste.jpg" />
  <meta property="og:image:alt" content="dalam(an) banner" />
  <meta property="og:site_name" content="webring" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="dalam(an)" />
  <meta name="twitter:description" content="degenerate ahh group of ppl" />
  <meta name="twitter:image" content="/dontwaste.jpg" />
  <meta name="twitter:image:alt" content="dalam(an) banner" />
  <style>
    body { background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: "Times New Roman", Times, serif; color: #fff; }
    #standalone-widget { width: 380px; }
    .hidden-code { display: none; }
  </style>
</head>
<body>
  <div id="standalone-widget">
    <!-- Dynamically inject script to use current hostname as a bootstrap node -->
    <script>
      const s = document.createElement('script');
      s.src = window.location.href;
      s.setAttribute('data-ring-name', 'dalaman');
      s.setAttribute('data-ring', window.location.origin + ', https://spuun.art');
      document.currentScript.parentNode.insertBefore(s, document.currentScript.nextSibling);
    </script>
  </div>
  <div class="hidden-code">
*/`,
    },
  },
  // CLI: ESM, external deps
  {
    entry: ["src/cli/index.ts"],
    format: ["esm"],
    outDir: "dist/cli",
    bundle: true,
    platform: "node",
    target: "node18",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);

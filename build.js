import esbuild from "esbuild";
import copy from "esbuild-plugin-copy";

esbuild.build({
  entryPoints: ["src/interactive-light.js"],
  bundle: true,
  format: "esm",
  minify: true,

  outdir: "dist",

  entryNames: "interactive-light-min",

  plugins: [
    copy({
      assets: {
        from: ["./src/templates/**/*.hbs"],
        to: ["./templates"]
      },
    }),
    copy({
      assets: {
        from: ["./src/styles/**/*.css"],
        to: ["./styles"]
      }
    })
  ]
}).catch(() => process.exit(1));

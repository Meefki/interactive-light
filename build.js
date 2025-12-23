import esbuild from "esbuild";
import copy from "esbuild-plugin-copy";
import { sassPlugin } from "esbuild-sass-plugin";

esbuild.build({
  entryPoints: {
    "interactive-light-min": "src/interactive-light.js",
    "styles/interactive-light": "src/styles/interactive-light.scss"
  },

  bundle: true,
  format: "esm",
  minify: true,
  sourcemap: true,

  outdir: "dist",

  plugins: [
    sassPlugin({
      type: "css"
    }),

    copy({
      assets: {
        from: ["./src/templates/**/*.hbs"],
        to: ["./templates"]
      }
    }),

    copy({
      assets: {
        from: ["./src/styles/**/*.css"],
        to: ["./styles"]
      }
    })
  ]
}).catch(() => process.exit(1));

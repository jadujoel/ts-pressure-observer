
export async function build() {
  await Bun.build({
    entrypoints: ["index.html", "example.ts"],
    outdir: "dist"
  })
}

if (import.meta.main) {
  await build()
}

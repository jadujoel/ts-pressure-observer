import home from "./index.html"
import { build } from "./build"

export async function serve() {
  const server = Bun.serve({
    static: {
      "/": home
    },
    async fetch() {
      await build()
      return new Response(404)
    }
  })

  console.log(server.url.href)
}

if (import.meta.main) {
  await serve()
}

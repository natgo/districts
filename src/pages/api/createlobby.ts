export const prerender = false;

export async function GET() {
  return new Response(JSON.stringify(Math.round(Math.random() * 1000000)));
}

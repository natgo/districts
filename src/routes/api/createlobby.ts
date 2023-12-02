import { json } from "solid-start";

export async function POST() {
  const code = Math.round(Math.random() * 1000000);
  return json({ code });
}

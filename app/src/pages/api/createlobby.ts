import type { UserSchema } from "@/backend/db";
import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const userName = z.string().parse((await request.formData()).get("userName"));

  const user: UserSchema = {
    userName,
    sessionID: crypto.randomUUID(),
  };
  const responseBody = JSON.stringify(Math.round(Math.random() * 1000000));
  const response = new Response(responseBody);

  response.headers.append("Set-Cookie", `sessionID=${user.sessionID}; HttpOnly; Path=/`);
  return response;
};

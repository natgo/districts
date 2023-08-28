import { A } from "solid-start";

import { HttpHeader, HttpStatusCode } from "solid-start/server";

export default function NotFound() {
  return (
    <main class="mx-auto p-4 text-center text-gray-700">
      <HttpStatusCode code={404} />
      <HttpHeader name="my-header" value="header-value" />
      <h1 class="max-6-xs my-16 text-6xl font-thin uppercase text-sky-700">Not Found</h1>
      <p class="my-4">
        <A href="/" class="text-sky-600 hover:underline">
          Home
        </A>
        {" - "}
        <A href="/map" class="text-sky-600 hover:underline">
          Map
        </A>
      </p>
    </main>
  );
}

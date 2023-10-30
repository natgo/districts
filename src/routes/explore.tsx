import { A } from "solid-start";

export default function Home() {
  return (
    <main class="mx-auto p-4 text-center text-gray-700">
      <h1 class="max-6-xs my-16 text-6xl font-thin uppercase text-sky-700">Hello world!</h1>
      <p class="my-4">
        <A href="/" class="text-sky-600 hover:underline">
          Home
        </A>{" "}
        {" - "}
        <span>Explore</span>
      </p>
    </main>
  );
}

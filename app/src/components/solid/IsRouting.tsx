/** @jsxImportSource solid-js */
import "./IsRouting.modules.css";

export default function IsRouting() {
  const isRouting = useIsRouting();
  const duration = 8000;
  // delay property is not included, instead its within keyframes in order to work with Safari
  const animationName = "Page-Loading-Bar";
  const animationValue = () => (isRouting() ? `${animationName} ${duration}ms infinite` : "none");

  return (
    <div
      class="pointer-events-none absolute z-50 w-screen overflow-hidden"
      style={{ top: "0", height: "6px" }}
    >
      <div
        class="h-full w-full rounded-full bg-fuchsia-700"
        style={{
          transform: "translateX(-100%)",
          animation: animationValue(),
          "transform-origin": "left",
        }}
      />
    </div>
  );
}

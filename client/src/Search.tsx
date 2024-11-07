import { useRef } from "react";

export function Search({
  setVideoId,
}: {
  setVideoId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const inputRef = useRef(null);
  return (
    <>
      <input type="text" ref={inputRef} />
      <button onClick={() => setVideoId(inputRef.current.value)}>Submit</button>
    </>
  );
}

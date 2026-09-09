import React, { useRef, forwardRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuillWrapper = forwardRef((props, ref) => {
  const containerRef = useRef(null);

  return (
    <div ref={ref || containerRef}>
      <ReactQuill {...props} />
    </div>
  );
});

export default QuillWrapper;
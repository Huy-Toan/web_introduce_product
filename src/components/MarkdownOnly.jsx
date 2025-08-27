import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function MarkdownOnly({ value = "" }) {
  return (
    <div className="prose max-w-none text-justify">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Heading
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-3xl font-bold mt-4 mb-2" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-2xl font-semibold mt-3 mb-2" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-xl font-semibold mt-2 mb-1" />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="text-lg font-medium mt-2 mb-1" />
          ),
          h5: ({ node, ...props }) => (
            <h5 {...props} className="text-base font-medium mt-1 mb-1" />
          ),
          h6: ({ node, ...props }) => (
            <h6 {...props} className="text-sm font-medium mt-1 mb-1 uppercase" />
          ),

          // Danh sách
          ol: ({ node, ...props }) => (
            <ol {...props} className={"list-decimal ml-6 " + (props.className || "")} />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className={"list-disc ml-6 " + (props.className || "")} />
          ),
          li: ({ node, ...props }) => <li {...props} className={(props.className || "")} />,

          // Link
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="nofollow noopener noreferrer"
            />
          ),

          // Ảnh
          img: (props) => <img {...props} loading="lazy" alt={props.alt || ""} className="my-2" />,
        }}
      >
        {value || ""}
      </ReactMarkdown>
    </div>
  );
}

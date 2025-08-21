import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function MarkdownOnly({ value = "" }) {
  return (
    <div className="prose max-w-none text-justify">
      <ReactMarkdown
        children={value || ""}
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          ol: ({ node, ...props }) => (
            <ol {...props} className={"list-decimal ml-6 " + (props.className || "")} />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className={"list-disc ml-6 " + (props.className || "")} />
          ),
          li: ({ node, ...props }) => <li {...props} className={(props.className || "")} />,

          img: (props) => <img {...props} loading="lazy" alt={props.alt || ""} />,
          a: (props) => <a {...props} target="_blank" rel="nofollow noopener noreferrer" />,
        }}
      />
    </div>
  );
}

import { Fragment, type ReactNode } from "react";
import pages from "../support/pages.json";

const hrefs = new Set(Object.values(pages).map((page) => page.href));
function inline(text: string): ReactNode[] {
  const tokens =
    /(\[[^\]\n]+\]\(\/[^)\s]*\)|\*\*[^*\n]+\*\*|`[^`\n]+`|\/(?:[a-z0-9_-]+\/?)+(?:#[a-z0-9_-]+)?)/gi;
  const result: ReactNode[] = [];
  let start = 0;
  for (const match of text.matchAll(tokens)) {
    const at = match.index!;
    if (at > start) result.push(text.slice(start, at));
    const token = match[0];
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
    if (link && hrefs.has(link[2]))
      result.push(
        <a href={link[2]} key={at}>
          {link[1]}
        </a>,
      );
    else if (token.startsWith("**"))
      result.push(<strong key={at}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`"))
      result.push(<code key={at}>{token.slice(1, -1)}</code>);
    else if (hrefs.has(token))
      result.push(
        <a href={token} key={at}>
          {token}
        </a>,
      );
    else result.push(token);
    start = at + token.length;
  }
  if (start < text.length) result.push(text.slice(start));
  return result;
}

// Dự phòng khi mô hình trả về một khối chữ liền mạch (không có xuống dòng):
// tách danh sách đánh số/dấu • nằm cùng dòng, rồi chia đoạn dài theo câu.
function normalize(raw: string): string {
  let text = raw.replace(/\r\n?/g, "\n").replace(/\\r\\n|\\n|\\r/g, "\n");
  if (!text.includes("\n")) {
    const marks = [...text.matchAll(/(?:^|\s)(\d{1,2})[.)]\s+(?=\S)/g)];
    if (marks.length >= 2 && marks[0][1] === "1" && marks[1][1] === "2")
      text = text.replace(/\s+(?=\d{1,2}[.)]\s+\S)/g, "\n");
    text = text.replace(/\s+•\s+/g, "\n• ");
  }
  return text
    .split("\n")
    .flatMap((line) => {
      if (line.length <= 260 || /^\s*(?:\d+[.)]|[-*•])\s+/.test(line))
        return [line];
      const sentences = line.split(/(?<=[.!?…])\s+(?=\p{Lu})/u);
      const out: string[] = [];
      let buffer = "";
      for (const sentence of sentences) {
        if (buffer && (buffer + " " + sentence).length > 260) {
          out.push(buffer, "");
          buffer = sentence;
        } else buffer = buffer ? `${buffer} ${sentence}` : sentence;
      }
      if (buffer) out.push(buffer);
      return out;
    })
    .join("\n");
}

export default function AssistantMessage({ text }: { text: string }) {
  const lines = normalize(text).split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].trim()) {
      index++;
      continue;
    }
    const first = /^\s*(?:(\d+)[.)]|([-*•]))\s+(.+)$/.exec(lines[index]);
    if (first) {
      const ordered = !!first[1];
      const items: ReactNode[] = [];
      const start = Number(first[1] || 1);
      while (index < lines.length) {
        const item = /^\s*(?:(\d+)[.)]|([-*•]))\s+(.+)$/.exec(lines[index]);
        if (!item || !!item[1] !== ordered) break;
        items.push(<li key={index}>{inline(item[3])}</li>);
        index++;
      }
      blocks.push(
        ordered ? (
          <ol key={index} start={start}>
            {items}
          </ol>
        ) : (
          <ul key={index}>{items}</ul>
        ),
      );
    } else {
      const content: ReactNode[] = [];
      while (
        index < lines.length &&
        lines[index].trim() &&
        !/^\s*(?:\d+[.)]|[-*•])\s+/.test(lines[index])
      ) {
        if (content.length) content.push(<br key={`br-${index}`} />);
        content.push(<Fragment key={index}>{inline(lines[index])}</Fragment>);
        index++;
      }
      blocks.push(<p key={index}>{content}</p>);
    }
  }
  return <div className="sv-support-message-content">{blocks}</div>;
}

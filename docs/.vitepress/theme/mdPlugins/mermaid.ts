import type MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import type MarkdownItContainer from "markdown-it-container";

const mermaidPlugin = (md: MarkdownIt) => {
  const options: MarkdownItContainer.ContainerOpts = {
    validate(params) {
      return !!params.trim().match(/^mermaid\s*(.*)$/);
    },

    render(tokens, idx) {
      if (tokens[idx].type === "container_mermaid_open") {
        const newTokens = tokens.slice(idx + 1, tokens.length);
        let content = "";
        for (let i = 0; i < newTokens.length; i++) {
          if (newTokens[i].type === "inline") {
            content += newTokens[i].content + "\n";
          }

          if (newTokens[i].type === "container_mermaid_close") {
            break;
          }
        }

        return `<MermaidContainer code="${encodeURIComponent(content)}">`;
      }

      if (tokens[idx].type === "container_mermaid_close") {
        return `</MermaidContainer>`;
      }

      return "";
    },
  };

  md.use(container, "mermaid", options);
};

export default mermaidPlugin;

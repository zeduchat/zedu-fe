import CodeBlock from "@tiptap/extension-code-block";

/** Slack-style code block: Enter inserts a newline instead of exiting the block. */
const SlackCodeBlock = CodeBlock.extend({
  addKeyboardShortcuts() {
    const parentShortcuts = this.parent?.() ?? {};

    return {
      ...parentShortcuts,
      Enter: ({ editor }) => editor.commands.insertContent("\n"),
      "Mod-Shift-c": () => this.editor.commands.toggleCodeBlock(),
      Tab: ({ editor }) => editor.commands.insertContent("\t"),
    };
  },
});

export default SlackCodeBlock;

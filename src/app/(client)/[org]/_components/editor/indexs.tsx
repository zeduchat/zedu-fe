import { useContext } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";

/* eslint-disable */
const UseTextEditor = (subscription?: any) => {
  const { state, dispatch } = useContext(DataContext);
  const name = localStorage.getItem("channelName") || "";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: { class: "list-disc pl-5" },
        },
        orderedList: {
          HTMLAttributes: { class: "list-decimal pl-5" },
        },
        listItem: {
          HTMLAttributes: { class: "tracking-wide" },
        },
        paragraph: {
          HTMLAttributes: { class: "tracking-wide" },
        },
      }),
      Placeholder.configure({
        placeholder: `Message #${name}`,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
          style:
            "color: blue; font-weight: normal; background:#F1F1FE; padding-left:2px; padding-right:2px",
        },
        suggestion: {
          items: (query) => {
            const queryString = String(query || "").toLowerCase();
            const members =
              state?.orgMembers?.filter((item: any) => {
                let name =
                  item?.name && item?.name !== " " ? item?.name : item?.email;
                return name.toLowerCase().includes(queryString);
              }) ?? [];
            const channelMatch = "@channel".includes(queryString);
            const channel = {
              id: "channel",
              name: "@Channel",
              profile_url: "/images/megaphone.png",
              full_name: "Notify everyone in this channel",
              is_online: false,
            };

            return channelMatch ? [channel, ...members] : members;
          },
          render: () => {
            let component: HTMLElement | null = null;

            const handleKeyDown = (event: any) => {
              if (!component) return;

              if (event.key === "Enter") {
                const suggestionButtons = component.querySelectorAll("button");

                if (suggestionButtons.length === 1) {
                  event.preventDefault();
                  event.stopPropagation();
                  suggestionButtons[0].click();
                  return;
                }

                const selectedButton = component.querySelector(
                  "button.hover"
                ) as HTMLElement | null;
                if (selectedButton) {
                  event.preventDefault();
                  event.stopPropagation();
                  selectedButton.click();
                  return;
                }
              }

              if (event.key === "Escape") {
                component.remove();
                component = null;
                event.preventDefault();
                event.stopPropagation();
              }
            };

            const handleClickOutside = (event: any) => {
              if (component && !component.contains(event.target)) {
                component.remove();
                component = null;
              }
            };

            return {
              onStart: ({ query, command, clientRect }) => {
                component = document.createElement("div");
                component.className =
                  "absolute border border-gray-300 rounded-lg shadow-lg bg-[#F9FAFB] overflow-y-auto z-50 w-[350px]";
                document.body.appendChild(component);

                document.addEventListener("keydown", handleKeyDown, true);
                document.addEventListener("mousedown", handleClickOutside);

                populateMentions(component, query, command, clientRect);
              },
              onUpdate: ({ query, command, clientRect }) => {
                if (!component) return;
                component.innerHTML = "";
                populateMentions(component, query, command, clientRect);
              },
              onExit: () => {
                if (component) {
                  component.remove();
                  component = null;
                }
                document.removeEventListener("keydown", handleKeyDown, true);
                document.removeEventListener("mousedown", handleClickOutside);
              },
            };

            function populateMentions(
              component: HTMLElement,
              query: string,
              command: Function,
              clientRect: (() => DOMRect | null) | null | undefined
            ) {
              const queryString = String(query || "").toLowerCase();

              const members =
                state?.orgMembers?.filter((item: any) =>
                  (item.name || item.email).toLowerCase().includes(queryString)
                ) ?? [];

              const includeChannel =
                queryString === "" || "@channel".includes(queryString);

              const channelMentionItem = {
                id: "channel",
                name: "@Channel",
                profile_url: "/images/megaphone.png",
                full_name: "Notify everyone in this channel",
                is_online: false,
              };

              const filteredItems = includeChannel
                ? [channelMentionItem, ...members]
                : members;

              if (filteredItems.length === 0) {
                if (component) component.style.display = "none";
                return;
              }
              if (component) component.style.display = "";

              const coords =
                typeof clientRect === "function" ? clientRect() : null;
              if (coords && component) {
                const editorTop = coords.top + window.scrollY;
                const itemHeight = 48;
                const calculatedHeight = filteredItems.length * itemHeight;
                const maxHeight = 300;
                const dropdownHeight = Math.min(calculatedHeight, maxHeight);
                const isAbove = editorTop > dropdownHeight + itemHeight;
                const dropdownTop = isAbove
                  ? editorTop - dropdownHeight - coords.height
                  : coords.bottom + window.scrollY;

                Object.assign(component.style, {
                  top: `${dropdownTop}px`,
                  left: `${coords.left + window.scrollX}px`,
                  maxHeight: `${maxHeight}px`,
                });
              }

              filteredItems.forEach((item: any, index: number) => {
                const button = document.createElement("button");
                button.className =
                  "group flex items-center px-3 py-2 text-left hover:bg-blue-500 hover:text-white w-full gap-3";
                if (index === 0) button.classList.add("hover");

                const avatarContainer = document.createElement("div");
                avatarContainer.className =
                  "w-6 h-6 flex items-center justify-center rounded-md bg-gray-200 text-white font-bold text-sm overflow-hidden";
                avatarContainer.style.minWidth = "1.5rem";

                const img = document.createElement("img");
                img.src = item.profile_url || "/images/user.png";
                img.alt = item.name || item.email;
                img.className = "w-full h-full rounded-md object-cover border";
                avatarContainer.appendChild(img);

                const textContainer = document.createElement("div");
                textContainer.className = "flex flex-col items-start";

                const mainTextLine = document.createElement("div");
                mainTextLine.className = "flex items-center gap-2";

                const nameSpan = document.createElement("span");
                nameSpan.textContent = item.name || item.email;
                nameSpan.className = "text-sm font-bold capitalize";

                const status = document.createElement("div");
                if (item.id !== "channel") {
                  status.className = `size-2 rounded-full ${
                    item.is_online ? "bg-green-500" : "bg-gray-400"
                  }`;
                }

                mainTextLine.appendChild(nameSpan);
                if (item.id !== "channel") mainTextLine.appendChild(status);

                const secondaryTextSpan = document.createElement("span");
                secondaryTextSpan.textContent =
                  item?.id === "channel"
                    ? item.full_name
                    : item.name &&
                        item.email &&
                        item.name.toLowerCase() !== item.email.toLowerCase()
                      ? item.email
                      : "";
                secondaryTextSpan.className =
                  "text-xs text-gray-500 group-hover:text-white";

                textContainer.appendChild(mainTextLine);
                if (secondaryTextSpan.textContent) {
                  textContainer.appendChild(secondaryTextSpan);
                }

                button.appendChild(avatarContainer);
                button.appendChild(textContainer);

                button.onclick = () => {
                  let labelText = item.name;
                  if (!labelText || labelText.trim() === "") {
                    labelText = item.email;
                  }
                  const finalLabel = labelText.replace(/^@/, "");
                  const mentionCommandPayload = {
                    id: item.id,
                    label: finalLabel,
                  };

                  if (item.id !== "channel") {
                    if (!state.mentions.some((m: any) => m.id === item.id)) {
                      dispatch({
                        type: ACTIONS.MENTIONS,
                        payload: [
                          { id: item.id, label: finalLabel, type: "user" },
                        ],
                      });
                    }
                  }
                  command(mentionCommandPayload);
                };
                component.appendChild(button);
              });
            }
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-primary-500",
        },
      }),
      Code,
      CodeBlock.configure({
        HTMLAttributes: {
          class: "language-javascript",
        },
      }),
    ],
    // onUpdate: () => {
    //   handleTyping(true);
    // },
    // onBlur: () => handleTyping(false),
  });

  return {
    editor,
  };
};

export default UseTextEditor;

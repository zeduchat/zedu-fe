"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import images from "~/assets/images";
import { cn } from "~/lib/utils";
import {
  filterOrgMembers,
  getMemberId,
  toNewChatUser,
} from "~/utils/filter-org-members";

export interface User {
  id: string;
  name: string;
  username: string;
  profile_url: string;
  avatar_url: string;
  default_avatar_url: string;
}

const MAX_SELECTED_PEOPLE = 9;
/** Same member pool as @mentions — cap rows so typing stays instant. */
const MEMBER_LIST_CAP = 80;

const UserRow = React.memo(function UserRow({
  user,
  index,
  highlighted,
  onSelect,
  onHover,
}: {
  user: User;
  index: number;
  highlighted: boolean;
  onSelect: (user: User) => void;
  onHover: (index: number) => void;
}) {
  return (
    <div
      data-row-index={index}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={() => onHover(index)}
      onClick={() => onSelect(user)}
      className={`flex items-center gap-[10px] px-4 py-[10px] hover:bg-[#F1F1FE] cursor-pointer ${
        highlighted ? "bg-[#F1F1FE]" : ""
      }`}
    >
      <Image
        src={user?.avatar_url || user?.default_avatar_url || images?.user}
        alt={user?.name}
        width={20}
        height={20}
        className="rounded-[5px] size-6 object-cover border"
      />
      <div className="flex items-center gap-[6px]">
        <span className="text-[#101828] text-sm font-semibold">
          {user?.name}
        </span>
        {user?.username && (
          <>
            <div className="w-1 h-1 rounded-full bg-[#E4E7EC]" />
            <span className="text-[14px] text-[#344054]">{user?.username}</span>
          </>
        )}
      </div>
    </div>
  );
});

const NewChatHeader = ({ onUsersSelected }: any) => {
  const { state } = useContext(DataContext);
  const [listOpen, setListOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  // Key repeat can outrun React renders; the ref keeps every press counted
  // even when several land between two renders.
  const highlightRef = useRef(0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listPanelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const suppressListOpenRef = useRef(false);

  // Same global pool as the editor @mentions (populated in client layout).
  const mentionPool = useMemo(
    () => state.mentionOrgMembers ?? state.orgMembers ?? [],
    [state.mentionOrgMembers, state.orgMembers]
  );

  const deferredQuery = useDeferredValue(inputValue);

  const excludeIds = useMemo(() => {
    const ids = new Set(selectedUsers.map((user) => user.id).filter(Boolean));
    const currentUserId = String(state.user?.user_id ?? state.user?.id ?? "");
    if (currentUserId) ids.add(currentUserId);
    return ids;
  }, [selectedUsers, state.user?.user_id, state.user?.id]);

  const { filteredUsers, totalMatches, isFiltering } = useMemo(() => {
    const q = deferredQuery.trim();
    const isFiltering = deferredQuery !== inputValue;

    if (!q) {
      const quick: Record<string, unknown>[] = [];
      for (const member of mentionPool) {
        const id = getMemberId(member as Parameters<typeof getMemberId>[0]);
        if (!id || excludeIds.has(id)) continue;
        quick.push(member);
        if (quick.length >= MEMBER_LIST_CAP) break;
      }
      return {
        filteredUsers: quick.map((member) => toNewChatUser(member)),
        totalMatches: mentionPool.length,
        isFiltering,
      };
    }

    const matches = filterOrgMembers(mentionPool, deferredQuery, excludeIds);
    return {
      filteredUsers: matches
        .slice(0, MEMBER_LIST_CAP)
        .map((member) => toNewChatUser(member as Record<string, unknown>)),
      totalMatches: matches.length,
      isFiltering,
    };
  }, [mentionPool, deferredQuery, excludeIds, inputValue]);

  useEffect(() => {
    setListOpen(true);

    const focusSearch = () => inputRef.current?.focus({ preventScroll: true });

    focusSearch();
    const t0 = window.setTimeout(focusSearch, 0);
    const t1 = window.setTimeout(focusSearch, 50);
    const t2 = window.setTimeout(focusSearch, 150);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (composerRef.current?.contains(target)) return;
      if (listPanelRef.current?.contains(target)) return;
      setListOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // The list shrinks when a user is picked and empties while the search
  // debounce is pending, so keep the keyboard highlight inside it.
  useEffect(() => {
    setHighlightIndex((prev) =>
      Math.min(prev, Math.max(filteredUsers.length - 1, 0))
    );
  }, [filteredUsers.length]);

  const scrollHighlightIntoView = useCallback((index: number) => {
    const container = listRef.current;
    const row = container?.querySelector<HTMLElement>(
      `[data-row-index="${index}"]`
    );
    if (!container || !row) return;

    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    let delta = 0;
    if (rowRect.top < containerRect.top) {
      delta = rowRect.top - containerRect.top;
    } else if (rowRect.bottom > containerRect.bottom) {
      delta = rowRect.bottom - containerRect.bottom;
    }
    if (delta === 0) return;

    container.scrollTop = Math.max(
      0,
      Math.min(
        container.scrollTop + delta,
        container.scrollHeight - container.clientHeight
      )
    );
  }, []);

  useEffect(() => {
    onUsersSelected(selectedUsers);
  }, [selectedUsers, onUsersSelected]);

  const handleSearch = (search: string) => {
    setInputValue(search);
    highlightRef.current = 0;
    setHighlightIndex(0);
    if (!listOpen) setListOpen(true);
  };

  const handleSelectUser = useCallback(
    (user: User) => {
      if (selectedUsers.length >= MAX_SELECTED_PEOPLE) return;
      setSelectedUsers((prev) =>
        prev.length >= MAX_SELECTED_PEOPLE ||
        prev.some((selected) => selected.id === user.id)
          ? prev
          : [...prev, user]
      );
      setInputValue("");
      highlightRef.current = 0;
      setHighlightIndex(0);
      suppressListOpenRef.current = true;
      setListOpen(false);
      window.setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
        window.setTimeout(() => {
          suppressListOpenRef.current = false;
        }, 0);
      }, 0);
    },
    [selectedUsers.length]
  );

  const handleHoverRow = useCallback((index: number) => {
    highlightRef.current = index;
    setHighlightIndex(index);
  }, []);

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user?.id !== userId));
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setListOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!listOpen) {
        setListOpen(true);
        return;
      }

      if (event.key === "ArrowDown") {
        const next = Math.max(
          Math.min(highlightRef.current + 1, filteredUsers.length - 1),
          0
        );
        highlightRef.current = next;
        setHighlightIndex(next);
        queueMicrotask(() => scrollHighlightIntoView(next));
      } else {
        const next = Math.max(highlightRef.current - 1, 0);
        highlightRef.current = next;
        setHighlightIndex(next);
        queueMicrotask(() => scrollHighlightIntoView(next));
      }
      return;
    }

    if (!listOpen) return;

    if (event.key === "Enter") {
      const user = filteredUsers[highlightRef.current];
      if (user) {
        event.preventDefault();
        handleSelectUser(user);
      }
      return;
    }

    if (event.key === "Escape") {
      setListOpen(false);
    }
  };

  return (
    <div className="p-5 border-b border-[#E6EAEF] shadow-[0px_3px_6px_0px_#DFDFDF]">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg text-[#1D2939] font-black">New message</h2>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[#344054] shrink-0">With:</span>
        <div ref={composerRef} className="relative flex-1 min-w-0">
          <div
            ref={triggerRef}
            className="flex flex-wrap gap-2 items-center min-h-[40px] rounded-md px-2 cursor-text"
            onClick={() => {
              inputRef.current?.focus();
              if (!suppressListOpenRef.current) {
                setListOpen(true);
              }
            }}
          >
            {selectedUsers.map((user) => (
              <div
                key={user?.id}
                className="flex items-center gap-1 bg-[#F1F1FE] rounded-[3px] overflow-hidden shrink-0"
              >
                <Image
                  src={
                    user?.avatar_url || user?.default_avatar_url || images?.user
                  }
                  alt={user?.name}
                  width={24}
                  height={24}
                  className="size-6 rounded-sm border object-cover"
                />
                <span className="text-sm font-semibold text-[#101828]">
                  {user?.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveUser(user?.id);
                  }}
                  className="hover:bg-gray-200 rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <input
              ref={inputRef}
              autoFocus
              value={inputValue}
              onChange={(e) => handleSearch(e.target.value)}
              onClick={handleInputClick}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suppressListOpenRef.current) return;
                setListOpen(true);
              }}
              placeholder={
                selectedUsers.length === 0
                  ? "#a-channel, @somebody, or somebody"
                  : ""
              }
              className="flex-1 min-w-0 basis-0 outline-none text-[15px] placeholder:text-[#98A2B3]"
            />
          </div>

          <div
            ref={listPanelRef}
            aria-hidden={!listOpen}
            className={cn(
              "absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-[#E4E7EC] bg-white text-popover-foreground shadow-md outline-none",
              !listOpen && "pointer-events-none invisible"
            )}
            onKeyDown={handleKeyDown}
          >
            <div
              ref={listRef}
              className="py-2 w-full max-h-[400px] overflow-auto"
            >
              {filteredUsers.length > 0 ? (
                <>
                  {filteredUsers.map((user, index) => (
                    <UserRow
                      key={user?.id}
                      user={user}
                      index={index}
                      highlighted={index === highlightIndex}
                      onSelect={handleSelectUser}
                      onHover={handleHoverRow}
                    />
                  ))}
                  {totalMatches > MEMBER_LIST_CAP && (
                    <p className="px-4 py-2 text-xs text-[#667085] border-t border-[#E4E7EC]">
                      {isFiltering
                        ? "Updating…"
                        : `Showing ${MEMBER_LIST_CAP} of ${totalMatches} — type to narrow`}
                    </p>
                  )}
                </>
              ) : (
                <div className="px-3 py-2 text-[#667085]">
                  {mentionPool.length === 0
                    ? "Loading people…"
                    : deferredQuery.trim()
                      ? "No users found"
                      : "No people to show"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedUsers.length >= MAX_SELECTED_PEOPLE && (
        <p className="mt-2 text-sm text-[#667085]" role="status">
          You can select up to 9 people.
        </p>
      )}
    </div>
  );
};

export default NewChatHeader;

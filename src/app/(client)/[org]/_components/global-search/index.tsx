import { useState, useMemo, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { MagnifyingGlassIcon } from "~/svgs";

interface GlobalSearchProps<T> {
  data: T[];
  placeholder?: string;
  onSearchResults: any;
}

const GlobalSearch = <T,>({
  data,
  placeholder,
  onSearchResults,
}: GlobalSearchProps<T>) => {
  const [query, setQuery] = useState("");

  const filteredResults = useMemo(() => {
    if (!query.trim()) return data;

    const lowerQuery = query.toLowerCase();

    return data.filter((item: any) => {
      const username = item?.profile?.username?.toLowerCase();
      const email = item?.profile?.email?.toLowerCase();
      const name = item?.profile?.name?.toLowerCase();

      return (
        username?.includes(lowerQuery) ||
        email?.includes(lowerQuery) ||
        name?.includes(lowerQuery)
      );
    });
  }, [query, data]);

  // Ensure `onSearchResults` updates when `filteredResults` changes
  useEffect(() => {
    onSearchResults(filteredResults);
  }, [filteredResults, onSearchResults]);

  return (
    <div className="relative flex items-center mb-4">
      <span className="absolute left-2.5">
        <MagnifyingGlassIcon />
      </span>

      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="bg-[#F9FAFB] pl-8 rounded-[0.375rem] focus-within:border-[#6868F7] focus-within:ring focus-within:ring-[#D0D0FD]"
      />
    </div>
  );
};

export default GlobalSearch;

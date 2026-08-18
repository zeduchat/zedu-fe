// The filtering function (case-insensitive; used by DMNav + PeopleNav)
export const search = (mainData: any, inputData: string) => {
  const query = inputData?.toLowerCase().trim() || "";
  if (!query) return mainData;

  return mainData?.filter((item: any) => {
    return Object.values(item).join(" ").toLowerCase().includes(query);
  });
};

export const FilterMethod = (mainData: any, inputData: string) => {
  const res = mainData?.filter((item: any) => {
    return Object.values(item.data)
      .join(" ")
      .toLowerCase()
      .match(inputData.toLowerCase());
  });
  return res;
};

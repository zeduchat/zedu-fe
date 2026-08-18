import { format, isToday, isYesterday } from "date-fns";

export const groupMessagesByDate = (threads: any) => {
  const groupedMessages: any = {};

  if (threads) {
    threads?.forEach((thread: any) => {
      const date = new Date(thread?.created_at);

      let dateLabel;

      if (isToday(date)) {
        dateLabel = "Today";
      } else if (isYesterday(date)) {
        dateLabel = "Yesterday";
      } else {
        dateLabel = format(date, "MMMM d, yyyy");
      }

      if (!groupedMessages[dateLabel]) {
        groupedMessages[dateLabel] = [];
      }

      groupedMessages[dateLabel].push(thread);
    });
  }

  return groupedMessages;
};

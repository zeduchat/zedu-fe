import { useContext } from "react";
import debounce from "lodash.debounce";
import { DataContext } from "~/store/GlobalState";

const UseTyping = (subscription: any) => {
  const { state } = useContext(DataContext);

  const handleTyping = debounce((isTyping: boolean) => {
    if (subscription) {
      subscription?.publish({
        user: {
          id: state?.user?.id,
          username: state?.user?.username,
        },
        typing: isTyping,
        type: "typing",
      });
    } else {
      // console.log("Subscription or user data is missing");
    }
  }, 50);
  return {
    handleTyping,
  };
};

export default UseTyping;

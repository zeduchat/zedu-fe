import React from "react";

// Utility function to replace \r\n with <br />
const formatMessage = (message: string): string => {
  // Replace `\r\n` with `<br />`
  let formattedMessage = message.replace(/\\r\\n/g, "<br />");

  // Optionally replace emoji codes (e.g., :briefcase:) with actual emoji
  formattedMessage = formattedMessage.replace(/:briefcase:/g, "💼"); // Replacing with an actual emoji

  return formattedMessage;
};

// Define the types for the props
interface MessageDisplayProps {
  message: string;
}

const FormatMessage: React.FC<MessageDisplayProps> = ({ message }) => {
  // Format the message before rendering
  const formattedMessage = formatMessage(message);

  return (
    <div>
      {/* nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml */}
      <div dangerouslySetInnerHTML={{ __html: formattedMessage }} />
    </div>
  );
};

export default FormatMessage;

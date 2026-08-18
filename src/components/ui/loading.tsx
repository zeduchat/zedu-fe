import { Loader } from "lucide-react";

type LoadingProps = {
  height?: string;
  width?: string;
  color?: string;
};

const Loading = ({ height, width, color }: LoadingProps) => {
  return (
    <Loader
      size={20}
      className="animate-spin"
      height={height || 20}
      width={width || 20}
      color={color || "#fff"}
    />
  );
};

export default Loading;

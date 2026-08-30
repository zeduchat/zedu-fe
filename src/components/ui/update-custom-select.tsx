import React from "react";
import Select from "react-select";

const UpdateCustomSelect = ({
  options,
  placeholder,
  onChange,
  defaultValue,
  isDisabled,
}: any) => {
  //

  return (
    <Select
      value={defaultValue}
      options={options}
      placeholder={placeholder}
      onChange={onChange}
      isSearchable={true}
      className="basic-select border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
      isDisabled={isDisabled}
      styles={{
        control: (baseStyles, state) => {
          return {
            ...baseStyles,
            border: "none",
            padding: "3px 8px",
            borderRadius: "5px",
            boxShadow: state.isFocused
              ? "0px 0px 0px 2px rgb(113, 65, 248)"
              : "none",
            cursor: "pointer",
            // fontSize: "16px",
          };
        },
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 0,
        colors: {
          ...theme.colors,
          primary25: "hsl(var(--accent))",
          primary50: "hsl(var(--muted))",
          primary: "rgb(113, 65, 248)",
          neutral0: "hsl(var(--card))",
          neutral20: "hsl(var(--border))",
          neutral30: "hsl(var(--border))",
          neutral40: "hsl(var(--muted-foreground))",
          neutral50: "hsl(var(--muted-foreground))",
          neutral80: "hsl(var(--foreground))",
        },
      })}
    />
  );
};

export default UpdateCustomSelect;

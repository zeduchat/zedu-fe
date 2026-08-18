import React from "react";
import Select from "react-select";

const CustomSelect = ({
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
      className="basic-select border rounded-lg focus:outline-none focus:border-blue-400"
      isDisabled={isDisabled}
      menuPlacement="auto"
      styles={{
        control: (baseStyles, state) => {
          return {
            ...baseStyles,
            border: "none",
            padding: "10px 8px",
            borderRadius: "8px",
            boxShadow: state.isFocused
              ? "0px 0px 0px 1px rgb(57, 57, 136)"
              : "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            // fontSize: "16px",
          };
        },
        menu: (baseStyles) => ({
          ...baseStyles,
          zIndex: 50,
        }),
        menuList: (baseStyles) => ({
          ...baseStyles,
          padding: "4px",
          maxHeight: "240px",
          "::-webkit-scrollbar": {
            width: "8px",
          },
          "::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "4px",
          },
          "::-webkit-scrollbar-thumb:hover": {
            background: "#a8a8a8",
          },
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          cursor: "pointer",
          padding: "10px 12px",
          transition: "all 0.15s ease",
        }),
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 8,
        colors: {
          ...theme.colors,
          primary25: "#fafafa",
          primary50: "#fafafa",
          primary: "blue",
        },
      })}
    />
  );
};

export default CustomSelect;

import React from "react";
import Skeleton from "react-loading-skeleton";

export default function CustomTable({ row, col }: any) {
  return (
    <tbody className="skeletal-loader">
      {Array.from(Array(row).keys()).map((i) => {
        return (
          <tr key={i}>
            {Array.from(Array(col).keys()).map((i) => {
              return (
                <td key={i} className="p-3">
                  <Skeleton width={100} borderRadius={10} />
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

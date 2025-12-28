import React from "react";


const LoadingSpinner = ({ text = "" }) => (
  <div className="flex flex-col items-center justify-center min-h-[80px]">
    <div
      className="animate-spin border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 mb-2"
    ></div>
    {text && (
      <div className="mt-2 text-base text-gray-600 font-medium text-center max-w-xs">
        {text}
      </div>
    )}
  </div>
);

export default LoadingSpinner;

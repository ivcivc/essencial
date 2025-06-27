import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const brandName = import.meta.env.VITE_REACT_APP_BRAND_NAME;

  return (
    <React.Fragment>
      <div className="main-footer">
        <div className="w-full">
          <div className="flex justify-center">
            <div className="text-center text-gray-500 dark:text-dark-500">
              <div>
                &copy; {new Date().getFullYear()} ALAV Sistemas
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Footer;

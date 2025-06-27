import React from "react";
import SimpleBar from "simplebar-react";

import { useSelector } from "react-redux";
import i18n from "@src/utils/i18n";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from "../custom/dropdown/dropdown";
import { Link } from "react-router-dom";
import { LAYOUT_LANGUAGES } from "@src/components/constants/layout";
import { RootState } from "src/slices/reducer";
import { interNationalization } from "@data/index";
import { InterNationalization } from "@dtos/layout";

const LanguageDropdown = () => {
  const { layoutLanguages } = useSelector((state: RootState) => state.Layout);
  // get country flag
  const getCountryFlag = (code: string) => {
    return interNationalization.find((item) => item.code === code)?.flag;
  };
  // change language
  const changeLanguage = (lng: LAYOUT_LANGUAGES) => {
    i18n.changeLanguage(lng);
  };

  return (
    <React.Fragment>
      <Dropdown position="right" trigger="click" dropdownClassName="dropdown">
        <DropdownButton colorClass="topbar-link">
          <img
            src={
              getCountryFlag(layoutLanguages) ||
              "https://images.kcubeinfotech.com/domiex/images/flag/us.svg"
            }
            alt="flag"
            className="object-cover rounded-md size-6"
            width={24}
            height={24}
          />
        </DropdownButton>

        <DropdownMenu>
          <SimpleBar className="max-h-[calc(100vh_-_100px)]">
            {interNationalization &&
              interNationalization.length > 0 &&
              interNationalization.map(
                (value: InterNationalization, key: number) => {
                  return (
                    <Link
                      to="#!"
                      className="dropdown-item"
                      key={key}
                      onClick={() => changeLanguage(value.code)}
                    >
                      <img
                        src={value.flag}
                        alt={value.language}
                        className="object-cover rounded-md size-5"
                        width={20}
                        height={20}
                      />
                      <span>{value.language}</span>
                    </Link>
                  );
                },
              )}
          </SimpleBar>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default LanguageDropdown;

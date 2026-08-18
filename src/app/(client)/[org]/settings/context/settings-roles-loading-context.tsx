"use client";

import { createContext, useContext } from "react";

type SettingsRolesLoadingContextValue = {
  rolesLoading: boolean;
  permissionsLoading: boolean;
};

export const SettingsRolesLoadingContext =
  createContext<SettingsRolesLoadingContextValue>({
    rolesLoading: true,
    permissionsLoading: true,
  });

export const useSettingsRolesLoading = () =>
  useContext(SettingsRolesLoadingContext);

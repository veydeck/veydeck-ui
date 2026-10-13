import { createContext } from "react";

/** 在面包屑容器与子项之间共享分隔符。 */
export const BreadcrumbContext = createContext<string>("/");

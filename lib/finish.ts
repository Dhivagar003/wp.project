import type { Finish, Metal } from "./types";
export const defaultFinish = (m: Metal): Finish => (m === "gold" ? "yellow" : "silver");
export const finishesFor = (m: Metal): Finish[] => (m === "gold" ? ["yellow", "rose", "white"] : ["silver"]);
export const FINISH_LABEL: Record<Finish, string> = { yellow: "Yellow Gold", rose: "Rose Gold", white: "White Gold", silver: "Sterling Silver" };

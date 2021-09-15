import { filters } from "../constants/limits.js";
import { match } from "time-limited-regular-expressions";

export default match({ limit: filters.timeout });
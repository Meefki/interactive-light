import { register } from "./scripts/hooks";
import { Logger, LogLevels } from "./scripts/utils/logger";

Logger.minLogLevel = LogLevels.debug;

register.initHooks();

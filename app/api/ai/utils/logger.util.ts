import pino from "pino";

export const logger =
    process.env.NODE_ENV === "development"
        ? pino({
            transport: {
                target: "pino-pretty",
            },
        })
        : pino();
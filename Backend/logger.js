const winston = require("winston");

module.exports = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "logs/app.log" })
  ]
});

logger.info("Ticket created", ticket);

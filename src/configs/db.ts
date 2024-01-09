import * as Sequelize from "sequelize";
import configs from "@configs/index";
import Modals from "@models/index";
import logger from "@utils/logger";
import "@utils/pg-types";

const {
  postgres: { host, port, name, username, password },
} = configs;

const sequelize: Sequelize.Sequelize = new Sequelize.Sequelize({
  host,
  port,
  database: name,
  username,
  password,
  dialect: "postgres",
  timezone: "+07:00",
  logging: process.env.NODE_ENV !== "production",
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    underscored: true,
    freezeTableName: true,
    schema: "fb_gift",
  },
});

export const initializeDatabase = async (sync: boolean = false) => {
  await sequelize.authenticate();

  logger.info(`🚀 Connect to database success`);
  Modals(sequelize);

  if (sync) {
    await sequelize.sync({
      force: false,
      alter: true,
    });

    logger.info("=-=- Sync DB Success -=-=");
  }
};

export default {
  sequelize,
  Sequelize,
};

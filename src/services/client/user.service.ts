import { IUser } from "@interfaces/models/user";
import { MMessengerUser } from "@models/messenger-user";
import { MUser } from "@models/user";
import { MZaloUser } from "@models/zalo-user";
import { Transaction } from "sequelize";

export default class UserService {
  static async getVerifyAccount(id: number): Promise<Required<IUser>> {
    return (await MUser.findOne({
      where: { id },
      include: [
        {
          model: MMessengerUser,
          as: "messengerUser",
        },
        {
          model: MZaloUser,
          as: "zaloUser",
        },
      ],
      raw: true,
      nest: true,
    })) as any;
  }

  static async createUser(transaction?: Transaction | null): Promise<IUser> {
    const newUser = await MUser.create(
      {
        point: 0,
      },
      {
        transaction,
      }
    );

    return newUser.dataValues;
  }
}

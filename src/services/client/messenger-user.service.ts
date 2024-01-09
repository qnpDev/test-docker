import { IMessengerGuest } from "@interfaces/models/messenger-guest";
import { IMessengerUser } from "@interfaces/models/messenger-user";
import { MMessengerGuest } from "@models/messenger-guest";
import { MMessengerUser } from "@models/messenger-user";
import { Transaction } from "sequelize";
import ZaloUserService from "./zalo-user.service";
import { IUser } from "@interfaces/models/user";
import UserService from "./user.service";
import db from "@configs/db";
import logger from "@utils/logger";
import { MUser } from "@models/user";
import { MMessengerGuestCommentHistory } from "@models/messenger-guest-comment-history";
import { IMessengerGuestCommentHistory } from "@interfaces/models/messenger-guest-comment-history";
import { MMessengerUserCommentHistory } from "@models/messenger-user-comment-history";
import { POINT } from "@configs/constant";
import { MUserPointHistory } from "@models/user-point-history";
import IUserPointHistory from "@interfaces/models/user-point-history";
import { MZaloUser } from "@models/zalo-user";
import { WrongToken, DuplicateMessengerGuest, DuplicateMessengerUser, DuplicateZaloUser, ZaloUserNotFound } from "@exceptions/index";

export interface ICreateMessengerUserInput extends Pick<IMessengerUser, "messengerUid" | "fullName" | "userId" | "point" | "isActive"> {}
export interface ICreateMessengerGuestInput extends Pick<IMessengerGuest, "messengerUid" | "fullName" | "point"> {}

export default class MessengerUserService {
  static async getUserByUid(messengerUid: string): Promise<IMessengerUser | null> {
    return MMessengerUser.findOne({
      where: { messengerUid, isActive: true },
      include: [
        {
          as: "user",
          model: MUser,
          include: [
            {
              model: MZaloUser,
              as: "zaloUser",
              where: {
                isActive: true,
              },
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });
  }

  static async getUserByUserId(userId: number): Promise<IMessengerUser | null> {
    return await MMessengerUser.findOne({
      where: { userId, isActive: true },
      raw: true,
      nest: true,
    });
  }

  static async getGuestByUid(messengerUid: string): Promise<IMessengerGuest | null> {
    return await MMessengerGuest.findOne({
      where: { messengerUid },
      raw: true,
      nest: true,
    });
  }

  static async createUser(input: ICreateMessengerUserInput, transaction?: Transaction | null): Promise<IMessengerUser> {
    const mUser = await this.getUserByUid(input.messengerUid);
    if (mUser) {
      throw new DuplicateMessengerUser();
    }

    const newUser: MMessengerUser = await MMessengerUser.create(input, { transaction });

    return newUser.dataValues;
  }

  static async createGuest(input: ICreateMessengerGuestInput, transaction?: Transaction | null): Promise<IMessengerGuest> {
    const duplicateUser: IMessengerGuest | null = await this.getGuestByUid(input.messengerUid);

    if (duplicateUser) {
      throw new DuplicateMessengerGuest();
    }
    const newUser: MMessengerGuest = await MMessengerGuest.create(input, { transaction });

    return newUser.dataValues;
  }

  static async verify(accessToken: string, phoneToken: string, guest: IMessengerGuest): Promise<void> {
    const { error, id } = await ZaloUserService.getZaloUidByToken(accessToken);
    if (error) {
      throw new WrongToken();
    }

    const existZaloUser = await ZaloUserService.getUserByUId(id);

    if (existZaloUser) {
      throw new DuplicateZaloUser();
    }

    const phoneNumber: string = await ZaloUserService.getPhoneNumberByToken(accessToken, phoneToken);
    let transaction: Transaction = await db.sequelize.transaction();

    try {
      const newUser: IUser = await UserService.createUser(transaction);

      await this.createUser(
        {
          messengerUid: guest.messengerUid,
          fullName: guest.fullName,
          userId: newUser.id as number,
          point: guest.point,
          isActive: true,
        },
        transaction
      );

      await ZaloUserService.createUser(
        {
          zaloUid: id,
          phoneNumber: phoneNumber,
          userId: newUser.id as number,
        },
        transaction
      );

      const listComment: IMessengerGuestCommentHistory[] = await MMessengerGuestCommentHistory.findAll({
        where: {
          messengerGuestUid: guest.messengerUid,
        },
        raw: true,
        nest: true,
        transaction: transaction,
      });

      const commentInput = listComment.map((comment) => ({
        facebookCommentId: comment.facebookCommentId,
        facebookPostId: comment.facebookPostId,
        messengerUid: guest.messengerUid,
        point: POINT,
        createdAt: comment.createdAt,
      }));

      const comments = await MMessengerUserCommentHistory.bulkCreate(commentInput, {
        transaction,
      });

      const pointHistoryInput = comments.map((comment, index) => ({
        pointBefore: index * POINT,
        pointAfter: (index + 1) * POINT,
        pointAmount: POINT,
        type: "accumulate",
        sourceId: comment.dataValues.seqId as number,
        userId: newUser.id as number,
        messengerUid: guest.messengerUid,
      })) as IUserPointHistory[];

      await MUserPointHistory.bulkCreate(pointHistoryInput, {
        transaction,
      });

      await MMessengerUser.update(
        {
          point: POINT * listComment.length,
        },
        {
          where: { messengerUid: guest.messengerUid },
          transaction,
        }
      );

      await MUser.update(
        {
          point: POINT * listComment.length,
        },
        {
          where: {
            id: newUser.id,
          },
          transaction,
        }
      );

      await transaction.commit();
    } catch (error) {
      transaction.rollback().catch((e) => logger.error(e));
      throw error;
    }
  }

  static async changeClient(accessToken: string, guest: IMessengerGuest): Promise<void> {
    const { error, id } = await ZaloUserService.getZaloUidByToken(accessToken);
    if (error) {
      throw new WrongToken();
    }
    const zaloUser = await ZaloUserService.getUserByUId(id);

    if (!zaloUser) {
      throw new ZaloUserNotFound();
    }

    let transaction: Transaction = await db.sequelize.transaction();

    try {
      await MUser.update(
        {
          changeClientAt: new Date(),
        },
        {
          where: {
            id: zaloUser.user.id,
          },
          transaction,
        }
      );

      const exitMessengerUser = await MMessengerUser.findOne({
        where: {
          messengerUid: guest.messengerUid,
          isActive: false,
        },
        raw: true,
        nest: true,
      });

      if (exitMessengerUser && exitMessengerUser.userId !== zaloUser.user.id) {
        throw new DuplicateMessengerUser();
      } else if (exitMessengerUser) {
        await MMessengerUser.update(
          {
            messengerUid: guest.messengerUid,
            fullName: guest.fullName,
            userId: zaloUser.user.id as number,
            point: zaloUser.user.point,
            isActive: true,
          },
          {
            where: {
              messengerUid: guest.messengerUid,
            },
            transaction,
          }
        );
      } else {
        await MMessengerUser.update(
          {
            isActive: false,
          },
          {
            where: {
              messengerUid: zaloUser.user.messengerUser?.messengerUid,
            },
            transaction,
          }
        );
        await MMessengerUser.create(
          {
            messengerUid: guest.messengerUid,
            fullName: guest.fullName,
            userId: zaloUser.user.id as number,
            point: zaloUser.user.point,
            isActive: true,
          },
          {
            transaction,
          }
        );
        const listComment: IMessengerGuestCommentHistory[] = await MMessengerGuestCommentHistory.findAll({
          where: {
            messengerGuestUid: guest.messengerUid,
          },
          raw: true,
          nest: true,
          transaction: transaction,
        });

        const commentInput = listComment.map((comment) => ({
          facebookCommentId: comment.facebookCommentId,
          facebookPostId: comment.facebookPostId,
          messengerUid: guest.messengerUid,
          point: POINT,
          createdAt: comment.createdAt,
        }));

        await MMessengerUserCommentHistory.bulkCreate(commentInput, {
          transaction,
        });
      }

      await transaction.commit();
    } catch (error) {
      transaction.rollback().catch((e) => logger.error(e));
      throw error;
    }
  }
}

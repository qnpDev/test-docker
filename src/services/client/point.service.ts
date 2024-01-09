import configs from "@configs/index";
import { MMessengerUserCommentHistory } from "@models/messenger-user-comment-history";
import { HasOne, Op, Transaction } from "sequelize";
import moment from "moment";
import logger from "@utils/logger";
import db from "@configs/db";
import { MMessengerUser } from "@models/messenger-user";
import { IMessengerUser } from "@interfaces/models/messenger-user";
import MessengerUserService from "./messenger-user.service";
import { MMessengerGuestCommentHistory } from "@models/messenger-guest-comment-history";
import { MMessengerGuest } from "@models/messenger-guest";
import { IPointHistoryQuery } from "@interfaces/requests/point";
import axios from "axios";
import { MUserPointHistory } from "@models/user-point-history";
import IUserPointHistory from "@interfaces/models/user-point-history";
import _ from "lodash";
import { IMessengerUserCommentHistory } from "@interfaces/models/messenger-user-comment-history";
import { POINT } from "@configs/constant";
import { MUser } from "@models/user";
import { CustomerGetPointNotFound, DuplicateComment, OutOfMove } from "@exceptions/index";

export interface IAddPointInput {
  messengerUid: string;
  facebookPostId: string;
  facebookCommentId: string;
}

export type HistoryResponseType = {
  count: number;
  history: IUserPointHistory[];
};

export default class PointService {
  static async remainingTimes(messengerUid: string): Promise<number> {
    const verifyMessengerUser: IMessengerUser | null = await MessengerUserService.getUserByUid(messengerUid);

    if (verifyMessengerUser) {
      return userRemainingTime(messengerUid);
    }
    return guestRemainingTime(messengerUid);
  }

  static async addPoint(input: IAddPointInput): Promise<{ point: number; remainingTimes: number }> {
    const { messengerUid, facebookPostId, facebookCommentId } = input;

    const verifyMessengerUser: IMessengerUser | null = await MessengerUserService.getUserByUid(messengerUid);

    let remainingTimes: number;

    if (verifyMessengerUser) {
      remainingTimes = await userRemainingTime(messengerUid);
    } else {
      remainingTimes = await guestRemainingTime(messengerUid);
    }

    if (remainingTimes <= 0) {
      throw new OutOfMove("end of scored in day");
    }

    const duplicateComment: boolean = verifyMessengerUser
      ? await duplicateUserComment(messengerUid, facebookPostId)
      : await duplicateGuestComment(messengerUid, facebookPostId);

    if (duplicateComment) {
      throw new DuplicateComment("duplicate postId");
    }

    let transaction: Transaction = await db.sequelize.transaction();

    try {
      if (verifyMessengerUser) {
        const newComment = await MMessengerUserCommentHistory.create(
          {
            ...input,
            point: POINT,
          },
          {
            transaction,
          }
        );

        await MUserPointHistory.create(
          {
            pointBefore: (verifyMessengerUser.user as any).point,
            pointAfter: (verifyMessengerUser.user as any).point + POINT,
            pointAmount: POINT,
            type: "accumulate",
            sourceId: newComment.dataValues.seqId as number,
            userId: verifyMessengerUser.userId,
            messengerUid: verifyMessengerUser.messengerUid,
          },
          {
            transaction,
          }
        );

        await MMessengerUser.increment("point", {
          by: POINT,
          where: { messengerUid: messengerUid },
          transaction,
        });

        await MUser.increment("point", {
          by: POINT,
          where: {
            id: verifyMessengerUser.userId,
          },
          transaction,
        });
      } else {
        await MMessengerGuestCommentHistory.create(
          {
            messengerGuestUid: messengerUid,
            facebookPostId: facebookPostId,
            facebookCommentId: facebookCommentId,
            point: POINT,
          },
          {
            transaction,
          }
        );
        await MMessengerGuest.increment("point", {
          by: POINT,
          where: { messengerUid: messengerUid },
          transaction,
        });
      }
      await transaction.commit();
    } catch (error) {
      transaction.rollback().catch((e) => logger.error(e));
      throw error;
    }

    return {
      point: POINT,
      remainingTimes: remainingTimes - 1,
    };
  }

  static async listHistory({ type, page, limit }: IPointHistoryQuery, userId: number): Promise<HistoryResponseType> {
    const whereOptions: any = {
      userId,
    };
    if (type !== "all") {
      whereOptions.type = type;
    }
    const { count, rows } = await MUserPointHistory.findAndCountAll({
      attributes: ["sourceId", "pointAmount", "pointAfter", "type", "id", "createdAt"],
      where: whereOptions,
      raw: true,
      nest: true,
      limit: limit,
      order: [["createdAt", "desc"]],
      offset: (page - 1) * limit,
    });
    return {
      count,
      history: rows,
    };
  }

  static async detailAccumulate(userId: number, id: number): Promise<(Partial<IUserPointHistory> & { postLink: string | null }) | null> {
    const detail: IUserPointHistory | null = await MUserPointHistory.findOne({
      attributes: ["id", "pointAmount", "pointAfter", "type", "sourceId", "createdAt"],
      where: {
        userId,
        id,
      },
      include: [
        {
          model: MMessengerUserCommentHistory,
          association: new HasOne(MUserPointHistory, MMessengerUserCommentHistory, {
            as: "source",
            sourceKey: "sourceId",
            foreignKey: "seqId",
          }),
          as: "source",
          attributes: ["seqId", "facebookPostId", "facebookCommentId"],
        },
      ],
      nest: true,
      raw: true,
    });

    return !detail
      ? null
      : {
          ..._.pick(detail, "id", "pointAmount", "pointAfter", "type", "createdAt", "sourceId"),
          postLink:
            detail.type === "accumulate"
              ? `https://www.facebook.com/${configs.app.facebookPageId}/posts/${
                  (detail.source as IMessengerUserCommentHistory).facebookPostId
                }/comments/${(detail.source as IMessengerUserCommentHistory).facebookCommentId}`
              : null,
        };
  }

  static async purchasePoint(phone: string): Promise<number> {
    phone = phone.replace("84", "0");
    let point: number = 0;
    const res = await axios({
      url: `https://tgw.mysapogo.com/admin/customers.json?query=${phone}`,
      method: "GET",
      headers: {
        "Accept-Encoding": "*",
        "X-Sapo-Access-Token": configs.app.sapogoReadToken,
      },
    });

    const customer = (res?.data?.customers as any[]).find((el: any) => el.phone_number === phone);
    if (!customer) {
      throw new CustomerGetPointNotFound();
    }
    point = customer.loyalty_customer?.point || 0;

    return point;
  }
}

async function duplicateGuestComment(messengerGuestUid: string, postId: string): Promise<boolean> {
  const pointHistory: MMessengerGuestCommentHistory | null = await MMessengerGuestCommentHistory.findOne({
    where: {
      messengerGuestUid,
      facebookPostId: postId,
    },
  });

  return !!pointHistory;
}

async function duplicateUserComment(messengerUid: string, postId: string): Promise<boolean> {
  const pointHistory: MMessengerUserCommentHistory | null = await MMessengerUserCommentHistory.findOne({
    where: {
      messengerUid,
      facebookPostId: postId,
    },
  });

  return !!pointHistory;
}

async function guestRemainingTime(messengerGuestUid: string): Promise<number> {
  const pointAdded: number = await MMessengerGuestCommentHistory.count({
    where: {
      createdAt: {
        [Op.between]: [moment().startOf("day"), moment().endOf("day")],
      },
      messengerGuestUid,
    },
  });
  return configs.app.maxPointPerDay - pointAdded;
}

async function userRemainingTime(messengerUid: string): Promise<number> {
  const pointAdded: number = await MMessengerUserCommentHistory.count({
    where: {
      createdAt: {
        [Op.between]: [moment().startOf("day"), moment().endOf("day")],
      },
      messengerUid,
    },
  });
  return configs.app.maxPointPerDay - pointAdded;
}

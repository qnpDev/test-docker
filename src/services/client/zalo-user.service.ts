import { IZaloUser } from "@interfaces/models/zalo-user";
import { MZaloUser } from "@models/zalo-user";
import configs from "@configs/index";
import _ from "lodash";
import axios from "axios";
import getAccessToken from "@utils/get-access-token";
import { Transaction } from "sequelize";
import { MUser } from "@models/user";
import { MZaloGuest } from "@models/zalo-guest";
import { IZaloGuest } from "@interfaces/models/zalo-guest";
import moment from "moment";
import { MMessengerUser } from "@models/messenger-user";
import { DuplicateZaloUser, ZaloUserNotFound, WrongToken, UserAccountWasChanged, ZaloGuestNotFound } from "@exceptions/index";

export interface ICreateZaloUserInput {
  zaloUid: string;
  phoneNumber: string;
  userId: number;
}

export interface ICreateZaloGuestInput {
  zaloUid: string;
  name: string;
}

export default class ZaloUserService {
  static async createUser({ zaloUid, phoneNumber, userId }: ICreateZaloUserInput, transaction?: Transaction | null): Promise<void> {
    const duplicateUser = await this.getUserByUId(zaloUid);

    if (duplicateUser) {
      throw new DuplicateZaloUser();
    }

    await MZaloUser.create(
      {
        zaloUid,
        phoneNumber,
        userId,
        isActive: true,
        activatedAt: new Date(),
      },
      {
        transaction,
      }
    );
  }
  static async getUserByUId(zaloUid: string): Promise<Required<IZaloUser> | null> {
    return MZaloUser.findOne({
      where: { zaloUid: zaloUid, isActive: true },
      include: [
        {
          as: "user",
          model: MUser,
          include: [
            {
              model: MMessengerUser,
              as: "messengerUser",
              where: {
                isActive: true,
              },
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    }) as any;
  }

  static async createGuest(input: ICreateZaloGuestInput, transaction?: Transaction | null): Promise<IZaloGuest> {
    const newGuest = await MZaloGuest.create(
      {
        ...input,
        accessTimes: 1,
      },
      {
        transaction,
      }
    );
    return newGuest.dataValues;
  }

  static async getGuestByUId(zaloUid: string): Promise<IZaloGuest | null> {
    return MZaloGuest.findOne({
      where: { zaloUid: zaloUid },
      raw: true,
      nest: true,
    });
  }

  static async getZaloUidByToken(accessToken: string): Promise<{ id: string; name: string; error: number }> {
    const response = await axios.get("https://graph.zalo.me/v2.0/me?fields=id,name", {
      headers: {
        access_token: accessToken,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  static async getPhoneNumberByToken(accessToken: string, token: string): Promise<string> {
    const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
      headers: {
        access_token: accessToken,
        code: token,
        secret_key: configs.app.zaloAppSecretKey,
      },
      validateStatus: () => true,
    });
    if (response.data.error) {
      throw new WrongToken();
    }
    return response.data.data.number;
  }

  static async sendVerifyLink(accessToken: string, phoneToken: string): Promise<void> {
    const zaloInfo = await this.getZaloUidByToken(accessToken);

    if (zaloInfo.error) {
      throw new WrongToken();
    }

    const gUser = await this.getGuestByUId(zaloInfo.id);

    if (!gUser) {
      throw new ZaloGuestNotFound();
    }

    const user = await this.getUserByUId(zaloInfo.id);

    if (user) {
      throw new DuplicateZaloUser();
    }

    const link: string = await generateShortLink(configs.app.verifyLink + `|accessToken:${accessToken}|phoneToken:${phoneToken}`);
    sendLink(link, zaloInfo.id);
  }

  static async sendChangeClientLink(accessToken: string): Promise<void> {
    const zaloInfo = await this.getZaloUidByToken(accessToken);

    if (zaloInfo.error) {
      throw new WrongToken();
    }

    const zaloUser = await this.getUserByUId(zaloInfo.id);

    if (!zaloUser) {
      throw new ZaloUserNotFound();
    }

    if (zaloUser.user.changeClientAt && moment(zaloUser.user.changeClientAt).add(30, "days").isAfter(new Date())) {
      throw new UserAccountWasChanged("the account has been changed recently");
    }

    const link: string = await generateShortLink(configs.app.changeClientLink + `|accessToken:${accessToken}`);
    sendLink(link, zaloInfo.id);
  }

  static async info({ zaloUid, name }: ICreateZaloGuestInput): Promise<Pick<IZaloGuest, "zaloUid" | "name" | "phoneNumber"> & { verify: boolean }> {
    const existGuest = await this.getGuestByUId(zaloUid);
    if (existGuest) {
      await MZaloGuest.increment("accessTimes", {
        by: 1,
        where: {
          zaloUid: zaloUid,
        },
      });

      return {
        ..._.pick(existGuest, "zaloUid", "name", "phoneNumber"),
        verify: !!(await MZaloUser.findOne({
          where: { zaloUid: zaloUid, isActive: true },
        })),
      };
    }

    const newGuest = await this.createGuest({ zaloUid, name });
    return {
      ..._.pick(newGuest, "zaloUid", "name", "phoneNumber"),
      verify: false,
    };
  }

  static async updateGuestPhone(zaloUid: string, phoneNumber: string): Promise<string> {
    const [affectedCount] = await MZaloGuest.update(
      {
        phoneNumber,
      },
      {
        where: { zaloUid },
      }
    );
    if (!affectedCount) {
      throw new ZaloGuestNotFound();
    }
    return phoneNumber;
  }
}

async function generateShortLink(redirectLink: string): Promise<string> {
  const response = await axios.post(
    "https://short.thegioiwhey.com",
    {
      redirectLink,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-short-link-secret": "TGW@SECRET!!ABC",
      },
    }
  );
  if (response.data.code) {
    throw response.data.message;
  }
  return response.data.data.shortLink;
}

async function sendLink(shortLink: string, zaloUi: string) {
  const response = await axios.post(
    "https://openapi.zalo.me/v3.0/oa/message/cs",
    {
      recipient: {
        user_id: zaloUi,
      },
      message: {
        text: shortLink,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        access_token: await getAccessToken(),
      },
    }
  );
  if (response.data.error) {
    throw response.data.message;
  }
}

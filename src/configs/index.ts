export default {
  app: {
    port: Number(process.env.PORT),
    env: String(process.env.NODE_ENV),
    secret: String(process.env.SECRET),
    expiredTime: Number(process.env.EXPIRED_TIME),
    maxPointPerDay: Number(process.env.MAX_POINT_PER_DAY),
    zaloAppId: String(process.env.ZALO_APP_ID),
    facebookPageId: String(process.env.MESS_PAGE_ID),
    zaloAppSecretKey: String(process.env.ZALO_APP_SECRET_KEY),
    sapogoUrl: String(process.env.SAPOGO_URL),
    sapogoPromotionToken: String(process.env.SAPOGO_PROMOTION_TOKEN),
    sapogoReadToken: String(process.env.SAPOGO_READ_TOKEN),
    verifyLink: String(process.env.VERIFY_LINK),
    changeClientLink: String(process.env.CHANGE_CLIENT_LINK),
  },
  postgres: {
    enable: Boolean(process.env.POSTGRES_ENABLE),
    host: String(process.env.POSTGRES_HOST),
    port: Number(process.env.POSTGRES_PORT),
    name: String(process.env.POSTGRES_DATABASE),
    username: String(process.env.POSTGRES_USERNAME),
    password: String(process.env.POSTGRES_PASSWORD),
  },
  s3: {
    enable: Boolean(process.env.S3_ENABLE),
    bucket: String(process.env.BUCKET),
    region: String(process.env.REGION),
    aws_access_key: String(process.env.AWS_ACCESS_KEY),
    aws_secret_key: String(process.env.AWS_SECRET_KEY),
  },
} as const;

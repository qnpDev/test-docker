import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteBucketCommandOutput,
  ListObjectsCommand,
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectOutput,
  ListBucketsOutput,
  CreateBucketOutput,
  ListObjectsOutput,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import configs from "@configs/index";
import path from "path";
import mimeType from "mime-types";
import randomstring from "randomstring";
import logger from "@utils/logger";
const { region, aws_access_key, aws_secret_key } = configs.s3;
const BUCKET: string = configs.s3.bucket as string;
const EXPIRE_TIME: number = 60;

class Storage {
  static instance: Storage;
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: String(aws_access_key),
        secretAccessKey: String(aws_secret_key),
      },
      region: region,
    });
  }

  public listBuckets(): Promise<ListBucketsOutput> {
    return this.s3.send(new ListBucketsCommand({}));
  }
  public createBucket(bucketName: string): Promise<CreateBucketOutput> {
    return this.s3.send(
      new CreateBucketCommand({
        Bucket: bucketName,
      })
    );
  }

  public deleteBucket(bucketName: string): Promise<DeleteBucketCommandOutput> {
    return this.s3.send(
      new DeleteBucketCommand({
        Bucket: bucketName,
      })
    );
  }

  public listObjects(bucketName: string = BUCKET): Promise<ListObjectsOutput> {
    return this.s3.send(
      new ListObjectsCommand({
        Bucket: bucketName,
      })
    );
  }

  public getUrl(fileName: string, bucket: string = BUCKET): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: fileName,
      }),
      { expiresIn: EXPIRE_TIME }
    );
  }

  public async uniqueFileName(mimetype: string, folder: string = "", bucket: string = BUCKET): Promise<string> {
    const fileName: string = path.join(folder, `${randomstring.generate(8)}.${mimeType.extension(mimetype)}`);
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: fileName.replace(/\\/g, "/"),
        })
      );
    } catch (e: any) {
      if (e.name === "NotFound") {
        return fileName;
      }
      logger.error(e);
      throw "Error from server";
    }

    return await this.uniqueFileName(folder, mimetype, bucket);
  }

  public async uploadObject(file: Express.Multer.File, ContentType?: string, bucket: string = BUCKET): Promise<PutObjectCommandOutput> {
    return await this.s3.send(
      new PutObjectCommand({
        ContentType,
        Bucket: bucket,
        Key: file.filename,
        Body: file.buffer,
      })
    );
  }
  public deleteObject(fileName: string, folder: string = "", bucket: string = BUCKET): Promise<DeleteObjectOutput> {
    const key: string = path.join(folder, fileName).replace(/\\/g, "/");
    return this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }

  static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }
}

export default Storage.getInstance();

import path from "path";
import { Request } from "express";
import multer, { FileFilterCallback, memoryStorage, StorageEngine } from "multer";
import { WrongValidate } from "@exceptions/validate-resource.exception";

const storage: StorageEngine = memoryStorage();

export default multer({
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      throw new WrongValidate("image only");
    }
  },
});

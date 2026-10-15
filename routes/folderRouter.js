import { Router } from "express";
const folderRouter = Router();
import multer from "multer";
// uploads files to uploads/
const upload = multer({ dest: "uploads/" });

// controllers
import * as folderController from "../controllers/folderController.js";

// authenticate user before using route
folderRouter.use(folderController.isAuthenticated);

// getting all folders
folderRouter.get("/", folderController.getFolders);

// upload file to root director
folderRouter.post(
  "/upload",
  upload.single("file"), // one file is expected and is saved to req.file
  folderController.uploadFile,
);


// creating new folder
folderRouter.get("/new", folderController.getNewFolderPage);
folderRouter.post("/new", folderController.createFolder);

// specific folder
folderRouter.get("/:id", folderController.getFolder);

// delete folder
folderRouter.post("/:id/delete", folderController.deleteFolder);

// edit folder
folderRouter.get("/:id/edit", folderController.getEditFolderPage);
folderRouter.post("/:id/edit", folderController.editFolder);

// upload file into folder
folderRouter.post(
  "/:id/upload",
  upload.single("file"),
  folderController.uploadFile,
);

// delete file
folderRouter.post("/files/:fileId/delete", folderController.deleteFile);
// download file
folderRouter.post("/files/:fileId/download", folderController.downloadFile);

export { folderRouter };

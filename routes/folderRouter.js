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

folderRouter.post(
  "/upload",
  upload.single("file"), // one file is expected and is saved to req.file
  folderController.uploadFolder,
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

// upload file
folderRouter.post(
  "/:id/upload",
  upload.single("file"),
  folderController.uploadFolder,
);

folderRouter.post("/files/:fileId/delete", folderController.deleteFile);
folderRouter.post("/files/:fileId/download", folderController.downloadFile);

export { folderRouter };

import { Router } from "express";
const folderRouter = Router();
import * as folderController from "../controllers/folderController.js";

// authenticate user before using route
folderRouter.use(folderController.isAuthenticated);

// getting all folders
folderRouter.get("/", folderController.getFolders);

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

export { folderRouter };

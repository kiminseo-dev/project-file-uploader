import { Router } from "express";
const folderRouter = Router();
import * as folderController from "../controllers/folderController.js";

folderRouter.use(folderController.isAuthenticated);
folderRouter.get("/", folderController.getFolders);

folderRouter.get("/new", folderController.getNewFolderPage);
folderRouter.post("/new", folderController.createFolder);

folderRouter.get("/:id", folderController.getFolder);

folderRouter.post("/:id/delete", folderController.deleteFolder);

folderRouter.get("/:id/edit", folderController.getEditFolderPage);
folderRouter.post("/:id/edit", folderController.editFolder);

export { folderRouter };

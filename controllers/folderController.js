import { prisma } from "../lib/prisma.js";
import fs from "node:fs/promises";
import path from "node:path";

export function isAuthenticated(req, res, next) {
  // returns false if user is not authenticated
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/log-in");
}

// getting all the folders
export async function getFolders(req, res) {
  // all folders for one user
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folder: {
        userId: req.user.id,
        isRoot: true,
      },
    },
  });

  res.render("folders", { folders, files });
}

// creating new folder page
export function getNewFolderPage(req, res) {
  res.render("new-folder");
}

// creating new folder
export async function createFolder(req, res) {
  try {
    // create new folder
    await prisma.folder.create({
      data: {
        name: req.body.name,
        userId: req.user.id,
      },
    });

    res.redirect("/folders");
  } catch (err) {
    //Todo: add proper error handling
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}

// get one specific folder linked to :id route
export async function getFolder(req, res) {
  try {
    const folder = await prisma.folder.findFirst({
      where: {
        // req.params.id as string id is Int
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    // if the folder searched for doesn't exist
    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    const files = await prisma.file.findMany({
      where: {
        folderId: folder.id,
      },
    });

    res.render("folder", { folder, files });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}

// deleting a folder
export async function deleteFolder(req, res) {
  try {
    const folder = await prisma.folder.deleteMany({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    // .deleteMany returns an object if folder.count does not exist
    if (folder.count === 0) {
      return res.status(404).send("Folder not found");
    }

    res.redirect("/folders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}

// editing folder
export async function getEditFolderPage(req, res) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    res.render("edit-folder", { folder });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}

export async function editFolder(req, res) {
  try {
    const folder = await prisma.folder.updateMany({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      data: {
        name: req.body.name,
      },
    });

    if (folder.count === 0) {
      return res.status(404).send("Folder not found");
    }

    res.redirect("/folders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}

export async function uploadFolder(req, res) {
  try {
    let folder;

    if (req.params.id) {
      folder = await prisma.folder.findFirst({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
      });

      if (!folder) {
        return res.status(404).send("Home folder not found");
      }
    } else {
      folder = await prisma.folder.findFirst({
        where: {
          userId: req.user.id,
          isRoot: true,
        },
      });

      if (!folder) {
        return res.status(404).send("Home folder now found");
      }
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    await prisma.file.create({
      data: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        size: req.file.size,
        folderId: folder.id,
      },
    });

    res.redirect(req.params.id ? `/folders/${folder.id}` : "/folders");
  } catch (err) {
    console.error(err);
  }
}

export async function deleteFile(req, res) {
  const file = await prisma.file.findFirst({
    where: {
      id: Number(req.params.fileId),
      folder: {
        userId: req.user.id,
      },
    },
  });

  if (!file) {
    return res.status(404).send("File not found");
  }

  // file path name
  const filePath = path.join("uploads", file.storedName);
  // deletes the physical file
  await fs.unlink(filePath);

  await prisma.file.delete({
    where: {
      id: file.id,
    },
  });

  res.redirect("/folders");
}

export async function downloadFile(req, res) {
  const file = await prisma.file.findFirst({
    where: {
      id: Number(req.params.fileId),
      folder: {
        userId: req.user.id,
      },
    },
  });

  if (!file) {
    return res.status(404).send("File not found");
  }

  const filePath = path.join("uploads", file.storedName);
  res.download(filePath, file.originalName);
}

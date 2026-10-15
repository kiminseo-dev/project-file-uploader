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

  const filteredFolders = folders.filter((folder) => !folder.isRoot);

  // all files in the isRoot folder
  const files = await prisma.file.findMany({
    where: {
      folder: {
        // user must own the folder
        userId: req.user.id,
        isRoot: true, // home directory
      },
    },
  });

  res.render("folders", { folders: filteredFolders, files });
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

    if (folder.isRoot) {
      return res.redirect("/folders");
    }

    // files inside the folder
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
    const folder = await prisma.folder.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    // if its the root folder
    if (folder.isRoot) {
      return res.send("root folder cant be deleted");
    }

    await prisma.folder.deleteMany({
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

    // folder does not exist
    if (!folder) {
      return res.status(404).send("Folder not found");
    }

    // if the folder is the root folder
    if (folder.isRoot) {
      return res.redirect("/folders");
    }

    res.render("edit-folder", { folder });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}

// editing folder
export async function editFolder(req, res) {
  try {
    const folder = prisma.folder.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    if (folder.isRoot) {
      req.redirect("/folders");
    }

    // edit the folder
    await prisma.folder.updateMany({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      data: {
        name: req.body.name,
      },
    });

    // folder does not exist
    if (folder.count === 0) {
      return res.status(404).send("Folder not found");
    }

    res.redirect("/folders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
}

// uploading file
export async function uploadFile(req, res) {
  try {
    let folder;

    // request came with id
    if (req.params.id) {
      // finding folder by folder id
      folder = await prisma.folder.findFirst({
        where: {
          id: Number(req.params.id),
          userId: req.user.id,
        },
      });

      // folder does not exist
      if (!folder) {
        return res.status(404).send("Home folder not found");
      }
    } else {
      // request no :folderId
      folder = await prisma.folder.findFirst({
        where: {
          userId: req.user.id,
          // upload in to root folder
          isRoot: true,
        },
      });

      //! check this
      // if folder is somehow not found
      if (!folder) {
        return res.status(404).send("Home folder now found");
      }
    }

    // file is not attached to request
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // saving file location metadata in db
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

// delete file
export async function deleteFile(req, res) {
  // file to delete
  const file = await prisma.file.findFirst({
    where: {
      // find file
      id: Number(req.params.fileId),
      folder: {
        // user most own the folder that owns the file
        userId: req.user.id,
      },
    },
  });

  // file does not exist
  if (!file) {
    return res.status(404).send("File not found");
  }

  // file path name
  const filePath = path.join("uploads", file.storedName);
  // deletes the physical file from the disk
  await fs.unlink(filePath);

  // delete file location name metadata
  await prisma.file.delete({
    where: {
      id: file.id,
    },
  });

  res.redirect("/folders");
}

// downloading file
export async function downloadFile(req, res) {
  // file to download
  const file = await prisma.file.findFirst({
    where: {
      // file location
      id: Number(req.params.fileId),
      folder: {
        // user most own folder that owns file
        userId: req.user.id,
      },
    },
  });

  // file does not exist
  if (!file) {
    return res.status(404).send("File not found");
  }

  // find file path from disk
  const filePath = path.join("uploads", file.storedName);
  // download the file
  res.download(filePath, file.originalName);
}

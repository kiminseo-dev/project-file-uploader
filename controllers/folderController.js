import { prisma } from "../lib/prisma.js";

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

  res.render("folders", { folders });
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
    const folder = await prisma.folder.findUnique({
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

    res.send(`you are in folder ${folder.name}`);
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

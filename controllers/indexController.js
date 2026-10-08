import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

export function getHomePage(req, res) {
    res.render("index");
}

export function getSignUpPage(req, res) {
    res.render("sign-up");
}

export async function createUser(req, res) {
    try {
        const user = req.body;
        // hashing password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // adding user to db
        await prisma.user.create({
            data: {
                name: user.name,
                username: user.username,
                password: hashedPassword,
            }
        });

        console.log(await prisma.user.findMany());

        res.redirect("/");
    } catch (err) {
        console.error(err);
        // server error
        res.status(500).send("Something went wrong");
    }
}
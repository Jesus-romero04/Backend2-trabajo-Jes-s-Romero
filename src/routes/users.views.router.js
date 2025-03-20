import { Router } from "express";
import { passportCall, authorization } from '../utils.js';


const router = Router();



router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});



router.get("/",
    passportCall('jwt'),
    (req, res) => {
        res.render("profile", {
            user: req.user 
        });
    });



router.get("/dashboard-admin",
    passportCall('jwt'),
    authorization("admin"),
    (req, res) => {
        res.render("admin", {
            user: req.user 
        });
    });


export default router
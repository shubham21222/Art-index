import express from "express";
import { createCategory, getAllCategories, getSingleCategory , updateCategory , deleteCategory} from "../../controllers/categoryController/category.controller.js"
import { IsAuthenticated , authorizeRoles} from "../../middlewares/authicationmiddleware.js"


const router = express.Router();

router.post("/create", IsAuthenticated , authorizeRoles('GALLERY') , createCategory);
router.get("/all", getAllCategories);
router.get("/:id", getSingleCategory);
router.post("/update/:id", IsAuthenticated , authorizeRoles('ADMIN') , updateCategory);
router.post("/delete/:id", IsAuthenticated , authorizeRoles('ADMIN') , deleteCategory);





export default router;
import express from 'express';
import {createBulkGalleries , getAllGalleries , getGalleryById , updateGallery , deleteGallery} from '../../controllers/GalleryController/gallery.controller.js';
import { IsAuthenticated, authorizeRoles } from '../../middlewares/authicationmiddleware.js';


const router = express.Router();

router.post('/create', IsAuthenticated, authorizeRoles('GALLERY'), createBulkGalleries);
router.get('/all', getAllGalleries);
router.get('/:id', getGalleryById);
router.post('/update/:id', IsAuthenticated, authorizeRoles('GALLERY'), updateGallery);
router.post('/delete/:id', IsAuthenticated, authorizeRoles('GALLERY'), deleteGallery);

export default router;
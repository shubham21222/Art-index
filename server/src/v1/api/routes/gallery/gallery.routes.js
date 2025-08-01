import express from 'express';
import {
  createBulkGalleries, 
  getAllGalleries, 
  getGalleryById, 
  updateGallery, 
  deleteGallery,
  addArtwork,
  updateArtwork,
  deleteArtwork,
  getGalleryStats,
  getAllGalleriesWithUsers,
  deleteGalleryByAdmin,
  getGalleriesByUser,
  getUsersWithGalleries
} from '../../controllers/GalleryController/gallery.controller.js';
import { IsAuthenticated, authorizeRoles } from '../../middlewares/authicationmiddleware.js';

const router = express.Router();

router.post('/create', IsAuthenticated, authorizeRoles('GALLERY'), createBulkGalleries);
router.get('/all', getAllGalleries);
router.get('/:id', getGalleryById);
router.post('/update/:id', IsAuthenticated, authorizeRoles('GALLERY'), updateGallery);
router.post('/delete/:id', IsAuthenticated, authorizeRoles('GALLERY'), deleteGallery);

// Artwork management routes
router.post('/:id/artworks/add', IsAuthenticated, authorizeRoles('GALLERY'), addArtwork);
router.post('/:galleryId/artworks/:artworkId/update', IsAuthenticated, authorizeRoles('GALLERY'), updateArtwork);
router.post('/:galleryId/artworks/:artworkId/delete', IsAuthenticated, authorizeRoles('GALLERY'), deleteArtwork);
router.get('/:id/stats', getGalleryStats);

// Admin routes
router.get('/admin/all-with-users', IsAuthenticated, authorizeRoles('ADMIN'), getAllGalleriesWithUsers);
router.delete('/admin/delete/:id', IsAuthenticated, authorizeRoles('ADMIN'), deleteGalleryByAdmin);
router.get('/admin/user/:userId/galleries', IsAuthenticated, authorizeRoles('ADMIN'), getGalleriesByUser);
router.get('/admin/users-with-galleries', IsAuthenticated, authorizeRoles('ADMIN'), getUsersWithGalleries);

export default router;
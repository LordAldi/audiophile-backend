import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import * as productValidation from '../../validations/product.validation';
import * as productController from '../../controllers/product.controller';

const router = express.Router();

router
  .route('/')
  .post(auth('manageProducts'), validate(productValidation.createProduct), productController.createProduct)
  .get(validate(productValidation.getProducts), productController.getProducts);

router
  .route('/:productId')
  .get(validate(productValidation.getProduct), productController.getProduct)
  .patch(auth('manageProducts'), validate(productValidation.updateProduct), productController.updateProduct)
  .delete(auth('manageProducts'), validate(productValidation.deleteProduct), productController.deleteProduct);

export default router;

import Joi from 'joi';
import { Category } from '../models/product.model';
import { objectId } from './custom.validation';

export const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .required()
      .valid(...Object.values(Category)),
    price: Joi.number().required().min(0),
    features: Joi.string().required(),
    isShow: Joi.bool(),
    inTheBox: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().required(),
          total: Joi.number().min(0).required(),
        })
      )
      .required(),
  }),
};

export const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

export const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      category: Joi.string().valid(...Object.values(Category)),
      price: Joi.number().min(0),
      features: Joi.string(),
      isShow: Joi.bool(),
      inTheBox: Joi.array().items(
        Joi.object().keys({
          name: Joi.string(),
          total: Joi.number().min(0),
        })
      ),
    })
    .min(1),
};

export const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

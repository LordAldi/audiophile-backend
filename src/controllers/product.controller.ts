import httpStatus from 'http-status';
import { FilterQuery } from 'mongoose';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import * as productService from '../services/product.service';
import { IProduct } from '../models/product.model';
import { PaginateOptions } from '../models/plugins/paginate.plugin';

export const createProduct = catchAsync(async (req, res): Promise<void> => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(product);
});

const paginateOptionsKeys: readonly (keyof PaginateOptions)[] = ['limit', 'page', 'populate', 'sortBy'];

export const getProducts = catchAsync(async (req, res): Promise<void> => {
  const filter: FilterQuery<IProduct> = pick(req.query, ['name', 'category']) as FilterQuery<IProduct>;
  const options = paginateOptionsKeys.reduce<PaginateOptions>(
    (accumulator: PaginateOptions, key: keyof PaginateOptions): PaginateOptions => {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        const value = req.query[key];
        if (value !== null && value !== undefined) {
          accumulator[key] = String(value);
        }
      }
      return accumulator;
    },
    {}
  );
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

export const getProduct = catchAsync(async (req, res): Promise<void> => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

export const updateProduct = catchAsync(async (req, res): Promise<void> => {
  const product = await productService.updateProductById(req.params.productId, req.body);
  res.send(product);
});

export const deleteProduct = catchAsync(async (req, res): Promise<void> => {
  await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

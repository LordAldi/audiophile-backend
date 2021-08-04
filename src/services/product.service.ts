import httpStatus from 'http-status';
import { FilterQuery, Types } from 'mongoose';
import { PaginateOptions, QueryResult } from '../models/plugins/paginate.plugin';
import ProductModel, { IProduct, IProductDoc, IProductLeanDoc, IProductQueryWithHelper } from '../models/product.model';
import ApiError from '../utils/ApiError';

/**
 * Create a product
 * @param {IProductLeanDoc} productBody
 * @returns {Promise<IProductDoc>}
 */
export const createProduct = async (productBody: IProductLeanDoc): Promise<IProductDoc> => {
  return ProductModel.create(productBody);
};

/**
 * Query for products
 * @param {FilterQuery<IProduct>} filter - Mongo filter
 * @param {PaginateOptions} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult<IProduct, Record<string, never>>>}
 */
export const queryProducts = async (
  filter: FilterQuery<IProduct>,
  options: PaginateOptions
): Promise<QueryResult<IProduct, Record<string, never>>> => {
  const products =
    typeof ProductModel.paginate === 'function'
      ? await ProductModel.paginate(filter, options)
      : { results: [], page: 0, limit: 0, totalPages: 0, totalResults: 0 };
  return products;
};

/**
 * Get product by id
 * @param {Types.ObjectId} id
 * @returns {Promise<IProductQueryWithHelper>}
 */
export const getProductById = async (id: string | Types.ObjectId): Promise<IProductQueryWithHelper> => {
  return ProductModel.findById(id);
};

/**
 * Update product by id
 * @param {string | Types.ObjectId} id
 * @param {Partial<IProduct>} updateBody
 * @returns {Promise<IProductDoc>}
 */
export const updateProductById = async (
  id: string | Types.ObjectId,
  updateBody: Partial<IProduct>
): Promise<IProductDoc> => {
  const product = await getProductById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Delete product by id
 * @param {string | Types.ObjectId} productId
 * @returns {Promise<IProductDoc>}
 */
export const deleteProductById = async (productId: string | Types.ObjectId): Promise<IProductDoc> => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await product.remove();
  return product;
};

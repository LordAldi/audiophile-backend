import {
  AnyObject,
  Document,
  EnforceDocument,
  LeanDocument,
  model,
  Model,
  QueryWithHelpers,
  Schema,
  Types,
  _AllowStringsForIds,
} from 'mongoose';
import paginate, { PaginationFunc } from './plugins/paginate.plugin';
import toJSON from './plugins/toJSON.plugin';

export enum Category {
  headphones = 'headphones',
  earphones = 'earphones',
  speakers = 'speakers',
}
export interface IInTheBox {
  name: string;
  total: number;
}

export interface IProduct {
  name: string;
  description: string;
  category: string;
  price: number;
  features: string;
  inTheBox: Array<IInTheBox>;
  isShow: boolean;
}
/**
 * Moogoose DB IProduct model type with methods.
 */
/* eslint-disable no-unused-vars */
export interface IProductModel extends Model<IProduct, Record<string, never>, Record<string, never>> {
  paginate?: PaginationFunc<IProduct, Record<string, never>>;
}
/* eslint-enable no-unused-vars */

/**
 * Mongoose DB IProduct document type with methods.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IProductDoc = IProduct & Document<Record<string, any>, Record<string, never>, IProduct>;

/**
 * Mongoose DB Query IProduct return type.
 */
export type IProductQueryWithHelper = QueryWithHelpers<
  EnforceDocument<IProduct, Record<string, never>> | null,
  EnforceDocument<IProduct, Record<string, never>>,
  Record<string, never>,
  IProduct
>;

/**
 * Moogoose DB general IProduct parameter type.
 */
export type IProductLeanDoc = IProduct | _AllowStringsForIds<LeanDocument<IProduct>> | AnyObject;

const productSchema = new Schema<IProduct, IProductModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      validate(value: number) {
        if (value <= 0) {
          throw new Error('Price must be at least one');
        }
      },
    },
    category: {
      type: String,
      enum: Object.values(Category),
      required: true,
    },
    features: {
      type: String,
      required: true,
      trim: true,
    },
    isShow: {
      type: Boolean,
      default: false,
    },
    inTheBox: {
      type: [
        {
          name: {
            type: String,
          },
          total: {
            type: Number,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

/**
 * IProduct model typed IProductModel instance
 */
const ProductModel: IProductModel = model<IProduct, IProductModel>('Product', productSchema);

export default ProductModel;

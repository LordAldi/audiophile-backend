import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import ProductModel, { Category, IProduct, IProductLeanDoc } from '../../src/models/product.model';
import { options } from 'joi';

export type MongooseObjectIdType = {
  _id?: Types.ObjectId;
};

export const productHeadphones: Readonly<IProduct & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  description: faker.lorem.paragraph(),
  category: 'headphones',
  price: 599,
  features: faker.lorem.paragraphs(2),
  isShow: false,
  inTheBox: [
    { name: 'headphone unit', total: 1 },
    { name: 'user manual', total: 1 },
    { name: 'replacement earcup', total: 2 },
  ],
};
export const productHeadphones2: Readonly<IProduct & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  description: faker.lorem.paragraph(),
  category: 'headphones',
  price: 299,
  features: faker.lorem.paragraphs(2),
  isShow: false,
  inTheBox: [
    { name: 'headphone unit', total: 1 },
    { name: 'user manual', total: 1 },
    { name: 'replacement earcup', total: 2 },
  ],
};

export const productEarphones: Readonly<IProduct & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  description: faker.lorem.paragraph(),
  category: 'earphones',
  price: 350,
  features: faker.lorem.paragraphs(2),
  isShow: false,
  inTheBox: [
    { name: 'headphone unit', total: 1 },
    { name: 'user manual', total: 1 },
    { name: 'replacement earcup', total: 2 },
  ],
};
export const productSpeakers: Readonly<IProduct & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  description: faker.lorem.paragraph(),
  category: 'speakers',
  price: 799,
  features: faker.lorem.paragraphs(2),
  isShow: false,
  inTheBox: [
    { name: 'headphone unit', total: 1 },
    { name: 'user manual', total: 1 },
    { name: 'replacement earcup', total: 2 },
  ],
};

export const insertProducts = async (products: IProductLeanDoc[]): Promise<void> => {
  await ProductModel.insertMany(products.map((product) => ({ ...product })));
};

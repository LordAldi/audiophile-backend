import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import ProductModel, { Category, IProduct, IProductLeanDoc } from '../../src/models/product.model';
import { options } from 'joi';

export type MongooseObjectIdType = {
  _id?: Types.ObjectId;
};

export const productOne: Readonly<IProduct & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  description: faker.lorem.paragraph(),
  category: 'headphones',
  price: faker.random.number({ min: 1, max: 1000 }),
  features: faker.lorem.paragraphs(2),
  isShow: false,
  inTheBox: [
    { name: 'headphone unit', total: 1 },
    { name: 'user manual', total: 1 },
    { name: 'replacement earcup', total: 2 },
  ],
};

export const productTwo: Readonly<IProduct & MongooseObjectIdType> = {
  _id: Types.ObjectId(),
  name: faker.name.findName(),
  description: faker.lorem.paragraph(),
  category: 'earphones',
  price: faker.random.number({ min: 1, max: 1000 }),
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

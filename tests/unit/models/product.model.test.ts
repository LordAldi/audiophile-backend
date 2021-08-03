import faker from 'faker';
import ProductModel, { IProduct } from '../../../src/models/product.model';

describe('Product model', () => {
  describe('Product validation', () => {
    let newProduct: IProduct | undefined;
    beforeEach(() => {
      newProduct = {
        name: faker.name.findName(),
        description: faker.lorem.paragraph(),
        category: 'headphones',
        price: faker.datatype.number({ min: 1, max: 1000 }),
        features: faker.lorem.paragraphs(2),
        isShow: false,
        inTheBox: [
          { name: 'headphone unit', total: 1 },
          { name: 'user manual', total: 1 },
          { name: 'replacement earcup', total: 2 },
        ],
      };
    });

    test('should correctly validate a valid product', async () => {
      await expect(new ProductModel(newProduct).validate()).resolves.toBeUndefined();
    });
    test('should correctly validate a valid product speakers', async () => {
      newProduct.category = 'speakers';
      await expect(new ProductModel(newProduct).validate()).resolves.toBeUndefined();
    });
    test('should correctly validate a valid product earphones', async () => {
      newProduct.category = 'earphones';
      await expect(new ProductModel(newProduct).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if category is unknown', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newProduct as any).category = 'invalid';
      await expect(new ProductModel(newProduct).validate()).rejects.toThrow();
    });
  });
});

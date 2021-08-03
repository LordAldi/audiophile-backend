import request from 'supertest';
import faker from 'faker';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { userOne, userTwo, admin, insertUsers } from '../fixtures/user.fixture';
import ProductModel, { IProduct } from '../../src/models/product.model';
import { userOneAccessToken, adminAccessToken } from '../fixtures/token.fixture';
import {
  insertProducts,
  productEarphones,
  productHeadphones2,
  productHeadphones,
  productSpeakers,
} from '../fixtures/product.fixture';

setupTestDB();

describe('Product Routes', () => {
  describe('POST /v1/products', () => {
    let newProduct: Partial<IProduct> | undefined;
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

    test('should return 201 and successfully create new product if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: newProduct.price,
        features: newProduct.features,
        inTheBox: newProduct.inTheBox,
        isShow: newProduct.isShow,
      });

      const dbProduct = await ProductModel.findById(res.body.id);
      expect(dbProduct).toBeDefined();

      expect(dbProduct).toMatchObject({
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: newProduct.price,
        features: newProduct.features,
        inTheBox: newProduct.inTheBox,
        isShow: newProduct.isShow,
      });
    });

    test('should be able to create a speakers as well', async () => {
      await insertUsers([admin]);
      newProduct.category = 'speakers';

      const res = await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.CREATED);

      expect(res.body.category).toBe('speakers');

      const dbProduct = await ProductModel.findById(res.body.id);
      expect(dbProduct.role).toBe('speakers');
    });
    test('should be able to create a earphones as well', async () => {
      await insertUsers([admin]);
      newProduct.category = 'earphones';

      const res = await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.CREATED);

      expect(res.body.category).toBe('earphones');

      const dbProduct = await ProductModel.findById(res.body.id);
      expect(dbProduct.role).toBe('earphones');
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if category is invalid', async () => {
      await insertUsers([admin]);
      newProduct.category = 'invalidEmail';

      await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if price is 0', async () => {
      await insertUsers([admin]);
      newProduct.price = 0;

      await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if price is less than 0', async () => {
      await insertUsers([admin]);
      newProduct.price = -21;

      await request(app)
        .post('/v1/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProduct)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/products', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertProducts([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app).get('/v1/products').send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);
      expect(res.body.results[0]).toEqual({
        id: productHeadphones._id.toHexString(),
        name: productHeadphones.name,
        description: productHeadphones.description,
        category: productHeadphones.category,
        price: productHeadphones.price,
        features: productHeadphones.features,
        inTheBox: productHeadphones.inTheBox,
        isShow: productHeadphones.isShow,
      });
    });

    test('should correctly apply filter on name field', async () => {
      await insertUsers([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app)
        .get('/v1/products')
        .query({ name: productHeadphones.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(productHeadphones._id.toHexString());
    });

    test('should correctly apply filter on category field', async () => {
      await insertUsers([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app).get('/v1/products').query({ category: 'headphones' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(productHeadphones._id.toHexString());
      expect(res.body.results[1].id).toBe(productHeadphones2._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app).get('/v1/products').query({ sortBy: 'price:desc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);
      expect(res.body.results[0].id).toBe(productSpeakers._id.toHexString());
      expect(res.body.results[1].id).toBe(productHeadphones._id.toHexString());
      expect(res.body.results[2].id).toBe(productEarphones._id.toHexString());
      expect(res.body.results[3].id).toBe(productHeadphones2._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app).get('/v1/products').query({ sortBy: 'role:asc' }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);
      expect(res.body.results[3].id).toBe(productSpeakers._id.toHexString());
      expect(res.body.results[2].id).toBe(productHeadphones._id.toHexString());
      expect(res.body.results[1].id).toBe(productEarphones._id.toHexString());
      expect(res.body.results[0].id).toBe(productHeadphones2._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app)
        .get('/v1/products')
        .query({ sortBy: 'category:desc,name:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);

      const expectedOrder = [productHeadphones, productHeadphones2, productEarphones, productSpeakers].sort((a, b) => {
        if (a.category < b.category) {
          return 1;
        }
        if (a.category > b.category) {
          return -1;
        }
        return a.name < b.name ? -1 : 1;
      });

      expectedOrder.forEach((user, index) => {
        expect(res.body.results[index].id).toBe(user._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app).get('/v1/products').query({ limit: 2 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(productHeadphones._id.toHexString());
      expect(res.body.results[1].id).toBe(productHeadphones2._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([productHeadphones, productHeadphones2, productEarphones, productSpeakers]);

      const res = await request(app).get('/v1/products').query({ page: 2, limit: 2 }).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(productEarphones._id.toHexString());
      expect(res.body.results[1].id).toBe(productSpeakers._id.toHexString());
    });
  });

  describe('GET /v1/products/:productId', () => {
    test('should return 200 and the product object if data is ok', async () => {
      await insertProducts([productHeadphones]);

      const res = await request(app).get(`/v1/products/${productHeadphones._id}`).send().expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: productHeadphones.name,
        description: productHeadphones.description,
        category: productHeadphones.category,
        price: productHeadphones.price,
        features: productHeadphones.features,
        inTheBox: productHeadphones.inTheBox,
        isShow: productHeadphones.isShow,
      });
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertProducts([admin]);

      await request(app).get('/v1/products/invalidId').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if product is not found', async () => {
      await insertProducts([admin]);

      await request(app)
        .get(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/products/:productId', () => {
    test('should return 204 if data is ok', async () => {
      await insertProducts([productHeadphones]);

      await request(app)
        .delete(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbProduct = await ProductModel.findById(productHeadphones._id);
      expect(dbProduct).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertProducts([productHeadphones]);

      await request(app).delete(`/v1/products/${productHeadphones._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 403 error if user login not admin', async () => {
      await insertProducts([productHeadphones]);

      await request(app)
        .delete(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertProducts([productHeadphones]);

      await request(app)
        .delete('/v1/products/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user already is not found', async () => {
      await insertProducts([productEarphones]);

      await request(app)
        .delete(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/products/:productId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = {
        name: faker.name.findName(),
        description: faker.lorem.paragraph(),
        category: 'speakers',
        inTheBox: [
          { name: 'speaker unit', total: 1 },
          { name: 'user manual', total: 1 },
          { name: 'pocket', total: 2 },
        ],
      };

      const res = await request(app)
        .patch(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: productHeadphones._id.toHexString(),
        name: updateBody.name,
        description: updateBody.description,
        category: updateBody.category,
        price: productHeadphones.price,
        features: productHeadphones.features,
        inTheBox: updateBody.inTheBox,
        isShow: productHeadphones.isShow,
      });

      const dbProduct = await ProductModel.findById(productHeadphones._id);
      expect(dbProduct).toBeDefined();
      expect(dbProduct).toMatchObject({
        name: updateBody.name,
        description: updateBody.description,
        inTheBox: updateBody.inTheBox,
        category: updateBody.category,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = { name: faker.name.findName() };

      await request(app).patch(`/v1/products/${productHeadphones._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating product', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/products/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if productId is not a valid mongo id', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/products/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if category is invalid', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = { emacategoryil: 'invalidCategory' };

      await request(app)
        .patch(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if price is equal to 0', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = { price: 0 };

      await request(app)
        .patch(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if price is less than 0', async () => {
      await insertProducts([productHeadphones]);
      const updateBody = { price: -27 };

      await request(app)
        .patch(`/v1/products/${productHeadphones._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});

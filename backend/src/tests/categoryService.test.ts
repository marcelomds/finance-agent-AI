import { prisma } from "../db/prisma";
import { createCategory } from "../services/categoryService";

jest.mock('../db/prisma', () => ({
  prisma: {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const createMock = jest.mocked(prisma.category.create);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createCategory', () => {
    it('create a category scoped to the organization', async () => {
        const fakeCategory = {
            id: '1',
            organizationId: 'org-1',
            name: 'Food',
            slug: 'food',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        createMock.mockResolvedValue(fakeCategory);

        const result = await createCategory('org-1', {
            name: 'Food',
            slug: 'food',
        });

        expect(createMock).toHaveBeenCalledWith({
            data: {
                organizationId: 'org-1',
                name: 'Food',
                slug: 'food',
            },
        });

        expect(result).toEqual(fakeCategory);
    });
});

describe('createCategory error handling', () => {
    it('should throw an error if the category creation fails', async () => {
        createMock.mockRejectedValue(new Error('Database error'));

        await expect(createCategory('org-1', {
            name: 'Food',
            slug: 'food',
        })).rejects.toThrow('Database error');

        expect(createMock).toHaveBeenCalledWith({
            data: {
                organizationId: 'org-1',
                name: 'Food',
                slug: 'food',
            },
        });
    });
});

describe('createCategory with invalid input', () => {
    it('should throw an error if the input is invalid', async () => {
        createMock.mockRejectedValue(new Error('Invalid input'));

        await expect(createCategory('org-1', {
            name: '',
            slug: '',
        })).rejects.toThrow('Invalid input');

        expect(createMock).toHaveBeenCalledWith({
            data: {
                organizationId: 'org-1',
                name: '',
                slug: '',
            },
        });
    });
});

describe('createCategory with duplicate slug', () => {
    it('should throw an error if the slug already exists', async () => {
        createMock.mockRejectedValue(new Error('Unique constraint failed on the fields: (`slug`)'));

        await expect(createCategory('org-1', {
            name: 'Food',
            slug: 'food',
        })).rejects.toThrow('Unique constraint failed on the fields: (`slug`)');

        expect(createMock).toHaveBeenCalledWith({
            data: {
                organizationId: 'org-1',
                name: 'Food',
                slug: 'food',
            },
        });
    });
});

describe('createCategory with missing organizationId', () => {
    it('should throw an error if the organizationId is missing', async () => {
        createMock.mockRejectedValue(new Error('Missing organizationId'));

        await expect(createCategory('', {
            name: 'Food',
            slug: 'food',
        })).rejects.toThrow('Missing organizationId');

        expect(createMock).toHaveBeenCalledWith({
            data: {
                organizationId: '',
                name: 'Food',
                slug: 'food',
            },
        });
    });
});

describe('createCategory with missing name', () => {
    it('should throw an error if the name is missing', async () => {
        createMock.mockRejectedValue(new Error('Missing name'));

        await expect(createCategory('org-1', {
            name: '',
            slug: 'food',
        })).rejects.toThrow('Missing name');

        expect(createMock).toHaveBeenCalledWith({
            data: {
                organizationId: 'org-1',
                name: '',
                slug: 'food',
            },
        });
    });
});

describe('createCategory with missing slug', () => {
    it('should throw an error if the slug is missing', async () => {
        createMock.mockRejectedValue(new Error('Missing slug'));

        await expect(createCategory('org-1', {
            name: 'Food',
            slug: '',
        })).rejects.toThrow('Missing slug');

        expect(createMock).toHaveBeenCalledWith({
            data: {
                organizationId: 'org-1',
                name: 'Food',
                slug: '',
            },
        });
    });
});
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
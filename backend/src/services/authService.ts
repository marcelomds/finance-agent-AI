import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../db/prisma';
import { ConflictError, UnauthorizedError, ValidationError } from '../api/errors/AppError';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET env var is required');

const JWT_EXPIRES_IN = '1d';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export type AuthTokenPayload = {
  userId: string;
  organizationId: string;
  email: string;
};

type AuthResult = {
  token: string;
  user: { id: string; email: string; name: string; organizationId: string };
};

function issueToken(user: { id: string; email: string; organizationId: string; name: string }): AuthResult {
  const payload: AuthTokenPayload = {
    userId: user.id,
    organizationId: user.organizationId,
    email: user.email,
  };

  const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, organizationId: user.organizationId },
  };
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'org'
  );
}

async function uniqueOrganizationSlug(base: string): Promise<string> {
  const slugBase = slugify(base);
  let slug = slugBase;
  let suffix = 1;

  while (await prisma.organization.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugBase}-${suffix}`;
  }

  return slug;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  const passwordMatches = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return issueToken(user);
}

export async function register(email: string, password: string, name: string): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const organizationName = `${name}'s Organization`;
  const slug = await uniqueOrganizationSlug(name);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      organization: { create: { name: organizationName, slug } },
    },
  });

  return issueToken(user);
}

export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  if (!googleClient) {
    throw new UnauthorizedError('Google login is not configured');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new UnauthorizedError('Invalid Google token');
  }

  if (!payload?.email || !payload.sub) {
    throw new ValidationError('Google token missing required fields');
  }

  const { email, sub: googleId, name } = payload;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const user = existing.googleId
      ? existing
      : await prisma.user.update({ where: { id: existing.id }, data: { googleId } });
    return issueToken(user);
  }

  const displayName = name ?? email.split('@')[0];
  const slug = await uniqueOrganizationSlug(displayName);

  const user = await prisma.user.create({
    data: {
      email,
      name: displayName,
      googleId,
      organization: { create: { name: `${displayName}'s Organization`, slug } },
    },
  });

  return issueToken(user);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
}

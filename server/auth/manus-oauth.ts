import type { Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { getUserByOpenId, upsertFarmer } from '../db/index.js';

const APP_COOKIE = 'webdev_app_session';
const STATE_COOKIE = 'agri_oauth_state';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const COOKIE_BASE = 'Path=/; HttpOnly; Secure; SameSite=None';

type AppClaims = JwtPayload & { appId?: string; openId?: string; name?: string; email?: string };

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return undefined;
}

function setCookie(response: Response, name: string, value: string, maxAge: number): void {
  response.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${COOKIE_BASE}; Max-Age=${maxAge}`);
}

function clearCookie(response: Response, name: string): void {
  response.append('Set-Cookie', `${name}=; ${COOKIE_BASE}; Max-Age=0`);
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required authentication setting: ${name}`);
  return value;
}

function safeOrigin(value: unknown, request: Request): string {
  if (typeof value !== 'string') throw new Error('Missing browser origin.');
  const parsed = new URL(value);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Unsupported browser origin.');
  if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('Invalid browser origin.');
  }
  if (parsed.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
    throw new Error('Secure sign-in requires HTTPS.');
  }
  const forwardedHost = request.get('x-forwarded-host');
  const forwardedProto = request.get('x-forwarded-proto');
  let forwardedPublicOrigin: string | null = null;
  if (forwardedHost || forwardedProto) {
    if (!forwardedHost || !forwardedProto || forwardedHost.includes(',') || forwardedProto.includes(',')) {
      throw new Error('The Preview sign-in origin could not be verified.');
    }
    const forwarded = new URL(`${forwardedProto}://${forwardedHost}`);
    if (!['https:', 'http:'].includes(forwarded.protocol) || forwarded.username || forwarded.password || forwarded.pathname !== '/' || forwarded.search || forwarded.hash) {
      throw new Error('The Preview sign-in origin could not be verified.');
    }
    forwardedPublicOrigin = forwarded.origin;
    if (forwardedPublicOrigin !== parsed.origin) throw new Error('Browser origin mismatch.');
  }

  const originHeader = request.get('origin');
  if (originHeader) {
    const header = new URL(originHeader);
    if (header.username || header.password || header.pathname !== '/' || header.search || header.hash) {
      throw new Error('Invalid browser request origin.');
    }
    const internalOrigin = `${request.protocol}://${request.get('host')}`;
    if (header.origin !== parsed.origin && (!forwardedPublicOrigin || header.origin !== internalOrigin)) {
      throw new Error('Browser origin mismatch.');
    }
  }
  return parsed.origin;
}

function unpackState(value: string): { redirectUri: string; nonce: string } {
  const parsed = JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as { redirectUri?: unknown; nonce?: unknown };
  if (typeof parsed.redirectUri !== 'string' || typeof parsed.nonce !== 'string') throw new Error('Invalid sign-in state.');
  return { redirectUri: parsed.redirectUri, nonce: parsed.nonce };
}

export async function beginManusLogin(request: Request, response: Response): Promise<void> {
  let origin: string;
  try {
    origin = safeOrigin(request.body?.origin, request);
  } catch {
    response.status(400).json({ error: 'This sign-in request could not be verified. Reload and try again.' });
    return;
  }
  const redirectUri = new URL('/api/auth/callback', origin).toString();
  const nonce = randomUUID() + randomUUID();
  const state = Buffer.from(JSON.stringify({ redirectUri, nonce }), 'utf8').toString('base64');
  const cookieState = Buffer.from(JSON.stringify({ redirectUri, nonce }), 'utf8').toString('base64url');
  setCookie(response, STATE_COOKIE, cookieState, 5 * 60);

  const portal = new URL('/app-auth', requiredEnv('MANUS_OAUTH_PORTAL_URL'));
  portal.searchParams.set('appId', requiredEnv('MANUS_PROJECT_ID'));
  portal.searchParams.set('redirectUri', redirectUri);
  portal.searchParams.set('state', state);
  portal.searchParams.set('responseType', 'code');
  response.json({ authorizationUrl: portal.toString() });
}

export async function finishManusLogin(request: Request, response: Response): Promise<void> {
  const stateFromQuery = typeof request.query.state === 'string' ? request.query.state : '';
  const code = typeof request.query.code === 'string' ? request.query.code : '';
  const savedState = readCookie(request, STATE_COOKIE);
  clearCookie(response, STATE_COOKIE);
  if (!stateFromQuery || !code || !savedState) throw new Error('The sign-in link expired. Please try again.');

  const fromProvider = unpackState(stateFromQuery);
  const fromCookie = unpackState(Buffer.from(savedState, 'base64url').toString('base64'));
  if (fromProvider.nonce !== fromCookie.nonce || fromProvider.redirectUri !== fromCookie.redirectUri) {
    throw new Error('Sign-in state could not be verified. Please try again.');
  }

  const apiUrl = requiredEnv('MANUS_OAUTH_API_URL');
  const exchangeResponse = await fetch(new URL('webdev.v1.WebDevAuthPublicService/ExchangeToken', ensureTrailingSlash(apiUrl)), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: requiredEnv('MANUS_PROJECT_ID'),
      grantType: 'authorization_code',
      code,
      redirectUri: fromProvider.redirectUri,
    }),
  });
  const exchange = await exchangeResponse.json() as { accessToken?: string; error?: { message?: string } };
  if (!exchangeResponse.ok || !exchange.accessToken) throw new Error(exchange.error?.message || 'The account sign-in could not be completed.');

  const identityResponse = await fetch(new URL('webdev.v1.WebDevAuthPublicService/GetUserInfo', ensureTrailingSlash(apiUrl)), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken: exchange.accessToken }),
  });
  const identity = await identityResponse.json() as { openId?: string; name?: string; email?: string; error?: { message?: string } };
  if (!identityResponse.ok || !identity.openId) throw new Error(identity.error?.message || 'Your account details could not be verified.');

  const user = await upsertFarmer(identity.openId, identity.name || 'Farmer', identity.email || null);
  const token = jwt.sign(
    { appId: requiredEnv('MANUS_PROJECT_ID'), openId: user.openId },
    requiredEnv('MANUS_JWT_SECRET'),
    { algorithm: 'HS256', expiresIn: MAX_AGE_SECONDS },
  );
  setCookie(response, APP_COOKIE, token, MAX_AGE_SECONDS);
  const destination = new URL('/app', fromProvider.redirectUri).toString();
  response.redirect(302, destination);
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

export async function currentAppUser(request: Request) {
  const token = readCookie(request, APP_COOKIE);
  if (!token) return null;
  try {
    const claims = jwt.verify(token, requiredEnv('MANUS_JWT_SECRET'), { algorithms: ['HS256'] }) as AppClaims;
    if (claims.appId !== requiredEnv('MANUS_PROJECT_ID') || typeof claims.openId !== 'string' || !claims.openId) return null;
    const name = typeof claims.name === 'string' ? claims.name : 'Farmer';
    const email = typeof claims.email === 'string' ? claims.email : null;
    const existingUser = await getUserByOpenId(claims.openId);
    return existingUser ?? await upsertFarmer(claims.openId, name, email);
  } catch {
    return null;
  }
}

export function endManusLogin(response: Response): void {
  clearCookie(response, APP_COOKIE);
}

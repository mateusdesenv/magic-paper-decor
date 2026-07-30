import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { connectDatabase } from "./db.js";
import { Collaborator } from "./collaborator.js";

const projectId = "magic-paper-71daf";
export const ownerEmails = new Set(["kaualippert24@gmail.com", "mateus.desenv@gmail.com"]);
const keys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Autenticação obrigatória." });
  try {
    const { payload } = await jwtVerify(token, keys, {
      algorithms: ["RS256"],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });
    if (!payload.sub) throw new Error("Token sem usuário.");
    res.locals.user = { uid: payload.sub, email: String(payload.email || "").toLowerCase(), name: payload.name, picture: payload.picture };
    next();
  } catch {
    res.status(401).json({ message: "Sessão inválida ou expirada." });
  }
}

export async function requireAccess(req: Request, res: Response, next: NextFunction) {
  const email = res.locals.user?.email;
  if (ownerEmails.has(email)) return next();
  await connectDatabase();
  const collaborator = await Collaborator.findOne({ uid: res.locals.user?.uid }).lean();
  if (collaborator?.status === "approved") return next();
  res.status(403).json({ message: "Acesso ainda não liberado." });
}

export function requireOwner(_req: Request, res: Response, next: NextFunction) {
  if (ownerEmails.has(res.locals.user?.email)) return next();
  res.status(403).json({ message: "Apenas administradores podem gerenciar colaboradores." });
}

import * as bcrypt from "bcryptjs";

const saltRounds = 8;

export type Input = string;
export type Digest = string;

/**
 * Create a password hash.
 */
export const hashPassword = (password: Input): Promise<Digest> => bcrypt.hash(password, saltRounds);

/**
 * Validate a given password.
 *
 * Uses a "constant-time" algorithm to counter timing attacks.
 *
 */
export const isPasswordMatch = (
  candidatePassword: Input,
  knownPasswordHash: Digest,
): Promise<boolean> => bcrypt.compare(candidatePassword, knownPasswordHash);

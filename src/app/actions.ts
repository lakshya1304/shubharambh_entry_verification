"use server";

import crypto from "crypto";

const TARGET_HASH = "7bebe75464718bb6e6bad697e510c6a20c7ba85fbcf15326dc6af6d4df4ea6d2";

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return hash === TARGET_HASH;
}

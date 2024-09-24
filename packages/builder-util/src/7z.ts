import { path7x, path7z } from "7zip-bin"
import { chmod } from "fs-extra"
import * as fs from "fs"

export async function getPath7z(): Promise<string> {
  if (fs.existsSync(path7z)) {
    await chmod(path7z, 0o755)
  }
  return path7z
}

export async function getPath7x(): Promise<string> {
  await chmod(path7x, 0o755)
  return path7x
}

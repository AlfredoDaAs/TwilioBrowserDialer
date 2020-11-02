import * as short from "short-uuid"
import { v4 as uuidV4 } from "uuid"

const base33 = "1234567890abcdefghjkmnpqrstuvwxyz"
const base36 = "1234567890abcdefghijklmnopqrstuvwxyz"
const base62 = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

function normalizePrefix(prefix: string) {
    if (prefix === null) {
      return ""
    }
  
    return prefix
  }
  
  function calculateCharsetFromBase(base?: string) {
    let charset
  
    switch (base) {
      case undefined:
      case null:
        charset = short.constants.flickrBase58
        break
      case "base33":
        charset = base33
        break
      case "base36":
        charset = base36
        break
      case "base58":
        charset = short.constants.flickrBase58
        break
      case "base62":
        charset = base62
        break
      case "base90":
        charset = short.constants.cookieBase90
        break
    }
  
    if (charset === null) {
      throw new Error("unknown base for uuid generation")
    }
  
    return charset
  }
  
  class ShortUUID {
    public newUuidV4() {
      return uuidV4()
    }
  
    public newFriendlyUuid() {
        return this.newShortUuidV4("base33")
    }
  
    public newBase58Uuid() {
        return this.newShortUuidV4("base58")
    }
  
    public newShortUuidV4(base?: string) {
      const charset = calculateCharsetFromBase(base)
      return short(charset).new()
    }
  
    public uuidV4ToShortUuidV4(inUuid: string, base: string) {
      const charset = calculateCharsetFromBase(base)
      return short(charset).fromUUID(inUuid)
    }
  
    public shortUuidV4ToUuidV4(inShortId: string, base: string) {
      const charset = calculateCharsetFromBase(base)
      return short(charset).toUUID(inShortId)
    }
  
    public newUuidV4WithPrefix(prefix: string) {
      const normalizedPrefix = normalizePrefix(prefix)
      return normalizedPrefix + this.newUuidV4()
    }
  
    public newShortUuidV4WithPrefix(prefix: string, base: string) {
      const normalizedPrefix = normalizePrefix(prefix)
      return normalizedPrefix + this.newShortUuidV4(base)
    }
  }
  
  export default new ShortUUID()
  
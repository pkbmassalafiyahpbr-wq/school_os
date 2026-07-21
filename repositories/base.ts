import { getDatabase } from '@/database'

export abstract class BaseRepository {
  protected get db() {
    return getDatabase()
  }
}

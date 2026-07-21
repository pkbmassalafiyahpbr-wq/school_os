declare module 'sql.js' {
  interface SqlJsStatic {
    Database: new (data?: Uint8Array | number[]) => any
  }
  const initSqlJs: () => Promise<SqlJsStatic>
  export default initSqlJs
}

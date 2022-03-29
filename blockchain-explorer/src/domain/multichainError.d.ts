//{"errno":-61,"code":"ECONNREFUSED","syscall":"connect","address":"127.0.0.1","port":8000}

export interface MultichainError {
  errno: number;
  code: string;
  syscall: string;
  address: string;
  port: number;
}

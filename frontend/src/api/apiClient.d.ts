declare const apiClient: {
  get: (path: string, opts?: any) => Promise<any>;
  post: (path: string, body?: any, opts?: any) => Promise<any>;
  put: (path: string, body?: any, opts?: any) => Promise<any>;
  del: (path: string, opts?: any) => Promise<any>;
};

export default apiClient;
import type {
  AdminUser,
  UserDetail,
  AdminCat,
  CatDetail,
  AdminOrder,
  OrderDetail,
  AdminProduct,
  DashboardStats,
  Analytics,
  ProductInput,
  AdminBreed,
  BreedInput,
  AdminEvent,
  EventInput,
  AdminArticle,
  ArticleInput,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_CUSTOMER_API_URL || "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 401 && !path.startsWith("/api/admin/auth/")) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return body as T;
}

export const adminApi = {
  login: (input: { username: string; password: string }) =>
    request<{ admin: { id: string; username: string } }>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logout: () =>
    request<{ success: boolean }>("/api/admin/auth/logout", {
      method: "POST",
    }),

  me: () => request<{ admin: { id: string; username: string } }>("/api/admin/auth/me"),

  getDashboard: () => request<DashboardStats>("/api/admin/dashboard"),

  getUsers: (
    params: { page?: number; limit?: number; search?: string } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    return request<{
      users: AdminUser[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/users?${qs.toString()}`);
  },

  getUser: (id: string) => request<UserDetail>(`/api/admin/users/${id}`),

  getCats: (
    params: { page?: number; limit?: number; breedId?: string } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.breedId) qs.set("breedId", params.breedId);
    return request<{
      cats: AdminCat[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/cats?${qs.toString()}`);
  },

  getCat: (id: string) => request<CatDetail>(`/api/admin/cats/${id}`),

  getOrders: (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
    if (params.dateTo) qs.set("dateTo", params.dateTo);
    return request<{
      orders: AdminOrder[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/orders?${qs.toString()}`);
  },

  getOrder: (id: string) => request<OrderDetail>(`/api/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string) =>
    request<{ order: { id: string; status: string } }>(
      `/api/admin/orders/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    ),

  getProducts: (
    params: {
      page?: number;
      limit?: number;
      category?: string;
      isActive?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.category) qs.set("category", params.category);
    if (params.isActive) qs.set("isActive", params.isActive);
    return request<{
      products: AdminProduct[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/products?${qs.toString()}`);
  },

  createProduct: (input: ProductInput) =>
    request<AdminProduct>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateProduct: (id: string, input: Partial<ProductInput>) =>
    request<AdminProduct>(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: "DELETE",
    }),

  getBreeds: (
    params: { page?: number; limit?: number; search?: string } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    return request<{
      breeds: AdminBreed[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/breeds?${qs.toString()}`);
  },

  getBreed: (id: string) => request<AdminBreed>(`/api/admin/breeds/${id}`),

  createBreed: (input: BreedInput) =>
    request<AdminBreed>("/api/admin/breeds", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateBreed: (id: string, input: Partial<BreedInput>) =>
    request<AdminBreed>(`/api/admin/breeds/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteBreed: (id: string) =>
    request<{ success: boolean }>(`/api/admin/breeds/${id}`, {
      method: "DELETE",
    }),

  // Uploads an image file and returns the public URL to store on the product.
  uploadProductImage: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/admin/products/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || `Upload gagal: ${res.status}`);
    }
    return body as { url: string };
  },

  getAnalytics: () => request<Analytics>("/api/admin/analytics"),

  getEvents: (
    params: { page?: number; limit?: number; status?: string } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    return request<{
      events: AdminEvent[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/events?${qs.toString()}`);
  },

  createEvent: (input: EventInput) =>
    request<AdminEvent>("/api/admin/events", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateEvent: (id: string, input: Partial<EventInput>) =>
    request<AdminEvent>(`/api/admin/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteEvent: (id: string) =>
    request<{ success: boolean }>(`/api/admin/events/${id}`, {
      method: "DELETE",
    }),

  // ─────────────────────────────────────────────
  // ARTICLES
  // ─────────────────────────────────────────────
  getArticles: (
    params: { page?: number; limit?: number; category?: string } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.category) qs.set("category", params.category);
    return request<{
      articles: AdminArticle[];
      total: number;
      page: number;
      limit: number;
    }>(`/api/admin/articles?${qs.toString()}`);
  },

  getArticle: (id: string) =>
    request<AdminArticle>(`/api/admin/articles/${id}`),

  createArticle: (input: ArticleInput) =>
    request<AdminArticle>("/api/admin/articles", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateArticle: (id: string, input: Partial<ArticleInput>) =>
    request<AdminArticle>(`/api/admin/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deleteArticle: (id: string) =>
    request<{ success: boolean }>(`/api/admin/articles/${id}`, {
      method: "DELETE",
    }),
};

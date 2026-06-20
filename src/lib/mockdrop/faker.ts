// Tiny client-side faker — no dependencies. Free forever.

const FIRST = ["Ada","Linus","Grace","Alan","Margaret","Tim","Dennis","Brian","Barbara","Ken","Hedy","Donald","Ada","Niklaus","Edsger","Anita","Radia","Frances","John","Karen"];
const LAST = ["Lovelace","Torvalds","Hopper","Turing","Hamilton","Berners-Lee","Ritchie","Kernighan","Liskov","Thompson","Lamarr","Knuth","Wirth","Dijkstra","Borg","Perlman","Allen","McCarthy","Spärck Jones"];
const COMPANY = ["Acme","Globex","Initech","Umbrella","Stark","Wayne","Cyberdyne","Tyrell","Pied Piper","Hooli","Soylent","Wonka"];
const TLD = ["com","io","dev","app","co","net"];
const ROLES = ["admin","user","editor","viewer","owner","guest"];
const CITIES = ["San Francisco","Berlin","Tokyo","London","Lisbon","Singapore","Toronto","Mexico City","Sydney","Cape Town"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const num = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const uuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const isoDate = (daysOffset = 0) => {
  const d = new Date(Date.now() + daysOffset * 86400000);
  return d.toISOString();
};

export const faker = {
  uuid,
  firstName: () => pick(FIRST),
  lastName: () => pick(LAST),
  fullName: () => `${pick(FIRST)} ${pick(LAST)}`,
  email: () => {
    const f = pick(FIRST).toLowerCase();
    const l = pick(LAST).toLowerCase().replace(/[^a-z]/g, "");
    return `${f}.${l}@${pick(COMPANY).toLowerCase()}.${pick(TLD)}`;
  },
  username: () => `${pick(FIRST).toLowerCase()}_${num(10, 999)}`,
  company: () => pick(COMPANY),
  city: () => pick(CITIES),
  role: () => pick(ROLES),
  bool: () => Math.random() > 0.5,
  int: (min = 0, max = 1000) => num(min, max),
  price: (min = 1, max = 999) => parseFloat((Math.random() * (max - min) + min).toFixed(2)),
  pastDate: () => isoDate(-num(1, 365)),
  futureDate: () => isoDate(num(1, 365)),
  ip: () => `${num(1, 255)}.${num(0, 255)}.${num(0, 255)}.${num(0, 255)}`,
  url: () => `https://${pick(COMPANY).toLowerCase()}.${pick(TLD)}/path/${num(1, 999)}`,
  avatar: (seed?: string) => `https://i.pravatar.cc/150?u=${seed || uuid()}`,
};

export type Template =
  | "user"
  | "userList"
  | "product"
  | "productList"
  | "order"
  | "post"
  | "error404"
  | "error500"
  | "auth"
  | "paginated";

export const TEMPLATES: { id: Template; name: string; description: string }[] = [
  { id: "user", name: "User profile", description: "Single user with preferences" },
  { id: "userList", name: "User list", description: "Array of 10 users" },
  { id: "product", name: "Product", description: "E-commerce product item" },
  { id: "productList", name: "Product catalog", description: "Array of 8 products" },
  { id: "order", name: "Order", description: "Order with line items" },
  { id: "post", name: "Blog post", description: "Article with author + tags" },
  { id: "auth", name: "Auth response", description: "Token + user object" },
  { id: "paginated", name: "Paginated list", description: "Items with meta + cursor" },
  { id: "error404", name: "404 Not Found", description: "Standard error response" },
  { id: "error500", name: "500 Server Error", description: "Server failure" },
];

const oneUser = () => ({
  id: faker.uuid(),
  name: faker.fullName(),
  email: faker.email(),
  username: faker.username(),
  role: faker.role(),
  avatar: faker.avatar(),
  city: faker.city(),
  active: faker.bool(),
  createdAt: faker.pastDate(),
});

const oneProduct = () => ({
  id: faker.uuid(),
  sku: `SKU-${faker.int(1000, 9999)}`,
  name: `${faker.company()} ${pick(["Pro","Lite","Max","Air","X","Mini"])}`,
  price: faker.price(9, 499),
  currency: "USD",
  inStock: faker.bool(),
  rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
  imageUrl: `https://picsum.photos/seed/${faker.uuid()}/400/400`,
});

export function generateTemplate(t: Template): unknown {
  switch (t) {
    case "user":
      return { ...oneUser(), preferences: { theme: "dark", notifications: true, language: "en" } };
    case "userList":
      return { data: Array.from({ length: 10 }, oneUser), total: 10 };
    case "product":
      return oneProduct();
    case "productList":
      return { data: Array.from({ length: 8 }, oneProduct), total: 8 };
    case "order":
      return {
        id: faker.uuid(),
        orderNumber: `ORD-${faker.int(10000, 99999)}`,
        customer: { id: faker.uuid(), name: faker.fullName(), email: faker.email() },
        items: Array.from({ length: 3 }, () => ({
          productId: faker.uuid(),
          name: `${faker.company()} Item`,
          quantity: faker.int(1, 5),
          price: faker.price(10, 200),
        })),
        total: faker.price(50, 999),
        currency: "USD",
        status: pick(["pending","paid","shipped","delivered"]),
        createdAt: faker.pastDate(),
      };
    case "post":
      return {
        id: faker.uuid(),
        title: `${pick(["The Future of","Why","Understanding","A Guide to","10 Tips for"])} ${pick(["TypeScript","API Design","Mocking","Testing","DevTools"])}`,
        slug: "post-" + faker.int(100, 999),
        excerpt: "A quick exploration of how mock APIs accelerate frontend development.",
        author: { name: faker.fullName(), avatar: faker.avatar() },
        tags: ["api","frontend","tooling"],
        publishedAt: faker.pastDate(),
        readTime: faker.int(3, 12),
      };
    case "auth":
      return {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + Math.random().toString(36).slice(2),
        refreshToken: faker.uuid(),
        expiresIn: 3600,
        tokenType: "Bearer",
        user: oneUser(),
      };
    case "paginated":
      return {
        data: Array.from({ length: 5 }, oneUser),
        meta: { page: 1, perPage: 5, total: 47, totalPages: 10 },
        links: { next: "/api/users?cursor=abc123", prev: null },
      };
    case "error404":
      return { error: { code: "NOT_FOUND", message: "The requested resource could not be found.", status: 404 } };
    case "error500":
      return { error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred.", status: 500, traceId: faker.uuid() } };
  }
}

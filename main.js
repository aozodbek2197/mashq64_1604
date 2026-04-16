// 1-mashq
class DatabaseConnection {
  static #instance = null;
  
  constructor() {
    if (DatabaseConnection.#instance) {
      throw new Error("Singleton! Use getInstance() method.");
    }
    this.connected = false;
    this.connectionId = Math.random().toString(36).slice(2);
  }
  
  static getInstance() {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
    }
    return DatabaseConnection.#instance;
  }
  
  connect() {
    if (!this.connected) {
      this.connected = true;
      console.log(`Yangi ulanish yaratildi! ID: ${this.connectionId}`);
    } else {
      console.log(`Mavjud ulanish ishlatilmoqda. ID: ${this.connectionId}`);
    }
    return this;
  }
  
  query(sql) {
    console.log(`SQL bajarilmoqda: ${sql}`);
    return `Natija (ID: ${this.connectionId})`;
  }
}

const db1 = DatabaseConnection.getInstance().connect();
const db2 = DatabaseConnection.getInstance().connect();

console.log(db1 === db2);
db1.query("SELECT * FROM users");
// 2-mashq
class DiscountStrategy {
  calculate(price) { return price; }
}

class NoDiscount extends DiscountStrategy {
  calculate(price) { return price; }
}

class PercentageDiscount extends DiscountStrategy {
  constructor(percent) { super(); this.percent = percent; }
  calculate(price) { return price * (1 - this.percent / 100); }
}

class FixedDiscount extends DiscountStrategy {
  constructor(amount) { super(); this.amount = amount; }
  calculate(price) { return Math.max(0, price - this.amount); }
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountStrategy = new NoDiscount();
  }
  
  addItem(name, price) {
    this.items.push({ name, price });
  }
  
  setDiscountStrategy(strategy) {
    this.discountStrategy = strategy;
  }
  
  getTotal() {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    return this.discountStrategy.calculate(subtotal);
  }
  
  showCart() {
    console.log("Savat:", this.items);
    console.log("Jami summa:", this.getTotal());
  }
}

const cart = new ShoppingCart();
cart.addItem("iPhone", 12000000);
cart.addItem("AirPods", 2500000);

cart.setDiscountStrategy(new PercentageDiscount(15));
cart.showCart();

cart.setDiscountStrategy(new FixedDiscount(1000000));
cart.showCart();
// 3-mashq
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(eventName, listener) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(listener);
    return this;
  }
  
  off(eventName, listener) {
    if (this.events.has(eventName)) {
      const listeners = this.events.get(eventName);
      this.events.set(eventName, listeners.filter(l => l !== listener));
    }
    return this;
  }
  
  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(listener => listener(...args));
    }
  }
  
  once(eventName, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}

const emitter = new EventEmitter();

emitter.on('userLoggedIn', (user) => console.log(`${user.name} tizimga kirdi`));
emitter.once('orderPlaced', (order) => console.log(`Buyurtma qabul qilindi: #${order.id}`));

emitter.emit('userLoggedIn', { name: "Ozodbek" });
emitter.emit('orderPlaced', { id: 54321 });
emitter.emit('orderPlaced', { id: 99999 });
// 4-mashq
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (hash.has(obj)) return hash.get(obj);
  
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);
  
  for (let key in obj) {
    clone[key] = deepClone(obj[key], hash);
  }
  return clone;
}

function createProtectedUser(userData) {
  return new Proxy(userData, {
    get(target, prop) {
      if (prop === 'password') throw new Error("Password maydoniga ruxsat yo'q!");
      return target[prop];
    },
    set(target, prop, value) {
      if (prop === 'role' && !['user', 'admin', 'moderator'].includes(value)) {
        throw new Error("Noto'g'ri role!");
      }
      target[prop] = value;
      console.log(`Yangilandi: ${prop} = ${value}`);
      return true;
    }
  });
}

const user = createProtectedUser({
  name: "Ozodbek",
  age: 25,
  password: "secret123",
  role: "user"
});

console.log(user.name);
user.role = "admin";
// 5-mashq
class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }
  
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.runNext();
    });
  }
  
  async runNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;
    
    const { task, resolve, reject } = this.queue.shift();
    this.running++;
    
    try {
      const result = await task();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.runNext();
    }
  }
}

const queue = new TaskQueue(2);

const slowTask = (id) => () => new Promise(r => 
  setTimeout(() => {
    console.log(`Task ${id} bajarildi`);
    r(`Result ${id}`);
  }, 1500)
);

queue.add(slowTask(1));
queue.add(slowTask(2));
queue.add(slowTask(3));
queue.add(slowTask(4));

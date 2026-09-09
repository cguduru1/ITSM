// lib/context/asyncLocalUser.js
import { AsyncLocalStorage } from "async_hooks";

const als = new AsyncLocalStorage();

export function runWithUser(user, fn) {
  return als.run({ user }, fn);
}

export function setUser(user) {
  const store = als.getStore();
  if (store) store.user = user;
}

export function getUser() {
  const store = als.getStore();
  return store ? store.user : null;
}

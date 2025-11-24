const STORAGE_KEY = "muse-device-id";

export function resolveDeviceId() {
  if (typeof window === "undefined") {
    return "web-test";
  }
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

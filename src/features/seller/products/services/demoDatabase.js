let connection;
function openDatabase() {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open("hlm-seller-products-demo-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("catalogs");
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); connection = null; };
      resolve(request.result);
    };
    request.onerror = () => { connection = null; reject(request.error); };
  });
  return connection;
}

// Synchronous work inside one IndexedDB transaction makes version checks and writes atomic.
export async function transactDemo(key, seed, work) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("catalogs", "readwrite");
    const table = transaction.objectStore("catalogs");
    let result;
    let failure;
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () => reject(failure || transaction.error || new Error("Demo storage was interrupted."));
    transaction.onerror = () => { /* onabort reports the transaction failure */ };
    const request = table.get(key);
    request.onsuccess = () => {
      try {
        const catalog = request.result || seed();
        result = work(catalog);
        table.put(catalog, key);
      } catch (error) {
        failure = error;
        transaction.abort();
      }
    };
  });
}

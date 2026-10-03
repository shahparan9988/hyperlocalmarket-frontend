import axios from "axios";

function pause(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const abort = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, milliseconds);
    signal.addEventListener("abort", abort, { once: true });
  });
}

function readFile(file, signal) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => reader.abort();
    const cleanup = () => signal.removeEventListener("abort", abort);
    reader.onload = () => { cleanup(); resolve(reader.result); };
    reader.onerror = () => { cleanup(); reject(reader.error); };
    reader.onabort = () => { cleanup(); reject(new DOMException("Aborted", "AbortError")); };
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    reader.readAsDataURL(file);
  });
}

export async function waitForProductPhoto(api, uploadId, signal, update) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    let result;
    try { result = await api.photoStatus(uploadId, signal); }
    catch (error) { error.canCheckStatus = true; throw error; }
    if (result.status === "Ready") {
      if (!result.assetId || !result.imageUrl) throw new Error("The upload result is missing the image asset.");
      return { assetId: result.assetId, imageUrl: result.imageUrl };
    }
    if (["Rejected", "Failed"].includes(result.status)) throw new Error(result.message || "This image could not be processed. Remove it and choose another image.");
    if (!["Pending", "Processing"].includes(result.status)) throw new Error("Unexpected image-processing status.");
    update({ status: "Processing", uploadId });
    await pause(2000, signal);
  }
  const error = new Error("Processing is taking longer than expected. Check status again in a moment.");
  error.canCheckStatus = true;
  throw error;
}

export async function uploadProductPhoto(api, file, signal, update) {
  if (api.isDemo) return api.storePhoto(await readFile(file, signal), signal);
  const request = await api.requestPhoto(file, signal);
  if (!request.uploadId || !request.uploadUrl) throw new Error("The API did not return an upload URL.");
  update({ status: "Uploading", uploadId: request.uploadId, progress: 0 });
  await axios.put(request.uploadUrl, file, {
    signal, withCredentials: false,
    headers: { "Content-Type": file.type, ...(request.headers || {}) },
    onUploadProgress: (event) => update({ progress: event.total ? Math.round(event.loaded * 100 / event.total) : 0 }),
  });
  update({ status: "Processing", uploadId: request.uploadId });
  return waitForProductPhoto(api, request.uploadId, signal, update);
}

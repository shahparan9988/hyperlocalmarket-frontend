import { create } from "zustand";
import storeSetupApi from "../services/storeSetupApi";

let storeLoadVersion = 0;
let setupReadVersion = 0;

const sameStore = (first, second) =>
  Boolean(first && second) && String(first).toLowerCase() === String(second).toLowerCase();

function storeFromSetupStatus(setupStatus) {
  const sectionData = Object.assign(
    {},
    ...(setupStatus.sections ?? []).map((section) => section.data ?? {})
  );

  return {
    ...sectionData,
    id: setupStatus.storeId,
    status: setupStatus.status,
  };
}

function getErrorMessage(error) {
  const body = error?.response?.data;
  const messages = Object.values(body?.errors ?? {})
    .flat()
    .filter((value) => typeof value === "string");

  if (messages.length) return messages.join(" ");

  return body?.error || body?.message || body?.title || error?.message ||
    "Something went wrong. Please try again.";
}

function mergeServerResult(state, result) {
  const containsStorePatch = result && [
    "id",
    "name",
    "logoUrl",
    "coverImageUrl",
    "status",
    "isAcceptingOrders",
  ].some((key) => Object.prototype.hasOwnProperty.call(result, key));
  const returnedStore = result?.store ?? (containsStorePatch ? result : null);
  const returnedStatus = result?.setupStatus ?? returnedStore?.setupStatus;

  return {
    store: returnedStore
      ? { ...state.store, ...returnedStore }
      : state.store,
    setupStatus: returnedStatus ?? state.setupStatus,
    error: null,
  };
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const useStoreSetupStore = create((set, get) => ({
  store: null,
  setupStatus: null,
  isLoading: false,
  savingSection: null,
  activeBrandingKind: null,
  error: null,
  brandingUploadProgress: {
    logo: 0,
    cover: 0,
  },

  clearError: () => set({ error: null }),

  reset: () => {
    storeLoadVersion += 1;
    setupReadVersion += 1;
    set({
      store: null,
      setupStatus: null,
      isLoading: false,
      savingSection: null,
      activeBrandingKind: null,
      error: null,
      brandingUploadProgress: { logo: 0, cover: 0 },
    });
  },

  createDraft: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await storeSetupApi.createStore(payload);
      set((state) => ({
        ...mergeServerResult(state, result),
        isLoading: false,
      }));
      return result;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },

  loadStore: async (storeId) => {
    const loadVersion = ++storeLoadVersion;
    const readVersion = ++setupReadVersion;

    set((state) => ({
      store: sameStore(state.store?.id, storeId) ? state.store : null,
      setupStatus: sameStore(state.setupStatus?.storeId, storeId)
        ? state.setupStatus : null,
      isLoading: true,
      savingSection: null,
      error: null,
    }));

    try {
      const setupStatus = await storeSetupApi.getSetupStatus(storeId);
      if (loadVersion !== storeLoadVersion || readVersion !== setupReadVersion) return null;
      if (!sameStore(setupStatus?.storeId, storeId)) {
        throw new Error("The server returned setup details for a different store.");
      }

      set({ store: storeFromSetupStatus(setupStatus), setupStatus, isLoading: false });
      return setupStatus;
    } catch (error) {
      if (loadVersion === storeLoadVersion && readVersion === setupReadVersion) {
        set({ isLoading: false, error: getErrorMessage(error) });
      }
      return null;
    }
  },

  refreshSetupStatus: async (storeId, { reportError = true } = {}) => {
    if (get().isLoading || !sameStore(get().store?.id, storeId)) return null;
    const loadVersion = storeLoadVersion;
    const readVersion = ++setupReadVersion;

    try {
      const setupStatus = await storeSetupApi.getSetupStatus(storeId);
      if (!sameStore(setupStatus?.storeId, storeId)) {
        throw new Error("The server returned setup details for a different store.");
      }
      if (loadVersion !== storeLoadVersion || readVersion !== setupReadVersion ||
          !sameStore(get().store?.id, storeId)) return null;

      set((state) => ({
        store: { ...state.store, ...storeFromSetupStatus(setupStatus) },
        setupStatus,
      }));
      return setupStatus;
    } catch (error) {
      if (reportError && loadVersion === storeLoadVersion &&
          readVersion === setupReadVersion && sameStore(get().store?.id, storeId)) {
        set({ error: getErrorMessage(error) });
      }
      throw error;
    }
  },

  saveSection: async (sectionKey, request) => {
    set({ savingSection: sectionKey, error: null });
    try {
      const result = await request();
      set((state) => ({
        ...mergeServerResult(state, result),
        savingSection: null,
      }));

      if (!result?.setupStatus && !result?.store?.setupStatus) {
        await get().refreshSetupStatus(get().store.id);
      }

      return result;
    } catch (error) {
      set({ savingSection: null, error: getErrorMessage(error) });
      throw error;
    }
  },

  saveBusinessInfo: async (storeId, payload) => {
    const result = await get().saveSection("business-info", () =>
      storeSetupApi.updateBusinessInfo(storeId, payload)
    );
    set((state) => ({ store: { ...state.store, ...payload } }));
    return result;
  },

  saveLocation: async(storeId, payload) =>
    await get().saveSection("location", () =>
    storeSetupApi.updateLocation(storeId, payload)
  ),

  saveContact: async (storeId, payload) =>
    await get().saveSection("contact", () =>
    storeSetupApi.updateContact(storeId, payload)
  ),

  saveBusinessHours: async (storeId, payload) => {
    const result = await get().saveSection("business-hours", () =>
      storeSetupApi.updateBusinessHours(storeId, payload)
    );
    set((state) => ({ store: { ...state.store, businessHours: result.businessHours ?? payload.hours, } }));
    return result;
  },

  savePickupDelivery: async (storeId, payload) => {
    if (get().savingSection) {
      throw new Error("Another section is still saving. Please try again.");
    }
    set({ savingSection: "pickup-delivery", error: null });
    try {
      const result = await storeSetupApi.updatePickupDelivery(storeId, payload);
      set((state) => state.store?.id === storeId
        ? { store: { ...state.store, ...result }, error: null }
        : {});

      // The save already succeeded. A failed progress refresh must not report a failed save.
      let setupStatusRefreshed = true;
      try {
        const setupStatus = await storeSetupApi.getSetupStatus(storeId);
        set((state) => state.store?.id === storeId ? { setupStatus } : {});
      } catch {
        setupStatusRefreshed = false;
      }
      return { ...result, setupStatusRefreshed };
    } catch (error) {
      set((state) => state.store?.id === storeId
        ? { error: getErrorMessage(error) }
        : {});
      throw error;
    } finally {
      set((state) => state.store?.id === storeId &&
        state.savingSection === "pickup-delivery" ? { savingSection: null } : {});
    }
  },

  uploadBrandingImage: async (storeId, kind, file) => {
    set((state) => ({
      savingSection: "branding",
      activeBrandingKind: kind,
      error: null,
      brandingUploadProgress: {
        ...state.brandingUploadProgress,
        [kind]: 0,
      },
    }));

    try {
      const upload =
        await storeSetupApi.requestBrandingUpload(
          storeId,
          kind,
          file
        );

      await storeSetupApi.uploadToSignedUrl(
        upload.uploadUrl,
        file,
        (percentage) => {
          set((state) => ({
            brandingUploadProgress: {
              ...state.brandingUploadProgress,
              [kind]: percentage,
            },
          }));
        }
      );

      let finalStatus = null;

      for (let attempt = 0; attempt < 90; attempt += 1) {
        const status =
          await storeSetupApi.getBrandingUploadStatus(
            storeId,
            upload.uploadId
          );

        if (
          status.status === "Ready" ||
          status.status === "Rejected" ||
          status.status === "Failed"
        ) {
          finalStatus = status;
          break;
        }

        await wait(1000);
      }

      if (!finalStatus) {
        throw new Error(
          "The upload succeeded, but image processing is taking longer than expected."
        );
      }

      if (finalStatus.status !== "Ready") {
        throw new Error(
          finalStatus.failureReason ||
            "The image could not be processed."
        );
      }

      const propertyName =
        kind === "logo" ? "logoUrl" : "coverImageUrl";

      set((state) => ({
        store: {
          ...state.store,
          [propertyName]: finalStatus.imageUrl,
        },
        savingSection: null,
        activeBrandingKind: null,
        brandingUploadProgress: {
          ...state.brandingUploadProgress,
          [kind]: 100,
        },
      }));

      await get().refreshSetupStatus(storeId);

      return finalStatus;
    } catch (error) {
      set((state) => ({
        savingSection: null,
        activeBrandingKind: null,
        error: getErrorMessage(error),
        brandingUploadProgress: {
          ...state.brandingUploadProgress,
          [kind]: 0,
        },
      }));

      throw error;
    }
  },

  uploadLogo: (storeId, file) =>
    get().uploadBrandingImage(
      storeId,
      "logo",
      file
    ),

  uploadCover: (storeId, file) =>
    get().uploadBrandingImage(
      storeId,
      "cover",
      file
    ),

  
  removeLogo: async (storeId) => {
    set({ activeBrandingKind: "logo" });

    try {
      const result = await get().saveSection(
        "branding",
        () => storeSetupApi.removeLogo(storeId)
      );

      set((state) => ({
        store: {
          ...state.store,
          logoUrl: result.logoUrl,
          coverImageUrl: result.coverImageUrl,
        },
        activeBrandingKind: null,
      }));

      return result;
    } catch (error) {
      set({ activeBrandingKind: null });
      throw error;
    }
  },

  removeCover: async (storeId) => {
    set({ activeBrandingKind: "cover" });

    try {
      const result = await get().saveSection(
        "branding",
      () => storeSetupApi.removeCover(storeId)
    );

      set((state) => ({
        store: {
          ...state.store,
          logoUrl: result.logoUrl,
          coverImageUrl: result.coverImageUrl,
        },
      }));
      return result;
    } finally {
      set({ activeBrandingKind: null });
    }
  },
  

  savePublicationChange: async (storeId, sectionKey, request) => {
    if (get().savingSection || get().isLoading) {
      throw new Error("Please wait for the current operation to finish.");
    }
    if (!sameStore(get().store?.id, storeId)) {
      throw new Error("Load this store before changing its publication settings.");
    }

    const loadVersion = storeLoadVersion;
    setupReadVersion += 1;
    const isCurrentStore = () => loadVersion === storeLoadVersion &&
      sameStore(get().store?.id, storeId);

    set({ savingSection: sectionKey, error: null });

    try {
      const result = await request();
      if (!sameStore(result?.id, storeId) || result.status !== "Active" ||
          typeof result.isAcceptingOrders !== "boolean" ||
          typeof result.canAcceptOrders !== "boolean") {
        throw new Error("The server response was incomplete. Reload to check the saved status.");
      }

      if (isCurrentStore()) {
        set((state) => ({
          store: { ...state.store, ...result },
          setupStatus: state.setupStatus ? {
            ...state.setupStatus,
            status: result.status,
            canPublish: false,
            canAcceptOrders: result.canAcceptOrders,
            sections: state.setupStatus.sections.map((section) =>
              section.key === "pickup-delivery"
                ? { ...section, data: { ...section.data,
                    isAcceptingOrders: result.isAcceptingOrders } }
                : section),
          } : null,
          error: null,
        }));
      }

      // The mutation is already committed. A failed checklist refresh is not a failed save.
      let setupStatusRefreshed = false;
      if (isCurrentStore()) {
        try {
          setupStatusRefreshed = Boolean(await get().refreshSetupStatus(
            storeId, { reportError: false }
          ));
        } catch {
          // Keep the authoritative publication result and let the page offer a refresh.
        }
      }

      return { ...result, setupStatusRefreshed };
    } catch (error) {
      if (isCurrentStore()) {
        // Reconcile validation/concurrency failures with the latest saved checklist.
        try {
          await get().refreshSetupStatus(storeId, { reportError: false });
        } catch {
          // The original mutation error is more useful than a secondary read error.
        }
        if (isCurrentStore()) set({ error: getErrorMessage(error) });
      }
      throw error;
    } finally {
      if (isCurrentStore() && get().savingSection === sectionKey) {
        set({ savingSection: null });
      }
    }
  },

  publishStore: (storeId) => get().savePublicationChange(
    storeId, "publish", () => storeSetupApi.publish(storeId)
  ),

  setAcceptingOrders: (storeId, value) => get().savePublicationChange(
    storeId, "accepting-orders", () => storeSetupApi.setAcceptingOrders(storeId, value)
  ),
}));

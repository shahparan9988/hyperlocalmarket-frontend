import {
  Image,
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import SetupPageHeader from "../components/SetupPageHeader";
import { useStoreSetupStore } from "../state/useStoreSetupStore";

const MAXIMUM_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function BrandingImageCard({
  title,
  description,
  ratio,
  existingUrl,
  file,
  onFile,
  onUpload,
  onRemove,
  isProcessing,
  isDisabled,
  progress,
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const imageUrl = previewUrl || existingUrl;

  const handleFileSelection = (event) => {
    const selectedFile =
      event.target.files?.[0] ?? null;

    event.target.value = "";

    onFile(selectedFile);
  };

  return (
    <section className="hlm-branding-card">
      <div className="hlm-form-section-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <span className="hlm-form-badge is-optional">
          Optional
        </span>
      </div>

      <div className={`hlm-branding-preview is-${ratio}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={`${title} preview`} />
        ) : (
          <span>
            <ImagePlus size={28} />
            No image selected
          </span>
        )}
      </div>

      {isProcessing && progress > 0 && (
        <div className="hlm-upload-progress">
          <div className="hlm-upload-progress-heading">
            <span>
              {progress < 100
                ? "Uploading to storage"
                : "Processing image"}
            </span>
            <strong>
              {progress < 100 ? `${progress}%` : "Please wait…"}
            </strong>
          </div>

          <div className="hlm-upload-progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="hlm-branding-actions">
        <label
          className={`hlm-btn hlm-btn-secondary ${
            isProcessing ? "is-disabled" : ""
          }`}
        >
          <Upload size={16} />
          Choose image

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={isDisabled}
            onChange={handleFileSelection}
          />
        </label>

        <button
          className="hlm-btn hlm-btn-primary"
          type="button"
          disabled={!file || isDisabled}
          onClick={onUpload}
        >
          {isProcessing && (
            <LoaderCircle className="hlm-spin" size={16} />
          )}

          {isProcessing ? "Processing…" : "Upload"}
        </button>

        {existingUrl && (
          <button
            className="hlm-btn hlm-btn-danger-ghost"
            type="button"
            disabled={isDisabled}
            onClick={onRemove}
          >
            <Trash2 size={16} />
            Remove
          </button>
        )}
      </div>

      <p className="hlm-field-help">
        PNG, JPEG or WebP. Maximum size 10 MB.
      </p>
    </section>
  );
}

export default function BrandingPage() {
  const { storeId } = useParams();

  const store = useStoreSetupStore(
    (state) => state.store
  );

  const apiError = useStoreSetupStore(
    (state) => state.error
  );

  const savingSection = useStoreSetupStore(
    (state) => state.savingSection
  );

  const activeBrandingKind = useStoreSetupStore(
    (state) => state.activeBrandingKind
  );

  const progress = useStoreSetupStore(
    (state) => state.brandingUploadProgress
  );

  const uploadLogo = useStoreSetupStore(
    (state) => state.uploadLogo
  );

  const removeLogo = useStoreSetupStore(
    (state) => state.removeLogo
  );

  const uploadCover = useStoreSetupStore(
    (state) => state.uploadCover
  );

  const removeCover = useStoreSetupStore(
    (state) => state.removeCover
  );

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const [notice, setNotice] = useState("");

  const selectFile = (file, setter) => {
    setLocalError("");
    setNotice("");

    if (!file) {
      setter(null);
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      setter(null);
      setLocalError(
        "Only PNG, JPEG and WebP images are supported."
      );
      return;
    }

    if (file.size > MAXIMUM_FILE_SIZE) {
      setter(null);
      setLocalError(
        "The selected image cannot exceed 10 MB."
      );
      return;
    }

    setter(file);
  };

  const run = async (
    request,
    successMessage,
    clearFile
  ) => {
    setLocalError("");
    setNotice("");

    try {
      await request();
      clearFile?.();
      setNotice(successMessage);
    } catch {
      // The Zustand/API error is rendered below.
    }
  };

  const isBrandingBusy =
  savingSection === "branding";

  const isLogoProcessing =
    isBrandingBusy &&
    activeBrandingKind === "logo";

  const isCoverProcessing =
    isBrandingBusy &&
    activeBrandingKind === "cover";

  return (
    <article className="hlm-setup-card">
      <SetupPageHeader
        icon={Image}
        title="Store branding"
        description="Help customers recognize your store with a clear logo and cover photo."
        badge="Optional"
      />

      <div className="hlm-branding-grid">
        <BrandingImageCard
          title="Store logo"
          description="Shown in search results, map cards and order screens."
          ratio="logo"
          existingUrl={store?.logoUrl}
          file={logoFile}
          progress={progress.logo}
          onFile={(file) =>
            selectFile(file, setLogoFile)
          }
          isProcessing={isLogoProcessing}
          isDisabled={isBrandingBusy}
          onUpload={() =>
            run(
              () => uploadLogo(storeId, logoFile),
              "Store logo uploaded and processed.",
              () => setLogoFile(null)
            )
          }
          onRemove={() =>
            run(
              () => removeLogo(storeId),
              "Store logo removed."
            )
          }
        />

        <BrandingImageCard
          title="Cover photo"
          description="A wide image displayed at the top of your public store."
          ratio="cover"
          existingUrl={store?.coverImageUrl}
          file={coverFile}
          progress={progress.cover}
          onFile={(file) =>
            selectFile(file, setCoverFile)
          }
          isProcessing={isCoverProcessing}
          isDisabled={isBrandingBusy}
          onUpload={() =>
            run(
              () => uploadCover(storeId, coverFile),
              "Cover photo uploaded and processed.",
              () => setCoverFile(null)
            )
          }
          onRemove={() =>
            run(
              () => removeCover(storeId),
              "Cover photo removed."
            )
          }
        />
      </div>

      {(localError || apiError) && (
        <InlineNotice>
          {localError || apiError}
        </InlineNotice>
      )}

      {notice && (
        <InlineNotice type="success">
          {notice}
        </InlineNotice>
      )}
    </article>
  );
}
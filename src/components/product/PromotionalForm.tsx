"use client";

import React, { useState, useRef, useTransition } from "react";
import { Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

// --- Product Configuration Types & Data ---
export type ProductType = "business-cards" | "stickers" | "banners" | "tents" | "magnets" | "flags";

interface ProductOptionConfig {
  sizes?: string[];
  materials?: string[];
  options?: string[];
  allowCustomSize?: boolean;
  allowCustomShape?: boolean;
}

const PRODUCT_CONFIGURATIONS: Record<ProductType, ProductOptionConfig> = {
  "business-cards": {
    sizes: ["3.5\" × 2\" Standard", "2\" × 2\" Square", "3.5\" × 2\" Rounded Corner"],
    materials: ["16pt matte", "16pt soft-touch", "32pt triple-layer", "Foil accent"],
  },
  stickers: {
    sizes: ["Standard Die-Cut", "Sheet Stickers"],
    materials: ["No Laminate", "Gloss Laminate"],
    allowCustomShape: true,
  },
  banners: {
    sizes: ["2' × 4'", "3' × 6'", "4' × 8'", "Custom size"],
    materials: ["13oz vinyl", "18oz heavy-duty vinyl", "Mesh (wind-through)"],
    allowCustomSize: true,
  },
  tents: {
    sizes: ["10' × 10'", "10' × 15'", "10' × 20'"],
    options: ["600D polyester canopy", "Steel hex frame", "Aluminum frame (upgrade)"],
  },
  magnets: {
    sizes: ["12\" × 18\"", "12\" × 24\"", "3\" × 3\" promo"],
    materials: ["30mil car-grade magnet", "20mil promo magnet"],
  },
  flags: {
    sizes: ["8ft feather flag", "11ft feather flag", "Teardrop banner"],
    options: ["Knitted polyester", "Cross-base or ground stake"],
  },
};

interface PromotionalFormProps {
  productType: ProductType;
  productName: string;
  productId?: string | number;
}

export default function PromotionalForm({ productType, productName, productId }: PromotionalFormProps) {
  const config = PRODUCT_CONFIGURATIONS[productType] || PRODUCT_CONFIGURATIONS["business-cards"];

  // Form State
  const [fullName, setFullName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState<number | "">(100);

  const [selectedSize, setSelectedSize] = useState(config.sizes?.[0] || "");
  const [selectedMaterial, setSelectedMaterial] = useState(config.materials?.[0] || config.options?.[0] || "");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [customShape, setCustomShape] = useState("");
  const [notes, setNotes] = useState("");

  // Artwork Files State (Max 3 files, 10MB total)
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission States
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const MAX_FILES = 3;
  const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = ["ai", "eps", "svg", "pdf", "png", "jpg", "jpeg"];

  // Handle File Addition
  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    setFileError("");
    const newFilesArray = Array.from(incomingFiles);

    // Validate extensions & count
    let currentTotalFiles = files.length + newFilesArray.length;
    if (currentTotalFiles > MAX_FILES) {
      setFileError(`You can upload a maximum of ${MAX_FILES} files.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of newFilesArray) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(`Unsupported file format: .${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
        return;
      }
      validFiles.push(file);
    }

    const updatedFiles = [...files, ...validFiles];

    // Validate total size
    const totalSize = updatedFiles.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setFileError("Combined file size exceeds 10 MB limit.");
      return;
    }

    setFiles(updatedFiles);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileError("");
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess(false);

    if (!fullName || !email || !quantity) {
      setFormError("Please fill out all required customer information fields.");
      return;
    }

    if (files.length === 0) {
      setFileError("At least one artwork file is required.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("business", business);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("quantity", String(quantity));
        formData.append("productType", productType);
        formData.append("productName", productName);
        if (productId) formData.append("productId", String(productId));
        formData.append("productSize", selectedSize);
        formData.append(config.materials ? "material" : "option", selectedMaterial);
        formData.append("notes", notes);

        if (config.allowCustomSize && selectedSize === "Custom size") {
          formData.append("customWidth", customWidth);
          formData.append("customHeight", customHeight);
        }

        if (config.allowCustomShape && selectedSize === "Standard Die-Cut") {
          formData.append("customShape", customShape);
        }

        files.forEach((file) => {
          formData.append("file", file); // Matched to PHP backend $_FILES['file'] expectation or 'artwork'
        });

        // Use endpoint configured in your WordPress backend code (/wp-json/mystore/v1/add or /api/quote-request)
       const res = await fetch("/api/cart/add", {
        method: "POST",
        body: formData, 
      });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.message || "Failed to add to cart.");
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        window.dispatchEvent(new Event("cart-updated"));

        // Reset form
        setFullName("");
        setBusiness("");
        setEmail("");
        setPhone("");
        setQuantity(100);
        setFiles([]);
        setNotes("");
        setCustomWidth("");
        setCustomHeight("");
        setCustomShape("");
      } catch (err: any) {
        setFormError(err.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 bg-accent-50 px-2.5 py-1 rounded-full">
          Custom Order
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2">{productName}</h2>
        <p className="text-sm text-slate-500 mt-1">Configure your product specs and upload artwork.</p>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-900">Your Information</h3>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
              placeholder="Jane Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
                placeholder="Company Inc."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
                placeholder="jane@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
              placeholder="(555) 000-0000"
            />
          </div>
        </div>

        <hr className="border-slate-100 my-4" />

        {/* Product Customization Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-900">Specifications</h3>

          {config.sizes && config.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Size / Shape *</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
              >
                {config.sizes.map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Custom Size Fields */}
          {config.allowCustomSize && selectedSize === "Custom size" && (
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Width (ft) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Height (ft) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
          )}

          {/* Conditional Custom Shape Description */}
          {config.allowCustomShape && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Custom Shape Description</label>
              <input
                type="text"
                value={customShape}
                onChange={(e) => setCustomShape(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
                placeholder="Describe desired custom shape or dimensions"
              />
            </div>
          )}

          {/* Materials or Options */}
          {config.materials && config.materials.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Material *</label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
              >
                {config.materials.map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>
          )}

          {config.options && config.options.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Accessory / Option *</label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
              >
                {config.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
            />
          </div>
        </div>

        <hr className="border-slate-100 my-4" />

        {/* Artwork Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700">Artwork Upload * (Up to 3 files, max 10MB total)</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-accent-600 cursor-pointer transition bg-slate-50"
          >
            <div className="flex flex-col items-center pointer-events-none">
              <Upload className="text-slate-400 mb-2" size={22} />
              <p className="text-xs text-slate-600 font-medium">Drag & drop files here, or <span className="text-accent-600 underline">browse</span></p>
              <p className="text-[10px] text-slate-400 mt-1">AI, EPS, SVG, PDF, PNG, JPG (Max 3 files)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".ai,.eps,.svg,.pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFilesAdded(e.target.files);
              }}
            />
          </div>

          {fileError && <p className="text-xs text-rose-600">{fileError}</p>}

          {files.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-xs">
                  <span className="truncate max-w-[200px] text-slate-700 font-medium">{file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-rose-500 hover:text-rose-700 font-bold px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Notes or Special Instructions</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-accent-600 focus:outline-none focus:ring-1 focus:ring-accent-600 resize-none"
            placeholder="Add any additional details or special instructions..."
          />
        </div>

        {/* Add to Cart Button with Interactive States */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent-600 text-white font-semibold py-3 px-4 hover:bg-accent-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adding to Cart...
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={18} />
                Added to Cart
              </>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
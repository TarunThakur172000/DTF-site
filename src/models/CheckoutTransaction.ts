import mongoose, { Model, Schema } from "mongoose";
import type { ICartItem } from "@/models/Cart";

export type CheckoutStatus =
  | "creating"
  | "pending"
  | "processing"
  | "placed"
  | "paid"
  | "failed"
  | "cancelled";

export interface ICheckoutTransaction extends mongoose.Document {
  ownerType: "user" | "guest";
  ownerId: string;
  requestId: string;
  requestFingerprint: string;
  status: CheckoutStatus;
  wooCommerceOrderId?: number;
  gatewayId: string;
  gatewayTitle: string;
  paymentTransactionId: string;
  amount: string;
  currency: string;
  wooOrderModifiedAt?: Date;
  itemKeys: string[];
  items: ICartItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArtworkSchema = new Schema(
  {
    fileName: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { _id: false }
);

const ItemSnapshotSchema = new Schema(
  {
    key: { type: String, required: true },
    productId: { type: Number, default: null },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    width: { type: String, default: "" },
    height: { type: String, default: "" },
    jobName: { type: String, default: "" },
    additionalService: { type: String, default: "" },
    orderNotes: { type: String, default: "" },
    productSize: { type: String, default: "" },
    customShape: { type: String, default: "" },
    productType: { type: String, default: "" },
    fullName: { type: String, default: "" },
    business: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    quoteRequired: { type: Boolean, default: true },
    artworks: { type: [ArtworkSchema], default: [] },
  },
  { _id: false }
);

const CheckoutTransactionSchema = new Schema<ICheckoutTransaction>(
  {
    ownerType: {
      type: String,
      enum: ["user", "guest"],
      required: true,
    },
    ownerId: { type: String, required: true },
    requestId: { type: String, required: true },
    requestFingerprint: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "creating",
        "pending",
        "processing",
        "placed",
        "paid",
        "failed",
        "cancelled",
      ],
      required: true,
    },
    wooCommerceOrderId: { type: Number },
    gatewayId: { type: String, required: true },
    gatewayTitle: { type: String, required: true },
    paymentTransactionId: { type: String, default: "" },
    amount: { type: String, default: "" },
    currency: { type: String, default: "" },
    wooOrderModifiedAt: { type: Date },
    itemKeys: { type: [String], required: true },
    items: { type: [ItemSnapshotSchema], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

CheckoutTransactionSchema.index(
  { requestId: 1 },
  { unique: true }
);
CheckoutTransactionSchema.index({ ownerType: 1, ownerId: 1, requestId: 1 });
CheckoutTransactionSchema.index(
  { ownerType: 1, ownerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["creating", "pending", "processing"] },
    },
  }
);
CheckoutTransactionSchema.index(
  { wooCommerceOrderId: 1 },
  { unique: true, sparse: true }
);
CheckoutTransactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CheckoutTransaction: Model<ICheckoutTransaction> =
  mongoose.models.CheckoutTransaction ||
  mongoose.model<ICheckoutTransaction>(
    "CheckoutTransaction",
    CheckoutTransactionSchema
  );

export default CheckoutTransaction;

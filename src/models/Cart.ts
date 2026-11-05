import mongoose, { Model, Schema } from "mongoose";

export interface ICartArtwork {
  fileName: string;
  contentType: string;
  data: Buffer;
}

export interface ICartItem {
  key: string;
  productId: number | null;
  name: string;
  quantity: number;
  width: string;
  height: string;
  jobName: string;
  additionalService: string;
  orderNotes: string;
  productSize: string;
  customShape: string;
  productType: string;
  fullName: string;
  business: string;
  phone: string;
  email: string;
  quoteRequired: boolean;
  artworks: ICartArtwork[];
}

export interface ICart extends mongoose.Document {
  ownerType: "user" | "guest";
  ownerId: string;
  items: ICartItem[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArtworkSchema = new Schema<ICartArtwork>(
  {
    fileName: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { _id: false }
);

const CartItemSchema = new Schema<ICartItem>(
  {
    key: { type: String, required: true },
    productId: { type: Number, default: null },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 10000 },
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

const CartSchema = new Schema<ICart>(
  {
    ownerType: {
      type: String,
      enum: ["user", "guest"],
      required: true,
    },
    ownerId: { type: String, required: true },
    items: { type: [CartItemSchema], default: [] },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

CartSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;

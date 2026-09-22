import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: number;
  variationId: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: string;
  total: string;
  sku?: string;
  image?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;

  wooCommerceOrderId: number;
  wooCommerceCustomerId: number;

  status: string;

  currency: string;

  subtotal: string;
  totalTax: string;
  total: string;

  paymentMethod: string;
  paymentMethodTitle: string;

  dateCreated: Date;
  dateModified: Date;

  billing: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone?: string;
  };

  shipping: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };

  lineItems: IOrderItem[];

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Number, required: true },
    variationId: { type: Number, default: 0 },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: String, required: true },
    total: { type: String, required: true },
    sku: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    wooCommerceOrderId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    wooCommerceCustomerId: {
      type: Number,
      required: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
      index: true,
    },

    currency: {
      type: String,
      required: true,
    },

    subtotal: {
      type: String,
      required: true,
    },

    totalTax: {
      type: String,
      required: true,
    },

    total: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    paymentMethodTitle: {
      type: String,
      default: "",
    },

    dateCreated: {
      type: Date,
      required: true,
    },

    dateModified: {
      type: Date,
      required: true,
    },

    billing: {
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      company: { type: String, default: "" },
      address1: { type: String, default: "" },
      address2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postcode: { type: String, default: "" },
      country: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    shipping: {
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      company: { type: String, default: "" },
      address1: { type: String, default: "" },
      address2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postcode: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    lineItems: {
      type: [OrderItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({
  userId: 1,
  status: 1,
});

OrderSchema.index({
  userId: 1,
  dateCreated: -1,
});

const Order: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
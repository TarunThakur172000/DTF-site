import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  businessName?: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  phone?: string;  // <-- CHANGED THIS: Must be a string!
  woocommerceCustomerId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String, // <-- Now this matches the interface perfectly
      trim: true,  
      default: "", 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    woocommerceCustomerId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
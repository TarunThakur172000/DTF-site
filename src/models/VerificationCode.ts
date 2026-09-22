import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationCode extends Document {
  userId: mongoose.Types.ObjectId;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired verification codes
VerificationCodeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const VerificationCode: Model<IVerificationCode> =
  mongoose.models.VerificationCode ||
  mongoose.model<IVerificationCode>(
    "VerificationCode",
    VerificationCodeSchema
  );

export default VerificationCode;
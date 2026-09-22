import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPasswordResetCode extends Document {
  userId: mongoose.Types.ObjectId;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetCodeSchema =
  new Schema<IPasswordResetCode>(
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

// Automatically remove expired reset codes
PasswordResetCodeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const PasswordResetCode: Model<IPasswordResetCode> =
  mongoose.models.PasswordResetCode ||
  mongoose.model<IPasswordResetCode>(
    "PasswordResetCode",
    PasswordResetCodeSchema
  );

export default PasswordResetCode;
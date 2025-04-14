import mongoose, { Document, Schema } from "mongoose";

export interface IURL extends Document {
  Hash: string;
  OriginalUrl: string;
  Visits: number;
  CreatedAt?: Date;
  ExpiresAt?: Date;
}

const URLSchema: Schema<IURL> = new Schema({
  Hash: {
    type: String,
    required: true,
    unique: true,
  },
  OriginalUrl: {
    type: String,
    required: true,
  },
  Visits: {
    type: Number,
    default: 0,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  ExpiresAt: {
    type: Date,
  },
});

const URL = mongoose.model<IURL>("URL", URLSchema);
export default URL;

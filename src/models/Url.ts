// src/models/Url.ts

import { Schema, model, Document } from "mongoose";

// interface TypeScript que descreve o shape do documento no banco
// Document do mongoose adiciona _id, save(), etc.
export interface IUrl extends Document {
  originalUrl: string; // URL original completa
  code: string; // código curto único (ex: "aB3xYz")
  clicks: number; // contador de acessos via redirect
  createdAt: Date;
  updatedAt: Date;
}

const urlSchema = new Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true, // garante unicidade no índice do MongoDB
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // cria createdAt e updatedAt automaticamente
  },
);

export const Url = model<IUrl>("Url", urlSchema);

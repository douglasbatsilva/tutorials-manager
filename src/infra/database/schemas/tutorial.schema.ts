import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Tutorials {
  @Prop() _id: string;
  @Prop({ unique: true }) title: string;
  @Prop() createdBy: string;
  @Prop() data: string;
  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
  @Prop() deleted?: boolean;
  @Prop() deletedAt?: Date;
}

export const TutorialsSchema = SchemaFactory.createForClass(Tutorials);
